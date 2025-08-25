require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRailwayIdsDirect() {
  try {
    console.log('🔍 Corrigiendo IDs de documentos directamente...\n');
    
    // Buscar todos los documentos que necesiten corrección
    const documentsToFix = await prisma.document.findMany({
      where: {
        fileUrl: {
          contains: 'cloudinary.com'
        }
      },
      select: {
        id: true,
        filename: true,
        fileUrl: true,
        metadata: true
      }
    });
    
    console.log(`📁 Encontrados ${documentsToFix.length} documentos para corregir\n`);
    
    if (documentsToFix.length === 0) {
      console.log('✅ No hay documentos que corregir');
      return;
    }
    
    // Corregir cada documento
    for (const document of documentsToFix) {
      try {
        console.log(`🔄 Corrigiendo documento: ${document.filename}`);
        console.log(`   ID: ${document.id}`);
        console.log(`   URL: ${document.fileUrl}`);
        
        // Extraer el publicId correcto de la URL
        let correctPublicId = null;
        let correctFilename = null;
        
        if (document.fileUrl && document.fileUrl.includes('cloudinary.com')) {
          try {
            const url = new URL(document.fileUrl);
            const pathParts = url.pathname.split('/');
            
            // Buscar la parte después de 'upload' que contiene la ruta del archivo
            const uploadIndex = pathParts.findIndex(part => part === 'upload');
            if (uploadIndex !== -1 && uploadIndex + 2 < pathParts.length) {
              // Tomar todo después de 'upload/v1234567890/'
              const filePath = pathParts.slice(uploadIndex + 2).join('/');
              
              // Quitar la extensión del final si existe
              const filePathWithoutExt = filePath.replace(/\.[^/.]+$/, '');
              
              correctPublicId = filePathWithoutExt;
              correctFilename = filePath; // Con extensión para el filename
              
              console.log(`   🔑 PublicId extraído: ${correctPublicId}`);
              console.log(`   📁 Filename correcto: ${correctFilename}`);
            }
          } catch (urlError) {
            console.warn(`   ⚠️ Error parseando URL: ${urlError.message}`);
          }
        }
        
        if (correctPublicId && correctFilename) {
          // Actualizar el documento
          await prisma.document.update({
            where: { id: document.id },
            data: {
              filename: correctFilename,
              metadata: {
                ...document.metadata,
                cloudinaryPublicId: correctPublicId,
                storageType: 'cloudinary',
                cloudinaryUrl: document.fileUrl,
                correctedAt: new Date().toISOString(),
                originalFilename: document.filename,
                originalId: document.id
              }
            }
          });
          
          console.log(`   ✅ Corregido exitosamente`);
        } else {
          console.log(`   ❌ No se pudo extraer información correcta`);
        }
        
        console.log('---');
        
      } catch (error) {
        console.error(`   ❌ Error corrigiendo documento ${document.filename}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Corrección completada');
    
  } catch (error) {
    console.error('❌ Error en corrección:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixRailwayIdsDirect();

