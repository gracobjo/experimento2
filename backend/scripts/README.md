# Scripts de Utilidad del Backend

## 📁 Ubicación
**Carpeta:** `experimento/backend/scripts/`

## 🎯 Propósito
Esta carpeta contiene scripts de utilidad para el manejo y administración del backend del sistema de gestión legal.

## 📋 Scripts Disponibles

### 🔧 Inicialización y Configuración
- **[initialize-configs.ts](./initialize-configs.ts)** - Script de inicialización de configuraciones
  - Configuración inicial del sistema
  - Creación de parámetros por defecto
  - Configuración de roles y permisos
  - Inicialización de datos base

- **[initializeParams.ts](./initializeParams.ts)** - Script de inicialización de parámetros
  - Parámetros del sistema
  - Configuración de facturación
  - Parámetros de email
  - Configuración de notificaciones

- **[initialize-chatbot-params.ts](./initialize-chatbot-params.ts)** - Script de parámetros del chatbot
  - Configuración específica del chatbot
  - Parámetros de integración
  - Configuración de respuestas
  - Parámetros de personalización

### 👥 Gestión de Usuarios
- **[createClientProfile.ts](./createClientProfile.ts)** - Script para crear perfiles de cliente
  - Creación de perfiles de usuario
  - Configuración de roles
  - Asignación de permisos
  - Configuración inicial

- **[createProfilesForExistingUsers.ts](./createProfilesForExistingUsers.ts)** - Script para crear perfiles para usuarios existentes
  - Migración de usuarios existentes
  - Creación de perfiles faltantes
  - Actualización de datos
  - Verificación de integridad

### 🔐 Seguridad
- **[fixPlainPasswords.ts](./fixPlainPasswords.ts)** - Script para corregir contraseñas en texto plano
  - Encriptación de contraseñas
  - Migración de datos
  - Verificación de seguridad
  - Actualización de usuarios

### 🧹 Limpieza y Mantenimiento
- **[cleanup-uploads.js](./cleanup-uploads.js)** - Script de limpieza de archivos subidos
  - Limpieza de archivos temporales
  - Eliminación de archivos obsoletos
  - Optimización de almacenamiento
  - Mantenimiento del sistema

### 📊 Datos y Seed
- **[extraSeed.ts](./extraSeed.ts)** - Script de datos adicionales
  - Datos de prueba adicionales
  - Configuración de entornos
  - Datos de demostración
  - Configuración de desarrollo

### 🧪 Testing
- **[test-xades-methods.js](./test-xades-methods.js)** - Script de prueba de métodos XAdES
  - Pruebas de firma digital
  - Verificación de certificados
  - Testing de facturación electrónica
  - Validación de métodos

## 🚀 Cómo Usar

### Inicialización del Sistema
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
# Crear perfil de cliente
npx ts-node scripts/createClientProfile.ts

# Crear perfiles para usuarios existentes
npx ts-node scripts/createProfilesForExistingUsers.ts
```

### Seguridad
```bash
# Corregir contraseñas
npx ts-node scripts/fixPlainPasswords.ts
```

### Limpieza
```bash
# Limpiar archivos subidos
node scripts/cleanup-uploads.js
```

### Datos Adicionales
```bash
# Ejecutar seed adicional
npx ts-node scripts/extraSeed.ts
```

### Testing
```bash
# Probar métodos XAdES
node scripts/test-xades-methods.js
```

## 📝 Detalles de los Scripts

### initialize-configs.ts
```typescript
// Script de inicialización de configuraciones
// Configura parámetros iniciales del sistema
// Crea roles y permisos por defecto
// Inicializa datos base necesarios
```

**Funcionalidades:**
- Configuración inicial del sistema
- Creación de roles y permisos
- Inicialización de datos base
- Configuración de parámetros

### createClientProfile.ts
```typescript
// Script para crear perfiles de cliente
// Crea perfiles de usuario con roles específicos
// Configura permisos y accesos
// Inicializa datos del cliente
```

**Funcionalidades:**
- Creación de perfiles de usuario
- Configuración de roles
- Asignación de permisos
- Configuración inicial

### fixPlainPasswords.ts
```typescript
// Script para corregir contraseñas
// Encripta contraseñas en texto plano
// Migra datos de usuarios
// Verifica seguridad
```

**Funcionalidades:**
- Encriptación de contraseñas
- Migración de datos
- Verificación de seguridad
- Actualización de usuarios

## 🔧 Configuración

### Para Scripts TypeScript
- Verificar configuración de TypeScript
- Instalar dependencias necesarias
- Configurar variables de entorno
- Verificar conexión a base de datos

### Para Scripts JavaScript
- Verificar Node.js instalado
- Instalar dependencias necesarias
- Configurar variables de entorno
- Verificar permisos de ejecución

## 📊 Casos de Uso

### Inicialización del Sistema
1. **Primera instalación:** Ejecutar scripts de inicialización
2. **Configuración de entorno:** Establecer parámetros base
3. **Configuración de roles:** Crear roles y permisos
4. **Datos iniciales:** Cargar datos necesarios

### Mantenimiento
1. **Limpieza regular:** Ejecutar scripts de limpieza
2. **Actualización de seguridad:** Corregir contraseñas
3. **Migración de datos:** Actualizar usuarios existentes
4. **Verificación de integridad:** Validar datos

### Testing y Desarrollo
1. **Datos de prueba:** Cargar datos adicionales
2. **Pruebas de funcionalidad:** Verificar métodos
3. **Configuración de desarrollo:** Establecer entorno
4. **Validación de certificados:** Probar firma digital

## 🔍 Monitoreo y Logs

### Logs de Scripts
- Verificar salida de scripts
- Revisar errores y advertencias
- Confirmar ejecución exitosa
- Documentar resultados

### Verificación de Resultados
- Verificar cambios en base de datos
- Confirmar creación de archivos
- Validar configuración aplicada
- Probar funcionalidad

## 🛠️ Mantenimiento

### Actualización de Scripts
- Revisar cambios en dependencias
- Actualizar scripts según necesidades
- Probar en entorno de desarrollo
- Documentar modificaciones

### Backup de Scripts
- Mantener copias de seguridad
- Versionar cambios importantes
- Documentar modificaciones
- Probar antes de producción

## 📋 Checklist de Uso

### Antes de Ejecutar Scripts
- [ ] Verificar configuración de entorno
- [ ] Hacer backup de datos si es necesario
- [ ] Confirmar permisos de ejecución
- [ ] Verificar dependencias instaladas

### Durante la Ejecución
- [ ] Monitorear salida de scripts
- [ ] Verificar logs de errores
- [ ] Confirmar cambios aplicados
- [ ] Documentar resultados

### Después de la Ejecución
- [ ] Verificar resultados esperados
- [ ] Probar funcionalidad afectada
- [ ] Documentar cambios realizados
- [ ] Actualizar documentación si es necesario

---

**Última actualización:** Diciembre 2024  
**Total scripts:** 9 scripts de utilidad  
**Estado:** Organizados y documentados 