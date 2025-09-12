import React, { useState } from "react";
import { AlertTriangle, Bell, Phone, AlertCircle, SendHorizontal } from "lucide-react";

const Emergency = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [emergencyType, setEmergencyType] = useState("");
  const [description, setDescription] = useState("");

  const emergencyTypes = [
    { id: "accident", label: "Accidente vial", icon: <AlertTriangle /> },
    { id: "mechanical", label: "Falla mecánica", icon: <AlertCircle /> },
    { id: "security", label: "Problema de seguridad", icon: <Shield /> },
    { id: "medical", label: "Emergencia médica", icon: <Heart /> }
  ];

  const emergencyContacts = [
    { name: "Central de Operaciones", number: "601-555-0123", available: true },
    { name: "Servicio Técnico", number: "601-555-0124", available: true },
    { name: "Policía Nacional", number: "123", available: true },
    { name: "Ambulancia", number: "125", available: true }
  ];

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Alerta enviada: ${emergencyType} - ${description}`);
    closeModal();
    setEmergencyType("");
    setDescription("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto font-['Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif]">
      {/* Agregar estilos CSS en línea para la animación */}
      <style>
        {`
          @keyframes emergencyPulse {
            0% {
              transform: scale(1);
              box-shadow: 0 6px 12px rgba(220, 38, 38, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 8px 20px rgba(220, 38, 38, 0.5);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 6px 12px rgba(220, 38, 38, 0.3);
            }
          }
          .emergency-pulse {
            animation: emergencyPulse 2s infinite;
          }
        `}
      </style>

      {/* Header */}
      <div className="text-center mb-10 p-8 bg-gradient-to-br from-red-100 to-red-50 rounded-2xl shadow-lg shadow-red-600/10 relative">
        <AlertTriangle className="text-red-600 mb-4 mx-auto drop-shadow-lg" size={32} />
        <h1 className="text-3xl font-bold text-red-700 mb-0 pb-2" style={{textShadow: '1px 1px 0 rgba(255, 255, 255, 0.5)'}}>
          Centro de Emergencias
        </h1>
        <p className="text-base text-red-900 max-w-2xl mx-auto mt-3 leading-6">
          Sistema de respuesta rápida para situaciones de emergencia en el transporte público
        </p>
      </div>

      {/* Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Main Alert Card */}
        <div className="bg-gradient-to-br from-red-200 to-red-100 rounded-2xl p-8 shadow-lg flex flex-col items-center text-center">
          <Bell className="text-red-600 mb-4 drop-shadow-md" size={24} />
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Alerta de Emergencia</h2>
          <p className="text-slate-600 text-sm leading-6 mb-6">
            Presiona el botón para reportar un incidente o situación de emergencia en tiempo real
          </p>
          <button 
            className="emergency-pulse bg-red-600 text-white border-none py-3.5 px-6 rounded-full font-semibold text-base cursor-pointer transition-all duration-300 flex items-center gap-2.5 shadow-lg shadow-red-600/30 hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-red-600/40 active:translate-y-0 active:shadow-lg active:shadow-red-600/30"
            onClick={openModal}
          >
            <AlertCircle size={20} />
            <span>Reportar Emergencia</span>
          </button>
        </div>

        {/* Contacts Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg flex flex-col items-center text-center">
          <Phone className="text-red-600 mb-4 drop-shadow-md" size={24} />
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Contactos de Emergencia</h2>
          <ul className="list-none p-0 m-0 w-full text-left">
            {emergencyContacts.map((contact, index) => (
              <li key={index} className="flex items-center justify-between py-3.5 border-b border-slate-200 last:border-b-0">
                <div className="flex flex-col">
                  <span className="font-medium text-slate-800">{contact.name}</span>
                  <span className="text-slate-600 text-sm">{contact.number}</span>
                </div>
                <span className={`w-3 h-3 rounded-full ${contact.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
                <AlertTriangle size={20} /> Reportar Emergencia
              </h2>
              <button 
                className="text-slate-400 hover:text-slate-600 text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                {/* Emergency Types */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-slate-800 mb-4">Tipo de emergencia</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {emergencyTypes.map((type) => (
                      <label 
                        key={type.id} 
                        className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          emergencyType === type.id 
                            ? 'border-red-500 bg-red-50' 
                            : 'border-slate-200 hover:border-red-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="emergencyType"
                          value={type.id}
                          checked={emergencyType === type.id}
                          onChange={(e) => setEmergencyType(e.target.value)}
                          required
                          className="sr-only"
                        />
                        <span className="text-red-600">{type.icon}</span>
                        <span className="font-medium text-slate-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-slate-800 mb-3">Descripción del incidente</h3>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Proporciona detalles sobre la situación..."
                    required
                    rows="4"
                    className="w-full p-4 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                  <button 
                    type="button" 
                    className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                    onClick={closeModal}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    disabled={!emergencyType || !description.trim()}
                  >
                    <SendHorizontal size={16} />
                    <span>Enviar Alerta</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes de iconos adicionales
const Heart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

const Shield = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

export default Emergency;