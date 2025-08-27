import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import FileUpload from '../../components/forms/FileUpload';
import { getBackendUrl } from '../../config/config';

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
  uploadedByUser: {
    id: string;
    name: string;
    email: string;
  };
  expediente: {
    id: string;
    title: string;
    client: {
      user: {
        name: string;
      };
    };
  };
}

interface DocumentStats {
  total: number;
  totalSize: number;
  byType: {
    type: string;
    count: number;
  }[];
}

const DocumentsPage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    expedienteId: '',
    description: ''
  });
  const [expedientes, setExpedientes] = useState<any[]>([]);
  const { user } = useAuth();

  // Cargar documentos y estadísticas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [documentsResponse, statsResponse, expedientesResponse] = await Promise.all([
          api.get('/documents'),
          api.get('/documents/stats'),
          api.get('/cases')
        ]);

        setDocuments(documentsResponse.data);
        setStats(statsResponse.data);
        setExpedientes(expedientesResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Error al cargar los documentos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrado de documentos
  useEffect(() => {
    let filtered = Array.isArray(documents) ? documents : [];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.expediente.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.expediente.client.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setUploadForm({ expedienteId: '', description: '' });
    setError(null);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !uploadForm.expedienteId) {
      setError('Por favor selecciona archivos y un expediente para el documento');
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
        if (uploadForm.description) {
          formData.append('description', uploadForm.description);
        }

        return api.post('/documents/upload', formData);
      });

      console.log('Subiendo archivos...');
      const uploadResults = await Promise.all(uploadPromises);
      console.log('Resultados de subida:', uploadResults.map(r => r.data));

      // Recargar documentos
      console.log('Recargando documentos...');
              const response = await api.get('/documents');
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

  const handleDelete = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/documents/${documentId}`);

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      // Mostrar mensaje de éxito
      setError(null);
      setSuccess('Documento eliminado exitosamente');
      // Ocultar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000);
      // Recargar estadísticas después de eliminar
              const statsResponse = await api.get('/documents/stats');
      setStats(statsResponse.data);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.response?.data?.message || 'Error al eliminar el documento');
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

  // Función para visualizar documento con streaming desde el backend
  const handleViewDocument = async (documentId: string, originalName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación. Por favor, inicia sesión de nuevo.');
        return;
      }

      console.log(`🔍 Intentando visualizar documento: ${originalName} (ID: ${documentId})`);

      // Hacer petición autenticada al endpoint usando el ID del documento
      const response = await fetch(`${getBackendUrl()}/api/documents/file/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`📡 Respuesta del servidor: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Documento no encontrado en el servidor. Verifica que el archivo exista.`);
        } else if (response.status === 403) {
          throw new Error(`No tienes permisos para acceder a este documento.`);
        } else {
          throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
        }
      }

      console.log(`✅ Documento cargado exitosamente: ${originalName}`);

      // Obtener el blob y determinar cómo manejarlo
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Determinar el tipo de archivo para decidir cómo manejarlo
      const fileExtension = originalName.toLowerCase().split('.').pop() || '';
      const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(fileExtension);
      const isPdf = fileExtension === 'pdf';
      const isText = ['txt', 'md', 'log', 'csv'].includes(fileExtension);
      const isCode = ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'].includes(fileExtension);
      const isDocument = ['docx', 'doc', 'odt', 'rtf'].includes(fileExtension);
      const isSpreadsheet = ['xlsx', 'xls', 'ods'].includes(fileExtension);
      const isPresentation = ['pptx', 'ppt', 'odp'].includes(fileExtension);
      
      console.log(`📁 Tipo de archivo detectado: ${fileExtension} (Imagen: ${isImage}, PDF: ${isPdf}, Texto: ${isText}, Código: ${isCode}, Documento: ${isDocument})`);
      
      // Estrategia de visualización basada en el tipo de archivo
      if (isImage || isPdf) {
        // Para imágenes y PDFs, abrir en nueva pestaña para visualización
        console.log(`🖼️ Abriendo ${isImage ? 'imagen' : 'PDF'} en nueva pestaña`);
        window.open(url, '_blank');
      } else if (isText || isCode) {
        // Para archivos de texto y código, mostrar contenido inline
        console.log(`📝 Mostrando archivo de texto/código inline`);
        try {
          const textContent = await blob.text();
          showTextPreview(originalName, textContent, fileExtension);
        } catch (error) {
          console.warn('No se pudo leer como texto, descargando...', error);
          downloadFile(url, originalName);
        }
      } else if (isDocument || isSpreadsheet || isPresentation) {
        // Para documentos de Office, intentar usar Google Docs Viewer
        console.log(`📊 Abriendo documento de Office con Google Docs Viewer`);
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + '/api/documents/file/' + documentId)}&embedded=true`;
        window.open(googleDocsUrl, '_blank');
      } else {
        // Para otros tipos, descargar directamente
        console.log(`📥 Descargando archivo de tipo desconocido`);
        downloadFile(url, originalName);
      }
      
      // Limpiar URL después de un tiempo
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);

    } catch (error: any) {
      console.error('❌ Error viewing document:', error);
      
      // Mostrar error más específico al usuario
      let errorMessage = 'Error al visualizar el documento';
      
      if (error.message.includes('Documento no encontrado')) {
        errorMessage = 'El documento no se encuentra en el servidor. Puede haber sido eliminado o movido.';
      } else if (error.message.includes('No tienes permisos')) {
        errorMessage = 'No tienes permisos para acceder a este documento.';
      } else if (error.message.includes('Error del servidor')) {
        errorMessage = 'Error en el servidor. Intenta nuevamente más tarde.';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      }
      
      setError(errorMessage);
    }
  };

  // Función auxiliar para descargar archivos
  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Función para mostrar previsualización de texto
  const showTextPreview = (filename: string, content: string, fileExtension: string) => {
    // Crear modal para mostrar el contenido del texto
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    // Determinar el lenguaje para syntax highlighting
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'html': 'html',
      'css': 'css',
      'json': 'json',
      'xml': 'xml',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'php': 'php',
      'md': 'markdown'
    };
    
    const language = languageMap[fileExtension] || 'text';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b bg-gray-50">
          <div class="flex items-center space-x-2">
            <span class="text-lg font-semibold">📄 ${filename}</span>
            <span class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">${fileExtension.toUpperCase()}</span>
          </div>
          <div class="flex space-x-2">
            <button class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" onclick="this.closest('.fixed').querySelector('.download-btn').click()">
              💾 Descargar
            </button>
            <button class="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600" onclick="this.closest('.fixed').remove()">
              ✕ Cerrar
            </button>
          </div>
        </div>
        <div class="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          <pre class="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto"><code class="language-${language}">${escapeHtml(content)}</code></pre>
        </div>
        <a href="#" class="download-btn hidden" download="${filename}"></a>
      </div>
    `;
    
    // Agregar estilos CSS para el modal
    const style = document.createElement('style');
    style.textContent = `
      .fixed { position: fixed !important; }
      .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
      .bg-black { background-color: rgba(0, 0, 0, 0.5); }
      .bg-opacity-50 { background-color: rgba(0, 0, 0, 0.5); }
      .flex { display: flex; }
      .items-center { align-items: center; }
      .justify-center { justify-content: center; }
      .z-50 { z-index: 50; }
      .bg-white { background-color: white; }
      .rounded-lg { border-radius: 0.5rem; }
      .shadow-xl { box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
      .max-w-4xl { max-width: 56rem; }
      .w-full { width: 100%; }
      .mx-4 { margin-left: 1rem; margin-right: 1rem; }
      .max-h-\\[90vh\\] { max-height: 90vh; }
      .overflow-hidden { overflow: hidden; }
      .p-4 { padding: 1rem; }
      .border-b { border-bottom-width: 1px; }
      .bg-gray-50 { background-color: #f9fafb; }
      .text-lg { font-size: 1.125rem; }
      .font-semibold { font-weight: 600; }
      .space-x-2 > * + * { margin-left: 0.5rem; }
      .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
      .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
      .text-xs { font-size: 0.75rem; }
      .bg-blue-100 { background-color: #dbeafe; }
      .text-blue-800 { color: #1e40af; }
      .rounded { border-radius: 0.25rem; }
      .space-x-2 > * + * { margin-left: 0.5rem; }
      .text-sm { font-size: 0.875rem; }
      .bg-blue-600 { background-color: #2563eb; }
      .text-white { color: white; }
      .hover\\:bg-blue-700:hover { background-color: #1d4ed8; }
      .bg-gray-500 { background-color: #6b7280; }
      .hover\\:bg-gray-600:hover { background-color: #4b5563; }
      .overflow-auto { overflow: auto; }
      .max-h-\\[calc\\(90vh-80px\\)\\] { max-height: calc(90vh - 80px); }
      .bg-gray-900 { background-color: #111827; }
      .text-green-400 { color: #4ade80; }
      .text-sm { font-size: 0.875rem; }
      .overflow-x-auto { overflow-x: auto; }
      .hidden { display: none; }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        modal.remove();
      }
    });
  };

  // Función para escapar HTML
  const escapeHtml = (text: string) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mensajes de éxito y error */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700 text-sm">{success}</p>
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Documentos</h1>
              <p className="mt-2 text-gray-600">
                Gestiona todos los documentos legales
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

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 col-span-full">Estadísticas de Documentos</h2>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Documentos</p>
                  <p className="text-2xl font-semibold text-gray-900">{typeof stats.total === 'number' && !isNaN(stats.total) ? stats.total : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Tamaño Total</p>
                  <p className="text-2xl font-semibold text-gray-900">{typeof stats.totalSize === 'number' && !isNaN(stats.totalSize) ? formatFileSize(stats.totalSize) : '-'}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">PDFs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(Array.isArray(stats.byType) ? stats.byType : []).filter(t => t.type.includes('pdf')).reduce((sum, t) => sum + t.count, 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Imágenes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {(Array.isArray(stats.byType) ? stats.byType : []).filter(t => t.type.includes('image')).reduce((sum, t) => sum + t.count, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas detalladas */}
        {stats && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Estadísticas por Tipo</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(Array.isArray(stats.byType) ? stats.byType : []).filter(t => t.type.includes('pdf')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">PDFs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {(Array.isArray(stats.byType) ? stats.byType : []).filter(t => t.type.includes('text')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">Documentos de Texto</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(Array.isArray(stats.byType) ? stats.byType : []).filter(t => t.type.includes('image')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">Imágenes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {(Array.isArray(stats.byType) ? stats.byType : []).filter(t => t.type.includes('word') || t.type.includes('document')).reduce((sum, t) => sum + t.count, 0)}
                </div>
                <div className="text-sm text-gray-600">Documentos Word</div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Filtros de Búsqueda</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <input
                type="text"
                placeholder="Buscar por nombre, expediente o descripción..."
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
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-900 p-6 border-b border-gray-200">Lista de Documentos</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expediente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tamaño
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subido Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(Array.isArray(filteredDocuments) ? filteredDocuments : []).map((doc) => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{getFileIcon(doc.mimeType)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {doc.originalName}
                          </div>
                          {doc.description && (
                            <div className="text-sm text-gray-500">
                              {doc.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/lawyer/cases/${doc.expedienteId}`}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        {doc.expediente?.title || 'Sin título'}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.expediente?.client?.user?.name || 'Cliente no disponible'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {doc.uploadedByUser?.name || 'Usuario no disponible'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument(doc.id, doc.originalName)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Visualizar
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron documentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar los filtros o subir nuevos documentos.
            </p>
          </div>
        )}
      </div>

      {/* Modal de subida */}
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
                  {expedientes.map(exp => (
                    <option key={exp.id} value={exp.id}>
                      {exp.title} - {exp.client.user.name}
                    </option>
                  ))}
                </select>
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
                  disabled={uploading || selectedFiles.length === 0 || !uploadForm.expedienteId}
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

export default DocumentsPage; 