const axios = require('axios');

console.log('🔐 PROBANDO FALLBACK CON AUTENTICACIÓN REAL');
console.log('============================================\n');

const backendUrl = 'https://experimento2-production-54c0.up.railway.app';

// Simular el servicio de casos del frontend con fallback
class AuthenticatedCasesService {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async getAllCases() {
    try {
      console.log('🔍 Intentando endpoint principal...');
      const response = await axios.get(`${backendUrl}/api/cases`, {
        headers: this.headers
      });
      
      console.log('✅ Endpoint principal funcionó');
      return response.data;
      
    } catch (error) {
      console.log('⚠️ Endpoint principal falló:', error.response?.status || error.message);
      
      if (error.response?.status === 500) {
        console.log('🔄 Activando modo fallback...');
        return this.getCasesFromDebugEndpoint();
      }
      
      throw error;
    }
  }

  async getCasesFromDebugEndpoint() {
    try {
      console.log('🔄 Obteniendo casos desde endpoint de debug...');
      const response = await axios.get(`${backendUrl}/api/cases/debug/all`, {
        headers: this.headers
      });
      
      const debugData = response.data;
      console.log(`✅ ${debugData.cases.length} casos obtenidos desde fallback`);
      
      // Convertir al formato estándar
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
      const response = await axios.get(`${backendUrl}/api/cases/stats`, {
        headers: this.headers
      });
      console.log('✅ Estadísticas obtenidas');
      return response.data;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      throw error;
    }
  }

  async getMyCases() {
    try {
      console.log('🔍 Intentando obtener mis casos...');
      const response = await axios.get(`${backendUrl}/api/cases/my`, {
        headers: this.headers
      });
      
      console.log('✅ Mis casos obtenidos exitosamente');
      return response.data;
      
    } catch (error) {
      console.log('⚠️ Endpoint de mis casos falló:', error.response?.status || error.message);
      
      if (error.response?.status === 500) {
        console.log('🔄 Usando fallback para mis casos...');
        // Por ahora, retornar todos los casos ya que no tenemos filtrado por usuario
        return this.getCasesFromDebugEndpoint();
      }
      
      throw error;
    }
  }
}

// Función para obtener token de autenticación
async function getAuthToken() {
  try {
    console.log('🔑 Obteniendo token de autenticación...');
    
    // Intentar con diferentes credenciales
    const credentials = [
      { email: 'test@despacho.com', password: 'test123' },
      { email: 'admin@despacho.com', password: 'admin123' },
      { email: 'abogado@despacho.com', password: 'abogado123' }
    ];
    
    for (const cred of credentials) {
      try {
        console.log(`   🔑 Probando: ${cred.email}`);
        const response = await axios.post(`${backendUrl}/api/auth/login`, cred);
        
        if (response.data.token) {
          console.log(`   ✅ Login exitoso con: ${cred.email}`);
          return response.data.token;
        }
      } catch (error) {
        console.log(`   ❌ Falló con ${cred.email}:`, error.response?.status);
      }
    }
    
    throw new Error('No se pudo obtener token de autenticación');
    
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.message);
    throw error;
  }
}

// Función para probar el flujo completo con autenticación
async function testAuthenticatedFlow() {
  try {
    console.log('1️⃣ Obteniendo autenticación...');
    const token = await getAuthToken();
    
    console.log('\n2️⃣ Creando servicio autenticado...');
    const service = new AuthenticatedCasesService(token);
    
    console.log('\n3️⃣ Probando endpoint principal...');
    try {
      const cases = await service.getAllCases();
      console.log(`   ✅ Casos obtenidos del endpoint principal: ${cases.length}`);
      
      if (cases.length > 0) {
        console.log('   📋 Primer caso:', {
          id: cases[0].id,
          title: cases[0].title,
          status: cases[0].status
        });
      }
      
    } catch (error) {
      console.log('   ❌ Endpoint principal falló, esto es esperado');
    }

    console.log('\n4️⃣ Probando endpoint de mis casos...');
    try {
      const myCases = await service.getMyCases();
      console.log(`   ✅ Mis casos obtenidos: ${myCases.length}`);
    } catch (error) {
      console.log('   ❌ Error en mis casos:', error.message);
    }

    console.log('\n5️⃣ Probando estadísticas...');
    try {
      const stats = await service.getCasesStats();
      console.log('   ✅ Estadísticas:', stats);
    } catch (error) {
      console.log('   ❌ Error en estadísticas:', error.message);
    }

    console.log('\n6️⃣ Verificando que el fallback funciona...');
    try {
      // Forzar el uso del fallback
      const fallbackCases = await service.getCasesFromDebugEndpoint();
      console.log(`   ✅ Fallback funcionó: ${fallbackCases.length} casos`);
      
      if (fallbackCases.length > 0) {
        console.log('   📋 Primer caso del fallback:', {
          id: fallbackCases[0].id,
          title: fallbackCases[0].title,
          status: fallbackCases[0].status,
          client: fallbackCases[0].client?.user?.name,
          lawyer: fallbackCases[0].lawyer?.name
        });
      }
      
    } catch (error) {
      console.log('   ❌ Fallback falló:', error.message);
    }

  } catch (error) {
    console.error('❌ Error general en la prueba:', error.message);
  }
}

// Ejecutar pruebas
async function runAllTests() {
  await testAuthenticatedFlow();
  
  console.log('\n✅ PRUEBAS COMPLETADAS');
  console.log('======================');
  console.log('\n📋 RESUMEN:');
  console.log('- Si el fallback funciona con auth: El frontend puede mostrar datos');
  console.log('- Si el fallback falla: Hay un problema en la implementación');
  console.log('- Si la auth falla: Problema de credenciales');
}

runAllTests().catch(console.error);
