// src/utilidades/adminAPI.js

import axios from 'axios';
import authAPI from './authAPI';

const API_URL = 'http://localhost:5000/api/admin';

const adminClient = axios.create({
  baseURL: API_URL,
});

adminClient.interceptors.request.use(
  (config) => {
    const token = authAPI.getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

const adminAPI = {
  /**
   * Obtiene la lista de usuarios.
   */
  getUsers: async () => {
    try {
      const response = await adminClient.get('/users'); 
      return response.data;
    } catch (error) {
      console.error("Error en adminAPI.getUsers:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Elimina un usuario por su ID.
   */
deleteUser: async (idUsuario) => {
    if (!idUsuario) throw new Error("ID de usuario requerido para eliminar.");
    try {
      const response = await adminClient.delete(`/users/${idUsuario}`); 
      return response.data;
    } catch (error) {
      console.error("Error en adminAPI.deleteUser:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * ¡FUNCIÓN QUE FALTABA!
   * Actualiza el rol de un usuario.
   */
  updateUserRole: async (idUsuario, nuevoRol) => {
    if (!idUsuario || !nuevoRol) throw new Error("ID y nuevo rol son requeridos.");
    try {
      const response = await adminClient.put(`/users/${idUsuario}/role`, { nuevoRol });
      return response.data;
    } catch (error) {
        console.error("Error en adminAPI.updateUserRole:", error);
        throw error.response?.data || error;
    }
  },
};

export default adminAPI;