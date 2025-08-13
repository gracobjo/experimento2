import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import QuickActions from '../../components/QuickActions';
import NotesList from '../../components/NotesList';
import FileUpload from '../../components/forms/FileUpload';
import { getBackendUrl } from '../../config/endpoints';

interface Case {
  id: string;
  title: string;
  description?: string;
  status: 'ABIERTO' | 'EN_PROCESO' | 'CERRADO';
  clientId: string;
  lawyerId: string;
  createdAt: string;
  client: {
    id: string;
    dni: string;
    phone?: string;
    address?: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
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
    originalName: string; // Added originalName to the interface
  }[];
}


const CaseDetailPage = () => {

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Document upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '' });

  useEffect(() => {



    const fetchCase = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await api.get(`/cases/${id}`);

        setCaseData(response.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching case:', err);
        setError(err.response?.data?.message || 'Error al cargar el expediente');
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!caseData) return;

    try {
      setUpdatingStatus(true);
      await api.patch(`/cases/${id}/status`, { status: newStatus });

      setCaseData(prev => prev ? { ...prev, status: newStatus as any } : null);
    } catch (err: any) {
      console.error('Error updating status:', err);
      setError('Error al actualizar el estado del expediente');
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  // Document upload methods
  const handleFileSelect = (files: File[]) => {
    console.log('handleFileSelect called with:', files.length, 'files');
    console.log('Files:', files.map(f => f.name));
    
    // Verificar si hay duplicados
    const uniqueFiles = files.filter((file, index, self) => 
      index === self.findIndex(f => f.name === file.name && f.size === file.size)
    );
    
    if (uniqueFiles.length !== files.length) {
      console.warn('Se encontraron archivos duplicados, eliminando...');
    }
    
    setSelectedFiles(uniqueFiles);
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);
  };

  const openUploadModal = () => {
    setShowUploadModal(true);
    setUploadError(null);
    setSelectedFiles([]);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadForm({ title: '', description: '' });
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Por favor selecciona archivos para subir');
      return;
    }

    if (!uploadForm.title.trim()) {
      setUploadError('Por favor ingresa un título para el documento');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', uploadForm.title);
        formData.append('expedienteId', caseData!.id);
        if (uploadForm.description) {
          formData.append('description', uploadForm.description);
        }

        return api.post('/documents/upload', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });
      });

      console.log('Subiendo archivos...');
      const uploadResults = await Promise.all(uploadPromises);
      console.log('Resultados de subida:', uploadResults.map(r => r.data));

      // Recargar el caso para obtener los documentos actualizados
      const response = await api.get(`/cases/${id}`);
      setCaseData(response.data);

      // Cerrar modal y limpiar formulario
      closeUploadModal();
      
    } catch (err: any) {
      console.error('Error uploading files:', err);
      console.error('Error response:', err.response?.data);
      setUploadError(err.response?.data?.message || 'Error al subir los archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleViewDocument = async (documentId: string, originalName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUploadError('No hay token de autenticación. Por favor, inicia sesión de nuevo.');
        return;
      }

      // Hacer petición autenticada al endpoint usando el ID del documento
      const response = await fetch(`${getBackendUrl()}/api/documents/file/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Error viewing document:', error);
      setUploadError(error.message || 'Error al visualizar el documento');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
            onClick={() => navigate('/lawyer/cases')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            aria-label="Volver a la lista de expedientes"
            aria-describedby="volver-lista-help"
          >
            Volver a Expedientes
          </button>
          <div id="volver-lista-help" className="sr-only">
            Regresar a la página principal de expedientes
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/lawyer/cases')}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Volver a Expedientes"
                  title="Volver a Expedientes"
                  type="button"
                  aria-describedby="volver-expedientes-help"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div id="volver-expedientes-help" className="sr-only">
                  Regresar a la lista de expedientes
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
              </div>
              <p className="mt-2 text-gray-600">
                Expediente creado el {new Date(caseData.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to={`/lawyer/cases/${id}/edit`}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                aria-label="Editar expediente"
                aria-describedby="edit-expediente-help"
              >
                Editar
              </Link>
              <div id="edit-expediente-help" className="sr-only">
                Ir a la página de edición del expediente
              </div>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <QuickActions expedienteId={caseData.id} expedienteData={caseData} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Estado del Expediente */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Estado del Expediente</h2>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(caseData.status)}`}>
                  {getStatusText(caseData.status)}
                </span>
                {(user?.role === 'ABOGADO' || user?.role === 'ADMIN') && (
                  <>
                    <label htmlFor="status-select" className="sr-only">
                      Cambiar estado del expediente
                    </label>
                    <select
                      id="status-select"
                      value={caseData.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Cambiar estado del expediente"
                      aria-label="Cambiar estado del expediente"
                      aria-describedby="status-select-help"
                    >
                      <option value="ABIERTO">Abierto</option>
                      <option value="EN_PROCESO">En Proceso</option>
                      <option value="CERRADO">Cerrado</option>
                    </select>
                    <div id="status-select-help" className="sr-only">
                      Seleccione el nuevo estado del expediente
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Descripción</h2>
              <p className="text-gray-700">
                {caseData.description || 'No hay descripción disponible para este expediente.'}
              </p>
            </div>

            {/* Documentos */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
                <button 
                  onClick={openUploadModal}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  aria-label="Subir documento al expediente"
                  aria-describedby="upload-document-help"
                >
                  Subir Documento
                </button>
                <div id="upload-document-help" className="sr-only">
                  Haga clic para subir un nuevo documento al expediente
                </div>
              </div>

              {caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.filename}</p>
                          <p className="text-xs text-gray-500">
                            Subido el {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDocument(doc.id, doc.originalName)}
                        className="text-blue-600 hover:text-blue-800 text-sm bg-transparent border-none cursor-pointer"
                        aria-label={`Ver documento ${doc.originalName}`}
                        aria-describedby={`doc-help-${doc.id}`}
                      >
                        Ver
                      </button>
                      <div id={`doc-help-${doc.id}`} className="sr-only">
                        Abrir documento en una nueva pestaña
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay documentos subidos aún.</p>
              )}
            </div>

            {/* Notas del Expediente */}
            <NotesList expedienteId={caseData.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Cliente */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Cliente</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{caseData.client.user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{caseData.client.user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">DNI</p>
                  <p className="text-sm text-gray-900">{caseData.client.dni}</p>
                </div>
                {caseData.client.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Teléfono</p>
                    <p className="text-sm text-gray-900">{caseData.client.phone}</p>
                  </div>
                )}
                {caseData.client.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Dirección</p>
                    <p className="text-sm text-gray-900">{caseData.client.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información del Abogado */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Abogado Asignado</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Nombre</p>
                  <p className="text-sm text-gray-900">{caseData.lawyer.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm text-gray-900">{caseData.lawyer.email}</p>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* Modal de subida de documentos */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Documentos</h3>
              
              {uploadError && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {uploadError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título del documento *
                  </label>
                  <input
                    type="text"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título del documento..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descripción del documento..."
                  />
                </div>

                <FileUpload
                  onFileSelect={handleFileSelect}
                  maxFiles={5}
                  maxSize={5 * 1024 * 1024}
                />

                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Archivos seleccionados:</h4>
                      <button
                        onClick={clearSelectedFiles}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Limpiar
                      </button>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {selectedFiles.map((file, index) => (
                        <li key={index}>{file.name} ({formatFileSize(file.size)})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={closeUploadModal}
                  className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || selectedFiles.length === 0 || !uploadForm.title.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Subiendo...' : 'Subir Documentos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseDetailPage; 