// src/pages/AdminDashboard.jsx

import { useState, useEffect } from 'react';
import { FaUsers, FaCog, FaUserShield, FaSearch, FaEdit, FaTrash, FaPlus, FaArrowLeft } from 'react-icons/fa';
import { getCurrentUser, getUserRole } from '../utilidades/authAPI';
import adminAPI from '../utilidades/adminAPI';
import toast from 'react-hot-toast';

// ====================================================================
// COMPONENTE DEL FORMULARIO DE EDICIÓN (NUEVO)
// ====================================================================
const EditUserForm = ({ user, onSave, onCancel }) => {
  const [formData, setFormData] = useState(user);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData.idUsuario, formData.rol);
  };

  return (
    <div>
      <button onClick={onCancel} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
        <FaArrowLeft /> Volver a la lista
      </button>
      <div className="bg-gray-800 p-8 rounded-lg">
        <h2 className="text-2xl font-bold mb-2">Editar Usuario</h2>
        <p className="text-gray-400 mb-6">Modificando el perfil de <span className="font-semibold text-white">{user.nomUsuario} {user.apeUsuario}</span>.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Fila 1: Nombre y Apellido (no editables por ahora) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Nombre</label>
              <input type="text" value={formData.nomUsuario} disabled className="bg-gray-700 border border-gray-600 text-gray-400 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Apellido</label>
              <input type="text" value={formData.apeUsuario} disabled className="bg-gray-700 border border-gray-600 text-gray-400 text-sm rounded-lg block w-full p-2.5 cursor-not-allowed" />
            </div>
          </div>

          {/* Fila 2: Rol (editable) */}
          <div>
            <label htmlFor="role-select" className="block mb-2 text-sm font-medium text-gray-300">Asignar Rol</label>
            <select
              id="role-select"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            >
              <option value="CONDUCTOR">Conductor</option>
              <option value="GESTOR">Gestor</option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onCancel} className="py-2 px-6 rounded-lg bg-gray-600 hover:bg-gray-700 transition">Cancelar</button>
            <button type="submit" className="py-2 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 transition font-semibold">Actualizar Rol Usuario</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ====================================================================
// COMPONENTE PRINCIPAL DEL DASHBOARD
// ====================================================================
const AdminDashboard = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null); // <-- Controla si mostramos la lista o el formulario

  useEffect(() => {
    const role = getUserRole();
    if (role === 'SUPERADMIN') {
      loadUsers();
    } else {
      setLoading(false);
      setError("No tienes permiso para ver esta página.");
    }
  }, []);

  useEffect(() => {
    const filtered = searchTerm
      ? usuarios.filter(u =>
        (u.nomUsuario + ' ' + u.apeUsuario).toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.numDocUsuario?.includes(searchTerm)
      )
      : usuarios;
    setFilteredUsuarios(filtered);
  }, [searchTerm, usuarios]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getUsers();
      setUsuarios(data || []);
      setError('');
    } catch (err) {
      setError('Error al cargar la lista de usuarios');
      toast.error('No se pudo cargar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (idUsuario) => {
    console.log(`%cPASO 1: Botón presionado. Intentando eliminar usuario con ID: ${idUsuario}`, 'color: yellow; font-weight: bold;');

    toast((t) => (
      <div className="flex flex-col items-center gap-3 p-2">
        <p className="font-semibold text-white">¿Estás seguro?</p>
        <p className="text-sm text-center text-gray-300">Esta acción no se puede deshacer.</p>
        <div className="flex gap-3 mt-2">
          <button
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm"
            onClick={() => {
              toast.dismiss(t.id);
              const promise = adminAPI.deleteUser(idUsuario).then(() => {
                setUsuarios(prev => prev.filter(u => u.idUsuario !== idUsuario));
              });

              toast.promise(promise, {
                loading: 'Eliminando usuario...',
                success: 'Usuario eliminado exitosamente.',
                error: 'No se pudo eliminar el usuario.',
              });
            }}
          >
            Eliminar
          </button>
          <button
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      style: { background: '#374151', color: '#F9FAFB', borderRadius: '10px' },
      duration: 6000,
    });
  }

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
  };

  const handleUpdateUser = (idUsuario, nuevoRol) => {
    const promise = adminAPI.updateUserRole(idUsuario, nuevoRol).then(() => {
      setEditingUser(null); // Volver a la lista
      loadUsers();
    });

    toast.promise(promise, {
      loading: 'Actualizando rol...',
      success: 'Rol actualizado exitosamente.',
      error: 'No se pudo actualizar el rol.',
    });
  };

  const formatRole = (role) => ({ 'SUPERADMIN': 'Super Admin', 'GESTOR': 'Gestor', 'CONDUCTOR': 'Conductor' }[role] || role);

  const getStats = () => ({
    total: usuarios.length,
    gestorCount: usuarios.filter(u => u.rol === 'GESTOR').length,
    conductorCount: usuarios.filter(u => u.rol === 'CONDUCTOR').length,
    activosCount: usuarios.filter(u => u.estActivo).length,
  });

  if (loading) return <div className="p-8 bg-gray-900 min-h-screen text-center text-white">Cargando...</div>;

  const stats = getStats();

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen">
      {editingUser ? (
        // VISTA DE FORMULARIO DE EDICIÓN
        <EditUserForm
          user={editingUser}
          onSave={handleUpdateUser}
          onCancel={() => setEditingUser(null)}
        />
      ) : (
        // VISTA DE LISTA DE USUARIOS
        <>
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-gray-400 mb-8">Administra los roles y el estado de los usuarios del sistema.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg"><FaUsers className="text-blue-500 mb-2" size={24} /> <h3 className="text-2xl font-semibold">{stats.total}</h3><p>Total Usuarios</p></div>
            <div className="bg-gray-800 p-6 rounded-lg"><FaUserShield className="text-green-500 mb-2" size={24} /> <h3 className="text-2xl font-semibold">{stats.gestorCount}</h3><p>Gestores</p></div>
            <div className="bg-gray-800 p-6 rounded-lg"><FaCog className="text-yellow-500 mb-2" size={24} /> <h3 className="text-2xl font-semibold">{stats.conductorCount}</h3><p>Conductores</p></div>
            <div className="bg-gray-800 p-6 rounded-lg"><div className="text-purple-500 mb-2">✅</div><h3 className="text-2xl font-semibold">{stats.activosCount}</h3><p>Activos</p></div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg mb-6">
            <div className="relative w-full md:w-1/3">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o documento..."
                className="bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
        </>
      )}
    </div>
  );
};

export default AdminDashboard;