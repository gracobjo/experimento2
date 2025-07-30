const fs = require('fs');

function analyzePdf(filePath) {
    console.log(`🔍 Analizando PDF: ${filePath}`);
    
    try {
        // Leer el archivo como buffer
        const buffer = fs.readFileSync(filePath);
        console.log(`📏 Tamaño del archivo: ${buffer.length} bytes`);
        
        // Convertir a string para buscar contenido
        const content = buffer.toString();
        
        // Buscar marcadores PDF
        const hasPdfHeader = content.includes('%PDF-1.4');
        const hasEof = content.includes('%%EOF');
        const hasFactura = content.includes('FACTURA');
        const hasFirma = content.includes('FIRMA DIGITAL');
        
        console.log('\n📋 Análisis del contenido:');
        console.log(`   PDF Header (%PDF-1.4): ${hasPdfHeader ? '✅' : '❌'}`);
        console.log(`   EOF Marker (%%EOF): ${hasEof ? '✅' : '❌'}`);
        console.log(`   Contiene "FACTURA": ${hasFactura ? '✅' : '❌'}`);
        console.log(`   Contiene "FIRMA DIGITAL": ${hasFirma ? '✅' : '❌'}`);
        
        // Buscar primeros bytes
        const firstBytes = Array.from(buffer.slice(0, 20)).map(b => b.toString(16).padStart(2, '0')).join(' ');
        console.log(`\n🔢 Primeros 20 bytes: ${firstBytes}`);
        
        // Buscar estructura PDF
        const hasObj = content.includes('obj');
        const hasEndobj = content.includes('endobj');
        const hasStream = content.includes('stream');
        const hasEndstream = content.includes('endstream');
        
        console.log('\n🏗️ Estructura PDF:');
        console.log(`   Objetos (obj): ${hasObj ? '✅' : '❌'}`);
        console.log(`   Fin objetos (endobj): ${hasEndobj ? '✅' : '❌'}`);
        console.log(`   Streams: ${hasStream ? '✅' : '❌'}`);
        console.log(`   Fin streams: ${hasEndstream ? '✅' : '❌'}`);
        
        // Buscar contenido de texto
        const textMatches = content.match(/\([^)]+\)/g);
        if (textMatches) {
            console.log('\n📝 Contenido de texto encontrado:');
            textMatches.slice(0, 10).forEach((match, index) => {
                console.log(`   ${index + 1}. ${match}`);
            });
        }
        
        // Buscar información de firma
        const signatureInfo = content.match(/% FIRMA DIGITAL[\s\S]*?%%EOF/);
        if (signatureInfo) {
            console.log('\n🔐 Información de firma:');
            console.log(signatureInfo[0]);
        }
        
        return {
            isValid: hasPdfHeader && hasEof,
            hasContent: hasFactura,
            hasSignature: hasFirma,
            size: buffer.length
        };
        
    } catch (error) {
        console.error(`❌ Error analizando ${filePath}:`, error.message);
        return { isValid: false, error: error.message };
    }
}

// Analizar ambos archivos
console.log('🚀 Análisis de PDFs generados\n');

const originalResult = analyzePdf('test-fixed-pdf.pdf');
console.log('\n' + '='.repeat(50) + '\n');
const signedResult = analyzePdf('test-fixed-signed.pdf');

console.log('\n📊 Resumen:');
console.log(`   PDF Original: ${originalResult.isValid ? '✅ Válido' : '❌ Inválido'} (${originalResult.size} bytes)`);
console.log(`   PDF Firmado: ${signedResult.isValid ? '✅ Válido' : '❌ Inválido'} (${signedResult.size} bytes)`);

if (signedResult.isValid && !signedResult.hasContent) {
    console.log('\n⚠️ PROBLEMA DETECTADO:');
    console.log('   El PDF firmado es válido pero no contiene el contenido original');
    console.log('   Esto indica un problema en el servidor HTTP de AutoFirma');
} 