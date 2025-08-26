# 🚂 Configuración de Variables de Entorno en Railway

## 📋 **Variables Críticas para Subida de Documentos**

### **🔧 Variables Requeridas:**

```env
# Configuración de Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@host:puerto/database

# Configuración de JWT
JWT_SECRET=tu-clave-super-secreta
JWT_EXPIRES_IN=24h

# Configuración del Servidor
NODE_ENV=production
PORT=3000

# Configuración de Archivos
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# Configuración de CORS
CORS_ORIGIN=*

# Configuración de Logging (NUEVA)
LOG_LEVEL=error

# Configuración de Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=1000

# Configuración de Compresión
ENABLE_COMPRESSION=true
COMPRESSION_LEVEL=6

# Configuración de Seguridad
HELMET_ENABLED=true
TRUST_PROXY=true
```

## 🚀 **Configuración en Railway Dashboard:**

### **Paso 1: Acceder a Variables de Entorno**
1. Ve a [railway.app](https://railway.app)
2. Selecciona tu proyecto
3. Ve a tu servicio principal
4. Haz clic en "Variables"

### **Paso 2: Agregar Variables Críticas**
Agrega estas variables una por una:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `NODE_ENV` | `production` | Entorno de producción |
| `MAX_FILE_SIZE` | `10485760` | Tamaño máximo de archivo (10MB) |
| `UPLOAD_DEST` | `./uploads` | Directorio de uploads |
| `LOG_LEVEL` | `error` | Solo logs de error |

### **Paso 3: Verificar Variables Existentes**
Asegúrate de que estas variables ya estén configuradas:
- ✅ `DATABASE_URL`
- ✅ `JWT_SECRET`
- ✅ `PORT`

## 🔍 **Verificación de Configuración:**

### **Script de Verificación:**
```bash
# En Railway
railway run node scripts/debug-document-upload.js
```

### **Resultado Esperado:**
```
✅ Variables de entorno: ✅
✅ Tabla Document: ✅
✅ Expedientes: ✅
✅ Usuarios: ✅
✅ Directorio uploads: ✅
✅ Simulación de subida: ✅
```

## 🚨 **Problemas Comunes y Soluciones:**

### **Problema: "MAX_FILE_SIZE is not defined"**
**Solución:**
```env
MAX_FILE_SIZE=10485760
```

### **Problema: "UPLOAD_DEST is not defined"**
**Solución:**
```env
UPLOAD_DEST=./uploads
```

### **Problema: "NODE_ENV is not defined"**
**Solución:**
```env
NODE_ENV=production
```

### **Problema: Logs excesivos de token**
**Solución:**
```env
LOG_LEVEL=error
```

## 📊 **Configuración Recomendada para Producción:**

### **Variables de Logging:**
```env
LOG_LEVEL=error
NODE_ENV=production
```

### **Variables de Archivos:**
```env
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
```

### **Variables de Seguridad:**
```env
TRUST_PROXY=true
HELMET_ENABLED=true
```

## 🔄 **Después de Configurar Variables:**

### **Paso 1: Reiniciar Servicio**
1. Ve a "Deployments" en Railway
2. Haz clic en "Redeploy"
3. Monitorea los logs

### **Paso 2: Verificar Funcionamiento**
```bash
# Health check
curl https://tu-app.railway.app/health

# Probar subida de documento
# Debería funcionar sin error 500
```

### **Paso 3: Verificar Logs**
Los logs deberían mostrar:
- ✅ Sin errores de variables faltantes
- ✅ Subida de documentos funcionando
- ✅ Logs reducidos (solo errores)

## 🎯 **Checklist de Verificación:**

- [ ] ✅ `NODE_ENV=production`
- [ ] ✅ `MAX_FILE_SIZE=10485760`
- [ ] ✅ `UPLOAD_DEST=./uploads`
- [ ] ✅ `LOG_LEVEL=error`
- [ ] ✅ `DATABASE_URL` configurado
- [ ] ✅ `JWT_SECRET` configurado
- [ ] ✅ Servicio reiniciado en Railway
- [ ] ✅ Subida de documentos funcionando
- [ ] ✅ Logs reducidos

## 💡 **Consejos Adicionales:**

1. **Tamaño de archivo**: 10MB es suficiente para la mayoría de documentos legales
2. **Logging**: En producción, solo logs de error para reducir ruido
3. **Seguridad**: `TRUST_PROXY=true` para Railway
4. **CORS**: Configurar para tu frontend específico

---

**⚠️ Importante**: Después de configurar las variables, SIEMPRE reinicia el servicio en Railway para que los cambios surtan efecto.

