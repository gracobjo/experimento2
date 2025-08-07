import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuickActions from '../../components/QuickActions';
import LawyerContactModal from '../../components/LawyerContactModal';

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
  }[] | Record<string, never>;
}

const ClientCaseDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLawyerContact, setShowLawyerContact] = useState(false);

  useEffect(() => {
    const fetchCase = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        console.log('🔍 Fetching case with ID:', id);
        console.log('🔍 API URL:', `${(import.meta as any).env.VITE_API_URL || 'http://localhost:3000'}/api/cases/${id}`);
        
        const response = await axios.get(`/api/cases/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📊 Response status:', response.status);
        console.log('📊 Response headers:', response.headers);
        console.log('📊 Case data received:', response.data);
        
        // Check if we received HTML instead of JSON
        if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
          throw new Error('El servidor está devolviendo HTML en lugar de datos JSON. Esto indica un problema de configuración del API.');
        }
        
        setCaseData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('❌ Error fetching case:', err);
        console.error('❌ Error response:', err.response?.data);
        console.error('❌ Error status:', err.response?.status);
        
        let errorMessage = 'Error al cargar el expediente';
        
        if (err.response?.status === 404) {
          errorMessage = 'Expediente no encontrado';
        } else if (err.response?.status === 401) {
          errorMessage = 'No autorizado para ver este expediente';
        } else if (err.response?.status === 403) {
          errorMessage = 'No tienes permisos para ver este expediente';
        } else if (err.message?.includes('HTML')) {
          errorMessage = 'Error de configuración del servidor. El backend no está respondiendo correctamente.';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ABIERTO': return 'bg-green-100 text-green-800';
      case 'EN_PROCESO': return 'bg-yellow-100 text-yellow-800';
      case 'CERRADO': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ABIERTO': return 'Abierto';
      case 'EN_PROCESO': return 'En Proceso';
      case 'CERRADO': return 'Cerrado';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Fecha no disponible';
      }
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Fecha no disponible';
    }
  };

  const handleContactLawyer = () => {
    if (caseData?.lawyer?.email) {
      setShowLawyerContact(true);
    } else {
      alert('No hay información de contacto del abogado disponible.');
    }
  };

  console.log('Render state:', { loading, error, caseData });
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <div className="text-gray-600">{error || 'Expediente no encontrado'}</div>
          <button 
            onClick={() => navigate('/client/cases')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Volver a Expedientes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/client/cases')}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Volver a Expedientes"
              title="Volver a Expedientes"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
              <p className="mt-1 text-gray-600">
                Expediente creado el {formatDate(caseData.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <QuickActions expedienteId={caseData.id} expedienteData={caseData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado y Descripción */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Estado del Expediente</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(caseData.status)}`}>
                  {getStatusText(caseData.status)}
                </span>
              </div>
              <p className="text-gray-700 mb-4">
                {caseData.description || 'No hay descripción disponible para este expediente.'}
              </p>
              <p className="text-sm text-gray-600">
                {caseData.status === 'ABIERTO' && 'Tu caso está siendo revisado por nuestro equipo legal.'}
                {caseData.status === 'EN_PROCESO' && 'Tu caso está en proceso activo. Nuestro abogado está trabajando en él.'}
                {caseData.status === 'CERRADO' && 'Tu caso ha sido completado y cerrado.'}
              </p>
            </div>

            {/* Documentos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentos del Caso</h2>
              
              {caseData.documents && Array.isArray(caseData.documents) && caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                          <p className="text-xs text-gray-500">
                            Subido el {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Descargar
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay documentos disponibles aún.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Abogado */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Abogado Asignado</h2>
              {caseData.lawyer ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{caseData.lawyer.name}</p>
                      <p className="text-sm text-gray-600">{caseData.lawyer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleContactLawyer}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Contactar Abogado
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">No hay abogado asignado aún.</p>
              )}
            </div>

            {/* Información del Caso */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Caso</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">ID del Expediente</p>
                  <p className="text-sm text-gray-900 font-mono">{caseData.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Estado</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseData.status)}`}>
                    {getStatusText(caseData.status)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Fecha de Creación</p>
                  <p className="text-sm text-gray-900">{formatDate(caseData.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Contacto con Abogado */}
      {showLawyerContact && caseData.lawyer && (
        <LawyerContactModal
          lawyer={caseData.lawyer}
          onClose={() => setShowLawyerContact(false)}
        />
      )}
    </div>
  );
};

export default ClientCaseDetailPage; 