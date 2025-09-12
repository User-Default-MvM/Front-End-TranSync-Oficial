import React, { useState, useEffect } from 'react';
import { Bus, Clock, Shield, Map, BarChart, CalendarClock, User, Check, Award } from 'lucide-react';
const Home = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [, setDark] = useState(localStorage.getItem("theme") === "dark");

  const caracteristicas = [
    {
      icono: Bus,
      titulo: "Gestión de flota",
      descripcion: "Sistema integral de monitoreo de vehículos en tiempo real con análisis predictivo avanzado.",
      beneficios: ["GPS en tiempo real", "Mantenimiento predictivo", "Optimización de rutas"],
      color: "from-[#1a237e] to-[#3949ab]"
    },
    {
      icono: Clock,
      titulo: "Programación inteligente",
      descripcion: "Algoritmos de IA que optimizan horarios basados en patrones de demanda y condiciones del tráfico.",
      beneficios: ["IA predictiva", "Optimización automática", "Reducción de esperas"],
      color: "from-[#3949ab] to-[#5c6bc0]"
    },
    {
      icono: Shield,
      titulo: "Seguridad avanzada",
      descripcion: "Protocolos de seguridad de nivel empresarial con monitoreo 24/7 y respuesta automática.",
      beneficios: ["Monitoreo 24/7", "Alertas automáticas", "Protección de datos"],
      color: "from-[#1a237e] to-[#283593]"
    },
    {
      icono: Map,
      titulo: "Geolocalización precisa",
      descripcion: "Sistema GPS de alta precisión optimizado para entornos urbanos complejos.",
      beneficios: ["Precisión submétrica", "Cobertura urbana", "Actualización en vivo"],
      color: "from-[#283593] to-[#3949ab]"
    },
    {
      icono: BarChart,
      titulo: "Análisis de datos",
      descripcion: "Dashboard inteligente con métricas avanzadas para la toma de decisiones estratégicas.",
      beneficios: ["Informes automatizados", "KPIs en tiempo real", "Análisis predictivo"],
      color: "from-[#3949ab] to-[#5c6bc0]"
    },
    {
      icono: CalendarClock,
      titulo: "Planificación de horarios",
      descripcion: "Sistema automatizado de creación y optimización de horarios basado en demanda real.",
      beneficios: ["Automatización completa", "Optimización dinámica", "Adaptación en tiempo real"],
      color: "from-[#1a237e] to-[#3949ab]"
    }
  ];

  const testimonios = [
    {
      id: 1,
      texto: "TranSync ha revolucionado completamente nuestra operación. Hemos reducido costos en un 35% y mejorado la satisfacción del usuario significativamente.",
      autor: "Carlos Rodríguez",
      cargo: "Director de Operaciones",
      empresa: "TransUrbe Bogotá",
      rating: 5,
      beneficio: "35% reducción de costos"
    },
    {
      id: 2,
      texto: "La implementación fue sorprendentemente rápida y el soporte técnico es excepcional. Nuestros indicadores de puntualidad mejoraron en solo 3 meses.",
      autor: "Ana Martínez",
      cargo: "Gerente de Flota",
      empresa: "Metroplús Medellín",
      rating: 5,
      beneficio: "40% mejora en puntualidad"
    },
    {
      id: 3,
      texto: "La plataforma es increíblemente intuitiva. Nuestros operadores se adaptaron rápidamente y ahora gestionamos el doble de rutas con el mismo equipo.",
      autor: "Luis Fernández",
      cargo: "Jefe de Operaciones",
      empresa: "MIO Cali",
      rating: 5,
      beneficio: "100% más rutas gestionadas"
    }
  ];

  const premios = [
    { titulo: "Mejor Innovación en Transporte", año: "2025", organizacion: "Smart Cities Awards" },
    { titulo: "Excelencia en Tecnología", año: "2024", organizacion: "TransTech Global" },
    { titulo: "Producto del Año", año: "2024", organizacion: "Mobility Innovation Awards" }
  ];

  const ciudades = [
    "Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga",
    "Pereira", "Santa Marta", "Cúcuta", "Ibagué", "Manizales", "Pasto"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonios.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonios.length]);

  useEffect(() => {
    const observer = () => setDark(localStorage.getItem("theme") === "dark");
    window.addEventListener("storage", observer);
    return () => window.removeEventListener("storage", observer);
  }, [setDark]);

  return (
    <div className="font-['Inter',system-ui] text-gray-800 dark:text-gray-100 bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero */}
      <header className="bg-gradient-to-br from-[#1a237e] via-[#283593] to-[#3949ab] text-white py-20 px-6 relative overflow-hidden dark:from-gray-800 dark:via-gray-900 dark:to-black">
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none"></div>
        <div className="w-full max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/20 mb-8">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium">Premiado como Mejor Innovación en Transporte 2025</span>
          </div>
          <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-white to-blue-100 dark:from-yellow-300 dark:to-yellow-100 bg-clip-text text-transparent">TranSync</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8 text-blue-100 dark:text-gray-300">La plataforma integral para la gestión y optimización del transporte público moderno</p>
        </div>
      </header>

      {/* Ciudades */}
      <section className="py-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Más de 50 ciudades confían en nosotros</p>
          <div className="flex flex-wrap justify-center gap-8 opacity-60">
            {ciudades.slice(0, 8).map((c, i) => (
              <span key={i} className="text-lg font-semibold text-gray-400 dark:text-gray-200 hover:text-[#3949ab] dark:hover:text-yellow-400 transition">{c}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caracteristicas.map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center text-white mb-4`}><c.icono /></div>
              <h3 className="font-bold text-lg mb-2">{c.titulo}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{c.descripcion}</p>
              <ul className="space-y-1 text-sm">
                {c.beneficios.map((b, j) => (
                  <li key={j} className="flex items-center gap-2 text-gray-700 dark:text-gray-200"><Check className="w-4 h-4 text-green-500" /> {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-6">
          <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-lg italic mb-6">"{testimonios[currentTestimonial].texto}"</p>
            <div className="flex items-center gap-4">
              <User className="w-10 h-10 text-blue-500" />
              <div>
                <p className="font-bold">{testimonios[currentTestimonial].autor}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">{testimonios[currentTestimonial].cargo}, {testimonios[currentTestimonial].empresa}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Premios */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          {premios.map((p, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
              <Award className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
              <h4 className="font-bold">{p.titulo}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{p.organizacion} - {p.año}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#1a237e] to-[#3949ab] dark:from-gray-800 dark:to-gray-900 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">¿Listo para transformar el transporte público?</h2>
        <p className="text-blue-100 dark:text-gray-300 mb-8">Solicita una demostración gratuita hoy mismo</p>
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 px-6 rounded-xl shadow-lg transition">Solicitar Demo</button>
      </section>
    </div>
  );
};

export default Home;
