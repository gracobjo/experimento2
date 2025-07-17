# ⚡ Guía Rápida de Instalación

## Requisitos Mínimos
- Node.js 18+
- Python 3.8+
- PostgreSQL 12+
- Git

## Instalación Express (5 minutos)

```bash
# 1. Clonar repositorio
git clone <URL_REPO>
cd experimento

# 2. Configurar base de datos
psql -U postgres
CREATE DATABASE despacho_abogados;
CREATE USER despacho_user WITH PASSWORD 'password123';
GRANT ALL PRIVILEGES ON DATABASE despacho_abogados TO despacho_user;
\q

# 3. Configurar variables de entorno
cd backend
cp .env.example .env
# Editar .env con tus credenciales

# 4. Instalar y configurar todo
cd backend && npm install && npx prisma generate && npx prisma migrate dev
cd ../frontend && npm install
cd ../chatbot && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# 5. Ejecutar
# Windows: start-all.bat
# Unix: ./start-all.sh
```

## URLs de Acceso
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Chatbot: http://localhost:8000

## 📚 Documentación de la API (Swagger)

### Acceso a Swagger
```
http://localhost:3000/api/docs
```

### Cómo Usar Swagger

1. **Inicia el servidor backend** (si no está corriendo):
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Abre tu navegador** y ve a: `http://localhost:3000/api/docs`

3. **Para usar la autenticación**:
   - Primero obtén un token usando `POST /api/auth/login`
   - Haz clic en "Authorize" en la parte superior
   - Ingresa: `Bearer tu_token_jwt_aqui`

### Características de Swagger
- ✅ **Documentación Interactiva** - Todos los endpoints documentados
- ✅ **Pruebas en Tiempo Real** - Prueba las APIs directamente
- ✅ **Autenticación JWT** - Sistema integrado
- ✅ **Filtrado por Tags** - Organizado por funcionalidad
- ✅ **Esquemas Detallados** - Estructura de datos completa

### Categorías de Endpoints
- 🔐 **auth** - Autenticación y gestión de usuarios
- 👤 **users** - Gestión de usuarios y perfiles
- 📋 **cases** - Gestión de casos y expedientes
- 📅 **appointments** - Gestión de citas y agendas
- 📄 **documents** - Gestión de documentos
- ✅ **tasks** - Gestión de tareas y seguimiento
- 💰 **invoices** - Facturación electrónica
- 💳 **provision-fondos** - Gestión de provisiones de fondos
- 💬 **chat** - Chat y mensajería
- 📊 **reports** - Reportes y estadísticas
- ⚙️ **admin** - Funciones administrativas
- 🔧 **parametros** - Configuración de parámetros del sistema

### Ejemplo de Uso Rápido
1. Ve a `http://localhost:3000/api/docs`
2. Expande la sección **auth**
3. Prueba `POST /api/auth/login` con credenciales de prueba
4. Copia el token de la respuesta
5. Haz clic en "Authorize" y pega el token
6. ¡Ya puedes probar todos los endpoints!

## Comandos Útiles

```bash
# Reiniciar servicios
cd backend && npm run start:dev
cd frontend && npm run dev
cd chatbot && python main_improved.py

# Ver logs
tail -f backend/logs/app.log

# Limpiar caché
npm run cleanup  # backend
rm -rf frontend/node_modules/.vite
```

## Problemas Comunes

**Puerto ocupado:**
```bash
# Windows
netstat -ano | findstr :3000 && taskkill /PID <PID> /F

# Unix
lsof -ti:3000 | xargs kill -9
```

**Base de datos:**
```bash
npx prisma migrate reset  # Reset completo
npx prisma db push        # Sincronizar schema
``` 