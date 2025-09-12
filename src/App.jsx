import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { isAuthenticated } from './utilidades/authAPI';
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import LanguageSwitcher from "./components/LanguageSwitcher"; // ✅ nuevo

// Importación de i18n y traducción
import "./i18n";

// Importaciones de páginas
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Drivers from "./pages/Drivers";
import Rutas from "./pages/Rutas";
import Vehiculos from "./pages/Vehiculos";
import Horarios from "./pages/Horarios";
import Informes from "./pages/Informes";
import Emergency from "./pages/Emergency";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Hook personalizado para gestión del sidebar
const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    const initialMobile = window.innerWidth <= 768;
    setIsMobile(initialMobile);
    setSidebarOpen(!initialMobile);
    
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => { if (isMobile) setSidebarOpen(false); };

  return { sidebarOpen, isMobile, toggleSidebar, closeSidebar };
};

// Componente Protected Route básico
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Layout principal para rutas protegidas
const ProtectedLayout = ({ children }) => {
  const { sidebarOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();

  const getContentClasses = () => {
    if (isMobile) {
      return "min-h-screen w-full transition-all duration-300 ease-in-out";
    }
    const paddingLeft = sidebarOpen ? 'pl-[280px]' : 'pl-[70px]';
    return `min-h-screen w-full transition-all duration-300 ease-in-out ${paddingLeft}`;
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar global */}
      <Navbar 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      {/* Selector de idioma */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      {/* Sidebar solo para usuarios autenticados */}
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
        onOverlayClick={closeSidebar}
        isMobile={isMobile}
      />
      
      {/* Contenido principal */}
      <main className={`${getContentClasses()} pt-16`}>
        {children}
      </main>
      
      {/* ChatBot flotante */}
      <ChatBot 
        position="bottom-right" 
        theme="professional"
        className="fixed bottom-6 right-6 z-50"
      />
    </div>
  );
};

// Layout público
const PublicLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen">
      <Navbar isPublic={true} />

      {/* Selector de idioma */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <main className="min-h-screen pt-16">
        {children}
      </main>
    </div>
  );
};

// Redirección automática para la ruta raíz
const AutoRedirect = () => {
  return <Navigate to="/home" replace />;
};

// Componente principal App
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<AutoRedirect />} />
          
          {/* Rutas públicas */}
          <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
          <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
          
          {/* Rutas protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute><ProtectedLayout><Dashboard /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><ProtectedLayout><AdminDashboard /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/drivers" element={<ProtectedRoute><ProtectedLayout><Drivers /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/rutas" element={<ProtectedRoute><ProtectedLayout><Rutas /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/vehiculos" element={<ProtectedRoute><ProtectedLayout><Vehiculos /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/horarios" element={<ProtectedRoute><ProtectedLayout><Horarios /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/informes" element={<ProtectedRoute><ProtectedLayout><Informes /></ProtectedLayout></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute><ProtectedLayout><Emergency /></ProtectedLayout></ProtectedRoute>} />
          
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
