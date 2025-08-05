import React, { useState, useRef } from 'react';
import AccessibleModal from './ui/AccessibleModal';
import api from '../api/axios';

interface LawyerContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  lawyer: {
    id: string;
    name: string;
    email: string;
  };
  expedienteId: string;
  expedienteTitle: string;
}

const LawyerContactModal: React.FC<LawyerContactModalProps> = ({ 
  isOpen, 
  onClose, 
  lawyer, 
  expedienteId, 
  expedienteTitle 
}) => {
  const [formData, setFormData] = useState({
    asunto: '',
    mensaje: ''
  });
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // Validar tamaño de archivos (5MB máximo por archivo)
    const validFiles = selectedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo "${file.name}" excede el tamaño máximo de 5MB`);
        return false;
      }
      return true;
    });

    // Validar tipos de archivo permitidos
    const allowedTypes = ['text/plain', 'image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const typeValidFiles = validFiles.filter(file => {
      if (!allowedTypes.includes(file.type)) {
        alert(`El archivo "${file.name}" no es un tipo de archivo permitido. Solo se permiten: texto, imágenes y PDF`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...typeValidFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Crear FormData para enviar archivos
      const formDataToSend = new FormData();
      formDataToSend.append('asunto', formData.asunto);
      formDataToSend.append('mensaje', formData.mensaje);
      formDataToSend.append('lawyerId', lawyer.id);
      formDataToSend.append('expedienteId', expedienteId);
      formDataToSend.append('expedienteTitle', expedienteTitle);

      // Agregar archivos
      files.forEach((file, index) => {
        formDataToSend.append(`files`, file);
      });

      const response = await api.post('/contact/lawyer', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 || response.status === 201) {
        setSubmitStatus('success');
        setFormData({
          asunto: '',
          mensaje: ''
        });
        setFiles([]);
        
        // Cerrar el modal después de 2 segundos
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 2000);
      } else {
        throw new Error('Error en el servidor');
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType === 'text/plain') return '📝';
    return '📎';
  };

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Contactar Abogado"
      description={`Envíe un mensaje a ${lawyer.name} sobre el expediente "${expedienteTitle}"`}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Información del Abogado */}
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Información del Abogado
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {lawyer.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-blue-900">Abogado Asignado</h4>
                  <p className="text-sm text-blue-700 mt-1">{lawyer.name}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Email</h4>
                  <p className="text-sm text-gray-600 mt-1">{lawyer.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Expediente</h4>
                  <p className="text-sm text-gray-600 mt-1">{expedienteTitle}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {expedienteId}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Archivos */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Tipos de Archivos Permitidos
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-lg">📄</span>
                <span className="text-sm text-gray-700">Documentos PDF</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">🖼️</span>
                <span className="text-sm text-gray-700">Imágenes (JPG, PNG, GIF)</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-lg">📝</span>
                <span className="text-sm text-gray-700">Archivos de texto</span>
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Tamaño máximo:</strong> 5MB por archivo
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de Contacto */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Enviar Mensaje
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="asunto" className="block text-sm font-medium text-gray-700 mb-1">
                Asunto *
              </label>
              <select
                id="asunto"
                name="asunto"
                value={formData.asunto}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-describedby="asunto-help"
              >
                <option value="">Selecciona un asunto</option>
                <option value="Consulta sobre expediente">Consulta sobre expediente</option>
                <option value="Solicitud de información">Solicitud de información</option>
                <option value="Documentación adicional">Documentación adicional</option>
                <option value="Actualización de estado">Actualización de estado</option>
                <option value="Programación de cita">Programación de cita</option>
                <option value="Otro">Otro</option>
              </select>
              <div id="asunto-help" className="sr-only">
                Seleccione el tipo de asunto para su mensaje
              </div>
            </div>

            <div>
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1">
                Mensaje *
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Escriba su mensaje aquí..."
                aria-describedby="mensaje-help"
              />
              <div id="mensaje-help" className="sr-only">
                Escriba el contenido de su mensaje para el abogado
              </div>
            </div>

            {/* Subida de Archivos */}
            <div>
              <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-1">
                Adjuntar Archivos (opcional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center">
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".txt,.pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-describedby="file-upload-help"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Seleccionar archivos para adjuntar"
                >
                  Seleccionar Archivos
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <div id="file-upload-help" className="sr-only">
                  Seleccione archivos para adjuntar al mensaje. Tipos permitidos: PDF, imágenes y archivos de texto. Tamaño máximo: 5MB por archivo.
                </div>
              </div>
            </div>

            {/* Lista de archivos seleccionados */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Archivos seleccionados:</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getFileIcon(file.type)}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Eliminar archivo ${file.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {submitStatus === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md" role="alert" aria-live="polite">
                <p className="text-green-600 text-sm">
                  ¡Mensaje enviado con éxito! Su abogado se pondrá en contacto con usted pronto.
                </p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md" role="alert" aria-live="polite">
                <p className="text-red-600 text-sm">
                  Ha ocurrido un error al enviar su mensaje. Por favor, inténtelo de nuevo.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                aria-label="Cancelar envío de mensaje"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar mensaje al abogado"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AccessibleModal>
  );
};

export default LawyerContactModal; 