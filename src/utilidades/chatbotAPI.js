// src/utilidades/chatbotAPI.js - Rutas corregidas para compatibilidad
import { apiClient, apiUtils } from '../api/baseAPI';

/**
 * API para el servicio de ChatBot con datos reales
 */
const chatbotAPI = {
  /**
   * Enviar consulta al chatbot y recibir respuesta inteligente
   */
  enviarConsulta: async (mensaje, idEmpresa = null, idUsuario = null) => {
    try {
      if (!mensaje || mensaje.trim() === '') {
        throw new Error('El mensaje no puede estar vacío');
      }

      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const empresaId = idEmpresa || userData.idEmpresa || 1;
      const usuarioId = idUsuario || userData.idUsuario || null;

      // Usar ruta completa con /api/ para compatibilidad con adminAPI
      const response = await apiClient.post('/api/chatbot/consulta', {
        mensaje: mensaje.trim(),
        idEmpresa: empresaId,
        idUsuario: usuarioId
      });

      return {
        success: true,
        respuesta: response.data.respuesta,
        intencion: response.data.intencion,
        timestamp: response.data.timestamp,
        error: null
      };

    } catch (error) {
      console.error('Error enviando consulta al chatbot:', error);
      
      let mensajeError = 'Lo siento, no pude procesar tu consulta en este momento.';
      
      if (error.response?.data?.respuesta) {
        mensajeError = error.response.data.respuesta;
      } else if (error.response?.status === 401) {
        mensajeError = 'Sesión expirada. Por favor inicia sesión nuevamente.';
      } else if (error.response?.status === 500) {
        mensajeError = 'Error del servidor. Por favor intenta más tarde.';
      } else if (!navigator.onLine) {
        mensajeError = 'Sin conexión a internet. Verifica tu conexión.';
      }

      return {
        success: false,
        respuesta: mensajeError,
        intencion: 'error',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  },

  /**
   * Obtener estadísticas de uso del chatbot
   */
  obtenerEstadisticas: async (dias = 30) => {
    try {
      // Usar ruta completa con /api/
      const response = await apiClient.get('/api/chatbot/estadisticas', {
        params: { dias }
      });

      return {
        success: true,
        data: response.data.estadisticas || [],
        periodo: response.data.periodo,
        error: null
      };

    } catch (error) {
      console.error('Error obteniendo estadísticas del chatbot:', error);
      
      return {
        success: false,
        data: [],
        error: apiUtils.formatError(error)
      };
    }
  },

  /**
   * Verificar el estado del servicio de chatbot
   */
  verificarEstado: async () => {
    try {
      // Usar ruta completa con /api/
      const response = await apiClient.get('/api/chatbot/health');
      
      return {
        success: true,
        estado: response.data.status,
        servicio: response.data.service,
        version: response.data.version,
        timestamp: response.data.timestamp,
        error: null
      };

    } catch (error) {
      console.error('Error verificando estado del chatbot:', error);
      
      return {
        success: false,
        estado: 'ERROR',
        error: apiUtils.formatError(error)
      };
    }
  },

  /**
   * Obtener sugerencias de consultas predefinidas
   */
  obtenerSugerencias: () => {
    return [
      {
        texto: '¿Cuántos conductores están activos?',
        categoria: 'conductores',
        icono: '👨‍💼'
      },
      {
        texto: '¿Qué vehículos están disponibles?',
        categoria: 'vehiculos',
        icono: '🚗'
      },
      {
        texto: 'Muestra el estado general del sistema',
        categoria: 'estado',
        icono: '📊'
      },
      {
        texto: '¿Hay documentos próximos a vencer?',
        categoria: 'vencimientos',
        icono: '⚠️'
      },
      {
        texto: '¿Qué rutas tenemos registradas?',
        categoria: 'rutas',
        icono: '🗺'
      },
      {
        texto: '¿Cuántos viajes hay programados?',
        categoria: 'horarios',
        icono: '⏰'
      },
      {
        texto: 'Necesito ayuda con el sistema',
        categoria: 'ayuda',
        icono: '❓'
      },
      {
        texto: 'Genera un reporte de la flota',
        categoria: 'reportes',
        icono: '📋'
      }
    ];
  },

  /**
   * Formatear mensaje para mejorar la experiencia del usuario
   */
  formatearMensaje: (mensaje) => {
    if (!mensaje) return '';
    
    return mensaje
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/• /g, '• ')
      .replace(/\n/g, '<br>');
  },

  /**
   * Validar mensaje antes de enviarlo
   */
  validarMensaje: (mensaje) => {
    if (!mensaje || mensaje.trim() === '') {
      return {
        esValido: false,
        error: 'El mensaje no puede estar vacío'
      };
    }

    if (mensaje.length > 1000) {
      return {
        esValido: false,
        error: 'El mensaje es demasiado largo (máximo 1000 caracteres)'
      };
    }

    const caracteresProhibidos = ['<script', 'onload=', 'onerror='];
    const tieneCaracteresProhibidos = caracteresProhibidos.some(char => 
      mensaje.toLowerCase().includes(char)
    );

    if (tieneCaracteresProhibidos) {
      return {
        esValido: false,
        error: 'El mensaje contiene caracteres no permitidos'
      };
    }

    return {
      esValido: true,
      error: null
    };
  },

  /**
   * Obtener contexto del usuario para personalizar respuestas
   */
  obtenerContextoUsuario: () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const authToken = localStorage.getItem('authToken');
      
      return {
        esUsuarioAutenticado: !!authToken,
        nombreUsuario: userData.nombre || 'Usuario',
        rol: userData.rol || 'CONDUCTOR',
        empresa: userData.nombreEmpresa || 'TransSync',
        idEmpresa: userData.idEmpresa || 1,
        idUsuario: userData.idUsuario || null
      };
    } catch (error) {
      console.error('Error obteniendo contexto del usuario:', error);
      return {
        esUsuarioAutenticado: false,
        nombreUsuario: 'Usuario',
        rol: 'CONDUCTOR',
        empresa: 'TransSync',
        idEmpresa: 1,
        idUsuario: null
      };
    }
  }
};

export default chatbotAPI;