// src/utilidades/driversAPI.js

import { apiClient, apiUtils } from '../api/baseAPI';

const driversAPI = {
  /**
   * Obtiene la lista de todos los conductores. Acepta un objeto de filtros.
   * getAll({ estConductor: 'ACTIVO' }) -> GET /api/conductores?estConductor=ACTIVO
   */
  getAll: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters).toString();
      // Asegúrate de que la ruta base en apiClient sea correcta (ej: http://localhost:5000)
      const response = await apiClient.get(`/api/conductores?${params}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Crea un nuevo conductor.
   * POST /api/conductores
   */
  create: async (driverData) => {
    try {
      const response = await apiClient.post('/api/conductores', driverData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Actualiza un conductor existente por su ID.
   * PUT /api/conductores/:idConductor
   */
  update: async (idConductor, driverData) => {
    try {
      if (!idConductor) throw new Error('El ID del conductor es requerido para actualizar.');
      const response = await apiClient.put(`/api/conductores/${idConductor}`, driverData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  /**
   * Elimina un conductor por su ID.
   * DELETE /api/conductores/:idConductor
   */
  delete: async (idConductor) => {
    try {
      if (!idConductor) throw new Error('El ID del conductor es requerido para eliminar.');
      const response = await apiClient.delete(`/api/conductores/${idConductor}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },
};

export default driversAPI;