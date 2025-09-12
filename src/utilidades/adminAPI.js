// src/utilidades/adminAPI.js

import axios from 'axios';
import authAPI from './authAPI'; // Para obtener el token

// URL base para las rutas de admin
const API_URL = 'http://localhost:5000/api/admin';

// Creamos una instancia de Axios para las peticiones de admin
const adminClient = axios.create({
  baseURL: API_URL,
});

// INTERCEPTOR: Se ejecuta ANTES de cada petición para añadir el token de autenticación
adminClient.interceptors.request.use(
  (config) => {
    const token = authAPI.getAuthToken(); // Obtenemos el token guardado
    if (token) {
      // Si existe, lo añadimos a los headers
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- API FUNCTIONS ---

const adminAPI = {
  /**
   * Obtiene la lista de todos los usuarios relevantes para el Super Admin
   * (Conductores, Gestores, etc.).
   */
  getUsers: async () => {
    try {
      // Apuntamos a la ruta que corregimos en el backend
      const response = await adminClient.get('/listarConductoresYPendientes'); 
      return response.data; // Esto devuelve el array de usuarios
    } catch (error) {
      console.error("Error en adminAPI.getUsers:", error);
      throw error.response?.data || error;
    }
  },

  /**
   * Elimina un usuario por su ID.
   * NOTA: Debes crear esta ruta en tu backend (ej: /users/:idUsuario).
   */
  deleteUser: async (idUsuario) => {
    if (!idUsuario) throw new Error("ID de usuario requerido para eliminar.");
    try {
      // Asegúrate que esta ruta exista en tu backend (ej: DELETE /api/admin/users/:id)
      const response = await adminClient.delete(`/users/${idUsuario}`); 
      return response.data;
    } catch (error) {
      console.error("Error en adminAPI.deleteUser:", error);
      throw error.response?.data || error;
    }
  },
  
  /**
   * Actualiza el rol de un usuario.
   * NOTA: Debes crear esta ruta en tu backend.
   */
  updateUserRole: async (idUsuario, nuevoRol) => {
    if (!idUsuario || !nuevoRol) throw new Error("ID de usuario y nuevo rol son requeridos.");
    try {
       // Asegúrate que esta ruta exista en tu backend (ej: PUT /api/admin/users/role)
      const response = await adminClient.put('/asignar-rol', { idUsuario, nuevoRol });
      return response.data;
    } catch (error) {
        console.error("Error en adminAPI.updateUserRole:", error);
        throw error.response?.data || error;
    }
  },

  // Puedes añadir más funciones aquí a medida que las necesites.
};

export default adminAPI;