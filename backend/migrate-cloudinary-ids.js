require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateCloudinaryIds() {
  try {
    console.log('🔍 Iniciando migración de IDs de Cloudinary...\n');
    
    // Buscar documentos que no tengan cloudinaryPublicId en metadata
    const documents = await prisma.document.findMany({
      where: {
        fileUrl: {
          contains: 'cloudinary.com'
        },
        metadata: {
          path: ['cloudinaryPublicId'],
          equals: null
        }
      },
      select: {
        id: true,
        filename: true,
        fileUrl: true,
        metadata: true
      }
    });
    
    console.log(`📁 Encontrados ${documents.length} documentos para migrar\n`);
    
    if (documents.length === 0) {
      console.log('✅ No hay documentos que migrar');
      return;
    }
    
    // Migrar cada documento
    for (const document of documents) {
      try {
        console.log(`🔄 Migrando documento: ${document.filename}`);
        
        // Extraer el publicId de la URL de Cloudinary
        let cloudinaryPublicId = null;
        
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
              
              cloudinaryPublicId = filePathWithoutExt;
              console.log(`   PublicId extraído: ${cloudinaryPublicId}`);
            }
          } catch (urlError) {
            console.warn(`   ⚠️ Error parseando URL: ${urlError.message}`);
          }
        }
        
        if (cloudinaryPublicId) {
          // Actualizar metadatos
          await prisma.document.update({
            where: { id: document.id },
            data: {
              metadata: {
                ...document.metadata,
                cloudinaryPublicId: cloudinaryPublicId,
                storageType: 'cloudinary',
                cloudinaryUrl: document.fileUrl,
                migratedAt: new Date().toISOString()
              }
            }
          });
          
          console.log(`   ✅ Migrado exitosamente`);
        } else {
          console.log(`   ❌ No se pudo extraer publicId`);
        }
        
      } catch (error) {
        console.error(`   ❌ Error migrando documento ${document.filename}: ${error.message}`);
      }
    }
    
    console.log('\n🎉 Migración completada');
    
  } catch (error) {
    console.error('❌ Error en migración:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

migrateCloudinaryIds();

