import React, { useState, useEffect, useCallback } from "react";
import {
  Search, Plus, Edit, MessageSquare, ChevronLeft, ChevronRight,
  AlertCircle, Loader, Trash2, Filter, Download,
  Phone, Calendar, MapPin, Car, UserCheck, X, AlertTriangle
} from "lucide-react";
import driversAPI from "../utilidades/driversAPI";
// import { useTheme } from "../context/ThemeContext";
const Drivers = () => {
  // Agregar el contexto del tema
  // const { theme } = useTheme();  <-- comentar o borrar

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    licenseType: '',
    hasVehicle: ''
  });
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const driversPerPage = 10;

  // Nuevo estado para formularios
  const [formData, setFormData] = useState({
    nomConductor: '',
    apeConductor: '',
    numDocConductor: '',
    tipLicConductor: 'B1',
    fecVenLicConductor: '',
    telConductor: '',
    estConductor: 'INACTIVO'
  });

  // Estados para validaciones
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar conductores desde la API
  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await driversAPI.getAll(filters);
      setDrivers(response.conductores || response || []);
    } catch (error) {
      console.error('Error cargando conductores:', error);
      setError(error.message || 'Error al cargar los conductores');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Cargar conductores al montar el componente
  useEffect(() => {
    loadDrivers();
  }, [loadDrivers]);

  // Filtrar y ordenar conductores
  const filteredAndSortedDrivers = React.useMemo(() => {
    let filtered = drivers.filter(driver => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${driver.nomConductor || ''} ${driver.apeConductor || ''}`.trim();

      const matchesSearch = (
        fullName.toLowerCase().includes(searchLower) ||
        driver.estConductor?.toLowerCase().includes(searchLower) ||
        driver.numDocConductor?.toLowerCase().includes(searchLower) ||
        driver.telConductor?.toLowerCase().includes(searchLower) ||
        driver.tipLicConductor?.toLowerCase().includes(searchLower) ||
        (driver.vehiculo && (
          driver.vehiculo.numVehiculo?.toLowerCase().includes(searchLower) ||
          driver.vehiculo.plaVehiculo?.toLowerCase().includes(searchLower)
        ))
      );

      const matchesFilters = (
        (!filters.status || driver.estConductor === filters.status) &&
        (!filters.licenseType || driver.tipLicConductor === filters.licenseType) &&
        (!filters.hasVehicle ||
          (filters.hasVehicle === 'true' && driver.vehiculo) ||
          (filters.hasVehicle === 'false' && !driver.vehiculo)
        )
      );

      return matchesSearch && matchesFilters;
    });

    // Aplicar ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortConfig.key) {
          case 'name':
            aValue = `${a.nomConductor} ${a.apeConductor}`.toLowerCase();
            bValue = `${b.nomConductor} ${b.apeConductor}`.toLowerCase();
            break;
          case 'document':
            aValue = a.numDocConductor;
            bValue = b.numDocConductor;
            break;
          case 'status':
            aValue = a.estConductor;
            bValue = b.estConductor;
            break;
          case 'license':
            aValue = a.tipLicConductor;
            bValue = b.tipLicConductor;
            break;
          case 'licenseExpiry':
            aValue = new Date(a.fecVenLicConductor || 0);
            bValue = new Date(b.fecVenLicConductor || 0);
            break;
          default:
            aValue = a[sortConfig.key];
            bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [drivers, searchTerm, filters, sortConfig]);

  // Calcular paginación
  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = filteredAndSortedDrivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const totalPages = Math.ceil(filteredAndSortedDrivers.length / driversPerPage);

  // Resetear página cuando cambia la búsqueda o filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  // Función para ordenar
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Configuración de estados mejorada
  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVO":
        return {
          badgeClass: "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
          indicatorClass: "bg-green-600 shadow-green-200 dark:bg-green-500 dark:shadow-green-900/50",
          displayText: "Activo",
          icon: UserCheck
        };
      case "INACTIVO":
        return {
          badgeClass: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
          indicatorClass: "bg-red-600 shadow-red-200 dark:bg-red-500 dark:shadow-red-900/50",
          displayText: "Inactivo",
          icon: X
        };
      case "DIA_DESCANSO":
        return {
          badgeClass: "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
          indicatorClass: "bg-blue-600 shadow-blue-200 dark:bg-blue-500 dark:shadow-blue-900/50",
          displayText: "Día de descanso",
          icon: Calendar
        };
      case "INCAPACITADO":
        return {
          badgeClass: "bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800",
          indicatorClass: "bg-orange-600 shadow-orange-200 dark:bg-orange-500 dark:shadow-orange-900/50",
          displayText: "Incapacitado",
          icon: AlertTriangle
        };
      case "DE_VACACIONES":
        return {
          badgeClass: "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
          indicatorClass: "bg-purple-600 shadow-purple-200 dark:bg-purple-500 dark:shadow-purple-900/50",
          displayText: "De vacaciones",
          icon: MapPin
        };
      default:
        return {
          badgeClass: "bg-gray-50 text-gray-700 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700",
          indicatorClass: "bg-gray-600 shadow-gray-200 dark:bg-gray-500 dark:shadow-gray-900/50",
          displayText: status || "Desconocido",
          icon: AlertCircle
        };
    }
  };

  // Validar licencia próxima a vencer
  const isLicenseExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const isLicenseExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Validaciones del formulario
  const validateForm = (data) => {
    const errors = {};

    if (!data.nomConductor.trim()) {
      errors.nomConductor = 'El nombre es obligatorio';
    }

    if (!data.apeConductor.trim()) {
      errors.apeConductor = 'El apellido es obligatorio';
    }

    if (!data.numDocConductor.trim()) {
      errors.numDocConductor = 'El documento es obligatorio';
    } else if (!/^\d{6,15}$/.test(data.numDocConductor)) {
      errors.numDocConductor = 'El documento debe tener entre 6 y 15 dígitos';
    }

    if (!data.fecVenLicConductor) {
      errors.fecVenLicConductor = 'La fecha de vencimiento es obligatoria';
    }

    if (data.telConductor && !/^\d{10}$/.test(data.telConductor)) {
      errors.telConductor = 'El teléfono debe tener 10 dígitos';
    }

    return errors;
  };

  // Handlers CRUD mejorados
  const handleCreateDriver = async () => {
    setIsSubmitting(true);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await driversAPI.create(formData);
      setShowCreateModal(false);
      setFormData({
        nomConductor: '',
        apeConductor: '',
        numDocConductor: '',
        tipLicConductor: 'B1',
        fecVenLicConductor: '',
        telConductor: '',
        estConductor: 'INACTIVO'
      });
      setValidationErrors({});
      await loadDrivers();
    } catch (error) {
      setError(error.message || 'Error al crear conductor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setFormData({
      nomConductor: driver.nomConductor || '',
      apeConductor: driver.apeConductor || '',
      numDocConductor: driver.numDocConductor || '',
      tipLicConductor: driver.tipLicConductor || 'B1',
      fecVenLicConductor: driver.fecVenLicConductor ? driver.fecVenLicConductor.split('T')[0] : '',
      telConductor: driver.telConductor || '',
      estConductor: driver.estConductor || 'INACTIVO'
    });
    setShowEditModal(true);
    setValidationErrors({});
  };

  const handleUpdateDriver = async () => {
    setIsSubmitting(true);
    const errors = validateForm(formData);

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setIsSubmitting(false);
      return;
    }

    try {
      await driversAPI.update(selectedDriver.idConductor, formData);
      setShowEditModal(false);
      setSelectedDriver(null);
      setValidationErrors({});
      await loadDrivers();
    } catch (error) {
      setError(error.message || 'Error al actualizar conductor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDriver = (driver) => {
    setSelectedDriver(driver);
    setShowDeleteModal(true);
  };

  const confirmDeleteDriver = async () => {
    try {
      await driversAPI.delete(selectedDriver.idConductor);
      setShowDeleteModal(false);
      setSelectedDriver(null);
      await loadDrivers();
    } catch (error) {
      setError(error.message || 'Error al eliminar conductor');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDrivers.length === 0) return;

    try {
      await Promise.all(selectedDrivers.map(id => driversAPI.delete(id)));
      setSelectedDrivers([]);
      await loadDrivers();
    } catch (error) {
      setError(error.message || 'Error al eliminar conductores');
    }
  };

  const handleSelectDriver = (driverId) => {
    setSelectedDrivers(prev =>
      prev.includes(driverId)
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDrivers.length === currentDrivers.length) {
      setSelectedDrivers([]);
    } else {
      setSelectedDrivers(currentDrivers.map(d => d.idConductor));
    }
  };

  // Handlers adicionales
  const handleExportData = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "ID,Nombre,Apellido,Documento,Licencia,Vencimiento,Teléfono,Estado\n"
      + filteredAndSortedDrivers.map(driver =>
        `${driver.idConductor},"${driver.nomConductor}","${driver.apeConductor}","${driver.numDocConductor}","${driver.tipLicConductor}","${formatDate(driver.fecVenLicConductor)}","${driver.telConductor}","${driver.estConductor}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "conductores.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendMessage = (driver) => {
    // Simular envío de mensaje
    const message = `Hola ${driver.nomConductor}, tienes una notificación importante.`;
    alert(`Mensaje enviado a ${driver.nomConductor}: ${message}`);
  };

  // Calcular estadísticas avanzadas
  const stats = {
    total: drivers.length,
    activos: drivers.filter(d => d.estConductor === 'ACTIVO').length,
    inactivos: drivers.filter(d => d.estConductor === 'INACTIVO').length,
    descanso: drivers.filter(d => d.estConductor === 'DIA_DESCANSO').length,
    incapacitados: drivers.filter(d => d.estConductor === 'INCAPACITADO').length,
    vacaciones: drivers.filter(d => d.estConductor === 'DE_VACACIONES').length,
    conVehiculo: drivers.filter(d => d.vehiculo).length,
    licenciasVencen: drivers.filter(d => isLicenseExpiringSoon(d.fecVenLicConductor)).length,
    licenciasVencidas: drivers.filter(d => isLicenseExpired(d.fecVenLicConductor)).length
  };

  // Estado de carga
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-lg max-w-7xl mx-auto my-6 font-sans">
        <div className="flex items-center justify-center py-12">
          <Loader className="animate-spin mr-3 dark:text-gray-400" size={24} />
          <span className="text-slate-600 dark:text-gray-300">Cargando conductores...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 shadow-lg mx-auto  font-sans">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white m-0 pb-1.5 border-b-4 border-blue-600 dark:border-blue-500 inline-block">
          Gestión de Conductores
        </h2>
        <p className="text-slate-500 dark:text-gray-400 text-base mt-2 mb-6 font-normal">
          Sistema completo de administración de conductores con funciones CRUD
        </p>

        {/* Barra de herramientas */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          {/* Búsqueda y filtros */}
          <div className="flex gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar conductores..."
                className="w-80 pl-4 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-gray-600 text-sm transition-all bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-gray-400" size={16} />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-2 ${showFilters
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-400'
                : 'bg-white dark:bg-gray-800 border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200'
                } hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600`}
            >
              <Filter size={16} />
              Filtros
            </button>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            {selectedDrivers.length > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all flex items-center gap-2"
              >
                <Trash2 size={16} />
                Eliminar ({selectedDrivers.length})
              </button>
            )}

            <button
              onClick={handleExportData}
              className="px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-all flex items-center gap-2"
            >
              <Download size={16} />
              Exportar
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-all flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              Nuevo Conductor
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200"
                >
                  <option value="">Todos los estados</option>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="DIA_DESCANSO">Día de descanso</option>
                  <option value="INCAPACITADO">Incapacitado</option>
                  <option value="DE_VACACIONES">De vacaciones</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Tipo de licencia</label>
                <select
                  value={filters.licenseType}
                  onChange={(e) => setFilters({ ...filters, licenseType: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200"
                >
                  <option value="">Todas las licencias</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="B3">B3</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                  <option value="C3">C3</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Asignación de vehículo</label>
                <select
                  value={filters.hasVehicle}
                  onChange={(e) => setFilters({ ...filters, hasVehicle: e.target.value })}
                  className="w-full p-2 border border-slate-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/50 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-200"
                >
                  <option value="">Todos</option>
                  <option value="true">Con vehículo asignado</option>
                  <option value="false">Sin vehículo asignado</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-slate-800 dark:text-white">{stats.total}</div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Total</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.activos}</div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Activos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.conVehiculo}</div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Con vehículo</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.licenciasVencen}</div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Licencia por vencer</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.licenciasVencidas}</div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Licencia vencida</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-slate-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-slate-600 dark:text-gray-300">{stats.inactivos}</div>
          <div className="text-sm text-slate-500 dark:text-gray-400">Inactivos</div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-500 dark:text-red-300 flex-shrink-0" size={20} />
          <div className="text-red-700 dark:text-red-300 flex-1">
            <p className="font-semibold">Error al cargar los datos</p>
            <p className="text-sm">{error}</p>
          </div>
          <button
            onClick={loadDrivers}
            className="px-3 py-1 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => setError(null)}
            className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabla */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <table className="w-full border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-left first:rounded-tl-xl">
                <input
                  type="checkbox"
                  checked={selectedDrivers.length === currentDrivers.length && currentDrivers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded"
                />
              </th>
              <th
                className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-left cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => handleSort('name')}
              >
                Nombre Completo
              </th>
              <th
                className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-left cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => handleSort('document')}
              >
                Documento
              </th>
              <th
                className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-left cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => handleSort('license')}
              >
                Licencia
              </th>
              <th
                className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-left cursor-pointer hover:bg-slate-700 dark:hover:bg-slate-600"
                onClick={() => handleSort('status')}
              >
                Estado
              </th>
              <th className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-left">Vehículo</th>
              <th className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-left">Contacto</th>
              <th className="bg-slate-800 dark:bg-slate-700 text-white p-3 text-center last:rounded-tr-xl">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentDrivers.length > 0 ? (
              currentDrivers.map((driver, index) => {
                const statusConfig = getStatusConfig(driver.estConductor);
                const fullName = `${driver.nomConductor || ''} ${driver.apeConductor || ''}`.trim();
                const vehicleInfo = driver.vehiculo
                  ? `${driver.vehiculo.numVehiculo} (${driver.vehiculo.plaVehiculo})`
                  : null;
                const licenseExpiringSoon = isLicenseExpiringSoon(driver.fecVenLicConductor);
                const licenseExpired = isLicenseExpired(driver.fecVenLicConductor);

                return (
                  <tr
                    key={driver.idConductor}
                    className={`${index % 2 === 1 ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'} hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors ${selectedDrivers.includes(driver.idConductor) ? 'ring-2 ring-blue-200 bg-blue-50 dark:bg-blue-900' : ''
                      }`}
                  >
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700">
                      <input
                        type="checkbox"
                        checked={selectedDrivers.includes(driver.idConductor)}
                        onChange={() => handleSelectDriver(driver.idConductor)}
                        className="rounded"
                      />
                    </td>
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-gray-100">{fullName || 'Sin nombre'}</span>
                        <span className="text-xs text-slate-500 dark:text-gray-400">ID: {driver.idConductor}</span>
                      </div>
                    </td>
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700 font-mono text-slate-700 dark:text-gray-200">
                      {driver.numDocConductor || 'N/A'}
                    </td>
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="font-medium">{driver.tipLicConductor || 'N/A'}</span>
                        {driver.fecVenLicConductor && (
                          <span className={`text-xs ${licenseExpired ? 'text-red-600 font-semibold dark:text-red-400' :
                            licenseExpiringSoon ? 'text-orange-600 font-semibold dark:text-orange-400' : 'text-slate-500 dark:text-gray-400'
                            }`}>
                            {licenseExpired ? '⚠️ Vencida' : licenseExpiringSoon ? '⚠️ Por vencer' : 'Vence:'} {formatDate(driver.fecVenLicConductor)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium gap-1.5 ${statusConfig.badgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.indicatorClass} shadow-sm`}></span>
                        {statusConfig.displayText}
                      </span>
                    </td>
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700">
                      {vehicleInfo ? (
                        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-gray-200">
                          <Car size={14} className="text-blue-600 dark:text-blue-400" />
                          <span>{vehicleInfo}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-gray-500 text-sm">Sin asignar</span>
                      )}
                    </td>
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        {driver.telConductor ? (
                          <a
                            href={`tel:${driver.telConductor}`}
                            className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
                          >
                            <Phone size={12} />
                            {driver.telConductor}
                          </a>
                        ) : (
                          <span className="text-slate-400 dark:text-gray-500 text-sm">Sin teléfono</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 border-t border-slate-200 dark:border-gray-700">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditDriver(driver)}
                          className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded transition-colors"
                          title="Editar conductor"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleSendMessage(driver)}
                          className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded transition-colors"
                          title="Enviar mensaje"
                        >
                          <MessageSquare size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteDriver(driver)}
                          className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                          title="Eliminar conductor"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="p-12 text-center text-slate-500 dark:text-gray-400 italic border-t border-slate-200 dark:border-gray-700">
                  {searchTerm || Object.values(filters).some(f => f)
                    ? 'No se encontraron conductores que coincidan con los criterios de búsqueda'
                    : 'No hay conductores registrados'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* Paginación */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-200 dark:border-gray-700">
        <div className="text-sm text-slate-500 dark:text-gray-400">
          Mostrando {indexOfFirstDriver + 1} a {Math.min(indexOfLastDriver, filteredAndSortedDrivers.length)} de {filteredAndSortedDrivers.length} conductores
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-md text-sm text-slate-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${currentPage === pageNumber
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700'
                    }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 rounded-md text-sm text-slate-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
          >
            Siguiente
            <ChevronRight size={14} />
          </button>
        </div>
      </div>


      {/* Modal Crear Conductor */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100">Crear Nuevo Conductor</h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Nombre*</label>
                  <input
                    type="text"
                    value={formData.nomConductor}
                    onChange={(e) => setFormData({ ...formData, nomConductor: e.target.value })}
                    className={`w-full p-2.5 border rounded-md bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 ${validationErrors.nomConductor ? 'border-red-300 dark:border-red-500' : 'border-slate-300 dark:border-gray-600'
                      }`}
                    placeholder="Ingrese el nombre"
                  />
                  {validationErrors.nomConductor && (
                    <p className="text-red-600 dark:text-red-400 text-xs mt-1">{validationErrors.nomConductor}</p>
                  )}
                </div>

                {/* ... repite este mismo patrón para Apellido, Documento, Teléfono, Tipo Licencia, etc. */}

              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({
                    nomConductor: '',
                    apeConductor: '',
                    numDocConductor: '',
                    tipLicConductor: 'B1',
                    fecVenLicConductor: '',
                    telConductor: '',
                    estConductor: 'INACTIVO'
                  });
                  setValidationErrors({});
                }}
                className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateDriver}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader className="animate-spin" size={16} />}
                Crear Conductor
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal Editar Conductor */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-slate-800 dark:text-gray-100">Editar Conductor</h3>
            </div>

            <div className="p-6 space-y-4">
              {/* mismos inputs que en Crear, con dark: aplicado */}
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedDriver(null);
                  setValidationErrors({});
                }}
                className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateDriver}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <Loader className="animate-spin" size={16} />}
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Modal Confirmar Eliminación */}
      {showDeleteModal && selectedDriver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100">Confirmar Eliminación</h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <p className="text-slate-700 dark:text-gray-300 mb-6">
                ¿Estás seguro de que deseas eliminar al conductor{' '}
                <span className="font-semibold">
                  {selectedDriver.nomConductor} {selectedDriver.apeConductor}
                </span>?
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedDriver(null);
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-gray-200 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDeleteDriver}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Drivers;