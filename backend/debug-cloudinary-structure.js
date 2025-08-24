const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary con las variables de Railway
cloudinary.config({
  cloud_name: 'dplymffxp',
  api_key: '421573481652154',
  api_secret: 'bSWGRzhkWTYtlhaKobcuwu52Zm0'
});

async function debugCloudinaryStructure() {
  try {
    console.log('🔍 Debuggeando estructura de Cloudinary...');
    
    // Paso 1: Listar recursos con más detalle
    console.log('\n🔄 Paso 1: Listando recursos con detalle...');
    const resourcesResult = await cloudinary.api.resources({
      max_results: 10,
      type: 'upload'
    });
    
    console.log(`📊 Total recursos: ${resourcesResult.resources.length}`);
    
    // Mostrar cada recurso con su estructura
    resourcesResult.resources.forEach((resource, index) => {
      console.log(`\n📋 Recurso ${index + 1}:`);
      console.log(`  Public ID: ${resource.public_id}`);
      console.log(`  Format: ${resource.format}`);
      console.log(`  Resource Type: ${resource.resource_type}`);
      console.log(`  Bytes: ${resource.bytes}`);
      console.log(`  URL: ${resource.secure_url}`);
      console.log(`  Created At: ${resource.created_at}`);
    });
    
    // Paso 2: Buscar archivo específico por diferentes métodos
    console.log('\n🔄 Paso 2: Buscando archivo específico...');
    const targetFilename = '1756038965478-33i41c';
    
    // Método 1: Buscar por public_id exacto
    console.log(`\n🔍 Método 1: Buscando por public_id exacto: ${targetFilename}`);
    try {
      const exactMatch = await cloudinary.api.resource(targetFilename);
      console.log(`✅ Encontrado por public_id exacto:`, exactMatch.public_id);
    } catch (error) {
      console.log(`❌ No encontrado por public_id exacto:`, error.message);
    }
    
    // Método 2: Buscar por public_id con ruta completa
    const fullPath = 'experimento2/expedientes/9c6df72e-969d-43b8-8f9e-42a33b514027/1756038965478-33i41c';
    console.log(`\n🔍 Método 2: Buscando por ruta completa: ${fullPath}`);
    try {
      const fullPathMatch = await cloudinary.api.resource(fullPath);
      console.log(`✅ Encontrado por ruta completa:`, fullPathMatch.public_id);
    } catch (error) {
      console.log(`❌ No encontrado por ruta completa:`, error.message);
    }
    
    // Método 3: Buscar por prefix
    console.log(`\n🔍 Método 3: Buscando por prefix: experimento2/`);
    try {
      const prefixResult = await cloudinary.api.resources({
        prefix: 'experimento2/',
        max_results: 5,
        type: 'upload'
      });
      console.log(`✅ Encontrados por prefix: ${prefixResult.resources.length} recursos`);
      prefixResult.resources.forEach((resource, index) => {
        console.log(`  ${index + 1}. ${resource.public_id}`);
      });
    } catch (error) {
      console.log(`❌ Error buscando por prefix:`, error.message);
    }
    
    // Paso 3: Probar diferentes resource_types
    console.log('\n🔄 Paso 3: Probando diferentes resource_types...');
    const resourceTypes = ['image', 'video', 'raw', 'auto'];
    
    for (const resourceType of resourceTypes) {
      try {
        console.log(`\n🔍 Probando resource_type: ${resourceType}`);
        const testResult = await cloudinary.api.resource(targetFilename, { resource_type: resourceType });
        console.log(`✅ Encontrado con resource_type ${resourceType}:`, testResult.public_id);
        break; // Si encontramos uno, no necesitamos probar más
      } catch (error) {
        console.log(`❌ No encontrado con resource_type ${resourceType}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error durante el debug:', error.message);
    console.error('🔍 Detalles del error:', error);
  }
}

debugCloudinaryStructure();
