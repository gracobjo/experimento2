import React, { useState } from 'react';

interface DocumentViewerProps {
  documentId: string;
  originalName: string;
  onClose: () => void;
  isOpen: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  originalName,
  onClose,
  isOpen
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [contentType, setContentType] = useState<'text' | 'image' | 'pdf' | 'office' | null>(null);

  // Determinar el tipo de archivo
  const getFileType = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop() || '';
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['txt', 'md', 'log', 'csv', 'js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php'].includes(extension)) {
      return 'text';
    } else if (['docx', 'doc', 'odt', 'rtf', 'xlsx', 'xls', 'ods', 'pptx', 'ppt', 'odp'].includes(extension)) {
      return 'office';
    }
    return 'text'; // Por defecto
  };

  // Cargar documento cuando se abre
  React.useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token de autenticación');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://experimento2-production-54c0.up.railway.app'}/api/documents/file/${documentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();
      const fileType = getFileType(originalName);
      setContentType(fileType);

      if (fileType === 'text') {
        try {
          const textContent = await blob.text();
          setContent(textContent);
        } catch (e) {
          // Si no se puede leer como texto, crear URL para descarga
          const url = URL.createObjectURL(blob);
          setContent(url);
        }
      } else if (fileType === 'image') {
        const url = URL.createObjectURL(blob);
        setContent(url);
      } else if (fileType === 'pdf') {
        const url = URL.createObjectURL(blob);
        setContent(url);
      } else {
        // Para documentos de Office, crear URL para descarga
        const url = URL.createObjectURL(blob);
        setContent(url);
      }

    } catch (err: any) {
      setError(err.message || 'Error al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (content && contentType !== 'text') {
      const a = document.createElement('a');
      a.href = content;
      a.download = originalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getLanguageClass = (filename: string) => {
    const extension = filename.toLowerCase().split('.').pop() || '';
    const languageMap: { [key: string]: string } = {
      'js': 'language-javascript',
      'ts': 'language-typescript',
      'jsx': 'language-javascript',
      'tsx': 'language-typescript',
      'html': 'language-html',
      'css': 'language-css',
      'json': 'language-json',
      'xml': 'language-xml',
      'py': 'language-python',
      'java': 'language-java',
      'cpp': 'language-cpp',
      'c': 'language-c',
      'php': 'language-php',
      'md': 'language-markdown'
    };
    return languageMap[extension] || 'language-text';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold">📄 {originalName}</span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {originalName.split('.').pop()?.toUpperCase() || 'ARCHIVO'}
            </span>
          </div>
          <div className="flex space-x-2">
            {contentType !== 'text' && (
              <button
                onClick={handleDownload}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                💾 Descargar
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              ✕ Cerrar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-600 p-8">
              <div className="text-xl mb-2">❌ Error</div>
              <div>{error}</div>
            </div>
          )}

          {!loading && !error && content && (
            <div>
              {contentType === 'text' && (
                <pre className="bg-gray-900 text-green-400 p-4 rounded text-sm overflow-x-auto">
                  <code className={getLanguageClass(originalName)}>
                    {content}
                  </code>
                </pre>
              )}

              {contentType === 'image' && (
                <div className="text-center">
                  <img
                    src={content}
                    alt={originalName}
                    className="max-w-full max-h-[70vh] object-contain mx-auto"
                  />
                </div>
              )}

              {contentType === 'pdf' && (
                <div className="text-center">
                  <iframe
                    src={content}
                    width="100%"
                    height="600"
                    title={originalName}
                    className="border border-gray-300 rounded"
                  />
                </div>
              )}

              {contentType === 'office' && (
                <div className="text-center p-8">
                  <div className="text-gray-600 mb-4">
                    Este tipo de documento no se puede previsualizar directamente.
                  </div>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    📥 Descargar documento
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;



