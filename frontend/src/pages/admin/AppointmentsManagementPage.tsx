import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';

interface Appointment {
  id: string;
  date: string;
  location?: string;
  notes?: string;
  client?: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  lawyer?: {
    id: string;
    name: string;
    email: string;
  };
  type: 'REGULAR' | 'VISITOR';
  fullName?: string;
  email?: string;
}

interface Lawyer {
  id: string;
  name: string;
  email: string;
}

const AppointmentsManagementPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Nuevas variables para ordenación y paginación
  const [sortField, setSortField] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [editForm, setEditForm] = useState({
    date: '',
    time: '',
    location: '',
    notes: '',
    lawyerId: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchLawyers();
    
    // Actualizar automáticamente cada 30 segundos
    const interval = setInterval(() => {
      fetchAppointments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/appointments');
      setAppointments(response.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.response?.data?.message || 'Error al cargar citas');
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      console.log('🔍 Fetching lawyers...');
      
      const response = await api.get('/admin/users');
      
      console.log('📊 Response from /admin/users:', response);
      console.log('📋 Response data type:', typeof response.data);
      console.log('📋 Response data:', response.data);
      
      // Verificar que response.data sea un array antes de filtrar
      if (Array.isArray(response.data)) {
        // Filtrar solo abogados
        const lawyerUsers = response.data.filter((user: any) => user.role === 'ABOGADO');
        console.log('👨‍💼 Found lawyers:', lawyerUsers);
        setLawyers(lawyerUsers);
      } else {
        console.error('Error: response.data is not an array:', response.data);
        setLawyers([]);
      }
    } catch (err: any) {
      console.error('Error fetching lawyers:', err);
    }
  };

  useEffect(() => {
    let filtered = appointments;

    if (searchTerm) {
      const searchTerms = searchTerm.toLowerCase().split(';').filter(term => term.trim().length > 0);
      
      // Función de depuración para mostrar qué está pasando con la búsqueda
      const debugSearch = (appointment: any, searchTerms: string[]) => {
        const searchableFields = {
          clientName: appointment.fullName || appointment.client?.user?.name || '',
          clientEmail: appointment.email || appointment.client?.user?.email || '',
          lawyerName: appointment.lawyer?.name || '',
          lawyerEmail: appointment.lawyer?.email || '',
          location: appointment.location || 'No especificada',
          notes: appointment.notes || '',
          type: appointment.type === 'VISITOR' ? 'visitante' : 'cliente',
          status: isUpcoming(appointment.date) ? 'próxima' : 'pasada'
        };

        console.log('🔍 Búsqueda para cita:', appointment.id);
        console.log('📝 Términos de búsqueda:', searchTerms);
        console.log('📋 Campos de búsqueda:', searchableFields);
        
        const matches = searchTerms.map(term => {
          const trimmedTerm = term.trim();
          const matchingFields = Object.entries(searchableFields)
            .filter(([key, value]) => value.toLowerCase().includes(trimmedTerm))
            .map(([key, value]) => `${key}: "${value}"`);
          
          console.log(`✅ Término "${trimmedTerm}" encontrado en:`, matchingFields);
          return matchingFields.length > 0;
        });
        
        const allMatch = matches.every(match => match);
        console.log(`🎯 Resultado final: ${allMatch ? 'INCLUIDA' : 'EXCLUIDA'}`);
        console.log('---');
        
        return allMatch;
      };
      
      filtered = filtered.filter(appointment => {
        // Verificar si TODOS los términos de búsqueda están presentes en AL MENOS UNO de los campos
        return searchTerms.every(term => {
          const trimmedTerm = term.trim();
          const searchableFields = {
            clientName: appointment.fullName || appointment.client?.user?.name || '',
            clientEmail: appointment.email || appointment.client?.user?.email || '',
            lawyerName: appointment.lawyer?.name || '',
            lawyerEmail: appointment.lawyer?.email || '',
            location: appointment.location || 'No especificada',
            notes: appointment.notes || '',
            type: appointment.type === 'VISITOR' ? 'visitante' : 'cliente',
            status: isUpcoming(appointment.date) ? 'próxima' : 'pasada'
          };
          
          return Object.values(searchableFields).some(fieldValue => 
            fieldValue.toLowerCase().includes(trimmedTerm)
          );
        });
      });
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate.toDateString() === filterDate.toDateString();
      });
    }

    setFilteredAppointments(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  }, [appointments, searchTerm, dateFilter]);

  // Funciones auxiliares para determinar el estado de las citas
  const isUpcoming = (date: string) => {
    return new Date(date) > new Date();
  };

  const isPast = (date: string) => {
    return new Date(date) < new Date();
  };

  // Función para obtener el valor de un campo para ordenación
  const getFieldValue = (appointment: Appointment, field: string) => {
    switch (field) {
      case 'date':
        return new Date(appointment.date).getTime();
      case 'client':
        return (appointment.fullName || appointment.client?.user?.name || '').toLowerCase();
      case 'lawyer':
        return (appointment.lawyer?.name || '').toLowerCase();
      case 'location':
        return (appointment.location || '').toLowerCase();
      case 'status':
        // Usar valores numéricos para ordenación: 1 = próxima, 0 = pasada
        return isUpcoming(appointment.date) ? 1 : 0;
      case 'type':
        return appointment.type;
      default:
        return '';
    }
  };

  const sortedAppointments = useMemo(() => {
    return [...filteredAppointments].sort((a, b) => {
      const valueA = getFieldValue(a, sortField);
      const valueB = getFieldValue(b, sortField);
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortOrder === 'asc' 
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else {
        return sortOrder === 'asc' 
          ? (valueA as number) - (valueB as number)
          : (valueB as number) - (valueA as number);
      }
    });
  }, [filteredAppointments, sortField, sortOrder]);

  // Lógica de paginación
  const totalPages = Math.ceil(sortedAppointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAppointments = sortedAppointments.slice(startIndex, endIndex);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    setEditForm({
      date: appointmentDate.toISOString().split('T')[0],
      time: appointmentDate.toTimeString().slice(0, 5),
      location: appointment.location || '',
      notes: appointment.notes || '',
      lawyerId: appointment.lawyer?.id || ''
    });
    setEditingAppointment(appointment);
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;

    try {
      const token = localStorage.getItem('token');
      const updatedData = {
        date: `${editForm.date}T${editForm.time}:00`,
        location: editForm.location,
        notes: editForm.notes,
        lawyerId: editForm.lawyerId
      };

      await api.put(`/admin/appointments/${editingAppointment.id}`, updatedData);

      setShowEditModal(false);
      setEditingAppointment(null);
      fetchAppointments();
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      setError(err.response?.data?.message || 'Error al actualizar cita');
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cita?')) {
      return;
    }

    try {
      await api.delete(`/admin/appointments/${appointmentId}`);
      fetchAppointments();
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      setError(err.response?.data?.message || 'Error al eliminar cita');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
              <p className="mt-2 text-gray-600">
                Administra todas las citas del sistema - Asigna abogados y reprograma citas
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Última actualización: {lastUpdated.toLocaleString()} 
                <span className="ml-2 text-blue-600">(Actualización automática cada 30s)</span>
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAppointments}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refrescar</span>
              </button>
              {searchTerm && (
                <button
                  onClick={() => {
                    console.log('🔍 DEBUG: Analizando búsqueda actual');
                    console.log('📝 Término de búsqueda:', searchTerm);
                    console.log('📊 Total de citas:', appointments.length);
                    console.log('🎯 Citas filtradas:', filteredAppointments.length);
                    console.log('---');
                    
                    // Ejecutar la función de depuración para cada cita
                    appointments.forEach(appointment => {
                      const searchTerms = searchTerm.toLowerCase().split(';').filter(term => term.trim().length > 0);
                      const searchableFields = {
                        clientName: appointment.fullName || appointment.client?.user?.name || '',
                        clientEmail: appointment.email || appointment.client?.user?.email || '',
                        lawyerName: appointment.lawyer?.name || '',
                        lawyerEmail: appointment.lawyer?.email || '',
                        location: appointment.location || 'No especificada',
                        notes: appointment.notes || '',
                        type: appointment.type === 'VISITOR' ? 'visitante' : 'cliente',
                        status: isUpcoming(appointment.date) ? 'próxima' : 'pasada'
                      };
                      
                      console.log(`🔍 Cita ${appointment.id}:`);
                      console.log('📋 Campos:', searchableFields);
                      
                      searchTerms.forEach(term => {
                        const trimmedTerm = term.trim();
                        const matchingFields = Object.entries(searchableFields)
                          .filter(([key, value]) => value.toLowerCase().includes(trimmedTerm))
                          .map(([key, value]) => `${key}: "${value}"`);
                        
                        if (matchingFields.length > 0) {
                          console.log(`✅ "${trimmedTerm}" encontrado en:`, matchingFields);
                        } else {
                          console.log(`❌ "${trimmedTerm}" NO encontrado`);
                        }
                      });
                      console.log('---');
                    });
                  }}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Debug</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por cliente, abogado, ubicación, notas, tipo (cliente/visitante) o estado (próxima/pasada). Puedes combinar términos separados por punto y coma (;)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Filtrar por fecha"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setDateFilter('');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="bg-white p-4 rounded-lg shadow mb-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{sortedAppointments.length}</span> citas encontradas
              {searchTerm && (
                <span className="ml-2">
                  para "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
              {dateFilter && (
                <span className="ml-2">
                  en <span className="font-medium">{new Date(dateFilter).toLocaleDateString()}</span>
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1}-{Math.min(endIndex, sortedAppointments.length)} de {sortedAppointments.length} citas
            </div>
          </div>
        </div>

        {/* Lista de citas */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('date')}>
                    Fecha y Hora
                    <span className="ml-1">{sortField === 'date' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('client')}>
                    Cliente
                    <span className="ml-1">{sortField === 'client' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('lawyer')}>
                    Abogado
                    <span className="ml-1">{sortField === 'lawyer' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('location')}>
                    Ubicación
                    <span className="ml-1">{sortField === 'location' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('status')}>
                    Estado
                    <span className="ml-1">{sortField === 'status' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none" onClick={() => handleSort('type')}>
                    Tipo
                    <span className="ml-1">{sortField === 'type' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</span>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAppointments.map((appointment) => (
                  <tr key={appointment.id} className={`hover:bg-gray-50 ${isPast(appointment.date) ? 'bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.fullName || appointment.client?.user?.name || '—'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.email || appointment.client?.user?.email || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.lawyer?.name || '—'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.lawyer?.email || '—'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {appointment.location || 'No especificada'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isUpcoming(appointment.date) ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Próxima
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Pasada
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.type === 'VISITOR' ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Visitante (Chatbot)
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Cliente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditAppointment(appointment)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appointment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        )}

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron citas</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros de búsqueda.
            </p>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {showEditModal && editingAppointment && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Cita - {editingAppointment.client?.user?.name || 'Desconocido'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={editForm.date}
                    onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={editForm.time}
                    onChange={(e) => setEditForm({...editForm, time: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abogado
                  </label>
                  <select
                    value={editForm.lawyerId}
                    onChange={(e) => setEditForm({...editForm, lawyerId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {lawyers.map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.name} ({lawyer.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                    placeholder="Ubicación de la cita"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    placeholder="Notas adicionales"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAppointment(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateAppointment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsManagementPage; 