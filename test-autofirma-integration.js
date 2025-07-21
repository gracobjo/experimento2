const axios = require('axios');

// Configuración
const BACKEND_URL = 'http://localhost:3000/api';
const AUTOFIRMA_URL = 'http://127.0.0.1:8080';

// Colores para consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testAutoFirmaIntegration() {
  log('🧪 Iniciando pruebas de integración AutoFirma', 'bold');
  log('==============================================', 'blue');
  
  let token = null;
  let testInvoiceId = null;

  try {
    // 1. Verificar que AutoFirma esté ejecutándose
    log('\n1️⃣ Verificando estado de AutoFirma...', 'blue');
    try {
      const autofirmaResponse = await axios.get(`${AUTOFIRMA_URL}/status`, {
        timeout: 5000
      });
      
      const autofirmaData = autofirmaResponse.data;
      
      if (autofirmaData.status === 'running' && autofirmaData.autofirma?.available) {
        log('✅ AutoFirma está disponible y funcionando', 'green');
        log(`   Versión: ${autofirmaData.version}`, 'green');
        log(`   Endpoints disponibles: ${autofirmaData.endpoints.length}`, 'green');
        
        // Mostrar detalles de instalación y ejecución
        if (autofirmaData.autofirma.installation) {
          log(`   📦 Instalación: ${autofirmaData.autofirma.installation.installed ? '✅ Instalado' : '❌ No instalado'}`, 'green');
          if (autofirmaData.autofirma.installation.installed && autofirmaData.autofirma.installation.path) {
            log(`      Ubicación: ${autofirmaData.autofirma.installation.path}`, 'green');
          }
        }
        
        if (autofirmaData.autofirma.runningInfo) {
          log(`   🔄 Ejecución: ${autofirmaData.autofirma.runningInfo.running ? '✅ Ejecutándose' : '❌ No ejecutándose'}`, 'green');
          if (autofirmaData.autofirma.runningInfo.running && autofirmaData.autofirma.runningInfo.pid) {
            log(`      PID: ${autofirmaData.autofirma.runningInfo.pid}`, 'green');
          }
        }
      } else {
        log('❌ AutoFirma no está disponible correctamente', 'red');
        
        if (autofirmaData.autofirma) {
          if (!autofirmaData.autofirma.installed) {
            log('   📦 AutoFirma no está instalado', 'red');
            if (autofirmaData.autofirma.installation) {
              log(`      ${autofirmaData.autofirma.installation.message}`, 'red');
            }
          }
          
          if (!autofirmaData.autofirma.running) {
            log('   🔄 AutoFirma no está ejecutándose', 'red');
            if (autofirmaData.autofirma.runningInfo) {
              log(`      ${autofirmaData.autofirma.runningInfo.message}`, 'red');
            }
          }
        }
        
        log('\n⚠️  INSTRUCCIONES:', 'yellow');
        log('   1. Descarga AutoFirma desde: https://firmaelectronica.gob.es/Home/Descargas.html', 'yellow');
        log('   2. Instala AutoFirma en tu sistema', 'yellow');
        log('   3. Abre AutoFirma manualmente', 'yellow');
        log('   4. Asegúrate de que esté ejecutándose en segundo plano', 'yellow');
        log('   5. Verifica el estado con: curl http://127.0.0.1:8080/status', 'yellow');
        
        return;
      }
    } catch (error) {
      log('❌ No se puede conectar con AutoFirma HTTP Server', 'red');
      log('   Asegúrate de ejecutar: node autofirma-http-server.js', 'yellow');
      return;
    }

    // 2. Login como abogado
    log('\n2️⃣ Iniciando sesión como abogado...', 'blue');
    try {
      const loginResponse = await axios.post(`${BACKEND_URL}/auth/login`, {
        email: 'lawyer1@example.com',
        password: 'password123'
      });
      
      token = loginResponse.data.token;
      log('✅ Login exitoso', 'green');
      log(`   Usuario: ${loginResponse.data.user.name}`, 'green');
      log(`   Rol: ${loginResponse.data.user.role}`, 'green');
    } catch (error) {
      log('❌ Error en login', 'red');
      log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 3. Obtener facturas
    log('\n3️⃣ Obteniendo facturas...', 'blue');
    try {
      const invoicesResponse = await axios.get(`${BACKEND_URL}/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const invoices = invoicesResponse.data;
      log(`✅ Encontradas ${invoices.length} facturas`, 'green');
      
      if (invoices.length === 0) {
        log('❌ No hay facturas para probar', 'red');
        log('   Crea una factura primero', 'yellow');
        return;
      }
      
      testInvoiceId = invoices[0].id;
      log(`   Usando factura: ${invoices[0].numeroFactura || testInvoiceId}`, 'green');
    } catch (error) {
      log('❌ Error obteniendo facturas', 'red');
      log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 4. Verificar estado de AutoFirma desde el backend
    log('\n4️⃣ Verificando estado de AutoFirma desde backend...', 'blue');
    try {
      const statusResponse = await axios.get(`${BACKEND_URL}/invoices/autofirma/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (statusResponse.data.available) {
        log('✅ Backend puede conectar con AutoFirma', 'green');
        log(`   Estado: ${statusResponse.data.status}`, 'green');
        log(`   Mensaje: ${statusResponse.data.message}`, 'green');
      } else {
        log('❌ Backend no puede conectar con AutoFirma', 'red');
        log(`   Estado: ${statusResponse.data.status}`, 'red');
        log(`   Mensaje: ${statusResponse.data.message}`, 'red');
        return;
      }
    } catch (error) {
      log('❌ Error verificando estado desde backend', 'red');
      log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 5. Probar firma digital
    log('\n5️⃣ Probando firma digital...', 'blue');
    try {
      const signResponse = await axios.post(`${BACKEND_URL}/invoices/${testInvoiceId}/sign-pdf`, {
        certificateType: 'FNMT'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (signResponse.data.success) {
        log('✅ Firma digital exitosa', 'green');
        log(`   Firmante: ${signResponse.data.signatureInfo.signer}`, 'green');
        log(`   Certificado: ${signResponse.data.signatureInfo.certificate}`, 'green');
        log(`   Algoritmo: ${signResponse.data.signatureInfo.signatureAlgorithm}`, 'green');
        log(`   Timestamp: ${signResponse.data.signatureInfo.timestamp}`, 'green');
        log(`   URL descarga: ${signResponse.data.downloadUrl}`, 'green');
      } else {
        log('❌ Firma digital falló', 'red');
        log(`   Error: ${signResponse.data.error}`, 'red');
        return;
      }
    } catch (error) {
      log('❌ Error en firma digital', 'red');
      log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 6. Probar descarga de PDF firmado
    log('\n6️⃣ Probando descarga de PDF firmado...', 'blue');
    try {
      const downloadResponse = await axios.get(`${BACKEND_URL}/invoices/${testInvoiceId}/signed-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'arraybuffer'
      });
      
      const pdfBuffer = Buffer.from(downloadResponse.data);
      log(`✅ PDF firmado descargado correctamente`, 'green');
      log(`   Tamaño: ${pdfBuffer.length} bytes`, 'green');
      log(`   Content-Type: ${downloadResponse.headers['content-type']}`, 'green');
      
      // Verificar que es un PDF válido
      const isPdf = pdfBuffer.slice(0, 4).toString() === '%PDF';
      if (isPdf) {
        log('✅ El archivo es un PDF válido', 'green');
      } else {
        log('⚠️ El archivo no parece ser un PDF válido', 'yellow');
      }
    } catch (error) {
      log('❌ Error descargando PDF firmado', 'red');
      log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
      return;
    }

    // 7. Probar firma directa con AutoFirma
    log('\n7️⃣ Probando firma directa con AutoFirma...', 'blue');
    try {
      const testPdfContent = Buffer.from('Test PDF content for signature').toString('base64');
      
      const directSignResponse = await axios.post(`${AUTOFIRMA_URL}/afirma-sign-pdf`, {
        fileName: 'test_invoice.pdf',
        fileContent: testPdfContent,
        fileSize: testPdfContent.length,
        certificateType: 'FNMT',
        userId: 'test-user',
        invoiceId: testInvoiceId,
        timestamp: new Date().toISOString()
      });
      
      if (directSignResponse.data.success) {
        log('✅ Firma directa con AutoFirma exitosa', 'green');
        log(`   Signature ID: ${directSignResponse.data.signedPdf.signatureId}`, 'green');
        log(`   Timestamp: ${directSignResponse.data.signedPdf.timestamp}`, 'green');
      } else {
        log('❌ Firma directa con AutoFirma falló', 'red');
        log(`   Error: ${directSignResponse.data.error}`, 'red');
      }
    } catch (error) {
      log('❌ Error en firma directa con AutoFirma', 'red');
      log(`   Error: ${error.response?.data?.message || error.message}`, 'red');
    }

    // Resumen final
    log('\n🎉 Pruebas completadas exitosamente', 'bold');
    log('====================================', 'green');
    log('✅ AutoFirma HTTP Server funcionando', 'green');
    log('✅ Backend conectado correctamente', 'green');
    log('✅ Autenticación funcionando', 'green');
    log('✅ Firma digital operativa', 'green');
    log('✅ Descarga de PDFs funcionando', 'green');
    log('\n🚀 La integración está lista para usar', 'bold');

  } catch (error) {
    log('\n💥 Error general en las pruebas', 'red');
    log(`   Error: ${error.message}`, 'red');
    if (error.response) {
      log(`   Status: ${error.response.status}`, 'red');
      log(`   Data: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
  }
}

// Ejecutar pruebas
if (require.main === module) {
  testAutoFirmaIntegration();
}

module.exports = { testAutoFirmaIntegration }; 