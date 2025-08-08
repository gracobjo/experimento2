#!/usr/bin/env node

/**
 * Script para configurar las variables de entorno CORS en Railway
 * 
 * Uso:
 * 1. Instalar Railway CLI: npm install -g @railway/cli
 * 2. Ejecutar: node scripts/fix-cors-railway.js
 */

const { execSync } = require('child_process');

const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:3000', 
  'https://experimento2-fenm.vercel.app',
  'https://experimento2-production.up.railway.app'
].join(',');

console.log('🔧 Configurando CORS en Railway...');
console.log('📋 Orígenes CORS configurados:', corsOrigins);

try {
  // Verificar si Railway CLI está instalado
  execSync('railway --version', { stdio: 'pipe' });
  
  // Configurar la variable de entorno CORS_ORIGIN
  execSync(`railway variables set CORS_ORIGIN="${corsOrigins}"`, { stdio: 'inherit' });
  
  console.log('✅ CORS configurado correctamente en Railway');
  console.log('🔄 Reiniciando el servicio...');
  
  // Reiniciar el servicio para aplicar los cambios
  execSync('railway service restart', { stdio: 'inherit' });
  
  console.log('✅ Servicio reiniciado. Los cambios de CORS deberían estar activos.');
  
} catch (error) {
  console.error('❌ Error configurando CORS:', error.message);
  console.log('\n📝 Instrucciones manuales:');
  console.log('1. Ve a tu dashboard de Railway');
  console.log('2. Selecciona tu proyecto');
  console.log('3. Ve a la pestaña "Variables"');
  console.log('4. Agrega o modifica la variable CORS_ORIGIN con el valor:');
  console.log(`   ${corsOrigins}`);
  console.log('5. Reinicia el servicio');
}
