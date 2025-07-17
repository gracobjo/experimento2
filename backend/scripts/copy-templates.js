const fs = require('fs');
const path = require('path');

// Función para copiar directorios recursivamente
function copyDir(src, dest) {
  // Crear directorio destino si no existe
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
    console.log(`📁 Directorio creado: ${dest}`);
  }

  // Verificar que el directorio origen existe
  if (!fs.existsSync(src)) {
    throw new Error(`El directorio origen no existe: ${src}`);
  }

  // Leer archivos del directorio origen
  const files = fs.readdirSync(src);

  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);

    if (fs.statSync(srcPath).isDirectory()) {
      // Si es un directorio, copiarlo recursivamente
      copyDir(srcPath, destPath);
    } else {
      // Si es un archivo, copiarlo
      fs.copyFileSync(srcPath, destPath);
      console.log(`📄 Copiado: ${file}`);
    }
  });
}

// Rutas
const srcTemplatesDir = path.join(__dirname, '..', 'src', 'invoices', 'templates');
const destTemplatesDir = path.join(__dirname, '..', 'dist', 'invoices', 'templates');

console.log('🚀 Iniciando copia de templates...');
console.log('📁 Directorio origen:', srcTemplatesDir);
console.log('📁 Directorio destino:', destTemplatesDir);
console.log('🔍 Verificando si existe el directorio origen:', fs.existsSync(srcTemplatesDir));

// Verificar que el directorio dist existe
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.log('⚠️  El directorio dist no existe, creándolo...');
  fs.mkdirSync(distDir, { recursive: true });
}

try {
  console.log('📋 Copiando templates HTML...');
  copyDir(srcTemplatesDir, destTemplatesDir);
  console.log('✅ Templates copiados exitosamente');
  
  // Verificar que se copiaron correctamente
  const copiedFiles = fs.readdirSync(destTemplatesDir);
  console.log('📋 Archivos copiados:', copiedFiles);
  
} catch (error) {
  console.error('❌ Error copiando templates:', error.message);
  console.error('🔍 Detalles del error:', error);
  process.exit(1);
} 