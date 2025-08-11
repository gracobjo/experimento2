import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Invoice } from '../../types/invoice';

const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    lawyerId: '',
    paymentDate: '',
    status: ''
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const params = new URLSearchParams();
      if (filters.lawyerId) params.append('lawyerId', filters.lawyerId);
      if (filters.paymentDate) params.append('paymentDate', filters.paymentDate);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get('/invoices/my', {
        params: Object.fromEntries(params)
      });

      console.log('Client invoices response:', response.data);
      setInvoices(response.data);
    } catch (err: any) {
      console.error('Error fetching client invoices:', err);
      setError(err.response?.data?.message || 'Error al cargar las facturas');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.id}/pdf-qr`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-${invoice.numeroFactura}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      alert('Error al descargar el PDF');
    }
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleViewProfessional = async (invoice: Invoice) => {
    try {
      // Abrir factura profesional en nueva pestaña
      const url = `${(import.meta as any).env.VITE_API_URL || 'https://experimento2-production-54c0.up.railway.app'}/api/invoices/${invoice.id}/html-preview`;
      
      // Obtener token para autenticación
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación. Por favor, inicia sesión de nuevo.');
        return;
      }

      // Hacer petición para obtener el HTML
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      
      // Crear nueva ventana con el HTML de la factura
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(htmlContent);
        newWindow.document.close();
      } else {
        // Fallback: mostrar en la misma ventana
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(htmlContent);
          newTab.document.close();
        }
      }
    } catch (error) {
      console.error('Error abriendo factura profesional:', error);
      alert('Error al abrir la factura profesional. Por favor, intenta de nuevo.');
    }
  };

  const closeModal = () => {
    setSelectedInvoice(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGADA':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'VENCIDA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAGADA':
        return 'Pagada';
      case 'PENDIENTE':
        return 'Pendiente';
      case 'VENCIDA':
        return 'Vencida';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando facturas...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchInvoices}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Facturas</h1>
              <p className="mt-2 text-gray-600">
                Gestiona y descarga tus facturas
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            </button>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abogado
                </label>
                <input
                  type="text"
                  value={filters.lawyerId}
                  onChange={(e) => setFilters({ ...filters, lawyerId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ID del abogado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de pago
                </label>
                <input
                  type="date"
                  value={filters.paymentDate}
                  onChange={(e) => setFilters({ ...filters, paymentDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="PAGADA">Pagada</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="VENCIDA">Vencida</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={fetchInvoices}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Aplicar filtros
              </button>
              <button
                onClick={() => {
                  setFilters({ lawyerId: '', paymentDate: '', status: '' });
                  fetchInvoices();
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Lista de facturas */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Facturas ({invoices.length})
            </h2>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🧾</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay facturas disponibles
              </h3>
              <p className="text-gray-600">
                No se encontraron facturas para tu cuenta.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Concepto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Importe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.numeroFactura}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(invoice.fechaEmision)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate">
                          {invoice.concepto || 'Sin concepto'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.importeTotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.estado)}`}>
                          {getStatusText(invoice.estado)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewProfessional(invoice)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver factura profesional"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(invoice)}
                            className="text-green-600 hover:text-green-900"
                          >
                            PDF
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Detalles de la Factura
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Número:</label>
                  <p className="text-sm text-gray-900">{selectedInvoice.numeroFactura}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Fecha de emisión:</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedInvoice.fechaEmision)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Concepto:</label>
                  <p className="text-sm text-gray-900">{selectedInvoice.concepto || 'Sin concepto'}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Importe total:</label>
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(selectedInvoice.importeTotal)}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estado:</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInvoice.estado)}`}>
                    {getStatusText(selectedInvoice.estado)}
                  </span>
                </div>
                
                {selectedInvoice.fechaVencimiento && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de vencimiento:</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedInvoice.fechaVencimiento)}</p>
                  </div>
                )}
                
                {selectedInvoice.observaciones && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Observaciones:</label>
                    <p className="text-sm text-gray-900">{selectedInvoice.observaciones}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleViewProfessional(selectedInvoice)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  title="Ver factura profesional"
                >
                  Ver Profesional
                </button>
                <button
                  onClick={() => handleDownloadPdf(selectedInvoice)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  title="Descargar PDF"
                >
                  Descargar PDF
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
