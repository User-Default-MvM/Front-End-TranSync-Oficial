// api/authAPI.js - Servicio de autenticación integrado
import axios from "axios";
import { apiUtils } from '../api/baseAPI';

// URL base para auth (puede ser diferente del base general)
const AUTH_API_URL = "http://localhost:5000/api/auth";

const authClient = axios.create({
  baseURL: AUTH_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para manejo de errores específicos de auth
authClient.interceptors.response.use(
  (response) => {
    // Logging en desarrollo
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Auth Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Logging del error para depuración
    console.error('❌ Auth Service Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Formatear el error para el frontend
    const formattedError = {
      message: error.response?.data?.message || error.message || "Error desconocido",
      status: error.response?.status,
      code: error.code,
      response: error.response
    };

    return Promise.reject(formattedError);
  }
);

const authAPI = {
  // ================================
  // AUTENTICACIÓN BÁSICA
  // ================================

  // Registro de usuario
  // REEMPLAZA LA FUNCIÓN VIEJA CON ESTA:

  // Registro de usuario
  register: async (userData) => {
    try {
      // 1. Validación simple para asegurar que recibimos los datos
      if (!userData) {
        throw new Error("No se proporcionaron datos para el registro.");
      }

      // 2. Enviar el objeto userData COMPLETO al backend
      const response = await authClient.post('/register', userData);

      // 3. Devolver la respuesta del backend
      return response.data;

    } catch (error) {
      // Re-lanzar el error para que sea manejado por el interceptor
      // o por el componente que llamó a la función.
      throw error;
    }
  },
  // Login de usuario
  login: async (credentials, password) => {
    try {
      // Permitir tanto formato de objeto como parámetros separados
      let email, finalPassword;

      if (typeof credentials === 'object') {
        ({ email, password: finalPassword } = credentials);
      } else {
        // Compatibilidad con authService.js (email, password como parámetros)
        email = credentials;
        finalPassword = password;
      }

      // Validaciones
      if (!email || !finalPassword) {
        throw new Error("Email y contraseña son requeridos");
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      const response = await authClient.post('/login', {
        email: email.trim().toLowerCase(),
        password: finalPassword
      });

      // Guardar datos de autenticación automáticamente
      if (response.data.token) {
        authAPI.saveAuthData(response.data);
      }

      return response.data;
    } catch (error) {
      // Manejo específico de errores de login
      if (error.status === 401 || error.response?.status === 401) {
        throw new Error('Credenciales incorrectas. Verifique su email y contraseña.');
      } else if (error.status === 403 || error.response?.status === 403) {
        throw new Error('Su cuenta no está activada. Por favor verifique su correo electrónico.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error("La solicitud tardó demasiado. Verifique su conexión e intente nuevamente.");
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error("No se puede conectar con el servidor. Verifique que el servidor esté ejecutándose.");
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // Verificar cuenta
  verifyAccount: async (token) => {
    try {
      if (!token) {
        throw new Error('Token de verificación requerido');
      }

      const response = await authClient.get(`/verify?token=${token}`);
      return response.data;
    } catch (error) {
      if (error.status === 400 || error.response?.status === 400) {
        throw new Error('Token de verificación inválido o expirado.');
      } else if (error.status === 404 || error.response?.status === 404) {
        throw new Error('Usuario no encontrado o ya verificado.');
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // RECUPERACIÓN DE CONTRASEÑA
  // ================================

  // Olvido de contraseña
  forgotPassword: async (email) => {
    try {
      if (!email) {
        throw new Error('Email es requerido');
      }

      if (!apiUtils.isValidEmail(email)) {
        throw new Error('Por favor ingrese un correo electrónico válido');
      }

      const response = await authClient.post('/forgot-password', {
        email: email.trim().toLowerCase()
      });
      return response.data;
    } catch (error) {
      if (error.status === 404 || error.response?.status === 404) {
        throw new Error('El correo electrónico no está registrado.');
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    try {
      if (!token || !newPassword) {
        throw new Error('Token y nueva contraseña son requeridos');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      const response = await authClient.post(`/reset-password?token=${token}`, {
        newPassword
      });
      return response.data;
    } catch (error) {
      if (error.status === 400 || error.response?.status === 400) {
        throw new Error('Token de restablecimiento inválido o expirado.');
      } else if (error.status === 404 || error.response?.status === 404) {
        throw new Error('Usuario no encontrado.');
      }

      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE SESIÓN
  // ================================

  // Logout
  logout: async () => {
    try {
      // Intentar logout en el servidor (opcional)
      try {
        await authClient.post('/logout');
      } catch (error) {
        console.warn('Error en logout del servidor:', error);
      }

      // Limpiar datos locales
      authAPI.clearAuthData();

      return { success: true, message: 'Sesión cerrada exitosamente' };
    } catch (error) {
      console.error('Error en logout:', error);
      // Limpiar de todas formas
      authAPI.clearAuthData();
      return { success: false, message: 'Error al cerrar sesión, pero se limpió localmente' };
    }
  },

  // ================================
  // GESTIÓN DE PERFIL
  // ================================

  // Actualizar perfil de usuario
  updateProfile: async (profileData) => {
    try {
      const { name, email } = profileData;

      if (email && !apiUtils.isValidEmail(email)) {
        throw new Error('Formato de email inválido');
      }

      const response = await authClient.put('/profile', {
        name: name?.trim(),
        email: email?.trim().toLowerCase()
      });

      // Actualizar datos en localStorage
      if (response.data.user) {
        const currentData = authAPI.getCurrentUser() || {};
        const updatedUser = { ...currentData, ...response.data.user };

        localStorage.setItem('userData', JSON.stringify(updatedUser));
        localStorage.setItem('userName', updatedUser.name || '');
        localStorage.setItem('userEmail', updatedUser.email || '');
      }

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Cambiar contraseña
  changePassword: async (passwordData) => {
    try {
      const { currentPassword, newPassword, confirmPassword } = passwordData;

      const missing = apiUtils.validateRequired({ currentPassword, newPassword, confirmPassword });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (newPassword.length < 6) {
        throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
      }

      const response = await authClient.put('/change-password', {
        currentPassword,
        newPassword
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES DE AUTENTICACIÓN
  // ================================

  // Verificar si está autenticado
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('userToken');
      const isAuth = localStorage.getItem('isAuthenticated');
      return !!(token && isAuth === 'true');
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Obtener datos del usuario actual
  getCurrentUser: () => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        return JSON.parse(userData);
      }

      // Fallback con datos separados
      const userName = localStorage.getItem('userName');
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      const userId = localStorage.getItem('userId');

      if (userName || userRole || userEmail || userId) {
        return {
          id: userId,
          name: userName,
          email: userEmail,
          role: userRole
        };
      }

      return null;
    } catch (error) {
      console.error('Error parseando userData:', error);
      return null;
    }
  },

  // Obtener rol del usuario
  getUserRole: () => {
    try {
      return localStorage.getItem('userRole') || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },

  // Verificar si el usuario tiene un rol específico
  hasRole: (role) => {
    const userRole = authAPI.getUserRole();
    return userRole === role;
  },

  // Verificar si es superadmin
  isSuperAdmin: () => {
    return authAPI.hasRole('SUPERADMIN');
  },

  // Verificar si es administrador
  isAdmin: () => {
    return authAPI.hasRole('ADMINISTRADOR');
  },

  // ================================
  // MANEJO DE DATOS LOCALES
  // ================================

  // Guardar datos de autenticación
  saveAuthData: (authData) => {
    try {
      if (authData.token) {
        localStorage.setItem('authToken', authData.token);
        localStorage.setItem('userToken', authData.token); // Por compatibilidad
        localStorage.setItem('isAuthenticated', 'true');

        if (authData.user) {
          localStorage.setItem('userData', JSON.stringify(authData.user));
          localStorage.setItem('userName', authData.user.name || '');
          localStorage.setItem('userRole', authData.user.role || '');
          localStorage.setItem('userEmail', authData.user.email || '');
          localStorage.setItem('userId', authData.user.id || '');
        }
      }
    } catch (error) {
      console.error('Error guardando datos de auth:', error);
    }
  },

  // Limpiar datos de autenticación
  clearAuthData: () => {
    try {
      const keysToRemove = [
        'authToken', 'userToken', 'userData', 'isAuthenticated',
        'userName', 'userRole', 'userEmail', 'userId', 'rememberedEmail'
      ];

      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('rememberMe', 'false');

      return true;
    } catch (error) {
      console.error('Error en clearAuthData:', error);
      // Limpiar de todas formas
      localStorage.clear();
      return false;
    }
  },

  // Obtener token de autorización
  getAuthToken: () => {
    return localStorage.getItem('authToken') || localStorage.getItem('userToken');
  },

  // ================================
  // VERIFICACIÓN DE SALUD
  // ================================

  // Verificar la salud de la conexión con el servidor de auth
  checkServerHealth: async () => {
    try {
      const startTime = Date.now();

      // Intentar tanto el endpoint de health específico como uno general
      let response;
      try {
        response = await authClient.get('/health', { timeout: 5000 });
      } catch (error) {
        // Fallback a health check general
        response = await fetch("http://localhost:5000/api/health", {
          method: "GET",
          signal: AbortSignal.timeout(5000)
        });

        if (!response.ok) {
          throw new Error('Server health check failed');
        }

        response = {
          status: response.status,
          data: { status: 'OK', message: 'Servidor conectado' }
        };
      }

      const responseTime = Date.now() - startTime;

      if (response.status === 200) {
        return {
          status: 'OK',
          message: 'Servidor de autenticación conectado',
          responseTime,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 'WARNING',
          message: 'Servidor de autenticación responde pero con problemas',
          responseTime,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        status: 'ERROR',
        message: 'No se puede conectar con el servidor de autenticación',
        error: apiUtils.formatError(error),
        timestamp: new Date().toISOString(),
        responseTime: null
      };
    }
  }
};

// Exportaciones compatibles con ambos sistemas
export default authAPI;

// Exportaciones individuales para compatibilidad con authService.js
export const {
  register,
  login,
  verifyAccount,
  forgotPassword,
  resetPassword,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserRole,
  hasRole,
  isSuperAdmin,
  isAdmin,
  checkServerHealth
} = authAPI;