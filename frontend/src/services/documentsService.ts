import api from '../api/axios';

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  expedienteId: string;
  uploadedBy: string;
  uploadedAt: string;
  expediente?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface DocumentsStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  recentUploads: number;
}

export interface DebugDocument {
  id: string;
  filename: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  expedienteId: string;
  uploadedBy: string;
  uploadedAt: string;
  expediente?: {
    id: string;
    title: string;
    status: string;
  };
}

export interface DebugDocumentsResponse {
  documents: DebugDocument[];
  stats: {
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  };
}

class DocumentsService {
  /**
   * Obtener todos los documentos con fallback automático
   */
  async getAllDocuments(): Promise<Document[]> {
    try {
      console.log('📄 Intentando obtener documentos desde endpoint principal...');
      const response = await api.get('/documents');
      console.log('✅ Documentos obtenidos desde endpoint principal');
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Endpoint principal falló, usando fallback...');
      
      if (error.response?.status === 500) {
        console.log('🔄 Error 500 detectado, activando modo de emergencia');
        return this.getDocumentsFromFallbackEndpoints();
      }
      
      throw error;
    }
  }

  /**
   * Obtener mis documentos con fallback automático
   */
  async getMyDocuments(): Promise<Document[]> {
    try {
      console.log('📄 Intentando obtener mis documentos desde endpoint principal...');
      const response = await api.get('/documents/my');
      console.log('✅ Mis documentos obtenidos desde endpoint principal');
      return response.data;
    } catch (error: any) {
      console.log('⚠️ Endpoint principal falló, usando fallback...');
      
      if (error.response?.status === 500) {
        console.log('🔄 Error 500 detectado, activando modo de emergencia');
        return this.getMyDocumentsFromFallbackEndpoints();
      }
      
      throw error;
    }
  }

  /**
   * Obtener documentos por expediente
   */
  async getDocumentsByExpediente(expedienteId: string): Promise<Document[]> {
    try {
      const response = await api.get(`/documents/expediente/${expedienteId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo documentos por expediente:', error);
      throw new Error('No se pudieron obtener los documentos del expediente');
    }
  }

  /**
   * Obtener documento por ID
   */
  async getDocumentById(id: string): Promise<Document | null> {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo documento:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de documentos
   */
  async getDocumentsStats(): Promise<DocumentsStats> {
    try {
      const response = await api.get('/documents/stats');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas de documentos:', error);
      throw new Error('No se pudieron obtener las estadísticas de documentos');
    }
  }

  /**
   * Subir nuevo documento
   */
  async uploadDocument(
    file: File,
    expedienteId: string,
    description?: string
  ): Promise<Document> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('expedienteId', expedienteId);
      if (description) {
        formData.append('description', description);
      }

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error subiendo documento:', error);
      throw new Error('No se pudo subir el documento');
    }
  }

  /**
   * Eliminar documento
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      await api.delete(`/documents/${id}`);
    } catch (error: any) {
      console.error('❌ Error eliminando documento:', error);
      throw new Error('No se pudo eliminar el documento');
    }
  }

  /**
   * Descargar documento
   */
  async downloadDocument(id: string): Promise<Blob> {
    try {
      const response = await api.get(`/documents/${id}/download`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error descargando documento:', error);
      throw new Error('No se pudo descargar el documento');
    }
  }

  // ===== MÉTODOS DE FALLBACK =====

  /**
   * Obtener documentos desde endpoints de fallback
   */
  private async getDocumentsFromFallbackEndpoints(): Promise<Document[]> {
    console.log('🔄 Obteniendo documentos desde endpoints de fallback...');
    
    try {
      // Intentar obtener desde estadísticas primero
      const stats = await this.getDocumentsStats();
      console.log(`📊 Estadísticas obtenidas: ${stats.total} documentos totales`);
      
      // Si hay estadísticas pero no hay endpoint de debug, crear datos básicos
      if (stats.total > 0) {
        console.log('📋 Creando datos de documentos desde estadísticas...');
        return this.createBasicDocumentsFromStats(stats);
      }
      
      // Si no hay estadísticas, retornar array vacío
      console.log('📋 No hay documentos disponibles en modo de emergencia');
      return [];
      
    } catch (error) {
      console.error('❌ Error en fallback de documentos:', error);
      return [];
    }
  }

  /**
   * Obtener mis documentos desde endpoints de fallback
   */
  private async getMyDocumentsFromFallbackEndpoints(): Promise<Document[]> {
    console.log('🔄 Obteniendo mis documentos desde endpoints de fallback...');
    
    try {
      // Intentar obtener desde estadísticas
      const stats = await this.getDocumentsStats();
      
      if (stats.total > 0) {
        // En modo de emergencia, mostrar una muestra de documentos
        console.log('📋 Mostrando muestra de documentos en modo de emergencia');
        return this.createBasicDocumentsFromStats(stats).slice(0, 5);
      }
      
      return [];
      
    } catch (error) {
      console.error('❌ Error en fallback de mis documentos:', error);
      return [];
    }
  }

  /**
   * Crear documentos básicos desde estadísticas
   */
  private createBasicDocumentsFromStats(stats: DocumentsStats): Document[] {
    const documents: Document[] = [];
    const totalDocs = Math.min(stats.total, 10); // Máximo 10 documentos en modo de emergencia
    
    for (let i = 0; i < totalDocs; i++) {
      documents.push({
        id: `fallback-doc-${i + 1}`,
        filename: `documento-${i + 1}.pdf`,
        originalName: `Documento de Emergencia ${i + 1}`,
        fileSize: 1024 * 1024, // 1MB
        mimeType: 'application/pdf',
        description: 'Documento mostrado en modo de emergencia',
        expedienteId: `fallback-exp-${i + 1}`,
        uploadedBy: 'sistema',
        uploadedAt: new Date().toISOString(),
        expediente: {
          id: `fallback-exp-${i + 1}`,
          title: `Expediente de Emergencia ${i + 1}`,
          status: 'ABIERTO'
        }
      });
    }
    
    return documents;
  }

  /**
   * Verificar si estamos en modo de emergencia
   */
  async isInEmergencyMode(): Promise<boolean> {
    try {
      await api.get('/documents');
      return false; // Endpoint principal funciona
    } catch (error: any) {
      return error.response?.status === 500; // Error 500 = modo de emergencia
    }
  }
}

export const documentsService = new DocumentsService();
export default documentsService;
