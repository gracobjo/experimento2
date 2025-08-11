import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Appointment {
  id: string;
  fullName: string;
  age: number;
  phone: string;
  email: string;
  consultationReason: string;
  consultationType: string;
  preferredDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          setError('No hay token de autenticación. Por favor, inicia sesión.');
          setLoading(false);
          return;
        }

        console.log('[AppointmentDetailPage] Fetching appointment:', id);
        
        const response = await api.get(`/appointments/visitor/${id}`);
        console.log('[AppointmentDetailPage] Response:', response.data);
        
        setAppointment(response.data);
      } catch (err: any) {
        console.error('[AppointmentDetailPage] Error:', err);
        
        if (err.response?.status === 401) {
          setError('Sesión expirada. Por favor, inicia sesión de nuevo.');
        } else if (err.response?.status === 403) {
          setError('No tienes permisos para ver esta cita.');
        } else if (err.response?.status === 404) {
          setError('Cita no encontrada.');
        } else {
          setError(`Error al cargar la cita: ${err.response?.data?.message || err.message || 'Error desconocido'}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: { [key: string]: { color: string; text: string } } = {
      'PENDIENTE': { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' },
      'CONFIRMADA': { color: 'bg-green-100 text-green-800', text: 'Confirmada' },
      'CANCELADA': { color: 'bg-red-100 text-red-800', text: 'Cancelada' },
      'COMPLETADA': { color: 'bg-blue-100 text-blue-800', text: 'Completada' },
      'RECHAZADA': { color: 'bg-red-100 text-red-800', text: 'Rechazada' }
    };

    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cita...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/client/appointments')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Volver a Mis Citas
            </button>
            <button
              onClick={() => navigate('/client/dashboard')}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cita no encontrada</h2>
          <p className="text-gray-600 mb-6">La cita que buscas no existe o ha sido eliminada.</p>
          <button
            onClick={() => navigate('/client/appointments')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Volver a Mis Citas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Detalle de la Cita</h1>
              <p className="text-gray-600 mt-2">Información completa de tu consulta legal</p>
            </div>
            <button
              onClick={() => navigate('/client/appointments')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Appointment Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Status Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Cita #{appointment.id.slice(0, 8)}</h2>
              {getStatusBadge(appointment.status)}
            </div>
          </div>

          {/* Appointment Details */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información de la Cita</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Fecha y Hora</label>
                      <p className="mt-1 text-lg text-gray-900">
                        {formatDate(appointment.preferredDate)} a las {formatTime(appointment.preferredDate)}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo de Consulta</label>
                      <p className="mt-1 text-lg text-gray-900">{appointment.consultationType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Motivo</label>
                      <p className="mt-1 text-gray-900">{appointment.consultationReason}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                      <p className="mt-1 text-lg text-gray-900">{appointment.fullName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Edad</label>
                      <p className="mt-1 text-lg text-gray-900">{appointment.age} años</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                      <p className="mt-1 text-lg text-gray-900">{appointment.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-lg text-gray-900">{appointment.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                  <p className="mt-1 text-gray-900">{formatDate(appointment.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Última Actualización</label>
                  <p className="mt-1 text-gray-900">{formatDate(appointment.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/client/chat')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  💬 Contactar Abogado
                </button>
                <button
                  onClick={() => navigate('/client/cases')}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  📋 Ver Expedientes
                </button>
                <button
                  onClick={() => navigate('/client/dashboard')}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🏠 Ir al Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
