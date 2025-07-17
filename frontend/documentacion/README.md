# Documentación del Frontend

## 📁 Ubicación
**Carpeta:** `experimento/frontend/documentacion/`

## 🎯 Índice de Documentación

### 📚 Guías Principales
- **[COMPONENTES.md](./COMPONENTES.md)** - Guía completa de componentes React
- **[PAGINAS.md](./PAGINAS.md)** - Guía de páginas y rutas de la aplicación
- **[API_INTEGRATION.md](./API_INTEGRATION.md)** - Guía de integración con APIs del backend
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Guía completa de testing
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guía de despliegue y configuración

## 🏗️ Arquitectura del Frontend

### 🎯 Tecnologías Utilizadas
- **React 18** - Biblioteca principal de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP para APIs

### 📁 Estructura de Carpetas
```
src/
├── 📱 components/          # Componentes reutilizables
│   ├── ui/                 # Componentes de UI básicos
│   ├── forms/              # Componentes de formularios
│   ├── layout/             # Componentes de layout
│   ├── chat/               # Componentes de chat
│   └── admin/              # Componentes específicos de admin
├── 📄 pages/               # Páginas de la aplicación
│   ├── auth/               # Páginas de autenticación
│   ├── admin/              # Páginas de administración
│   ├── client/             # Páginas de cliente
│   ├── lawyer/             # Páginas de abogado
│   └── public/             # Páginas públicas
├── 🔌 api/                 # Integración con APIs
├── 🎣 hooks/               # Custom hooks
├── 🎭 context/             # Contextos de React
├── 🎨 styles/              # Estilos y CSS
├── 🛠️ utils/               # Utilidades y helpers
└── 📝 types/               # Tipos TypeScript
```

## 🚀 Inicio Rápido

### 📋 Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Conocimientos básicos de React y TypeScript

### ⚡ Instalación
```bash
cd experimento/frontend
npm install
```

### 🏃‍♂️ Desarrollo
```bash
npm run dev
```

### 🧪 Testing
```bash
npm test
```

### 🏗️ Build
```bash
npm run build
```

## 📚 Navegación por Documentación

### 🔧 Para Desarrolladores
1. **Nuevo en el proyecto:** Comenzar con [COMPONENTES.md](./COMPONENTES.md)
2. **Trabajando en páginas:** Ver [PAGINAS.md](./PAGINAS.md)
3. **Integrando APIs:** Consultar [API_INTEGRATION.md](./API_INTEGRATION.md)

### 🧪 Para Testing
1. **Configuración:** Ver [TESTING_GUIDE.md](./TESTING_GUIDE.md)
2. **Ejecutar tests:** `npm test`
3. **Cobertura:** `npm run test:coverage`

### 🚀 Para Despliegue
1. **Configuración:** Ver [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Build de producción:** `npm run build`
3. **Docker:** Ver `deployment/Dockerfile`

## 🔗 Enlaces Útiles

### 📁 Carpetas Relacionadas
- **Configuración:** `../config/README.md`
- **Despliegue:** `../deployment/README.md`
- **Testing:** `../testing/README.md`
- **Scripts:** `../scripts/README.md`

### 🌐 Recursos Externos
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

## 📝 Contribución

### 📋 Guías de Contribución
1. **Código:** Seguir estándares de TypeScript y React
2. **Testing:** Mantener cobertura de tests > 80%
3. **Documentación:** Actualizar documentación relevante
4. **Commits:** Usar mensajes descriptivos

### 🔄 Flujo de Trabajo
1. Crear feature branch
2. Implementar cambios
3. Agregar tests
4. Actualizar documentación
5. Crear pull request

## 📊 Estado del Proyecto

### ✅ Completado
- Estructura base de componentes
- Sistema de autenticación
- Integración con APIs del backend
- Sistema de chat integrado
- Páginas principales por rol

### 🚧 En Desarrollo
- Optimización de performance
- Mejoras de UX/UI
- Testing automatizado
- Documentación completa

### 📋 Pendiente
- PWA features
- Internacionalización
- Analytics
- Monitoreo de errores

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo Frontend 