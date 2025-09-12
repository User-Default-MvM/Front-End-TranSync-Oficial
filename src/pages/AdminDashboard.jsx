// src/pages/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaCog, 
  FaUserShield,
  FaSearch,
  FaEdit,
  FaTrash,
  FaPlus
} from 'react-icons/fa';
import { getCurrentUser, getUserRole } from '../utilidades/authAPI';
import adminAPI from '../utilidades/adminAPI'; 

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = getCurrentUser();
    const role = getUserRole();
    
    if (userData) {
      setUser(userData);
      setUserRole(role);
    }

    if (role === 'SUPERADMIN') {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = usuarios.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nomUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.apeUsuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.numDocUsuario?.includes(searchTerm)
      );
      setFilteredUsuarios(filtered);
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchTerm, usuarios]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // RECUERDA: Asegúrate que en adminAPI.js la función se llame así o como la necesites.
      const response = await adminAPI.getUsers(); 
      setUsuarios(response || []);
    } catch (error) {
      console.error('Error cargando la lista de usuarios:', error);
      setError('Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (idUsuario) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      try {
        // RECUERDA: Asegúrate que en adminAPI.js la función se llame así.
        await adminAPI.deleteUser(idUsuario); 
        await loadUsers();
        alert('Usuario eliminado exitosamente');
      } catch (error) {
        console.error('Error eliminando usuario:', error);
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleEditUser = (userToEdit) => {
    setSelectedUser(userToEdit);
    // Aquí puedes navegar a una página de edición o abrir un modal
    // navigate(`/admin/edit-user/${userToEdit.idUsuario}`);
    setShowModal(true); // Por ahora solo abre un modal de ejemplo
  };
  
  const formatRole = (role) => {
    const roles = {
      'SUPERADMIN': 'Super Admin',
      'GESTOR': 'Gestor',
      'CONDUCTOR': 'Conductor'
    };
    return roles[role] || role;
  };

  const getStats = () => {
    const total = usuarios.length;
    const gestorCount = usuarios.filter(u => u.rol === 'GESTOR').length;
    const conductorCount = usuarios.filter(u => u.rol === 'CONDUCTOR').length;
    const activosCount = usuarios.filter(u => u.estActivo).length;

    return { total, gestorCount, conductorCount, activosCount };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
      <p className="text-gray-400 mb-8">Administra los roles y el estado de los usuarios del sistema.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-6 rounded-lg"><FaUsers className="text-blue-500 mb-2" size={24} /> <h3 className="text-2xl font-semibold">{stats.total}</h3><p>Total Usuarios</p></div>
        <div className="bg-gray-800 p-6 rounded-lg"><FaUserShield className="text-green-500 mb-2" size={24} /> <h3 className="text-2xl font-semibold">{stats.gestorCount}</h3><p>Gestores</p></div>
        <div className="bg-gray-800 p-6 rounded-lg"><FaCog className="text-yellow-500 mb-2" size={24} /> <h3 className="text-2xl font-semibold">{stats.conductorCount}</h3><p>Conductores</p></div>
        <div className="bg-gray-800 p-6 rounded-lg"><div className="text-purple-500 mb-2">✅</div><h3 className="text-2xl font-semibold">{stats.activosCount}</h3><p>Activos</p></div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-lg flex justify-between items-center mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar por nombre, email o documento..."
            className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
          <FaPlus className="mr-2" /> Nuevo Usuario
        </button>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error} <button onClick={loadUsers} className="underline">Reintentar</button></p>}
      
      <div className="overflow-x-auto bg-gray-800 rounded-lg">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-4">Nombre</th>
              <th className="p-4">Email</th>
              <th className="p-4">Documento</th>
              <th className="p-4">Rol</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsuarios.length > 0 ? filteredUsuarios.map(u => (
              <tr key={u.idUsuario} className="border-b border-gray-700 hover:bg-gray-700">
                <td className="p-4">{u.nomUsuario} {u.apeUsuario}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4">{u.numDocUsuario}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.rol === 'GESTOR' ? 'bg-green-800 text-green-300' : 'bg-yellow-800 text-yellow-300'}`}>{formatRole(u.rol)}</span></td>
                <td className="p-4">{u.estActivo ? 'Activo' : 'Inactivo'}</td>
                <td className="p-4">
                  <button onClick={() => handleEditUser(u)} className="text-blue-400 hover:text-blue-300 mr-4"><FaEdit /></button>
                  <button onClick={() => handleDeleteUser(u.idUsuario)} className="text-red-400 hover:text-red-300"><FaTrash /></button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="text-center p-8 text-gray-500">No se encontraron usuarios.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;