import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/forms/FileUpload';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  description?: string;
  expedienteId: string;
  uploadedAt: string;
  uploadedBy: {
    id: string;
    name: string;
    email: string;
  };
  expediente: {
    id: string;
    title: string;
    status: string;
  };
}

interface Case {
  id: string;
  title: string;
  description?: string;
  status: string;
  client: {
    id: string;
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
}

const ClientDocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    expedienteId: '',
    title: '',
    description: ''
  });
  const { user } = useAuth();

  // Cargar documentos del cliente
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await api.get('/documents', {
          headers: { Authorization: `Bearer ${token}` }
        });

        setDocuments(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Error al cargar los documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Cargar expedientes del cliente
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/cases', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCases(response.data);
      } catch (err) {
        console.error('Error fetching cases:', err);
      }
    };

    fetchCases();
  }, []);

  // Filtrado de documentos
  useEffect(() => {
    let filtered = documents;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.expediente.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'todos') {
      filtered = filtered.filter(doc => doc.mimeType === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, typeFilter]);

  const handleFileSelect = (files: File[]) => {
    console.log('handleFileSelect called with:', files.length, 'files');
    console.log('Files:', files.map(f => f.name));
    console.log('Files details:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
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
    setError(null);
    // Limpiar archivos seleccionados al abrir el modal
    setSelectedFiles([]);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setSelectedFiles([]);
    setUploadForm({ expedienteId: '', title: '', description: '' });
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadForm.expedienteId || !uploadForm.title.trim()) {
      setError('Por favor selecciona archivos, un expediente y un título');
      return;
    }

    // Validar límite de archivos
    if (selectedFiles.length > 5) {
      setError('No se pueden subir más de 5 archivos por envío');
      return;
    }

    // Validar tamaño total
    const totalSize = selectedFiles.reduce((total, file) => total + file.size, 0);
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (totalSize > maxSize) {
      setError(`El tamaño total de los archivos (${(totalSize / (1024 * 1024)).toFixed(2)}MB) excede el límite de 5MB`);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const token = localStorage.getItem('token');

      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('expedienteId', uploadForm.expedienteId);
        formData.append('title', uploadForm.title);
        if (uploadForm.description) {
          formData.append('description', uploadForm.description);
        }

        return api.post('/documents/upload', formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      });

      console.log('Subiendo archivos...');
      const uploadResults = await Promise.all(uploadPromises);
      console.log('Resultados de subida:', uploadResults.map(r => r.data));

      // Recargar documentos
      console.log('Recargando documentos...');
      const response = await api.get('/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Documentos cargados:', response.data);
      
      // Verificar que los documentos tengan la estructura correcta
      const validDocuments = response.data.filter((doc: any) => {
        const isValid = doc && doc.id && doc.originalName;
        if (!isValid) {
          console.warn('Documento inválido encontrado:', doc);
        }
        return isValid;
      });
      
      setDocuments(validDocuments);

      // Cerrar modal y limpiar formulario
      closeUploadModal();
      
    } catch (err: any) {
      console.error('Error uploading files:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Error al subir los archivos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/documents/${documentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Recargar documentos
      const response = await api.get('/documents', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
      
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError('Error al eliminar el documento');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('text')) return '📝';
    if (mimeType.includes('word')) return '📄';
    return '📎';
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

  // Función para descargar documento con autenticación
  const handleDownload = async (documentId: string, originalName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación. Por favor, inicia sesión de nuevo.');
        return;
      }

      // Hacer la petición al backend con autenticación
                const response = await fetch(`${(import.meta as any).env.VITE_API_URL || 'https://experimento2-production-54c0.up.railway.app'}/api/documents/${documentId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Crear blob y descargar
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error('Error descargando documento:', error);
      alert(`Error al descargar el documento: ${error.message}`);
    }
  };

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

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mis Documentos</h1>
              <p className="mt-2 text-gray-600">
                Accede a todos los documentos de tus expedientes
              </p>
            </div>
            <button
              onClick={openUploadModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Subir Documentos
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre de documento o expediente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Archivo
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filtrar por tipo de archivo"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="todos">Todos los tipos</option>
                <option value="application/pdf">PDF</option>
                <option value="text/plain">Texto</option>
                <option value="image/jpeg">Imágenes</option>
                <option value="application/msword">Word</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('todos');
                }}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{getFileIcon(doc.mimeType)}</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(doc.expediente.status)}`}>
                    {getStatusText(doc.expediente.status)}
                  </span>
                </div>
                
                <h2 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {doc.originalName}
                </h2>
                
                {doc.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {doc.description}
                  </p>
                )}
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {doc.expediente.title}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {doc.uploadedBy.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    {formatFileSize(doc.fileSize)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(doc.id, doc.originalName)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-center text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Descargar
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron documentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {documents.length === 0 
                ? 'Aún no tienes documentos en tus expedientes.'
                : 'Intenta ajustar los filtros de búsqueda.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modal de subida de documentos */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Subir Documentos</h3>
              
              {error && (
                <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expediente
                  </label>
                  <select
                    id="expediente-select"
                    aria-label="Expediente"
                    value={uploadForm.expedienteId}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, expedienteId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Selecciona un expediente</option>
                    {cases.map(caseItem => (
                      <option key={caseItem.id} value={caseItem.id}>
                        {caseItem.title}
                      </option>
                    ))}
                  </select>
                </div>

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
                    <div className="mt-2 text-xs text-gray-500">
                      Total: {formatFileSize(selectedFiles.reduce((total, file) => total + file.size, 0))} / 5MB
                    </div>
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
                  disabled={uploading || selectedFiles.length === 0 || !uploadForm.expedienteId || !uploadForm.title.trim()}
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

export default ClientDocumentsPage; 