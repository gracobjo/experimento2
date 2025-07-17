const fs = require('fs');
const path = require('path');

/**
 * Script para diagnosticar la corrupción de PDFs
 * Este script ayuda a identificar en qué punto del proceso se corrompe el PDF
 */

function analyzePdfFile(filePath) {
  console.log(`\n=== ANÁLISIS DEL ARCHIVO PDF: ${filePath} ===`);
  
  if (!fs.existsSync(filePath)) {
    console.log('❌ El archivo no existe');
    return;
  }

  const stats = fs.statSync(filePath);
  console.log(`📁 Tamaño del archivo: ${stats.size} bytes`);
  
  // Leer los primeros bytes para verificar si es un PDF válido
  const buffer = fs.readFileSync(filePath);
  const firstBytes = buffer.slice(0, 8);
  
  console.log(`🔍 Primeros 8 bytes: ${Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
  
  // Verificar si comienza con la firma PDF
  const pdfSignature = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]); // %PDF-
  const isPdf = firstBytes.slice(0, 5).equals(pdfSignature);
  
  if (isPdf) {
    console.log('✅ El archivo parece ser un PDF válido (comienza con %PDF-)');
  } else {
    console.log('❌ El archivo NO es un PDF válido (no comienza con %PDF-)');
    
    // Verificar si es JSON
    try {
      const content = buffer.toString('utf8');
      const jsonData = JSON.parse(content);
      console.log('⚠️  El archivo contiene datos JSON en lugar de PDF binario');
      console.log(`📊 Tipo de datos JSON: ${typeof jsonData}`);
      if (typeof jsonData === 'object') {
        console.log(`📊 Claves principales: ${Object.keys(jsonData).slice(0, 10).join(', ')}`);
        console.log(`📊 Número total de claves: ${Object.keys(jsonData).length}`);
      }
    } catch (e) {
      console.log('⚠️  El archivo no es JSON válido ni PDF válido');
    }
  }
  
  // Mostrar los primeros 100 caracteres como texto
  const textContent = buffer.toString('utf8', 0, 100);
  console.log(`📝 Primeros 100 caracteres como texto:`);
  console.log(textContent);
  
  return {
    size: stats.size,
    isPdf: isPdf,
    buffer: buffer
  };
}

function checkPuppeteerInstallation() {
  console.log('\n=== VERIFICACIÓN DE PUPPETEER ===');
  
  try {
    const puppeteer = require('puppeteer');
    console.log('✅ Puppeteer está instalado');
    
    // Verificar versión
    const packageJson = require('../package.json');
    const puppeteerVersion = packageJson.dependencies?.puppeteer || packageJson.devDependencies?.puppeteer;
    console.log(`📦 Versión de Puppeteer: ${puppeteerVersion}`);
    
  } catch (error) {
    console.log('❌ Puppeteer no está instalado o hay un error:', error.message);
  }
}

function checkChromeInstallation() {
  console.log('\n=== VERIFICACIÓN DE CHROME ===');
  
  const { execSync } = require('child_process');
  
  try {
    // Intentar encontrar Chrome en Windows
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
    ];
    
    let chromeFound = false;
    for (const chromePath of chromePaths) {
      if (fs.existsSync(chromePath)) {
        console.log(`✅ Chrome encontrado en: ${chromePath}`);
        chromeFound = true;
        break;
      }
    }
    
    if (!chromeFound) {
      console.log('⚠️  Chrome no encontrado en las rutas típicas');
      console.log('💡 Puppeteer puede descargar Chrome automáticamente');
    }
    
  } catch (error) {
    console.log('❌ Error verificando Chrome:', error.message);
  }
}

function createTestPdf() {
  console.log('\n=== CREANDO PDF DE PRUEBA ===');
  
  const puppeteer = require('puppeteer');
  
  return new Promise(async (resolve, reject) => {
    let browser;
    try {
      console.log('🚀 Iniciando Puppeteer...');
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      console.log('📄 Creando página...');
      const page = await browser.newPage();
      
      console.log('📝 Estableciendo contenido HTML...');
      await page.setContent(`
        <html>
          <head><title>Test PDF</title></head>
          <body>
            <h1>PDF de Prueba</h1>
            <p>Este es un PDF generado para probar que Puppeteer funciona correctamente.</p>
            <p>Fecha: ${new Date().toISOString()}</p>
          </body>
        </html>
      `);
      
      console.log('🖨️  Generando PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' }
      });
      
      console.log(`✅ PDF generado exitosamente. Tamaño: ${pdfBuffer.length} bytes`);
      
      // Guardar el PDF de prueba
      const testPdfPath = path.join(__dirname, 'test-pdf-generated.pdf');
      fs.writeFileSync(testPdfPath, pdfBuffer);
      console.log(`💾 PDF guardado en: ${testPdfPath}`);
      
      // Analizar el PDF generado
      analyzePdfFile(testPdfPath);
      
      resolve(pdfBuffer);
      
    } catch (error) {
      console.log('❌ Error generando PDF de prueba:', error.message);
      reject(error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  });
}

async function main() {
  console.log('🔍 DIAGNÓSTICO DE CORRUPCIÓN DE PDF');
  console.log('=====================================');
  
  // 1. Analizar el archivo corrupto
  const corruptPdfPath = path.join(__dirname, '..', 'factura_FAC-C1-001.pdf');
  analyzePdfFile(corruptPdfPath);
  
  // 2. Verificar instalación de Puppeteer
  checkPuppeteerInstallation();
  
  // 3. Verificar instalación de Chrome
  checkChromeInstallation();
  
  // 4. Crear un PDF de prueba
  try {
    await createTestPdf();
  } catch (error) {
    console.log('❌ No se pudo crear el PDF de prueba');
  }
  
  console.log('\n=== RECOMENDACIONES ===');
  console.log('1. Si el archivo corrupto contiene JSON, el problema está en el envío del buffer');
  console.log('2. Si Puppeteer no funciona, reinstalar: npm install puppeteer');
  console.log('3. Si Chrome no está disponible, Puppeteer lo descargará automáticamente');
  console.log('4. Verificar que el buffer se envía correctamente en el controlador');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  analyzePdfFile,
  checkPuppeteerInstallation,
  checkChromeInstallation,
  createTestPdf
}; 