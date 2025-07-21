import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  oldValues?: string;
  newValues?: string;
  userIp?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ActivitySummary {
  totalActions: number;
  actionsByType: Record<string, number>;
  actionsByEntity: Record<string, number>;
  actionsByUser: Record<string, number>;
  actionsByDay: Record<string, number>;
}

const AuditDashboard = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    entityType: '',
    action: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener datos del dashboard
      const [dashboardRes, recentRes] = await Promise.all([
        api.get('/admin/audit/dashboard', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/admin/audit/recent?limit=10', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      setSummary(dashboardRes.data.todaySummary);
      setRecentActivity(recentRes.data);
    } catch (err: any) {
      setError('Error al cargar los datos de auditoría');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const params = new URLSearchParams();
      if (filters.entityType) params.append('entityType', filters.entityType);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await api.get(`/admin/audit/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAuditLogs(response.data.logs);
    } catch (err: any) {
      setError('Error al cargar los logs de auditoría');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handleSearch = () => {
    fetchAuditLogs();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
      SIGN: 'bg-purple-100 text-purple-800',
      ANNULL: 'bg-orange-100 text-orange-800',
      VIEW: 'bg-gray-100 text-gray-800',
      DOWNLOAD: 'bg-indigo-100 text-indigo-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getEntityTypeColor = (entityType: string) => {
    const colors: Record<string, string> = {
      INVOICE: 'bg-blue-100 text-blue-800',
      EXPEDIENTE: 'bg-green-100 text-green-800',
      USER: 'bg-purple-100 text-purple-800',
      PROVISION: 'bg-yellow-100 text-yellow-800',
      DOCUMENT: 'bg-indigo-100 text-indigo-800',
    };
    return colors[entityType] || 'bg-gray-100 text-gray-800';
  };

  if (loading && !auditLogs.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando datos de auditoría...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard de Auditoría</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Resumen del día */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-gray-700">Total Acciones</h2>
            <p className="text-3xl font-bold text-blue-600">{summary.totalActions}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-gray-700">Facturas Creadas</h2>
            <p className="text-3xl font-bold text-green-600">{summary.actionsByType.CREATE || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-gray-700">Facturas Firmadas</h2>
            <p className="text-3xl font-bold text-purple-600">{summary.actionsByType.SIGN || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-gray-700">Usuarios Activos</h2>
            <p className="text-3xl font-bold text-orange-600">{Object.keys(summary.actionsByUser).length}</p>
          </div>
        </div>
      )}

      {/* Actividad Reciente */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Actividad Reciente</h2>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEntityTypeColor(log.entityType)}`}>
                      {log.entityType}
                    </span>
                    <div>
                      <p className="font-medium">{log.description}</p>
                      <p className="text-sm text-gray-600">
                        Por: {log.user.name} ({log.user.role})
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No hay actividad reciente</p>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Filtros de Auditoría</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo de Entidad</label>
              <select
                value={filters.entityType}
                onChange={(e) => handleFilterChange('entityType', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Todos</option>
                <option value="INVOICE">Facturas</option>
                <option value="EXPEDIENTE">Expedientes</option>
                <option value="USER">Usuarios</option>
                <option value="PROVISION">Provisiones</option>
                <option value="DOCUMENT">Documentos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Acción</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Todas</option>
                <option value="CREATE">Crear</option>
                <option value="UPDATE">Actualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="SIGN">Firmar</option>
                <option value="ANNULL">Anular</option>
                <option value="VIEW">Ver</option>
                <option value="DOWNLOAD">Descargar</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Inicio</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha Fin</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Logs de Auditoría */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Logs de Auditoría</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.user.name}</div>
                      <div className="text-sm text-gray-500">{log.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEntityTypeColor(log.entityType)}`}>
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {log.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.userIp || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {auditLogs.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No se encontraron logs de auditoría con los filtros aplicados
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditDashboard; 