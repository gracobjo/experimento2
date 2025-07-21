import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer, type Event as CalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Componente de barra de herramientas personalizada para mejor accesibilidad
const CustomToolbar = (toolbar: any) => {
  const goToToday = () => {
    toolbar.onNavigate('TODAY');
  };

  const goToPrevious = () => {
    toolbar.onNavigate('PREV');
  };

  const goToNext = () => {
    toolbar.onNavigate('NEXT');
  };

  const viewNames = {
    month: 'Mes',
    week: 'Semana',
    day: 'Día',
    agenda: 'Agenda'
  };

  return (
    <div className="rbc-toolbar" role="toolbar" aria-label="Controles del calendario">
      <div className="rbc-btn-group" role="group" aria-label="Navegación del calendario">
        <button
          type="button"
          onClick={goToPrevious}
          className="rbc-btn"
          aria-label="Mes anterior"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          onClick={goToToday}
          className="rbc-btn rbc-active"
          aria-label="Ir a hoy"
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={goToNext}
          className="rbc-btn"
          aria-label="Mes siguiente"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      
      <span className="rbc-toolbar-label" role="heading" aria-level={2}>
        {toolbar.label}
      </span>
      
      <div className="rbc-btn-group" role="group" aria-label="Vistas del calendario">
        {toolbar.views.map((view: string) => (
          <button
            key={view}
            type="button"
            onClick={() => toolbar.onView(view)}
            className={`rbc-btn ${toolbar.view === view ? 'rbc-active' : ''}`}
            aria-pressed={toolbar.view === view}
            aria-label={`Ver ${viewNames[view as keyof typeof viewNames]}`}
          >
            {viewNames[view as keyof typeof viewNames]}
          </button>
        ))}
      </div>
    </div>
  );
};

const localizer = momentLocalizer(moment);

interface Appointment {
  id: string;
  client: { user: { name: string; email: string } };
  lawyer: { name: string; email: string };
  date: string;
  location: string;
  notes?: string;
  // Campos adicionales para citas de visitantes
  type?: 'REGULAR' | 'VISITOR';
  status?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  consultationReason?: string;
  consultationType?: string;
  age?: number;
  preferredDate?: string;
  confirmedDate?: string;
}

interface RescheduleForm {
  date: string;
  location: string;
  notes: string;
}

const AppointmentsCalendarPage = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState<RescheduleForm>({
    date: '',
    location: '',
    notes: ''
  });
  const [rescheduling, setRescheduling] = useState(false);
  
  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    clientName: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    consultationType: ''
  });
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/appointments', {
          headers: { Authorization: `Bearer ${token}` },
          params: { _t: Date.now() } // Evitar caché
        });
        // Asegurar que la respuesta es un array
        const appointmentsData = Array.isArray(response.data) ? response.data : [];
        setAppointments(appointmentsData);
        setError(null);
      } catch (err: any) {
        setError('Error al cargar las citas');
        setAppointments([]); // fallback seguro
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const filtered = appointments.filter(appointment => {
      const clientName = appointment.type === 'VISITOR' ? appointment.fullName : appointment.client.user.name;
      
      // Filtro por nombre del cliente
      if (filters.clientName && clientName && !clientName.toLowerCase().includes(filters.clientName.toLowerCase())) {
        return false;
      }
      
      // Filtro por fecha desde
      if (filters.dateFrom && moment(appointment.date).isBefore(moment(filters.dateFrom))) {
        return false;
      }
      
      // Filtro por fecha hasta
      if (filters.dateTo && moment(appointment.date).isAfter(moment(filters.dateTo).endOf('day'))) {
        return false;
      }
      
      // Filtro por estado
      if (filters.status && appointment.status !== filters.status) {
        return false;
      }
      
      // Filtro por tipo de consulta (solo para citas de visitantes)
      if (filters.consultationType && appointment.consultationType !== filters.consultationType) {
        return false;
      }
      
      return true;
    });
    
    setFilteredAppointments(filtered);
  }, [appointments, filters]);

  // Estadísticas basadas en citas filtradas
  const stats = useMemo(() => {
    const safeAppointments = Array.isArray(filteredAppointments) ? filteredAppointments : [];
    const total = safeAppointments.length;
    const upcoming = safeAppointments.filter(a => moment(a.date).isAfter(moment())).length;
    const past = safeAppointments.filter(a => moment(a.date).isBefore(moment())).length;
    return { total, upcoming, past };
  }, [filteredAppointments]);

  // Map appointments to calendar events
  const events: CalendarEvent[] = (Array.isArray(filteredAppointments) ? filteredAppointments : []).map(a => {
    const clientName = a.type === 'VISITOR' ? a.fullName : a.client.user.name;
    return {
      id: a.id,
      title: `${clientName} - ${moment(a.date).format('HH:mm')}`,
      start: new Date(a.date),
      end: moment(a.date).add(1, 'hour').toDate(),
      resource: a,
    };
  });

  const handleRescheduleClick = (appointment: Appointment) => {
    setSelected(appointment);
    setRescheduleForm({
      date: moment(appointment.date).format('YYYY-MM-DDTHH:mm'),
      location: appointment.location || '',
      notes: ''
    });
    setShowRescheduleModal(true);
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    try {
      setRescheduling(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.put(`/api/appointments/${selected.id}/reschedule`, rescheduleForm, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Actualizar la lista de citas
      setAppointments(prev => prev.map(app => 
        app.id === selected.id ? response.data : app
      ));

      setSuccess('Cita reprogramada exitosamente. Se ha enviado una notificación al cliente.');
      setShowRescheduleModal(false);
      setSelected(null);
      
      // Limpiar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al reprogramar la cita');
    } finally {
      setRescheduling(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRescheduleForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const clearFilters = () => {
    setFilters({
      clientName: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      consultationType: ''
    });
  };

  // Obtener tipos de consulta únicos para el filtro
  const consultationTypes = useMemo(() => {
    const types = appointments
      .filter(apt => apt.consultationType)
      .map(apt => apt.consultationType)
      .filter((type, index, arr) => arr.indexOf(type) === index);
    return types;
  }, [appointments]);

  return (
    <div className="py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Calendario de Citas</h1>
        
        {/* Mensajes de éxito y error */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-gray-500 text-sm">Total Citas</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-gray-500 text-sm">Próximas</div>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-gray-500 text-sm">Pasadas</div>
            <div className="text-2xl font-bold">{stats.past}</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filtros de Búsqueda</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={showFilters}
                aria-controls="filters-panel"
                aria-label={showFilters ? 'Ocultar filtros de búsqueda' : 'Mostrar filtros de búsqueda'}
              >
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Limpiar todos los filtros aplicados"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {showFilters && (
            <div id="filters-panel" role="region" aria-label="Panel de filtros avanzados" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Filtro por nombre del cliente */}
              <div>
                <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente
                </label>
                <input
                  id="clientName"
                  type="text"
                  name="clientName"
                  value={filters.clientName}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Buscar por nombre..."
                  aria-describedby="clientName-help"
                />
                <div id="clientName-help" className="sr-only">
                  Escribe el nombre del cliente para filtrar las citas
                </div>
              </div>

              {/* Filtro por fecha desde */}
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  id="dateFrom"
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-describedby="dateFrom-help"
                />
                <div id="dateFrom-help" className="sr-only">
                  Selecciona la fecha desde la cual quieres ver citas
                </div>
              </div>

              {/* Filtro por fecha hasta */}
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  id="dateTo"
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-describedby="dateTo-help"
                />
                <div id="dateTo-help" className="sr-only">
                  Selecciona la fecha hasta la cual quieres ver citas
                </div>
              </div>

              {/* Filtro por estado */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-describedby="status-help"
                >
                  <option value="">Todos los estados</option>
                  <option value="CONFIRMADA">Confirmada</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="CANCELADA">Cancelada</option>
                  <option value="COMPLETADA">Completada</option>
                </select>
                <div id="status-help" className="sr-only">
                  Selecciona el estado de las citas que quieres ver
                </div>
              </div>

              {/* Filtro por tipo de consulta */}
              <div>
                <label htmlFor="consultationType" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Consulta
                </label>
                <select
                  id="consultationType"
                  name="consultationType"
                  value={filters.consultationType}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-describedby="consultationType-help"
                >
                  <option value="">Todos los tipos</option>
                  {consultationTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div id="consultationType-help" className="sr-only">
                  Selecciona el tipo de consulta para filtrar las citas
                </div>
              </div>

              {/* Información de filtros activos */}
              <div className="md:col-span-2 lg:col-span-3">
                <div className="text-sm text-gray-600" role="status" aria-live="polite" aria-label="Estado de filtros aplicados">
                  <strong>Filtros activos:</strong>
                  {filters.clientName && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded" role="status">Cliente: {filters.clientName}</span>}
                  {filters.dateFrom && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded" role="status">Desde: {filters.dateFrom}</span>}
                  {filters.dateTo && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded" role="status">Hasta: {filters.dateTo}</span>}
                  {filters.status && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded" role="status">Estado: {filters.status}</span>}
                  {filters.consultationType && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded" role="status">Tipo: {filters.consultationType}</span>}
                  {!filters.clientName && !filters.dateFrom && !filters.dateTo && !filters.status && !filters.consultationType && (
                    <span className="text-gray-500" role="status">Ningún filtro activo</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controles de Vista */}
        <div className="bg-white rounded shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Vista de Citas</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                aria-pressed={viewMode === 'calendar'}
                aria-label="Ver citas en formato calendario"
              >
                Calendario
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                aria-pressed={viewMode === 'list'}
                aria-label="Ver citas en formato lista"
              >
                Lista
              </button>
            </div>
          </div>
        </div>

        {/* Calendario */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded shadow p-4" role="region" aria-label="Calendario de citas">
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 500 }}
              onSelectEvent={event => setSelected(event.resource)}
              messages={{
                next: 'Siguiente',
                previous: 'Anterior',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                noEventsInRange: 'No hay citas en este período',
                showMore: total => `+ ${total} citas más`,
              }}
              components={{
                toolbar: CustomToolbar
              }}
            />
          </div>
        )}

        {/* Vista de Lista */}
        {viewMode === 'list' && (
          <div className="bg-white rounded shadow p-4" role="region" aria-label="Lista de citas">
            <h2 className="text-lg font-semibold mb-4">Lista de Citas ({filteredAppointments.length})</h2>
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500" role="status" aria-live="polite">
                No hay citas que coincidan con los filtros aplicados
              </div>
            ) : (
              <div className="space-y-4" role="list" aria-label="Citas">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Citas Programadas</h3>
                {filteredAppointments.map((appointment, index) => {
                  const clientName = appointment.type === 'VISITOR' ? appointment.fullName : appointment.client.user.name;
                  const isPast = moment(appointment.date).isBefore(moment());
                  const isToday = moment(appointment.date).isSame(moment(), 'day');
                  
                  return (
                    <div
                      key={appointment.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isPast ? 'border-gray-300 bg-gray-50' : 
                        isToday ? 'border-blue-300 bg-blue-50' : 
                        'border-green-300 bg-green-50'
                      }`}
                      onClick={() => setSelected(appointment)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelected(appointment);
                        }
                      }}
                      tabIndex={0}
                      role="listitem"
                      aria-label={`Cita ${index + 1}: ${clientName} el ${moment(appointment.date).format('DD/MM/YYYY a las HH:mm')} - ${isPast ? 'Pasada' : isToday ? 'Hoy' : 'Próxima'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-semibold text-lg">{clientName}</h4>
                            <span className={`px-2 py-1 text-xs rounded ${
                              appointment.type === 'VISITOR' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {appointment.type === 'VISITOR' ? 'Visitante' : 'Cliente'}
                            </span>
                            {appointment.status && (
                              <span className={`px-2 py-1 text-xs rounded ${
                                appointment.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                                appointment.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {appointment.status}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div><strong>Fecha:</strong> {moment(appointment.date).format('DD/MM/YYYY HH:mm')}</div>
                            <div><strong>Ubicación:</strong> {appointment.location || 'No especificada'}</div>
                            {appointment.consultationType && (
                              <div><strong>Tipo:</strong> {appointment.consultationType}</div>
                            )}
                            {appointment.consultationReason && (
                              <div><strong>Motivo:</strong> {appointment.consultationReason}</div>
                            )}
                            {appointment.phone && (
                              <div><strong>Teléfono:</strong> {appointment.phone}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {isPast ? 'Pasada' : isToday ? 'Hoy' : 'Próxima'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modal Detalle de Cita */}
        {selected && !showRescheduleModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="appointment-detail-title"
            aria-describedby="appointment-detail-content"
            onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1" 
                onClick={() => setSelected(null)}
                aria-label="Cerrar detalle de cita"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 id="appointment-detail-title" className="text-xl font-bold mb-4 pr-8">Detalle de la Cita</h3>
              
              <div id="appointment-detail-content" className="mb-4 space-y-3">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Cliente</h3>
                {/* Información del cliente según el tipo de cita */}
                {selected.type === 'VISITOR' ? (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <h4 className="font-semibold text-purple-800 mb-2">Cliente Visitante</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Nombre:</strong> {selected.fullName}</div>
                      <div><strong>Email:</strong> {selected.email}</div>
                      {selected.phone && <div><strong>Teléfono:</strong> {selected.phone}</div>}
                      {selected.age && <div><strong>Edad:</strong> {selected.age} años</div>}
                      {selected.consultationType && <div><strong>Tipo de consulta:</strong> {selected.consultationType}</div>}
                      {selected.consultationReason && <div><strong>Motivo:</strong> {selected.consultationReason}</div>}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h4 className="font-semibold text-blue-800 mb-2">Cliente Registrado</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Nombre:</strong> {selected.client.user.name}</div>
                      <div><strong>Email:</strong> {selected.client.user.email}</div>
                    </div>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles de la Cita</h3>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                  <h4 className="font-semibold text-gray-800 mb-2">Información de la Cita</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Abogado:</strong> {selected.lawyer.name} ({selected.lawyer.email})</div>
                    <div><strong>Fecha y hora:</strong> {moment(selected.date).format('DD/MM/YYYY HH:mm')}</div>
                    <div><strong>Lugar:</strong> {selected.location}</div>
                    {selected.status && (
                      <div>
                        <strong>Estado:</strong> 
                        <span className={`ml-1 px-2 py-1 text-xs rounded ${
                          selected.status === 'CONFIRMADA' ? 'bg-green-100 text-green-800' :
                          selected.status === 'PENDIENTE' ? 'bg-yellow-100 text-yellow-800' :
                          selected.status === 'CANCELADA' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selected.status}
                        </span>
                      </div>
                    )}
                    {selected.notes && <div><strong>Notas:</strong> {selected.notes}</div>}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  onClick={() => handleRescheduleClick(selected)}
                  aria-label="Reprogramar esta cita"
                  type="button"
                >
                  Reprogramar
                </button>
                <button 
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2" 
                  onClick={() => setSelected(null)}
                  aria-label="Cerrar detalle de cita"
                  type="button"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Reprogramación */}
        {showRescheduleModal && selected && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reschedule-title"
            aria-describedby="reschedule-description"
            onClick={(e) => e.target === e.currentTarget && setShowRescheduleModal(false)}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1" 
                onClick={() => {
                  setShowRescheduleModal(false);
                  setSelected(null);
                }}
                aria-label="Cerrar modal de reprogramación"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h3 id="reschedule-title" className="text-xl font-bold mb-4 pr-8">Reprogramar Cita</h3>
              <p id="reschedule-description" className="text-sm text-gray-600 mb-4">
                Cliente: <strong>{selected.type === 'VISITOR' ? selected.fullName : selected.client.user.name}</strong>
              </p>
              
              <form onSubmit={handleRescheduleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva fecha y hora
                  </label>
                  <input
                    id="reschedule-date"
                    type="datetime-local"
                    name="date"
                    value={rescheduleForm.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    aria-describedby="date-help"
                  />
                  <div id="date-help" className="sr-only">
                    Selecciona la nueva fecha y hora para la cita
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reschedule-location" className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    id="reschedule-location"
                    type="text"
                    name="location"
                    value={rescheduleForm.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Oficina, online, etc."
                    aria-describedby="location-help"
                  />
                  <div id="location-help" className="sr-only">
                    Especifica la ubicación de la cita reprogramada
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reschedule-notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    id="reschedule-notes"
                    name="notes"
                    value={rescheduleForm.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Motivo del cambio, instrucciones especiales, etc."
                    aria-describedby="notes-help"
                  />
                  <div id="notes-help" className="sr-only">
                    Agrega notas adicionales sobre la reprogramación
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    onClick={() => {
                      setShowRescheduleModal(false);
                      setSelected(null);
                    }}
                    disabled={rescheduling}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={rescheduling}
                  >
                    {rescheduling ? 'Reprogramando...' : 'Reprogramar Cita'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading && <div className="text-center py-8">Cargando...</div>}
      </div>
    </div>
  );
};

export default AppointmentsCalendarPage; 