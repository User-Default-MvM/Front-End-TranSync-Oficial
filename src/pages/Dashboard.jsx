import { useState, useEffect, useCallback } from "react";
import { 
  Bus, 
  Users, 
  LayoutGrid, 
  Clock, 
  AlertTriangle,
  Calendar
} from "lucide-react";
import { Line, Doughnut } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  PointElement,

  LineElement,
  ArcElement,
  Filler
} from 'chart.js';
import { dashboardAPI } from '../utilidades/dashboardAPI';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  PointElement,
  LineElement,
  ArcElement,
  Filler
);

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalVehiculos: 0,
    vehiculosDisponibles: 0,
    vehiculosEnRuta: 0,
    totalConductores: 0,
    conductoresActivos: 0,
    totalRutas: 0,
    viajesEnCurso: 0
  });
  const [selectedPeriod, setSelectedPeriod] = useState('semana');
  const [alerts, setAlerts] = useState([]);
  const [chartData, setChartData] = useState({
    viajes: { labels: [], data: [] },
    rutas: []
  });
  const [realTimeData, setRealTimeData] = useState(null);

  // Envolver fetchRealTimeData en useCallback
  const fetchRealTimeData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getRealTimeData();
      if (response.status === 'success') {
        setRealTimeData(response.data);
      }
    } catch (error) {
      console.error("Error al cargar datos en tiempo real:", error);
    }
  }, []);

  // Envolver fetchChartsData en useCallback
  const fetchChartsData = useCallback(async () => {
    try {
      const response = await dashboardAPI.getChartsData(selectedPeriod);
      if (response.status === 'success') {
        setChartData(response.data);
      }
    } catch (error) {
      console.error("Error al cargar datos de gráficos:", error);
    }
  }, [selectedPeriod]); // Incluir selectedPeriod como dependencia

  // Envolver fetchDashboardData en useCallback
  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener estadísticas generales
      const statsResponse = await dashboardAPI.getGeneralStatistics();
      if (statsResponse.status === 'success') {
        setStats(statsResponse.data);
      }

      // Obtener alertas
      const alertsResponse = await dashboardAPI.getActiveAlerts();
      if (alertsResponse.status === 'success') {
        setAlerts(alertsResponse.data || []);
      }

      // Obtener datos de gráficos
      await fetchChartsData();

      // Obtener datos en tiempo real
      await fetchRealTimeData();

    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
      setError("Error al cargar los datos. Verifique su conexión.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchChartsData, fetchRealTimeData]); // Incluir las funciones como dependencias

  useEffect(() => {
    fetchDashboardData();
    
    // Actualizar datos en tiempo real cada 30 segundos
    const interval = setInterval(fetchRealTimeData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchRealTimeData]); // Incluir las funciones como dependencias

  useEffect(() => {
    fetchChartsData();
  }, [fetchChartsData]); // Incluir la función como dependencia

  const prepareChartData = () => {
    const { viajes, rutas } = chartData;
    
    // Preparar datos de viajes por período
    const viajesData = {
      labels: viajes.labels || [],
      datasets: [{
        label: "Viajes realizados",
        data: viajes.data?.map(item => item.totalViajes) || [],
        backgroundColor: "rgba(255, 204, 0, 0.5)",
        borderColor: "#FFB800",
        borderWidth: 2,
        tension: 0.4
      }]
    };

    // Preparar datos de distribución por rutas
    const rutasData = {
      labels: rutas?.slice(0, 5).map(ruta => ruta.nomRuta) || [],
      datasets: [{
        label: "Viajes por ruta",
        data: rutas?.slice(0, 5).map(ruta => ruta.totalViajes) || [],
        backgroundColor: [
          "rgba(54, 162, 235, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(255, 99, 132, 0.7)",
        ],
        borderWidth: 1,
      }]
    };

    return { viajesData, rutasData };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-5"></div>
        <p className="text-gray-600">Cargando información del sistema...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">Error al cargar el dashboard</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchDashboardData();
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { viajesData, rutasData } = prepareChartData();

  const dashboardStats = [
    { 
      icon: <Bus />, 
      label: "Buses en servicio", 
      value: stats.vehiculosDisponibles || 0,
      total: stats.totalVehiculos || 0,
      subtitle: `de ${stats.totalVehiculos} total`,
      colorClass: "border-blue-500", 
      iconBg: "bg-blue-50", 
      iconColor: "text-blue-500" 
    },
    { 
      icon: <Users />, 
      label: "Conductores activos", 
      value: stats.conductoresActivos || 0,
      total: stats.totalConductores || 0,
      subtitle: `de ${stats.totalConductores} total`,
      colorClass: "border-green-500", 
      iconBg: "bg-green-50", 
      iconColor: "text-green-500" 
    },
    { 
      icon: <LayoutGrid />, 
      label: "Rutas activas", 
      value: stats.totalRutas || 0,
      colorClass: "border-purple-500", 
      iconBg: "bg-purple-50", 
      iconColor: "text-purple-500" 
    },
    { 
      icon: <Clock />, 
      label: "Viajes en curso", 
      value: realTimeData?.viajesEnCurso || stats.viajesEnCurso || 0,
      colorClass: "border-orange-500", 
      iconBg: "bg-orange-50", 
      iconColor: "text-orange-500" 
    },
    { 
      icon: <AlertTriangle />, 
      label: "Alertas críticas", 
      value: realTimeData?.alertasCriticas || alerts.filter(a => a.severity === 'critical').length,
      colorClass: "border-red-500", 
      iconBg: "bg-red-50", 
      iconColor: "text-red-500" 
    }
  ];

  return (
    <div className="p-5 max-w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-col md:flex-row md:items-center gap-3">
        <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-200 m-0">
          Panel de Control <span className="text-yellow-500">TransSync</span>
        </h1>
        <div className="flex items-center gap-4">
          {realTimeData && (
            <div className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900 px-3 py-1 rounded-md">
              ● En vivo - {new Date(realTimeData.timestamp).toLocaleTimeString('es-CO')}
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-300 bg-slate-50 dark:bg-gray-800 px-4 py-2 rounded-md shadow-sm">
            <Calendar size={18} />
            <span>{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
        
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-8">
        {dashboardStats.map((stat, index) => (
          <div 
            key={index} 
            className={`flex items-center p-5 rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg bg-white dark:bg-gray-800 border-l-4 ${stat.colorClass}`}
          >
            <div className={`flex items-center justify-center w-12 h-12 ${stat.iconBg} dark:bg-gray-700 rounded-xl mr-4 ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 dark:text-gray-100 m-0 mb-1">{stat.value}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400 m-0">{stat.label}</p>
              {stat.subtitle && (
                <p className="text-xs text-slate-400 dark:text-gray-500 m-0 mt-1">{stat.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts Container */}
      <div className="flex flex-col gap-5">
        {/* First Chart Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Trips Chart */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <div className="flex justify-between items-center mb-3 flex-col md:flex-row gap-3">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 m-0">Frecuencia de Viajes</h3>
              <div className="flex gap-0.5 bg-slate-100 dark:bg-gray-700 rounded-md p-0.5">
                {['semana', 'mes', 'ano'].map(period => (
                  <button 
                    key={period}
                    className={`px-3 py-1.5 text-sm rounded transition-all ${
                      selectedPeriod === period 
                        ? 'bg-white dark:bg-gray-900 text-blue-700 dark:text-blue-300 shadow-sm' 
                        : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period === 'semana' ? 'Semana' : period === 'mes' ? 'Mes' : 'Año'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-grow h-80 relative">
              <Line data={viajesData} options={chartOptions} />
            </div>
          </div>
              
          {/* Routes Distribution Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 m-0 mb-4">Distribución por Rutas</h3>
            <div className="flex-grow h-80 relative">
              {rutasData.labels.length > 0 ? (
                <Doughnut data={rutasData} options={doughnutOptions} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <LayoutGrid className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay datos de rutas</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
            
        {/* Second Row - Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Vehicle Status */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col">
            <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 m-0 mb-4">Estado de la Flota</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Disponibles</span>
                </div>
                <span className="font-semibold text-green-700 dark:text-green-300">{stats.vehiculosDisponibles}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">En ruta</span>
                </div>
                <span className="font-semibold text-blue-700 dark:text-blue-300">{stats.vehiculosEnRuta}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm">En mantenimiento</span>
                </div>
                <span className="font-semibold text-orange-700 dark:text-orange-300">{stats.vehiculosEnMantenimiento || 0}</span>
              </div>
            </div>
          </div>
            
          {/* Alerts List */}
          <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex flex-col overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-gray-200 m-0">Alertas del Sistema</h3>
              {alerts.length > 0 && (
                <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs px-2 py-1 rounded-full">
                  {alerts.length} activas
                </span>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto">
              {alerts && alerts.length > 0 ? (
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {alerts.map((alert, index) => (
                    <li key={index} className={`flex items-start gap-3 p-3 rounded-md border-l-4 ${
                      alert.severity === 'critical' 
                        ? 'bg-red-50 dark:bg-red-900 border-red-500' 
                        : alert.severity === 'warning' 
                        ? 'bg-orange-50 dark:bg-orange-900 border-orange-500' 
                        : 'bg-blue-50 dark:bg-blue-900 border-blue-500'
                    }`}>
                      <AlertTriangle size={16} className={
                        alert.severity === 'critical' ? 'text-red-500' :
                        alert.severity === 'warning' ? 'text-orange-500' :
                        'text-blue-500'
                      } />
                      <div className="flex-1">
                        <p className="m-0 mb-1 text-sm font-medium text-slate-800 dark:text-gray-100">{alert.title}</p>
                        <p className="m-0 text-xs text-slate-500 dark:text-gray-400">{alert.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-gray-400">
                  <AlertTriangle className="w-12 h-12 mb-3 opacity-30" />
                  <p className="text-center italic">No hay alertas activas</p>
                  <p className="text-xs text-center mt-1">Sistema funcionando correctamente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Dashboard;