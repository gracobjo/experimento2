import React, { useState } from 'react';

const DebugAuth = () => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');

  const handleSetToken = () => {
    if (token) {
      localStorage.setItem('token', token);
      setMessage('Token establecido correctamente. Recargando página...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setMessage('Por favor, ingresa un token válido');
    }
  };

  const handleClearToken = () => {
    localStorage.removeItem('token');
    setMessage('Token eliminado. Recargando página...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const currentToken = localStorage.getItem('token');

  return (
    <div className="fixed top-4 right-4 bg-white p-4 border rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="text-lg font-bold mb-2">Debug Auth</h3>
      
      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Token actual:</label>
        <div className="text-xs bg-gray-100 p-2 rounded break-all">
          {currentToken ? `${currentToken.substring(0, 50)}...` : 'No hay token'}
        </div>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium mb-1">Nuevo token:</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-2 border rounded text-xs"
          rows={3}
          placeholder="Pega el token aquí..."
        />
      </div>

      <div className="flex gap-2 mb-2">
        <button
          onClick={handleSetToken}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Establecer Token
        </button>
        <button
          onClick={handleClearToken}
          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Limpiar Token
        </button>
      </div>

      {message && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
          {message}
        </div>
      )}
    </div>
  );
};

export default DebugAuth; 