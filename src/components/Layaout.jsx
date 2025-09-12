import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Detectar tipo de dispositivo
  useEffect(() => {
    const checkDeviceType = () => {
      const mobile = window.innerWidth <= 768;
      const tablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      const desktop = window.innerWidth > 1024;
      
      setIsMobile(mobile);
      setIsTablet(tablet);
      
      // Configurar estado inicial del sidebar según el dispositivo
      if (mobile || tablet) {
        // En móvil y tablet, el sidebar debe estar cerrado por defecto
        setIsSidebarOpen(false);
      } else if (desktop) {
        // En desktop, el sidebar debe estar abierto por defecto
        setIsSidebarOpen(true);
      }
    };

    // Ejecutar al montar el componente
    checkDeviceType();
    
    // Agregar listener para cambios de tamaño de ventana
    window.addEventListener('resize', checkDeviceType);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const handleOverlayClick = () => {
    // Solo cerrar en móvil y tablet
    if ((isMobile || isTablet) && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Calcular margen izquierdo del contenido principal
  const getContentMargin = () => {
    if (isMobile || isTablet) {
      // En móvil y tablet, el sidebar es overlay, no afecta el margen
      return 'ml-0';
    } else {
      // En desktop, el sidebar empuja el contenido
      return isSidebarOpen ? 'ml-[280px]' : 'ml-[70px]';
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Sidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onOverlayClick={handleOverlayClick}
        isMobile={isMobile}
        isTablet={isTablet}
      />
      
      {/* Contenido principal */}
      <div 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${getContentMargin()}
          min-h-screen
        `}
      >
        {/* Header opcional para mostrar información del usuario en móvil */}
        {(isMobile || isTablet) && (
          <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 pl-16">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-[#1a237e] to-[#3949ab] rounded-full animate-pulse" />
                <span className="text-sm font-medium text-gray-700">TransSync Dashboard</span>
              </div>
              <div className="text-xs text-gray-500">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        )}

        {/* Contenido de las páginas */}
        <main className="p-4 md:p-6 lg:p-8">
          <div className="max-w-full mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Footer opcional */}
        <footer className="mt-auto bg-white/50 border-t border-gray-200 p-4">
          <div className="text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} TransSync - Sistema de Gestión de Transporte</p>
            <p className="mt-1">Versión 2.0.1 - Profesional</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;