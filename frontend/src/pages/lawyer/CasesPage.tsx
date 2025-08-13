import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';
  clientId: string;
  lawyerId: string;
  createdAt: string;
  client: {
    id: string;
    dni: string;
    phone?: string;
    address?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  lawyer: {
    id: string;
    name: string;
    email: string;
  };
  documents: {
    id: string;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

interface CaseStats {
  total: number;
  abiertos: number;
  enProceso: number;
  cerrados: number;
}

interface Conversation {
  userId: string;
  userName: string;
  userEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

const CasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Función para formatear IDs de expediente
  const formatCaseId = (id: string) => {
    // Si es un UUID largo, mostrar solo los primeros 8 caracteres
    if (id.length > 12) {
      return id.substring(0, 8).toUpperCase();
    }
    // Si es un ID corto (como exp-001), mantenerlo como está
    return id;
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABIERTO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'EN_PROCESO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CERRADO':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'ABIERTO':
        return 'Abierto';
      case 'EN_PROCESO':
        return 'En Proceso';
      case 'CERRADO':
        return 'Cerrado';
      default:
        return status;
    }
  };

  // Cargar expedientes
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [casesResponse, statsResponse] = await Promise.all([
          api.get('/cases', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get('/cases/stats', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setCases(casesResponse.data);
        setStats(statsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError('Error al cargar los expedientes');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  // Cargar conversaciones de chat para saber si hay mensajes no leídos
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(res.data);
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    };

    fetchConversations();
  }, []);

  // Filtrado de casos
  useEffect(() => {
    let filtered = cases;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(caseItem =>
        caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== 'todos') {
      filtered = filtered.filter(caseItem => caseItem.status === statusFilter);
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, statusFilter]);

  const handleStatusChange = async (caseId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(`/cases/${caseId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Actualizar el estado local
      setCases(prevCases => 
        prevCases.map(c => 
          c.id === caseId ? { ...c, status: newStatus as any } : c
        )
      );
    } catch (err) {
      console.error('Error updating case status:', err);
      setError('Error al actualizar el estado del expediente');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Gestión de Expedientes</h1>
              <p className="mt-2 text-gray-600">
                Administra y da seguimiento a todos los expedientes legales
              </p>
            </div>
            <Link
              to="/lawyer/cases/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nuevo Expediente
            </Link>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Abiertos</dt>
                      <dd className="text-lg font-medium text-green-600">{stats.abiertos}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">En Proceso</dt>
                      <dd className="text-lg font-medium text-yellow-600">{stats.enProceso}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Cerrados</dt>
                      <dd className="text-lg font-medium text-gray-600">{stats.cerrados}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search-cases" className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                id="search-cases"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, cliente o descripción..."
                aria-label="Buscar expedientes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="search-cases-help"
              />
              <div id="search-cases-help" className="sr-only">
                Busque expedientes por título, nombre del cliente o descripción
              </div>
            </div>
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filtrar por estado"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-describedby="status-filter-help"
              >
                <option value="todos">Todos los estados</option>
                <option value="ABIERTO">Abierto</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="CERRADO">Cerrado</option>
              </select>
              <div id="status-filter-help" className="sr-only">
                Filtre los expedientes por su estado actual
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Limpiar todos los filtros de búsqueda"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de expedientes */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Lista de Expedientes</h2>
            <p className="text-sm text-gray-500 mt-1">
              {filteredCases.length} expediente{filteredCases.length !== 1 ? 's' : ''} encontrado{filteredCases.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => {
                  // Buscar si hay mensajes no leídos de este cliente
                  const conv = conversations.find(c => c.userId === caseItem.client.user.id);
                  return (
                    <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 font-mono">
                            {formatCaseId(caseItem.id)}
                          </span>
                          <button
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copiar ID completo"
                            onClick={() => navigator.clipboard.writeText(caseItem.id)}
                            aria-label={`Copiar ID completo del expediente ${caseItem.id} al portapapeles`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 truncate" title={caseItem.title}>
                            {caseItem.title}
                          </div>
                          {caseItem.description && (
                            <div className="text-sm text-gray-500 truncate" title={caseItem.description}>
                              {caseItem.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {caseItem.client.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {caseItem.client.user.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {caseItem.client.user.email}
                            </div>
                          </div>
                          {conv && conv.unreadCount > 0 && (
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200" 
                              title="Mensajes no leídos"
                              role="status"
                              aria-label={`${conv.unreadCount} mensaje${conv.unreadCount > 1 ? 's' : ''} no leído${conv.unreadCount > 1 ? 's' : ''} de ${caseItem.client.user.name}`}
                            >
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z" />
                              </svg>
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(caseItem.status)}`}>
                          {getStatusText(caseItem.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(caseItem.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <Link
                            to={`/lawyer/cases/${caseItem.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            aria-label={`Ver detalles del expediente ${caseItem.title}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Ver
                          </Link>
                          <Link
                            to={`/lawyer/cases/${caseItem.id}/edit`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                            aria-label={`Editar expediente ${caseItem.title}`}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="mt-2 text-sm font-medium text-gray-900">No se encontraron expedientes</h4>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros o crear un nuevo expediente.
            </p>
            <div className="mt-6">
              <Link
                to="/lawyer/cases/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear Nuevo Expediente
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesPage; 