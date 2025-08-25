import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  isTokenValid, 
  getUserFromToken, 
  clearAuthData, 
  saveAuthData, 
  getValidToken,
  isAuthenticated,
  getAuthenticatedUser,
  UserData 
} from '../utils/authUtils';

interface User extends UserData {}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; password: string; name: string; role: string }) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  /* const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }; */

  /* const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
      throw new Error('Error en el inicio de sesión');
    }
  }; */

  const checkAuth = async () => {
    try {
      console.log('🔍 Verificando autenticación...');
      
      // Verificar si hay un token válido
      const token = getValidToken();
      if (!token) {
        console.log('🔑 No hay token válido');
        setLoading(false);
        return;
      }
      
      // Intentar obtener usuario del token primero
      const userFromToken = getUserFromToken(token);
      if (userFromToken) {
        console.log('🔑 Usuario obtenido del token:', userFromToken);
        setUser(userFromToken);
        setLoading(false);
        return;
      }
      
      // Si no se puede obtener del token, intentar con la API
      console.log('🔑 Verificando token con la API...');
      const response = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data && response.data.role) {
        const userData = {
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role
        };
        
        console.log('🔑 Usuario verificado por API:', userData);
        saveAuthData(token, userData);
        setUser(userData);
      } else {
        throw new Error('Datos de usuario incompletos');
      }
      
    } catch (error) {
      console.error('🔑 Error en checkAuth:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Iniciando sesión...');
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Verificar que el token sea válido
      if (!isTokenValid(token)) {
        throw new Error('Token inválido recibido del servidor');
      }
      
      // Crear objeto de usuario
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      
      console.log('🔑 Usuario autenticado:', userData);
      
      // Guardar datos de autenticación
      saveAuthData(token, userData);
      
      // Actualizar estado de React
      setUser(userData);
      
    } catch (error: unknown) {
      console.error('🔑 Error en login:', error);
      throw new Error((error as any)?.response?.data?.message || 'Error en el inicio de sesión');
    }
  };

  const logout = () => {
    console.log('🔑 Cerrando sesión...');
    clearAuthData();
    setUser(null);
    window.location.href = '/login';
  };

  const refreshAuth = async () => {
    try {
      console.log('🔑 Refrescando autenticación...');
      await checkAuth();
    } catch (error) {
      console.error('🔑 Error refrescando autenticación:', error);
      logout();
    }
  };

  const register = async (userData: { email: string; password: string; name: string; role: string }) => {
    try {
      console.log('🔑 Registrando usuario...');
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      // Verificar que el token sea válido
      if (!isTokenValid(token)) {
        throw new Error('Token inválido recibido del servidor');
      }
      
      // Crear objeto de usuario
      const userDataObj = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      };
      
      console.log('🔑 Usuario registrado:', userDataObj);
      
      // Guardar datos de autenticación
      saveAuthData(token, userDataObj);
      
      // Actualizar estado de React
      setUser(userDataObj);
      
    } catch (error) {
      console.error('🔑 Error en registro:', error);
      throw new Error('Error en el registro');
    }
  };

  // Memoizar el objeto user para evitar recreaciones innecesarias
  const memoizedUser = useMemo(() => user, [user?.id, user?.email, user?.name, user?.role]);

  // Memoizar las funciones para evitar recreaciones
  const memoizedLogin = useCallback(login, []);
  const memoizedLogout = useCallback(logout, []);
  const memoizedRegister = useCallback(register, []);

  const value = useMemo(() => ({
    user: memoizedUser,
    loading,
    login: memoizedLogin,
    logout: memoizedLogout,
    register: memoizedRegister,
    refreshAuth
  }), [memoizedUser, loading, memoizedLogin, memoizedLogout, memoizedRegister, refreshAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 