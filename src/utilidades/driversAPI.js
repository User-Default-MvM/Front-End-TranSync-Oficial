// api/driversAPI.js - Servicio específico para conductores
import { apiClient, apiUtils } from '../api/baseAPI';

const driversAPI = {
  // ================================
  // GESTIÓN BÁSICA DE CONDUCTORES
  // ================================
  
  // Obtener conductores con filtros
  getAll: async (filters = {}) => {
    try {
      const params = apiUtils.createUrlParams(filters);
      // Corregido: usar /api/conductores en lugar de /conductores
      const response = await apiClient.get(`/api/conductores${params ? `?${params}` : ''}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener conductor por ID
  getById: async (id) => {
    try {
      if (!id) throw new Error('ID de conductor requerido');
      const response = await apiClient.get(`/api/conductores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Crear nuevo conductor
  create: async (driverData) => {
    try {
      // Validaciones específicas para conductores
      const { 
        nomConductor, 
        apeConductor, 
        numDocConductor, 
        tipLicConductor, 
        fecVenLicConductor,
        telConductor,
        idEmpresa 
      } = driverData;

      const missing = apiUtils.validateRequired({ 
        nomConductor, 
        apeConductor, 
        numDocConductor, 
        tipLicConductor, 
        fecVenLicConductor 
      });

      if (missing.length > 0) {
        throw new Error(`Campos requeridos: ${missing.join(', ')}`);
      }

      // Validar tipo de licencia
      const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
      if (!validLicenses.includes(tipLicConductor)) {
        throw new Error('Tipo de licencia inválido. Debe ser: ' + validLicenses.join(', '));
      }

      // Validar fecha de vencimiento
      const fechaVencimiento = new Date(fecVenLicConductor);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normalizar para comparar solo fechas
      
      if (fechaVencimiento <= hoy) {
        throw new Error('La fecha de vencimiento de la licencia debe ser futura');
      }

      // Validar número de documento
      if (numDocConductor.length < 6) {
        throw new Error('El número de documento debe tener al menos 6 caracteres');
      }

      // Validar teléfono si se proporciona
      if (telConductor && telConductor.length < 7) {
        throw new Error('El número de teléfono debe tener al menos 7 dígitos');
      }

      const response = await apiClient.post('/api/conductores', {
        ...driverData,
        nomConductor: nomConductor.trim(),
        apeConductor: apeConductor.trim(),
        numDocConductor: numDocConductor.trim(),
        telConductor: telConductor?.trim(),
        idEmpresa: idEmpresa || 1 // Empresa por defecto si no se especifica
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Actualizar conductor
  update: async (id, driverData) => {
    try {
      if (!id) throw new Error('ID de conductor requerido');

      // Validar datos si se proporcionan
      if (driverData.tipLicConductor) {
        const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
        if (!validLicenses.includes(driverData.tipLicConductor)) {
          throw new Error('Tipo de licencia inválido. Debe ser: ' + validLicenses.join(', '));
        }
      }

      if (driverData.fecVenLicConductor) {
        const fechaVencimiento = new Date(driverData.fecVenLicConductor);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaVencimiento <= hoy) {
          throw new Error('La fecha de vencimiento de la licencia debe ser futura');
        }
      }

      if (driverData.numDocConductor && driverData.numDocConductor.length < 6) {
        throw new Error('El número de documento debe tener al menos 6 caracteres');
      }

      if (driverData.telConductor && driverData.telConductor.length < 7) {
        throw new Error('El número de teléfono debe tener al menos 7 dígitos');
      }

      // Limpiar campos de texto si existen
      const cleanedData = { ...driverData };
      if (cleanedData.nomConductor) cleanedData.nomConductor = cleanedData.nomConductor.trim();
      if (cleanedData.apeConductor) cleanedData.apeConductor = cleanedData.apeConductor.trim();
      if (cleanedData.numDocConductor) cleanedData.numDocConductor = cleanedData.numDocConductor.trim();
      if (cleanedData.telConductor) cleanedData.telConductor = cleanedData.telConductor.trim();

      const response = await apiClient.put(`/api/conductores/${id}`, cleanedData);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Eliminar conductor
  delete: async (id) => {
    try {
      if (!id) throw new Error('ID de conductor requerido');
      const response = await apiClient.delete(`/api/conductores/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE ESTADOS
  // ================================
  
  // Cambiar estado de conductor
  changeStatus: async (id, nuevoEstado) => {
    try {
      if (!id || !nuevoEstado) {
        throw new Error('ID de conductor y nuevo estado son requeridos');
      }

      const validStates = ['ACTIVO', 'INACTIVO', 'DIA_DESCANSO', 'INCAPACITADO', 'DE_VACACIONES'];
      if (!validStates.includes(nuevoEstado)) {
        throw new Error('Estado inválido. Estados válidos: ' + validStates.join(', '));
      }

      const response = await apiClient.patch(`/api/conductores/${id}/estado`, {
        estConductor: nuevoEstado
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Activar conductor
  activate: async (id) => {
    return driversAPI.changeStatus(id, 'ACTIVO');
  },

  // Desactivar conductor
  deactivate: async (id) => {
    return driversAPI.changeStatus(id, 'INACTIVO');
  },

  // Marcar como en descanso
  setResting: async (id) => {
    return driversAPI.changeStatus(id, 'DIA_DESCANSO');
  },

  // Marcar como incapacitado
  setIncapacitated: async (id) => {
    return driversAPI.changeStatus(id, 'INCAPACITADO');
  },

  // Marcar como de vacaciones
  setOnVacation: async (id) => {
    return driversAPI.changeStatus(id, 'DE_VACACIONES');
  },

  // ================================
  // GESTIÓN DE VEHÍCULOS
  // ================================
  
  // Asignar vehículo a conductor
  assignVehicle: async (idConductor, idVehiculo) => {
    try {
      if (!idConductor || !idVehiculo) {
        throw new Error('ID de conductor e ID de vehículo son requeridos');
      }

      const response = await apiClient.patch(`/api/conductores/${idConductor}/asignar-vehiculo`, {
        idVehiculo
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Desasignar vehículo de conductor
  unassignVehicle: async (idConductor) => {
    try {
      if (!idConductor) throw new Error('ID de conductor requerido');

      const response = await apiClient.patch(`/api/conductores/${idConductor}/desasignar-vehiculo`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // CONSULTAS ESPECIALIZADAS
  // ================================
  
  // Obtener conductores disponibles (para asignación)
  getAvailable: async () => {
    try {
      const response = await apiClient.get('/api/conductores/disponibles');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener conductores activos
  getActive: async () => {
    try {
      const response = await apiClient.get('/api/conductores?estConductor=ACTIVO');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener conductores sin vehículo asignado
  getUnassigned: async () => {
    try {
      const response = await apiClient.get('/api/conductores?sinVehiculo=true');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Buscar conductores por nombre o documento
  search: async (searchTerm) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
      }

      const response = await apiClient.get(`/api/conductores/buscar?q=${encodeURIComponent(searchTerm.trim())}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // REPORTES Y ESTADÍSTICAS
  // ================================
  
  // Obtener estadísticas de conductores
  getStatistics: async () => {
    try {
      const response = await apiClient.get('/api/conductores/estadisticas');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener distribución por estado
  getStatusDistribution: async () => {
    try {
      const response = await apiClient.get('/api/conductores/distribucion-estados');
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // GESTIÓN DE LICENCIAS
  // ================================
  
  // Verificar vencimiento de licencias
  checkLicenseExpiration: async (diasAnticipacion = 30) => {
    try {
      const response = await apiClient.get(`/api/conductores/licencias-vencimiento?dias=${diasAnticipacion}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Obtener conductores con licencias próximas a vencer
  getExpiringLicenses: async (days = 30) => {
    try {
      const response = await apiClient.get(`/api/conductores/licencias-expiran?dias=${days}`);
      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // Renovar licencia de conductor
  renewLicense: async (id, nuevaFechaVencimiento, tipoLicencia) => {
    try {
      if (!id || !nuevaFechaVencimiento) {
        throw new Error('ID de conductor y nueva fecha de vencimiento son requeridos');
      }

      const fechaVencimiento = new Date(nuevaFechaVencimiento);
      const hoy = new Date();
      
      if (fechaVencimiento <= hoy) {
        throw new Error('La nueva fecha de vencimiento debe ser futura');
      }

      if (tipoLicencia) {
        const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
        if (!validLicenses.includes(tipoLicencia)) {
          throw new Error('Tipo de licencia inválido');
        }
      }

      const response = await apiClient.patch(`/api/conductores/${id}/renovar-licencia`, {
        fecVenLicConductor: nuevaFechaVencimiento,
        ...(tipoLicencia && { tipLicConductor: tipoLicencia })
      });

      return response.data;
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  },

  // ================================
  // UTILIDADES ESPECÍFICAS
  // ================================
  
  // Validar datos de conductor
  validateDriverData: (driverData) => {
    const errors = [];
    
    // Validar nombres
    if (!driverData.nomConductor || driverData.nomConductor.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (!driverData.apeConductor || driverData.apeConductor.trim().length < 2) {
      errors.push('El apellido debe tener al menos 2 caracteres');
    }

    // Validar documento
    if (!driverData.numDocConductor || driverData.numDocConductor.trim().length < 6) {
      errors.push('El número de documento debe tener al menos 6 caracteres');
    }

    // Validar licencia
    const validLicenses = ['B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
    if (!driverData.tipLicConductor || !validLicenses.includes(driverData.tipLicConductor)) {
      errors.push('Debe seleccionar un tipo de licencia válido');
    }

    // Validar fecha de vencimiento
    if (!driverData.fecVenLicConductor) {
      errors.push('La fecha de vencimiento de la licencia es requerida');
    } else {
      const fechaVencimiento = new Date(driverData.fecVenLicConductor);
      const hoy = new Date();
      if (fechaVencimiento <= hoy) {
        errors.push('La fecha de vencimiento debe ser futura a');
      }
    }

    // Validar teléfono si se proporciona
    if (driverData.telConductor && driverData.telConductor.trim().length < 7) {
      errors.push('El número de teléfono debe tener al menos 7 dígitos');
    }

    return errors;
  },

  // Formatear datos de conductor para mostrar
  formatDriverData: (driver) => {
    return {
      ...driver,
      nombreCompleto: `${driver.nomConductor} ${driver.apeConductor}`,
      licenciaFormateada: `${driver.tipLicConductor} - Vence: ${apiUtils.formatDate(driver.fecVenLicConductor, 'DD/MM/YYYY')}`,
      estadoFormateado: driversAPI.getStatusLabel(driver.estConductor),
      diasParaVencimiento: driversAPI.getDaysUntilExpiration(driver.fecVenLicConductor)
    };
  },

  // Obtener etiqueta del estado
  getStatusLabel: (status) => {
    const statusLabels = {
      'ACTIVO': 'Activo',
      'INACTIVO': 'Inactivo',
      'DIA_DESCANSO': 'Día de descanso',
      'INCAPACITADO': 'Incapacitado',
      'DE_VACACIONES': 'De vacaciones'
    };
    return statusLabels[status] || status;
  },

  // Obtener color del estado para UI
  getStatusColor: (status) => {
    const statusColors = {
      'ACTIVO': 'green',
      'INACTIVO': 'red',
      'DIA_DESCANSO': 'blue',
      'INCAPACITADO': 'orange',
      'DE_VACACIONES': 'purple'
    };
    return statusColors[status] || 'gray';
  },

  // Calcular días hasta vencimiento de licencia
  getDaysUntilExpiration: (fechaVencimiento) => {
    const today = new Date();
    const expDate = new Date(fechaVencimiento);
    const diffTime = expDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },

  // Verificar si licencia está próxima a vencer
  isLicenseExpiringSoon: (fechaVencimiento, days = 30) => {
    return driversAPI.getDaysUntilExpiration(fechaVencimiento) <= days;
  },

  // Exportar lista de conductores
  exportDrivers: async (format = 'csv', filters = {}) => {
    try {
      const params = apiUtils.createUrlParams({ ...filters, formato: format });
      const response = await apiClient.get(`/api/conductores/export${params ? `?${params}` : ''}`, {
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `conductores_${new Date().getTime()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Conductores exportados exitosamente' };
    } catch (error) {
      throw new Error(apiUtils.formatError(error));
    }
  }
};

export default driversAPI;