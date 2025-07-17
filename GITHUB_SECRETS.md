# 🔐 Variables de Entorno para GitHub Actions

Este archivo documenta todas las variables de entorno (secrets) que necesitas configurar en GitHub para el despliegue automatizado.

## 📍 Configuración en GitHub

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Haz clic en **New repository secret**
4. Agrega cada una de las siguientes variables:

## 🔑 Secrets Requeridos

### Render (Backend y Chatbot)

| Secret | Descripción | Cómo obtenerlo |
|--------|-------------|----------------|
| `RENDER_TOKEN` | Token de API de Render | 1. Ve a https://render.com/dashboard<br>2. Ve a **Account Settings** → **API Keys**<br>3. Crea un nuevo API Key |
| `RENDER_BACKEND_SERVICE_ID` | ID del servicio Backend en Render | 1. Ve a tu servicio Backend en Render<br>2. El ID está en la URL: `https://dashboard.render.com/web/srv/[SERVICE_ID]` |
| `RENDER_CHATBOT_SERVICE_ID` | ID del servicio Chatbot en Render | 1. Ve a tu servicio Chatbot en Render<br>2. El ID está en la URL: `https://dashboard.render.com/web/srv/[SERVICE_ID]` |

### Vercel (Frontend)

| Secret | Descripción | Cómo obtenerlo |
|--------|-------------|----------------|
| `VERCEL_TOKEN` | Token de API de Vercel | 1. Ve a https://vercel.com/account/tokens<br>2. Crea un nuevo token |
| `VERCEL_ORG_ID` | ID de la organización en Vercel | 1. Ve a https://vercel.com/account<br>2. El ID está en la sección de configuración |
| `VERCEL_PROJECT_ID` | ID del proyecto Frontend en Vercel | 1. Ve a tu proyecto en Vercel<br>2. El ID está en **Settings** → **General** |

### URLs de Verificación

| Secret | Descripción | Ejemplo |
|--------|-------------|---------|
| `BACKEND_URL` | URL del backend desplegado | `https://experimento-backend.onrender.com` |
| `CHATBOT_URL` | URL del chatbot desplegado | `https://experimento-chatbot.onrender.com` |
| `FRONTEND_URL` | URL del frontend desplegado | `https://experimento-frontend.vercel.app` |

## 🚀 Proceso de Configuración

### Paso 1: Configurar Render

1. **Crear cuenta en Render**: https://render.com
2. **Desplegar Backend**:
   - Conecta tu repositorio
   - Crea una base de datos PostgreSQL
   - Crea un Web Service para el backend
   - Copia el Service ID de la URL

3. **Desplegar Chatbot**:
   - Conecta tu repositorio
   - Crea un Web Service para el chatbot
   - Copia el Service ID de la URL

4. **Obtener API Token**:
   - Ve a Account Settings → API Keys
   - Crea un nuevo API Key

### Paso 2: Configurar Vercel

1. **Crear cuenta en Vercel**: https://vercel.com
2. **Desplegar Frontend**:
   - Conecta tu repositorio
   - Configura el proyecto
   - Obtén los IDs necesarios

3. **Obtener Token**:
   - Ve a Account → Tokens
   - Crea un nuevo token

### Paso 3: Configurar GitHub Secrets

Agrega todos los secrets listados arriba en tu repositorio de GitHub.

## 🔍 Verificación

Una vez configurados todos los secrets, puedes:

1. **Probar el workflow manualmente**:
   - Ve a **Actions** en tu repositorio
   - Selecciona el workflow "Deploy to Production"
   - Haz clic en **Run workflow**

2. **Verificar el despliegue**:
   - El workflow verificará automáticamente la salud de todos los servicios
   - Revisa los logs para cualquier error

## 🛠️ Troubleshooting

### Error: RENDER_TOKEN inválido
```bash
# Verificar el token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.render.com/v1/services
```

### Error: VERCEL_TOKEN inválido
```bash
# Verificar el token
curl -H "Authorization: Bearer YOUR_TOKEN" https://api.vercel.com/v1/user
```

### Error: Service ID no encontrado
- Verifica que el Service ID esté correcto
- Asegúrate de que el servicio esté activo en Render

### Error: URLs de verificación incorrectas
- Verifica que las URLs estén correctas
- Asegúrate de que los servicios estén desplegados y funcionando

## 📊 Monitoreo

Una vez configurado, el workflow:

1. **Se ejecuta automáticamente** en cada push a `main`
2. **Verifica la construcción** de todos los componentes
3. **Despliega automáticamente** a las plataformas
4. **Verifica la salud** de todos los servicios
5. **Proporciona un resumen** del despliegue

## 🔒 Seguridad

- **Nunca compartas** estos tokens públicamente
- **Rota los tokens** regularmente
- **Usa tokens con permisos mínimos** necesarios
- **Revisa los logs** regularmente para detectar actividad sospechosa 