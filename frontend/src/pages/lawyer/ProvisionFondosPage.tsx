import React, { useState, useEffect } from 'react';
import { createProvision, linkProvisionToInvoice } from '../../api/provisionFondos';
import { getInvoices } from '../../api/invoices';
import api from '../../api/axios';

const ProvisionFondosPage = () => {
  console.log('ProvisionFondosPage component loaded');
  const token = localStorage.getItem('token') || '';
  const [form, setForm] = useState({
    expedienteId: '',
    amount: '',
    date: '',
    description: '',
  });
  const [provisionId, setProvisionId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [expedientes, setExpedientes] = useState<any[]>([]);

  // Cargar expedientes del abogado al montar
  useEffect(() => {
    const fetchExpedientes = async () => {
      try {
        const res = await api.get('/cases', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExpedientes(res.data);
      } catch {
        setExpedientes([]);
      }
    };
    fetchExpedientes();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExpedienteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, expedienteId: e.target.value });
  };

  const handleExpedienteInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, expedienteId: e.target.value });
  };

  const handleCreateProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      // Buscar el expediente seleccionado
      const expediente = expedientes.find((exp: any) => exp.id === form.expedienteId);
      const clientId = expediente?.client?.id || '';
      if (!clientId) {
        setError('No se pudo determinar el cliente del expediente seleccionado');
        setLoading(false);
        return;
      }
      const data = {
        clientId, // string
        expedienteId: form.expedienteId,
        amount: Number(form.amount),
        ...(form.date ? { date: form.date } : {}),
        description: form.description,
      };
      const res = await createProvision(data, token);
      setProvisionId(res.id);
      setSuccessMsg('Provisión creada. Ahora puedes vincularla a una factura.');
      // Cargar facturas para vincular
      const facturas = await getInvoices(token);
      setInvoices(facturas);
    } catch (err) {
      setError('Error al crear la provisión');
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!provisionId || !selectedInvoice) return;
    setError('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await linkProvisionToInvoice(provisionId, selectedInvoice, token);
      setSuccessMsg('Provisión vinculada correctamente a la factura.');
      setProvisionId(null);
      setSelectedInvoice('');
    } catch (err) {
      setError('Error al vincular la provisión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto py-8 px-4">
      <header>
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Gestión de Provisiones de Fondos</h1>
      </header>

      <section aria-labelledby="provision-form-heading">
        <h2 id="provision-form-heading" className="text-xl font-semibold mb-4 text-gray-800">
          Crear Provisión de Fondos
        </h2>
        
        {successMsg && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded" role="alert">
            {successMsg}
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-600 rounded" role="alert">
            {error}
          </div>
        )}

        {!provisionId ? (
          <form onSubmit={handleCreateProvision} className="space-y-4" aria-label="Formulario de creación de provisión">
            <fieldset>
              <legend className="sr-only">Información del expediente</legend>
              
              <div className="mb-4">
                <label htmlFor="expediente-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Expediente
                </label>
                <select
                  id="expediente-select"
                  name="expedienteId"
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.expedienteId}
                  onChange={handleExpedienteSelect}
                  aria-describedby="expediente-help"
                >
                  <option value="">Selecciona un expediente</option>
                  {expedientes.map((exp: any) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} - {exp.client?.user?.name || 'Sin cliente'} (ID: {exp.id})
                    </option>
                  ))}
                </select>
                <p id="expediente-help" className="text-xs text-gray-500 mt-1">
                  O puedes pegar directamente el ID del expediente en el campo de abajo
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="expediente-id-input" className="block text-sm font-medium text-gray-700 mb-2">
                  ID del Expediente (alternativo)
                </label>
                <input
                  id="expediente-id-input"
                  name="expedienteId"
                  type="text"
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Pega el ID del expediente"
                  value={form.expedienteId}
                  onChange={handleExpedienteInput}
                  aria-describedby="expediente-id-help"
                />
                <p id="expediente-id-help" className="text-xs text-gray-500 mt-1">
                  Campo alternativo para introducir el ID del expediente manualmente
                </p>
              </div>
            </fieldset>

            <fieldset>
              <legend className="sr-only">Información de la provisión</legend>
              
              {!form.date && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    La fecha de la provisión se asignará automáticamente al crearla.
                  </p>
                </div>
              )}
              
              {form.date && (
                <div className="mb-4">
                  <label htmlFor="provision-date" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Provisión
                  </label>
                  <input 
                    id="provision-date"
                    name="date"
                    type="date"
                    value={form.date.slice(0,10)} 
                    readOnly 
                    className="border border-gray-300 px-3 py-2 rounded-md w-full bg-gray-100" 
                    aria-describedby="date-help"
                  />
                  <p id="date-help" className="text-xs text-gray-500 mt-1">
                    Fecha automática de la provisión
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Importe (€)
                </label>
                <input 
                  id="amount"
                  name="amount" 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={form.amount} 
                  onChange={handleChange} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  required 
                  aria-describedby="amount-help"
                />
                <p id="amount-help" className="text-xs text-gray-500 mt-1">
                  Introduce el importe en euros
                </p>
              </div>

              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input 
                  id="description"
                  name="description" 
                  type="text"
                  value={form.description} 
                  onChange={handleChange} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                  aria-describedby="description-help"
                />
                <p id="description-help" className="text-xs text-gray-500 mt-1">
                  Descripción opcional de la provisión
                </p>
              </div>
            </fieldset>

            <button 
              type="submit" 
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
              aria-describedby="submit-help"
            >
              {loading ? 'Creando Provisión...' : 'Crear Provisión'}
            </button>
            <p id="submit-help" className="text-xs text-gray-500 text-center">
              {loading ? 'Procesando la solicitud...' : 'Haz clic para crear la provisión de fondos'}
            </p>
          </form>
        ) : (
          <section aria-labelledby="link-invoice-heading">
            <h3 id="link-invoice-heading" className="text-lg font-semibold mb-4 text-gray-800">
              Vincular Provisión a Factura
            </h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="invoice-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona Factura para Vincular
                </label>
                <select 
                  id="invoice-select"
                  name="selectedInvoice"
                  value={selectedInvoice} 
                  onChange={e => setSelectedInvoice(e.target.value)} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-describedby="invoice-help"
                >
                  <option value="">Selecciona una factura</option>
                  {invoices.map((inv: any) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.numeroFactura} - {inv.receptor?.name}
                    </option>
                  ))}
                </select>
                <p id="invoice-help" className="text-xs text-gray-500 mt-1">
                  Elige la factura a la que quieres vincular la provisión creada
                </p>
              </div>
              
              <button 
                onClick={handleLink} 
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading || !selectedInvoice}
                aria-describedby="link-help"
              >
                {loading ? 'Vinculando...' : 'Vincular Provisión'}
              </button>
              <p id="link-help" className="text-xs text-gray-500 text-center">
                {loading ? 'Procesando la vinculación...' : 
                 !selectedInvoice ? 'Selecciona una factura para continuar' : 
                 'Haz clic para vincular la provisión a la factura seleccionada'}
              </p>
            </div>
          </section>
        )}
      </section>
    </main>
  );
};

export default ProvisionFondosPage; 