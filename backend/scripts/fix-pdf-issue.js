const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Reparando problemas con PDFs...\n');

// Función para ejecutar comandos
function runCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    execSync(command, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log(`✅ ${description} completado`);
    return true;
  } catch (error) {
    console.log(`❌ Error en ${description}: ${error.message}`);
    return false;
  }
}

// Función para verificar archivo
function checkFile(filePath) {
  return fs.existsSync(filePath);
}

// Función para copiar directorios recursivamente
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    console.log(`📁 Directorio creado: ${dest}`);
  }

  if (!fs.existsSync(src)) {
    throw new Error(`El directorio origen no existe: ${src}`);
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`📄 Copiado: ${file}`);
    }
  });
}

try {
  const projectRoot = path.join(__dirname, '..');
  const srcTemplatesDir = path.join(projectRoot, 'src', 'invoices', 'templates');
  const distTemplatesDir = path.join(projectRoot, 'dist', 'invoices', 'templates');
  const distDir = path.join(projectRoot, 'dist');

  console.log('📋 Verificando estado actual...\n');

  // 1. Verificar que existe el template en src
  const srcTemplateFile = path.join(srcTemplatesDir, 'invoice-template.html');
  if (!checkFile(srcTemplateFile)) {
    console.error('❌ No existe el template HTML en src');
    console.error('   Esto es un problema crítico. Verifica que el archivo existe en:');
    console.error(`   ${srcTemplateFile}`);
    process.exit(1);
  }
  console.log('✅ Template HTML existe en src');

  // 2. Verificar dependencias
  console.log('\n📦 Verificando dependencias...');
  const nodeModules = path.join(projectRoot, 'node_modules');
  const puppeteerPath = path.join(nodeModules, 'puppeteer');
  const qrcodePath = path.join(nodeModules, 'qrcode');

  if (!checkFile(puppeteerPath) || !checkFile(qrcodePath)) {
    console.log('⚠️  Faltan dependencias, instalando...');
    runCommand('npm install', 'Instalando dependencias');
  } else {
    console.log('✅ Dependencias verificadas');
  }

  // 3. Verificar/copiar templates a dist
  console.log('\n📋 Verificando templates en dist...');
  if (!checkFile(distTemplatesDir)) {
    console.log('📁 Creando directorio dist/templates...');
    copyDir(srcTemplatesDir, distTemplatesDir);
  } else {
    console.log('✅ Directorio dist/templates existe');
    
    // Verificar que el template está actualizado
    const distTemplateFile = path.join(distTemplatesDir, 'invoice-template.html');
    if (!checkFile(distTemplateFile)) {
      console.log('📋 Template faltante en dist, copiando...');
      fs.copyFileSync(srcTemplateFile, distTemplateFile);
    } else {
      const srcContent = fs.readFileSync(srcTemplateFile, 'utf8');
      const distContent = fs.readFileSync(distTemplateFile, 'utf8');
      if (srcContent !== distContent) {
        console.log('📋 Template desactualizado, actualizando...');
        fs.copyFileSync(srcTemplateFile, distTemplateFile);
      } else {
        console.log('✅ Template está actualizado');
      }
    }
  }

  // 4. Rebuild si es necesario
  console.log('\n🏗️  Verificando build...');
  const distMainFile = path.join(distDir, 'main.js');
  if (!checkFile(distMainFile)) {
    console.log('⚠️  Build no encontrado, reconstruyendo...');
    runCommand('npm run build', 'Reconstruyendo proyecto');
  } else {
    console.log('✅ Build existe');
  }

  // 5. Verificar estructura final
  console.log('\n🔍 Verificación final...');
  
  const finalChecks = [
    { path: srcTemplateFile, name: 'Template en src' },
    { path: path.join(distTemplatesDir, 'invoice-template.html'), name: 'Template en dist' },
    { path: distMainFile, name: 'Build principal' },
    { path: puppeteerPath, name: 'Puppeteer' },
    { path: qrcodePath, name: 'QRCode' }
  ];

  let allGood = true;
  finalChecks.forEach(check => {
    const exists = checkFile(check.path);
    console.log(`${exists ? '✅' : '❌'} ${check.name}`);
    if (!exists) allGood = false;
  });

  if (allGood) {
    console.log('\n🎉 Reparación completada exitosamente!');
    console.log('💡 Ahora puedes:');
    console.log('   1. Reiniciar el servidor: npm run start:prod');
    console.log('   2. Probar la generación de PDFs');
    console.log('   3. Si persisten problemas, ejecutar: npm run diagnose-pdf');
  } else {
    console.log('\n⚠️  Algunos problemas persisten');
    console.log('💡 Ejecuta: npm run diagnose-pdf para más detalles');
  }

} catch (error) {
  console.error('❌ Error durante la reparación:', error.message);
  process.exit(1);
} 