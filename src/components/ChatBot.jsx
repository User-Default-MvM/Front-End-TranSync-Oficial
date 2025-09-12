import React, { useState, useRef, useEffect } from 'react';
import chatbotAPI from '../utilidades/chatbotAPI';

// Componente Button con paleta uniforme y modo oscuro
const Button = ({ 
  children, 
  onClick, 
  variant = "primary", 
  size = "medium", 
  className = "",
  disabled = false,
  dark = false,
  ...props 
}) => {
  const baseClasses = "font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: dark 
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm hover:shadow-md"
      : "bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white hover:from-[#0d1642] hover:to-[#283593] focus:ring-[#3949ab] focus:ring-opacity-50 shadow-sm hover:shadow-md",
    secondary: dark
      ? "bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 focus:ring-gray-500 focus:ring-opacity-50 shadow-sm hover:shadow-md"
      : "bg-gradient-to-r from-[#283593] to-[#3949ab] text-white hover:from-[#1a237e] hover:to-[#283593] focus:ring-[#283593] focus:ring-opacity-50 shadow-sm hover:shadow-md",
    outline: dark
      ? "bg-transparent border-2 border-blue-500 text-blue-400 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 hover:text-white focus:ring-blue-500 focus:ring-opacity-50"
      : "bg-transparent border-2 border-[#1a237e] text-[#1a237e] hover:bg-gradient-to-r hover:from-[#1a237e] hover:to-[#3949ab] hover:text-white focus:ring-[#1a237e] focus:ring-opacity-50"
  };
  
  const sizes = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2.5 text-base",
    large: "px-6 py-3 text-lg"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

const ChatBot = ({ 
  title = "Asistente TransSync",
  initialMessage = "Hola! Soy el asistente virtual de TransSync. Puedo ayudarte con información actual sobre conductores, vehículos, rutas y mucho más. ¿En qué puedo ayudarte hoy?",
  position = "bottom-right",
  theme = "professional",
  agentAvatar = "🤖",
  userAvatar = "👤"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('unknown');
  const [userContext, setUserContext] = useState(null);
  const [dark, setDark] = useState(localStorage.getItem("theme") === "dark"); // Estado modo oscuro
  const messagesEndRef = useRef(null);
  
  // Detectar cambios en el tema del sistema
  useEffect(() => {
    const handleThemeChange = () => {
      const isDark = localStorage.getItem("theme") === "dark" || 
                     document.documentElement.classList.contains("dark");
      setDark(isDark);
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleThemeChange);
    
    // Observer para cambios en la clase dark del documento
    const observer = new MutationObserver(() => {
      handleThemeChange();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', handleThemeChange);
      observer.disconnect();
    };
  }, []);
  
  useEffect(() => {
    // Obtener contexto del usuario al inicializar
    const context = chatbotAPI.obtenerContextoUsuario();
    setUserContext(context);
    
    // Mensaje inicial personalizado
    if (messages.length === 0) {
      const mensajeInicial = context.esUsuarioAutenticado 
        ? `Hola ${context.nombreUsuario}! Soy el asistente de ${context.empresa}. Tengo acceso a datos actuales del sistema y puedo ayudarte con información sobre conductores, vehículos, rutas, horarios y más. ¿Qué necesitas consultar?`
        : initialMessage;

      setMessages([
        {
          id: Date.now(),
          text: mensajeInicial,
          sender: 'bot',
          timestamp: new Date(),
          formatted: true
        }
      ]);
    }
    
    // Verificar estado del servicio al abrir
    if (isOpen && connectionStatus === 'unknown') {
      verificarConexion();
    }
  }, [isOpen, connectionStatus, messages.length, initialMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar conexión con el servicio de chatbot
  const verificarConexion = async () => {
    try {
      const resultado = await chatbotAPI.verificarEstado();
      setConnectionStatus(resultado.success ? 'connected' : 'disconnected');
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  // Animaciones CSS mejoradas con modo oscuro
  useEffect(() => {
    const styleId = 'chatbot-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes typing {
          0%, 80%, 100% { 
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% { 
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
          to {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slideOutDown {
          from {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          to {
            transform: translateY(100%) scale(0.8);
            opacity: 0;
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(26, 35, 126, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(26, 35, 126, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(26, 35, 126, 0);
          }
        }
        
        @keyframes pulseDark {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        
        .typing-dot {
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        .chat-window-enter {
          animation: slideInUp 0.3s ease-out forwards;
        }
        
        .chat-window-exit {
          animation: slideOutDown 0.3s ease-in forwards;
        }
        
        .chat-button-bounce {
          animation: bounce 2s infinite;
        }
        
        .chat-button-pulse {
          animation: pulse 2s infinite;
        }
        
        .chat-button-pulse-dark {
          animation: pulseDark 2s infinite;
        }
        
        .message-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Scrollbar personalizada para modo oscuro */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${dark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(26, 35, 126, 0.3)'};
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${dark ? 'rgba(156, 163, 175, 0.6)' : 'rgba(26, 35, 126, 0.6)'};
        }
        
        /* Estilos para mensajes formateados */
        .formatted-message {
          line-height: 1.6;
        }
        
        .formatted-message strong {
          font-weight: 600;
          color: ${dark ? '#60a5fa' : '#1a237e'};
        }
        
        .formatted-message em {
          font-style: italic;
          opacity: 0.9;
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [dark]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      verificarConexion();
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isTyping) return;
    
    // Validar mensaje
    const validacion = chatbotAPI.validarMensaje(inputText);
    if (!validacion.esValido) {
      // Mostrar error de validación
      const errorMessage = {
        id: Date.now(),
        text: `Error: ${validacion.error}`,
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const mensajeUsuario = inputText;
    setInputText('');
    setIsTyping(true);
    
    try {
      // Enviar consulta a la API real
      const respuesta = await chatbotAPI.enviarConsulta(mensajeUsuario);
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          text: respuesta.respuesta,
          sender: 'bot',
          timestamp: new Date(),
          intencion: respuesta.intencion,
          success: respuesta.success,
          formatted: true
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);

    } catch (error) {
      console.error('Error enviando mensaje:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, ocurrió un error procesando tu consulta. Por favor verifica tu conexión e intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
      setConnectionStatus('disconnected');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (sugerencia) => {
    if (isTyping) return;
    setInputText(sugerencia.texto);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Clases de posición responsivas
  const getPositionClasses = () => {
    const positions = {
      'bottom-right': {
        desktop: 'bottom-6 right-6',
        mobile: 'bottom-4 right-4'
      },
      'bottom-left': {
        desktop: 'bottom-6 left-6',
        mobile: 'bottom-4 left-4'
      },
      'top-right': {
        desktop: 'top-6 right-6',
        mobile: 'top-4 right-4'
      },
      'top-left': {
        desktop: 'top-6 left-6',
        mobile: 'top-4 left-4'
      }
    };
    
    const pos = positions[position] || positions['bottom-right'];
    return `${pos.desktop} max-md:${pos.mobile}`;
  };

  // Temas mejorados con modo oscuro
  const themeClasses = {
    light: {
      window: 'bg-white text-gray-800 border border-gray-200',
      header: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white',
      botBubble: 'bg-gray-50 text-gray-800 border border-gray-100 shadow-sm',
      userBubble: 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white shadow-sm',
      input: 'bg-white border-gray-200 text-gray-800 focus:border-[#3949ab]',
      inputArea: 'border-gray-100 bg-gray-50',
      timestamp: 'text-gray-500'
    },
    dark: {
      window: 'bg-gray-900 text-gray-100 border border-gray-700',
      header: 'bg-gradient-to-r from-gray-800 to-gray-700 text-white',
      botBubble: 'bg-gray-800 text-gray-100 border border-gray-700 shadow-sm',
      userBubble: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm',
      input: 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500',
      inputArea: 'border-gray-700 bg-gray-800',
      timestamp: 'text-gray-400'
    },
    professional: {
      window: dark 
        ? 'bg-gray-900 text-gray-100 border border-gray-700 shadow-2xl'
        : 'bg-white text-slate-800 border border-slate-200 shadow-2xl',
      header: dark
        ? 'bg-gradient-to-r from-gray-800 to-gray-700 text-white'
        : 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] text-white',
      botBubble: dark
        ? 'bg-gray-800 text-gray-100 border border-gray-700 shadow-sm'
        : 'bg-slate-50 text-slate-800 border border-slate-100 shadow-sm',
      userBubble: dark
        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm'
        : 'bg-gradient-to-r from-[#283593] to-[#3949ab] text-white shadow-sm',
      input: dark
        ? 'bg-gray-800 border-gray-600 text-gray-100 focus:border-blue-500'
        : 'bg-white border-slate-200 text-slate-800 focus:border-[#3949ab]',
      inputArea: dark
        ? 'border-gray-700 bg-gray-800'
        : 'border-slate-100 bg-slate-50',
      timestamp: dark ? 'text-gray-400' : 'text-slate-500'
    }
  };

  const currentTheme = themeClasses[theme] || themeClasses.professional;

  // Determinar tamaño de ventana responsivo
  const getWindowSize = () => {
    return {
      responsive: 'w-[400px] h-[600px] max-sm:w-[calc(100vw-1rem)] max-sm:h-[calc(100vh-2rem)] max-sm:max-h-[600px] max-sm:max-w-[400px] max-md:w-[380px] max-md:h-[520px]'
    };
  };

  // Obtener sugerencias
  const sugerencias = chatbotAPI.obtenerSugerencias().slice(0, 4);

  return (
    <div className={`fixed z-[9999] ${getPositionClasses()}`}>
      {!isOpen ? (
        <button 
          className={`
            relative group
            ${dark 
              ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500'
              : 'bg-gradient-to-r from-[#1a237e] to-[#3949ab] hover:from-[#0d1642] hover:to-[#283593]'
            }
            text-white border-none rounded-full 
            w-16 h-16 flex items-center justify-center cursor-pointer 
            shadow-lg hover:shadow-xl
            transition-all duration-300 ease-out
            hover:scale-110 
            focus:outline-none focus:ring-4 ${dark ? 'focus:ring-blue-500' : 'focus:ring-[#3949ab]'} focus:ring-opacity-50
            max-sm:w-14 max-sm:h-14
            ${dark ? 'chat-button-pulse-dark' : 'chat-button-pulse'}
          `}
          onClick={toggleChat}
          aria-label="Abrir chat de asistencia"
        >
          <span className="text-2xl max-sm:text-xl filter drop-shadow-sm">💬</span>
          
          {/* Indicador de conexión */}
          <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
            connectionStatus === 'connected' ? 'bg-green-500' : 
            connectionStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
          }`}>
            <span className="text-white text-xs font-bold">
              {connectionStatus === 'connected' ? '✓' : connectionStatus === 'disconnected' ? '✗' : '?'}
            </span>
          </div>
          
          {/* Tooltip */}
          <div className={`absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 px-3 py-1 ${
            dark ? 'bg-gray-800 border border-gray-600' : 'bg-[#1a237e] border border-white/20'
          } text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none`}>
            Asistente Virtual con Datos Reales
            <div className={`absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent ${
              dark ? 'border-t-gray-800' : 'border-t-[#1a237e]'
            }`}></div>
          </div>
        </button>
      ) : (
        <div className={`
          ${getWindowSize().responsive}
          rounded-2xl overflow-hidden 
          flex flex-col 
          backdrop-blur-sm
          chat-window-enter
          ${currentTheme.window}
        `}>
          {/* Header mejorado */}
          <div className={`p-4 flex justify-between items-center ${currentTheme.header} shadow-sm`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-sm">🤖</span>
              </div>
              <div>
                <div className="font-semibold text-base leading-tight">{title}</div>
                <div className="text-xs opacity-90 flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-300' : 
                    connectionStatus === 'disconnected' ? 'bg-red-300' : 'bg-yellow-300'
                  }`}></span>
                  {isTyping ? 'Escribiendo...' : 
                   connectionStatus === 'connected' ? 'Conectado con datos reales' : 
                   connectionStatus === 'disconnected' ? 'Sin conexión' : 'Verificando...'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors duration-200"
                onClick={toggleMinimize}
                aria-label={isMinimized ? "Expandir" : "Minimizar"}
              >
                <span className="text-sm">
                  {isMinimized ? '🔼' : '🔽'}
                </span>
              </button>
              <button 
                className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-2 transition-colors duration-200"
                onClick={toggleChat}
                aria-label="Cerrar chat"
              >
                <span className="text-sm">✕</span>
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              {/* Contenedor de mensajes con scroll personalizado */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex items-end space-x-2 message-fade-in ${
                      msg.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.sender === 'bot' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${
                        msg.isError ? 'bg-red-500' : dark 
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                          : 'bg-gradient-to-br from-[#1a237e] to-[#3949ab]'
                      }`}>
                        {typeof agentAvatar === 'string' && agentAvatar.startsWith('http') ? (
                          <img src={agentAvatar} alt="Bot" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{msg.isError ? '⚠️' : agentAvatar}</span>
                        )}
                      </div>
                    )}
                    
                    <div className={`
                      px-4 py-3 rounded-2xl max-w-[80%] break-words relative
                      ${msg.sender === 'bot' 
                        ? `${msg.isError ? (dark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800') : currentTheme.botBubble} rounded-bl-md` 
                        : `${currentTheme.userBubble} rounded-br-md`
                      }
                    `}>
                      <div className={`leading-relaxed text-sm whitespace-pre-line ${
                        msg.formatted ? 'formatted-message' : ''
                      }`}>
                        {msg.formatted ? (
                          <div dangerouslySetInnerHTML={{ 
                            __html: chatbotAPI.formatearMensaje(msg.text) 
                          }} />
                        ) : (
                          msg.text
                        )}
                      </div>
                      <div className={`
                        text-xs opacity-75 text-right mt-2 flex items-center justify-end gap-1
                        ${currentTheme.timestamp}
                      `}>
                        {formatTimestamp(msg.timestamp)}
                        {msg.intencion && (
                          <span className={`text-xs px-1 rounded ${
                            dark ? 'bg-white bg-opacity-20' : 'bg-black bg-opacity-10'
                          }`}>
                            {msg.intencion}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {msg.sender === 'user' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-sm ${
                        dark 
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                          : 'bg-gradient-to-br from-[#283593] to-[#3949ab]'
                      }`}>
                        {typeof userAvatar === 'string' && userAvatar.startsWith('http') ? (
                          <img src={userAvatar} alt="Usuario" className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span>{userAvatar}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-end space-x-2 message-fade-in">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-sm ${
                      dark 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700'
                        : 'bg-gradient-to-br from-[#1a237e] to-[#3949ab]'
                    }`}>
                      <span>{agentAvatar}</span>
                    </div>
                    <div className={`px-4 py-3 rounded-2xl rounded-bl-md ${currentTheme.botBubble}`}>
                      <div className="flex items-center space-x-1">
                        <span className={`w-2 h-2 rounded-full inline-block typing-dot ${
                          dark ? 'bg-blue-500' : 'bg-[#3949ab]'
                        }`}></span>
                        <span className={`w-2 h-2 rounded-full inline-block typing-dot ${
                          dark ? 'bg-blue-500' : 'bg-[#3949ab]'
                        }`}></span>
                        <span className={`w-2 h-2 rounded-full inline-block typing-dot ${
                          dark ? 'bg-blue-500' : 'bg-[#3949ab]'
                        }`}></span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Área de input mejorada */}
              <div className={`p-4 border-t ${currentTheme.inputArea}`}>
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      className={`
                        w-full px-4 py-3 border rounded-xl text-sm outline-none resize-none
                        transition-all duration-200 ease-in-out
                        focus:ring-2 ${dark ? 'focus:ring-blue-500' : 'focus:ring-[#3949ab]'} focus:ring-opacity-50
                        ${dark ? 'placeholder-gray-500' : 'placeholder-gray-400'}
                        ${currentTheme.input}
                      `}
                      placeholder="Pregúntame sobre conductores, vehículos, rutas... (Enter para enviar)"
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyPress={handleKeyPress}
                      rows={inputText.split('\n').length || 1}
                      style={{ maxHeight: '120px' }}
                      disabled={isTyping || connectionStatus === 'disconnected'}
                    />
                  </div>
                  <Button 
                    variant="primary"
                    size="medium"
                    onClick={handleSendMessage}
                    disabled={!inputText.trim() || isTyping || connectionStatus === 'disconnected'}
                    className="px-4 py-3 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200"
                    dark={dark}
                  >
                    <span className="max-sm:hidden">Enviar</span>
                    <span className="sm:hidden">📤</span>
                  </Button>
                </div>
                
                {/* Sugerencias dinámicas */}
                {!isTyping && messages.length > 1 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sugerencias.map((sugerencia, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(sugerencia)}
                        disabled={connectionStatus === 'disconnected'}
                        className={`px-3 py-1 text-xs rounded-full transition-colors duration-200 border disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 ${
                          dark
                            ? 'bg-gradient-to-r from-blue-600/10 to-blue-700/10 text-blue-400 hover:from-blue-600/20 hover:to-blue-700/20 border-blue-500/30'
                            : 'bg-gradient-to-r from-[#1a237e]/10 to-[#3949ab]/10 text-[#1a237e] hover:from-[#1a237e]/20 hover:to-[#3949ab]/20 border-[#3949ab]/30'
                        }`}
                      >
                        <span>{sugerencia.icono}</span>
                        <span className="truncate max-w-[120px]">{sugerencia.texto.split('?')[0]}?</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Indicador de estado de conexión */}
                {connectionStatus === 'disconnected' && (
                  <div className={`mt-3 p-2 rounded-lg flex items-center gap-2 ${
                    dark 
                      ? 'bg-red-900/50 border border-red-700/50' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <span className="text-red-500">⚠️</span>
                    <span className={`text-xs ${dark ? 'text-red-300' : 'text-red-700'}`}>
                      Sin conexión al servidor. Verifica tu internet y reintenta.
                    </span>
                    <button 
                      onClick={verificarConexion}
                      className={`text-xs underline transition-colors ${
                        dark 
                          ? 'text-red-400 hover:text-red-300' 
                          : 'text-red-600 hover:text-red-800'
                      }`}
                    >
                      Reintentar
                    </button>
                  </div>
                )}

                {/* Información del usuario (opcional) */}
                {userContext && userContext.esUsuarioAutenticado && (
                  <div className={`mt-2 text-xs text-center ${
                    dark ? 'text-gray-400' : 'text-gray-600'
                  } opacity-70`}>
                    Conectado como {userContext.nombreUsuario} • {userContext.empresa}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;