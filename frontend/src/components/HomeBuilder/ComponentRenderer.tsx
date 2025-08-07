import React, { useState, useEffect } from 'react';
import { ComponentConfig } from './types';

// Función para mapear nombres de iconos a emojis
const getIconEmoji = (iconName: string): string => {
  const iconMapping: { [key: string]: string } = {
    'gavel': '⚖️',
    'work': '💼',
    'balance': '⚖️',
    'law': '📜',
    'justice': '⚖️',
    'court': '🏛️',
    'contract': '📄',
    'document': '📋',
    'family': '👨‍👩‍👧‍👦',
    'divorce': '💔',
    'inheritance': '🏠',
    'estate': '🏠',
    'business': '🏢',
    'corporate': '🏢',
    'employment': '💼',
    'labor': '👷',
    'tax': '💰',
    'finance': '💳',
    'real-estate': '🏠',
    'property': '🏠',
    'criminal': '🚔',
    'civil': '⚖️',
    'commercial': '🏢',
    'intellectual': '💡',
    'patent': '📋',
    'trademark': '™️',
    'copyright': '©️',
    'immigration': '🛂',
    'visa': '📋',
    'citizenship': '🛂',
    'international': '🌍',
    'arbitration': '🤝',
    'mediation': '🤝',
    'negotiation': '🤝',
    'litigation': '⚖️',
    'appeal': '📤',
    'settlement': '🤝',
    'consultation': '💬',
    'advice': '💡',
    'representation': '👨‍💼',
    'defense': '🛡️',
    'prosecution': '⚖️',
    'investigation': '🔍',
    'evidence': '📋',
    'testimony': '🗣️',
    'expert': '👨‍🔬',
    'witness': '👁️',
    'jury': '👥',
    'judge': '👨‍⚖️',
    'lawyer': '👨‍💼',
    'attorney': '👨‍💼',
    'counsel': '👨‍💼',
    'solicitor': '👨‍💼',
    'barrister': '👨‍💼',
    'notary': '📋',
    'paralegal': '📋',
    'legal-assistant': '📋',
    'clerk': '📋',
    'secretary': '📋',
    'receptionist': '📞',
    'office': '🏢',
    'firm': '🏢',
    'practice': '🏢',
    'partnership': '🤝',
    'corporation': '🏢',
    'llc': '🏢',
    'trust': '🔒',
    'foundation': '🏛️',
    'charity': '❤️',
    'nonprofit': '🏛️',
    'government': '🏛️',
    'public': '🏛️',
    'private': '🔒',
    'confidential': '🔒',
    'privileged': '🔒',
    'secret': '🔒',
    'classified': '🔒',
    'sensitive': '🔒',
    'personal': '👤',
    'family-law': '👨‍👩‍👧‍👦',
    'criminal-law': '🚔',
    'civil-law': '⚖️',
    'commercial-law': '🏢',
    'corporate-law': '🏢',
    'employment-law': '💼',
    'labor-law': '👷',
    'tax-law': '💰',
    'finance-law': '💳',
    'real-estate-law': '🏠',
    'property-law': '🏠',
    'intellectual-property': '💡',
    'patent-law': '📋',
    'trademark-law': '™️',
    'copyright-law': '©️',
    'immigration-law': '🛂',
    'international-law': '🌍',
    'arbitration-law': '🤝',
    'mediation-law': '🤝',
    'litigation-law': '⚖️',
    'appeals-law': '📤',
    'settlement-law': '🤝',
    'consultation-law': '💬',
    'advice-law': '💡',
    'representation-law': '👨‍💼',
    'defense-law': '🛡️',
    'prosecution-law': '⚖️',
    'investigation-law': '🔍',
    'evidence-law': '📋',
    'testimony-law': '🗣️',
    'expert-law': '👨‍🔬',
    'witness-law': '👁️',
    'jury-law': '👥',
    'judge-law': '👨‍⚖️',
    'lawyer-law': '👨‍💼',
    'attorney-law': '👨‍💼',
    'counsel-law': '👨‍💼',
    'solicitor-law': '👨‍💼',
    'barrister-law': '👨‍💼',
    'notary-law': '📋',
    'paralegal-law': '📋',
    'legal-assistant-law': '📋',
    'clerk-law': '📋',
    'secretary-law': '📋',
    'receptionist-law': '📞',
    'office-law': '🏢',
    'firm-law': '🏢',
    'practice-law': '🏢',
    'partnership-law': '🤝',
    'corporation-law': '🏢',
    'llc-law': '🏢',
    'trust-law': '🔒',
    'foundation-law': '🏛️',
    'charity-law': '❤️',
    'nonprofit-law': '🏛️',
    'government-law': '🏛️',
    'public-law': '🏛️',
    'private-law': '🔒',
    'confidential-law': '🔒',
    'privileged-law': '🔒',
    'secret-law': '🔒',
    'classified-law': '🔒',
    'sensitive-law': '🔒',
    'personal-law': '👤'
  };

  // Si ya es un emoji, devolverlo tal como está
  if (/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(iconName)) {
    return iconName;
  }

  // Buscar en el mapeo (case insensitive)
  const normalizedIconName = iconName.toLowerCase().trim();
  return iconMapping[normalizedIconName] || '⚖️'; // Default a ⚖️ si no se encuentra
};

interface ComponentRendererProps {
  component: ComponentConfig;
}

const ComponentRenderer: React.FC<ComponentRendererProps> = ({ component }) => {
  const renderComponent = () => {
    switch (component.type) {
      case 'hero-banner':
        return <HeroBanner props={component.props} />;
      case 'service-cards':
        return <ServiceCards props={component.props} />;
      case 'contact-form':
        return <ContactButton props={component.props} />;
      case 'testimonials':
        return <Testimonials props={component.props} />;
      case 'stats':
        return <Stats props={component.props} />;
      case 'text-block':
        return <TextBlock props={component.props} />;
      case 'image-gallery':
        return <ImageGallery props={component.props} />;
      case 'map':
        return <Map props={component.props} />;
      case 'divider':
        return <Divider props={component.props} />;
      case 'spacer':
        return <Spacer props={component.props} />;
      default:
        return <div className="p-4 bg-red-100 border border-red-300 rounded">
          <p className="text-red-700">Componente no reconocido: {component.type}</p>
        </div>;
    }
  };

  return (
    <div className="component-renderer">
      {renderComponent()}
    </div>
  );
};

// Componentes individuales
const HeroBanner: React.FC<{ props: any }> = ({ props }) => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showServicesModal, setShowServicesModal] = useState(false);

  return (
    <>
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white p-8 rounded-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{props.title || 'Banner Principal'}</h1>
          <p className="text-xl mb-6 opacity-90">{props.subtitle || 'Subtítulo del banner'}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowContactModal(true)}
              className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {props.ctaText || 'Consultar Ahora'}
            </button>
            <button
              onClick={() => setShowServicesModal(true)}
              className="inline-block border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              {props.secondaryText || 'Conocer Servicios'}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de contacto desde el hero banner */}
      {showContactModal && (
        <ContactModal 
          onClose={() => setShowContactModal(false)} 
          props={{
            title: 'Solicitar Consulta Gratuita',
            submitText: 'Enviar Consulta'
          }} 
        />
      )}

      {/* Modal de servicios desde el hero banner */}
      {showServicesModal && (
        <ServicesModal 
          onClose={() => setShowServicesModal(false)} 
        />
      )}
    </>
  );
};

const ServiceCards: React.FC<{ props: any }> = ({ props }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log('[ServiceCards] Iniciando fetch de servicios...'); // Updated logging
        const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/parametros/services`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[ServiceCards] Datos recibidos:', data);
          setServices(data);
        } else {
          throw new Error('Error al cargar los servicios');
        }
      } catch (err) {
        console.error('[ServiceCards] Error fetching services:', err);
        setError('Error al cargar los servicios');
        // Fallback a servicios estáticos si hay error
        setServices(props.services || []);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []); // Always fetch from API - ignore static layout data

  console.log('[ServiceCards] Estado actual:', { loading, error, servicesCount: services.length });

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Nuestros Servicios'}</h2>
      
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando servicios...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error al cargar servicios</p>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      )}

                {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {services.map((service: any, index: number) => (
                <div key={service.id || index} className="text-center p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-3">{getIconEmoji(service.ICON || service.icon || 'gavel')}</div>
                  <h3 className="text-lg font-semibold mb-2">{service.TITLE || service.title || 'Servicio'}</h3>
                  <p className="text-gray-600">{service.DESCRIPTION || service.description || 'Descripción del servicio'}</p>
                </div>
              ))}
            </div>
          )}

      {!loading && !error && services.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">No hay servicios configurados</p>
        </div>
      )}
    </div>
  );
};

const ContactButton: React.FC<{ props: any }> = ({ props }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="bg-white p-6 rounded-lg border text-center">
        <h2 className="text-2xl font-bold mb-4">{props.title || 'Contáctanos'}</h2>
        <p className="text-gray-600 mb-6">{props.subtitle || 'Estamos aquí para ayudarte'}</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {props.buttonText || 'Solicitar Consulta'}
        </button>
      </div>

      {/* Modal del formulario de contacto */}
      {showModal && <ContactModal onClose={() => setShowModal(false)} props={props} />}
    </>
  );
};

const ContactModal: React.FC<{ onClose: () => void; props: any }> = ({ onClose, props }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    asunto: 'Consulta desde formulario de contacto',
    mensaje: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              const response = await fetch(`${(import.meta as any).env.VITE_API_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ip: 'unknown',
          userAgent: navigator.userAgent
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          nombre: '',
          email: '',
          telefono: '',
          asunto: 'Consulta desde formulario de contacto',
          mensaje: ''
        });
        // Cerrar modal después de 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        const errorText = await response.text();
        console.error('Error del servidor:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">{props.title || 'Contáctanos'}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {submitStatus === 'success' && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-800">
                    ¡Gracias por tu mensaje! Nos pondremos en contacto contigo en las próximas 24 horas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">
                    Ha ocurrido un error al enviar tu mensaje. Por favor, inténtalo de nuevo.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="nombre"
              placeholder="Nombre *"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="email"
              name="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="tel"
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              name="asunto"
              placeholder="Asunto *"
              value={formData.asunto}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <textarea
              name="mensaje"
              placeholder="Mensaje *"
              rows={4}
              value={formData.mensaje}
              onChange={handleChange}
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : (props.submitText || 'Enviar Mensaje')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const ServicesModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        console.log('[ServicesModal] Iniciando fetch de servicios...');
        const apiUrl = `${(import.meta as any).env.VITE_API_URL}/api/parametros/services`;
        console.log('[ServicesModal] URL de la API:', apiUrl);
        
        const response = await fetch(apiUrl);
        console.log('[ServicesModal] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[ServicesModal] Datos recibidos:', data);
          setServices(data);
        } else {
          const errorText = await response.text();
          console.error('[ServicesModal] Error response:', errorText);
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      } catch (err) {
        console.error('[ServicesModal] Error fetching services:', err);
        setError('Error al cargar los servicios');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  console.log('[ServicesModal] Estado actual:', { loading, error, servicesCount: services.length });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Nuestros Servicios Legales</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando servicios...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600">{error}</p>
              <p className="text-gray-500 text-sm mt-2">Revisa la consola para más detalles</p>
            </div>
          )}

          {!loading && !error && services.length === 0 && (
            <div className="text-center py-8">
              <div className="text-yellow-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <p className="text-gray-600">No se encontraron servicios</p>
              <p className="text-gray-500 text-sm mt-2">Verifica que hay servicios configurados en el panel de administración</p>
            </div>
          )}

          {!loading && !error && services.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service) => (
                <div key={service.id} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="text-4xl flex-shrink-0">{getIconEmoji(service.ICON || service.icon || 'gavel')}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.TITLE || service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.DESCRIPTION || service.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                onClose();
                // Abrir modal de contacto después de cerrar el de servicios
                setTimeout(() => {
                  const contactButton = document.querySelector('[onclick*="setShowContactModal"]') as HTMLButtonElement;
                  if (contactButton) {
                    contactButton.click();
                  }
                }, 100);
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Solicitar Consulta Gratuita
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Testimonials: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-gray-50 p-6 rounded-lg">
    <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Lo que dicen nuestros clientes'}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(props.testimonials || []).map((testimonial: any, index: number) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center mb-3">
            <div className="text-yellow-400 text-lg">★★★★★</div>
          </div>
          <p className="text-gray-700 mb-3">"{testimonial.text || 'Excelente servicio'}"</p>
          <p className="font-semibold text-gray-900">{testimonial.name || 'Cliente'}</p>
        </div>
      ))}
    </div>
  </div>
);

const Stats: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Nuestros Números'}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {(props.stats || []).map((stat: any, index: number) => (
        <div key={index} className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value || '0'}</div>
          <div className="text-gray-600">{stat.label || 'Estadística'}</div>
        </div>
      ))}
    </div>
  </div>
);

const TextBlock: React.FC<{ props: any }> = ({ props }) => (
  <div className={`bg-white p-6 rounded-lg border text-${props.alignment || 'left'}`}>
    <h2 className="text-2xl font-bold mb-4">{props.title || 'Título del bloque'}</h2>
    <p className={`text-gray-700 ${props.fontSize === 'large' ? 'text-lg' : props.fontSize === 'small' ? 'text-sm' : 'text-base'}`}>
      {props.content || 'Contenido del bloque de texto. Aquí puedes escribir cualquier información relevante.'}
    </p>
  </div>
);

const ImageGallery: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-6">{props.title || 'Galería de Imágenes'}</h2>
    <div className={`grid grid-cols-${props.columns || 3} gap-4`}>
      {(props.images || []).map((image: string, index: number) => (
        <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <span className="text-gray-500">🖼️ Imagen {index + 1}</span>
        </div>
      ))}
    </div>
  </div>
);

const Map: React.FC<{ props: any }> = ({ props }) => (
  <div className="bg-white p-6 rounded-lg border">
    <h2 className="text-2xl font-bold text-center mb-4">{props.title || 'Nuestra Ubicación'}</h2>
    <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-2">🗺️</div>
        <p className="text-gray-600">{props.address || 'Dirección del despacho'}</p>
      </div>
    </div>
  </div>
);

const Divider: React.FC<{ props: any }> = ({ props }) => (
  <div className="flex items-center justify-center py-4">
    <div 
      className={`w-full h-${props.thickness || 1} bg-${props.color || 'gray-300'}`}
      style={{ backgroundColor: props.color || '#e5e7eb' }}
    />
  </div>
);

const Spacer: React.FC<{ props: any }> = ({ props }) => (
  <div style={{ height: `${props.height || 40}px` }} />
);

export default ComponentRenderer; 