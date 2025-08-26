const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary con las variables de Railway
cloudinary.config({
  cloud_name: 'dplymffxp',
  api_key: '421573481652154',
  api_secret: 'bSWGRzhkWTYtlhaKobcuwu52Zm0'
});

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway'
    }
  }
});

async function testRailwayCloudinary() {
  try {
    console.log('🧪 Probando Cloudinary desde Railway...');
    console.log('📋 Variables de entorno:');
    console.log(`  CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || 'NO CONFIGURADO'}`);
    console.log(`  CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY || 'NO CONFIGURADO'}`);
    console.log(`  CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'CONFIGURADO' : 'NO CONFIGURADO'}`);
    
    // Paso 1: Probar autenticación básica
    console.log('\n🔄 Paso 1: Probando autenticación...');
    const pingResult = await cloudinary.api.ping();
    console.log(`✅ Ping exitoso:`, pingResult);
    
    // Paso 2: Probar listado de recursos
    console.log('\n🔄 Paso 2: Probando listado de recursos...');
    const resourcesResult = await cloudinary.api.resources({
      max_results: 5,
      type: 'upload'
    });
    console.log(`✅ Listado exitoso: ${resourcesResult.resources.length} recursos encontrados`);
    
    // Paso 3: Obtener documento de la BD
    console.log('\n🔄 Paso 3: Obteniendo documento de la BD...');
    const document = await prisma.document.findUnique({
      where: { id: 'doc-001' }
    });
    
    if (document) {
      console.log(`✅ Documento encontrado: ${document.id}`);
      console.log(`📄 Filename: ${document.filename}`);
      console.log(`🔗 FileUrl: ${document.fileUrl}`);
      
      // Paso 4: Probar acceso al archivo específico
      console.log('\n🔄 Paso 4: Probando acceso al archivo...');
      try {
        const fileInfo = await cloudinary.api.resource(document.filename);
        console.log(`✅ Archivo accesible: ${fileInfo.public_id}`);
        console.log(`📊 Tamaño: ${fileInfo.bytes} bytes`);
        console.log(`🔗 URL: ${fileInfo.secure_url}`);
      } catch (fileError) {
        console.error(`❌ Error accediendo al archivo:`, fileError.message);
      }
    } else {
      console.log('❌ Documento doc-001 no encontrado');
    }
    
    // Paso 5: Probar streaming (simulado)
    console.log('\n🔄 Paso 5: Probando streaming simulado...');
    try {
      const streamUrl = cloudinary.url(document.filename, {
        resource_type: 'auto',
        flags: 'attachment'
      });
      console.log(`✅ URL de streaming generada: ${streamUrl}`);
    } catch (streamError) {
      console.error(`❌ Error generando URL de streaming:`, streamError.message);
    }
    
  } catch (error) {
    console.error('❌ Error durante la prueba:', error.message);
    console.error('🔍 Detalles del error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRailwayCloudinary();



