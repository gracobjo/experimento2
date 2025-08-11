import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppConfig } from '../../hooks/useSiteConfig';
import Notifications from '../Notifications';
import ChatbotWidget from '../chat/ChatbotWidget';
import ChatbotButton from '../Chatbot/ChatbotButton';
import AccessibilityTester from '../AccessibilityTester';
import ContactModal from '../ContactModal';
import api from '../../api/axios';

interface ContactParam {
  id: string;
  clave: string;
  valor: string;
  etiqueta: string;
  tipo: string;
}

interface UnreadCount {
  count: number;
}

const Layout = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const [openBilling, setOpenBilling] = useState(false);
  const [contactParams, setContactParams] = useState<ContactParam[]>([]);
  const [copyrightText, setCopyrightText] = useState('© 2024 Despacho Legal. Todos los derechos reservados.');
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showAccessibilityTester, setShowAccessibilityTester] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const isLawyer = user?.role === 'ABOGADO';
  const isClient = user?.role === 'CLIENTE';

  // Usar configuraciones dinámicas solo cuando la autenticación no está cargando
  const {
    siteName,
    logoUrl,
    primaryColor,
    menuItems,
    menuOrientation,
    headerFixed,
    footerVisible,
    contactEmail,
    contactPhone,
    socialFacebook,
    socialTwitter,
    socialLinkedin,
    socialInstagram,
    loading: configLoading
  } = useAppConfig(authLoading ? undefined : user?.role);

  // Estilos dinámicos basados en configuraciones
  const navStyle = {
    backgroundColor: primaryColor,
  };

  const headerClass = headerFixed ? 'fixed top-0 w-full z-50' : '';

  // Renderizar elementos del menú
  const renderMenuItem = (item: any) => {
    if (item.children && item.children.length > 0) {
      return (
        <div className="relative">
          <button
            className="hover:text-blue-200 px-2 py-1 rounded focus:outline-none flex items-center"
            onClick={() => setOpenBilling((v) => !v)}
            onBlur={() => setTimeout(() => setOpenBilling(false), 200)}
          >
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.label}
            <svg className="inline w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openBilling && (
            <div 
              className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded shadow-lg z-50"
              onMouseEnter={() => setOpenBilling(true)}
              onMouseLeave={() => setTimeout(() => setOpenBilling(false), 100)}
            >
              {item.children.map((child: any, childIndex: number) => (
                <Link
                  key={child.id || child.label || `child-${childIndex}`}
                  to={child.url}
                  className="block px-4 py-2 hover:bg-blue-100 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenBilling(false);
                  }}
                >
                  {child.icon && <span className="mr-2">{child.icon}</span>}
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Si es el ítem de Chat, mostrar el badge de mensajes no leídos
    const isChat = item.url && item.url.includes('/chat');
    return (
      <Link
        to={item.url}
        className="hover:text-blue-200 flex items-center relative"
        target={item.isExternal ? '_blank' : undefined}
        rel={item.isExternal ? 'noopener noreferrer' : undefined}
      >
        {item.icon && <span className="mr-1">{item.icon}</span>}
        {item.label}
        {isChat && unreadCount > 0 && (
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-600 text-white absolute -top-2 -right-4">
            {unreadCount}
          </span>
        )}
      </Link>
    );
  };

  // Menú por defecto si no hay configuración dinámica
  const getDefaultMenuItems = () => {
    if (isAdmin) {
      return [
        { label: 'Admin Dashboard', url: '/admin/dashboard', icon: '🏠' },
        { label: 'Usuarios', url: '/admin/users', icon: '👥' },
        { label: 'Expedientes', url: '/admin/cases', icon: '📋' },
        { label: 'Citas', url: '/admin/appointments', icon: '📅' },
        { label: 'Tareas', url: '/admin/tasks', icon: '✅' },
        { label: 'Documentos', url: '/admin/documents', icon: '📄' },
        { label: 'Reportes', url: '/admin/reports', icon: '📊' },
        { label: 'Servicios', url: '/admin/services', icon: '⚖️' },
        { label: 'Home Builder', url: '/admin/home-builder', icon: '🎨' }
      ];
    } else if (isLawyer) {
      return [
        { label: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { label: 'Mis Expedientes', url: '/lawyer/cases', icon: '📋' },
        { label: 'Citas', url: '/lawyer/appointments', icon: '📅' },
        { label: 'Tareas', url: '/lawyer/tasks', icon: '✅' },
        { label: 'Chat', url: '/lawyer/chat', icon: '💬' },
        { label: 'Reportes', url: '/lawyer/reports', icon: '📊' },
        { 
          label: 'Facturación', 
          url: '/lawyer/facturacion', // antes era '#'
          icon: '🧾',
          children: [
            { label: 'Provisión de Fondos', url: '/lawyer/provisiones', icon: '💰' },
            { label: 'Facturación Electrónica', url: '/lawyer/facturacion', icon: '📄' }
          ]
        }
      ];
    } else if (isClient) {
      return [
        { label: 'Dashboard', url: '/dashboard', icon: '🏠' },
        { label: 'Mis Expedientes', url: '/client/cases', icon: '📋' },
        { label: 'Provisiones', url: '/client/provisiones', icon: '💰' },
        { label: 'Mis Citas', url: '/client/appointments', icon: '📅' },
        { label: 'Chat', url: '/client/chat', icon: '💬' }
      ];
    }
    return [];
  };

  const currentMenuItems = configLoading ? getDefaultMenuItems() : (menuItems && menuItems.length > 0 ? menuItems : getDefaultMenuItems());



  // Obtener parámetros de contacto y contenido legal
  useEffect(() => {
    const fetchContactParams = async () => {
      try {
        console.log('[LAYOUT] Obteniendo parámetros de contacto...');
        const [contactResponse, legalResponse] = await Promise.all([
          api.get('/parametros/contact'),
          api.get('/parametros/legal')
        ]);
        
        console.log('[LAYOUT] Respuesta de contact:', contactResponse.data);
        console.log('[LAYOUT] Respuesta de legal:', legalResponse.data);
        
        // Asegurar que contactParams sea siempre un array
        const contactData = Array.isArray(contactResponse.data) ? contactResponse.data : [];
        setContactParams(contactData);
        
        console.log('[LAYOUT] Parámetros de contacto cargados:', contactData.length);
        console.log('[LAYOUT] Parámetros encontrados:', contactData.map(p => ({ clave: p.clave, valor: p.valor })));
        
        // Buscar el texto de copyright
        const legalData = Array.isArray(legalResponse.data) ? legalResponse.data : [];
        const copyrightParam = legalData.find((param: ContactParam) => param.clave === 'COPYRIGHT_TEXT');
        if (copyrightParam) {
          setCopyrightText(copyrightParam.valor);
        }
      } catch (error) {
        console.error('[LAYOUT] Error obteniendo parámetros:', error);
        // En caso de error, establecer arrays vacíos
        setContactParams([]);
      }
    };

    fetchContactParams();
  }, []);

  // Consultar el total de mensajes no leídos
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        if (!user) return;
        const res = await api.get('/chat/unread-count');
        setUnreadCount(res.data.count || 0);
      } catch {
        setUnreadCount(0);
      }
    };
    if (user) fetchUnreadCount();
  }, [user]);

  // Función para obtener valor de parámetro por clave
  const getParamValue = (clave: string): string => {
    if (!Array.isArray(contactParams)) {
      console.log('[LAYOUT] getParamValue - contactParams no es array:', contactParams);
      return '';
    }
    const param = contactParams.find(p => p.clave === clave);
    console.log(`[LAYOUT] getParamValue(${clave}):`, param ? param.valor : 'NO ENCONTRADO');
    return param ? param.valor : '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className={`text-white ${headerClass}`} style={navStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold flex items-center">
                {logoUrl && (
                  <img 
                    src={logoUrl} 
                    alt={siteName} 
                    className="h-8 w-auto mr-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                {siteName}
              </Link>
            </div>
            <div className="flex items-center space-x-4 relative">
              {user ? (
                <>
                  {/* Menú dinámico */}
                  <div className={`flex items-center space-x-4 ${menuOrientation === 'vertical' ? 'flex-col' : ''}`}>
                    {currentMenuItems.map((item, index) => (
                      <React.Fragment key={item.id || item.label || `menu-item-${index}`}>
                        {renderMenuItem(item)}
                      </React.Fragment>
                    ))}
                  </div>
                  
                  {/* Información del usuario */}
                  <span className="text-sm font-medium text-white bg-blue-900 rounded px-3 py-1">
                    {user.name} {user.email && <span className="text-gray-300">({user.email})</span>}
                  </span>
                  
                  {/* Botón de prueba de accesibilidad */}
                  <button
                    onClick={() => setShowAccessibilityTester(true)}
                    className="hover:text-blue-200 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="Abrir tester de accesibilidad"
                    title="Probar accesibilidad"
                  >
                    ♿
                  </button>
                  
                  {/* Botón de logout */}
                  <button
                    onClick={logout}
                    className="hover:text-blue-200"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="hover:text-blue-200">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="hover:text-blue-200">
                    Registro
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer para header fijo */}
      {headerFixed && <div className="h-16"></div>}

      {/* Notifications - Solo visible para usuarios autenticados */}
      {user && <Notifications />}

      {/* Main content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      {footerVisible && (
        <footer className="bg-gray-800 text-white">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-white mb-6">Información de Contacto</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Información de contacto */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                <div className="space-y-2 text-sm">
                  {getParamValue('CONTACT_INFO') && (
                    <p className="text-gray-300 mb-2">{getParamValue('CONTACT_INFO')}</p>
                  )}
                  {getParamValue('CONTACT_EMAIL') && (
                    <button
                      onClick={() => setShowContactModal(true)}
                      className="text-left hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 py-1 transition-colors"
                      aria-label={`Abrir formulario de contacto. Email: ${getParamValue('CONTACT_EMAIL')}`}
                    >
                      📧 {getParamValue('CONTACT_EMAIL')}
                    </button>
                  )}
                  {getParamValue('CONTACT_PHONE_PREFIX') && getParamValue('CONTACT_PHONE') && (
                    <p>📞 {getParamValue('CONTACT_PHONE_PREFIX')} {getParamValue('CONTACT_PHONE')}</p>
                  )}
                </div>
              </div>

              {/* Enlaces rápidos */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
                <div className="space-y-2 text-sm">
                  <Link to="/privacidad" className="hover:text-gray-300 block">
                    Política de Privacidad
                  </Link>
                  <Link to="/terminos" className="hover:text-gray-300 block">
                    Términos de Servicio
                  </Link>
                  <Link to="/cookies" className="hover:text-gray-300 block">
                    Política de Cookies
                  </Link>
                </div>
              </div>

              {/* Redes sociales */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
                <div className="flex space-x-4">
                  {getParamValue('SOCIAL_FACEBOOK') && (
                    <a 
                      href={getParamValue('SOCIAL_FACEBOOK')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      📘 Facebook
                    </a>
                  )}
                  {getParamValue('SOCIAL_TWITTER') && (
                    <a 
                      href={getParamValue('SOCIAL_TWITTER')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      🐦 Twitter
                    </a>
                  )}
                  {getParamValue('SOCIAL_LINKEDIN') && (
                    <a 
                      href={getParamValue('SOCIAL_LINKEDIN')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      💼 LinkedIn
                    </a>
                  )}
                  {getParamValue('SOCIAL_INSTAGRAM') && (
                    <a 
                      href={getParamValue('SOCIAL_INSTAGRAM')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      📷 Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-700 text-center">
              <p>{copyrightText}</p>
            </div>
          </div>
        </footer>
      )}

      {/* Chatbot Components */}
      <ChatbotButton onOpen={() => setIsChatbotOpen(true)} />
      <ChatbotWidget 
        isOpen={isChatbotOpen} 
        onClose={() => setIsChatbotOpen(false)} 
      />

      {/* Accessibility Tester */}
      <AccessibilityTester 
        isVisible={showAccessibilityTester}
        onClose={() => setShowAccessibilityTester(false)}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default Layout; 