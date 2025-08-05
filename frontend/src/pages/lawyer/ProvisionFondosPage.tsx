import React, { useState, useEffect } from 'react';
import { 
  createProvision, 
  linkProvisionToInvoice, 
  getAllProvisions, 
  getProvisionById, 
  updateProvision, 
  deleteProvision 
} from '../../api/provisionFondos';
import { getInvoices } from '../../api/invoices';
import api from '../../api/axios';

interface Provision {
  id: string;
  amount: number;
  description: string;
  date: string;
  clientId: string;
  expedienteId: string;
  invoiceId?: string;
  createdAt: string;
  expediente?: {
    title: string;
    client?: {
      user?: {
        name: string;
      };
    };
  };
  invoice?: {
    numeroFactura: string;
  };
}

const ProvisionFondosPage = () => {
  console.log('ProvisionFondosPage component loaded');
  const token = localStorage.getItem('token') || '';
  const [provisions, setProvisions] = useState<Provision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProvision, setEditingProvision] = useState<Provision | null>(null);
  const [form, setForm] = useState({
    expedienteId: '',
    amount: '',
    date: '',
    description: '',
  });

  // Cargar expedientes y provisiones al montar
  useEffect(() => {
    fetchExpedientes();
    fetchProvisions();
  }, [token]);

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

  const fetchProvisions = async () => {
    setLoading(true);
    try {
      const data = await getAllProvisions(token);
      setProvisions(data);
    } catch (err) {
      setError('Error al cargar las provisiones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleExpedienteSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm({ ...form, expedienteId: e.target.value });
  };

  const resetForm = () => {
    setForm({
      expedienteId: '',
      amount: '',
      date: '',
      description: '',
    });
    setEditingProvision(null);
    setShowForm(false);
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
        clientId,
        expedienteId: form.expedienteId,
        amount: Number(form.amount),
        ...(form.date ? { date: form.date } : {}),
        description: form.description,
      };

      if (editingProvision) {
        await updateProvision(editingProvision.id, data, token);
        setSuccessMsg('Provisión actualizada correctamente.');
      } else {
        await createProvision(data, token);
        setSuccessMsg('Provisión creada correctamente.');
      }
      
      resetForm();
      fetchProvisions();
    } catch (err) {
      setError(editingProvision ? 'Error al actualizar la provisión' : 'Error al crear la provisión');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (provision: Provision) => {
    setEditingProvision(provision);
    setForm({
      expedienteId: provision.expedienteId,
      amount: provision.amount.toString(),
      date: provision.date.slice(0, 10),
      description: provision.description,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta provisión?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteProvision(id, token);
      setSuccessMsg('Provisión eliminada correctamente.');
      fetchProvisions();
    } catch (err) {
      setError('Error al eliminar la provisión');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <main className="max-w-6xl mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Provisiones de Fondos</h1>
        <p className="text-gray-600 mt-2">Administra las provisiones de fondos para expedientes</p>
      </header>

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

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {showForm ? (editingProvision ? 'Editar Provisión' : 'Crear Nueva Provisión') : 'Lista de Provisiones'}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {showForm ? 'Cancelar' : 'Nueva Provisión'}
        </button>
      </div>

      {showForm && (
        <section className="mb-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingProvision ? 'Editar Provisión' : 'Crear Provisión de Fondos'}
          </h3>
          
          <form onSubmit={handleCreateProvision} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="expediente-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Expediente *
                </label>
                <select
                  id="expediente-select"
                  name="expedienteId"
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.expedienteId}
                  onChange={handleExpedienteSelect}
                  required
                >
                  <option value="">Selecciona un expediente</option>
                  {expedientes.map((exp: any) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} - {exp.client?.user?.name || 'Sin cliente'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Importe (€) *
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
                />
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Provisión
                </label>
                <input 
                  id="date"
                  name="date" 
                  type="date"
                  value={form.date} 
                  onChange={handleChange} 
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>

              <div>
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
                  placeholder="Descripción opcional"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={loading}
              >
                {loading ? 'Procesando...' : (editingProvision ? 'Actualizar' : 'Crear')}
              </button>
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Provisiones Existentes</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-gray-500">Cargando provisiones...</div>
        ) : provisions.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No hay provisiones registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Importe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Descripción
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
                {provisions.map((provision) => (
                  <tr key={provision.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {provision.expediente?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(provision.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(provision.date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {provision.description || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        provision.invoiceId 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {provision.invoiceId ? 'Vinculada' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(provision)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(provision.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default ProvisionFondosPage; 