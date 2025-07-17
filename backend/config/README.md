# Configuración del Backend

## 📁 Ubicación
**Carpeta:** `experimento/backend/config/`

## 🎯 Propósito
Esta carpeta contiene todos los archivos de configuración del backend del sistema de gestión legal.

## 📋 Archivos de Configuración

### 🔧 Variables de Entorno
- **[env.example](./env.example)** - Plantilla de variables de entorno
  - Configuración de base de datos
  - Credenciales de servicios
  - Configuración de JWT
  - Parámetros del sistema
  - Configuración de email
  - Configuración de Facturae

### ⚙️ TypeScript
- **[tsconfig.json](./tsconfig.json)** - Configuración de TypeScript
  - Configuración del compilador
  - Opciones de compilación
  - Rutas de archivos
  - Configuración de módulos
  - Opciones de debugging

## 🚀 Cómo Usar

### Configuración Inicial
```bash
# Copiar archivo de ejemplo
cp config/env.example .env

# Editar configuración
nano .env
```

### Configuración de TypeScript
```bash
# Verificar configuración
npx tsc --noEmit

# Compilar proyecto
npx tsc
```

## 📝 Notas de Configuración

### Variables de Entorno (env.example)
- **DATABASE_URL** - URL de conexión a la base de datos PostgreSQL
- **JWT_SECRET** - Clave secreta para JWT
- **JWT_EXPIRES_IN** - Tiempo de expiración de JWT
- **EMAIL_HOST** - Servidor de email
- **EMAIL_PORT** - Puerto del servidor de email
- **EMAIL_USER** - Usuario de email
- **EMAIL_PASS** - Contraseña de email
- **FACTURAE_CERT_PATH** - Ruta al certificado digital
- **FACTURAE_KEY_PATH** - Ruta a la clave privada
- **FACTURAE_PASSWORD** - Contraseña del certificado

### Configuración TypeScript (tsconfig.json)
- **target** - Versión de JavaScript objetivo
- **module** - Sistema de módulos
- **strict** - Modo estricto habilitado
- **esModuleInterop** - Interoperabilidad de módulos
- **skipLibCheck** - Omitir verificación de librerías
- **forceConsistentCasingInFileNames** - Consistencia en nombres de archivos

## 🔧 Personalización

### Para Diferentes Entornos
1. **Desarrollo:** Usar configuración básica
2. **Testing:** Configuración específica para pruebas
3. **Producción:** Configuración optimizada y segura

### Para Diferentes Servicios
1. **Base de datos:** Configurar en `.env`
2. **Email:** Configurar en `.env`
3. **JWT:** Configurar en `.env`
4. **Facturae:** Configurar en `.env`

## 📊 Estado de Configuración

### ✅ Configurado
- Variables de entorno básicas
- Configuración TypeScript optimizada
- Configuración para diferentes entornos

### 🔄 Configurable
- Parámetros específicos del entorno
- Configuración de servicios externos
- Optimización de rendimiento

## 🔍 Verificación de Configuración

### Verificar Variables de Entorno
```bash
# Verificar que .env existe
ls -la .env

# Verificar variables requeridas
node -e "require('dotenv').config(); console.log('Config loaded:', process.env.DATABASE_URL ? 'OK' : 'MISSING')"
```

### Verificar TypeScript
```bash
# Verificar configuración
npx tsc --noEmit

# Verificar tipos
npx tsc --noEmit --strict
```

## 🛠️ Mantenimiento

### Actualización de Configuración
- Revisar cambios en dependencias
- Actualizar configuración TypeScript según necesidades
- Mantener variables de entorno actualizadas

### Backup de Configuración
```bash
# Backup de configuración
cp config/env.example config/env.backup.$(date +%Y%m%d)

# Backup de TypeScript
cp config/tsconfig.json config/tsconfig.backup.$(date +%Y%m%d)
```

## 📋 Checklist de Configuración

### Antes de Iniciar Desarrollo
- [ ] Copiar `env.example` a `.env`
- [ ] Configurar variables de entorno
- [ ] Verificar configuración TypeScript
- [ ] Probar conexión a base de datos
- [ ] Verificar configuración de email

### Antes de Despliegue
- [ ] Verificar variables de producción
- [ ] Configurar certificados de Facturae
- [ ] Optimizar configuración TypeScript
- [ ] Verificar seguridad de configuración

---

**Última actualización:** Diciembre 2024  
**Total archivos:** 2 archivos de configuración  
**Estado:** Organizados y documentados 