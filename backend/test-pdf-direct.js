const { exec } = require('child_process');
const fs = require('fs');

async function testPdfGeneration() {
  try {
    console.log('🧪 Iniciando prueba directa de generación de PDF...');
    
    // ID de la factura que se creó anteriormente
    const invoiceId = '9119a642-c6ed-4759-94ce-4fdddbb58be8';
    
    console.log('🆔 Usando factura ID:', invoiceId);
    
    // Token de autorización
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imxhd3llcjFAZXhhbXBsZS5jb20iLCJzdWIiOiIzNDRiMmYyMi1kMGVlLTQ4OTgtYjg5Ni00MWNjZGJlNTFmMTkiLCJyb2xlIjoiQUJPR0FETyIsImlhdCI6MTc1NDE3MzgzOCwiZXhwIjoxNzU0MjYwMjM4fQ.VLrmWyf3jtApxjXVT8BpGgSzfhQEeuXnswGMc7Cq7Ek';
    
    // Comando curl para descargar el PDF
    const pdfCommand = `curl -X GET "http://localhost:3000/api/invoices/${invoiceId}/pdf-qr" \
      -H "Authorization: Bearer ${token}" \
      -H "Accept: application/pdf" \
      -o test-invoice-direct.pdf`;
    
    console.log('📥 Descargando PDF...');
    console.log('🔗 URL:', `http://localhost:3000/api/invoices/${invoiceId}/pdf-qr`);
    
    exec(pdfCommand, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error descargando PDF:', error.message);
        if (stderr) {
          console.error('📋 Stderr:', stderr);
        }
        return;
      }
      
      console.log('✅ PDF descargado exitosamente');
      
      // Verificar si el archivo existe y su tamaño
      if (fs.existsSync('test-invoice-direct.pdf')) {
        const stats = fs.statSync('test-invoice-direct.pdf');
        console.log('📏 Tamaño del PDF:', stats.size, 'bytes');
        
        // Verificar si el PDF tiene el tamaño esperado para una sola página
        const expectedSizeRange = {
          min: 50000,  // Mínimo para una página A4
          max: 200000  // Máximo para una página A4
        };
        
        if (stats.size >= expectedSizeRange.min && stats.size <= expectedSizeRange.max) {
          console.log('✅ PDF parece ser de una sola página (tamaño dentro del rango esperado)');
        } else if (stats.size < expectedSizeRange.min) {
          console.log('⚠️ PDF muy pequeño, puede estar vacío o tener error');
        } else {
          console.log('⚠️ PDF puede tener múltiples páginas (tamaño fuera del rango esperado)');
        }
        
        console.log('🎯 Prueba completada');
        console.log('📁 Archivo generado: test-invoice-direct.pdf');
        
        // Mostrar los primeros bytes del archivo para debug
        const buffer = fs.readFileSync('test-invoice-direct.pdf');
        console.log('🔍 Primeros 50 bytes del archivo:');
        console.log(buffer.slice(0, 50));
        
      } else {
        console.error('❌ El archivo PDF no se generó');
      }
    });
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba
testPdfGeneration(); 