# 🏠 Configuración de Variables de Entorno para Almacenamiento Local en Railway

## 🎯 **OBJETIVO**
Configurar Railway para usar **almacenamiento local** en lugar de Cloudinary, eliminando todas las dependencias externas.

## 🔧 **VARIABLES OBLIGATORIAS**

### **1. Variables de Base de Datos**
```env
DATABASE_URL=postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway
```

### **2. Variables de Autenticación**
```env
JWT_SECRET=tu-clave-super-secreta-aqui
```

### **3. Variables de Entorno de Node**
```env
NODE_ENV=production
PORT=3000
```

## 📁 **VARIABLES PARA ALMACENAMIENTO LOCAL**

### **4. Configuración de Archivos**
```env
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
```

### **5. Configuración de URLs (Opcional)**
```env
BASE_URL=https://experimento2-production-54c0.up.railway.app
```

## 🚫 **VARIABLES A ELIMINAR (CLOUDINARY)**

**NO configurar estas variables:**
- ❌ `CLOUDINARY_CLOUD_NAME`
- ❌ `CLOUDINARY_API_KEY`
- ❌ `CLOUDINARY_API_SECRET`

## 📋 **PASOS PARA CONFIGURAR EN RAILWAY**

### **PASO 1: Ir al Dashboard de Railway**
1. Ve a [railway.app](https://railway.app)
2. Selecciona tu proyecto `experimento2`
3. Ve a la pestaña **Variables**

### **PASO 2: Configurar Variables Básicas**
```env
DATABASE_URL=postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway
JWT_SECRET=tu-clave-super-secreta-aqui
NODE_ENV=production
PORT=3000
```

### **PASO 3: Configurar Variables de Almacenamiento**
```env
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads
```

### **PASO 4: Eliminar Variables de Cloudinary**
- Busca y elimina cualquier variable que contenga `CLOUDINARY`
- Esto incluye:
  - `CLOUDINARY_CLOUD_NAME`
  - `CLOUDINARY_API_KEY`
  - `CLOUDINARY_API_SECRET`

### **PASO 5: Verificar Configuración**
Tu configuración final debe verse así:

```env
# Base de datos
DATABASE_URL=postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway

# Autenticación
JWT_SECRET=tu-clave-super-secreta-aqui

# Entorno
NODE_ENV=production
PORT=3000

# Almacenamiento local
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# URL base (opcional)
BASE_URL=https://experimento2-production-54c0.up.railway.app
```

## 🔍 **VERIFICACIÓN DE CONFIGURACIÓN**

### **1. Health Check del Almacenamiento**
```bash
curl https://experimento2-production-54c0.up.railway.app/api/documents/health/storage
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "storageType": "local",
  "uploadPath": "./uploads",
  "uploadPathExists": true,
  "maxFileSize": 10485760,
  "allowedMimeTypes": ["application/pdf", "image/jpeg", ...],
  "directories": {
    "documents": "documents",
    "temp": "temp",
    "backup": "backup"
  }
}
```

### **2. Test Simple del Controlador**
```bash
curl https://experimento2-production-54c0.up.railway.app/api/documents/test-simple
```

**Respuesta esperada:**
```json
{
  "message": "Documents controller funcionando correctamente",
  "timestamp": "2025-08-25T...",
  "status": "ok"
}
```

## ⚠️ **PROBLEMAS COMUNES Y SOLUCIONES**

### **Problema 1: Error 500 en todos los endpoints**
**Causa:** Variables de entorno faltantes o incorrectas
**Solución:** Verificar que todas las variables obligatorias estén configuradas

### **Problema 2: Error de permisos en directorio uploads**
**Causa:** Railway no puede crear el directorio de uploads
**Solución:** El directorio se crea automáticamente, verificar logs

### **Problema 3: Archivos no se suben**
**Causa:** `MAX_FILE_SIZE` muy pequeño o `UPLOAD_DEST` incorrecto
**Solución:** Verificar valores de estas variables

## 🎯 **RESULTADO ESPERADO**

Después de configurar estas variables:

1. ✅ **Los endpoints de documentos funcionarán** sin errores 500
2. ✅ **Los archivos se almacenarán localmente** en el servidor
3. ✅ **No habrá dependencias de Cloudinary**
4. ✅ **Los documentos se podrán subir, ver y eliminar** correctamente

## 🔄 **DESPUÉS DE LA CONFIGURACIÓN**

1. **Reiniciar el servicio** en Railway
2. **Probar subir un documento** desde el frontend
3. **Verificar que se pueda visualizar** el documento
4. **Comprobar que se pueda eliminar** el documento

## 📞 **SOPORTE**

Si persisten los problemas después de esta configuración:

1. Revisar **logs de Railway** para errores específicos
2. Verificar que **no haya variables de Cloudinary** configuradas
3. Comprobar que **todas las variables obligatorias** estén presentes
4. Ejecutar el **health check** del almacenamiento



