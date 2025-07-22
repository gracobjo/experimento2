import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom'; // Añade este import

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'ABOGADO' | 'CLIENTE';
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (userData: { email: string; password: string; name: string; role: string }) => Promise<void>;
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
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await api.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Verifica la estructura del usuario
        if (response.data && response.data.role) {
          setUser(response.data);
        } else {
          throw new Error('Datos de usuario incompletos');
        }
      }
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      // Guarda TODOS los datos del usuario incluyendo el role
      setUser({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role // Asegúrate que esto viene del backend
      });
      
      // No redirigir aquí, dejar que el componente Login maneje la redirección
      // El componente Login ya tiene la lógica de redirección basada en el rol
    } catch (error: unknown) {
      throw new Error((error as any)?.response?.data?.message || 'Error en el inicio de sesión');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login'; // Redirige al login tras logout
  };

  const register = async (userData: { email: string; password: string; name: string; role: string }) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (error) {
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
    register: memoizedRegister
  }), [memoizedUser, loading, memoizedLogin, memoizedLogout, memoizedRegister]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 