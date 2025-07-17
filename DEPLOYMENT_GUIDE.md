# 🚀 Guía Completa de Despliegue - Sistema Legal Experimento

Esta guía te ayudará a desplegar los tres componentes de la aplicación en plataformas gratuitas.

## 📋 Componentes

1. **Frontend** (React + Vite) - Interfaz de usuario
2. **Backend** (NestJS + PostgreSQL) - API y base de datos
3. **Chatbot** (FastAPI + Python) - Asistente virtual

## 🎯 Orden de Despliegue

**IMPORTANTE**: Desplegar en este orden para evitar errores de configuración:

1. **Backend** (incluye base de datos)
2. **Chatbot**
3. **Frontend**

## 📦 Plataformas Recomendadas

### Backend + Base de Datos
- **Render** (Recomendado) - PostgreSQL gratuito incluido
- **Railway** - PostgreSQL gratuito incluido
- **Heroku** - PostgreSQL gratuito (limitado)

### Chatbot
- **Render** - Soporte nativo para Python
- **Railway** - Despliegue rápido
- **Heroku** - Soporte estable

### Frontend
- **Vercel** (Recomendado) - Optimizado para React
- **Netlify** - Excelente para sitios estáticos
- **Render** - Static Sites gratuitos

## 🔧 Preparación

### 1. Preparar Repositorios

Cada componente debe estar en su propio repositorio:

```bash
# Crear repositorios separados
git clone https://github.com/tu-usuario/experimento-backend.git
git clone https://github.com/tu-usuario/experimento-chatbot.git
git clone https://github.com/tu-usuario/experimento-frontend.git
```

### 2. Variables de Entorno

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="tu_clave_secreta_muy_larga_y_segura"
JWT_EXPIRES_IN="24h"
FRONTEND_URL="https://tu-frontend.vercel.app"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASS="tu-contraseña-de-aplicación"
UPLOAD_PATH="./uploads"
```

#### Chatbot (.env)
```env
HF_API_TOKEN="tu_token_de_huggingface_opcional"
FRONTEND_URL="https://tu-frontend.vercel.app"
```

#### Frontend (.env)
```env
VITE_API_URL="https://tu-backend.onrender.com"
VITE_CHATBOT_URL="https://tu-chatbot.onrender.com"
```

## 🚀 Despliegue Paso a Paso

### Paso 1: Desplegar Backend en Render

1. **Crear cuenta en Render**: https://render.com
2. **Conectar repositorio** `experimento-backend`
3. **Crear base de datos PostgreSQL**:
   - Name: `experimento-postgres`
   - Database: `experimento_db`
   - User: `experimento_user`
4. **Crear Web Service**:
   - Name: `experimento-backend`
   - Environment: `Node`
   - Build Command: `npm ci && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`
5. **Configurar variables de entorno**:
   - `DATABASE_URL`: Se configura automáticamente
   - `JWT_SECRET`: Generar con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `FRONTEND_URL`: URL del frontend (configurar después)
   - Variables de email (opcional)

### Paso 2: Desplegar Chatbot en Render

1. **Conectar repositorio** `experimento-chatbot`
2. **Crear Web Service**:
   - Name: `experimento-chatbot`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt && python -m spacy download es_core_news_sm && python -m spacy download en_core_web_sm && python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"`
   - Start Command: `uvicorn main_improved:app --host 0.0.0.0 --port $PORT`
3. **Configurar variables de entorno**:
   - `FRONTEND_URL`: URL del frontend (configurar después)

### Paso 3: Desplegar Frontend en Vercel

1. **Crear cuenta en Vercel**: https://vercel.com
2. **Conectar repositorio** `experimento-frontend`
3. **Configurar proyecto**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Configurar variables de entorno**:
   - `VITE_API_URL`: URL del backend de Render
   - `VITE_CHATBOT_URL`: URL del chatbot de Render

### Paso 4: Actualizar URLs

Una vez desplegados todos los componentes, actualizar las URLs en cada servicio:

1. **Backend**: Actualizar `FRONTEND_URL` con la URL de Vercel
2. **Chatbot**: Actualizar `FRONTEND_URL` con la URL de Vercel
3. **Frontend**: Verificar que las URLs del backend y chatbot sean correctas

## 🔍 Verificación

### Backend
- ✅ Health Check: `https://tu-backend.onrender.com/health`
- ✅ API Docs: `https://tu-backend.onrender.com/api`
- ✅ Base de datos conectada

### Chatbot
- ✅ Health Check: `https://tu-chatbot.onrender.com/health`
- ✅ API Docs: `https://tu-chatbot.onrender.com/docs`
- ✅ WebSocket: `wss://tu-chatbot.onrender.com/ws`

### Frontend
- ✅ Página principal carga
- ✅ Login/registro funciona
- ✅ Chatbot se conecta
- ✅ API calls funcionan

## 🛠️ Troubleshooting Común

### Error: CORS
```bash
# Verificar que las URLs estén correctas en el backend
FRONTEND_URL=https://tu-frontend.vercel.app
```

### Error: Base de datos no conecta
```bash
# Verificar DATABASE_URL en Render
# Ejecutar migraciones manualmente si es necesario
npx prisma migrate deploy
```

### Error: Variables de entorno no cargan
```bash
# Frontend: Verificar que empiecen con VITE_
VITE_API_URL=https://tu-backend.onrender.com

# Backend: Verificar que no empiecen con VITE_
DATABASE_URL=postgresql://...
```

### Error: Build falla
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoreo

### Logs
- **Render**: Dashboard → Services → Logs
- **Vercel**: Dashboard → Functions → Logs

### Métricas
- **Uptime**: Verificar endpoints de health
- **Performance**: Lighthouse scores
- **Errores**: Revisar logs regularmente

## 🔒 Seguridad

### Variables Sensibles
- ✅ `JWT_SECRET`: Clave de 64+ caracteres
- ✅ `DATABASE_URL`: No compartir públicamente
- ✅ `EMAIL_PASS`: Contraseña de aplicación

### Headers de Seguridad
- ✅ CORS configurado correctamente
- ✅ HTTPS forzado en producción
- ✅ Headers de seguridad automáticos

## 💰 Costos

### Planes Gratuitos

**Render**:
- Backend: 750 horas/mes
- Base de datos: 1GB, 5 conexiones
- Chatbot: 750 horas/mes

**Vercel**:
- Frontend: 100GB bandwidth/mes
- Builds: 6000 minutos/mes

**Total**: $0/mes (dentro de límites gratuitos)

## 📞 Soporte

### Documentación Detallada
- [Backend Deployment](./experimento-backend/DEPLOYMENT.md)
- [Chatbot Deployment](./experimento-chatbot/DEPLOYMENT.md)
- [Frontend Deployment](./experimento-frontend/DEPLOYMENT.md)

### Comandos Útiles

```bash
# Verificar estado de servicios
curl https://tu-backend.onrender.com/health
curl https://tu-chatbot.onrender.com/health

# Ver logs en Render
# Dashboard → Services → Logs

# Ver logs en Vercel
# Dashboard → Functions → Logs
```

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu aplicación estará disponible en:

- **Frontend**: https://tu-frontend.vercel.app
- **Backend**: https://tu-backend.onrender.com
- **Chatbot**: https://tu-chatbot.onrender.com

¡Disfruta de tu aplicación desplegada! 🚀 