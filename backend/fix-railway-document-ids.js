require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixRailwayDocumentIds() {
  try {
    console.log('🔍 Corrigiendo IDs de documentos en Railway...\n');
    
    // Buscar documentos con ID corto que necesiten corrección
    const documentsToFix = await prisma.document.findMany({
      where: {
        filename: {
          not: {
            contains: 'expedientes'
          }
        },
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
        
        // Buscar el documento con ID completo que corresponda
        const fullIdDocument = await prisma.document.findFirst({
          where: {
            filename: {
              contains: document.filename.replace('.pdf', ''),
              contains: 'expedientes'
            }
          }
        });
        
        if (fullIdDocument) {
          console.log(`   📍 Documento con ID completo encontrado: ${fullIdDocument.filename}`);
          
          // Extraer el publicId correcto de la URL
          let correctPublicId = null;
          
          if (fullIdDocument.fileUrl && fullIdDocument.fileUrl.includes('cloudinary.com')) {
            try {
              const url = new URL(fullIdDocument.fileUrl);
              const pathParts = url.pathname.split('/');
              
              const uploadIndex = pathParts.findIndex(part => part === 'upload');
              if (uploadIndex !== -1 && uploadIndex + 2 < pathParts.length) {
                const filePath = pathParts.slice(uploadIndex + 2).join('/');
                const filePathWithoutExt = filePath.replace(/\.[^/.]+$/, '');
                
                correctPublicId = filePathWithoutExt;
                console.log(`   🔑 PublicId correcto: ${correctPublicId}`);
              }
            } catch (urlError) {
              console.warn(`   ⚠️ Error parseando URL: ${urlError.message}`);
            }
          }
          
          if (correctPublicId) {
            // Actualizar el documento con ID corto
            await prisma.document.update({
              where: { id: document.id },
              data: {
                filename: fullIdDocument.filename,
                fileUrl: fullIdDocument.fileUrl,
                metadata: {
                  ...document.metadata,
                  cloudinaryPublicId: correctPublicId,
                  storageType: 'cloudinary',
                  cloudinaryUrl: fullIdDocument.fileUrl,
                  correctedAt: new Date().toISOString(),
                  originalFilename: document.filename
                }
              }
            });
            
            console.log(`   ✅ Corregido exitosamente`);
          } else {
            console.log(`   ❌ No se pudo extraer publicId correcto`);
          }
        } else {
          console.log(`   ❌ No se encontró documento con ID completo correspondiente`);
        }
        
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

fixRailwayDocumentIds();




