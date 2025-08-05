const fs = require('fs');

function analyzePdf() {
  try {
    console.log('🔍 Analizando PDF generado...');
    
    // Leer el archivo PDF
    const pdfBuffer = fs.readFileSync('test-invoice-optimized.pdf');
    console.log('📏 Tamaño total:', pdfBuffer.length, 'bytes');
    
    // Buscar patrones que indiquen múltiples páginas
    const pdfContent = pdfBuffer.toString('utf8', 0, Math.min(10000, pdfBuffer.length));
    
    // Contar ocurrencias de patrones de página
    const pagePatterns = [
      /\/Page\s/g,
      /\/Pages\s/g,
      /\/MediaBox/g,
      /\/Parent\s\d+\s\d+\sR/g
    ];
    
    console.log('🔍 Analizando estructura del PDF...');
    
    pagePatterns.forEach((pattern, index) => {
      const matches = pdfContent.match(pattern);
      const count = matches ? matches.length : 0;
      console.log(`📄 Patrón ${index + 1}: ${count} ocurrencias`);
    });
    
    // Buscar información específica sobre páginas
    const pageMatches = pdfContent.match(/\/Page\s\d+\s\d+\sR/g);
    if (pageMatches) {
      console.log('📄 Páginas encontradas:', pageMatches.length);
      console.log('📋 Referencias de página:', pageMatches);
    }
    
    // Verificar si hay contenido duplicado
    const contentSections = [
      'Despacho Legal',
      'EMISOR',
      'RECEPTOR',
      'FACTURA',
      'Base Imponible',
      'IVA',
      'TOTAL'
    ];
    
    console.log('🔍 Verificando contenido...');
    contentSections.forEach(section => {
      const matches = pdfContent.match(new RegExp(section, 'g'));
      const count = matches ? matches.length : 0;
      console.log(`📋 "${section}": ${count} ocurrencias`);
    });
    
    // Verificar tamaño de fuentes y elementos
    const fontMatches = pdfContent.match(/\/Font\s\d+\s\d+\sR/g);
    if (fontMatches) {
      console.log('🔤 Fuentes utilizadas:', fontMatches.length);
    }
    
    // Verificar imágenes
    const imageMatches = pdfContent.match(/\/XObject\s\d+\s\d+\sR/g);
    if (imageMatches) {
      console.log('🖼️ Imágenes/objetos:', imageMatches.length);
    }
    
    console.log('🎯 Análisis completado');
    
  } catch (error) {
    console.error('❌ Error analizando PDF:', error.message);
  }
}

// Ejecutar análisis
analyzePdf(); 