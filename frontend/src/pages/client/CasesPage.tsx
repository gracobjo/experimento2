import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';
  clientId: string;
  lawyerId: string;
  createdAt: string;
  lawyer: {
    id: string;
    name: string;
    email: string;
  };
  documents: {
    id: string;
    filename: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
}

const ClientCasesPage = () => {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Cargar expedientes del cliente
  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        
        const response = await api.get('/cases');

        // Asegurar que response.data sea un array
        const casesData = Array.isArray(response.data) ? response.data : [];
        setCases(casesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError('Error al cargar los expedientes');
        setCases([]); // Asegurar que cases sea un array vacío en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <div className="text-gray-600">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Asegurar que cases sea un array antes de hacer map
  const casesArray = Array.isArray(cases) ? cases : [];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Expedientes</h1>
          <p className="mt-2 text-gray-600">
            Revisa el estado de tus casos legales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {casesArray.map((caseItem) => (
            <div key={caseItem.id} className="bg-white shadow rounded-lg p-6">
                                                          <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {caseItem.title}
                </h2>
              <p className="text-gray-600 text-sm mb-4">
                {caseItem.description || 'Sin descripción disponible'}
              </p>
              <div className="text-sm text-gray-500 mb-4">
                Abogado: {caseItem.lawyer?.name || 'No asignado'}
              </div>
              <Link
                to={`/client/cases/${caseItem.id}`}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
              >
                Ver Detalles
              </Link>
            </div>
          ))}
        </div>

        {casesArray.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-sm font-medium text-gray-900">No se encontraron expedientes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Aún no tienes expedientes asignados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCasesPage; 