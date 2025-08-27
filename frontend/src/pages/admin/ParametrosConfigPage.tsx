import React, { useState, useEffect } from 'react';
import {
  getParametros,
  createParametro,
  updateParametro,
  deleteParametro,
  Parametro,
} from '../../api/parametros';

const ParametrosConfigPage: React.FC = () => {
  // const { token } = useAuth();
  const token = localStorage.getItem('token');
  const [parametros, setParametros] = useState<Parametro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingParametro, setEditingParametro] = useState<Parametro | null>(null);
  const [form, setForm] = useState<Partial<Parametro>>({});
  const [saving, setSaving] = useState(false);

  const fetchParametros = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!token) throw new Error('No autenticado');
      const data = await getParametros(token);
      setParametros(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al cargar parámetros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParametros();
    // eslint-disable-next-line
  }, [token]);

  const openModal = (parametro?: Parametro) => {
    setEditingParametro(parametro || null);
    setForm(parametro || {});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingParametro(null);
    setForm({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      if (!token) throw new Error('No autenticado');
      if (editingParametro) {
        // Editar
        await updateParametro(editingParametro.id, {
          valor: form.valor,
          etiqueta: form.etiqueta,
          tipo: form.tipo,
        }, token);
      } else {
        // Crear
        await createParametro({
          clave: form.clave!,
          valor: form.valor!,
          etiqueta: form.etiqueta!,
          tipo: form.tipo!,
        }, token);
      }
      await fetchParametros();
      closeModal();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al guardar parámetro');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este parámetro?')) return;
    setError(null);
    setSaving(true);
    try {
      if (!token) throw new Error('No autenticado');
      await deleteParametro(id, token);
      await fetchParametros();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error al eliminar parámetro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Configuración de Parámetros Globales</h1>
      <div className="mb-4 flex flex-wrap gap-2 justify-between items-center">
        <div className="flex flex-wrap gap-2">
          <button
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            onClick={async () => {
              if (!window.confirm('¿Desea inicializar los parámetros por defecto? Esto creará o actualizará los parámetros básicos del sistema.')) return;
              try {
                if (!token) throw new Error('No autenticado');
                await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parametros/initialize`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                await fetchParametros();
                alert('Parámetros inicializados correctamente');
              } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Error al inicializar parámetros');
              }
            }}
          >
            🔧 Inicializar Parámetros
          </button>
          
          <button
            className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            onClick={async () => {
              if (!window.confirm('⚠️ ATENCIÓN: ¿Desea reinicializar TODOS los parámetros? Esto eliminará todos los parámetros existentes y los creará de nuevo. Esta acción no se puede deshacer.')) return;
              try {
                if (!token) throw new Error('No autenticado');
                await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parametros/reinitialize`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                await fetchParametros();
                alert('Parámetros reinicializados correctamente');
              } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Error al reinicializar parámetros');
              }
            }}
          >
            🔄 Reinicializar Parámetros
          </button>
          
          <button
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            onClick={async () => {
              try {
                if (!token) throw new Error('No autenticado');
                const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parametros/status`, {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                const status = await response.json();
                alert(`Estado de Parámetros:\n\n` +
                      `📊 Total: ${status.totalParams}\n` +
                      `📞 Contacto: ${status.contactParamsCount}\n` +
                      `⚖️ Legal: ${status.legalParamsCount}\n` +
                      `✅ Inicializado: ${status.isInitialized ? 'SÍ' : 'NO'}\n` +
                      `📞 Tiene Contacto: ${status.hasContactParams ? 'SÍ' : 'NO'}\n` +
                      `⚖️ Tiene Legal: ${status.hasLegalContent ? 'SÍ' : 'NO'}`);
              } catch (err: any) {
                setError(err.response?.data?.message || err.message || 'Error al verificar estado');
              }
            }}
          >
            📊 Ver Estado
          </button>
        </div>
        
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => openModal()}
        >
          Nuevo Parámetro
        </button>
      </div>
      {loading ? (
        <div className="text-center py-8">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-600">{error}</div>
      ) : (
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Clave</th>
              <th className="px-4 py-2 border">Valor</th>
              <th className="px-4 py-2 border">Etiqueta</th>
              <th className="px-4 py-2 border">Tipo</th>
              <th className="px-4 py-2 border">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {parametros.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2 border font-mono text-sm">{p.clave}</td>
                <td className="px-4 py-2 border">
                  {p.tipo === 'html' ? (
                    <div className="max-w-xs">
                      <div className="text-xs text-gray-500 mb-1">HTML Content</div>
                      <div className="text-xs bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
                        {p.valor.substring(0, 100)}...
                      </div>
                    </div>
                  ) : p.valor.length > 50 ? (
                    <div className="max-w-xs">
                      <div className="text-sm truncate" title={p.valor}>
                        {p.valor.substring(0, 50)}...
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm">{p.valor}</span>
                  )}
                </td>
                <td className="px-4 py-2 border text-sm">{p.etiqueta}</td>
                <td className="px-4 py-2 border">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    p.tipo === 'html' ? 'bg-purple-100 text-purple-800' :
                    p.tipo === 'email' ? 'bg-blue-100 text-blue-800' :
                    p.tipo === 'url' ? 'bg-green-100 text-green-800' :
                    p.tipo === 'text' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {p.tipo}
                  </span>
                </td>
                <td className="px-4 py-2 border">
                  <button
                    className="text-blue-600 hover:underline mr-2 text-sm"
                    onClick={() => openModal(p)}
                  >Editar</button>
                  <button
                    className="text-red-600 hover:underline text-sm"
                    onClick={() => handleDelete(p.id)}
                    disabled={saving}
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Modal para crear/editar parámetro */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingParametro ? 'Editar' : 'Nuevo'} Parámetro</h2>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Clave</label>
              <input
                type="text"
                name="clave"
                value={form.clave || ''}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                disabled={!!editingParametro}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Valor</label>
              {(form.tipo === 'html' || form.tipo === 'text') ? (
                <textarea
                  name="valor"
                  value={form.valor || ''}
                  onChange={(e) => setForm({ ...form, valor: e.target.value })}
                  className="w-full border px-3 py-2 rounded"
                  rows={form.tipo === 'html' ? 10 : 5}
                  placeholder={form.tipo === 'html' ? 'Contenido HTML...' : 'Texto largo...'}
                />
              ) : (
                <input
                  type={form.tipo === 'email' ? 'email' : form.tipo === 'number' ? 'number' : 'text'}
                  name="valor"
                  value={form.valor || ''}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              )}
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Etiqueta</label>
              <input
                type="text"
                name="etiqueta"
                value={form.etiqueta || ''}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Tipo</label>
              <select
                name="tipo"
                value={form.tipo || ''}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Selecciona tipo</option>
                <option value="string">Texto</option>
                <option value="number">Número</option>
                <option value="email">Email</option>
                <option value="url">URL</option>
                <option value="text">Texto largo</option>
                <option value="html">HTML</option>
                <option value="image">Imagen/Base64</option>
                <option value="boolean">Booleano</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={closeModal}
                disabled={saving}
              >Cancelar</button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
                disabled={saving}
              >{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParametrosConfigPage; 