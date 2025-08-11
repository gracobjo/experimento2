import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

interface LegalContent {
  id: string;
  clave: string;
  valor: string;
  etiqueta: string;
  tipo: string;
}

const PrivacyPage: React.FC = () => {
  const [privacyContent, setPrivacyContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchPrivacyContent = async () => {
      try {
        setLoading(true);
        const response = await api.get('/parametros/legal/PRIVACY_POLICY');
        setPrivacyContent(response.data.valor);
      } catch (err) {
        console.error('Error fetching privacy content:', err);
        setError('No se pudo cargar la política de privacidad');
        // Contenido por defecto
        setPrivacyContent(`
          <h1>Política de Privacidad</h1>
          <p>Esta política de privacidad describe cómo recopilamos, usamos y protegemos su información personal.</p>
          <h2>Información que recopilamos</h2>
          <p>Recopilamos información que usted nos proporciona directamente, como cuando se registra en nuestro sitio web, nos contacta o utiliza nuestros servicios.</p>
          <h2>Cómo usamos su información</h2>
          <p>Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios, comunicarnos con usted y cumplir con nuestras obligaciones legales.</p>
          <h2>Protección de la información</h2>
          <p>Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción.</p>
          <h2>Sus derechos</h2>
          <p>Usted tiene derecho a acceder, corregir, eliminar y oponerse al procesamiento de su información personal. Para ejercer estos derechos, contáctenos.</p>
          <h2>Contacto</h2>
          <p>Si tiene preguntas sobre esta política de privacidad, contáctenos en info@despacholegal.com</p>
        `);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando política de privacidad...</p>
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
              dangerouslySetInnerHTML={{ __html: privacyContent }}
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

export default PrivacyPage; 