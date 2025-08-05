# Despliegue en Railway - Sistema de Gestión Legal

## 🚀 Guía de Despliegue

### Paso 1: Preparar el Repositorio

1. **Asegúrate de que todos los cambios estén en GitHub:**
   ```bash
   git add .
   git commit -m "feat: prepare for Railway deployment"
   git push origin main
   ```

### Paso 2: Configurar Railway

1. **Ve a [Railway.app](https://railway.app)**
2. **Inicia sesión con tu cuenta de GitHub**
3. **Crea un nuevo proyecto**
4. **Selecciona "Deploy from GitHub repo"**
5. **Conecta tu repositorio: `gracobjo/experimento2`**

### Paso 3: Configurar la Base de Datos

1. **En tu proyecto de Railway, ve a "New Service"**
2. **Selecciona "Database" → "PostgreSQL"**
3. **Railway creará automáticamente una base de datos PostgreSQL**

### Paso 4: Configurar Variables de Entorno

En tu servicio principal, ve a "Variables" y configura:

```env
# Database (Railway generará automáticamente DATABASE_URL)
DATABASE_URL="postgresql://..."

# JWT Configuration
JWT_SECRET="tu-clave-super-secreta-cambiala-en-produccion"
JWT_EXPIRES_IN="24h"

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS Configuration
CORS_ORIGIN="*"

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DEST="./uploads"

# Email Configuration (opcional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-contraseña-de-aplicacion"

# Facturae Configuration (opcional)
FACTURAE_CERT_PATH=""
FACTURAE_CERT_PASSWORD=""

# External Systems (opcional)
EXTERNAL_SYSTEM_URL=""
EXTERNAL_SYSTEM_API_KEY=""

# Chat Configuration (opcional)
CHAT_OPENAI_API_KEY=""
```

### Paso 5: Ejecutar Migraciones

1. **Ve a la pestaña "Deployments"**
2. **Haz clic en el último deployment**
3. **Ve a "Logs"**
4. **Ejecuta las migraciones manualmente:**

```bash
npx prisma migrate deploy
npx prisma generate
```

### Paso 6: Verificar el Despliegue

1. **Railway te dará una URL automática**
2. **Prueba el endpoint de health: `https://tu-app.railway.app/health`**
3. **Deberías ver: `{"status":"ok","timestamp":"..."}`**

### Paso 7: Configurar Dominio Personalizado (Opcional)

1. **Ve a "Settings" → "Domains"**
2. **Agrega tu dominio personalizado**
3. **Configura los registros DNS según las instrucciones**

## 🔧 Configuración del Frontend

Para el frontend, puedes usar:

### Opción A: Vercel (Recomendado)
1. **Ve a [Vercel.com](https://vercel.com)**
2. **Conecta tu repositorio de GitHub**
3. **Configura el directorio: `frontend`**
4. **Agrega las variables de entorno:**
   ```
   VITE_API_URL=https://tu-backend.railway.app
   ```

### Opción B: Netlify
1. **Ve a [Netlify.com](https://netlify.com)**
2. **Conecta tu repositorio**
3. **Configura el directorio: `frontend`**
4. **Agrega las variables de entorno**

## 📊 Monitoreo

- **Railway Dashboard**: Monitorea logs, métricas y deployments
- **Health Checks**: Automáticos en `/health`
- **Logs**: Accesibles desde el dashboard de Railway

## 🔒 Seguridad

- **HTTPS**: Automático en Railway
- **Variables de Entorno**: Configuradas en Railway Dashboard
- **CORS**: Configurado para permitir tu frontend
- **JWT**: Usa una clave secreta fuerte

## 🚨 Troubleshooting

### Error de Base de Datos
```bash
# Verifica la conexión
npx prisma db push
```

### Error de Build
```bash
# Verifica los logs en Railway
# Asegúrate de que todas las dependencias estén en package.json
```

### Error de CORS
```bash
# Verifica CORS_ORIGIN en las variables de entorno
# Debe incluir la URL de tu frontend
```

## 📞 Soporte

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Discord**: Railway tiene un servidor de Discord activo
- **GitHub Issues**: Para problemas específicos del código

## 🎯 Próximos Pasos

1. **Desplegar el frontend en Vercel**
2. **Configurar dominio personalizado**
3. **Configurar CI/CD automático**
4. **Implementar monitoreo avanzado**
5. **Configurar backups automáticos de la base de datos** 