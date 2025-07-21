import React, { useState } from 'react';
import api from '../api/axios';
import AccessibleModal from './ui/AccessibleModal';

interface QuickActionsProps {
  expedienteId?: string;
  expedienteData?: any; // opcional: para pasar el objeto completo y extraer clientId/lawyerId
  onAppointmentCreated?: (data: any) => void;
  onNoteAdded?: (data: any) => void;
  onMessageSent?: (data: any) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ expedienteId, expedienteData, onAppointmentCreated, onNoteAdded, onMessageSent }) => {
  const [modal, setModal] = useState<'cita' | 'nota' | 'mensaje' | null>(null);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const closeModal = () => {
    setModal(null);
    setForm({});
    setError(null);
    setSuccess(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (modal === 'cita') {
      // Obtener clientId y lawyerId del expedienteData si está disponible
      let clientId = expedienteData?.client?.id;
      let lawyerId = expedienteData?.lawyer?.id;
      // Si no, pedirlos como props o no permitir continuar
      if (!clientId || !lawyerId) {
        setError('No se pudo obtener el cliente o abogado del expediente.');
        setLoading(false);
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const payload = {
          clientId,
          lawyerId,
          date: form.datetime,
          location: form.location,
          notes: form.notes,
        };
        const response = await api.post('/appointments', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Cita programada con éxito');
        if (onAppointmentCreated) onAppointmentCreated(response.data);
        setTimeout(closeModal, 1200);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al programar la cita');
      } finally {
        setLoading(false);
      }
      return;
    }
    // Simulación para las otras acciones
    setTimeout(() => {
      setLoading(false);
      setSuccess('Acción realizada con éxito');
      if (modal === 'nota' && onNoteAdded) onNoteAdded(form);
      if (modal === 'mensaje' && onMessageSent) onMessageSent(form);
      setTimeout(closeModal, 1000);
    }, 800);
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4 my-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setModal('cita')}
      >
        Programar Cita
      </button>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        onClick={() => setModal('nota')}
      >
        Agregar Nota
      </button>
      <button
        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        onClick={() => setModal('mensaje')}
      >
        Enviar Mensaje
      </button>

      {/* Modal Programar Cita */}
      <AccessibleModal
        isOpen={modal === 'cita'}
        onClose={closeModal}
        title="Programar Cita"
        description="Complete los detalles para programar una nueva cita"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="expedienteId" value={expedienteId || ''} />
          <div>
            <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora
            </label>
            <input
              id="datetime"
              type="datetime-local"
              name="datetime"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleChange}
              aria-describedby="datetime-help"
            />
            <div id="datetime-help" className="sr-only">
              Seleccione la fecha y hora para la cita
            </div>
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Lugar
            </label>
            <input
              id="location"
              type="text"
              name="location"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleChange}
              placeholder="Ingrese el lugar de la cita"
              aria-describedby="location-help"
            />
            <div id="location-help" className="sr-only">
              Especifique el lugar donde se realizará la cita
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={handleChange}
              placeholder="Ingrese notas adicionales (opcional)"
              aria-describedby="notes-help"
            />
            <div id="notes-help" className="sr-only">
              Agregue información adicional sobre la cita
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </AccessibleModal>

      {/* Modal Agregar Nota */}
      <AccessibleModal
        isOpen={modal === 'nota'}
        onClose={closeModal}
        title="Agregar Nota"
        description="Agregue una nota al expediente"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="expedienteId" value={expedienteId || ''} />
          <div>
            <label htmlFor="nota-textarea" className="block text-sm font-medium text-gray-700 mb-1">
              Nota
            </label>
            <textarea
              id="nota-textarea"
              name="note"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onChange={handleChange}
              placeholder="Escriba la nota aquí..."
              aria-describedby="nota-help"
            />
            <div id="nota-help" className="sr-only">
              Escriba la nota que desea agregar al expediente
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </AccessibleModal>

      {/* Modal Enviar Mensaje */}
      <AccessibleModal
        isOpen={modal === 'mensaje'}
        onClose={closeModal}
        title="Enviar Mensaje"
        description="Envíe un mensaje relacionado con este expediente"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="expedienteId" value={expedienteId || ''} />
          <div>
            <label htmlFor="mensaje-textarea" className="block text-sm font-medium text-gray-700 mb-1">
              Mensaje
            </label>
            <textarea
              id="mensaje-textarea"
              name="message"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              onChange={handleChange}
              placeholder="Escriba su mensaje aquí..."
              aria-describedby="mensaje-help"
            />
            <div id="mensaje-help" className="sr-only">
              Escriba el mensaje que desea enviar
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </AccessibleModal>
    </div>
  );
};

export default QuickActions; 