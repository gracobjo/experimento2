import api from '../api/axios';

export const testApiConnectivity = async () => {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[]
  };

  // Test 1: Verificar configuración de la API
  try {
    console.log('[API Test] Configuración de la API:');
    console.log('[API Test] Base URL:', api.defaults.baseURL);
    console.log('[API Test] Headers por defecto:', api.defaults.headers);
    
    results.tests.push({
      name: 'Configuración de la API',
      status: 'success',
      details: {
        baseURL: api.defaults.baseURL,
        headers: api.defaults.headers
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Configuración de la API',
      status: 'error',
      error: error
    });
  }

  // Test 2: Verificar token de autenticación
  try {
    const token = localStorage.getItem('token');
    console.log('[API Test] Token de autenticación:', token ? 'Presente' : 'Ausente');
    
    results.tests.push({
      name: 'Token de autenticación',
      status: 'success',
      details: {
        tokenPresent: !!token,
        tokenLength: token ? token.length : 0
      }
    });
  } catch (error) {
    results.tests.push({
      name: 'Token de autenticación',
      status: 'error',
      error: error
    });
  }

  // Test 3: Probar endpoint de health check
  try {
    console.log('[API Test] Probando endpoint de health check...');
    const healthResponse = await api.get('/health');
    console.log('[API Test] Health check response:', healthResponse.data);
    
    results.tests.push({
      name: 'Health Check',
      status: 'success',
      details: {
        status: healthResponse.status,
        data: healthResponse.data
      }
    });
  } catch (error: any) {
    console.error('[API Test] Health check failed:', error);
    results.tests.push({
      name: 'Health Check',
      status: 'error',
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }

  // Test 4: Probar endpoint de autenticación (solo si hay token)
  try {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[API Test] Probando endpoint de autenticación...');
      const authResponse = await api.get('/auth/me');
      console.log('[API Test] Auth response:', authResponse.data);
      
      results.tests.push({
        name: 'Autenticación',
        status: 'success',
        details: {
          status: authResponse.status,
          user: authResponse.data
        }
      });
    } else {
      results.tests.push({
        name: 'Autenticación',
        status: 'skipped',
        details: 'No hay token disponible'
      });
    }
  } catch (error: any) {
    console.error('[API Test] Auth test failed:', error);
    results.tests.push({
      name: 'Autenticación',
      status: 'error',
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }

  // Test 5: Probar endpoint de appointments (solo si hay token)
  try {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('[API Test] Probando endpoint de appointments...');
      const appointmentsResponse = await api.get('/appointments');
      console.log('[API Test] Appointments response:', appointmentsResponse.data);
      
      results.tests.push({
        name: 'Appointments',
        status: 'success',
        details: {
          status: appointmentsResponse.status,
          count: appointmentsResponse.data?.length || 0,
          data: appointmentsResponse.data
        }
      });
    } else {
      results.tests.push({
        name: 'Appointments',
        status: 'skipped',
        details: 'No hay token disponible'
      });
    }
  } catch (error: any) {
    console.error('[API Test] Appointments test failed:', error);
    results.tests.push({
      name: 'Appointments',
      status: 'error',
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      }
    });
  }

  console.log('[API Test] Resultados completos:', results);
  return results;
};

export const logApiInfo = () => {
  console.log('=== INFORMACIÓN DE LA API ===');
  console.log('Base URL:', api.defaults.baseURL);
  console.log('Headers por defecto:', api.defaults.headers);
  console.log('Token presente:', !!localStorage.getItem('token'));
  console.log('=============================');
};
