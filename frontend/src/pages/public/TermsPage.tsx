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

const TermsPage: React.FC = () => {
  const [termsContent, setTermsContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTermsContent = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/parametros/legal/TERMS_OF_SERVICE');
        setTermsContent(response.data.valor);
      } catch (err) {
        console.error('Error fetching terms content:', err);
        setError('No se pudo cargar los términos de servicio');
        // Contenido por defecto
        setTermsContent(`
          <h1>Términos de Servicio</h1>
          <p>Al utilizar nuestros servicios, usted acepta estos términos de servicio.</p>
          <h2>Servicios proporcionados</h2>
          <p>Proporcionamos servicios de asesoramiento jurídico y gestión legal a través de nuestra plataforma digital.</p>
          <h2>Uso aceptable</h2>
          <p>Usted se compromete a utilizar nuestros servicios únicamente para fines legales y de acuerdo con estos términos.</p>
          <h2>Propiedad intelectual</h2>
          <p>Todos los derechos de propiedad intelectual relacionados con nuestros servicios son propiedad de Despacho Legal.</p>
          <h2>Limitación de responsabilidad</h2>
          <p>En la máxima medida permitida por la ley, Despacho Legal no será responsable de daños indirectos, incidentales o consecuentes.</p>
          <h2>Modificaciones</h2>
          <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación.</p>
          <h2>Contacto</h2>
          <p>Si tiene preguntas sobre estos términos, contáctenos en info@despacholegal.com</p>
        `);
      } finally {
        setLoading(false);
      }
    };

    fetchTermsContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando términos de servicio...</p>
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
              dangerouslySetInnerHTML={{ __html: termsContent }}
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

export default TermsPage; 