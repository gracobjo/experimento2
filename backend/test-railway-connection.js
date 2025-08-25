const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway'
    }
  }
});

async function testConnection() {
  try {
    console.log('🔌 Probando conexión a Railway...');
    console.log('🌐 URL:', 'postgresql://postgres:****@shortline.proxy.rlwy.net:31832/railway');
    
    const result = await prisma.document.count();
    console.log(`✅ Conexión exitosa! Documentos en BD: ${result}`);
    
    // Obtener más información
    const documents = await prisma.document.findMany({
      select: { id: true, filename: true, fileUrl: true },
      take: 5
    });
    
    console.log('📋 Primeros documentos:');
    documents.forEach((doc, index) => {
      console.log(`  ${index + 1}. ID: ${doc.id}, Filename: ${doc.filename}`);
    });
    
  } catch (error) {
    console.error('❌ Error de conexión:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

