# TranSync

> Sistema integral de gestión y optimización del transporte público moderno

## Descripción

TranSync es una plataforma web completa diseñada para la administración y optimización de sistemas de transporte público. Ofrece herramientas avanzadas para la gestión de flotas, conductores, rutas y programación de horarios con tecnologías modernas.

## Características principales

- **Gestión de flota integral**: Monitoreo en tiempo real de vehículos
- **Administración de conductores**: Sistema CRUD completo con validaciones
- **Programación inteligente**: Algoritmos de optimización de horarios
- **Seguridad avanzada**: Protocolos de nivel empresarial
- **Geolocalización precisa**: Sistema GPS optimizado
- **Análisis de datos**: Dashboard con métricas avanzadas
- **Interfaz responsive**: Compatible con dispositivos móviles y desktop
- **Modo oscuro**: Tema adaptable para mejor experiencia de usuario

## Tecnologías utilizadas

### Frontend
- **React** 19.0.0 - Framework principal
- **Tailwind CSS** 3.4.0 - Framework de estilos
- **Lucide React** - Biblioteca de iconos
- **Chart.js** / **Recharts** - Visualización de datos
- **Axios** - Cliente HTTP
- **React Router DOM** - Enrutamiento
- **React Helmet** - Gestión de metadatos

### Herramientas de desarrollo
- **ESLint** - Linting de código
- **PostCSS** / **Autoprefixer** - Procesamiento CSS
- **React Scripts** - Herramientas de build
- **Testing Library** - Testing utilities

## Estructura del proyecto

```
TransSync_Frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── pages/           # Páginas principales
│   │   ├── Home.jsx
│   │   ├── Drivers.jsx
│   │   └── Vehiculos.jsx
│   ├── context/         # Contextos de React
│   ├── api/            # Configuración de APIs
│   ├── utilidades/     # Utilidades y helpers
│   ├── styles/         # Estilos globales
│   └── App.js          # Componente principal
├── package.json
├── tailwind.config.js
└── README.md
```

## Instalación y configuración

### Prerrequisitos
- Node.js >= 16.0.0
- npm >= 8.0.0

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd TransSync_Frontend
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm start` | Inicia el servidor de desarrollo |
| `npm run build` | Crea build optimizado para producción |
| `npm test` | Ejecuta las pruebas |
| `npm run lint` | Ejecuta ESLint y corrige errores automáticamente |
| `npm run lint:check` | Verifica código sin corregir |
| `npm run format` | Formatea código con Prettier |
| `npm run analyze` | Analiza el bundle de producción |
| `npm run clean` | Limpia e reinstala dependencias |

## Módulos principales

### 1. Gestión de Conductores (`Drivers.jsx`)
- CRUD completo de conductores
- Validación de licencias y documentos
- Filtrado y búsqueda avanzada
- Exportación de datos
- Alertas de vencimientos

### 2. Gestión de Vehículos (`Vehiculos.jsx`)
- Administración de flota
- Control de estados (Disponible, En ruta, Mantenimiento)
- Asignación de conductores
- Seguimiento de documentación (SOAT, Técnica)
- Estadísticas en tiempo real

### 3. Dashboard Principal (`Home.jsx`)
- Visión general del sistema
- Métricas y estadísticas
- Testimonios y reconocimientos
- Información corporativa

## Configuración de desarrollo

### ESLint
El proyecto incluye configuración de ESLint con reglas específicas:
- Advertencias para variables no utilizadas
- Validación de hooks de React
- Estándares de código React

### Tailwind CSS
Configuración optimizada con:
- Plugins para formularios y tipografía
- Soporte para modo oscuro
- Utilidades personalizadas

## Build para producción

```bash
npm run build
```

Esto generará una versión optimizada en la carpeta `build/` lista para despliegue.

## Testing

```bash
npm test
```

Ejecuta las pruebas usando React Testing Library.

## Navegadores soportados

### Producción
- Navegadores modernos con >0.2% de uso
- Excluye navegadores obsoletos

### Desarrollo  
- Últimas versiones de Chrome, Firefox, Safari

## Contribución

1. Fork del proyecto
2. Crear rama para nueva característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit de cambios (`git commit -am 'Añadir nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crear Pull Request

## Licencia

Este proyecto está bajo licencia privada. Todos los derechos reservados.

## Soporte

Para soporte técnico o consultas:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo

## Roadmap

- [ ] Implementación de PWA
- [ ] Integración con APIs de mapas
- [ ] Sistema de notificaciones push
- [ ] Módulo de reportes avanzados
- [ ] Integración con sistemas de pago
- [ ] App móvil nativa

---

**TranSync** - Transformando el transporte público del futuro