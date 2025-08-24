import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import QuickActions from '../../components/QuickActions';
import LawyerContactModal from '../../components/LawyerContactModal';
import { getBackendUrl } from '../../config/endpoints';

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
    originalName: string;
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
        
        const response = await api.get(`/cases/${id}`);
        
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

  const handleViewDocument = async (documentId: string, originalName: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay token de autenticación. Por favor, inicia sesión de nuevo.');
        return;
      }

      console.log(`🔍 Intentando visualizar documento: ${documentId} - ${originalName}`);

      // Hacer petición autenticada al endpoint usando el ID del documento
      const response = await fetch(`${getBackendUrl()}/api/documents/file/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let errorMessage = `Error ${response.status}: ${response.statusText}`;
        
        // Intentar obtener más detalles del error
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
          if (errorData.errorDetails) {
            errorMessage += ` - ${errorData.errorDetails}`;
          }
        } catch (parseError) {
          // Si no se puede parsear el error, usar el mensaje básico
        }

        throw new Error(errorMessage);
      }

      console.log(`✅ Documento recibido correctamente, creando blob...`);

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
      
      // Estrategia de visualización basada en el tipo de archivo
      if (isImage || isPdf) {
        // Para imágenes y PDFs, abrir en nueva pestaña para visualización
        window.open(url, '_blank');
      } else if (isText || isCode) {
        // Para archivos de texto y código, mostrar contenido inline
        try {
          const textContent = await blob.text();
          showTextPreview(originalName, textContent, fileExtension);
        } catch (error) {
          console.warn('No se pudo leer como texto, descargando...', error);
          downloadFile(url, originalName);
        }
      } else if (isDocument || isSpreadsheet || isPresentation) {
        // Para documentos de Office, intentar usar Google Docs Viewer
        const googleDocsUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + '/api/documents/file/' + documentId)}&embedded=true`;
        window.open(googleDocsUrl, '_blank');
      } else {
        // Para otros tipos, descargar directamente
        downloadFile(url, originalName);
      }
      
      // Limpiar URL después de un tiempo
      setTimeout(() => window.URL.revokeObjectURL(url), 5000);

      console.log(`✅ Documento procesado exitosamente: ${originalName}`);

    } catch (error: any) {
      console.error('❌ Error viewing document:', error);
      
      let userMessage = 'Error al visualizar el documento';
      
      if (error.message) {
        if (error.message.includes('401')) {
          userMessage = 'No autorizado para ver este documento. Por favor, inicia sesión de nuevo.';
        } else if (error.message.includes('403')) {
          userMessage = 'No tienes permisos para ver este documento.';
        } else if (error.message.includes('404')) {
          userMessage = 'El documento no se encuentra en el servidor.';
        } else if (error.message.includes('500')) {
          userMessage = 'Error interno del servidor al procesar el documento.';
        } else {
          userMessage = error.message;
        }
      }
      
      alert(userMessage);
    }
  };

  // Función auxiliar para descargar archivos
  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
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
    <div className="min-h-screen bg-gray-50 mobile-scroll-container">
      <div className="container-responsive py-4 sm:py-6 lg:py-8">
        {/* Header Responsivo */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/client/cases')}
              className="self-start sm:self-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Volver a Expedientes"
              title="Volver a Expedientes"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="responsive-heading text-gray-900 break-words">{caseData.title}</h1>
              <p className="mt-1 responsive-text text-gray-600">
                Expediente creado el {formatDate(caseData.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-6 sm:mb-8">
          <QuickActions expedienteId={caseData.id} expedienteData={caseData} />
        </div>

        {/* Layout Responsivo - Stack en móvil, Grid en desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Información Principal - Ocupa todo el ancho en móvil */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Estado y Descripción */}
            <div className="responsive-card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                <h2 className="responsive-text font-semibold text-gray-900">Estado del Expediente</h2>
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(caseData.status)} self-start sm:self-center`}>
                  {getStatusText(caseData.status)}
                </span>
              </div>
              <div className="space-y-3">
                <p className="responsive-text text-gray-700">
                  {caseData.description || 'No hay descripción disponible para este expediente.'}
                </p>
                <p className="text-sm text-gray-600">
                  {caseData.status === 'ABIERTO' && 'Tu caso está siendo revisado por nuestro equipo legal.'}
                  {caseData.status === 'EN_PROCESO' && 'Tu caso está en proceso activo. Nuestro abogado está trabajando en él.'}
                  {caseData.status === 'CERRADO' && 'Tu caso ha sido completado y cerrado.'}
                </p>
              </div>
            </div>

            {/* Documentos */}
            <div className="responsive-card">
              <h2 className="responsive-text font-semibold text-gray-900 mb-4">Documentos del Caso</h2>
              
              {caseData.documents && Array.isArray(caseData.documents) && caseData.documents.length > 0 ? (
                <div className="space-y-3">
                  {caseData.documents.map((doc) => (
                    <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-200 rounded-md space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{doc.originalName || doc.filename}</p>
                          <p className="text-xs text-gray-500">
                            Subido el {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleViewDocument(doc.id, doc.originalName)}
                        className="responsive-button text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors self-start sm:self-center"
                        aria-label={`Ver documento ${doc.originalName}`}
                      >
                        Descargar
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No hay documentos disponibles aún.</p>
              )}
            </div>
          </div>

          {/* Sidebar - Stack en móvil */}
          <div className="space-y-4 sm:space-y-6">
            {/* Información del Abogado */}
            <div className="responsive-card">
              <h2 className="responsive-text font-semibold text-gray-900 mb-4">Abogado Asignado</h2>
              {caseData.lawyer ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{caseData.lawyer.name}</p>
                      <p className="text-sm text-gray-600 truncate">{caseData.lawyer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleContactLawyer}
                    className="w-full responsive-button bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Contactar Abogado
                  </button>
                </div>
              ) : (
                <p className="text-gray-500">No hay abogado asignado aún.</p>
              )}
            </div>

            {/* Información del Caso */}
            <div className="responsive-card">
              <h2 className="responsive-text font-semibold text-gray-900 mb-4">Información del Caso</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">ID del Expediente</p>
                  <p className="text-xs sm:text-sm text-gray-900 font-mono break-all">{caseData.id}</p>
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
          isOpen={showLawyerContact}
          lawyer={caseData.lawyer}
          expedienteId={caseData.id}
          expedienteTitle={caseData.title}
          onClose={() => setShowLawyerContact(false)}
        />
      )}
    </div>
  );
};

export default ClientCaseDetailPage; 