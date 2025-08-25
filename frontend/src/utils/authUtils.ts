import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  email: string;
  sub: string;
  role: 'ADMIN' | 'ABOGADO' | 'CLIENTE';
  iat: number;
  exp: number;
}

export interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Verifica si un token JWT es válido y no ha expirado
 */
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Verificar que el token no haya expirado
    if (decoded.exp < currentTime) {
      console.log('🔑 Token expirado:', new Date(decoded.exp * 1000).toLocaleString());
      return false;
    }
    
    // Verificar que tenga los campos necesarios
    if (!decoded.sub || !decoded.role || !decoded.email) {
      console.log('🔑 Token inválido: campos faltantes');
      return false;
    }
    
    console.log('🔑 Token válido, expira:', new Date(decoded.exp * 1000).toLocaleString());
    return true;
  } catch (error) {
    console.error('🔑 Error decodificando token:', error);
    return false;
  }
};

/**
 * Obtiene información del usuario desde el token JWT
 */
export const getUserFromToken = (token: string): UserData | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.email.split('@')[0], // Fallback al nombre
      role: decoded.role
    };
  } catch (error) {
    console.error('🔑 Error obteniendo usuario del token:', error);
    return null;
  }
};

/**
 * Verifica si el token está próximo a expirar (menos de 5 minutos)
 */
export const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    const fiveMinutes = 5 * 60; // 5 minutos en segundos
    
    return (decoded.exp - currentTime) < fiveMinutes;
  } catch (error) {
    return true; // Si hay error, considerar que expira pronto
  }
};

/**
 * Limpia todos los datos de autenticación del localStorage
 */
export const clearAuthData = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('refreshToken');
};

/**
 * Guarda los datos de autenticación en localStorage
 */
export const saveAuthData = (token: string, user: UserData, refreshToken?: string): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

/**
 * Obtiene el token del localStorage si es válido
 */
export const getValidToken = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  if (isTokenValid(token)) {
    return token;
  } else {
    console.log('🔑 Token inválido, limpiando datos de autenticación');
    clearAuthData();
    return null;
  }
};

/**
 * Verifica si el usuario está autenticado y tiene un token válido
 */
export const isAuthenticated = (): boolean => {
  const token = getValidToken();
  const user = localStorage.getItem('user');
  
  return !!(token && user);
};

/**
 * Obtiene el usuario autenticado si existe y es válido
 */
export const getAuthenticatedUser = (): UserData | null => {
  if (!isAuthenticated()) return null;
  
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('🔑 Error obteniendo usuario autenticado:', error);
    clearAuthData();
    return null;
  }
};
