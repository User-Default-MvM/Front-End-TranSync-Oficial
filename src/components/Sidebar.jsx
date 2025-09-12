import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { 
  FaChartLine, FaUserTie, FaRoute, FaBus, 
  FaClock, FaExclamationTriangle, FaFileAlt, 
  FaSignOutAlt, FaChevronLeft, FaChevronRight,
  FaUserShield, FaCogs, FaUser, FaMoon, FaSun
} from "react-icons/fa";
import { getCurrentUser, getUserRole, logout } from '../utilidades/authAPI';

const Sidebar = ({ isOpen, toggleSidebar, onOverlayClick, isMobile: isMobileProp }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('');
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark"); // 👈 Estado modo oscuro
  const navigate = useNavigate();
  const location = useLocation();

  // Detectar tipo de dispositivo
  useEffect(() => {
    const checkDeviceType = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
    };
    
    if (isMobileProp !== undefined) {
      setIsMobile(isMobileProp);
      setIsTablet(false);
    } else {
      checkDeviceType();
      window.addEventListener('resize', checkDeviceType);
      return () => window.removeEventListener('resize', checkDeviceType);
    }
  }, [isMobileProp]);

  // Obtener datos del usuario actual
  useEffect(() => {
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
  }, []);

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if ((isMobile || isTablet) && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobile, isTablet, isOpen]);

  // 👇 Manejo de modo oscuro
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
      } catch (error) {
        console.error('Error during logout:', error);
        localStorage.clear();
        navigate("/home");
      }
    }
  };

  const handleOverlayClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onOverlayClick) {
      onOverlayClick();
    } else {
      toggleSidebar();
    }
  };

  const handleLinkClick = () => {
    if (isMobile || isTablet) {
      setTimeout(() => {
        toggleSidebar();
      }, 100);
    }
  };

  const formatUserRole = (role) => {
    const roles = {
      'SUPERADMIN': 'Super Administrador',
      'ADMINISTRADOR': 'Administrador',
      'CONDUCTOR': 'Conductor',
      'USER': 'Usuario',
      'PENDIENTE': 'Usuario Pendiente'
    };
    return roles[role] || role || 'Usuario';
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

  const getAvatarGradient = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return 'from-purple-500 to-purple-700';
      case 'ADMINISTRADOR':
        return 'from-[#3949ab] to-[#1a237e]';
      case 'CONDUCTOR':
        return 'from-green-500 to-green-700';
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
        return <FaUserShield size={20} className="text-white" />;
      case 'ADMINISTRADOR':
        return <FaCogs size={20} className="text-white" />;
      case 'CONDUCTOR':
        return <FaUserTie size={20} className="text-white" />;
      default:
        return <FaUser size={20} className="text-white" />;
    }
  };

  const hasPermissionForRoute = (path) => {
    if (!userRole) return false;

    const rolePermissions = {
      'SUPERADMIN': [
        '/dashboard',
        '/admin/dashboard',
        '/drivers',
        '/rutas',
        '/vehiculos',
        '/horarios',
      ],
      'ADMINISTRADOR': [
        '/dashboard',
        '/drivers',
        '/rutas',
        '/vehiculos',
        '/horarios',
      ],
      'CONDUCTOR': [],
      'USER': [],
      'PENDIENTE': []
    };

    return rolePermissions[userRole]?.includes(path) || false;
  };

  const allMenuItems = [
    { path: "/dashboard", icon: <FaChartLine />, label: "Dashboard", description: "Panel principal" },
    { path: "/admin/dashboard", icon: <FaCogs />, label: "Admin Dashboard", description: "Panel de administración", superAdminOnly: true },
    { path: "/drivers", icon: <FaUserTie />, label: "Conductores", description: "Gestión de conductores" },
    { path: "/rutas", icon: <FaRoute />, label: "Rutas", description: "Gestión de rutas" },
    { path: "/vehiculos", icon: <FaBus />, label: "Vehículos", description: "Gestión de vehículos" }, 
    { path: "/horarios", icon: <FaClock />, label: "Horarios", description: "Gestión de horarios" }, 
    { path: "/emergency", icon: <FaExclamationTriangle />, label: "Emergencias", description: "Centro de emergencias" },
    { path: "/informes", icon: <FaFileAlt />, label: "Informes", description: "Reportes y estadísticas" },
  ];

  const menuItems = allMenuItems.filter(item => hasPermissionForRoute(item.path));

  return (
    <>
      {isOpen && (isMobile || isTablet) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-[998] backdrop-blur-sm"
          onClick={handleOverlayClick}
        />
      )}

      <aside 
        className={`
          fixed left-0 top-16 h-[calc(100vh-64px)] z-[999]
          flex flex-col shadow-2xl transition-all duration-300 ease-in-out
          ${dark 
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-gray-100 before:from-black/10" 
            : "bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] text-white before:from-white/5"}
          before:absolute before:inset-0 before:bg-gradient-to-r before:to-transparent before:pointer-events-none
          ${isMobile || isTablet
            ? `w-[280px] ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
            : `${isOpen ? 'w-[280px]' : 'w-[70px]'} translate-x-0`
          }
        `}
      >
        {/* Header del sidebar */}
        <div className={`relative p-4 border-b min-h-[70px] flex items-center justify-between backdrop-blur-sm 
          ${dark ? "border-gray-700" : "border-white/20"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative">
              <img 
                src={`${process.env.PUBLIC_URL}/logo.svg`} 
                alt="Logo TransSync" 
                className="h-10 w-10 object-contain filter drop-shadow-lg" 
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className={`absolute -inset-1 rounded-full blur opacity-50 ${dark ? "bg-gray-700" : "bg-white/20"}`} />
            </div>
            {(isOpen || (!isMobile && !isTablet)) && (
              <div className={`flex flex-col transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent whitespace-nowrap">
                  TransSync
                </span>
                <span className={`text-xs ${dark ? "text-gray-400" : "text-blue-200 opacity-80"}`}>
                  Sistema de Gestión
                </span>
              </div>
            )}
          </div>
          
          {!isMobile && !isTablet && (
            <button 
              className={`border-none cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-110 active:scale-95 backdrop-blur-sm shadow-lg
              ${dark ? "bg-gray-700 hover:bg-gray-600 text-gray-200" : "bg-white/10 hover:bg-white/20 text-white"}`}
              onClick={toggleSidebar}
            >
              <div className="relative">
                <FaChevronLeft className={`transition-all duration-300 ${isOpen ? 'opacity-100 rotate-0' : 'opacity-0 rotate-180'}`} />
                <FaChevronRight className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'opacity-0 -rotate-180' : 'opacity-100 rotate-0'}`} />
              </div>
            </button>
          )}
        </div>

        {/* Perfil de usuario */}
        <div className={`p-4 border-b backdrop-blur-sm ${dark ? "border-gray-700" : "border-white/20"}`}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient()} flex items-center justify-center shadow-lg ring-2 ${dark ? "ring-gray-700" : "ring-white/20"}`}>
                {currentUser ? (
                  <span className="text-white font-bold text-sm">
                    {getUserInitials()}
                  </span>
                ) : (
                  getUserRoleIcon()
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse" />
            </div>
            {(isOpen || (!isMobile && !isTablet)) && (
              <div className={`flex-1 min-w-0 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                <h4 className={`text-sm font-semibold truncate ${dark ? "text-gray-100" : "text-white"}`} title={getDisplayName()}>
                  {getDisplayName()}
                </h4>
                <p className={`text-xs truncate ${dark ? "text-gray-400" : "text-blue-200 opacity-80"}`} title={formatUserRole(userRole)}>
                  {formatUserRole(userRole)}
                </p>
                {currentUser?.email && (
                  <p className={`text-xs truncate mt-0.5 ${dark ? "text-gray-500" : "text-blue-300 opacity-60"}`} title={currentUser.email}>
                    {currentUser.email}
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-300">En línea</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menú de navegación */}
        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {menuItems.length > 0 ? (
            <div className="px-2 space-y-1">
              {menuItems.map(({ path, icon, label, superAdminOnly }) => {
                const isActive = location.pathname === path;
                
                if (superAdminOnly && userRole !== 'SUPERADMIN') {
                  return null;
                }

                return (
                  <div key={path} className="relative group">
                    <Link 
                      to={path} 
                      className={`
                        flex items-center no-underline rounded-xl
                        transition-all duration-300 ease-in-out
                        hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                        ${isActive 
                          ? dark 
                            ? "bg-gray-700 text-gray-100 font-semibold shadow-lg backdrop-blur-sm" 
                            : "bg-white/20 shadow-lg backdrop-blur-sm text-blue-100 font-semibold" 
                          : dark 
                            ? "text-gray-300 hover:bg-gray-700 hover:text-gray-100" 
                            : "text-white/90 hover:bg-white/10 hover:text-white"}
                        ${(isOpen || (!isMobile && !isTablet)) ? 'p-3 justify-start' : 'p-3 justify-center'}
                      `}
                      onClick={handleLinkClick}
                    >
                      <div className={`flex items-center justify-center text-lg ${(isOpen || (!isMobile && !isTablet)) ? 'w-6 mr-4' : 'w-6'} ${isActive ? (dark ? "text-gray-200" : "text-blue-200") : ""}`}>
                        {icon}
                      </div>
                      {(isOpen || (!isMobile && !isTablet)) && (
                        <span className={`text-sm font-medium truncate transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                          {label}
                        </span>
                      )}
                    </Link>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`p-4 text-center text-sm ${dark ? "text-gray-400" : "text-blue-200"}`}>Sin permisos de acceso</div>
          )}
        </nav>

        {/* Footer del sidebar */}
        <div className={`p-4 mt-auto backdrop-blur-sm space-y-3 ${dark ? "border-t border-gray-700" : "border-t border-white/20"}`}>
          {/* Botón modo oscuro */}
          <button
            onClick={() => setDark(!dark)}
            className={`
              flex items-center w-full rounded-xl cursor-pointer
              transition-all duration-300 ease-in-out
              text-sm font-medium shadow-lg hover:shadow-xl
              hover:scale-105 active:scale-95
              ${dark 
                ? "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-gray-100" 
                : "bg-gradient-to-r from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800 text-white"}
              ${(isOpen || (!isMobile && !isTablet)) ? 'p-3 justify-start' : 'p-3 justify-center'}
            `}
            title="Cambiar tema"
          >
            <div className={`flex items-center justify-center ${(isOpen || (!isMobile && !isTablet)) ? 'mr-3' : ''}`}>
              {dark ? <FaSun /> : <FaMoon />}
            </div>
            {(isOpen || (!isMobile && !isTablet)) && (
              <span className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                {dark ? "Modo Claro" : "Modo Oscuro"}
              </span>
            )}
          </button>

          {/* Botón logout */}
          <button 
            onClick={handleLogout} 
            className={`
              flex items-center w-full rounded-xl cursor-pointer 
              transition-all duration-300 ease-in-out
              text-sm font-medium shadow-lg hover:shadow-xl
              hover:scale-105 active:scale-95
              ${dark 
                ? "bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white" 
                : "bg-gradient-to-r from-[#c62828] to-[#d32f2f] hover:from-[#b71c1c] hover:to-[#c62828] text-white"}
              ${(isOpen || (!isMobile && !isTablet)) ? 'p-3 justify-start' : 'p-3 justify-center'}
            `}
            title="Cerrar Sesión"
          >
            <div className={`${(isOpen || (!isMobile && !isTablet)) ? 'mr-3' : ''}`}>
              <FaSignOutAlt />
            </div>
            {(isOpen || (!isMobile && !isTablet)) && (
              <span className={`transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                Cerrar Sesión
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
