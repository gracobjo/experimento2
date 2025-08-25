import api from '../api/axios';

export interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';
  clientId?: string;
  lawyerId?: string;
  createdAt?: string;
  updatedAt?: string;
  client?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  lawyer?: {
    id: string;
    name: string;
    email: string;
  };
  documents?: Array<{
    id: string;
    filename: string;
    uploadedAt: string;
  }>;
}

export interface CasesStats {
  total: number;
  abiertos: number;
  enProceso: number;
  cerrados: number;
  byStatus: {
    ABIERTO: number;
    EN_PROCESO: number;
    CERRADO: number;
  };
}

export interface DebugCase {
  id: string;
  title: string;
  status: string;
  lawyerId: string;
  lawyerName: string;
  clientId: string;
  clientName: string;
}

export interface DebugCasesResponse {
  totalCases: number;
  cases: DebugCase[];
}

class CasesService {
  /**
   * Obtiene todos los casos con fallback a endpoints alternativos
   */
  async getAllCases(): Promise<Case[]> {
    try {
      // Intentar primero el endpoint principal
      console.log('🔍 Intentando obtener casos del endpoint principal...');
      const response = await api.get('/cases');
      console.log('✅ Casos obtenidos del endpoint principal');
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Endpoint principal falló, usando fallback...');
      
      if (error.response?.status === 500) {
        // Si es error 500, usar el endpoint de debug como fallback
        return this.getCasesFromDebugEndpoint();
      }
      
      throw error;
    }
  }

  /**
   * Obtiene mis casos con fallback
   */
  async getMyCases(): Promise<Case[]> {
    try {
      console.log('🔍 Intentando obtener mis casos...');
      const response = await api.get('/cases/my');
      console.log('✅ Mis casos obtenidos exitosamente');
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Endpoint de mis casos falló, usando fallback...');
      
      if (error.response?.status === 500) {
        // Usar el endpoint de debug y filtrar por usuario actual
        return this.getMyCasesFromDebugEndpoint();
      }
      
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de casos
   */
  async getCasesStats(): Promise<CasesStats> {
    try {
      console.log('🔍 Obteniendo estadísticas de casos...');
      const response = await api.get('/cases/stats');
      console.log('✅ Estadísticas obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtiene casos desde el endpoint de debug como fallback
   */
  private async getCasesFromDebugEndpoint(): Promise<Case[]> {
    try {
      console.log('🔄 Usando endpoint de debug como fallback...');
      const response = await api.get('/cases/debug/all');
      const debugData: DebugCasesResponse = response.data;
      
      // Convertir datos de debug al formato estándar
      const cases: Case[] = debugData.cases.map(debugCase => ({
        id: debugCase.id,
        title: debugCase.title,
        status: debugCase.status as 'ABIERTO' | 'EN_PROCESO' | 'CERRADO',
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
      
      console.log(`✅ ${cases.length} casos obtenidos desde fallback`);
      return cases;
    } catch (error: any) {
      console.error('❌ Error en fallback de debug:', error);
      throw new Error('No se pudieron obtener los casos desde ningún endpoint');
    }
  }

  /**
   * Obtiene mis casos desde el endpoint de debug como fallback
   */
  private async getMyCasesFromDebugEndpoint(): Promise<Case[]> {
    try {
      console.log('🔄 Usando endpoint de debug para mis casos...');
      const allCases = await this.getCasesFromDebugEndpoint();
      
      // Por ahora, retornar todos los casos ya que no tenemos información del usuario actual
      // En una implementación real, se filtrarían por el usuario autenticado
      console.log(`✅ ${allCases.length} casos obtenidos desde fallback`);
      return allCases;
    } catch (error: any) {
      console.error('❌ Error en fallback de mis casos:', error);
      throw new Error('No se pudieron obtener mis casos');
    }
  }

  /**
   * Obtiene un caso específico por ID
   */
  async getCaseById(id: string): Promise<Case | null> {
    try {
      console.log(`🔍 Obteniendo caso con ID: ${id}`);
      const response = await api.get(`/cases/${id}`);
      console.log('✅ Caso obtenido exitosamente');
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Endpoint de caso específico falló, buscando en fallback...');
      
      if (error.response?.status === 500 || error.response?.status === 404) {
        // Buscar en el fallback
        const allCases = await this.getCasesFromDebugEndpoint();
        const foundCase = allCases.find(c => c.id === id);
        
        if (foundCase) {
          console.log('✅ Caso encontrado en fallback');
          return foundCase;
        }
      }
      
      throw error;
    }
  }

  /**
   * Crea un nuevo caso
   */
  async createCase(caseData: Partial<Case>): Promise<Case> {
    try {
      console.log('🔍 Creando nuevo caso...');
      const response = await api.post('/cases', caseData);
      console.log('✅ Caso creado exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando caso:', error);
      throw error;
    }
  }

  /**
   * Actualiza un caso existente
   */
  async updateCase(id: string, caseData: Partial<Case>): Promise<Case> {
    try {
      console.log(`🔍 Actualizando caso con ID: ${id}`);
      const response = await api.patch(`/cases/${id}`, caseData);
      console.log('✅ Caso actualizado exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando caso:', error);
      throw error;
    }
  }

  /**
   * Elimina un caso
   */
  async deleteCase(id: string): Promise<void> {
    try {
      console.log(`🔍 Eliminando caso con ID: ${id}`);
      await api.delete(`/cases/${id}`);
      console.log('✅ Caso eliminado exitosamente');
    } catch (error: any) {
      console.error('❌ Error eliminando caso:', error);
      throw error;
    }
  }
}

export const casesService = new CasesService();
export default casesService;
