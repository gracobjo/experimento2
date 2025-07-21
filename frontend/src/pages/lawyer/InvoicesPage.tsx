import React, { useEffect, useState, useRef } from 'react';
import { getInvoices, createInvoice, signInvoice, deleteInvoice, updateInvoice } from '../../api/invoices';
import { getClients } from '../../api/clients';
import { useAuth } from '../../context/AuthContext';
import { getPendingProvisions, getProvisionesPendientesPorClienteExpediente } from '../../api/provisionFondos';
import api from '../../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import QRCode from 'qrcode';

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
  name: string;
  user: { id: string; email: string };
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
  items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
  aplicarIVA: true,
  retencion: '',
  descuento: 0,
};

const InvoicesPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
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

  // Función helper para formatear fechas al formato yyyy-MM-dd que espera el backend
  const formatDateForBackend = (dateString: string) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Formato yyyy-MM-dd
  };

  // Utilidad para formato español
  const formatNumberES = (num: number) => num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  useEffect(() => {
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
      if (form.receptorId && form.expedienteId && clientProfileId) {
        try {
          const token = localStorage.getItem('token');
          const res = await getProvisionesPendientesPorClienteExpediente(clientProfileId ?? '', form.expedienteId ?? '', token ?? '');
          
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
        } catch {
          setProvisiones([]);
        }
      } else {
        setProvisiones([]);
      }
    };
    fetchProvisiones();
  }, [form.receptorId, form.expedienteId, clientProfileId, form.id]);

  // Modificar fetchInvoices para usar filtros
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      if (!token) {
        throw new Error('No token available');
      }
      const params: any = {};
      if (selectedClientFilter) params.clientId = selectedClientFilter;
      if (selectedPaymentDate) params.paymentDate = selectedPaymentDate;
      const res = await api.get('/invoices', { headers: { Authorization: `Bearer ${token}` }, params });
      setInvoices(res.data);
    } catch (err) {
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
      const data = await getClients(token);
      setClients(data);
    } catch {
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
    setForm(initialForm);
    setProvisionesSeleccionadas([]);
    setFilteredProvisions([]);
    setPendingProvision(null);
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
        const token = localStorage.getItem('token');
        const res = await api.get('/cases', { headers: { Authorization: `Bearer ${token}` } });
        const expedientes = res.data.filter((exp: any) => exp.client?.user?.id === clientId || exp.clientId === clientId);
        setExpedientesCliente(expedientes);
      } catch {
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
    setFormError(null);
    setSuccessMsg(null);
    setCreating(true);
    // Validaciones mínimas
    if (!form.receptorId || !form.fechaOperacion || !form.items.length) {
      setFormError('Completa todos los campos obligatorios.');
      setCreating(false);
      return;
    }
    if (form.items.some((i: any) => !i.description || i.quantity <= 0 || i.unitPrice === undefined)) {
      setFormError('Todos los conceptos deben tener descripción, cantidad y precio válidos.');
      setCreating(false);
      return;
    }
    try {
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
      await createInvoice(facturaData, token ?? '');
      setSuccessMsg('✅ Factura creada correctamente.');
      setShowModal(false);
      fetchInvoices();
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      console.error('Error al crear factura:', err);
      setFormError('❌ Error al crear la factura. Verifica los datos e intenta de nuevo.');
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
      
      await updateInvoice(form.id, facturaData, token ?? '');
      setSuccessMsg('✅ Factura actualizada correctamente.');
      setFormError(null); // Limpiar errores previos
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
        
        setFormError(errorText);
      } else {
        setFormError('❌ Error al actualizar la factura. Verifica los datos e intenta de nuevo.');
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
    setViewingInvoice(inv);
    setShowInvoiceModal(true);
  };

  const handleEdit = async (inv: Invoice) => {
    console.log('EDITANDO FACTURA:', inv);
    console.log('PROVISIONES DE LA FACTURA:', inv.provisionFondos);
    
    // Formatear las fechas para los inputs de tipo date
    const formattedInvoice = {
      ...inv,
      items: inv.items || [],
      aplicarIVA: inv.aplicarIVA !== false, // default true si no existe
      retencion: inv.retencion ?? '',
      descuento: inv.descuento ?? '',
      // Formatear fechaOperacion para el input de tipo date (yyyy-MM-dd)
      fechaOperacion: inv.fechaOperacion ? inv.fechaOperacion.slice(0, 10) : '',
    };
    
    setForm(formattedInvoice);
    setShowModal(true);
    
    // Si la factura tiene un cliente, cargar sus expedientes
    if (inv.receptorId) {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/cases', { headers: { Authorization: `Bearer ${token}` } });
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
    const [html, setHtml] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchHtml = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/invoices/${invoice.id}/html-preview`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('No se pudo cargar la previsualización');
          const htmlText = await res.text();
          setHtml(htmlText);
        } catch (err: any) {
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

    const handleDownload = () => {
      window.open(`/api/invoices/${invoice.id}/pdf-qr`, '_blank');
    };

    if (loading) return <div className="p-8 text-center">Cargando previsualización...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!html) return null;
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className="flex gap-4 mt-8 justify-center">
          <button onClick={handleDownload} className="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800">Descargar PDF</button>
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
          </div>
        </div>
      </header>

      {/* Panel de información */}
      <section aria-labelledby="info-panel-heading">
        <h2 id="info-panel-heading" className="sr-only">
          Información sobre Gestión de Facturas
        </h2>
        <InfoPanel />
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
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.estado === 'emitida' ? 'bg-green-100 text-green-800' :
                      invoice.estado === 'anulada' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {invoice.estado?.toUpperCase() || 'N/A'}
                    </span>
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
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-yellow-600 hover:text-yellow-900 px-2 py-1 rounded hover:bg-yellow-50"
                        title="Editar factura"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                        title="Eliminar factura"
                      >
                        🗑️ Eliminar
                      </button>
                      <button
                        onClick={() => handleMeta(invoice)}
                        className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50"
                        title="Ver metadatos técnicos"
                      >
                        🔍 Metadatos
                      </button>
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
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold">Vista de Factura</h2>
              <button
                onClick={() => setViewingInvoice(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <InvoiceView invoice={viewingInvoice} />
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
              <form onSubmit={editingInvoice ? handleUpdate : handleCreate} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Factura
                    </label>
                    <input
                      type="text"
                      name="numeroFactura"
                      value={form.numeroFactura}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
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
                      <option value="R">Rectificativa</option>
                    </select>
                  </div>
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
                      <option value="emitida">Emitida</option>
                      <option value="pagada">Pagada</option>
                      <option value="anulada">Anulada</option>
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
                        <option key={client.id} value={client.id}>
                          {client.name}
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

                {/* Configuración de IVA */}
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
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setForm(initialForm); // Reset form to initial state
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
    </main>
  );
};

export default InvoicesPage;