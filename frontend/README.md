# Frontend - Sistema Integral de Gestión Legal

## 📁 Ubicación
**Carpeta:** `experimento/frontend/`

## 🎯 Descripción
Aplicación frontend desarrollada en React con TypeScript para el Sistema Integral de Gestión Legal. Proporciona una interfaz moderna y responsiva para la gestión de casos legales, facturación electrónica, y comunicación con clientes.

## 🏗️ Arquitectura

### 🎯 Tecnologías Principales
- **React 18** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos
- **React Router** - Enrutamiento
- **Axios** - Cliente HTTP para APIs

### 📁 Estructura Organizada
```
experimento/frontend/
├── 📚 documentacion/           # Documentación completa
│   ├── README.md               # Índice principal de documentación
│   ├── COMPONENTES.md          # Guía de componentes
│   ├── PAGINAS.md              # Guía de páginas
│   ├── API_INTEGRATION.md      # Guía de integración con APIs
│   ├── TESTING_GUIDE.md        # Guía de testing
│   └── DEPLOYMENT_GUIDE.md     # Guía de despliegue
├── ⚙️ config/                  # Configuración organizada
│   ├── README.md               # Guía de configuración
│   ├── eslint.config.js        # Configuración ESLint
│   ├── postcss.config.js       # Configuración PostCSS
│   ├── tailwind.config.js      # Configuración Tailwind
│   ├── tsconfig.json           # Configuración TypeScript
│   └── vite.config.ts          # Configuración Vite
├── 🚀 deployment/              # Archivos de despliegue
│   ├── README.md               # Guía de despliegue
│   ├── Dockerfile              # Configuración Docker
│   ├── package.json            # Dependencias y scripts
│   └── package-lock.json       # Lock de dependencias
├── 🧪 testing/                 # Tests organizados
│   ├── setup.ts                # Configuración de tests
│   ├── App.test.tsx            # Test principal
│   ├── LoginForm.test.tsx      # Test de login
│   ├── roleSecurity.test.tsx   # Test de seguridad
│   └── test_timeout.js         # Configuración de timeout
├── 🔧 scripts/                 # Scripts de utilidad
│   ├── README.md               # Guía de scripts
│   └── build-optimization.js   # Optimización de build
├── 🏗️ src/                     # Código fuente (React/TypeScript)
│   ├── 📱 components/          # Componentes reutilizables
│   │   ├── ui/                 # Componentes de UI básicos
│   │   ├── forms/              # Componentes de formularios
│   │   ├── layout/             # Componentes de layout
│   │   ├── chat/               # Componentes de chat
│   │   └── admin/              # Componentes específicos de admin
│   ├── 📄 pages/               # Páginas de la aplicación
│   │   ├── auth/               # Páginas de autenticación
│   │   ├── admin/              # Páginas de administración
│   │   ├── client/             # Páginas de cliente
│   │   ├── lawyer/             # Páginas de abogado
│   │   └── public/             # Páginas públicas
│   ├── 🔌 api/                 # Integración con APIs
│   ├── 🎣 hooks/               # Custom hooks
│   ├── 🎭 context/             # Contextos de React
│   ├── 🎨 styles/              # Estilos y CSS
│   ├── 🛠️ utils/               # Utilidades y helpers
│   └── 📝 types/               # Tipos TypeScript
├── 📄 index.html               # HTML principal
├── 📄 README.md                # README principal
└── 📄 ORGANIZACION_FRONTEND.md # Resumen de organización
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

## 📚 Documentación

### 🔗 Enlaces Principales
- **[Documentación Completa](./documentacion/README.md)** - Índice principal de documentación
- **[Guía de Componentes](./documentacion/COMPONENTES.md)** - Guía de componentes React
- **[Guía de Páginas](./documentacion/PAGINAS.md)** - Guía de páginas y rutas
- **[Integración con APIs](./documentacion/API_INTEGRATION.md)** - Guía de integración con backend
- **[Guía de Testing](./documentacion/TESTING_GUIDE.md)** - Guía completa de testing
- **[Guía de Despliegue](./documentacion/DEPLOYMENT_GUIDE.md)** - Guía de despliegue

### 📁 Carpetas Organizadas
- **[Configuración](./config/README.md)** - Guía de configuración
- **[Despliegue](./deployment/README.md)** - Guía de despliegue
- **[Testing](./README.md)** - Guía de testing
- **[Scripts](./scripts/README.md)** - Guía de scripts de utilidad

## 🎯 Funcionalidades Principales

### 🔐 Autenticación y Autorización
- Login/Registro de usuarios
- Gestión de roles (Admin, Abogado, Cliente)
- Protección de rutas por rol
- Gestión de sesiones

### 📋 Gestión de Casos
- Creación y gestión de casos legales
- Asignación de casos a abogados
- Seguimiento de estado de casos
- Documentación asociada

### 💰 Facturación Electrónica
- Generación de facturas electrónicas
- Integración con Facturae
- Gestión de pagos
- Reportes de facturación

### 💬 Sistema de Chat
- Chat integrado con chatbot
- Comunicación en tiempo real
- Historial de conversaciones
- Notificaciones

### 📊 Dashboard y Reportes
- Dashboard personalizado por rol
- Reportes de actividad
- Métricas de rendimiento
- Análisis de datos

## 🔧 Configuración

### ⚙️ Variables de Entorno
```bash
# .env.local
VITE_API_URL=http://localhost:3000
VITE_CHATBOT_URL=http://localhost:5000
VITE_ENV=development
```

### 🎨 Personalización
- **Colores:** Editar `config/tailwind.config.js`
- **Configuración:** Editar `config/vite.config.ts`
- **Linting:** Editar `config/eslint.config.js`

## 🧪 Testing

### 📋 Comandos de Testing
```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests específicos
npm test -- --testNamePattern="Login"
```

### 🎯 Cobertura Objetivo
- **Cobertura Total:** > 80%
- **Cobertura de Líneas:** > 85%
- **Cobertura de Funciones:** > 90%

## 🚀 Despliegue

### 🐳 Docker
```bash
# Construir imagen
docker build -f deployment/Dockerfile -t frontend-app .

# Ejecutar contenedor
docker run -p 3000:3000 frontend-app
```

### ☁️ Despliegue en la Nube
- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **AWS S3 + CloudFront:** Ver guía de despliegue

## 🔧 Scripts de Utilidad

### 📋 Scripts Disponibles
```bash
# Optimización de build
node scripts/build-optimization.js

# Con análisis
node scripts/build-optimization.js --analyze

# Para producción
node scripts/build-optimization.js --prod
```

## 🔗 Integración

### 🔌 APIs del Backend
- **Autenticación:** `/api/auth`
- **Casos:** `/api/cases`
- **Facturas:** `/api/invoices`
- **Usuarios:** `/api/users`
- **Chat:** `/api/chat`

### 🤖 Chatbot
- **URL:** Configurada en variables de entorno
- **WebSocket:** Comunicación en tiempo real
- **API REST:** Endpoints de chat

## 📊 Métricas de Performance

### 🎯 Objetivos
- **Lighthouse Score:** > 90
- **Bundle Size:** < 500KB
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s

## 🚨 Troubleshooting

### 🔧 Problemas Comunes
1. **Build falla:** Verificar dependencias y configuración
2. **Tests fallan:** Verificar configuración de testing
3. **Performance issues:** Usar scripts de optimización
4. **Deployment issues:** Verificar configuración de Docker

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

## 🔗 Enlaces Útiles

### 📚 Documentación Externa
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide/)

### 🛠️ Herramientas
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo Frontend  
**Estado:** ✅ Organizado y Documentado 