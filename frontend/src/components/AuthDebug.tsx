import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  isTokenValid, 
  getUserFromToken, 
  isAuthenticated, 
  getAuthenticatedUser,
  isTokenExpiringSoon 
} from '../utils/authUtils';

const AuthDebug: React.FC = () => {
  const { user, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      const info = {
        timestamp: new Date().toISOString(),
        localStorage: {
          token: token ? 'Presente' : 'Ausente',
          user: savedUser ? 'Presente' : 'Ausente',
          tokenLength: token ? token.length : 0
        },
        authUtils: {
          isAuthenticated: isAuthenticated(),
          authenticatedUser: getAuthenticatedUser(),
        },
        context: {
          user: user,
          loading: loading
        }
      };

      if (token) {
        try {
          const decoded = getUserFromToken(token);
          info.tokenDetails = {
            valid: isTokenValid(token),
            expiringSoon: isTokenExpiringSoon(token),
            userFromToken: decoded,
            rawToken: token.substring(0, 50) + '...'
          };
        } catch (error) {
          info.tokenDetails = {
            error: error.message
          };
        }
      }

      setDebugInfo(info);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [user, loading]);

  if (process.env.NODE_ENV === 'production') {
    return null; // No mostrar en producción
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md z-50">
      <h3 className="text-sm font-bold mb-2">🔍 Debug de Autenticación</h3>
      
      <div className="text-xs space-y-1">
        <div>
          <strong>Timestamp:</strong> {debugInfo.timestamp}
        </div>
        
        <div>
          <strong>localStorage:</strong>
          <div className="ml-2">
            <div>Token: {debugInfo.localStorage?.token}</div>
            <div>User: {debugInfo.localStorage?.user}</div>
            <div>Token Length: {debugInfo.localStorage?.tokenLength}</div>
          </div>
        </div>
        
        <div>
          <strong>Auth Utils:</strong>
          <div className="ml-2">
            <div>Is Authenticated: {debugInfo.authUtils?.isAuthenticated ? '✅' : '❌'}</div>
            <div>User ID: {debugInfo.authUtils?.authenticatedUser?.id || 'N/A'}</div>
          </div>
        </div>
        
        <div>
          <strong>Context:</strong>
          <div className="ml-2">
            <div>User: {debugInfo.context?.user ? '✅' : '❌'}</div>
            <div>Loading: {debugInfo.context?.loading ? '⏳' : '✅'}</div>
          </div>
        </div>
        
        {debugInfo.tokenDetails && (
          <div>
            <strong>Token Details:</strong>
            <div className="ml-2">
              <div>Valid: {debugInfo.tokenDetails.valid ? '✅' : '❌'}</div>
              <div>Expiring Soon: {debugInfo.tokenDetails.expiringSoon ? '⚠️' : '✅'}</div>
              <div>User ID: {debugInfo.tokenDetails.userFromToken?.id || 'N/A'}</div>
              <div>Role: {debugInfo.tokenDetails.userFromToken?.role || 'N/A'}</div>
            </div>
          </div>
        )}
      </div>
      
      <button 
        onClick={() => setDebugInfo({})}
        className="mt-2 text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
      >
        Limpiar
      </button>
    </div>
  );
};

export default AuthDebug;
