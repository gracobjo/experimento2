const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway'
    }
  }
});

async function syncRailwayDocuments() {
  try {
    console.log('🔄 Sincronizando documentos en Railway...');
    
    // Documentos que necesitamos crear en Railway
    const documentsToCreate = [
      {
        id: 'doc-001',
        filename: '1756038965478-33i41c',
        originalName: 'contrato_compraventa.pdf',
        fileUrl: 'https://res.cloudinary.com/dplymffxp/image/upload/v1756038965/experimento2/expedientes/9c6df72e-969d-43b8-8f9e-42a33b514027/1756038965478-33i41c.pdf',
        mimeType: 'application/pdf',
        fileSize: 63277,
        description: 'Contrato de compraventa',
        expedienteId: 'exp-001', // Expediente existente en Railway
        uploadedByUserId: '3ef6a199-e91f-4e98-97a2-638995e7faa7' // Lawyer Uno
      },
      {
        id: 'doc-002',
        filename: '1756038965478-33i41c',
        originalName: 'demanda_laboral.pdf',
        fileUrl: 'https://res.cloudinary.com/dplymffxp/image/upload/v1756038965/experimento2/expedientes/9c6df72e-969d-43b8-8f9e-42a33b514027/1756038965478-33i41c.pdf',
        mimeType: 'application/pdf',
        fileSize: 63277,
        description: 'Demanda laboral',
        expedienteId: 'exp-002', // Expediente existente en Railway
        uploadedByUserId: 'cc34cae8-9d3d-49c0-bed7-f8b4356431d9' // Lawyer Dos
      },
      {
        id: 'doc-c1-001',
        filename: '1756038965478-33i41c',
        originalName: 'documentoA.pdf',
        fileUrl: 'https://res.cloudinary.com/dplymffxp/image/upload/v1756038965/experimento2/expedientes/9c6df72e-969d-43b8-8f9e-42a33b514027/1756038965478-33i41c.pdf',
        mimeType: 'application/pdf',
        fileSize: 63277,
        description: 'Documento A',
        expedienteId: '54c5bc49-936d-4e6d-b16c-c621cbb75bb3', // Expediente existente en Railway
        uploadedByUserId: 'cc34cae8-9d3d-49c0-bed7-f8b4356431d9' // Lawyer Dos
      },
      {
        id: 'doc-c1-002',
        filename: '1756038965478-33i41c',
        originalName: 'documentoB.pdf',
        fileUrl: 'https://res.cloudinary.com/dplymffxp/image/upload/v1756038965/experimento2/expedientes/9c6df72e-969d-43b8-8f9e-42a33b514027/1756038965478-33i41c.pdf',
        mimeType: 'application/pdf',
        fileSize: 63277,
        description: 'Documento B',
        expedienteId: '9c6df72e-969d-43e8-8f9e-42a33b514027', // Expediente existente en Railway
        uploadedByUserId: '3ef6a199-e91f-4e98-97a2-638995e7faa7' // Lawyer Uno
      }
    ];

    console.log(`📋 Creando ${documentsToCreate.length} documentos...`);

    for (const doc of documentsToCreate) {
      try {
        // Verificar si ya existe
        const existing = await prisma.document.findUnique({
          where: { id: doc.id }
        });

        if (existing) {
          console.log(`⚠️  Documento ${doc.id} ya existe, actualizando...`);
          await prisma.document.update({
            where: { id: doc.id },
            data: {
              filename: doc.filename,
              originalName: doc.originalName,
              fileUrl: doc.fileUrl,
              mimeType: doc.mimeType,
              fileSize: doc.fileSize,
              description: doc.description,
              expediente: {
                connect: { id: doc.expedienteId }
              },
              uploadedByUser: {
                connect: { id: doc.uploadedByUserId }
              }
            }
          });
        } else {
          console.log(`➕ Creando documento ${doc.id}...`);
          await prisma.document.create({
            data: {
              id: doc.id,
              filename: doc.filename,
              originalName: doc.originalName,
              fileUrl: doc.fileUrl,
              mimeType: doc.mimeType,
              fileSize: doc.fileSize,
              description: doc.description,
              expediente: {
                connect: { id: doc.expedienteId }
              },
              uploadedByUser: {
                connect: { id: doc.uploadedByUserId }
              }
            }
          });
        }
      } catch (error) {
        console.error(`❌ Error con documento ${doc.id}:`, error.message);
      }
    }

    // Verificar resultado final
    const finalCount = await prisma.document.count();
    console.log(`✅ Sincronización completada! Total documentos: ${finalCount}`);

    // Mostrar documentos finales
    const finalDocs = await prisma.document.findMany({
      select: { id: true, filename: true, originalName: true, expedienteId: true, uploadedBy: true },
      orderBy: { id: 'asc' }
    });

    console.log('📋 Documentos finales:');
    finalDocs.forEach((doc, index) => {
      console.log(`  ${index + 1}. ID: ${doc.id}, Filename: ${doc.filename}, Original: ${doc.originalName}, Expediente: ${doc.expedienteId}, Usuario: ${doc.uploadedBy}`);
    });

  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncRailwayDocuments();
