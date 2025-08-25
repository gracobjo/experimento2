import api from '../api/axios';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADA' | 'CANCELADA';
  priority: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  dueDate?: string;
  assignedTo?: string;
  expedienteId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TasksStats {
  total: number;
  pendientes: number;
  enProgreso: number;
  completadas: number;
  canceladas: number;
  byPriority: {
    BAJA: number;
    MEDIA: number;
    ALTA: number;
    URGENTE: number;
  };
}

class TasksService {
  /**
   * Obtiene todas las tareas
   */
  async getAllTasks(status?: string): Promise<Task[]> {
    try {
      console.log('🔍 Obteniendo todas las tareas...');
      const params = status ? { status } : {};
      const response = await api.get('/tasks', { params });
      console.log('✅ Tareas obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo tareas:', error);
      throw error;
    }
  }

  /**
   * Obtiene mis tareas
   */
  async getMyTasks(): Promise<Task[]> {
    try {
      console.log('🔍 Obteniendo mis tareas...');
      const response = await api.get('/tasks/my');
      console.log('✅ Mis tareas obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo mis tareas:', error);
      throw error;
    }
  }

  /**
   * Obtiene una tarea por ID
   */
  async getTaskById(id: string): Promise<Task | null> {
    try {
      console.log(`🔍 Obteniendo tarea con ID: ${id}`);
      const response = await api.get(`/tasks/${id}`);
      console.log('✅ Tarea obtenida exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo tarea:', error);
      throw error;
    }
  }

  /**
   * Crea una nueva tarea
   */
  async createTask(taskData: Partial<Task>): Promise<Task> {
    try {
      console.log('🔍 Creando nueva tarea...');
      const response = await api.post('/tasks', taskData);
      console.log('✅ Tarea creada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando tarea:', error);
      throw error;
    }
  }

  /**
   * Actualiza una tarea existente
   */
  async updateTask(id: string, taskData: Partial<Task>): Promise<Task> {
    try {
      console.log(`🔍 Actualizando tarea con ID: ${id}`);
      const response = await api.patch(`/tasks/${id}`, taskData);
      console.log('✅ Tarea actualizada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error actualizando tarea:', error);
      throw error;
    }
  }

  /**
   * Elimina una tarea
   */
  async deleteTask(id: string): Promise<void> {
    try {
      console.log(`🔍 Eliminando tarea con ID: ${id}`);
      await api.delete(`/tasks/${id}`);
      console.log('✅ Tarea eliminada exitosamente');
    } catch (error: any) {
      console.error('❌ Error eliminando tarea:', error);
      throw error;
    }
  }

  /**
   * Cambia el estado de una tarea
   */
  async changeTaskStatus(id: string, status: Task['status']): Promise<Task> {
    try {
      console.log(`🔍 Cambiando estado de tarea ${id} a: ${status}`);
      const response = await api.patch(`/tasks/${id}`, { status });
      console.log('✅ Estado de tarea cambiado exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error cambiando estado de tarea:', error);
      throw error;
    }
  }

  /**
   * Asigna una tarea a un usuario
   */
  async assignTask(id: string, assignedTo: string): Promise<Task> {
    try {
      console.log(`🔍 Asignando tarea ${id} a: ${assignedTo}`);
      const response = await api.patch(`/tasks/${id}`, { assignedTo });
      console.log('✅ Tarea asignada exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error asignando tarea:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de tareas
   */
  async getTasksStats(): Promise<TasksStats> {
    try {
      console.log('🔍 Obteniendo estadísticas de tareas...');
      const response = await api.get('/tasks/stats');
      console.log('✅ Estadísticas de tareas obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas de tareas:', error);
      throw error;
    }
  }

  /**
   * Obtiene tareas por expediente
   */
  async getTasksByExpediente(expedienteId: string): Promise<Task[]> {
    try {
      console.log(`🔍 Obteniendo tareas del expediente: ${expedienteId}`);
      const response = await api.get(`/tasks/expediente/${expedienteId}`);
      console.log('✅ Tareas del expediente obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo tareas del expediente:', error);
      throw error;
    }
  }

  /**
   * Obtiene tareas vencidas
   */
  async getOverdueTasks(): Promise<Task[]> {
    try {
      console.log('🔍 Obteniendo tareas vencidas...');
      const response = await api.get('/tasks/overdue');
      console.log('✅ Tareas vencidas obtenidas exitosamente');
      return response.data;
    } catch (error: any) {
      console.error('❌ Error obteniendo tareas vencidas:', error);
      throw error;
    }
  }
}

export const tasksService = new TasksService();
export default tasksService;
