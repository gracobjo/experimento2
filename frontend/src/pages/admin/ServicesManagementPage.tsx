import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  orden: number;
}

const ServicesManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '⚖️',
    orden: 0
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parametros/services`);
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        throw new Error('Error al cargar los servicios');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Error al cargar los servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingService 
        ? `${(import.meta as any).env.VITE_API_URL}/api/parametros/services/${editingService.id}`
        : `${(import.meta as any).env.VITE_API_URL}/api/parametros/services`;
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchServices();
        setEditingService(null);
        setShowAddForm(false);
        setFormData({ title: '', description: '', icon: '⚖️', orden: 0 });
      } else {
        throw new Error('Error al guardar el servicio');
      }
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Error al guardar el servicio');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      orden: service.orden
    });
    setShowAddForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      return;
    }

    try {
              const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parametros/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await fetchServices();
      } else {
        throw new Error('Error al eliminar el servicio');
      }
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Error al eliminar el servicio');
    }
  };

  const handleCancel = () => {
    setEditingService(null);
    setShowAddForm(false);
    setFormData({ title: '', description: '', icon: '⚖️', orden: 0 });
  };

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Servicios</h1>
        <p className="text-gray-600">Administra los servicios que se muestran en el frontend</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Agregar Nuevo Servicio
        </button>
      </div>

      {showAddForm && (
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            {editingService ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icono *
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="⚖️"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                rows={4}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <input
                type="number"
                value={formData.orden}
                onChange={(e) => setFormData({ ...formData, orden: parseInt(e.target.value) || 0 })}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingService ? 'Actualizar' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white p-6 rounded-lg border shadow-sm">
              <div className="flex items-start space-x-4 mb-4">
                <div className="text-3xl">{service.icon}</div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">{service.title}</h2>
                  <p className="text-sm text-gray-500">Orden: {service.orden}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm">{service.description}</p>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && services.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay servicios configurados.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesManagementPage; 