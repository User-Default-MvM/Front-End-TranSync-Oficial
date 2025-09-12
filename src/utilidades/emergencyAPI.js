// api/emergencyAPI.js - Servicio específico para emergencias
export const emergencyAPI = {
  // Obtener emergencias
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      const response = await apiClient.get(`/emergencias${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Reportar emergencia
  report: async (emergencyData) => {
    try {
      const { tipo, descripcion, ubicacion, prioridad } = emergencyData;
      
      const missing = apiUtils.validateRequired({ tipo, descripcion });
      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      const validTypes = ['ACCIDENTE', 'AVERIA', 'MEDICA', 'SEGURIDAD', 'OTRO'];
      if (!validTypes.includes(tipo)) {
        throw new Error('Tipo de emergencia inválido');
      }

      const validPriorities = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA'];
      if (prioridad && !validPriorities.includes(prioridad)) {
        throw new Error('Prioridad inválida');
      }

      const response = await apiClient.post('/emergencias', {
        ...emergencyData,
        descripcion: descripcion.trim(),
        prioridad: prioridad || 'MEDIA'
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar estado de emergencia
  updateStatus: async (id, estado, notas = '') => {
    try {
      if (!id) throw new Error('ID de emergencia requerido');
      
      const validStatuses = ['PENDIENTE', 'EN_PROCESO', 'RESUELTA', 'CANCELADA'];
      if (!validStatuses.includes(estado)) {
        throw new Error('Estado inválido');
      }

      const response = await apiClient.patch(`/emergencias/${id}/estado`, { 
        estado,
        notas: notas.trim()
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener emergencias activas
  getActive: async () => {
    try {
      const response = await apiClient.get('/emergencias/activas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Asignar responsable a emergencia
  assignResponsible: async (id, idResponsable) => {
    try {
      if (!id || !idResponsable) {
        throw new Error('ID de emergencia e ID de responsable son requeridos');
      }

      const response = await apiClient.patch(`/emergencias/${id}/asignar`, {
        idResponsable
      });
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener estadísticas de emergencias
  getStatistics: async (dateRange = {}) => {
    try {
      const params = apiUtils.createUrlParams(dateRange);
      const response = await apiClient.get(`/emergencias/estadisticas${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Formatear datos de emergencia
  formatEmergencyData: (emergency) => {
    return {
      ...emergency,
      tipoFormateado: emergencyAPI.getTypeLabel(emergency.tipo),
      prioridadFormateada: emergencyAPI.getPriorityLabel(emergency.prioridad),
      estadoFormateado: emergencyAPI.getStatusLabel(emergency.estado),
      fechaFormateada: apiUtils.formatDate(emergency.fechaCreacion, 'DD/MM/YYYY HH:mm')
    };
  },

  // Obtener etiquetas
  getTypeLabel: (type) => {
    const labels = {
      'ACCIDENTE': 'Accidente',
      'AVERIA': 'Avería',
      'MEDICA': 'Médica',
      'SEGURIDAD': 'Seguridad',
      'OTRO': 'Otro'
    };
    return labels[type] || type;
  },

  getPriorityLabel: (priority) => {
    const labels = {
      'BAJA': 'Baja',
      'MEDIA': 'Media',
      'ALTA': 'Alta',
      'CRITICA': 'Crítica'
    };
    return labels[priority] || priority;
  },

  getStatusLabel: (status) => {
    const labels = {
      'PENDIENTE': 'Pendiente',
      'EN_PROCESO': 'En proceso',
      'RESUELTA': 'Resuelta',
      'CANCELADA': 'Cancelada'
    };
    return labels[status] || status;
  }
};