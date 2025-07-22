import React, { useState } from 'react';
import AccessibleModal from './ui/AccessibleModal';
import api from '../api/axios';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await api.post('/contact', {
        ...formData,
        ip: 'unknown',
        userAgent: navigator.userAgent
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          asunto: '',
          mensaje: ''
        });
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contáctanos"
      description="Complete el formulario para solicitar una consulta gratuita"
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información de Contacto */}
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Dirección</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Calle Principal 123<br />
                    Madrid, 28001<br />
                    España
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Teléfono</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <a href="tel:+34612345678" className="hover:text-blue-600">
                      +34 612 345 678
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <a href="mailto:info@despachoabogados.com" className="hover:text-blue-600">
                      info@despachoabogados.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Horario de Atención</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Lunes - Viernes: 9:00 - 18:00<br />
                    Sábados: 9:00 - 14:00<br />
                    Domingos: Cerrado
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Servicios Destacados */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Servicios Destacados
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">⚖️</span>
                </div>
                <span className="text-sm text-gray-700">Derecho Civil</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">👥</span>
                </div>
                <span className="text-sm text-gray-700">Derecho Laboral</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-xs">👨‍👩‍👧‍👦</span>
                </div>
                <span className="text-sm text-gray-700">Derecho Familiar</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-xs">🏢</span>
                </div>
                <span className="text-sm text-gray-700">Derecho Empresarial</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Solicita tu Consulta Gratuita
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tu nombre completo"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+34 612 345 678"
              />
            </div>

            <div>
              <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-1">
                Asunto *
              </label>
              <select
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecciona un asunto</option>
                <option value="Consulta General">Consulta General</option>
                <option value="Derecho Civil">Derecho Civil</option>
                <option value="Derecho Laboral">Derecho Laboral</option>
                <option value="Derecho Familiar">Derecho Familiar</option>
                <option value="Derecho Empresarial">Derecho Empresarial</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje *
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe tu consulta o situación legal..."
              />
            </div>

            {submitStatus === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
                <p className="text-green-600 text-sm">
                  ¡Gracias por tu mensaje! Nos pondremos en contacto contigo en las próximas 24 horas.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
                <p className="text-red-600 text-sm">
                  Ha ocurrido un error al enviar tu mensaje. Por favor, inténtalo de nuevo.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Consulta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default ContactModal; 