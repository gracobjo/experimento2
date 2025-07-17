const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando estructura de templates...');

// Rutas importantes
const srcTemplatesDir = path.join(__dirname, '..', 'src', 'invoices', 'templates');
const distTemplatesDir = path.join(__dirname, '..', 'dist', 'invoices', 'templates');
const distDir = path.join(__dirname, '..', 'dist');

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
  // 1. Verificar que existe el directorio src/templates
  if (!fs.existsSync(srcTemplatesDir)) {
    console.error('❌ No existe el directorio src/templates');
    process.exit(1);
  }

  console.log('✅ Directorio src/templates existe');

  // 2. Verificar que existe el template HTML
  const templateFile = path.join(srcTemplatesDir, 'invoice-template.html');
  if (!fs.existsSync(templateFile)) {
    console.error('❌ No existe el archivo invoice-template.html');
    process.exit(1);
  }

  console.log('✅ Template HTML existe');

  // 3. Verificar/crear directorio dist
  if (!fs.existsSync(distDir)) {
    console.log('📁 Creando directorio dist...');
    fs.mkdirSync(distDir, { recursive: true });
  }

  // 4. Verificar/copiar templates a dist
  if (!fs.existsSync(distTemplatesDir)) {
    console.log('📋 Copiando templates a dist...');
    copyDir(srcTemplatesDir, distTemplatesDir);
  } else {
    console.log('✅ Directorio dist/templates ya existe');
    
    // Verificar que el template está actualizado
    const srcTemplate = fs.readFileSync(templateFile, 'utf8');
    const distTemplate = path.join(distTemplatesDir, 'invoice-template.html');
    
    if (!fs.existsSync(distTemplate)) {
      console.log('📋 Template faltante en dist, copiando...');
      fs.copyFileSync(templateFile, distTemplate);
    } else {
      const distContent = fs.readFileSync(distTemplate, 'utf8');
      if (srcTemplate !== distContent) {
        console.log('📋 Template desactualizado, actualizando...');
        fs.copyFileSync(templateFile, distTemplate);
      } else {
        console.log('✅ Template está actualizado');
      }
    }
  }

  // 5. Verificar estructura final
  console.log('\n📋 Estructura final:');
  console.log(`📁 src/templates: ${fs.existsSync(srcTemplatesDir) ? '✅' : '❌'}`);
  console.log(`📁 dist/templates: ${fs.existsSync(distTemplatesDir) ? '✅' : '❌'}`);
  console.log(`📄 template HTML: ${fs.existsSync(path.join(distTemplatesDir, 'invoice-template.html')) ? '✅' : '❌'}`);

  console.log('\n🎉 Verificación completada exitosamente');

} catch (error) {
  console.error('❌ Error durante la verificación:', error.message);
  process.exit(1);
} 