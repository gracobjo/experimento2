const fs = require('fs');
const path = require('path');

console.log('📁 Copiando templates...');

// Crear directorio si no existe
const templatesDir = path.join(__dirname, '../dist/templates');
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true });
}

console.log('✅ Templates copiados exitosamente'); 