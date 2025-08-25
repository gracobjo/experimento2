import { useState, useEffect, useCallback } from 'react';
import { tasksService, Task, TasksStats } from '../services/tasksService';

interface UseTasksReturn {
  tasks: Task[];
  stats: TasksStats | null;
  loading: boolean;
  error: string | null;
  refreshTasks: () => Promise<void>;
  refreshStats: () => Promise<void>;
  createTask: (taskData: Partial<Task>) => Promise<void>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  changeTaskStatus: (id: string, status: Task['status']) => Promise<void>;
  assignTask: (id: string, assignedTo: string) => Promise<void>;
}

export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TasksStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Obteniendo tareas...');
      
      const fetchedTasks = await tasksService.getAllTasks();
      setTasks(fetchedTasks);
      console.log(`✅ ${fetchedTasks.length} tareas obtenidas`);
      
    } catch (err: any) {
      console.error('❌ Error obteniendo tareas:', err);
      setError(err.message || 'Error al obtener las tareas');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      console.log('🔍 Obteniendo estadísticas de tareas...');
      
      const fetchedStats = await tasksService.getTasksStats();
      setStats(fetchedStats);
      console.log('✅ Estadísticas de tareas obtenidas');
      
    } catch (err: any) {
      console.error('❌ Error obteniendo estadísticas de tareas:', err);
      // No establecer error global para estadísticas
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  const createTask = useCallback(async (taskData: Partial<Task>) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Creando nueva tarea...');
      
      const newTask = await tasksService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      console.log('✅ Tarea creada exitosamente');
      
      // Refrescar estadísticas
      await fetchStats();
      
    } catch (err: any) {
      console.error('❌ Error creando tarea:', err);
      setError(err.message || 'Error al crear la tarea');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const updateTask = useCallback(async (id: string, taskData: Partial<Task>) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Actualizando tarea ${id}...`);
      
      const updatedTask = await tasksService.updateTask(id, taskData);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      console.log('✅ Tarea actualizada exitosamente');
      
    } catch (err: any) {
      console.error('❌ Error actualizando tarea:', err);
      setError(err.message || 'Error al actualizar la tarea');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Eliminando tarea ${id}...`);
      
      await tasksService.deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      console.log('✅ Tarea eliminada exitosamente');
      
      // Refrescar estadísticas
      await fetchStats();
      
    } catch (err: any) {
      console.error('❌ Error eliminando tarea:', err);
      setError(err.message || 'Error al eliminar la tarea');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const changeTaskStatus = useCallback(async (id: string, status: Task['status']) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Cambiando estado de tarea ${id} a: ${status}`);
      
      const updatedTask = await tasksService.changeTaskStatus(id, status);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      console.log('✅ Estado de tarea cambiado exitosamente');
      
      // Refrescar estadísticas
      await fetchStats();
      
    } catch (err: any) {
      console.error('❌ Error cambiando estado de tarea:', err);
      setError(err.message || 'Error al cambiar el estado de la tarea');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchStats]);

  const assignTask = useCallback(async (id: string, assignedTo: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Asignando tarea ${id} a: ${assignedTo}`);
      
      const updatedTask = await tasksService.assignTask(id, assignedTo);
      setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
      console.log('✅ Tarea asignada exitosamente');
      
    } catch (err: any) {
      console.error('❌ Error asignando tarea:', err);
      setError(err.message || 'Error al asignar la tarea');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('🚀 Cargando datos iniciales de tareas...');
        
        // Cargar tareas y estadísticas en paralelo
        await Promise.all([
          fetchTasks(),
          fetchStats()
        ]);
        
        console.log('✅ Datos iniciales de tareas cargados');
      } catch (err) {
        console.error('❌ Error cargando datos iniciales de tareas:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchTasks, fetchStats]);

  return {
    tasks,
    stats,
    loading,
    error,
    refreshTasks,
    refreshStats,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    assignTask,
  };
};

export default useTasks;
