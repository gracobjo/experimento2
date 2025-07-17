const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico de problemas con PDFs...\n');

// Función para verificar archivo
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}: ${filePath}`);
  
  if (exists) {
    try {
      const stats = fs.statSync(filePath);
      console.log(`   📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`   📅 Modificado: ${stats.mtime.toLocaleString()}`);
    } catch (error) {
      console.log(`   ⚠️  Error al leer archivo: ${error.message}`);
    }
  }
  
  return exists;
}

// Función para verificar directorio
function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}: ${dirPath}`);
  
  if (exists) {
    try {
      const contents = fs.readdirSync(dirPath);
      console.log(`   📋 Contenido: ${contents.join(', ')}`);
    } catch (error) {
      console.log(`   ⚠️  Error al leer directorio: ${error.message}`);
    }
  }
  
  return exists;
}

try {
  console.log('📁 Verificando estructura de directorios...\n');
  
  // Verificar directorios principales
  const projectRoot = path.join(__dirname, '..');
  checkDirectory(projectRoot, 'Directorio raíz del proyecto');
  
  const srcDir = path.join(projectRoot, 'src');
  checkDirectory(srcDir, 'Directorio src');
  
  const distDir = path.join(projectRoot, 'dist');
  checkDirectory(distDir, 'Directorio dist');
  
  console.log('\n📋 Verificando templates...\n');
  
  // Verificar templates en src
  const srcTemplatesDir = path.join(srcDir, 'invoices', 'templates');
  checkDirectory(srcTemplatesDir, 'Templates en src');
  
  const srcTemplateFile = path.join(srcTemplatesDir, 'invoice-template.html');
  checkFile(srcTemplateFile, 'Template HTML en src');
  
  // Verificar templates en dist
  const distTemplatesDir = path.join(distDir, 'invoices', 'templates');
  checkDirectory(distTemplatesDir, 'Templates en dist');
  
  const distTemplateFile = path.join(distTemplatesDir, 'invoice-template.html');
  checkFile(distTemplateFile, 'Template HTML en dist');
  
  console.log('\n🔧 Verificando scripts...\n');
  
  // Verificar scripts
  const scriptsDir = path.join(projectRoot, 'scripts');
  checkDirectory(scriptsDir, 'Directorio scripts');
  
  const copyScript = path.join(scriptsDir, 'copy-templates.js');
  checkFile(copyScript, 'Script copy-templates.js');
  
  const verifyScript = path.join(scriptsDir, 'verify-templates.js');
  checkFile(verifyScript, 'Script verify-templates.js');
  
  console.log('\n📦 Verificando dependencias...\n');
  
  // Verificar package.json
  const packageJson = path.join(projectRoot, 'package.json');
  checkFile(packageJson, 'package.json');
  
  // Verificar node_modules
  const nodeModules = path.join(projectRoot, 'node_modules');
  const nodeModulesExists = fs.existsSync(nodeModules);
  console.log(`${nodeModulesExists ? '✅' : '❌'} node_modules: ${nodeModules}`);
  
  // Verificar dependencias específicas
  const puppeteerPath = path.join(nodeModules, 'puppeteer');
  const puppeteerExists = fs.existsSync(puppeteerPath);
  console.log(`${puppeteerExists ? '✅' : '❌'} Puppeteer: ${puppeteerPath}`);
  
  const qrcodePath = path.join(nodeModules, 'qrcode');
  const qrcodeExists = fs.existsSync(qrcodePath);
  console.log(`${qrcodeExists ? '✅' : '❌'} QRCode: ${qrcodePath}`);
  
  console.log('\n🔍 Verificando rutas de búsqueda del servicio...\n');
  
  // Simular las rutas que busca el servicio
  const possiblePaths = [
    path.join(distDir, 'invoices', 'templates', 'invoice-template.html'),
    path.join(distDir, 'templates', 'invoice-template.html'),
    path.join(projectRoot, 'dist', 'invoices', 'templates', 'invoice-template.html'),
    path.join(projectRoot, 'src', 'invoices', 'templates', 'invoice-template.html')
  ];
  
  possiblePaths.forEach((templatePath, index) => {
    const exists = fs.existsSync(templatePath);
    console.log(`${exists ? '✅' : '❌'} Ruta ${index + 1}: ${templatePath}`);
  });
  
  console.log('\n📊 Resumen del diagnóstico...\n');
  
  // Contar problemas
  const problems = [];
  
  if (!fs.existsSync(srcTemplateFile)) {
    problems.push('Template HTML no existe en src');
  }
  
  if (!fs.existsSync(distTemplateFile)) {
    problems.push('Template HTML no existe en dist');
  }
  
  if (!fs.existsSync(puppeteerPath)) {
    problems.push('Puppeteer no está instalado');
  }
  
  if (!fs.existsSync(qrcodePath)) {
    problems.push('QRCode no está instalado');
  }
  
  if (problems.length === 0) {
    console.log('🎉 No se encontraron problemas evidentes');
    console.log('💡 Si los PDFs siguen corruptos, verifica:');
    console.log('   - Logs del servidor durante la generación');
    console.log('   - Configuración de Puppeteer');
    console.log('   - Permisos de escritura en el sistema');
  } else {
    console.log('❌ Problemas encontrados:');
    problems.forEach(problem => console.log(`   - ${problem}`));
    
    console.log('\n🔧 Soluciones sugeridas:');
    if (!fs.existsSync(distTemplateFile)) {
      console.log('   1. Ejecutar: npm run verify-templates');
      console.log('   2. Ejecutar: npm run build:with-verify');
    }
    if (!fs.existsSync(puppeteerPath) || !fs.existsSync(qrcodePath)) {
      console.log('   3. Ejecutar: npm install');
    }
  }
  
} catch (error) {
  console.error('❌ Error durante el diagnóstico:', error.message);
  process.exit(1);
} 