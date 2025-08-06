import React, { useEffect, useState, useRef } from 'react';
import { getInvoices, createInvoice, signInvoice, deleteInvoice, updateInvoice } from '../../api/invoices';
import { getClients } from '../../api/clients';
import { useAuth } from '../../context/AuthContext';
import { getPendingProvisions, getProvisionesPendientesPorClienteExpediente, getClientProvisions } from '../../api/provisionFondos';
import api from '../../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';
import InvoiceAuditHistory from '../../components/InvoiceAuditHistory';
import { isInvoiceEditable, isInvoiceAuditable, isInvoiceCancellable, getStatusDisplayName, getStatusColor, getStatusIcon, INVOICE_STATUS } from '../../utils/invoice-status';

// Interfaces para tipado
interface Invoice {
  id: string;
  numeroFactura: string;
  fechaFactura: string;
  tipoFactura: string;
  estado: string;
  receptorId: string;
  importeTotal: number;
  baseImponible: number;
  cuotaIVA: number;
  tipoIVA: number;
  regimenIvaEmisor: string;
  claveOperacion: string;
  metodoPago: string;
  fechaOperacion: string;
  items: InvoiceItem[];
  receptor?: { name: string; email: string };
  emisor?: { name: string; email: string };
  expediente?: { title: string };
  provisionFondos?: any[];
  createdAt: string;
  updatedAt: string;
  motivoAnulacion?: string;
  aplicarIVA?: boolean;
  retencion?: string;
  descuento?: number;
  tipoImpuesto?: string;
  selloTiempo?: string;
  emisorId?: string;
  expedienteId?: string;
  xml?: string;
  xmlFirmado?: string;
  paymentDate?: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Client {
  id: string;
  userId: string;
  dni?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  user: { 
    id: string; 
    name: string; 
    email: string; 
  };
  _count?: {
    expedientes: number;
    appointments: number;
  };
}

interface Expediente {
  id: string;
  title: string;
  clientId: string;
}

const initialForm = {
  numeroFactura: '',
  fechaFactura: '',
  tipoFactura: 'F',
  receptorId: '',
  importeTotal: 0,
  baseImponible: 0,
  cuotaIVA: 0,
  tipoIVA: 21,
  regimenIvaEmisor: 'General',
  claveOperacion: '01',
  metodoPago: 'TRANSFERENCIA',
  fechaOperacion: '',
  estado: 'emitida',
  items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  aplicarIVA: true,
  retencion: '',
  descuento: 0,
  tipoImpuesto: 'iva',
  // Campos para facturas rectificativas
  facturaOriginalId: '',
  tipoRectificacion: '',
  motivoRectificacion: '',
  // Campo para provisiones
  provisionIds: [],
};

const InvoicesPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  console.log('InvoicesPage component initialized');
  console.log('User:', user);
  console.log('Token available:', !!token);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [form, setForm] = useState<any>(initialForm);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [certPath, setCertPath] = useState('');
  const [keyPath, setKeyPath] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [signStatus, setSignStatus] = useState<string>('');
  const [pendingProvision, setPendingProvision] = useState<any>(null);
  const [expedientesCliente, setExpedientesCliente] = useState<Expediente[]>([]);
  const [filteredProvisions, setFilteredProvisions] = useState<any[]>([]);
  const [provisiones, setProvisiones] = useState<any[]>([]);
  const [provisionesSeleccionadas, setProvisionesSeleccionadas] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [metaModal, setMetaModal] = useState<{ open: boolean, text: string } | null>(null);
  const [auditModal, setAuditModal] = useState<{ open: boolean, invoiceId: string } | null>(null);

  // Refs para enfoque automático
  const clienteRef = useRef<HTMLSelectElement | null>(null);
  const expedienteRef = useRef<HTMLSelectElement | null>(null);
  const fechaOperacionRef = useRef<HTMLInputElement | null>(null);
  // Array de refs para los items
  const itemRefs = useRef<any[]>([]);

  // Estado para campos con error
  const [errorFields, setErrorFields] = useState<{
    cliente?: boolean;
    expediente?: boolean;
    fechaOperacion?: boolean;
    items?: { [key: number]: { description?: boolean; quantity?: boolean; unitPrice?: boolean } };
  }>({});

  // Encuentra el perfil de cliente seleccionado
  const selectedClient = clients.find((c: any) => c.user?.id === form.receptorId);
  const clientProfileId = selectedClient?.id;

  // Añadir estados para filtros
  const [selectedClientFilter, setSelectedClientFilter] = useState('');
  const [selectedPaymentDate, setSelectedPaymentDate] = useState('');
  
  // Estados para facturas rectificativas
  const [showRectificativaModal, setShowRectificativaModal] = useState(false);
  const [facturaOriginal, setFacturaOriginal] = useState<Invoice | null>(null);
  const [facturasRectificables, setFacturasRectificables] = useState<Invoice[]>([]);

  // Función helper para formatear fechas al formato yyyy-MM-dd que espera el backend
  const formatDateForBackend = (dateString: string) => {
    if (!dateString) return undefined;
    
    // Si la fecha está en formato dd/MM/yyyy, convertirla
    if (dateString.includes('/')) {
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    // Si es una fecha ISO o ya está en formato yyyy-MM-dd
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', dateString);
      return undefined;
    }
    return date.toISOString().split('T')[0]; // Formato yyyy-MM-dd
  };

  // Utilidad para formato español
  const formatNumberES = (num: number) => num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
    console.log('InvoicesPage useEffect called - fetching data...');
    fetchInvoices();
    fetchClients();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const fetchPendingProvision = async () => {
      if (form.receptorId && form.expedienteId) {
        try {
          const token = localStorage.getItem('token');
          if (!token) throw new Error('No token found');
          const res = await getPendingProvisions(token);
          console.log('Provisiones recibidas:', res);
          console.log('Buscando clientProfileId:', clientProfileId, 'expedienteId:', form.expedienteId);
          
          // Si estamos editando una factura (form.id existe), incluir también las provisiones ya asociadas
          const provisions = res.filter(
            (p: any) =>
              p.clientId === clientProfileId &&
              p.expedienteId === form.expedienteId &&
              (!p.invoiceId || p.invoiceId === form.id) // Incluir provisiones sin factura o asociadas a esta factura
          );
          console.log('Provisiones filtradas:', provisions);
          if (provisions.length > 0) {
            setPendingProvision(provisions[0]);
            setFilteredProvisions(provisions);
            // NO agregamos automáticamente las provisiones como conceptos
            // El usuario debe seleccionarlas manualmente con los checkboxes
          } else {
            setPendingProvision(null);
            setFilteredProvisions([]);
          }
        } catch {
          setPendingProvision(null);
          setFilteredProvisions([]);
        }
      } else {
        setPendingProvision(null);
        setFilteredProvisions([]);
      }
    };
    fetchPendingProvision();
  }, [form.receptorId, form.expedienteId, clientProfileId, form.id]);

  useEffect(() => {
    const fetchProvisiones = async () => {
      console.log('🔍 fetchProvisiones - receptorId:', form.receptorId, 'expedienteId:', form.expedienteId, 'clientProfileId:', clientProfileId);
      
      if (form.receptorId && clientProfileId) {
        try {
          const token = localStorage.getItem('token');
          let res;
          
          if (form.expedienteId) {
            // Si hay expediente seleccionado, buscar provisiones específicas del expediente
            console.log('🔍 Buscando provisiones específicas del expediente:', form.expedienteId);
            res = await getProvisionesPendientesPorClienteExpediente(clientProfileId ?? '', form.expedienteId ?? '', token ?? '');
          } else {
            // Si no hay expediente, buscar todas las provisiones del cliente
            console.log('🔍 Buscando todas las provisiones del cliente:', clientProfileId);
            res = await getClientProvisions(clientProfileId ?? '', token ?? '');
            // Filtrar solo las pendientes
            res = res.filter((p: any) => !p.invoiceId);
          }
          
          console.log('🔍 Provisiones encontradas:', res);
          
          // Si estamos editando una factura, incluir también las provisiones ya asociadas
          if (form.id) {
            const provisionesAsociadas = form.provisionFondos || [];
            const todasLasProvisiones = [...res, ...provisionesAsociadas];
            // Eliminar duplicados por ID
            const provisionesUnicas = todasLasProvisiones.filter((p, index, self) => 
              index === self.findIndex(t => t.id === p.id)
            );
            setProvisiones(provisionesUnicas);
          } else {
            setProvisiones(res);
          }
        } catch (error) {
          console.error('❌ Error al cargar provisiones:', error);
          setProvisiones([]);
        }
      } else {
        console.log('🔍 No se cumplen las condiciones para cargar provisiones');
        setProvisiones([]);
      }
    };
    fetchProvisiones();
  }, [form.receptorId, form.expedienteId, clientProfileId, form.id]);

  // Debug: Monitorear cambios en provisiones
  useEffect(() => {
    console.log('🔍 Provisiones actualizadas:', provisiones.length, provisiones);
  }, [provisiones]);

  // Modificar fetchInvoices para usar filtros
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('No token available');
      }
      console.log('Fetching invoices with token:', token ? 'Present' : 'Missing');
      const params: any = {};
      if (selectedClientFilter) params.clientId = selectedClientFilter;
      if (selectedPaymentDate) params.paymentDate = selectedPaymentDate;
      console.log('Invoices params:', params);
      const res = await api.get('/invoices', { params });
      console.log('Invoices data received:', res.data);
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Error al cargar las facturas');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      if (!token) {
        throw new Error('No token available');
      }
      console.log('Fetching clients with token:', token ? 'Present' : 'Missing');
      const data = await getClients(token);
      console.log('Clients data received:', data);
      console.log('First client structure:', data[0]);
      setClients(data);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]);
    }
  };

  const handleDownload = (xml: string, name: string) => {
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleOpenModal = () => {
    // Generar número de factura automáticamente
    const year = new Date().getFullYear();
    const nextNumber = invoices.length + 1;
    const numeroFactura = `fac-${year}-${nextNumber.toString().padStart(4, '0')}`;
    
    setForm({
      ...initialForm,
      numeroFactura,
      fechaFactura: new Date().toISOString().split('T')[0], // Fecha actual
      fechaOperacion: new Date().toISOString().split('T')[0], // Fecha de operación
    });
    setEditingInvoice(null); // Limpiar la factura que se está editando
    setProvisionesSeleccionadas([]);
    setFilteredProvisions([]);
    setPendingProvision(null);
    setShowModal(true);
  };

  // Función para abrir modal de factura rectificativa
  const handleOpenRectificativaModal = () => {
    // Filtrar facturas que pueden ser rectificadas (emitidas, no anuladas, no rectificativas)
    const rectificables = invoices.filter(inv => 
      inv.estado !== 'anulada' && 
      inv.tipoFactura !== 'R' &&
      inv.estado !== 'borrador'
    );
    setFacturasRectificables(rectificables);
    setShowRectificativaModal(true);
  };

  // Función para seleccionar factura original
  const handleSelectFacturaOriginal = (invoice: Invoice) => {
    setFacturaOriginal(invoice);
    
    // Copiar las provisiones de la factura original
    const provisionesOriginales = invoice.provisionFondos || [];
    const provisionIdsOriginales = provisionesOriginales.map(prov => prov.id);
    
    setForm({
      ...initialForm,
      tipoFactura: 'R',
      receptorId: invoice.receptorId,
      expedienteId: invoice.expedienteId,
      facturaOriginalId: invoice.id,
      // El número de factura se generará automáticamente en el backend
      numeroFactura: '',
      // Copiar datos de la factura original
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total
      })),
      // Mantener algunos datos de la factura original
      tipoIVA: invoice.tipoIVA,
      regimenIvaEmisor: invoice.regimenIvaEmisor,
      metodoPago: invoice.metodoPago,
      // Copiar provisiones de la factura original
      provisionIds: provisionIdsOriginales,
    });
    
    // Cargar las provisiones de la factura original
    setProvisionesSeleccionadas(provisionIdsOriginales);
    setProvisiones(provisionesOriginales);
    
    setShowRectificativaModal(false);
    setShowModal(true);
  };

  const handleFormChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errorFields[name as keyof typeof errorFields]) {
      setErrorFields(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleClientChange = async (e: any) => {
    handleFormChange(e);
    const clientId = e.target.value;
    setForm((prev: any) => ({ ...prev, expedienteId: '' })); // Resetea expediente
    if (clientId) {
      try {
        console.log('Fetching expedientes for client:', clientId);
        const res = await api.get('/cases');
        const expedientes = res.data.filter((exp: any) => exp.client?.user?.id === clientId || exp.clientId === clientId);
        console.log('Expedientes found:', expedientes);
        setExpedientesCliente(expedientes);
      } catch (error) {
        console.error('Error fetching expedientes:', error);
        setExpedientesCliente([]);
      }
    } else {
      setExpedientesCliente([]);
    }
  };

  const handleItemChange = (idx: number, field: string, value: any) => {
    setForm((prev: any) => {
      const items = [...prev.items];
      items[idx][field] = value;
      items[idx].total = items[idx].quantity * items[idx].unitPrice;
      return { ...prev, items };
    });
    
    // Limpiar error del campo del item cuando el usuario empiece a escribir
    if (errorFields.items?.[idx]?.[field as keyof typeof errorFields.items[typeof idx]]) {
      setErrorFields(prev => ({
        ...prev,
        items: {
          ...prev.items,
          [idx]: {
            ...prev.items?.[idx],
            [field]: false
          }
        }
      }));
    }
  };

  const handleAddItem = () => {
    setForm((prev: any) => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] }));
  };

  const handleCreate = async (e: any) => {
    e.preventDefault();
    console.log('handleCreate called');
    setFormError(null);
    setSuccessMsg(null);
    setCreating(true);
    
    // Validaciones mínimas
    if (!form.receptorId || !form.fechaOperacion || !form.items.length) {
      console.log('Validation failed: missing required fields');
      setFormError('Completa todos los campos obligatorios.');
      setCreating(false);
      return;
    }
    if (form.items.some((i: any) => !i.description || i.quantity <= 0 || i.unitPrice === undefined)) {
      console.log('Validation failed: invalid items');
      setFormError('Todos los conceptos deben tener descripción, cantidad y precio válidos.');
      setCreating(false);
      return;
    }
    
    try {
      console.log('Starting invoice creation...');
      // El backend calculará automáticamente los totales basándose en los items
      const { emisorId, fechaFactura, importeTotal, baseImponible, cuotaIVA, ...facturaDataSinCalculos } = form;
      
      // Formatear fechas al formato yyyy-MM-dd que espera el backend
      const facturaData = {
        ...facturaDataSinCalculos,
        descuento: form.descuento === '' || form.descuento == null ? 0 : Number(form.descuento),
        retencion: form.retencion === '' || form.retencion == null ? 0 : Number(form.retencion),
        tipoIVA: form.tipoIVA === '' || form.tipoIVA == null ? 21 : Number(form.tipoIVA),
        estado: form.estado || 'emitida',
        provisionIds: provisionesSeleccionadas,
        // Formatear fechas correctamente
        fechaOperacion: formatDateForBackend(form.fechaOperacion),
        paymentDate: form.paymentDate ? formatDateForBackend(form.paymentDate) : undefined,
      };
      console.log('FRONTEND - provisionesSeleccionadas:', provisionesSeleccionadas);
      console.log('FRONTEND - facturaData a enviar:', facturaData);
      console.log('FRONTEND - form original:', form);
      console.log('FRONTEND - facturaDataSinCalculos:', facturaDataSinCalculos);
      
      const result = await createInvoice(facturaData, token ?? '');
      console.log('Invoice created successfully:', result);
      
      setSuccessMsg('✅ Factura creada correctamente.');
      setShowModal(false);
      await fetchInvoices(); // Refrescar la lista
      
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error al crear factura:', err);
      setError('❌ Error al crear la factura. Verifica los datos e intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  // Modifica handleUpdate para enfoque automático
  const handleUpdate = async (e: any) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);
    setErrorFields({}); // Limpiar errores previos
    setCreating(true);
    
    // Validaciones mínimas
    if (!form.receptorId) {
      setFormError('Debes seleccionar un cliente.');
      setErrorFields({ cliente: true });
      setCreating(false);
      setTimeout(() => clienteRef.current?.focus(), 100);
      return;
    }
    if (!form.expedienteId) {
      setFormError('Debes seleccionar un expediente.');
      setErrorFields({ expediente: true });
      setCreating(false);
      setTimeout(() => expedienteRef.current?.focus(), 100);
      return;
    }
    if (!form.fechaOperacion) {
      setFormError('Debes indicar la fecha de operación.');
      setErrorFields({ fechaOperacion: true });
      setCreating(false);
      setTimeout(() => fechaOperacionRef.current?.focus(), 100);
      return;
    }
    if (!form.items.length) {
      setFormError('Debes añadir al menos un concepto.');
      setCreating(false);
      return;
    }
    // Validar items
    for (let i = 0; i < form.items.length; i++) {
      const item = form.items[i];
      if (!item.description) {
        setFormError('Todos los conceptos deben tener descripción.');
        setErrorFields({ 
          items: { 
            [i]: { description: true } 
          } 
        });
        setCreating(false);
        setTimeout(() => itemRefs.current[i]?.description?.focus(), 100);
        return;
      }
      if (!item.quantity || item.quantity <= 0) {
        setFormError('Todos los conceptos deben tener cantidad válida.');
        setErrorFields({ 
          items: { 
            [i]: { quantity: true } 
          } 
        });
        setCreating(false);
        setTimeout(() => itemRefs.current[i]?.quantity?.focus(), 100);
        return;
      }
      if (item.unitPrice === undefined || item.unitPrice === null) {
        setFormError('Todos los conceptos deben tener precio unitario.');
        setErrorFields({ 
          items: { 
            [i]: { unitPrice: true } 
          } 
        });
        setCreating(false);
        setTimeout(() => itemRefs.current[i]?.unitPrice?.focus(), 100);
        return;
      }
    }
    
    try {
      // Limpiar completamente el objeto, excluyendo TODOS los campos que el backend no acepta
      const {
        id, emisorId, fechaFactura, importeTotal, baseImponible, cuotaIVA,
        xml, xmlFirmado, selloTiempo, createdAt, updatedAt,
        emisor, receptor, expediente, provisionFondos,
        numeroFactura, tipoFactura, qrData, // Campos explícitamente prohibidos
        ...facturaDataSinCalculos
      } = form;
      
      // Limpiar los items, eliminando campos que el backend no acepta
      const itemsLimpios = facturaDataSinCalculos.items.map((item: any) => {
        const { id: itemId, invoiceId, total, ...itemLimpio } = item;
        return itemLimpio;
      });
      
      // Construir el objeto final solo con campos permitidos por UpdateInvoiceDto
      const facturaData = {
        receptorId: facturaDataSinCalculos.receptorId,
        expedienteId: facturaDataSinCalculos.expedienteId,
        fechaOperacion: formatDateForBackend(form.fechaOperacion),
        metodoPago: facturaDataSinCalculos.metodoPago?.toLowerCase() || 'transferencia',
        regimenIvaEmisor: facturaDataSinCalculos.regimenIvaEmisor,
        claveOperacion: facturaDataSinCalculos.claveOperacion,
        tipoIVA: form.tipoIVA === '' || form.tipoIVA == null ? 21 : Number(form.tipoIVA),
        aplicarIVA: facturaDataSinCalculos.aplicarIVA !== false,
        descuento: form.descuento === '' || form.descuento == null ? 0 : Number(form.descuento),
        retencion: form.retencion === '' || form.retencion == null ? 0 : Number(form.retencion),
        items: itemsLimpios,
        provisionIds: provisionesSeleccionadas,
        estado: form.estado || 'emitida',
        motivoAnulacion: facturaDataSinCalculos.motivoAnulacion || null,
        paymentDate: form.paymentDate ? formatDateForBackend(form.paymentDate) : undefined,
      };
      
      console.log('Datos a enviar al backend:', facturaData);
      console.log('Datos originales del form:', form);
      console.log('Items limpios:', itemsLimpios);
      console.log('Fecha de operación original:', form.fechaOperacion);
      console.log('Fecha de operación formateada:', formatDateForBackend(form.fechaOperacion));
      
      await updateInvoice(form.id, facturaData, token ?? '');
      setSuccessMsg('✅ Factura actualizada correctamente.');
      setError(null); // Limpiar errores previos
      setEditingInvoice(null); // Limpiar la factura que se está editando
      fetchInvoices();
      
      // Mantener el mensaje visible por 3 segundos antes de cerrar el modal
      setTimeout(() => {
        setSuccessMsg(null);
        setShowModal(false);
      }, 3000);
    } catch (err: any) {
      console.error('Error al actualizar factura:', err);
      setSuccessMsg(null); // Limpiar mensaje de éxito si hay error
      
      // Mostrar error específico del backend si está disponible
      if (err.response && err.response.data && err.response.data.message) {
        const errorMessages = Array.isArray(err.response.data.message) 
          ? err.response.data.message 
          : [err.response.data.message];
        
        // Crear mensaje de error amigable
        let errorText = '❌ Error al actualizar la factura:\n\n';
        let suggestions: string[] = [];
        
        errorMessages.forEach((msg: string) => {
          if (msg.includes('numeroFactura should not exist')) {
            errorText += '• No puedes editar el número de factura\n';
            suggestions.push('El número de factura se asigna automáticamente');
          } else if (msg.includes('tipoFactura should not exist')) {
            errorText += '• No puedes editar el tipo de factura\n';
            suggestions.push('El tipo de factura no se puede modificar después de la creación');
          } else if (msg.includes('qrData should not exist')) {
            errorText += '• El código QR se genera automáticamente\n';
            suggestions.push('El código QR se calcula automáticamente');
          } else if (msg.includes('total should not exist')) {
            errorText += '• Los totales de los conceptos se calculan automáticamente\n';
            suggestions.push('No edites manualmente los totales de los conceptos');
          } else {
            errorText += `• ${msg}\n`;
          }
        });
        
        if (suggestions.length > 0) {
          errorText += '\n💡 Sugerencias:\n';
          suggestions.forEach(suggestion => {
            errorText += `• ${suggestion}\n`;
          });
        }
        
        setError(errorText);
      } else {
        setError('❌ Error al actualizar la factura. Verifica los datos e intenta de nuevo.');
      }
             // Enfocar campo según error del backend si es posible
       if (err.response && err.response.data && err.response.data.message) {
         const errorMessages = Array.isArray(err.response.data.message) 
           ? err.response.data.message 
           : [err.response.data.message];
         
         // Determinar qué campo tiene error y enfocarlo
         if (errorMessages.some((msg: string) => msg.includes('fechaOperacion'))) {
           setErrorFields({ fechaOperacion: true });
           setTimeout(() => fechaOperacionRef.current?.focus(), 100);
         } else if (errorMessages.some((msg: string) => msg.includes('receptorId'))) {
           setErrorFields({ cliente: true });
           setTimeout(() => clienteRef.current?.focus(), 100);
         } else if (errorMessages.some((msg: string) => msg.includes('expedienteId'))) {
           setErrorFields({ expediente: true });
           setTimeout(() => expedienteRef.current?.focus(), 100);
         }
       }
    } finally {
      setCreating(false);
    }
  };

  // Panel informativo sobre el proceso de firma electrónica
  const InfoPanel = () => (
    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
      <h3 className="font-bold mb-2 text-blue-800" id="info-panel-heading">Información sobre Gestión de Facturas</h3>
      <ol className="list-decimal pl-6 mb-2 text-sm text-blue-900">
        <li>Puedes crear nuevas facturas, editarlas, ver sus detalles, eliminar o consultar sus metadatos.</li>
        <li>Utiliza los botones de la columna de acciones para gestionar cada factura.</li>
      </ol>
      <div className="text-xs text-blue-700">
        <b>¿Problemas?</b> Si tienes dudas sobre la gestión de facturas, contacta con soporte técnico.<br/>
      </div>
    </div>
  );

  // Selección de facturas
  const handleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Handlers para las acciones de la tabla de facturas
  const handleView = (inv: Invoice) => {
    console.log('[FRONTEND] Abriendo modal para factura:', inv.id, inv.numeroFactura);
    setViewingInvoice(inv);
    // No necesitamos setShowInvoiceModal porque el modal se abre con viewingInvoice
  };

  const handleEdit = async (inv: Invoice) => {
    console.log('EDITANDO FACTURA:', inv);
    console.log('PROVISIONES DE LA FACTURA:', inv.provisionFondos);
    
    // Verificar si la factura es editable
    if (!isInvoiceEditable(inv.estado)) {
      setFormError(`No se puede editar una factura con estado '${getStatusDisplayName(inv.estado)}'. Solo se pueden editar facturas en estado 'Borrador' o 'Emitida'.`);
      return;
    }
    
    // Formatear las fechas para los inputs de tipo date
    const formattedInvoice = {
      ...inv,
      items: inv.items || [],
      aplicarIVA: inv.aplicarIVA !== false, // default true si no existe
      retencion: inv.retencion ?? '',
      descuento: inv.descuento ?? '',
      tipoImpuesto: inv.tipoImpuesto || (inv.retencion && inv.retencion > 0 ? 'retencion' : 'iva'),
      // Formatear fechaOperacion para el input de tipo date (yyyy-MM-dd)
      fechaOperacion: inv.fechaOperacion ? inv.fechaOperacion.slice(0, 10) : '',
    };
    
    setForm(formattedInvoice);
    setEditingInvoice(inv); // ¡ESTA LÍNEA FALTABA!
    setShowModal(true);
    
    // Si la factura tiene un cliente, cargar sus expedientes
    if (inv.receptorId) {
      try {
        const res = await api.get('/cases');
        const expedientes = res.data.filter((exp: any) => exp.client?.user?.id === inv.receptorId || exp.clientId === inv.receptorId);
        setExpedientesCliente(expedientes);
      } catch {
        setExpedientesCliente([]);
      }
    }
    
    // Si la factura tiene provisiones asociadas, seleccionarlas automáticamente
    if (inv.provisionFondos && inv.provisionFondos.length > 0) {
      console.log('PROVISIONES ENCONTRADAS:', inv.provisionFondos);
      const provisionIds = inv.provisionFondos.map((p: any) => p.id);
      console.log('PROVISION IDs:', provisionIds);
      setProvisionesSeleccionadas(provisionIds);
      setFilteredProvisions(inv.provisionFondos);
      setPendingProvision(inv.provisionFondos[0]);
    } else {
      console.log('NO HAY PROVISIONES EN LA FACTURA');
      setProvisionesSeleccionadas([]);
      setFilteredProvisions([]);
      setPendingProvision(null);
    }
  };
  const handleDelete = async (id: string) => {
    // Buscar la factura para verificar su estado
    const invoice = invoices.find(inv => inv.id === id);
    if (!invoice) {
      setError('❌ No se encontró la factura.');
      return;
    }

    // Verificar si la factura puede ser anulada
    if (!isInvoiceCancellable(invoice.estado)) {
      setError(`❌ No se puede eliminar una factura con estado '${getStatusDisplayName(invoice.estado)}'. Solo se pueden eliminar facturas en estado 'borrador', 'emitida' o 'enviada'.`);
      setTimeout(() => setError(null), 5000);
      return;
    }

    if (window.confirm('¿Estás seguro de que quieres eliminar esta factura? Esta acción no se puede deshacer.')) {
      setDeletingId(id);
      try {
        await deleteInvoice(id, token ?? '');
        await fetchInvoices(); // Refrescar la lista después de eliminar
        setSuccessMsg('🗑️ Factura eliminada correctamente.');
        // Limpiar el mensaje después de 5 segundos
        setTimeout(() => setSuccessMsg(null), 5000);
      } catch (error: any) {
        console.error('Error al eliminar factura:', error);
        const errorMessage = error?.response?.data?.message || error?.message || 'Error al eliminar la factura.';
        setError(`❌ Error al eliminar la factura: ${errorMessage}`);
        // Limpiar el error después de 5 segundos
        setTimeout(() => setError(null), 5000);
      } finally {
        setDeletingId(null);
      }
    }
  };
  const handleAudit = (inv: Invoice) => {
    setAuditModal({ open: true, invoiceId: inv.id });
  };

  const handleMeta = (inv: Invoice) => {
    const metadata = {
      'Información General': {
        'ID': inv.id,
        'Número de Factura': inv.numeroFactura,
        'Tipo': inv.tipoFactura,
        'Estado': inv.estado,
        'Fecha de Creación': new Date(inv.createdAt).toLocaleString('es-ES'),
        'Última Actualización': new Date(inv.updatedAt).toLocaleString('es-ES'),
      },
      'Fechas': {
        'Fecha de Factura': new Date(inv.fechaFactura).toLocaleDateString('es-ES'),
        'Fecha de Operación': new Date(inv.fechaOperacion).toLocaleDateString('es-ES'),
        'Sello de Tiempo': inv.selloTiempo ? new Date(inv.selloTiempo).toLocaleString('es-ES') : 'No aplicado',
      },
      'Datos Fiscales': {
        'Base Imponible': `${formatNumberES(inv.baseImponible)} €`,
        'Cuota IVA': `${formatNumberES(inv.cuotaIVA)} €`,
        'Tipo IVA': `${inv.tipoIVA}%`,
        'Importe Total': `${formatNumberES(inv.importeTotal)} €`,
        'Régimen IVA Emisor': inv.regimenIvaEmisor,
        'Clave de Operación': inv.claveOperacion,
        'Método de Pago': inv.metodoPago,
      },
      'Relaciones': {
        'Emisor ID': inv.emisorId,
        'Receptor ID': inv.receptorId,
        'Expediente ID': inv.expedienteId || 'No asociado',
        'Número de Items': inv.items?.length || 0,
        'Provisiones Asociadas': inv.provisionFondos?.length || 0,
      },
      'XML': {
        'XML Generado': inv.xml ? 'Sí' : 'No',
        'XML Firmado': inv.xmlFirmado ? 'Sí' : 'No',
        'Tamaño XML': inv.xml ? `${Math.round(inv.xml.length / 1024)} KB` : 'N/A',
        'Tamaño XML Firmado': inv.xmlFirmado ? `${Math.round(inv.xmlFirmado.length / 1024)} KB` : 'N/A',
      },
      'Anulación': inv.motivoAnulacion ? {
        'Motivo de Anulación': inv.motivoAnulacion,
      } : 'No anulada',
    };

    const metadataText = Object.entries(metadata)
      .map(([section, data]) => {
        if (typeof data === 'string') {
          return `${section}: ${data}`;
        }
        return `${section}:\n${Object.entries(data)
          .map(([key, value]) => `  ${key}: ${value}`)
          .join('\n')}`;
      })
      .join('\n\n');

    setMetaModal({ open: true, text: metadataText });
  };

  // Componente para mostrar la factura completa
  const InvoiceView = ({ invoice }: { invoice: Invoice }) => {
    console.log('[FRONTEND] InvoiceView renderizado para factura:', invoice.id, invoice.numeroFactura);
    const [html, setHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchHtml = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('token');
          console.log('[FRONTEND] Cargando HTML preview para factura:', invoice.id);
          
          // Usar URL directa al backend
          const res = await fetch(`https://experimento2-production.up.railway.app/api/invoices/${invoice.id}/html-preview`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          });
          
          console.log('[FRONTEND] Status de respuesta HTML:', res.status);
          
          if (!res.ok) {
            const errorText = await res.text();
            console.error('[FRONTEND] Error response HTML:', errorText);
            throw new Error(`No se pudo cargar la previsualización: ${res.status} ${res.statusText}`);
          }
          
          const htmlText = await res.text();
          console.log('[FRONTEND] HTML recibido, longitud:', htmlText.length);
          console.log('[FRONTEND] Primeros 200 caracteres:', htmlText.substring(0, 200));
          
          setHtml(htmlText);
        } catch (err: any) {
          console.error('[FRONTEND] Error cargando HTML:', err);
          setError(err.message || 'Error desconocido');
        } finally {
          setLoading(false);
        }
      };
      fetchHtml();
    }, [invoice.id]);

    const handlePrint = () => {
      window.print();
    };

    const handleDownload = async () => {
      try {
        console.log('[FRONTEND] Iniciando descarga de PDF para factura:', invoice.id);
        const token = localStorage.getItem('token');
        console.log('[FRONTEND] Token disponible:', !!token);
        
        // Intentar con URL directa al backend
        const downloadUrl = `https://experimento2-production.up.railway.app/api/invoices/${invoice.id}/pdf-qr`;
        console.log('[FRONTEND] URL de descarga directa:', downloadUrl);
        
        const response = await fetch(downloadUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        });
        
        console.log('[FRONTEND] Status de respuesta:', response.status);
        console.log('[FRONTEND] Headers de respuesta:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[FRONTEND] Error response:', errorText);
          throw new Error(`Error al descargar el PDF: ${response.status} ${response.statusText}`);
        }
        
        const blob = await response.blob();
        console.log('[FRONTEND] Blob recibido. Tamaño:', blob.size, 'bytes');
        console.log('[FRONTEND] Tipo de contenido:', blob.type);
        
        // Verificar que es un PDF
        if (blob.type !== 'application/pdf') {
          console.error('[FRONTEND] Error: El contenido no es un PDF. Tipo:', blob.type);
          // Leer el contenido para debug
          const text = await blob.text();
          console.error('[FRONTEND] Contenido recibido:', text.substring(0, 200));
          throw new Error('El archivo descargado no es un PDF válido');
        }
        
        // Verificar que el PDF es válido leyendo los primeros bytes
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const header = String.fromCharCode.apply(null, uint8Array.slice(0, 4));
        console.log('[FRONTEND] Header del PDF:', header);
        
        if (header !== '%PDF') {
          console.error('[FRONTEND] Error: El archivo no es un PDF válido. Header:', header);
          const text = await blob.text();
          console.error('[FRONTEND] Contenido completo:', text);
          throw new Error('El archivo descargado no es un PDF válido');
        }
        
        console.log('[FRONTEND] PDF válido detectado');
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `factura_${invoice.numeroFactura || invoice.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
        
        console.log('[FRONTEND] PDF descargado exitosamente');
      } catch (error) {
        console.error('[FRONTEND] Error downloading PDF:', error);
        alert(`Error al descargar el PDF: ${error.message}`);
      }
    };

    if (loading) return <div className="p-8 text-center">Cargando previsualización...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!html) return <div className="p-8 text-center text-gray-500">No se pudo cargar el contenido de la factura</div>;
    
    return (
      <div className="invoice-preview-container">
        {/* Debug info */}
        <div className="mb-4 p-2 bg-gray-100 text-xs">
          <p>HTML length: {html.length}</p>
          <p>HTML preview: {html.substring(0, 100)}...</p>
        </div>
        
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
        
        {/* Botones de acción */}
        <div className="flex gap-4 mt-8 justify-center">
          <button 
            onClick={handlePrint} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            🖨️ Imprimir
          </button>
          <button 
            onClick={handleDownload} 
            className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
          >
            📄 Descargar PDF
          </button>
        </div>
      </div>
    );
  };

  return (
    <main className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Gestión de Facturas</h1>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={handleOpenModal}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Nueva Factura
            </button>
            <button
              onClick={handleOpenRectificativaModal}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
              title="Crear factura rectificativa basada en una factura existente"
            >
              Factura Rectificativa
            </button>
          </div>
        </div>
      </header>

      {/* Mensajes de éxito y error */}
      {successMsg && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg" role="alert">
          {successMsg}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-600 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {/* Debug info */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Loading: {loading ? 'Yes' : 'No'}</p>
        <p>Clients loaded: {clients.length}</p>
        <p>Invoices loaded: {invoices.length}</p>
        <p>Error: {error || 'None'}</p>
      </div>

      {/* Panel de información */}
      <section aria-labelledby="info-panel-heading">
        <h2 id="info-panel-heading" className="sr-only">
          Información sobre Gestión de Facturas
        </h2>
        <InfoPanel />
      </section>

      {/* Sección de Clientes y Expedientes */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Clientes y Expedientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lista de Clientes */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Clientes ({clients.length})</h3>
            {clients.length > 0 ? (
              <div className="space-y-2">
                {clients.map((client) => (
                  <div key={client.id} className="p-2 border rounded">
                    <p className="font-medium">{client.user?.name || 'Cliente sin nombre'}</p>
                    <p className="text-sm text-gray-600">{client.user?.email}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No hay clientes disponibles</p>
            )}
          </div>

          {/* Lista de Expedientes */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Expedientes</h3>
            <p className="text-gray-500">Los expedientes se cargan al seleccionar un cliente</p>
          </div>
        </div>
      </section>

      {/* Tabla de facturas */}
      <section aria-labelledby="invoices-table-heading">
        <h2 id="invoices-table-heading" className="text-xl font-semibold text-gray-800 mb-4">
          Lista de Facturas
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <label htmlFor="select-all-invoices" className="sr-only">
                    Seleccionar todas las facturas
                  </label>
                  <input
                    id="select-all-invoices"
                    type="checkbox"
                    checked={selected.length === invoices.length && invoices.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelected(invoices.map(inv => inv.id));
                      } else {
                        setSelected([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    aria-describedby="select-all-help"
                  />
                  <span id="select-all-help" className="sr-only">
                    Marca esta casilla para seleccionar todas las facturas de la lista
                  </span>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Número
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Importe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provisiones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label htmlFor={`select-invoice-${invoice.id}`} className="sr-only">
                      Seleccionar factura {invoice.numeroFactura}
                    </label>
                    <input
                      id={`select-invoice-${invoice.id}`}
                      type="checkbox"
                      checked={selected.includes(invoice.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelected([...selected, invoice.id]);
                        } else {
                          setSelected(selected.filter(id => id !== invoice.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      aria-describedby={`select-invoice-help-${invoice.id}`}
                    />
                    <span id={`select-invoice-help-${invoice.id}`} className="sr-only">
                      Marca esta casilla para seleccionar la factura {invoice.numeroFactura}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.numeroFactura}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.fechaFactura ? new Date(invoice.fechaFactura).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.receptor?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.importeTotal ? `${formatNumberES(invoice.importeTotal)} €` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.estado)}`}>
                      {getStatusIcon(invoice.estado)} {getStatusDisplayName(invoice.estado)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.provisionFondos && invoice.provisionFondos.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-green-600">
                          ✓ {invoice.provisionFondos.length} provisión{invoice.provisionFondos.length > 1 ? 'es' : ''}
                        </span>
                        <span className="text-xs text-gray-500">
                          Total: {new Intl.NumberFormat('es-ES', { 
                            style: 'currency', 
                            currency: 'EUR' 
                          }).format(invoice.provisionFondos.reduce((sum, p) => sum + p.amount, 0))}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sin provisiones</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(invoice)}
                        className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded"
                        title="Ver factura completa con todos los detalles"
                      >
                        👁️ Ver
                      </button>
                      {/* Botón de editar - solo si la factura es editable */}
                      {isInvoiceEditable(invoice.estado) && (
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded hover:bg-yellow-50"
                          title="Editar factura"
                        >
                          ✏️ Editar
                        </button>
                      )}
                      {/* Botón de eliminar - solo si la factura puede ser anulada */}
                      {isInvoiceCancellable(invoice.estado) && (
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                          title="Eliminar factura (no disponible si está notificada al cliente)"
                        >
                          🗑️ Eliminar
                        </button>
                      )}
                      <button
                        onClick={() => handleMeta(invoice)}
                        className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50"
                        title="Ver metadatos técnicos"
                      >
                        🔍 Metadatos
                      </button>
                      {/* Botón de auditoría - solo para ADMIN y ABOGADO, y solo si la factura permite auditoría */}
                      {(user?.role === 'ADMIN' || user?.role === 'ABOGADO') && 
                       isInvoiceAuditable(invoice.estado) && (
                        <button
                          onClick={() => handleAudit(invoice)}
                          className="text-purple-600 hover:text-purple-900 px-2 py-1 rounded hover:bg-purple-50"
                          title="Ver historial de auditoría (disponible en cualquier estado)"
                        >
                          📋 Auditoría
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </section>

      {/* Modal de vista de factura */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">
                Vista de Factura - {viewingInvoice.numeroFactura}
              </h2>
              <button
                onClick={() => {
                  console.log('[FRONTEND] Cerrando modal de factura');
                  setViewingInvoice(null);
                }}
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

      {/* Modal de creación/edición */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingInvoice ? 'Editar Factura' : 'Nueva Factura'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingInvoice(null);
                  setForm(initialForm);
                  setProvisionesSeleccionadas([]);
                  setFilteredProvisions([]);
                  setPendingProvision(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              {/* Mensajes de éxito y error */}
              {successMsg && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                  {successMsg}
                </div>
              )}
              {formError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {formError}
                </div>
              )}
              
              <form onSubmit={editingInvoice ? handleUpdate : handleCreate} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Factura
                    </label>
                    <input
                      type="text"
                      name="numeroFactura"
                      value={form.numeroFactura}
                      onChange={handleFormChange}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        form.tipoFactura === 'R' ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={form.tipoFactura === 'R'}
                      placeholder={form.tipoFactura === 'R' ? 'Se generará automáticamente' : 'Ingrese número de factura'}
                    />
                    {form.tipoFactura === 'R' && (
                      <p className="text-xs text-gray-500 mt-1">
                        El número se generará automáticamente basado en la factura original
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Factura
                    </label>
                    <input
                      type="date"
                      name="fechaFactura"
                      value={form.fechaFactura}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Operación
                    </label>
                    <input
                      type="date"
                      name="fechaOperacion"
                      value={form.fechaOperacion}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Factura
                    </label>
                    <select
                      name="tipoFactura"
                      value={form.tipoFactura}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="F">Completa</option>
                    </select>
                  </div>
                  
                  {/* Campos específicos para facturas rectificativas */}
                  {form.tipoFactura === 'R' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Rectificación
                        </label>
                        <select
                          name="tipoRectificacion"
                          value={form.tipoRectificacion}
                          onChange={handleFormChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={form.tipoFactura === 'R'}
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="R1">R1 - Por anulación</option>
                          <option value="R2">R2 - Por corrección</option>
                          <option value="R3">R3 - Por descuento</option>
                          <option value="R4">R4 - Por devolución</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Motivo de Rectificación
                        </label>
                        <input
                          type="text"
                          name="motivoRectificacion"
                          value={form.motivoRectificacion}
                          onChange={handleFormChange}
                          placeholder="Especificar motivo de la rectificación"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required={form.tipoFactura === 'R'}
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={form.estado}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="borrador">📝 Borrador</option>
                      <option value="emitida">📄 Emitida</option>
                      <option value="enviada">📤 Enviada</option>
                      <option value="notificada">📢 Notificada al Cliente</option>
                      <option value="aceptada">✅ Aceptada</option>
                      <option value="rechazada">❌ Rechazada</option>
                      <option value="anulada">🚫 Anulada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Pago
                    </label>
                    <select
                      name="metodoPago"
                      value={form.metodoPago}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="transferencia">Transferencia</option>
                      <option value="efectivo">Efectivo</option>
                      <option value="tarjeta">Tarjeta</option>
                    </select>
                  </div>
                </div>

                {/* Información de factura original para rectificativas */}
                {form.tipoFactura === 'R' && facturaOriginal && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
                    <h3 className="font-semibold text-blue-800 mb-2">Factura Original</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Número:</span> {facturaOriginal.numeroFactura}
                      </div>
                      <div>
                        <span className="font-medium">Fecha:</span> {new Date(facturaOriginal.fechaFactura).toLocaleDateString('es-ES')}
                      </div>
                      <div>
                        <span className="font-medium">Cliente:</span> {facturaOriginal.receptor?.name}
                      </div>
                      <div>
                        <span className="font-medium">Importe:</span> {formatNumberES(facturaOriginal.importeTotal)} €
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span> {getStatusDisplayName(facturaOriginal.estado)}
                      </div>
                      <div>
                        <span className="font-medium">Expediente:</span> {facturaOriginal.expediente?.title || 'Sin expediente'}
                      </div>
                    </div>
                    
                    {/* Información de provisiones de la factura original */}
                    {facturaOriginal.provisionFondos && facturaOriginal.provisionFondos.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">Provisiones Aplicadas en Factura Original:</h4>
                        <div className="space-y-1 text-sm">
                          {facturaOriginal.provisionFondos.map((provision: any, index: number) => (
                            <div key={provision.id} className="flex justify-between">
                              <span>{provision.description || `Provisión ${index + 1}`}</span>
                              <span className="font-medium">{formatNumberES(provision.amount)} €</span>
                            </div>
                          ))}
                          <div className="pt-1 border-t border-blue-200">
                            <div className="flex justify-between font-medium">
                              <span>Total Provisiones:</span>
                              <span>{formatNumberES(facturaOriginal.provisionFondos.reduce((sum: number, prov: any) => sum + prov.amount, 0))} €</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                          <strong>Nota:</strong> Las provisiones de la factura original se copiarán automáticamente a la rectificativa.
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Cliente y expediente */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente
                    </label>
                    <select
                      name="receptorId"
                      value={form.receptorId}
                      onChange={handleClientChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Seleccionar cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.user?.id || client.id}>
                          {client.user?.name || 'Cliente sin nombre'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expediente
                    </label>
                    <select
                      name="expedienteId"
                      value={form.expedienteId}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Sin expediente</option>
                      {expedientesCliente.map((expediente) => (
                        <option key={expediente.id} value={expediente.id}>
                          {expediente.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conceptos */}
                <fieldset>
                  <legend className="block text-sm font-medium text-gray-700 mb-2">
                    Conceptos de la Factura
                  </legend>
                  <div className="space-y-2">
                    {form.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2">
                        <div>
                          <label htmlFor={`description-${index}`} className="sr-only">
                            Descripción del concepto {index + 1}
                          </label>
                          <input
                            id={`description-${index}`}
                            type="text"
                            placeholder="Descripción"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-describedby={`description-help-${index}`}
                          />
                          <p id={`description-help-${index}`} className="sr-only">
                            Introduce la descripción del concepto {index + 1}
                          </p>
                        </div>
                        <div>
                          <label htmlFor={`quantity-${index}`} className="sr-only">
                            Cantidad del concepto {index + 1}
                          </label>
                          <input
                            id={`quantity-${index}`}
                            type="number"
                            min="0"
                            step="1"
                            placeholder="Cantidad"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-describedby={`quantity-help-${index}`}
                          />
                          <p id={`quantity-help-${index}`} className="sr-only">
                            Introduce la cantidad del concepto {index + 1}
                          </p>
                        </div>
                        <div>
                          <label htmlFor={`unitPrice-${index}`} className="sr-only">
                            Precio unitario del concepto {index + 1}
                          </label>
                          <input
                            id={`unitPrice-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="Precio unitario"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-describedby={`unitPrice-help-${index}`}
                          />
                          <p id={`unitPrice-help-${index}`} className="sr-only">
                            Introduce el precio unitario del concepto {index + 1} en euros
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {(item.quantity * item.unitPrice).toFixed(2)} €
                          </span>
                          {form.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = form.items.filter((_, i) => i !== index);
                                setForm({ ...form, items: newItems });
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                      aria-describedby="add-item-help"
                    >
                      + Añadir concepto
                    </button>
                    <p id="add-item-help" className="sr-only">
                      Haz clic para añadir un nuevo concepto a la factura
                    </p>
                  </div>
                </fieldset>

                {/* Provisión de Fondos */}
                {provisiones.length > 0 && (
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">
                      Provisiones de Fondos Disponibles
                    </legend>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                      {form.tipoFactura === 'R' ? (
                        <div className="mb-3">
                          <p className="text-sm text-blue-700 mb-2">
                            <strong>Factura Rectificativa:</strong> Las provisiones de la factura original se han copiado automáticamente.
                          </p>
                          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                            <strong>✓ Copiadas automáticamente:</strong> {provisiones.length} provisión(es) de la factura original
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-blue-700 mb-3">
                          Selecciona las provisiones que quieres aplicar a esta factura. Se descontarán automáticamente del total.
                        </p>
                      )}
                                              <div className="space-y-2">
                          {provisiones.map((provision) => (
                            <div key={provision.id} className="flex items-center">
                              <input
                                type="checkbox"
                                id={`provision-${provision.id}`}
                                checked={provisionesSeleccionadas.includes(provision.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProvisionesSeleccionadas([...provisionesSeleccionadas, provision.id]);
                                  } else {
                                    setProvisionesSeleccionadas(provisionesSeleccionadas.filter(id => id !== provision.id));
                                  }
                                }}
                                disabled={form.tipoFactura === 'R'}
                                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                                  form.tipoFactura === 'R' ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              />
                            <label htmlFor={`provision-${provision.id}`} className="ml-2 text-sm text-gray-700">
                              <span className="font-medium">{provision.description || 'Sin descripción'}</span>
                              <span className="text-gray-500 ml-2">
                                ({new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(provision.amount)})
                              </span>
                              {provision.invoiceId && (
                                <span className="text-green-600 ml-2 text-xs">✓ Ya vinculada</span>
                              )}
                            </label>
                          </div>
                        ))}
                      </div>
                      {provisionesSeleccionadas.length > 0 && (
                        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded">
                          <p className="text-sm text-green-700">
                            Total de provisiones seleccionadas: {new Intl.NumberFormat('es-ES', { 
                              style: 'currency', 
                              currency: 'EUR' 
                            }).format(provisiones.filter(p => provisionesSeleccionadas.includes(p.id)).reduce((sum, p) => sum + p.amount, 0))}
                          </p>
                        </div>
                      )}
                      
                      {/* Advertencia si las provisiones exceden la base imponible */}
                      {(() => {
                        const totalProvisiones = provisiones.filter(p => provisionesSeleccionadas.includes(p.id)).reduce((sum, p) => sum + p.amount, 0);
                        const baseImponible = form.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                        
                        if (totalProvisiones > baseImponible) {
                          const exceso = totalProvisiones - baseImponible;
                          return (
                            <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
                              <p className="text-sm text-yellow-800 font-medium">
                                ⚠️ Advertencia: Las provisiones exceden la base imponible
                              </p>
                              <p className="text-xs text-yellow-700 mt-1">
                                Base imponible: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(baseImponible)}
                              </p>
                              <p className="text-xs text-yellow-700">
                                Provisiones: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalProvisiones)}
                              </p>
                              <p className="text-xs text-yellow-700">
                                Exceso: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(exceso)}
                              </p>
                              <p className="text-xs text-yellow-700 mt-2">
                                <strong>Se agregará automáticamente un concepto de "Devolución de Provisión" por el exceso.</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </fieldset>
                )}

                {/* Configuración Fiscal */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Régimen IVA Emisor
                    </label>
                    <select
                      name="regimenIvaEmisor"
                      value={form.regimenIvaEmisor}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Simplificado">Simplificado</option>
                      <option value="Exento">Exento</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      name="descuento"
                      value={form.descuento}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Impuesto
                    </label>
                    <select
                      name="tipoImpuesto"
                      value={form.tipoImpuesto || 'iva'}
                      onChange={(e) => {
                        const tipo = e.target.value;
                        setForm((prev: any) => ({
                          ...prev,
                          tipoImpuesto: tipo,
                          // Si selecciona retención, quitar IVA
                          tipoIVA: tipo === 'retencion' ? 0 : (prev.tipoIVA || 21),
                          // Si selecciona IVA, quitar retención
                          retencion: tipo === 'iva' ? 0 : (prev.retencion || 15)
                        }));
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="iva">IVA</option>
                      <option value="retencion">Retención</option>
                    </select>
                  </div>
                </div>

                {/* Configuración específica según tipo de impuesto */}
                {form.tipoImpuesto === 'iva' ? (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo IVA (%)
                      </label>
                      <input
                        type="number"
                        name="tipoIVA"
                        value={form.tipoIVA}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Retención (%)
                      </label>
                      <input
                        type="number"
                        name="retencion"
                        value={form.retencion}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Botones */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setForm(initialForm); // Reset form to initial state
                      setEditingInvoice(null); // Limpiar la factura que se está editando
                      setProvisionesSeleccionadas([]);
                      setFilteredProvisions([]);
                      setPendingProvision(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingInvoice ? 'Actualizar Factura' : 'Crear Factura'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de metadatos copiables */}
      {metaModal?.open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h2 className="text-lg font-bold mb-2">Metadatos de la Factura</h2>
            <textarea
              className="w-full h-64 p-2 border rounded bg-gray-50 text-xs font-mono mb-4"
              value={metaModal.text}
              readOnly
              onFocus={e => e.target.select()}
            />
            <div className="flex gap-4 justify-end">
              <button
                className="px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
                onClick={() => {
                  navigator.clipboard.writeText(metaModal.text);
                }}
              >
                Copiar
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                onClick={() => setMetaModal(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de selección de factura original para rectificativa */}
      {showRectificativaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Seleccionar Factura Original</h2>
              <button
                onClick={() => setShowRectificativaModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                Selecciona la factura que quieres rectificar. Solo se muestran facturas que pueden ser rectificadas.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                <h3 className="font-semibold text-blue-800 mb-2">Tipos de Rectificación:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li><strong>R1 - Por anulación:</strong> Anula completamente la factura original</li>
                  <li><strong>R2 - Por corrección:</strong> Corrige datos fiscales de la factura</li>
                  <li><strong>R3 - Por descuento:</strong> Aplica descuentos posteriores</li>
                  <li><strong>R4 - Por devolución:</strong> Devuelve parcialmente la factura</li>
                </ul>
              </div>
            </div>

            {facturasRectificables.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay facturas que puedan ser rectificadas.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Solo se pueden rectificar facturas emitidas que no estén anuladas.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Número
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Importe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {facturasRectificables.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {invoice.numeroFactura}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(invoice.fechaFactura).toLocaleDateString('es-ES')}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {invoice.receptor?.name || 'Cliente no encontrado'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatNumberES(invoice.importeTotal)} €
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.estado)}`}>
                            {getStatusDisplayName(invoice.estado)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleSelectFacturaOriginal(invoice)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Seleccionar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de historial de auditoría */}
      {auditModal?.open && (
        <InvoiceAuditHistory
          invoiceId={auditModal.invoiceId}
          isOpen={auditModal.open}
          onClose={() => setAuditModal(null)}
          currentUser={user || undefined}
        />
      )}
    </main>
  );
};

export default InvoicesPage;