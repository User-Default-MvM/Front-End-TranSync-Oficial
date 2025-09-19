// src/App.jsx

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast'; 
import { isAuthenticated } from './utilidades/authAPI';

// Componentes y Páginas
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ChatBot from "./components/ChatBot";
import LanguageSwitcher from "./components/LanguageSwitcher";
import "./i18n";
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

// ======================================================
// Tus componentes y hooks
// ======================================================
const useSidebar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile(); // Check on initial load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const closeSidebar = () => { if (isMobile) setSidebarOpen(false); };

  return { sidebarOpen, isMobile, toggleSidebar, closeSidebar };
};

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const ProtectedLayout = ({ children }) => {
  const { sidebarOpen, isMobile, toggleSidebar, closeSidebar } = useSidebar();
  const paddingLeft = !isMobile && sidebarOpen ? 'pl-[280px]' : 'pl-0 md:pl-[70px]';

  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" toastOptions={{ style: { background: '#374151', color: '#F9FAFB' } }}/>
      <Navbar toggleSidebar={toggleSidebar} isMobile={isMobile}/>
      
      <Sidebar 
        isOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar} 
        onOverlayClick={closeSidebar} 
        isMobile={isMobile} 
      />
      {/* =============================================================== */}

      <main className={`pt-16 transition-all duration-300 ${paddingLeft}`}>
        <div className="p-4 md:p-8">
            {children}
        </div>
      </main>
      <ChatBot className="fixed bottom-6 right-6 z-50" />
    </div>
  );
};

const PublicLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" toastOptions={{ style: { background: '#374151', color: '#F9FAFB' } }}/>
      <Navbar isPublic={true} />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

// ======================================================
// COMPONENTE APP
// ======================================================
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        {/* Rutas públicas usando tu PublicLayout */}
        <Route path="/home" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
        <Route path="/register" element={<PublicLayout><Register /></PublicLayout>} />
        
        {/* Rutas protegidas usando tu ProtectedLayout y ProtectedRoute */}
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
    </Router>
  );
}

export default App;