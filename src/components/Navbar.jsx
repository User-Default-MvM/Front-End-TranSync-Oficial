import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaBars, 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaUserCircle,
  FaChevronDown,
  FaUserShield,
  FaCogs,
  FaSignInAlt,
  FaBell,
  FaQuestionCircle,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import { isAuthenticated, getCurrentUser, getUserRole, logout } from '../utilidades/authAPI';

const Navbar = ({ toggleSidebar, isMobile, isPublic = false }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark");
  const userMenuRef = useRef(null);

  // Detectar scroll para cambiar la apariencia del navbar
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Obtener datos del usuario actual
  useEffect(() => {
    if (!isPublic && isAuthenticated()) {
      const loadUserData = () => {
        try {
          const user = getCurrentUser();
          const role = getUserRole();
          
          setCurrentUser(user);
          setUserRole(role);
        } catch (error) {
          console.error('Error loading user data:', error);
          setCurrentUser(null);
          setUserRole('');
        }
      };

      loadUserData();
    }
  }, [isPublic]);

  // Cerrar menú de usuario cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Manejo de modo oscuro
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const handleLogout = async () => {
    if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      try {
        await logout();
        navigate("/home");
        setIsUserMenuOpen(false);
      } catch (error) {
        console.error('Error during logout:', error);
        localStorage.clear();
        navigate("/home");
      }
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => !prev);
  };

  const toggleTheme = () => {
    setDark(prev => !prev);
  };

  const getUserInitials = () => {
    if (currentUser?.name) {
      return currentUser.name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } else if (currentUser?.email) {
      return currentUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = () => {
    if (currentUser?.name) {
      return currentUser.name;
    } else if (currentUser?.email) {
      return currentUser.email.split('@')[0];
    }
    return 'Usuario';
  };

  const formatUserRole = (role) => {
    const roles = {
      'SUPERADMIN': 'Super Administrador',
      'ADMINISTRADOR': 'Administrador',
      'USER': 'Usuario',
      'PENDIENTE': 'Usuario Pendiente'
    };
    return roles[role] || role || 'Usuario';
  };

  const getAvatarGradient = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return 'from-purple-500 to-purple-700';
      case 'ADMINISTRADOR':
        return 'from-[#3949ab] to-[#1a237e]';
      case 'USER':
        return 'from-[#283593] to-[#1a237e]';
      case 'PENDIENTE':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-[#3949ab] to-[#283593]';
    }
  };

  const getUserRoleIcon = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return <FaUserShield size={14} className="text-white" />;
      case 'ADMINISTRADOR':
        return <FaCogs size={14} className="text-white" />;
      default:
        return <FaUser size={14} className="text-white" />;
    }
  };

  const getRoleBadgeColor = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ADMINISTRADOR':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'USER':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700' 
        : 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border-b border-gray-200/30 dark:border-gray-700'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {!isPublic && isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50 transition-all duration-200 group"
                aria-label="Toggle menu"
              >
                <FaBars size={18} className="group-hover:scale-110 transition-transform duration-200" />
              </button>
            )}
            
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-3 no-underline group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a237e] to-[#3949ab] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <div className="text-white font-bold text-lg">T</div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-[#1a237e] to-[#3949ab] bg-clip-text text-transparent">TransSync</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-1 opacity-80">Transport Management</span>
              </div>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Theme toggle button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-[#3949ab] dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group"
              title={dark ? "Activar modo claro" : "Activar modo oscuro"}
            >
              {dark ? (
                <FaSun size={16} className="text-yellow-500" />
              ) : (
                <FaMoon size={16} className="text-blue-600" />
              )}
            </button>

            {isPublic || !isAuthenticated() ? (
              <div className="flex items-center gap-3">
                <button onClick={handleLogin} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#1a237e] dark:text-gray-200 border border-[#1a237e]/20 dark:border-gray-600 rounded-xl transition-all duration-200 hover:bg-[#1a237e]/5 dark:hover:bg-gray-800">
                  <FaSignInAlt size={14} />
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </button>
                <button onClick={handleRegister} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#1a237e] to-[#3949ab] rounded-xl shadow-md hover:scale-105">
                  <FaUserCircle size={14} />
                  <span className="hidden sm:inline">Registrarse</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button className="relative p-2.5 text-gray-600 dark:text-gray-300 hover:text-[#3949ab] dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                  <FaBell size={16} />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full text-xs text-white flex items-center justify-center font-bold shadow-md">3</div>
                </button>

                <button className="p-2.5 text-gray-600 dark:text-gray-300 hover:text-[#3949ab] dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/50 rounded-xl transition-all duration-200 group">
                  <FaQuestionCircle size={16} />
                </button>

                {/* User menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-all duration-200 group border border-transparent hover:border-gray-200/50 dark:hover:border-gray-700"
                    aria-label="User menu"
                  >
                    <div className="relative">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-md ring-2 ring-white`}>
                        <span className="text-white font-bold text-sm">{getUserInitials()}</span>
                      </div>
                    </div>
                    <div className="hidden md:flex flex-col items-start min-w-0">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{getDisplayName()}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getRoleBadgeColor()}`}>{formatUserRole(userRole)}</span>
                    </div>
                    <FaChevronDown size={12} className={`text-gray-400 dark:text-gray-300 ${isUserMenuOpen ? 'rotate-180 text-[#3949ab]' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-md`}>
                            {getUserRoleIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{getDisplayName()}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser?.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <FaUser />
                          <span>Mi Perfil</span>
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <FaCog />
                          <span>Configuración</span>
                        </button>
                        <div className="border-t border-gray-100 dark:border-gray-700 my-2" />
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900">
                          <FaSignOutAlt />
                          <span>Cerrar Sesión</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;