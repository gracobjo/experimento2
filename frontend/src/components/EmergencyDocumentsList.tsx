import React from 'react';
import { EmergencyDocument } from '../services/documentsEmergencyService';

interface EmergencyDocumentsListProps {
  documents: EmergencyDocument[];
  onViewDocument: (id: string) => Promise<void>;
  onDownloadDocument: (id: string) => Promise<void>;
  getDocumentStatus: (doc: EmergencyDocument) => {
    status: 'available' | 'limited' | 'unavailable';
    message: string;
    action: string;
  };
  loading: boolean;
  error: string | null;
}

const EmergencyDocumentsList: React.FC<EmergencyDocumentsListProps> = ({
  documents,
  onViewDocument,
  onDownloadDocument,
  getDocumentStatus,
  loading,
  error,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return '✅';
      case 'limited':
        return '⚠️';
      case 'unavailable':
        return '🚨';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600 bg-green-100';
      case 'limited':
        return 'text-yellow-600 bg-yellow-100';
      case 'unavailable':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleDocumentAction = async (doc: EmergencyDocument) => {
    const status = getDocumentStatus(doc);
    
    try {
      if (status.status === 'available') {
        await onViewDocument(doc.id);
      } else if (status.status === 'limited') {
        await onDownloadDocument(doc.id);
      } else {
        // Mostrar mensaje informativo
        alert('Este documento no está disponible temporalmente debido a una migración de base de datos en progreso.');
      }
    } catch (error) {
      console.error('Error en acción del documento:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando documentos...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar documentos</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
        <p className="mt-1 text-sm text-gray-500">No se encontraron documentos para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Lista de Documentos
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {documents.length} documento(s) encontrado(s)
        </p>
      </div>
      
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => {
          const status = getDocumentStatus(doc);
          
          return (
            <li key={doc.id} className="px-4 py-4 hover:bg-gray-50 transition-colors duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {/* Icono del tipo de archivo */}
                  <div className="flex-shrink-0">
                    {doc.mimeType.includes('pdf') ? (
                      <svg className="h-8 w-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Información del documento */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.originalName || doc.filename}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                        {getStatusIcon(status.status)} {status.status}
                      </span>
                    </div>
                    
                    {doc.description && (
                      <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                    )}
                    
                    <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                      <span>📁 {doc.expediente?.nombre || 'Expediente no disponible'}</span>
                      <span>👤 {doc.uploadedBy || 'Usuario no disponible'}</span>
                      <span>📅 {formatDate(doc.uploadedAt)}</span>
                      <span>📏 {formatFileSize(doc.fileSize)}</span>
                    </div>
                    
                    {/* Mensaje de estado */}
                    <p className="text-xs text-gray-600 mt-1">{status.message}</p>
                  </div>
                </div>
                
                {/* Botón de acción */}
                <div className="flex-shrink-0 ml-4">
                  <button
                    onClick={() => handleDocumentAction(doc)}
                    disabled={status.status === 'unavailable'}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white ${
                      status.status === 'available'
                        ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                        : status.status === 'limited'
                        ? 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {status.action}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      
      {/* Footer informativo */}
      <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Modo de Emergencia:</strong> Algunos documentos pueden tener acceso limitado debido a una migración de base de datos en progreso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDocumentsList;
