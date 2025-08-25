import { useState, useEffect, useCallback } from 'react';
import { casesService, Case, CasesStats } from '../services/casesService';

interface UseCasesReturn {
  cases: Case[];
  stats: CasesStats | null;
  loading: boolean;
  error: string | null;
  refreshCases: () => Promise<void>;
  refreshStats: () => Promise<void>;
  createCase: (caseData: Partial<Case>) => Promise<void>;
  updateCase: (id: string, caseData: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
}

export const useCases = (): UseCasesReturn => {
  const [cases, setCases] = useState<Case[]>([]);
  const [stats, setStats] = useState<CasesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCases = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Obteniendo casos...');
      
      const fetchedCases = await casesService.getAllCases();
      setCases(fetchedCases);
      console.log(`✅ ${fetchedCases.length} casos obtenidos`);
      
    } catch (err: any) {
      console.error('❌ Error obteniendo casos:', err);
      setError(err.message || 'Error al obtener los casos');
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      console.log('🔍 Obteniendo estadísticas...');
      
      const fetchedStats = await casesService.getCasesStats();
      setStats(fetchedStats);
      console.log('✅ Estadísticas obtenidas');
      
    } catch (err: any) {
      console.error('❌ Error obteniendo estadísticas:', err);
      // No establecer error global para estadísticas
    }
  }, []);

  const refreshCases = useCallback(async () => {
    await fetchCases();
  }, [fetchCases]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const createCase = useCallback(async (caseData: Partial<Case>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Creando nuevo caso...');
      
      const newCase = await casesService.createCase(caseData);
      setCases(prev => [newCase, ...prev]);
      console.log('✅ Caso creado exitosamente');
      
      // Refrescar estadísticas
      await fetchStats();
      
    } catch (err: any) {
      console.error('❌ Error creando caso:', err);
      setError(err.message || 'Error al crear el caso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const updateCase = useCallback(async (id: string, caseData: Partial<Case>) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Actualizando caso ${id}...`);
      
      const updatedCase = await casesService.updateCase(id, caseData);
      setCases(prev => prev.map(c => c.id === id ? updatedCase : c));
      console.log('✅ Caso actualizado exitosamente');
      
    } catch (err: any) {
      console.error('❌ Error actualizando caso:', err);
      setError(err.message || 'Error al actualizar el caso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCase = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Eliminando caso ${id}...`);
      
      await casesService.deleteCase(id);
      setCases(prev => prev.filter(c => c.id !== id));
      console.log('✅ Caso eliminado exitosamente');
      
      // Refrescar estadísticas
      await fetchStats();
      
    } catch (err: any) {
      console.error('❌ Error eliminando caso:', err);
      setError(err.message || 'Error al eliminar el caso');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Cargando datos iniciales...');
        
        // Cargar casos y estadísticas en paralelo
        await Promise.all([
          fetchCases(),
          fetchStats()
        ]);
        
        console.log('✅ Datos iniciales cargados');
      } catch (err) {
        console.error('❌ Error cargando datos iniciales:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchCases, fetchStats]);

  return {
    cases,
    stats,
    loading,
    error,
    refreshCases,
    refreshStats,
    createCase,
    updateCase,
    deleteCase,
  };
};

export default useCases;
