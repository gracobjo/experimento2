import React, { useEffect, useState, useRef } from 'react';
import { getInvoices, createInvoice, signInvoice, deleteInvoice, updateInvoice } from '../../api/invoices';
import { getClients } from '../../api/clients';
import { useAuth } from '../../context/AuthContext';
import { getPendingProvisions, getProvisionesPendientesPorClienteExpediente } from '../../api/provisionFondos';
import api from '../../api/axios';
import QRCode from 'react-qr-code';

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
  descuento: '',
};

const InvoicesPage = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(initialForm);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [certPath, setCertPath] = useState('');
  const [keyPath, setKeyPath] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [keyFile, setKeyFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [signStatus, setSignStatus] = useState<string>('');
  const [pendingProvision, setPendingProvision] = useState<any>(null);
  const [expedientesCliente, setExpedientesCliente] = useState<any[]>([]);
  const [filteredProvisions, setFilteredProvisions] = useState<any[]>([]);
  const [provisiones, setProvisiones] = useState<any[]>([]);
  const [provisionesSeleccionadas, setProvisionesSeleccionadas] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<any>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

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
  const selectedClient = clients.find((c: any) => c.user.id === form.receptorId);
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

  const handleSign = async (id: string) => {
    let certContent = certPath;
    let keyContent = keyPath;
    if (certFile) {
      certContent = await certFile.text();
    }
    if (keyFile) {
      keyContent = await keyFile.text();
    }
    if (!certContent || !keyContent) {
      alert('Debes indicar la ruta o subir el certificado y la clave privada.');
      return;
    }
    setSigningId(id);
    try {
      await signInvoice(id, certContent, keyContent, token ?? '');
      setSuccessMsg('🔐 Factura firmada electrónicamente correctamente.');
      fetchInvoices();
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setFormError('❌ Error al firmar la factura. Verifica el certificado y la clave privada.');
    } finally {
      setSigningId(null);
    }
  };

  // Panel informativo sobre el proceso de firma electrónica
  const InfoPanel = () => (
    <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
      <h2 className="font-bold mb-2 text-blue-800">¿Cómo funciona la firma electrónica de facturas?</h2>
      <ol className="list-decimal pl-6 mb-2 text-sm text-blue-900">
        <li>Selecciona una o varias facturas pendientes de firma en la tabla.</li>
        <li>Pulsa <b>"Firmar electrónicamente"</b> para iniciar el proceso.</li>
        <li>El sistema generará el XML Facturae y lo enviará a <b>Autofirma</b> (debes tenerlo instalado y abierto).</li>
        <li>Autofirma te pedirá seleccionar tu certificado y firmará el XML localmente, sin exponer tu clave privada.</li>
        <li>El XML firmado se subirá automáticamente y la factura quedará firmada digitalmente.</li>
      </ol>
      <div className="text-xs text-blue-700">
        <b>Seguridad:</b> Tu clave privada <b>nunca se almacena</b> en el sistema. Si subes archivos PEM, solo se usan en memoria para la firma y se descartan después.<br/>
        <b>¿Qué es Autofirma?</b> Es una aplicación oficial del Gobierno de España para firmar documentos electrónicos con tu certificado digital.<br/>
        <b>¿Problemas?</b> Si no tienes Autofirma, puedes descargarlo en <a href="https://firmaelectronica.gob.es/Home/Descargas.html" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">firmaelectronica.gob.es</a>.
      </div>
    </div>
  );

  // Selección de facturas
  const handleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Intenta abrir Autofirma usando el protocolo custom
  const openAutofirma = () => {
    const a = document.createElement('a');
    a.href = 'afirma://service?op=launch';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Proceso de firma electrónica con Autofirma
  const handleSignSelected = async () => {
    // 1. Intentar abrir Autofirma
    openAutofirma();
    setSignStatus('Generando XML de las facturas seleccionadas...');
    try {
      // 2. Solicitar XMLs al backend
      const res = await fetch('/api/invoices/generate-xml', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selected }),
      });
      if (!res.ok) throw new Error('Error generando XML');
      const xmls = await res.json();
      for (const { id, xml } of xmls) {
        setSignStatus(`Firmando factura ${id} con Autofirma...`);
        // 3. Llamar a Autofirma (puerto local)
        const resp = await fetch('http://127.0.0.1:8080/afirma-signature-http', {
          method: 'POST',
          body: new Blob([xml], { type: 'text/xml' }),
          headers: { 'Content-Type': 'application/xml' },
        });
        if (!resp.ok) throw new Error('Error en Autofirma');
        const signedXml = await resp.text();
        setSignStatus(`Subiendo XML firmado de la factura ${id}...`);
        // 4. Subir XML firmado al backend
        const uploadRes = await fetch('/api/invoices/upload-signed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ id, signedXml }),
        });
        if (!uploadRes.ok) throw new Error('Error subiendo XML firmado');
      }
      setSignStatus('¡Facturas firmadas correctamente!');
      setSelected([]);
      fetchInvoices();
      setSuccessMsg('🔐 Facturas firmadas electrónicamente correctamente.');
      // Limpiar el mensaje después de 5 segundos
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (e: any) {
      setSignStatus('Error en el proceso de firma: ' + (e.message || e));
      setError('❌ Error en el proceso de firma: ' + (e.message || e));
      // Limpiar el error después de 5 segundos
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handlers para las acciones de la tabla de facturas
  const handleView = (inv: any) => {
    setViewingInvoice(inv);
    setShowInvoiceModal(true);
  };
  const handleEdit = async (inv: any) => {
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
  const handleMeta = (inv: any) => {
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
        'Base Imponible': `${inv.baseImponible?.toFixed(2)} €`,
        'Cuota IVA': `${inv.cuotaIVA?.toFixed(2)} €`,
        'Tipo IVA': `${inv.tipoIVA}%`,
        'Importe Total': `${inv.importeTotal?.toFixed(2)} €`,
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

    alert(`METADATOS DE LA FACTURA\n\n${metadataText}`);
  };

  // Componente para mostrar la factura completa
  const InvoiceView = ({ invoice }: { invoice: any }) => {
    console.log('Invoice data for view:', {
      descuento: invoice.descuento,
      baseImponible: invoice.baseImponible,
      cuotaIVA: invoice.cuotaIVA,
      importeTotal: invoice.importeTotal
    });
    
    const handlePrint = () => {
      // Crear una nueva ventana para imprimir solo la factura
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Factura ${invoice.numeroFactura}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .invoice-container { max-width: 800px; margin: 0 auto; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .totals { text-align: right; margin-top: 20px; }
                .totals div { margin: 5px 0; }
                .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
                .section { margin: 20px 0; }
                .section h3 { color: #333; margin-bottom: 10px; }
                .discount { background-color: #fff3cd; padding: 10px; border: 1px solid #ffeaa7; margin: 10px 0; }
                .provisions { background-color: #d1ecf1; padding: 10px; border: 1px solid #bee5eb; margin: 10px 0; }
                @media print {
                  body { margin: 0; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                <div class="header">
                  <h1>FACTURA</h1>
                  <div><strong>Número:</strong> ${invoice.numeroFactura}</div>
                  <div><strong>Fecha:</strong> ${formatDate(invoice.fechaFactura)}</div>
                  <div><strong>Tipo:</strong> ${invoice.tipoFactura === 'F' ? 'Completa' : 'Rectificativa'}</div>
                  <div><strong>Estado:</strong> ${invoice.estado.toUpperCase()}</div>
                  <div><strong>Fecha de operación:</strong> ${formatDate(invoice.fechaOperacion)}</div>
                </div>
                
                <div class="section">
                  <h3>DATOS DEL EMISOR</h3>
                  <div><strong>Nombre:</strong> ${invoice.emisor?.name || 'N/A'}</div>
                  <div><strong>Email:</strong> ${invoice.emisor?.email || 'N/A'}</div>
                  <div><strong>Régimen IVA:</strong> ${invoice.regimenIvaEmisor}</div>
                </div>
                
                <div class="section">
                  <h3>DATOS DEL RECEPTOR</h3>
                  <div><strong>Nombre:</strong> ${invoice.receptor?.name || 'N/A'}</div>
                  <div><strong>Email:</strong> ${invoice.receptor?.email || 'N/A'}</div>
                  ${invoice.expediente ? `<div><strong>Expediente:</strong> ${invoice.expediente.title}</div>` : ''}
                </div>
                
                <div class="section">
                  <h3>CONCEPTOS</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Descripción</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${invoice.items?.map((item: any) => `
                        <tr>
                          <td>${item.description}</td>
                          <td>${item.quantity}</td>
                          <td>${formatCurrency(item.unitPrice)}</td>
                          <td>${formatCurrency(item.total)}</td>
                        </tr>
                      `).join('') || ''}
                    </tbody>
                  </table>
                </div>
                
                ${invoice.descuento && invoice.descuento > 0 ? `
                <div class="section">
                  <h3>DESCUENTOS</h3>
                  <div class="discount">
                    <strong>Descuento (${invoice.descuento ?? 0}%):</strong> 
                    -${formatCurrency((invoice.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0) * ((invoice.descuento ?? 0) / 100))}
                  </div>
                </div>
                ` : ''}
                
                ${invoice.provisionFondos && invoice.provisionFondos.length > 0 ? `
                <div class="section">
                  <h3>PROVISIONES DE FONDOS ASOCIADAS</h3>
                  <div class="provisions">
                    <table>
                      <thead>
                        <tr>
                          <th>Descripción</th>
                          <th>Fecha</th>
                          <th>Importe</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${invoice.provisionFondos.map((provision: any) => `
                          <tr>
                            <td>${provision.description || 'Sin descripción'}</td>
                            <td>${formatDate(provision.date)}</td>
                            <td>${formatCurrency(provision.amount)}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>
                </div>
                ` : ''}
                
                <div class="totals">
                  <div><strong>Base Imponible:</strong> ${formatCurrency(invoice.baseImponible ?? 0)}</div>
                  <div><strong>IVA (${invoice.tipoIVA ?? 21}%):</strong> ${formatCurrency(invoice.cuotaIVA ?? 0)}</div>
                  <div style="font-size: 1.2em; font-weight: bold; border-top: 1px solid #333; padding-top: 10px;">
                    <strong>TOTAL:</strong> ${formatCurrency(invoice.importeTotal ?? 0)}
                  </div>
                </div>
                
                <div class="section">
                  <div><strong>Método de pago:</strong> ${invoice.metodoPago}</div>
                  <div><strong>Clave de operación:</strong> ${invoice.claveOperacion}</div>
                  <div><strong>Fecha de creación:</strong> ${formatDate(invoice.createdAt)}</div>
                  ${invoice.motivoAnulacion ? `<div><strong>Motivo de anulación:</strong> ${invoice.motivoAnulacion}</div>` : ''}
                </div>
              </div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    };

    const handleDownloadPDF = async () => {
      try {
        // Descargar el PDF de la factura con QR desde el backend
        const response = await api.get(`/invoices/${invoice.id}/pdf-qr`, {
          responseType: 'blob'
        });
        
        // Crear blob y descargar
        const blob = response.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura_${invoice.numeroFactura || invoice.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
      } catch (error) {
        console.error('Error downloading PDF:', error);
        alert('Error al descargar el PDF de la factura');
      }
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
                <div><strong>Tipo:</strong> {invoice.tipoFactura === 'F' ? 'Completa' : invoice.tipoFactura === 'R' ? 'Rectificativa' : 'N/A'}</div>
                <div><strong>Estado:</strong> <span className={`px-2 py-1 rounded text-xs ${
                  invoice.estado === 'emitida' ? 'bg-green-100 text-green-800' :
                  invoice.estado === 'anulada' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{(invoice.estado || 'N/A').toUpperCase()}</span></div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                <div><strong>Fecha de operación:</strong></div>
                <div>{formatDate(invoice.fechaOperacion)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Datos del emisor y receptor */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div className="border-r border-gray-200 pr-4">
            <h3 className="text-lg font-bold text-gray-800 mb-3">DATOS DEL EMISOR</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Nombre:</strong> {invoice.emisor?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {invoice.emisor?.email || 'N/A'}</div>
              <div><strong>Régimen IVA:</strong> {invoice.regimenIvaEmisor}</div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">DATOS DEL RECEPTOR</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Nombre:</strong> {invoice.receptor?.name || 'N/A'}</div>
              <div><strong>Email:</strong> {invoice.receptor?.email || 'N/A'}</div>
              {invoice.expediente && (
                <div><strong>Expediente:</strong> {invoice.expediente.title}</div>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de conceptos */}
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
              {invoice.items?.map((item: any, index: number) => (
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

        {/* Descuento */}
        {invoice.descuento && invoice.descuento > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-800 mb-3">DESCUENTOS</h3>
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-yellow-800">Descuento ({invoice.descuento ?? 0}%)</span>
                <span className="font-bold text-yellow-800 text-lg">
                  -{formatCurrency((invoice.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0) || 0) * ((invoice.descuento ?? 0) / 100))}
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
                  {invoice.provisionFondos.map((provision: any) => (
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
        <div className="border-t-2 border-gray-300 pt-6">
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
              <div><strong>Método de pago:</strong> {invoice.metodoPago}</div>
              <div><strong>Clave de operación:</strong> {invoice.claveOperacion}</div>
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
        <div className="mt-8 flex justify-center gap-4 print:hidden">
          <button
            onClick={handlePrint}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>
    );
  };

  // Función de prueba para verificar datos
  const testUpdateData = () => {
    const testForm: any = {
      id: 'fac-c1-001',
      numeroFactura: 'FAC-C1-001',
      tipoFactura: 'F',
      qrData: 'test',
      items: [
        { description: 'Test', quantity: 1, unitPrice: 100, total: 100 }
      ],
      receptorId: 'test',
      expedienteId: 'test',
      fechaOperacion: '2025-07-15',
      metodoPago: 'transferencia',
      regimenIvaEmisor: 'General',
      claveOperacion: '01',
      tipoIVA: 21,
      aplicarIVA: true,
      descuento: 0,
      retencion: 0,
      estado: 'emitida',
      provisionIds: []
    };

    // Limpiar datos como en handleUpdate
    const {
      id, emisorId, fechaFactura, importeTotal, baseImponible, cuotaIVA,
      xml, xmlFirmado, selloTiempo, createdAt, updatedAt,
      emisor, receptor, expediente, provisionFondos,
      numeroFactura, tipoFactura, qrData,
      ...facturaDataSinCalculos
    } = testForm;
    
    const itemsLimpios = facturaDataSinCalculos.items.map((item: any) => {
      const { id: itemId, invoiceId, total, ...itemLimpio } = item;
      return itemLimpio;
    });
    
    const facturaData = {
      receptorId: facturaDataSinCalculos.receptorId,
      expedienteId: facturaDataSinCalculos.expedienteId,
      fechaOperacion: formatDateForBackend(testForm.fechaOperacion),
      metodoPago: facturaDataSinCalculos.metodoPago?.toLowerCase() || 'transferencia',
      regimenIvaEmisor: facturaDataSinCalculos.regimenIvaEmisor,
      claveOperacion: facturaDataSinCalculos.claveOperacion,
      tipoIVA: testForm.tipoIVA === '' || testForm.tipoIVA == null ? 21 : Number(testForm.tipoIVA),
      aplicarIVA: facturaDataSinCalculos.aplicarIVA !== false,
      descuento: testForm.descuento === '' || testForm.descuento == null ? 0 : Number(testForm.descuento),
      retencion: testForm.retencion === '' || testForm.retencion == null ? 0 : Number(testForm.retencion),
      items: itemsLimpios,
      provisionIds: testForm.provisionIds,
      estado: testForm.estado || 'emitida',
      motivoAnulacion: facturaDataSinCalculos.motivoAnulacion || null,
      paymentDate: testForm.paymentDate ? formatDateForBackend(testForm.paymentDate) : undefined,
    };

    console.log('=== PRUEBA DE LIMPIEZA DE DATOS ===');
    console.log('Datos originales:', testForm);
    console.log('Datos limpios:', facturaData);
    console.log('Items originales:', testForm.items);
    console.log('Items limpios:', itemsLimpios);
  };

  // Llamar la función de prueba al cargar el componente
  useEffect(() => {
    testUpdateData();
  }, []);

  return (
    <div className="py-6 max-w-5xl mx-auto">
      <InfoPanel />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Facturación Electrónica</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleOpenModal}>Nueva factura</button>
      </div>
      {signStatus && <div className="mb-2 text-blue-700 font-semibold">{signStatus}</div>}
      {successMsg && <div className="mb-2 text-green-700 font-semibold">{successMsg}</div>}
      {loading ? (
        <div className="flex items-center gap-2"><span className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full"></span> Cargando...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select value={selectedClientFilter} onChange={e => setSelectedClientFilter(e.target.value)} className="border rounded px-2 py-1">
                <option value="">Todos</option>
                {clients.map(client => (
                  <option key={client.user.id} value={client.user.id}>{client.user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
              <input type="date" value={selectedPaymentDate} onChange={e => setSelectedPaymentDate(e.target.value)} className="border rounded px-2 py-1" />
            </div>
          </div>
          <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr>
                <th className="border px-2 py-1"></th>
                <th className="border px-2 py-1">Nº Factura</th>
                <th className="border px-2 py-1">Fecha</th>
                <th className="border px-2 py-1">Cliente</th>
                <th className="border px-2 py-1">Importe</th>
                <th className="border px-2 py-1">Estado</th>
                <th className="border px-2 py-1">Fecha de pago</th>
                <th className="border px-2 py-1">Provisiones</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="border px-2 py-1 text-center">
                    {!inv.xmlFirmado && inv.xml && (
                      <input
                        type="checkbox"
                        checked={selected.includes(inv.id)}
                        onChange={() => handleSelect(inv.id)}
                        aria-label={`Seleccionar factura ${inv.numeroFactura}`}
                      />
                    )}
                  </td>
                  <td className="border px-2 py-1">{inv.numeroFactura}</td>
                  <td className="border px-2 py-1">{inv.fechaFactura?.slice(0, 10)}</td>
                    <td className="border px-2 py-1">{inv.receptor?.name || inv.receptorId}</td>
                  <td className="border px-2 py-1">{inv.importeTotal?.toFixed(2)} €</td>
                  <td className="border px-2 py-1">{inv.estado}</td>
                  <td className="border px-2 py-1">{inv.paymentDate ? new Date(inv.paymentDate).toLocaleDateString() : '-'}</td>
                    <td className="border px-2 py-1">{inv.provisionFondos?.length || 0}</td>
                    <td className="border px-2 py-1 flex gap-1">
                      <button 
                        className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors" 
                        onClick={() => handleView(inv)}
                        title="Ver factura completa"
                      >
                        👁️ Ver
                      </button>
                      <button 
                        className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700 transition-colors" 
                        onClick={() => handleEdit(inv)}
                        title="Editar factura"
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className={`px-3 py-1 text-xs rounded transition-colors ${
                          deletingId === inv.id 
                            ? 'bg-gray-400 text-white cursor-not-allowed' 
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`} 
                        onClick={() => handleDelete(inv.id)}
                        disabled={deletingId === inv.id}
                        title="Eliminar factura"
                      >
                        {deletingId === inv.id ? '🗑️ Borrando...' : '🗑️ Borrar'}
                      </button>
                      <button 
                        className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors" 
                        onClick={() => handleMeta(inv)}
                        title="Ver metadatos técnicos"
                      >
                        🔍 Metadatos
                      </button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          {/* Lista de pasos antes de los inputs de archivo y botón de firma */}
          <div className="mt-6 mb-2 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <ol className="list-decimal pl-6 text-sm text-yellow-900">
              <li>A continuación tiene que elegir su <b>certificado digital</b> (.pem).</li>
              <li>Después, elija la <b>clave privada asociada</b> (.pem).</li>
              <li>Con eso, el sistema preparará el XML de las facturas seleccionadas y lo enviará a <b>Autofirma</b>.</li>
              <li>Finalmente, pulse en <b>Firmar Electrónicamente</b>: se producirá la firma digital y la subida automática del XML firmado.</li>
            </ol>
          </div>
          {/* Inputs de PEM y botón de firma múltiple después de la tabla */}
          <div className="mt-6 flex gap-2 items-center">
            <input type="file" accept=".pem" onChange={e => setCertFile(e.target.files?.[0] || null)} title="Subir certificado PEM" aria-label="Subir certificado PEM" />
            <span className="text-xs text-gray-600">Certificado digital (.pem)</span>
            <input type="file" accept=".pem" onChange={e => setKeyFile(e.target.files?.[0] || null)} title="Subir clave privada PEM" aria-label="Subir clave privada PEM" />
            <span className="text-xs text-gray-600">Clave privada (.pem)</span>
            <button
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-300"
              disabled={selected.length === 0 || !!signStatus}
              onClick={handleSignSelected}
            >
              Firmar electrónicamente ({selected.length})
            </button>
          </div>
        </>
      )}
      {/* Modal de nueva/edición de factura */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">{form.id ? 'Editar factura' : 'Nueva factura'}</h2>
            <form onSubmit={form.id ? handleUpdate : handleCreate} className="space-y-4">
            {/* Mensaje de éxito */}
            {successMsg && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{successMsg}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSuccessMsg(null);
                      setShowModal(false);
                    }}
                    className="text-green-400 hover:text-green-600"
                    title="Cerrar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Mensaje de error */}
            {formError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-red-800 whitespace-pre-line">{formError}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Nº Factura</label>
                <input
                  name="numeroFactura"
                  value={form.numeroFactura || 'Se asignará automáticamente'}
                  readOnly
                  className="border px-2 py-1 rounded w-full bg-gray-100"
                />
              </div>
              {!form.fechaFactura && (
                <div className="mb-2 text-xs text-gray-500">
                  La fecha de la factura se asignará automáticamente al crearla.
            </div>
              )}
              {form.fechaFactura && (
            <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Fecha de factura</label>
                  <input value={form.fechaFactura.slice(0,10)} readOnly className="border px-2 py-1 rounded w-full bg-gray-100" />
            </div>
              )}
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Cliente</label>
                <select 
                  ref={clienteRef}
                  name="receptorId" 
                  value={form.receptorId} 
                  onChange={handleClientChange} 
                  className={`border px-2 py-1 rounded w-full ${errorFields.cliente ? 'border-red-500 bg-red-50' : ''}`} 
                  required
                >
                <option value="">Selecciona un cliente</option>
                {clients.map((c: any) => (
                  <option key={c.user.id} value={c.user.id}>{c.user.name} ({c.dni})</option>
                ))}
              </select>
            </div>
            {form.receptorId && (
              <div className="mb-2">
                  <label className="block text-sm font-medium mb-1">Expediente</label>
                  <select 
                    ref={expedienteRef}
                    name="expedienteId" 
                    value={form.expedienteId} 
                    onChange={handleFormChange} 
                    className={`border px-2 py-1 rounded w-full ${errorFields.expediente ? 'border-red-500 bg-red-50' : ''}`} 
                    required
                  >
                  <option value="">Selecciona un expediente</option>
                  {expedientesCliente.map((exp: any) => (
                    <option key={exp.id} value={exp.id}>{exp.title} (ID: {exp.id})</option>
                  ))}
                </select>
              </div>
            )}
            {pendingProvision && (
              <div className="mb-2 p-2 bg-green-50 border-l-4 border-green-400 text-green-800 text-sm rounded">
                <b>Provisiones de fondos disponibles:</b><br />
                Se han encontrado {filteredProvisions.length} provisiones de fondos asociadas a este cliente y expediente.<br />
                <ul className="list-disc pl-5">
                  {filteredProvisions.map((p: any, idx: number) => (
                    <li key={p.id}>Provisión #{idx + 1}: {p.amount} € (ID: {p.id})</li>
                  ))}
                </ul>
                <b>Total disponible:</b> {filteredProvisions.reduce((sum: number, p: any) => sum + p.amount, 0)} €<br />
                <em>Selecciona las provisiones que quieres incluir en la factura. Se descontarán automáticamente del total final.</em>
              </div>
            )}
            
            {/* Checkboxes para seleccionar provisiones */}
            {filteredProvisions.length > 0 && (
              <div className="mb-2 p-2 bg-blue-50 border rounded">
                <label className="block text-sm font-medium mb-2 text-blue-800">
                  Seleccionar provisiones a incluir en la factura:
                </label>
                {filteredProvisions.map((p: any) => (
                  <div key={p.id} className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      id={`provision-${p.id}`}
                      checked={provisionesSeleccionadas.includes(p.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProvisionesSeleccionadas(prev => [...prev, p.id]);
                        } else {
                          setProvisionesSeleccionadas(prev => prev.filter(id => id !== p.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <label htmlFor={`provision-${p.id}`} className="text-sm">
                      Provisión de {p.amount} € - {p.description || 'sin descripción'} ({p.date?.slice(0,10) || 'sin fecha'})
                    </label>
                  </div>
                ))}
                {provisionesSeleccionadas.length > 0 && (
                  <div className="mt-2 text-sm font-semibold text-blue-700">
                    Provisiones seleccionadas: {provisionesSeleccionadas.length} 
                    (Total: {filteredProvisions
                      .filter(p => provisionesSeleccionadas.includes(p.id))
                      .reduce((sum, p) => sum + p.amount, 0)} €)
                  </div>
                )}
              </div>
            )}
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Tipo Factura</label>
                <select name="tipoFactura" value={form.tipoFactura} onChange={handleFormChange} className="border px-2 py-1 rounded w-full">
                <option value="F">Completa</option>
                <option value="R">Rectificativa</option>
              </select>
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Fecha Operación</label>
                <input 
                  ref={fechaOperacionRef} 
                  name="fechaOperacion" 
                  type="date" 
                  value={form.fechaOperacion} 
                  onChange={handleFormChange} 
                  className={`border px-2 py-1 rounded w-full ${errorFields.fechaOperacion ? 'border-red-500 bg-red-50' : ''}`} 
                  required 
                />
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Método de Pago</label>
                <input name="metodoPago" value={form.metodoPago} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Régimen IVA Emisor</label>
                <input name="regimenIvaEmisor" value={form.regimenIvaEmisor} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Clave Operación</label>
                <input name="claveOperacion" value={form.claveOperacion} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Tipo IVA (%)</label>
                <input name="tipoIVA" type="number" value={form.tipoIVA} onChange={handleFormChange} className="border px-2 py-1 rounded w-full" required />
            </div>
            <div className="mb-2 flex gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Aplicar IVA</label>
                <input
                  type="checkbox"
                  name="aplicarIVA"
                  checked={form.aplicarIVA !== false}
                  onChange={e => setForm((prev: any) => ({ ...prev, aplicarIVA: e.target.checked }))}
                  className="mr-2"
                />
                <span className="text-sm">Marcar si la factura debe llevar IVA</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Retención (%)</label>
                <input
                  type="number"
                  name="retencion"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.retencion ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, retencion: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  className="border px-2 py-1 rounded w-24"
                  placeholder="0"
                />
                <span className="text-xs text-gray-500 ml-2">(opcional)</span>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descuento (%)</label>
                <input
                  type="number"
                  name="descuento"
                  min="0"
                  max="100"
                  step="0.01"
                  value={form.descuento ?? ''}
                  onChange={e => setForm((prev: any) => ({ ...prev, descuento: e.target.value === '' ? undefined : Number(e.target.value) }))}
                  className="border px-2 py-1 rounded w-24"
                  placeholder="0"
                />
                <span className="text-xs text-gray-500 ml-2">(opcional)</span>
              </div>
            </div>
            <div className="mb-2">
                <label className="block text-sm font-bold mb-1">Conceptos</label>
                            {form.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-wrap gap-2 mb-1">
                    <input 
                      ref={el => (itemRefs.current[idx] = { ...(itemRefs.current[idx] || {}), description: el })} 
                      placeholder="Descripción" 
                      value={item.description} 
                      onChange={e => handleItemChange(idx, 'description', e.target.value)} 
                      className={`border px-2 py-1 rounded w-full sm:w-1/2 ${errorFields.items?.[idx]?.description ? 'border-red-500 bg-red-50' : ''}`} 
                      required 
                    />
                    <input 
                      ref={el => (itemRefs.current[idx] = { ...(itemRefs.current[idx] || {}), quantity: el })} 
                      type="number" 
                      placeholder="Cantidad" 
                      value={item.quantity} 
                      onChange={e => handleItemChange(idx, 'quantity', Number(e.target.value))} 
                      className={`border px-2 py-1 rounded w-full sm:w-1/4 ${errorFields.items?.[idx]?.quantity ? 'border-red-500 bg-red-50' : ''}`} 
                      required 
                    />
                    <input 
                      ref={el => (itemRefs.current[idx] = { ...(itemRefs.current[idx] || {}), unitPrice: el })} 
                      type="number" 
                      placeholder="Precio unitario" 
                      value={item.unitPrice} 
                      onChange={e => handleItemChange(idx, 'unitPrice', Number(e.target.value))} 
                      className={`border px-2 py-1 rounded w-full sm:w-1/4 ${errorFields.items?.[idx]?.unitPrice ? 'border-red-500 bg-red-50' : ''}`} 
                      required 
                    />
                    <span className="px-2">Total: {item.total}</span>
                  </div>
              ))}
              <button type="button" className="text-blue-600 underline mt-1" onClick={handleAddItem}>Añadir concepto</button>
            </div>
              
            {/* Resumen de totales calculados en tiempo real */}
            {(() => {
              const baseImponible = form.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
              const descuento = form.descuento ? Number(form.descuento) : 0;
              const baseConDescuento = baseImponible * (1 - descuento / 100);
              const aplicarIVA = form.aplicarIVA !== false;
              const tipoIVA = form.tipoIVA || 21;
              const cuotaIVA = aplicarIVA ? baseConDescuento * (tipoIVA / 100) : 0;
              const retencion = form.retencion ? Number(form.retencion) : 0;
              const cuotaRetencion = baseConDescuento * (retencion / 100);
              
              // Calcular descuento por provisiones seleccionadas
              const descuentoProvisiones = filteredProvisions
                .filter(p => provisionesSeleccionadas.includes(p.id))
                .reduce((sum, p) => sum + p.amount, 0);
              
              const importeTotal = baseConDescuento + cuotaIVA - cuotaRetencion - descuentoProvisiones;
              
              return (
                <div className="mb-4 p-3 bg-blue-50 border rounded">
                  <h3 className="font-bold text-blue-800 mb-2">Resumen de totales (calculado automáticamente):</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Base imponible: <span className="font-semibold">{baseConDescuento.toFixed(2)} €</span></div>
                    <div>Descuento: <span className="font-semibold">{descuento.toFixed(2)} %</span></div>
                    <div>IVA ({aplicarIVA ? tipoIVA : 0}%): <span className="font-semibold">{cuotaIVA.toFixed(2)} €</span></div>
                    <div>Retención: <span className="font-semibold">{retencion.toFixed(2)} % ({cuotaRetencion.toFixed(2)} €)</span></div>
                    {descuentoProvisiones > 0 && (
                      <div className="col-span-2 text-green-700">
                        Descuento por provisiones: <span className="font-semibold">-{descuentoProvisiones.toFixed(2)} €</span>
                      </div>
                    )}
                    <div className="col-span-2 border-t pt-1">
                      <strong>Total factura: {importeTotal.toFixed(2)} €</strong>
                    </div>
                  </div>
                </div>
              );
            })()}
              
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={() => setShowModal(false)} disabled={creating}>Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={creating}>
                {creating ? (form.id ? 'Actualizando...' : 'Creando...') : (form.id ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
          </div>
        </div>
      )}
      {/* Modal de visualización de factura completa */}
      {showInvoiceModal && viewingInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 modal-overlay">
          <div className="bg-white rounded shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative modal-content">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 print:hidden" onClick={() => setShowInvoiceModal(false)}>&times;</button>
            <div className="invoice-print">
              <InvoiceView invoice={viewingInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoicesPage; 