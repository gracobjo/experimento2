import React, { useState } from 'react';
import api from '../api/axios';
import AccessibleModal from './ui/AccessibleModal';
import DateTimePicker from './forms/DateTimePicker';
import { useAuth } from '../context/AuthContext';

interface QuickActionsProps {
  expedienteId?: string;
  expedienteData?: any; // opcional: para pasar el objeto completo y extraer clientId/lawyerId
  onAppointmentCreated?: (data: any) => void;
  onNoteAdded?: (data: any) => void;
  onMessageSent?: (data: any) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ expedienteId, expedienteData, onAppointmentCreated, onNoteAdded, onMessageSent }) => {
  const { user } = useAuth();
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
      // Lógica diferente según el rol
      if (user?.role === 'CLIENTE') {
        // Clientes crean citas con su abogado
        let lawyerId = expedienteData?.lawyer?.id;
        if (!lawyerId) {
          setError('No se pudo obtener el abogado del expediente.');
          setLoading(false);
          return;
        }

        try {
          const token = localStorage.getItem('token');
          const payload = {
            lawyerId,
            date: form.datetime,
            location: form.location || '',
            notes: form.notes || '',
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
      } else if (user?.role === 'ABOGADO' || user?.role === 'ADMIN') {
        // Abogados y administradores crean citas para el cliente
        let clientId = expedienteData?.client?.id;
        if (!clientId) {
          setError('No se pudo obtener el cliente del expediente.');
          setLoading(false);
          return;
        }

        try {
          const token = localStorage.getItem('token');
          // Para abogados, usamos el endpoint específico para abogados
          const payload = {
            clientId: clientId, // ID del cliente del expediente
            date: form.datetime,
            location: form.location || '',
            notes: form.notes || '',
          };
          const response = await api.post('/appointments/lawyer', payload, {
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
    } else if (modal === 'nota') {
      try {
        const token = localStorage.getItem('token');
        const payload = {
          expedienteId,
          title: form.title || 'Nota del expediente',
          content: form.note,
          isPrivate: form.isPrivate || false,
        };
        const response = await api.post('/notes', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Nota agregada con éxito');
        if (onNoteAdded) onNoteAdded(response.data);
        setTimeout(closeModal, 1200);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Error al agregar la nota');
      } finally {
        setLoading(false);
      }
      return;
    }
    // Simulación para mensajes
    setTimeout(() => {
      setLoading(false);
      setSuccess('Acción realizada con éxito');
      if (modal === 'mensaje' && onMessageSent) onMessageSent(form);
      setTimeout(closeModal, 1000);
    }, 800);
  };

  return (
    <div className="flex flex-col md:flex-row gap-2 md:gap-4">
      {/* Botones para Clientes */}
      {user?.role === 'CLIENTE' && (
        <>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setModal('cita')}
            aria-label="Programar cita con el abogado"
          >
            Programar Cita
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => setModal('mensaje')}
            aria-label="Enviar mensaje al abogado"
          >
            Enviar Mensaje
          </button>
        </>
      )}
      
      {/* Botones para Abogados y Administradores */}
      {(user?.role === 'ABOGADO' || user?.role === 'ADMIN') && (
        <>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            onClick={() => setModal('nota')}
            aria-label="Agregar nota interna al expediente"
          >
            Agregar Nota
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            onClick={() => setModal('mensaje')}
            aria-label="Enviar mensaje al cliente"
          >
            Enviar Mensaje
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => setModal('cita')}
            aria-label="Programar cita con el cliente"
          >
            Programar Cita
          </button>
        </>
      )}

      {/* Modal Programar Cita */}
      <AccessibleModal
        isOpen={modal === 'cita'}
        onClose={closeModal}
        title="Programar Cita"
        description={
          user?.role === 'CLIENTE' 
            ? `Programe una cita con ${expedienteData?.lawyer?.name || 'su abogado'} para este expediente`
            : `Programe una cita con ${expedienteData?.client?.user?.name || 'el cliente'} para este expediente`
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="expedienteId" value={expedienteId || ''} />
          
          {/* Información según el rol */}
          {user?.role === 'CLIENTE' ? (
            /* Información del abogado para clientes */
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-green-900">Abogado:</span>
                <span className="text-sm text-green-700">
                  {expedienteData?.lawyer?.name || 'Abogado no asignado'}
                </span>
              </div>
              {expedienteData?.lawyer?.email && (
                <div className="flex items-center space-x-2 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-green-700">{expedienteData.lawyer.email}</span>
                </div>
              )}
            </div>
          ) : (
            /* Información del cliente para abogados/administradores */
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">Cliente:</span>
                <span className="text-sm text-blue-700">
                  {expedienteData?.client?.user?.name || 'Cliente no especificado'}
                </span>
              </div>
              {expedienteData?.client?.user?.email && (
                <div className="flex items-center space-x-2 mt-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-blue-700">{expedienteData.client.user.email}</span>
                </div>
              )}
            </div>
          )}
          <div>
            <label htmlFor="datetime" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora
            </label>
            <DateTimePicker
              value={form.datetime || ''}
              onChange={(value) => setForm({ ...form, datetime: value })}
              required
              placeholder="Seleccionar fecha y hora para la cita"
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
          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white border-t border-gray-200 mt-4 -mx-6 px-6 py-4 modal-actions">
            <button 
              type="button" 
              onClick={closeModal} 
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 relative z-20"
              aria-label="Cancelar programación de cita"
              style={{ position: 'relative', zIndex: 20 }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed relative z-20"
              aria-label="Guardar cita programada"
              style={{ position: 'relative', zIndex: 20 }}
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
        description="Agregue una nota interna al expediente para su seguimiento"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="expedienteId" value={expedienteId || ''} />
          
          {/* Información del expediente */}
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
                          <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium text-green-900">Expediente:</span>
                <span className="text-sm text-green-700">
                  {expedienteData?.title || expedienteId || 'Expediente'}
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm text-green-700">
                  Cliente: {expedienteData?.client?.user?.name || 'No especificado'}
                </span>
              </div>
          </div>
          
          {/* Título de la nota */}
          <div>
            <label htmlFor="nota-title" className="block text-sm font-medium text-gray-700 mb-1">
              Título de la nota
            </label>
            <input
              id="nota-title"
              name="title"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onChange={handleChange}
              placeholder="Título descriptivo de la nota..."
              aria-describedby="nota-title-help"
            />
            <div id="nota-title-help" className="sr-only">
              Ingrese un título descriptivo para la nota
            </div>
          </div>

          {/* Contenido de la nota */}
          <div>
            <label htmlFor="nota-textarea" className="block text-sm font-medium text-gray-700 mb-1">
              Contenido de la nota
            </label>
            <textarea
              id="nota-textarea"
              name="note"
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              onChange={handleChange}
              placeholder="Escriba el contenido de la nota interna sobre este expediente..."
              aria-describedby="nota-help"
            />
            <div id="nota-help" className="sr-only">
              Escriba el contenido de la nota interna que será agregada al expediente para el seguimiento del caso
            </div>
          </div>

          {/* Opción de privacidad (solo para abogados y admins) */}
          {(user?.role === 'ABOGADO' || user?.role === 'ADMIN') && (
            <div className="flex items-center">
              <input
                id="nota-private"
                name="isPrivate"
                type="checkbox"
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                onChange={(e) => setForm({ ...form, isPrivate: e.target.checked })}
              />
              <label htmlFor="nota-private" className="ml-2 block text-sm text-gray-700">
                Nota privada (solo visible para abogados)
              </label>
            </div>
          )}
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
              aria-label="Cancelar agregar nota"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Guardar nota agregada"
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
        description={
          user?.role === 'CLIENTE'
            ? `Envíe un mensaje a ${expedienteData?.lawyer?.name || 'su abogado'} relacionado con este expediente`
            : `Envíe un mensaje a ${expedienteData?.client?.user?.name || 'el cliente'} relacionado con este expediente`
        }
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="expedienteId" value={expedienteId || ''} />
          
          {/* Información del destinatario según el rol */}
          {user?.role === 'CLIENTE' ? (
            /* Información del abogado para clientes */
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-blue-900">Destinatario:</span>
                <span className="text-sm text-blue-700">
                  {expedienteData?.lawyer?.name || 'Abogado no asignado'}
                </span>
              </div>
              {expedienteData?.lawyer?.email && (
                <div className="flex items-center space-x-2 mt-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-blue-700">{expedienteData.lawyer.email}</span>
                </div>
              )}
            </div>
          ) : (
            /* Información del cliente para abogados/administradores */
            <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium text-purple-900">Destinatario:</span>
                <span className="text-sm text-purple-700">
                  {expedienteData?.client?.user?.name || 'Cliente no especificado'}
                </span>
              </div>
              {expedienteData?.client?.user?.email && (
                <div className="flex items-center space-x-2 mt-1">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-purple-700">{expedienteData.client.user.email}</span>
                </div>
              )}
            </div>
          )}

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
              placeholder={
                user?.role === 'CLIENTE'
                  ? "Escriba su mensaje aquí. Este mensaje será enviado a su abogado..."
                  : "Escriba su mensaje aquí. Este mensaje será enviado al cliente..."
              }
              aria-describedby="mensaje-help"
            />
            <div id="mensaje-help" className="sr-only">
              {user?.role === 'CLIENTE'
                ? "Escriba el mensaje que desea enviar a su abogado"
                : "Escriba el mensaje que desea enviar al cliente"
              }
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
              aria-label="Cancelar envío de mensaje"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading} 
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enviar mensaje"
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