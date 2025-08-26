import { useState, useEffect, useCallback } from 'react';
import { documentsEmergencyService, EmergencyDocument, EmergencyDocumentsStats } from '../services/documentsEmergencyService';

interface UseDocumentsEmergencyReturn {
  documents: EmergencyDocument[];
  stats: EmergencyDocumentsStats | null;
  loading: boolean;
  error: string | null;
  isEmergencyMode: boolean;
  refreshDocuments: () => Promise<void>;
  refreshStats: () => Promise<void>;
  viewDocument: (id: string) => Promise<{ success: boolean; method: string; data?: any; error?: string }>;
  downloadDocument: (id: string) => Promise<void>;
  getDocumentStatus: (doc: EmergencyDocument) => {
    status: 'available' | 'limited' | 'unavailable';
    message: string;
    action: string;
  };
}

export const useDocumentsEmergency = (): UseDocumentsEmergencyReturn => {
  const [documents, setDocuments] = useState<EmergencyDocument[]>([]);
  const [stats, setStats] = useState<EmergencyDocumentsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, string | null] = useState(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const docs = await documentsEmergencyService.getAllDocuments();
      setDocuments(docs);
      
      // Verificar modo de emergencia
      const emergencyMode = await documentsEmergencyService.isInEmergencyMode();
      setIsEmergencyMode(emergencyMode);
      
      if (emergencyMode) {
        console.log('🚨 Modo de emergencia activado para documentos');
        console.log('⚠️ Los usuarios tienen acceso limitado a los documentos');
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al obtener documentos');
      console.error('Error fetching documents:', err);
      setIsEmergencyMode(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const documentsStats = await documentsEmergencyService.getDocumentsStats();
      setStats(documentsStats);
    } catch (err: any) {
      console.error('Error fetching documents stats:', err);
      // No establecer error aquí, las estadísticas no son críticas
    }
  }, []);

  const refreshDocuments = useCallback(async () => {
    await fetchDocuments();
  }, [fetchDocuments]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const viewDocument = useCallback(async (id: string) => {
    try {
      const result = await documentsEmergencyService.viewDocument(id);
      
      if (result.success) {
        console.log(`✅ Documento visualizado usando método: ${result.method}`);
        
        // Si es un blob, crear URL para visualización
        if (result.data instanceof Blob) {
          const url = window.URL.createObjectURL(result.data);
          window.open(url, '_blank');
          // Limpiar URL después de un tiempo
          setTimeout(() => window.URL.revokeObjectURL(url), 60000);
        }
        
        // Si es fileUrl, abrir en nueva pestaña
        if (result.method === 'fileUrl' && result.data?.fileUrl) {
          window.open(result.data.fileUrl, '_blank');
        }
      } else {
        console.log(`❌ No se pudo visualizar documento: ${result.error}`);
      }
      
      return result;
    } catch (err: any) {
      const errorResult = {
        success: false,
        method: 'none',
        error: err.message || 'Error al visualizar documento',
      };
      
      console.error('Error viewing document:', err);
      return errorResult;
    }
  }, []);

  const downloadDocument = useCallback(async (id: string) => {
    try {
      const blob = await documentsEmergencyService.downloadDocument(id);
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documento-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ Documento descargado exitosamente');
    } catch (err: any) {
      setError(err.message || 'Error al descargar documento');
      console.error('Error downloading document:', err);
      throw err;
    }
  }, []);

  const getDocumentStatus = useCallback((doc: EmergencyDocument) => {
    if (doc.canView) {
      if (doc.viewMethod === 'direct') {
        return {
          status: 'available' as const,
          message: '✅ Documento disponible para visualización',
          action: 'Ver documento',
        };
      } else if (doc.viewMethod === 'download') {
        return {
          status: 'limited' as const,
          message: '⚠️ Documento disponible para descarga',
          action: 'Descargar documento',
        };
      }
    }
    
    return {
      status: 'unavailable' as const,
      message: '🚨 Documento temporalmente no disponible',
      action: 'Migración en progreso',
    };
  }, []);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
  }, [fetchDocuments, fetchStats]);

  return {
    documents,
    stats,
    loading,
    error,
    isEmergencyMode,
    refreshDocuments,
    refreshStats,
    viewDocument,
    downloadDocument,
    getDocumentStatus,
  };
};

export default useDocumentsEmergency;
