const axios = require('axios');

console.log('🧪 PROBANDO SISTEMA DE FALLBACK DEL FRONTEND');
console.log('==============================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Simular el comportamiento del servicio de casos del frontend
class MockCasesService {
  constructor() {
    this.useFallback = false;
  }

  async getAllCases() {
    try {
      if (this.useFallback) {
        throw new Error('Simulando error 500');
      }

      console.log('🔍 Intentando endpoint principal...');
      const response = await axios.get(`${backendUrl}/api/cases`, {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Endpoint principal funcionó');
      return response.data;
      
    } catch (error) {
      console.log('⚠️ Endpoint principal falló:', error.response?.status || error.message);
      
      if (error.response?.status === 500) {
        console.log('🔄 Activando modo fallback...');
        this.useFallback = true;
        return this.getCasesFromDebugEndpoint();
      }
      
      throw error;
    }
  }

  async getCasesFromDebugEndpoint() {
    try {
      console.log('🔄 Obteniendo casos desde endpoint de debug...');
      const response = await axios.get(`${backendUrl}/api/cases/debug/all`);
      
      const debugData = response.data;
      console.log(`✅ ${debugData.cases.length} casos obtenidos desde fallback`);
      
      // Convertir al formato estándar (simulando el frontend)
      const cases = debugData.cases.map(debugCase => ({
        id: debugCase.id,
        title: debugCase.title,
        status: debugCase.status,
        lawyerId: debugCase.lawyerId,
        clientId: debugCase.clientId,
        client: {
          id: debugCase.clientId,
          user: {
            id: debugCase.clientId,
            name: debugCase.clientName,
            email: `${debugCase.clientName.toLowerCase().replace(/\s+/g, '.')}@cliente.com`
          }
        },
        lawyer: {
          id: debugCase.lawyerId,
          name: debugCase.lawyerName,
          email: `${debugCase.lawyerName.toLowerCase().replace(/\s+/g, '.')}@abogado.com`
        },
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      return cases;
      
    } catch (error) {
      console.error('❌ Error en fallback:', error.message);
      throw new Error('No se pudieron obtener los casos desde ningún endpoint');
    }
  }

  async getCasesStats() {
    try {
      console.log('🔍 Obteniendo estadísticas...');
      const response = await axios.get(`${backendUrl}/api/cases/stats`);
      console.log('✅ Estadísticas obtenidas');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      throw error;
    }
  }
}

// Función para probar el flujo completo
async function testFallbackFlow() {
  try {
    console.log('1️⃣ Probando flujo normal (sin fallback)...');
    const service = new MockCasesService();
    
    try {
      const cases = await service.getAllCases();
      console.log(`   ✅ Casos obtenidos: ${cases.length}`);
      
      if (cases.length > 0) {
        console.log('   📋 Primer caso:', {
          id: cases[0].id,
          title: cases[0].title,
          status: cases[0].status,
          client: cases[0].client?.user?.name,
          lawyer: cases[0].lawyer?.name
        });
      }
      
    } catch (error) {
      console.log('   ❌ Error esperado en endpoint principal');
    }

    console.log('\n2️⃣ Probando flujo con fallback...');
    const fallbackService = new MockCasesService();
    fallbackService.useFallback = true;
    
    try {
      const cases = await fallbackService.getAllCases();
      console.log(`   ✅ Casos obtenidos desde fallback: ${cases.length}`);
      
      if (cases.length > 0) {
        console.log('   📋 Primer caso desde fallback:', {
          id: cases[0].id,
          title: cases[0].title,
          status: cases[0].status,
          client: cases[0].client?.user?.name,
          lawyer: cases[0].lawyer?.name
        });
      }
      
    } catch (error) {
      console.log('   ❌ Error en fallback:', error.message);
    }

    console.log('\n3️⃣ Probando estadísticas...');
    try {
      const stats = await service.getCasesStats();
      console.log('   ✅ Estadísticas:', stats);
    } catch (error) {
      console.log('   ❌ Error en estadísticas:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general en la prueba:', error.message);
  }
}

// Función para verificar la conectividad
async function checkConnectivity() {
  console.log('\n🔍 VERIFICANDO CONECTIVIDAD');
  console.log('============================\n');
  
  try {
    // Verificar health check
    const healthResponse = await axios.get(`${backendUrl}/health`);
    console.log('✅ Health check:', healthResponse.status);
    
    // Verificar base de datos
    const dbResponse = await axios.get(`${backendUrl}/db-status`);
    console.log('✅ Base de datos:', dbResponse.data.connected ? 'Conectada' : 'Desconectada');
    
    if (dbResponse.data.tables) {
      console.log(`📋 Tablas disponibles: ${dbResponse.data.tables.length}`);
    }
    
  } catch (error) {
    console.log('❌ Error de conectividad:', error.message);
  }
}

// Ejecutar pruebas
async function runAllTests() {
  await checkConnectivity();
  await testFallbackFlow();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('======================');
  console.log('\n📋 RESUMEN:');
  console.log('- Si el fallback funciona: El frontend puede mostrar datos');
  console.log('- Si ambos fallan: Problema de conectividad general');
  console.log('- Si solo el principal falla: El fallback es necesario');
}

runAllTests().catch(console.error);
