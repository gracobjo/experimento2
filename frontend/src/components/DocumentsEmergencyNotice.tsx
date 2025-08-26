import React, { useState, useEffect } from 'react';

interface DocumentsEmergencyNoticeProps {
  isVisible: boolean;
  onClose: () => void;
}

const DocumentsEmergencyNotice: React.FC<DocumentsEmergencyNoticeProps> = ({ isVisible, onClose }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-md z-50 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-2">🚨 Sistema de Documentos en Mantenimiento</h3>
          <p className="text-xs mb-2">
            Los documentos se pueden listar pero temporalmente no se pueden visualizar.
            Nuestro equipo técnico está trabajando en la solución.
          </p>
          
          {showDetails && (
            <div className="mt-3 text-xs bg-red-600 p-2 rounded">
              <p className="mb-1"><strong>Estado:</strong> Migración de base de datos en progreso</p>
              <p className="mb-1"><strong>Problema:</strong> Columna fileData no disponible</p>
              <p className="mb-1"><strong>Solución:</strong> En proceso de implementación</p>
              <p><strong>Tiempo estimado:</strong> 20-30 minutos</p>
            </div>
          )}
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-red-100 hover:text-white underline mt-2"
          >
            {showDetails ? 'Ocultar detalles' : 'Ver detalles técnicos'}
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-red-200 text-lg font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="mt-3 text-xs">
        <p className="text-red-100">
          <strong>Funcionalidades disponibles:</strong> ✅ Lista, ✅ Búsqueda, ✅ Filtros
        </p>
        <p className="text-red-100">
          <strong>Funcionalidades temporales:</strong> ❌ Visualización, ❌ Descarga
        </p>
      </div>
      
      <div className="mt-3 p-2 bg-red-600 rounded text-xs">
        <p className="font-bold">💡 Alternativas temporales:</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li>Usar la funcionalidad de casos que funciona correctamente</li>
          <li>Revisar metadatos de documentos en la lista</li>
          <li>Contactar al administrador si es urgente</li>
        </ul>
      </div>
    </div>
  );
};

export default DocumentsEmergencyNotice;
