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
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

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

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleViewInvoice = (invoice: Invoice, event?: React.MouseEvent<HTMLButtonElement>) => {
    console.log('[CLIENT] Abriendo modal para factura:', invoice.id, invoice.numeroFactura);
    
    // Mostrar indicador de carga en el botón
    const button = event?.currentTarget as HTMLButtonElement;
    if (button) {
      button.disabled = true;
      button.innerHTML = '⏳ Cargando...';
    }
    
    setViewingInvoice(invoice);
    
    // Restaurar el botón después de un breve delay
    setTimeout(() => {
      if (button) {
        button.disabled = false;
        button.innerHTML = '👁️ Ver';
      }
    }, 1000);
  };

  const handleViewProfessional = async (invoice: Invoice, event?: React.MouseEvent<HTMLButtonElement>) => {
    try {
      console.log('[CLIENT] Intentando descargar PDF profesional para factura:', invoice.id);
      
      // Mostrar indicador de carga
      const button = event?.currentTarget as HTMLButtonElement;
      if (button) {
        button.disabled = true;
        button.innerHTML = '⏳ Descargando...';
      }
      
      const response = await api.get(`/invoices/${invoice.id}/pdf-professional`, {
        responseType: 'blob'
      });

      // Verificar que la respuesta sea válida
      if (!response.data || response.data.size === 0) {
        throw new Error('El PDF recibido está vacío');
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `factura_${invoice.numeroFactura || invoice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('[CLIENT] PDF profesional descargado exitosamente');
      
      // Mostrar mensaje de éxito
      if (button) {
        button.innerHTML = '✅ Descargado';
        setTimeout(() => {
          button.disabled = false;
          button.innerHTML = '📥 PDF';
        }, 2000);
      }
      
    } catch (err: any) {
      console.error('[CLIENT] Error descargando PDF profesional:', err);
      
      // Si falla el PDF profesional, intentar con el PDF con QR
      try {
        console.log('[CLIENT] Intentando con PDF con QR como fallback...');
        const response = await api.get(`/invoices/${invoice.id}/pdf-qr`, {
          responseType: 'blob'
        });

        // Verificar que la respuesta sea válida
        if (!response.data || response.data.size === 0) {
          throw new Error('El PDF con QR recibido está vacío');
        }

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.download = `factura_qr_${invoice.numeroFactura || invoice.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        console.log('[CLIENT] PDF con QR descargado exitosamente como fallback');
        
        // Mostrar mensaje de éxito del fallback
        if (button) {
          button.innerHTML = '✅ Descargado (QR)';
          setTimeout(() => {
            button.disabled = false;
            button.innerHTML = '📥 PDF';
          }, 2000);
        }
        
      } catch (fallbackErr: any) {
        console.error('[CLIENT] Error también en fallback PDF con QR:', fallbackErr);
        
        // Restaurar el botón
        if (button) {
          button.disabled = false;
          button.innerHTML = '📥 PDF';
        }
        
        // Mostrar mensaje de error más informativo
        const errorMessage = fallbackErr?.response?.status === 403 
          ? 'No tiene permisos para descargar esta factura. Contacte a su abogado.'
          : fallbackErr?.response?.status === 404
          ? 'La factura no se encontró en el servidor.'
          : 'Error al descargar la factura. Por favor, intente ver la factura en pantalla o contacte al administrador.';
        
        alert(errorMessage);
      }
    }
  };

  const closeModal = () => {
    setSelectedInvoice(null);
  };

  const closeViewModal = () => {
    setViewingInvoice(null);
  };

  // Componente para mostrar la factura completa
  const InvoiceView = ({ invoice }: { invoice: Invoice }) => {
    const [html, setHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchHtml = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('token');
          console.log('[CLIENT] Cargando HTML preview para factura:', invoice.id);
          
          // Usar URL directa al backend
          const res = await fetch(`https://experimento2-production.up.railway.app/api/invoices/${invoice.id}/html-preview`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          });
          
          console.log('[CLIENT] Status de respuesta HTML:', res.status);
          
          if (!res.ok) {
            const errorText = await res.text();
            console.error('[CLIENT] Error response HTML:', errorText);
            throw new Error(`No se pudo cargar la previsualización: ${res.status} ${res.statusText}`);
          }
          
          const htmlText = await res.text();
          console.log('[CLIENT] HTML recibido, longitud:', htmlText.length);
          console.log('[CLIENT] Primeros 200 caracteres:', htmlText.substring(0, 200));
          
          setHtml(htmlText);
        } catch (err: any) {
          console.error('[CLIENT] Error cargando HTML:', err);
          setError(err.message || 'Error desconocido');
        } finally {
          setLoading(false);
        }
      };
      fetchHtml();
    }, [invoice.id]);

    const handlePrint = () => {
      // Verificar que el HTML esté cargado
      if (!html || html.trim() === '') {
        console.error('[CLIENT] No hay HTML disponible para imprimir');
        alert('Error: No hay contenido disponible para imprimir. Por favor, espere a que se cargue la factura.');
        return;
      }

      console.log('[CLIENT] Iniciando impresión con HTML de longitud:', html.length);
      
      // Crear una nueva ventana para imprimir solo el contenido de la factura
      const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
      if (printWindow) {
        try {
          // Escribir el contenido completo con estilos
          printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Factura ${invoice.numeroFactura}</title>
              <style>
                @media print {
                  body { 
                    margin: 0; 
                    padding: 0; 
                    font-size: 12pt;
                  }
                  .no-print { display: none !important; }
                  .invoice-content { 
                    padding: 0; 
                    margin: 0; 
                    box-shadow: none; 
                    border-radius: 0; 
                  }
                  @page {
                    margin: 1cm;
                    size: A4;
                  }
                }
                body { 
                  font-family: Arial, sans-serif; 
                  margin: 0;
                  padding: 20px;
                  background: white;
                }
                .invoice-content {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .print-header {
                  text-align: center;
                  margin-bottom: 20px;
                  padding: 10px;
                  background: #f8f9fa;
                  border-radius: 5px;
                  display: none;
                }
                @media print {
                  .print-header { display: block; }
                }
              </style>
            </head>
            <body>
              <div class="print-header">
                <h2>Factura ${invoice.numeroFactura}</h2>
                <p>Fecha: ${invoice.fechaEmision ? new Date(invoice.fechaEmision).toLocaleDateString('es-ES') : 'N/A'}</p>
                <p>Estado: ${invoice.estado?.toUpperCase() || 'N/A'}</p>
              </div>
              <div class="invoice-content">
                ${html}
              </div>
              <script>
                // Esperar a que se cargue todo el contenido antes de imprimir
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    // Cerrar la ventana después de un breve delay
                    setTimeout(function() {
                      window.close();
                    }, 1000);
                  }, 500);
                };
              </script>
            </body>
            </html>
          `);
          
          printWindow.document.close();
          printWindow.focus();
          
          // Log para debug
          console.log('[CLIENT] Ventana de impresión creada correctamente');
          
        } catch (error) {
          console.error('[CLIENT] Error al crear ventana de impresión:', error);
          printWindow.close();
          
          // Fallback: usar window.print() directamente
          console.log('[CLIENT] Usando fallback de impresión directa');
          try {
            window.print();
          } catch (fallbackError) {
            console.error('[CLIENT] Error en fallback de impresión:', fallbackError);
            alert('Error al imprimir. Por favor, intente nuevamente.');
          }
        }
      } else {
        console.warn('[CLIENT] No se pudo abrir ventana de impresión, usando fallback');
        // Fallback si no se puede abrir ventana
        alert('No se pudo abrir la ventana de impresión. Se usará la impresión del navegador.');
        try {
          window.print();
        } catch (fallbackError) {
          console.error('[CLIENT] Error en fallback de impresión:', fallbackError);
          alert('Error al imprimir. Por favor, intente nuevamente.');
        }
      }
    };

    if (loading) return <div className="p-8 text-center">Cargando previsualización...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!html) return <div className="p-8 text-center text-gray-500">No se pudo cargar el contenido de la factura</div>;
    
    return (
      <div className="invoice-preview-container">
        {/* Debug info - solo visible en desarrollo */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-2 bg-gray-100 text-xs no-print">
            <p>HTML length: {html.length}</p>
            <p>HTML preview: {html.substring(0, 100)}...</p>
          </div>
        )}
        
        {/* Contenido de la factura */}
        <div 
          className="invoice-content bg-white p-4 rounded shadow" 
          dangerouslySetInnerHTML={{ __html: html }} 
          style={{
            minHeight: '400px',
            position: 'relative',
            overflow: 'auto'
          }}
        />
        
        {/* Botones de acción - ocultos en impresión */}
        <div className="flex gap-4 mt-8 justify-center no-print">
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🖨️ Imprimir
          </button>
          <button 
            onClick={(e) => handleViewProfessional(invoice, e)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            📥 Descargar PDF
          </button>
        </div>
        
        {/* Estilos CSS para impresión */}
        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { margin: 0; padding: 0; }
            .invoice-preview-container { 
              padding: 0; 
              margin: 0; 
              background: white; 
            }
            .invoice-content { 
              padding: 0; 
              margin: 0; 
              box-shadow: none; 
              border-radius: 0; 
            }
          }
        `}</style>
      </div>
    );
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
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Funcionalidades disponibles:</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>• <strong>👁️ Ver:</strong> Muestra la factura completa en pantalla con opciones de impresión</p>
                      <p>• <strong>📥 PDF:</strong> Descarga la factura directamente en formato PDF</p>
                      <p>• <strong>🖨️ Imprimir:</strong> Imprime la factura desde la vista completa</p>
                    </div>
                  </div>
                </div>
              </div>
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
                            onClick={(e) => handleViewInvoice(invoice, e)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded"
                            title="Ver factura completa con todos los detalles"
                          >
                            👁️ Ver
                          </button>
                          <button
                            onClick={(e) => handleViewProfessional(invoice, e)}
                            className="text-green-600 hover:text-green-900 hover:bg-green-50 px-2 py-1 rounded"
                            title="Descargar factura en PDF"
                          >
                            📥 PDF
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
                  <p className="text-sm text-gray-900">{formatCurrency(selectedInvoice.importeTotal)}</p>
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
                  onClick={(e) => handleViewInvoice(selectedInvoice, e)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  title="Ver factura completa"
                >
                  👁️ Ver
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

      {/* Modal de vista de factura completa */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                Vista de Factura - {viewingInvoice.numeroFactura}
              </h2>
              <button
                onClick={closeViewModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <InvoiceView invoice={viewingInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage;
