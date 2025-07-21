import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import QRCode from 'react-qr-code';

interface Invoice {
  id: string;
  numeroFactura: string;
  fechaFactura: string;
  importeTotal: number;
  estado: string;
  paymentDate?: string;
  emisor?: {
    id: string;
    name: string;
    email: string;
  };
  receptor?: {
    id: string;
    name: string;
    email: string;
  };
  expediente?: {
    id: string;
    title: string;
  };
  items?: Array<{
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  provisionFondos?: Array<{
    id: string;
    amount: number;
    description: string;
    date: string;
  }>;
  xml?: string;
  xmlFirmado?: string;
  selloTiempo?: string;
  createdAt: string;
  updatedAt: string;
  // Campos adicionales para mostrar detalles completos
  baseImponible?: number;
  cuotaIVA?: number;
  tipoIVA?: number;
  descuento?: number;
  retencion?: number;
  metodoPago?: string;
  claveOperacion?: string;
  fechaOperacion?: string;
  regimenIvaEmisor?: string;
  motivoAnulacion?: string;
  qrData?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const InvoicesManagementPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lawyers, setLawyers] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [selectedLawyer, setSelectedLawyer] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedPaymentDate, setSelectedPaymentDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // CRUD states
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Export and copy functionality
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [copyingData, setCopyingData] = useState<string | null>(null);
  
  // Metadata modal
  const [metadataInvoice, setMetadataInvoice] = useState<Invoice | null>(null);
  const [showMetadataModal, setShowMetadataModal] = useState(false);

  // Invoice view modal
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Audit history modal
  const [auditInvoice, setAuditInvoice] = useState<Invoice | null>(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditHistory, setAuditHistory] = useState<any>(null);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => {
    fetchLawyersAndClients();
    fetchInvoices();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [selectedLawyer, selectedClient, selectedPaymentDate]);

  const fetchLawyersAndClients = async () => {
    try {
      const [lawyersRes, clientsRes] = await Promise.all([
        api.get('/admin/users?role=ABOGADO'),
        api.get('/admin/users?role=CLIENTE')
      ]);
      setLawyers(lawyersRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedLawyer) params.lawyerId = selectedLawyer;
      if (selectedClient) params.clientId = selectedClient;
      if (selectedPaymentDate) params.paymentDate = selectedPaymentDate;
      
      const response = await api.get('/invoices', { params });
      console.log('📊 Admin invoices response:', response.data);
      setInvoices(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError('Error al cargar las facturas');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleView = async (invoice: Invoice) => {
    // Primero mostrar la factura en el modal
    setViewingInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const handleDownloadPdf = async (invoice: Invoice) => {
    setDownloadingPdf(invoice.id);
    try {
      // Descargar el PDF de la factura con QR
      const response = await api.get(`/invoices/${invoice.id}/pdf-qr`, {
        responseType: 'blob'
      });
      
      // Crear URL del blob y abrir en nueva pestaña
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `factura_${invoice.numeroFactura || invoice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMsg(`✅ PDF de factura ${invoice.numeroFactura} descargado`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      setError('Error al descargar el PDF de la factura');
      setTimeout(() => setError(null), 3000);
    } finally {
      setDownloadingPdf(null);
    }
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta factura? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingId(id);
    try {
      await api.delete(`/invoices/${id}`);
      setSuccessMsg('✅ Factura eliminada correctamente');
      fetchInvoices();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      setError('Error al eliminar la factura');
      setTimeout(() => setError(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMeta = (invoice: Invoice) => {
    setMetadataInvoice(invoice);
    setShowMetadataModal(true);
  };

  const handleAudit = async (invoice: Invoice) => {
    setAuditInvoice(invoice);
    setShowAuditModal(true);
    setLoadingAudit(true);
    
    try {
      const response = await api.get(`/invoices/${invoice.id}/audit-history`);
      setAuditHistory(response.data);
    } catch (err: any) {
      console.error('Error fetching audit history:', err);
      setError('Error al cargar el historial de auditoría');
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoadingAudit(false);
    }
  };

  const getMetadataText = (invoice: Invoice) => {
    const metadata = {
      ID: invoice.id,
      'Número de Factura': invoice.numeroFactura,
      'Fecha de Factura': invoice.fechaFactura,
      'Fecha de Creación': invoice.createdAt,
      'Última Actualización': invoice.updatedAt,
      'Estado': invoice.estado,
      'XML Generado': invoice.xml ? 'Sí' : 'No',
      'XML Firmado': invoice.xmlFirmado ? 'Sí' : 'No',
      'Sello de Tiempo': invoice.selloTiempo || 'No aplicado',
      'Emisor': invoice.emisor ? `${invoice.emisor.name} (${invoice.emisor.email})` : 'No especificado',
      'Receptor': invoice.receptor ? `${invoice.receptor.name} (${invoice.receptor.email})` : 'No especificado',
      'Expediente': invoice.expediente ? `${invoice.expediente.title} (ID: ${invoice.expediente.id})` : 'No asociado',
      'Items': invoice.items?.length || 0,
      'Provisiones': invoice.provisionFondos?.length || 0,
    };

    return Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;
    
    try {
      // Preparar los datos para enviar al backend
      const updateData = {
        fechaFactura: editingInvoice.fechaFactura,
        estado: editingInvoice.estado,
        paymentDate: editingInvoice.paymentDate,
        tipoIVA: editingInvoice.tipoIVA,
        descuento: editingInvoice.descuento,
        retencion: editingInvoice.retencion,
        items: editingInvoice.items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      await api.put(`/invoices/${editingInvoice.id}`, updateData);
      setSuccessMsg('✅ Factura actualizada correctamente');
      setShowEditModal(false);
      fetchInvoices();
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err: any) {
      console.error('Error updating invoice:', err);
      setError('Error al actualizar la factura');
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const copyToClipboard = async (text: string, description: string) => {
    setCopyingData(description);
    try {
      await navigator.clipboard.writeText(text);
      setSuccessMsg(`✅ ${description} copiado al portapapeles`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Error al copiar al portapapeles');
      setTimeout(() => setError(null), 3000);
    } finally {
      setCopyingData(null);
    }
  };

  const handleSelectInvoice = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInvoices.length === invoices.length) {
      setSelectedInvoices([]);
    } else {
      setSelectedInvoices(invoices.map(inv => inv.id));
    }
  };

  const exportToCSV = () => {
    if (invoices.length === 0) {
      setError('No hay facturas para exportar');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const headers = [
      'ID', 'Número Factura', 'Fecha Factura', 'Importe Total', 'Estado',
      'Abogado', 'Cliente', 'Fecha de Pago', 'Base Imponible', 'IVA',
      'Fecha de Creación'
    ];

    const csvContent = [
      headers.join(','),
      ...invoices.map(invoice => [
        invoice.id,
        invoice.numeroFactura || '',
        invoice.fechaFactura || '',
        invoice.importeTotal || 0,
        invoice.estado || '',
        invoice.emisor?.name || '',
        invoice.receptor?.name || '',
        invoice.paymentDate || '',
        invoice.baseImponible || 0,
        invoice.cuotaIVA || 0,
        invoice.createdAt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `facturas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg('✅ CSV exportado correctamente');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const copyInvoiceData = (invoice: Invoice) => {
    const data = {
      'Número de Factura': invoice.numeroFactura || 'N/A',
      'Fecha de Factura': invoice.fechaFactura ? formatDate(invoice.fechaFactura) : 'N/A',
      'Importe Total': formatCurrency(invoice.importeTotal || 0),
      'Estado': invoice.estado || 'N/A',
      'Abogado': invoice.emisor?.name || 'N/A',
      'Cliente': invoice.receptor?.name || 'N/A',
      'Fecha de Pago': invoice.paymentDate ? formatDate(invoice.paymentDate) : 'N/A',
      'Base Imponible': formatCurrency(invoice.baseImponible || 0),
      'IVA': formatCurrency(invoice.cuotaIVA || 0),
      'Items': invoice.items?.length || 0,
      'Provisiones': invoice.provisionFondos?.length || 0,
    };

    const text = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    copyToClipboard(text, `Datos de factura ${invoice.numeroFactura}`);
  };

  const copySelectedInvoices = () => {
    if (selectedInvoices.length === 0) {
      setError('No hay facturas seleccionadas');
      setTimeout(() => setError(null), 3000);
      return;
    }

    const selectedInvoicesData = invoices.filter(inv => selectedInvoices.includes(inv.id));
    const data = selectedInvoicesData.map(invoice => ({
      'Número de Factura': invoice.numeroFactura || 'N/A',
      'Fecha de Factura': invoice.fechaFactura ? formatDate(invoice.fechaFactura) : 'N/A',
      'Importe Total': formatCurrency(invoice.importeTotal || 0),
      'Estado': invoice.estado || 'N/A',
      'Abogado': invoice.emisor?.name || 'N/A',
      'Cliente': invoice.receptor?.name || 'N/A',
    }));

    const text = data.map((invoice, index) => 
      `Factura ${index + 1}:\n${Object.entries(invoice)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')}`
    ).join('\n\n');

    copyToClipboard(text, `Datos de ${selectedInvoices.length} facturas seleccionadas`);
  };

  // Componente para mostrar la factura completa
  const InvoiceView = ({ invoice }: { invoice: Invoice }) => {
    return (
      <div className="bg-white p-8 max-w-4xl mx-auto">
        {/* Encabezado de la factura */}
        <div className="border-b-2 border-gray-300 pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">FACTURA</h1>
              {/* QR entre FACTURA y Fecha de operación */}
              <div className="my-4 flex flex-col items-center">
                {invoice.qrData ? (
                  <>
                    <h4 className="text-xs text-gray-600 mb-1">Código QR de la factura</h4>
                    <QRCode value={invoice.qrData} size={120} />
                    <pre className="text-xs mt-1 bg-gray-100 p-1 rounded">{invoice.qrData}</pre>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">QR no disponible</span>
                )}
              </div>
              <div className="text-lg text-gray-600">
                <div><strong>Número:</strong> {invoice.numeroFactura || 'N/A'}</div>
                <div><strong>Fecha:</strong> {invoice.fechaFactura ? formatDate(invoice.fechaFactura) : 'N/A'}</div>
                <div><strong>Estado:</strong> <span className={`px-2 py-1 rounded text-xs ${
                  invoice.estado === 'emitida' ? 'bg-green-100 text-green-800' :
                  invoice.estado === 'pagada' ? 'bg-blue-100 text-blue-800' :
                  invoice.estado === 'anulada' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{(invoice.estado || 'N/A').toUpperCase()}</span></div>
              </div>
            </div>
            
            <div className="text-right text-gray-600">
              <div><strong>Fecha de Operación:</strong> {invoice.fechaOperacion ? formatDate(invoice.fechaOperacion) : 'N/A'}</div>
              <div><strong>Método de Pago:</strong> {invoice.metodoPago || 'N/A'}</div>
              <div><strong>Clave de Operación:</strong> {invoice.claveOperacion || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Datos del emisor y receptor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">DATOS DEL EMISOR</h3>
            <div className="bg-gray-50 p-4 rounded border">
              <div><strong>Nombre:</strong> {invoice.emisor?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {invoice.emisor?.email || 'N/A'}</div>
              <div><strong>Régimen IVA:</strong> {invoice.regimenIvaEmisor || 'N/A'}</div>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">DATOS DEL RECEPTOR</h3>
            <div className="bg-gray-50 p-4 rounded border">
              <div><strong>Nombre:</strong> {invoice.receptor?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {invoice.receptor?.email || 'N/A'}</div>
              {invoice.expediente && (
                <div><strong>Expediente:</strong> {invoice.expediente.title}</div>
              )}
            </div>
          </div>
        </div>

        {/* Conceptos */}
        {invoice.items && invoice.items.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">CONCEPTOS</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Descripción</th>
                  <th className="border border-gray-300 px-3 py-2 text-center">Cantidad</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Precio Unitario</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2">{item.description}</td>
                    <td className="border border-gray-300 px-3 py-2 text-center">{item.quantity}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Descuento */}
        {invoice.descuento && invoice.descuento > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">DESCUENTOS</h3>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-yellow-800">Descuento ({invoice.descuento}%)</span>
                <span className="font-bold text-yellow-800 text-lg">
                  -{formatCurrency((invoice.items?.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) || 0) * (invoice.descuento / 100))}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Provisiones asociadas */}
        {invoice.provisionFondos && invoice.provisionFondos.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">PROVISIONES DE FONDOS ASOCIADAS</h3>
            <div className="bg-blue-50 p-4 rounded border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blue-200">
                    <th className="text-left py-2">Descripción</th>
                    <th className="text-right py-2">Fecha</th>
                    <th className="text-right py-2">Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.provisionFondos.map((provision) => (
                    <tr key={provision.id} className="border-b border-blue-100">
                      <td className="py-2">{provision.description || 'Sin descripción'}</td>
                      <td className="text-right py-2">{formatDate(provision.date)}</td>
                      <td className="text-right py-2 font-semibold">{formatCurrency(provision.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totales */}
        <div className="mb-8">
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Base Imponible:</span>
                <span className="font-semibold">{formatCurrency(invoice.baseImponible ?? 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA ({invoice.tipoIVA ?? 21}%):</span>
                <span className="font-semibold">{formatCurrency(invoice.cuotaIVA ?? 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.importeTotal ?? 0)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-600">
            <div>
              <div><strong>Método de pago:</strong> {invoice.metodoPago || 'N/A'}</div>
              <div><strong>Clave de operación:</strong> {invoice.claveOperacion || 'N/A'}</div>
            </div>
            <div>
              <div><strong>Fecha de creación:</strong> {formatDate(invoice.createdAt)}</div>
              {invoice.motivoAnulacion && (
                <div><strong>Motivo de anulación:</strong> {invoice.motivoAnulacion}</div>
              )}
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
          <button
            onClick={() => handleDownloadPdf(invoice)}
            disabled={downloadingPdf === invoice.id}
            className={`px-4 py-2 rounded flex items-center space-x-2 ${
              downloadingPdf === invoice.id 
                ? 'bg-gray-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{downloadingPdf === invoice.id ? 'Descargando...' : '📄 Descargar PDF'}</span>
          </button>
          <button
            onClick={() => copyInvoiceData(invoice)}
            disabled={copyingData !== null}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>{copyingData === `Datos de factura ${invoice.numeroFactura}` ? 'Copiando...' : '📋 Copiar Datos'}</span>
          </button>
        </div>
      </div>
    );
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
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold mb-2">Gestión de Facturas</h1>
              <p className="text-gray-600">Administra todas las facturas del sistema</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center space-x-2"
                title="Exportar todas las facturas a CSV"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Exportar CSV</span>
              </button>
              <button
                onClick={fetchInvoices}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refrescar</span>
              </button>
            </div>
          </div>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{successMsg}</div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abogado</label>
              <select 
                value={selectedLawyer} 
                onChange={e => setSelectedLawyer(e.target.value)} 
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {lawyers.map(lawyer => (
                  <option key={lawyer.id} value={lawyer.id}>{lawyer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select 
                value={selectedClient} 
                onChange={e => setSelectedClient(e.target.value)} 
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
              <input 
                type="date" 
                value={selectedPaymentDate} 
                onChange={e => setSelectedPaymentDate(e.target.value)} 
                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedLawyer('');
                  setSelectedClient('');
                  setSelectedPaymentDate('');
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>

          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron facturas</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedLawyer || selectedClient || selectedPaymentDate 
                  ? 'Intenta ajustar los filtros de búsqueda.' 
                  : 'No hay facturas registradas en el sistema.'}
              </p>
            </div>
          ) : (
            <>
              {/* Bulk actions */}
              {selectedInvoices.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800">
                      {selectedInvoices.length} factura{selectedInvoices.length !== 1 ? 's' : ''} seleccionada{selectedInvoices.length !== 1 ? 's' : ''}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={copySelectedInvoices}
                        disabled={copyingData !== null}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                        title="Copiar datos de facturas seleccionadas"
                      >
                        {copyingData ? '📋 Copiando...' : '📋 Copiar Seleccionadas'}
                      </button>
                      <button
                        onClick={() => setSelectedInvoices([])}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Deseleccionar Todo
                      </button>
                    </div>
                  </div>
                </div>
              )}
                          <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedInvoices.length === invoices.length && invoices.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          title="Seleccionar todas las facturas"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nº Factura</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Importe</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abogado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de pago</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice.id)}
                            onChange={() => handleSelectInvoice(invoice.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            title={`Seleccionar factura ${invoice.numeroFactura}`}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.numeroFactura || 'N/A'}
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.fechaFactura ? formatDate(invoice.fechaFactura) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(invoice.importeTotal || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          invoice.estado === 'emitida' ? 'bg-green-100 text-green-800' :
                          invoice.estado === 'pagada' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {invoice.estado || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.emisor?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.receptor?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.paymentDate ? formatDate(invoice.paymentDate) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(invoice)}
                            className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded"
                            title="Ver factura completa con todos los detalles"
                          >
                            👁️ Ver
                          </button>
                          <button
                            onClick={() => copyInvoiceData(invoice)}
                            disabled={copyingData !== null}
                            className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50"
                            title="Copiar datos de la factura"
                          >
                            {copyingData === `Datos de factura ${invoice.numeroFactura}` ? '📋 Copiando...' : '📋 Copiar'}
                          </button>
                          <button
                            onClick={() => handleEdit(invoice)}
                            className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded hover:bg-yellow-50"
                            title="Editar factura"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(invoice.id)}
                            disabled={deletingId === invoice.id}
                            className={`px-2 py-1 rounded ${
                              deletingId === invoice.id 
                                ? 'text-gray-400 cursor-not-allowed' 
                                : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                            }`}
                            title="Eliminar factura"
                          >
                            {deletingId === invoice.id ? '🗑️ Borrando...' : '🗑️ Borrar'}
                          </button>
                          <button
                            onClick={() => handleMeta(invoice)}
                            className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50"
                            title="Ver metadatos técnicos"
                          >
                            🔍 Metadatos
                          </button>
                          <button
                            onClick={() => handleAudit(invoice)}
                            className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded hover:bg-purple-50"
                            title="Ver historial de cambios"
                          >
                            📋 Auditoría
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Mostrando {invoices.length} factura{invoices.length !== 1 ? 's' : ''}
            </div>
            </>
          )}
        </div>
      </div>



      {/* Edit Modal - Real implementation */}
      {showEditModal && editingInvoice && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-invoice-title"
          aria-describedby="edit-invoice-description"
          onClick={(e) => e.target === e.currentTarget && setShowEditModal(false)}
        >
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 id="edit-invoice-title" className="text-xl font-bold">Editar Factura {editingInvoice.numeroFactura}</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                aria-label="Cerrar modal de edición"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p id="edit-invoice-description" className="sr-only">
              Formulario para editar los detalles de la factura {editingInvoice.numeroFactura || ''}
            </p>
            
            <form onSubmit={handleUpdateInvoice} className="space-y-6">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Factura
                  </label>
                  <input
                    type="text"
                    value={editingInvoice.numeroFactura || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">No editable</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Factura
                  </label>
                  <input
                    type="date"
                    value={editingInvoice.fechaFactura ? editingInvoice.fechaFactura.split('T')[0] : ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      fechaFactura: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={editingInvoice.estado || 'emitida'}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      estado: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="emitida">Emitida</option>
                    <option value="pagada">Pagada</option>
                    <option value="anulada">Anulada</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Pago
                  </label>
                  <input
                    type="date"
                    value={editingInvoice.paymentDate ? editingInvoice.paymentDate.split('T')[0] : ''}
                    onChange={(e) => setEditingInvoice({
                      ...editingInvoice,
                      paymentDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Configuración fiscal */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Fiscal</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo IVA (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingInvoice.tipoIVA || 21}
                      onChange={(e) => setEditingInvoice({
                        ...editingInvoice,
                        tipoIVA: parseFloat(e.target.value) || 21
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingInvoice.descuento || 0}
                      onChange={(e) => setEditingInvoice({
                        ...editingInvoice,
                        descuento: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Retención (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingInvoice.retencion || 0}
                      onChange={(e) => setEditingInvoice({
                        ...editingInvoice,
                        retencion: parseFloat(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Items de la factura */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Conceptos</h3>
                <div className="space-y-3">
                  {editingInvoice.items?.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-md">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción
                        </label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...(editingInvoice.items || [])];
                            newItems[index] = { ...newItems[index], description: e.target.value };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const newItems = [...(editingInvoice.items || [])];
                            newItems[index] = { 
                              ...newItems[index], 
                              quantity: parseInt(e.target.value) || 0,
                              total: (parseInt(e.target.value) || 0) * newItems[index].unitPrice
                            };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio Unitario
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => {
                            const newItems = [...(editingInvoice.items || [])];
                            newItems[index] = { 
                              ...newItems[index], 
                              unitPrice: parseFloat(e.target.value) || 0,
                              total: newItems[index].quantity * (parseFloat(e.target.value) || 0)
                            };
                            setEditingInvoice({ ...editingInvoice, items: newItems });
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.total}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    const newItems = [...(editingInvoice.items || []), {
                      id: `temp-${Date.now()}`,
                      description: '',
                      quantity: 1,
                      unitPrice: 0,
                      total: 0
                    }];
                    setEditingInvoice({ ...editingInvoice, items: newItems });
                  }}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  + Agregar Concepto
                </button>
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Totales</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Base Imponible
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingInvoice.baseImponible || 0}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cuota IVA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingInvoice.cuotaIVA || 0}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Importe Total
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingInvoice.importeTotal || 0}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Metadata Modal */}
      {showMetadataModal && metadataInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Metadatos - Factura {metadataInvoice.numeroFactura}</h2>
              <button 
                onClick={() => setShowMetadataModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Información técnica de la factura. Puedes copiar estos datos al portapapeles.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono">
                {getMetadataText(metadataInvoice)}
              </pre>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  const metadataText = getMetadataText(metadataInvoice);
                  copyToClipboard(metadataText, `Metadatos de factura ${metadataInvoice.numeroFactura}`);
                }}
                disabled={copyingData !== null}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>{copyingData === `Metadatos de factura ${metadataInvoice.numeroFactura}` ? 'Copiando...' : 'Copiar Metadatos'}</span>
              </button>
              <button
                onClick={() => setShowMetadataModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice View Modal */}
      {showInvoiceModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Factura {viewingInvoice.numeroFactura}</h2>
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <InvoiceView invoice={viewingInvoice} />
            </div>
          </div>
        </div>
      )}

      {/* Audit History Modal */}
      {showAuditModal && auditInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold">Historial de Auditoría - Factura {auditInvoice.numeroFactura}</h2>
              <button 
                onClick={() => setShowAuditModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {loadingAudit ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Cargando historial...</span>
                </div>
              ) : auditHistory ? (
                <div className="space-y-6">
                  {/* Resumen */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-blue-900 mb-2">Resumen de Cambios</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Total de cambios:</span> {auditHistory.summary.totalChanges}
                      </div>
                      <div>
                        <span className="font-medium">Última modificación:</span> {auditHistory.summary.lastModified ? new Date(auditHistory.summary.lastModified).toLocaleString() : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Último modificador:</span> {auditHistory.summary.lastModifiedBy || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Cambios por campo */}
                  {Object.keys(auditHistory.summary.changesByField).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Cambios por Campo</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(auditHistory.summary.changesByField).map(([field, count]) => (
                          <div key={field} className="bg-gray-50 p-3 rounded">
                            <span className="font-medium">{field}:</span> {String(count)} cambio{count !== 1 ? 's' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cambios por usuario */}
                  {Object.keys(auditHistory.summary.changesByUser).length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Cambios por Usuario</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(auditHistory.summary.changesByUser).map(([user, count]) => (
                          <div key={user} className="bg-gray-50 p-3 rounded">
                            <span className="font-medium">{user}:</span> {String(count)} cambio{count !== 1 ? 's' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Historial detallado */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Historial Detallado</h3>
                    <div className="space-y-3">
                      {auditHistory.auditHistory.map((record: any) => (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                record.action === 'created' ? 'bg-green-100 text-green-800' :
                                record.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                                record.action === 'deleted' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {record.action === 'created' ? 'Creado' :
                                 record.action === 'updated' ? 'Actualizado' :
                                 record.action === 'deleted' ? 'Eliminado' :
                                 record.action === 'status_changed' ? 'Estado Cambiado' : record.action}
                              </span>
                              {record.fieldName && (
                                <span className="text-sm text-gray-600">Campo: {record.fieldName}</span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(record.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="text-sm text-gray-700 mb-2">
                            {record.description}
                          </div>
                          
                          {record.fieldName && record.oldValue !== record.newValue && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-red-600">Valor anterior:</span>
                                <div className="bg-red-50 p-2 rounded mt-1 break-all">
                                  {record.oldValue || 'Vacío'}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-green-600">Nuevo valor:</span>
                                <div className="bg-green-50 p-2 rounded mt-1 break-all">
                                  {record.newValue || 'Vacío'}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <div>
                                <span className="font-medium">Usuario:</span> {record.user?.name} ({record.user?.email})
                              </div>
                              {record.ipAddress && (
                                <div>
                                  <span className="font-medium">IP:</span> {record.ipAddress}
                                </div>
                              )}
                            </div>
                            {record.userAgent && (
                              <div className="text-xs text-gray-500 mt-1 break-all">
                                <span className="font-medium">User Agent:</span> {record.userAgent}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No se encontró historial de auditoría para esta factura.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesManagementPage; 