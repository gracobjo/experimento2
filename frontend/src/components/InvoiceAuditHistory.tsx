import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface AuditRecord {
  id: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface AuditSummary {
  totalChanges: number;
  lastModified: string | null;
  lastModifiedBy: string | null;
  changesByField: Record<string, number>;
  changesByUser: Record<string, number>;
}

interface InvoiceAuditHistoryProps {
  invoiceId: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const InvoiceAuditHistory: React.FC<InvoiceAuditHistoryProps> = ({ invoiceId, isOpen, onClose, currentUser }) => {
  const [auditHistory, setAuditHistory] = useState<AuditRecord[]>([]);
  const [summary, setSummary] = useState<AuditSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && invoiceId) {
      fetchAuditHistory();
    }
  }, [isOpen, invoiceId]);

  const fetchAuditHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token available');

      // Verificar que el usuario tiene permisos para ver auditoría
      const user = currentUser || JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Usuario actual:', user);
      console.log('Rol del usuario:', user.role);
      console.log('¿Es ADMIN?', user.role === 'ADMIN');
      console.log('¿Es ABOGADO?', user.role === 'ABOGADO');
      
      if (user.role !== 'ADMIN' && user.role !== 'ABOGADO') {
        console.log('Acceso denegado - Rol no autorizado:', user.role);
        throw new Error('No tienes permisos para ver el historial de auditoría');
      }
      
      console.log('Acceso autorizado para auditoría');

      const response = await api.get(`/invoices/${invoiceId}/audit-history`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAuditHistory(response.data.auditHistory || []);
      setSummary(response.data.summary || null);
    } catch (err: any) {
      console.error('Error fetching audit history:', err);
      setError(err.response?.data?.message || err.message || 'Error al cargar el historial de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return '📄';
      case 'updated': return '✏️';
      case 'deleted': return '🗑️';
      case 'status_changed': return '🔄';
      default: return '📝';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created': return 'text-green-600';
      case 'updated': return 'text-blue-600';
      case 'deleted': return 'text-red-600';
      case 'status_changed': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const formatValue = (value: string) => {
    if (!value) return 'N/A';
    try {
      // Si es JSON, intentar formatearlo
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Si no es JSON, devolver como está
      return value;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            📋 Historial de Auditoría de Factura
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Nota informativa */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <div className="flex items-start">
              <span className="text-blue-600 mr-2">ℹ️</span>
              <div className="text-sm text-blue-800">
                                 <p className="font-medium mb-1">Información sobre Auditoría</p>
                 <p>• Solo visible para administradores y abogados</p>
                 <p>• Disponible en cualquier estado de la factura</p>
                 <p>• Registra todos los cambios realizados en la factura para trazabilidad</p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">Cargando historial...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Summary */}
              {summary && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">📊 Resumen de Cambios</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total de cambios:</span>
                      <span className="ml-2 text-blue-600">{summary.totalChanges}</span>
                    </div>
                    <div>
                      <span className="font-medium">Última modificación:</span>
                      <span className="ml-2 text-blue-600">
                        {summary.lastModified ? formatDate(summary.lastModified) : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Por:</span>
                      <span className="ml-2 text-blue-600">{summary.lastModifiedBy || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span>
                      <span className="ml-2 text-blue-600">
                        {summary.totalChanges > 0 ? 'Con modificaciones' : 'Sin modificaciones'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Audit History */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 mb-4">📝 Historial Detallado</h3>
                
                {auditHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay registros de auditoría para esta factura.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {auditHistory.map((record) => (
                      <div key={record.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getActionIcon(record.action)}</span>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className={`font-medium ${getActionColor(record.action)}`}>
                                  {record.description}
                                </span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {record.user.name} ({record.user.role})
                                </span>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {formatDate(record.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Field Changes */}
                        {record.fieldName && (
                          <div className="mt-3 pl-8">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Campo:</span> {record.fieldName}
                            </div>
                            {record.oldValue && (
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium text-red-600">Valor anterior:</span>
                                <div className="bg-red-50 p-2 rounded mt-1 font-mono text-xs">
                                  {formatValue(record.oldValue)}
                                </div>
                              </div>
                            )}
                            {record.newValue && (
                              <div className="text-sm text-gray-600 mt-1">
                                <span className="font-medium text-green-600">Nuevo valor:</span>
                                <div className="bg-green-50 p-2 rounded mt-1 font-mono text-xs">
                                  {formatValue(record.newValue)}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Technical Details */}
                        {(record.ipAddress || record.userAgent) && (
                          <div className="mt-3 pl-8 text-xs text-gray-500">
                            {record.ipAddress && (
                              <div>IP: {record.ipAddress}</div>
                            )}
                            {record.userAgent && (
                              <div className="truncate" title={record.userAgent}>
                                User Agent: {record.userAgent.substring(0, 50)}...
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAuditHistory; 