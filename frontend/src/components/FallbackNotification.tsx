import React from 'react';

interface FallbackNotificationProps {
  isVisible: boolean;
  onClose: () => void;
}

const FallbackNotification: React.FC<FallbackNotificationProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg max-w-md z-50 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-bold mb-2">⚠️ Modo de Emergencia</h3>
          <p className="text-xs mb-2">
            El sistema principal de casos no está disponible temporalmente. 
            Se están mostrando datos desde un endpoint alternativo.
          </p>
          <p className="text-xs text-yellow-100">
            Algunas funcionalidades pueden estar limitadas.
          </p>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-white hover:text-yellow-200 text-lg font-bold"
        >
          ×
        </button>
      </div>
      
      <div className="mt-3 text-xs">
        <p className="text-yellow-100">
          <strong>Estado:</strong> Conectado a base de datos
        </p>
        <p className="text-yellow-100">
          <strong>Endpoint:</strong> Debug/Stats
        </p>
      </div>
    </div>
  );
};

export default FallbackNotification;
