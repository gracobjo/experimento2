# 🚀 Configuración Rápida de Railway

## ⚠️ ERROR ACTUAL: JWT_SECRET no configurado

El error `JwtStrategy requires a secret or key` indica que falta configurar las variables de entorno.

## 🔧 Pasos para Solucionar:

### 1. Ir a Railway Dashboard
- Ve a [railway.app](https://railway.app)
- Selecciona tu proyecto
- Haz clic en tu servicio principal

### 2. Configurar Variables de Entorno
Ve a la pestaña **"Variables"** y agrega:

```env
# OBLIGATORIO - JWT Secret
JWT_SECRET=tu-clave-super-secreta-cambiala-en-produccion

# OBLIGATORIO - JWT Expiration
JWT_EXPIRES_IN=24h

# OBLIGATORIO - Server Port
PORT=3000

# OBLIGATORIO - Environment
NODE_ENV=production

# OPCIONAL - CORS (permite todos los orígenes)
CORS_ORIGIN=*

# OPCIONAL - File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# OPCIONAL - Email (si usas email)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

### 3. Verificar Base de Datos
- Railway debería haber configurado `DATABASE_URL` automáticamente
- Si no está, ve a "New Service" → "Database" → "PostgreSQL"

### 4. Redeploy
- Ve a "Deployments"
- Haz clic en "Redeploy"

## ✅ Verificación

Una vez configurado, deberías ver en los logs:
```
✅ Variables de entorno verificadas
🔐 JWT_SECRET: tu-clave-su...
🗄️ DATABASE_URL: postgresql://...
```

## 🔗 URLs de Prueba

- **Health Check**: `https://tu-app.railway.app/health`
- **API Principal**: `https://tu-app.railway.app/`
- **Swagger Docs**: `https://tu-app.railway.app/api/docs`

## 🚨 Troubleshooting

### Error: "JwtStrategy requires a secret or key"
- **Solución**: Configura `JWT_SECRET` en las variables de entorno

### Error: "Database connection failed"
- **Solución**: Verifica que `DATABASE_URL` esté configurado

### Error: "Health check failed"
- **Solución**: Espera 2-3 minutos para que la app se inicialice completamente 