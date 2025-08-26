import { useState, useEffect, useCallback } from 'react';
import { documentsService, Document, DocumentsStats } from '../services/documentsService';

interface UseDocumentsReturn {
  documents: Document[];
  stats: DocumentsStats | null;
  loading: boolean;
  error: string | null;
  isEmergencyMode: boolean;
  refreshDocuments: () => Promise<void>;
  refreshStats: () => Promise<void>;
  uploadDocument: (file: File, expedienteId: string, description?: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  downloadDocument: (id: string) => Promise<void>;
}

export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const docs = await documentsService.getAllDocuments();
      setDocuments(docs);
      
      // Verificar si estamos en modo de emergencia
      const emergencyMode = await documentsService.isInEmergencyMode();
      setIsEmergencyMode(emergencyMode);
      
      if (emergencyMode) {
        console.log('⚠️ Modo de emergencia activado para documentos');
        console.log('🚨 Los usuarios no pueden visualizar documentos temporalmente');
      }
      
    } catch (err: any) {
      setError(err.message || 'Error al obtener documentos');
      console.error('Error fetching documents:', err);
      
      // Si hay error 500, probablemente estamos en modo de emergencia
      if (err.response?.status === 500) {
        setIsEmergencyMode(true);
        console.log('🚨 Error 500 detectado, activando modo de emergencia');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const documentsStats = await documentsService.getDocumentsStats();
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

  const uploadDocument = useCallback(async (
    file: File, 
    expedienteId: string, 
    description?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      
      await documentsService.uploadDocument(file, expedienteId, description);
      
      // Recargar documentos y estadísticas
      await Promise.all([fetchDocuments(), fetchStats()]);
      
    } catch (err: any) {
      setError(err.message || 'Error al subir documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments, fetchStats]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await documentsService.deleteDocument(id);
      
      // Recargar documentos y estadísticas
      await Promise.all([fetchDocuments(), fetchStats()]);
      
    } catch (err: any) {
      setError(err.message || 'Error al eliminar documento');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments, fetchStats]);

  const downloadDocument = useCallback(async (id: string) => {
    try {
      const blob = await documentsService.downloadDocument(id);
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documento-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      setError(err.message || 'Error al descargar documento');
      throw err;
    }
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
    uploadDocument,
    deleteDocument,
    downloadDocument,
  };
};

export default useDocuments;
