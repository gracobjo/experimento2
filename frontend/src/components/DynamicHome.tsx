import React, { useState, useEffect } from 'react';
import { LayoutConfig } from './HomeBuilder/types';
import ComponentRenderer from './HomeBuilder/ComponentRenderer';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const DynamicHome: React.FC = () => {
  const [layout, setLayout] = useState<LayoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        setLoading(true);
        const response = await api.get('/layouts/home');
        
        if (response.status === 200) {
          setLayout(response.data);
        } else if (response.status === 404) {
          // No hay layout activo, usar layout por defecto
          setLayout(getDefaultLayout());
        } else {
          throw new Error('Error al cargar el layout');
        }
      } catch (err) {
        console.error('Error fetching layout:', err);
        // Usar layout por defecto en caso de error
        setLayout(getDefaultLayout());
      } finally {
        setLoading(false);
      }
    };

    fetchLayout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (error && !layout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">Página no encontrada</h2>
          <p className="text-gray-500">No hay contenido configurado para esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Título principal oculto para lectores de pantalla */}
      <h1 className="sr-only">Página Principal - Despacho Legal</h1>
      
      {layout.components.map((component) => (
        <div key={component.id}>
          <ComponentRenderer
            component={component}
          />
        </div>
      ))}
    </div>
  );
};

// Layout por defecto cuando no hay uno configurado
const getDefaultLayout = (): LayoutConfig => ({
  id: 'default-home',
  name: 'Home Page',
  components: [
    {
      id: 'default-hero',
      type: 'hero-banner',
      props: {
        title: 'Bienvenido a Nuestro Despacho Legal',
        subtitle: 'Servicios legales profesionales y confiables para proteger sus derechos',
        backgroundImage: '/images/hero-bg.jpg',
        ctaText: 'Solicitar Consulta Gratuita',
        secondaryText: 'Conocer Servicios',
        secondaryLink: '/contact'
      },
      order: 0
    },
    {
      id: 'default-services',
      type: 'service-cards',
      props: {
        title: 'Nuestros Servicios',
        services: [
          {
            title: 'Derecho Civil',
            description: 'Asesoría especializada en casos civiles y comerciales',
            icon: '⚖️'
          },
          {
            title: 'Derecho Laboral',
            description: 'Protección de sus derechos laborales y reclamaciones',
            icon: '👥'
          },
          {
            title: 'Derecho Familiar',
            description: 'Divorcios, custodia y asuntos familiares',
            icon: '👨‍👩‍👧‍👦'
          }
        ]
      },
      order: 1
    },
    {
      id: 'default-stats',
      type: 'stats',
      props: {
        title: 'Nuestros Números',
        stats: [
          { label: 'Casos Exitosos', value: '500+', icon: '✅' },
          { label: 'Años de Experiencia', value: '15', icon: '📅' },
          { label: 'Clientes Satisfechos', value: '1000+', icon: '👥' }
        ]
      },
      order: 2
    },
    {
      id: 'default-contact',
      type: 'contact-form',
      props: {
        title: '¿Necesitas Asesoría Legal?',
        subtitle: 'Nuestros abogados especialistas están listos para ayudarte',
        buttonText: 'Solicitar Consulta Gratuita',
        submitText: 'Enviar Consulta'
      },
      order: 3
    }
  ],
  version: 1,
  lastModified: new Date().toISOString()
});

export default DynamicHome; 