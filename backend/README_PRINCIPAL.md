# Backend - Sistema de Gestión Legal

## 📁 Ubicación
**Carpeta:** `experimento/backend/`

## 📚 Documentación
**Toda la documentación está organizada en:** `documentacion/`

👉 **[Ver Documentación Completa](./documentacion/README.md)**

## 🚀 Archivos Principales

### 🏗️ Código Fuente
- **[src/](./src/)** - Código fuente del backend (NestJS)
- **[prisma/](./prisma/)** - Base de datos y migraciones

### 📚 Documentación
- **[documentacion/](./documentacion/)** - Carpeta con toda la documentación
- **[documentacion/README.md](./documentacion/README.md)** - Índice principal de documentación
- **[documentacion/TESTING_DOCUMENTATION.md](./documentacion/TESTING_DOCUMENTATION.md)** - Guía completa de testing
- **[documentacion/INTEGRATION_GUIDE.md](./documentacion/INTEGRATION_GUIDE.md)** - Guía de integración y APIs
- **[documentacion/FACTURAE_README.md](./documentacion/FACTURAE_README.md)** - Documentación de facturación electrónica

### ⚙️ Configuración
- **[config/](./config/)** - Carpeta con archivos de configuración
- **[config/README.md](./config/README.md)** - Guía de configuración
- **[config/env.example](./config/env.example)** - Variables de entorno
- **[config/tsconfig.json](./config/tsconfig.json)** - Configuración TypeScript

### 🚀 Despliegue
- **[deployment/](./deployment/)** - Carpeta con archivos de despliegue
- **[deployment/README.md](./deployment/README.md)** - Guía de despliegue
- **[deployment/package.json](./deployment/package.json)** - Dependencias y scripts
- **[deployment/Dockerfile](./deployment/Dockerfile)** - Configuración de Docker

### 🧪 Testing
- **[testing/](./testing/)** - Carpeta con configuración de testing
- **[testing/README.md](./testing/README.md)** - Guía de testing
- **[testing/jest.setup.ts](./testing/jest.setup.ts)** - Configuración de Jest

### 🔧 Scripts
- **[scripts/](./scripts/)** - Carpeta con scripts de utilidad
- **[scripts/README.md](./scripts/README.md)** - Guía de scripts

## 🎯 Estado Actual

### ✅ Funcionando
- Backend NestJS con TypeScript
- Base de datos PostgreSQL con Prisma
- Sistema de autenticación JWT
- APIs RESTful completas
- Sistema de facturación electrónica
- Integración con chatbot

### 🔄 En Desarrollo
- Mejoras en testing
- Optimización de rendimiento
- Nuevas funcionalidades
- Documentación adicional

## 🚀 Inicio Rápido

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
```bash
cp config/env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Aplicar migraciones
npx prisma migrate dev

# Ejecutar seed (opcional)
npx ts-node prisma/seed.ts
```

### 4. Ejecutar Backend
```bash
# Desarrollo
npm run start:dev

# Producción
npm run start:prod
```

### 5. Ejecutar Tests
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:e2e
```

## 📋 Scripts de Utilidad

### Inicialización
```bash
# Inicializar configuraciones
npx ts-node scripts/initialize-configs.ts

# Inicializar parámetros
npx ts-node scripts/initializeParams.ts

# Inicializar parámetros del chatbot
npx ts-node scripts/initialize-chatbot-params.ts
```

### Gestión de Usuarios
```bash
# Crear perfiles de cliente
npx ts-node scripts/createClientProfile.ts

# Crear perfiles para usuarios existentes
npx ts-node scripts/createProfilesForExistingUsers.ts
```

### Mantenimiento
```bash
# Corregir contraseñas
npx ts-node scripts/fixPlainPasswords.ts

# Limpiar archivos subidos
node scripts/cleanup-uploads.js
```

## 🔧 Herramientas de Desarrollo

### Base de Datos
- **Prisma Studio:** `npx prisma studio`
- **Migraciones:** `npx prisma migrate dev`
- **Seed:** `npx ts-node prisma/seed.ts`
- **Validación:** `npx prisma validate`

### Testing
- **Tests unitarios:** `npm run test`
- **Tests e2e:** `npm run test:e2e`
- **Cobertura:** `npm run test:cov`
- **Watch mode:** `npm run test:watch`

### Build y Despliegue
- **Build:** `npm run build`
- **Docker:** `docker build -f deployment/Dockerfile -t backend .`
- **PM2:** `pm2 start deployment/package.json`

## 📊 Estructura de Carpetas

```
backend/
├── 📚 documentacion/           # Documentación técnica
├── ⚙️ config/                  # Archivos de configuración
├── 🚀 deployment/              # Archivos de despliegue
├── 🧪 testing/                 # Configuración de testing
├── 🔧 scripts/                 # Scripts de utilidad
├── 🏗️ src/                     # Código fuente (NestJS)
├── 🗄️ prisma/                  # Base de datos y migraciones
├── 📦 node_modules/            # Dependencias
├── 📄 README.md                # README original
└── 📄 README_PRINCIPAL.md      # README principal organizado
```

## 🔗 Enlaces Útiles

### Documentación
- **[Documentación Completa](./documentacion/README.md)**
- **[Guía de Testing](./documentacion/TESTING_DOCUMENTATION.md)**
- **[Guía de Integración](./documentacion/INTEGRATION_GUIDE.md)**
- **[Facturación Electrónica](./documentacion/FACTURAE_README.md)**

### Configuración
- **[Guía de Configuración](./config/README.md)**
- **[Guía de Despliegue](./deployment/README.md)**
- **[Guía de Testing](./testing/README.md)**
- **[Guía de Scripts](./scripts/README.md)**

## 📞 Soporte

Para consultas sobre el backend:
1. Revisar la **[documentación](./documentacion/)**
2. Ejecutar **[tests](./testing/)**
3. Verificar **[configuración](./config/)**
4. Consultar **[scripts de utilidad](./scripts/)**

## 🔄 Prisma ORM - Operaciones Principales

### Configuración Inicial
```bash
# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Validar esquema
npx prisma validate
```

### Migraciones
```bash
# Crear migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones (producción)
npx prisma migrate deploy

# Ver estado
npx prisma migrate status
```

### Base de Datos
```bash
# Acceder a Prisma Studio
npx prisma studio

# Sincronizar schema
npx prisma db pull

# Ejecutar seed
npx ts-node prisma/seed.ts
```

---

**Versión:** NestJS con TypeScript  
**Base de Datos:** PostgreSQL con Prisma  
**Última actualización:** Diciembre 2024  
**Estado:** Organizado y documentado 