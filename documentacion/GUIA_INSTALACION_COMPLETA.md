# 🚀 Guía de Instalación Completa - Sistema de Gestión Legal

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Clonar el Repositorio](#clonar-el-repositorio)
3. [Instalar Node.js](#instalar-nodejs)
4. [Instalar Python](#instalar-python)
5. [Instalar PostgreSQL](#instalar-postgresql)
6. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
7. [Instalar Dependencias](#instalar-dependencias)
8. [Configurar Base de Datos](#configurar-base-de-datos)
9. [Ejecutar Seed de Datos](#ejecutar-seed-de-datos)
10. [Iniciar Servicios](#iniciar-servicios)
11. [Verificar Instalación](#verificar-instalación)
12. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### Software Necesario:
- **Git** (para clonar el repositorio)
- **Node.js** (versión 18 o superior)
- **Python** (versión 3.11 o superior)
- **PostgreSQL** (versión 15 o superior)
- **npm** (incluido con Node.js)
- **pip** (incluido con Python)

### Espacio en Disco:
- Mínimo 2GB de espacio libre

---

## 📥 Clonar el Repositorio

```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd experimento
```

**Resultado esperado:**
```
Cloning into 'experimento'...
remote: Enumerating objects...
remote: Counting objects...
remote: Compressing objects...
Receiving objects: 100% (xxx/xxx), done.
Resolving deltas: 100% (xxx/xxx), done.
```

---

## 📦 Instalar Node.js

### Opción 1: Usando winget (Recomendado)
```powershell
winget install OpenJS.NodeJS.LTS
```

### Opción 2: Descarga Manual
1. Ve a: https://nodejs.org/
2. Descarga la versión LTS
3. Ejecuta el instalador

### Verificar Instalación:
```powershell
node --version
npm --version
```

**Resultado esperado:**
```
v22.17.0
10.9.2
```

---

## 🐍 Instalar Python

### Opción 1: Usando winget (Recomendado)
```powershell
winget install Python.Python.3.11
```

### Opción 2: Descarga Manual
1. Ve a: https://www.python.org/downloads/
2. Descarga Python 3.11 o superior
3. Ejecuta el instalador (marcar "Add Python to PATH")

### Verificar Instalación:
```powershell
python --version
pip --version
```

**Resultado esperado:**
```
Python 3.11.x
pip 23.x.x
```

---

## 🐘 Instalar PostgreSQL

### Opción 1: Descarga Manual
1. Ve a: https://www.postgresql.org/download/windows/
2. Descarga PostgreSQL 15 o 16
3. Ejecuta el instalador como administrador

### Configuración Durante la Instalación:
- **Puerto:** 5432 (por defecto)
- **Contraseña del usuario postgres:** `postgres`
- **Base de datos:** `despacho_legal`

### Opción 2: Usando winget
```powershell
winget install PostgreSQL.PostgreSQL
```

### Verificar Instalación:
```powershell
psql --version
```

**Resultado esperado:**
```
psql (PostgreSQL) 15.x.x
```

---

## ⚙️ Configurar Variables de Entorno

### 1. Crear archivo .env del Backend

```powershell
cd backend
```

Crear archivo `backend/.env`:
```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/despacho_legal"

# ========================================
# JWT Y AUTENTICACIÓN
# ========================================
JWT_SECRET="tu_jwt_secret_super_seguro_y_largo_para_produccion"
JWT_EXPIRES_IN="24h"

# ========================================
# SERVIDOR
# ========================================
PORT=3000
NODE_ENV=development
CORS_ORIGIN="http://localhost:5173"

# ========================================
# UPLOADS
# ========================================
UPLOAD_DEST="./uploads"
MAX_FILE_SIZE=10485760  # 10MB en bytes
```

### 2. Crear archivo .env del Frontend

```powershell
cd ../frontend
```

Crear archivo `frontend/.env`:
```env
# ========================================
# URLs DE API
# ========================================
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000

# ========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ========================================
VITE_APP_NAME="Despacho Legal"
VITE_APP_VERSION=1.0.0
```

### 3. Crear archivo .env del Chatbot

```powershell
cd ../chatbot
```

Crear archivo `chatbot/.env`:
```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/despacho_legal"

# ========================================
# API
# ========================================
API_KEY="tu_api_key_segura_para_chatbot"
API_HOST="0.0.0.0"
API_PORT=5000

# ========================================
# CORS
# ========================================
CORS_ORIGINS="http://localhost:5173,https://tu-dominio.com"
CORS_METHODS="GET,POST,PUT,DELETE,OPTIONS"
CORS_HEADERS="Content-Type,Authorization"

# ========================================
# MODELO DE IA
# ========================================
MODEL_PATH="./models/legal_model"
SPACY_MODEL="es_core_news_sm"
NLTK_DATA_PATH="./nltk_data"

# ========================================
# CONFIGURACIÓN DE CHAT
# ========================================
MAX_MESSAGE_LENGTH=1000
SESSION_TIMEOUT=3600  # 1 hora en segundos
MAX_CONVERSATION_HISTORY=50

# ========================================
# LOGS
# ========================================
LOG_LEVEL="INFO"
LOG_FILE="./logs/chatbot.log"

# ========================================
# BACKEND INTEGRATION
# ========================================
BACKEND_URL="http://localhost:3000"
BACKEND_API_KEY="tu_backend_api_key"
```

---

## 📚 Instalar Dependencias

### 1. Instalar dependencias del Backend
```powershell
cd backend
npm install
```

**Resultado esperado:**
```
added 850 packages, and audited 851 packages in 58s
128 packages are looking for funding
```

### 2. Instalar dependencias del Frontend
```powershell
cd ../frontend
npm install
```

**Resultado esperado:**
```
added 150 packages, and audited 151 packages in 30s
```

### 3. Instalar dependencias del Chatbot
```powershell
cd ../chatbot
pip install -r requirements.txt
```

**Resultado esperado:**
```
Collecting fastapi==0.109.2
  Downloading fastapi-0.109.2-py3-none-any.whl (76 kB)
Installing collected packages: fastapi, uvicorn, websockets, pydantic, starlette, python-dotenv, requests, spacy, nltk, python-multipart
Successfully installed fastapi-0.109.2 uvicorn-0.27.1 websockets-12.0 pydantic-1.10.14 starlette-0.36.3 python-dotenv-1.0.0 requests-2.31.0 spacy-3.7.2 nltk-3.8.1 python-multipart-0.0.6
```

### 4. Descargar modelos de spaCy (Opcional pero recomendado)
```powershell
python -m spacy download es_core_news_sm
```

**Resultado esperado:**
```
✔ Download and installation successful
You can now load the package via spacy.load('es_core_news_sm')
```

---

## 🗄️ Configurar Base de Datos

### 1. Crear Base de Datos
```sql
-- Conectar a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE despacho_legal;

-- Verificar creación
\l

-- Salir
\q
```

### 2. Ejecutar Migraciones
```powershell
cd backend
npx prisma migrate deploy
```

**Resultado esperado:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "despacho_legal", schema "public" at "localhost:5432"
```

### 3. Generar Cliente Prisma
```powershell
npx prisma generate
```

**Resultado esperado:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Generated Prisma Client (v6.11.1) to .\node_modules\.prisma\client in 123ms
```

---

## 🌱 Ejecutar Seed de Datos

### 1. Configurar Seed en schema.prisma
Agregar esta línea al archivo `backend/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

/// @seed="ts-node prisma/seed.ts"
```

### 2. Ejecutar Seed
```powershell
cd backend
npm run seed
```

**Resultado esperado:**
```
🌱 Iniciando seed de la base de datos...
✅ Usuarios creados
✅ Expedientes creados
✅ Documentos creados
✅ Citas creadas
✅ Tareas creadas
✅ Seed completado exitosamente
```

### 3. Verificar Datos Creados
```powershell
npx prisma studio
```

Esto abrirá una interfaz web en http://localhost:5555 donde puedes ver todos los datos.

---

## 🚀 Iniciar Servicios

### 1. Iniciar Backend
```powershell
cd backend
npm run start:dev
```

**Resultado esperado:**
```
[Nest] 1234   - 07/14/2025, 3:52:00 PM   [NestFactory] Starting Nest application...
[Nest] 1234   - 07/14/2025, 3:52:00 PM   [InstanceLoader] AppModule dependencies initialized
[Nest] 1234   - 07/14/2025, 3:52:00 PM   [RoutesResolver] AppController {/}
[Nest] 1234   - 07/14/2025, 3:52:00 PM   [RouterExplorer] Mapped {/, GET} route
[Nest] 1234   - 07/14/2025, 3:52:00 PM   [NestApplication] Nest application successfully started
```

### 2. Iniciar Frontend (en nueva terminal)
```powershell
cd frontend
npm run dev
```

**Resultado esperado:**
```
  VITE v5.x.x  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### 3. Iniciar Chatbot (en nueva terminal)
```powershell
cd chatbot
python main.py
```

**Resultado esperado:**
```
INFO:     Started server process [1234]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000 (Press CTRL+C to quit)
```

---

## ✅ Verificar Instalación

### URLs Disponibles:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Chatbot API:** http://localhost:5000
- **Swagger Docs:** http://localhost:3000/api
- **Prisma Studio:** http://localhost:5555

### Credenciales de Prueba:
- **Admin:** admin@despacho.com / password123
- **Abogado:** lawyer1@example.com / password123
- **Cliente:** client1@example.com / password123

### Verificar Endpoints:
```bash
# Health check del backend
curl http://localhost:3000/health

# Health check del chatbot
curl http://localhost:5000/health

# Verificar API
curl http://localhost:3000/api
```

---

## 🔧 Solución de Problemas

### Problema: "node no se reconoce"
**Solución:**
1. Cerrar y abrir nueva terminal
2. Verificar PATH de Node.js
3. Reiniciar sistema si es necesario

### Problema: "python no se reconoce"
**Solución:**
1. Verificar que Python esté en PATH
2. Reinstalar Python marcando "Add to PATH"
3. Reiniciar terminal

### Problema: "PostgreSQL no se conecta"
**Solución:**
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en .env
3. Verificar que la base de datos existe

### Problema: "Puerto 3000 ocupado"
**Solución:**
```powershell
# Encontrar proceso que usa el puerto
netstat -ano | findstr :3000

# Terminar proceso
taskkill /PID <PID> /F
```

### Problema: "Error de migración"
**Solución:**
```powershell
# Resetear base de datos
npx prisma migrate reset

# Ejecutar migraciones nuevamente
npx prisma migrate deploy
```

### Problema: "Dependencias no se instalan"
**Solución:**
```powershell
# Limpiar cache de npm
npm cache clean --force

# Eliminar node_modules
rm -rf node_modules
rm package-lock.json

# Reinstalar
npm install
```

### Problema: "Error en chatbot - spaCy"
**Solución:**
```powershell
# Instalar modelo español
python -m spacy download es_core_news_sm

# Verificar instalación
python -c "import spacy; nlp = spacy.load('es_core_news_sm'); print('Modelo cargado correctamente')"
```

---

## 📝 Comandos Rápidos

### Script de Configuración Automática:
```powershell
# Desde la raíz del proyecto
.\setup-completo.bat
```

### Verificar Estado:
```powershell
# Verificar servicios
.\check-status.bat
```

### Reiniciar Todo:
```powershell
# Parar servicios (Ctrl+C)
# Luego ejecutar
.\start-all.bat
```

---

## 🎯 Checklist de Instalación

- [ ] Git clonado
- [ ] Node.js instalado
- [ ] Python instalado
- [ ] PostgreSQL instalado
- [ ] Base de datos creada
- [ ] Archivos .env creados
- [ ] Dependencias del backend instaladas
- [ ] Dependencias del frontend instaladas
- [ ] Dependencias del chatbot instaladas
- [ ] Modelos de spaCy descargados
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado
- [ ] Backend iniciado
- [ ] Frontend iniciado
- [ ] Chatbot iniciado
- [ ] URLs accesibles
- [ ] Login funcionando

---

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de error
2. Verifica la configuración de .env
3. Asegúrate de que todos los servicios estén ejecutándose
4. Consulta la documentación en `documentacion/`

---

**¡Tu sistema de gestión legal está listo para usar! 🎉** 