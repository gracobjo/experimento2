import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from '../../api/axios';

interface LegalContent {
  id: string;
  clave: string;
  valor: string;
  etiqueta: string;
  tipo: string;
}

const CookiesPage: React.FC = () => {
  const [cookiesContent, setCookiesContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchCookiesContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/parametros/legal/COOKIE_POLICY');
        setCookiesContent(response.data.valor);
      } catch (err) {
        console.error('Error fetching cookies content:', err);
        setError('No se pudo cargar la política de cookies');
        // Contenido por defecto basado en la guía de la AEPD
        setCookiesContent(`
          <h1>Política de Cookies</h1>
          <p>Esta política de cookies explica qué son las cookies, cómo las utilizamos y cómo puede gestionarlas.</p>
          
          <h2>¿Qué son las cookies?</h2>
          <p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web. Nos ayudan a mejorar su experiencia y a analizar el tráfico del sitio.</p>
          
          <h2>Tipos de cookies que utilizamos</h2>
          
          <h3>Cookies técnicas (necesarias)</h3>
          <p>Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar. Incluyen:</p>
          <ul>
            <li>Cookies de sesión para mantener su sesión activa</li>
            <li>Cookies de seguridad para proteger contra ataques</li>
            <li>Cookies de preferencias para recordar su configuración</li>
          </ul>
          
          <h3>Cookies analíticas</h3>
          <p>Nos ayudan a entender cómo interactúan los visitantes con nuestro sitio web:</p>
          <ul>
            <li>Análisis de tráfico y uso del sitio</li>
            <li>Identificación de páginas más populares</li>
            <li>Mejora de la experiencia del usuario</li>
          </ul>
          
          <h3>Cookies de funcionalidad</h3>
          <p>Mejoran la funcionalidad del sitio web:</p>
          <ul>
            <li>Recordar sus preferencias de idioma</li>
            <li>Personalizar el contenido mostrado</li>
            <li>Mejorar la navegación</li>
          </ul>
          
          <h2>Gestión de cookies</h2>
          <p>Puede gestionar las cookies a través de la configuración de su navegador:</p>
          <ul>
            <li><strong>Chrome:</strong> Configuración > Privacidad y seguridad > Cookies</li>
            <li><strong>Firefox:</strong> Opciones > Privacidad y seguridad > Cookies</li>
            <li><strong>Safari:</strong> Preferencias > Privacidad > Cookies</li>
            <li><strong>Edge:</strong> Configuración > Cookies y permisos del sitio</li>
          </ul>
          
          <h2>Cookies de terceros</h2>
          <p>Algunos servicios de terceros pueden instalar cookies en su dispositivo:</p>
          <ul>
            <li>Google Analytics para análisis web</li>
            <li>Servicios de chat en vivo</li>
            <li>Herramientas de redes sociales</li>
          </ul>
          
          <h2>Actualizaciones de esta política</h2>
          <p>Podemos actualizar esta política de cookies ocasionalmente. Le notificaremos cualquier cambio significativo.</p>
          
          <h2>Contacto</h2>
          <p>Si tiene preguntas sobre nuestra política de cookies, contáctenos en info@despacholegal.com</p>
          
          <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
            <p class="text-sm text-blue-700">
              <strong>Nota:</strong> Esta política cumple con las directrices de la Agencia Española de Protección de Datos (AEPD) y el Reglamento General de Protección de Datos (RGPD).
            </p>
          </div>
        `);
      } finally {
        setLoading(false);
      }
    };

    fetchCookiesContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando política de cookies...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: cookiesContent }}
            />
          </div>
          
          {/* Botón de edición para administradores */}
          {user?.role === 'ADMIN' && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              <button
                onClick={() => window.location.href = '/admin/parametros'}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                ✏️ Editar Contenido
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookiesPage; 