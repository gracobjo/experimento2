require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugDocumentSearch() {
  try {
    console.log('🔍 Debuggeando búsqueda de documentos...\n');
    
    // 1. Mostrar todos los documentos
    const allDocuments = await prisma.document.findMany({
      select: {
        id: true,
        filename: true,
        fileUrl: true,
        metadata: true
      }
    });
    
    console.log(`📁 Total de documentos: ${allDocuments.length}\n`);
    
    allDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ID: ${doc.id}`);
      console.log(`   Filename: ${doc.filename}`);
      console.log(`   URL: ${doc.fileUrl || 'NO URL'}`);
      console.log(`   Metadata: ${JSON.stringify(doc.metadata)}`);
      console.log('---');
    });
    
    // 2. Buscar documentos con 'expedientes' en el nombre
    console.log('\n🔍 Buscando documentos con "expedientes" en el nombre:');
    const expedientesDocs = await prisma.document.findMany({
      where: {
        filename: {
          contains: 'expedientes'
        }
      }
    });
    
    console.log(`📁 Encontrados ${expedientesDocs.length} documentos con "expedientes":`);
    expedientesDocs.forEach(doc => {
      console.log(`   - ${doc.filename}`);
    });
    
    // 3. Buscar documentos con ID corto
    console.log('\n🔍 Buscando documentos con ID corto (sin expedientes):');
    const shortIdDocs = await prisma.document.findMany({
      where: {
        filename: {
          not: {
            contains: 'expedientes'
          }
        }
      }
    });
    
    console.log(`📁 Encontrados ${shortIdDocs.length} documentos con ID corto:`);
    shortIdDocs.forEach(doc => {
      console.log(`   - ${doc.filename}`);
    });
    
    // 4. Probar la búsqueda específica
    console.log('\n🔍 Probando búsqueda específica para 1756038965478-33i41c:');
    
    const searchTerm = '1756038965478-33i41c';
    const matchingDocs = await prisma.document.findMany({
      where: {
        filename: {
          contains: searchTerm
        }
      }
    });
    
    console.log(`📁 Documentos que contienen "${searchTerm}": ${matchingDocs.length}`);
    matchingDocs.forEach(doc => {
      console.log(`   - ${doc.filename}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugDocumentSearch();


