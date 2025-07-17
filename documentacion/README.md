# 📚 Documentación del Sistema de Gestión Legal
# 📚 Documentación del Sistema de Gestión Legal

## 🎯 Descripción General

Este sistema de gestión legal es una aplicación completa que incluye:

- **Backend**: API REST con NestJS y PostgreSQL
- **Frontend**: Interfaz web con React, TypeScript y Vite
- **Chatbot**: Servicio de IA con FastAPI y Python

## 📋 Requisitos Previos

### Software Necesario

#### 1. **Node.js** (v18 o superior)
- **Windows**: Descargar desde [nodejs.org](https://nodejs.org/)
- **macOS**: `brew install node`
- **Linux**: `sudo apt install nodejs npm` (Ubuntu/Debian)

#### 2. **Python** (v3.8 o superior)
- **Windows**: Descargar desde [python.org](https://python.org/)
- **macOS**: `brew install python`
- **Linux**: `sudo apt install python3 python3-pip` (Ubuntu/Debian)

#### 3. **PostgreSQL** (v12 o superior)
- **Windows**: Descargar desde [postgresql.org](https://postgresql.org/)
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt install postgresql postgresql-contrib` (Ubuntu/Debian)

#### 4. **Git**
- **Windows**: Descargar desde [git-scm.com](https://git-scm.com/)
- **macOS**: `brew install git`
- **Linux**: `sudo apt install git` (Ubuntu/Debian)

### Verificación de Instalación

```bash
# Verificar Node.js
node --version
npm --version

# Verificar Python
python --version
pip --version

# Verificar PostgreSQL
psql --version

# Verificar Git
git --version
```

## 🚀 Instalación Paso a Paso

### Paso 1: Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd experimento
```

### Paso 2: Configurar la Base de Datos

1. **Crear base de datos PostgreSQL:**
```sql
CREATE DATABASE despacho_abogados;
CREATE USER despacho_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE despacho_abogados TO despacho_user;
```

2. **Configurar variables de entorno:**
```bash
cd backend
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:
```env
DATABASE_URL="postgresql://despacho_user:tu_password@localhost:5432/despacho_abogados"
JWT_SECRET="tu_jwt_secret_super_seguro"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu_email@gmail.com"
SMTP_PASS="tu_password_de_aplicacion"
```

### Paso 3: Instalar Dependencias del Backend

```bash
cd backend
npm install
```

### Paso 4: Configurar Prisma

```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Poblar la base de datos con datos de ejemplo
npm run seed
```

### Paso 5: Instalar Dependencias del Frontend

```bash
cd ../frontend
npm install
```

### Paso 6: Configurar el Chatbot

```bash
cd ../chatbot

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Descargar modelos de spaCy (opcional, para mejor rendimiento)
python -m spacy download es_core_news_sm
```

## 🏃‍♂️ Ejecución del Sistema

### Opción 1: Scripts Automáticos

#### Windows:
```bash
start-all.bat
```

#### macOS/Linux:
```bash
chmod +x start-all.sh
./start-all.sh
```

### Opción 2: Ejecución Manual

#### Terminal 1 - Backend:
```bash
cd backend
npm run start:dev
```

#### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

#### Terminal 3 - Chatbot:
```bash
cd chatbot
# Activar entorno virtual si no está activado
python main_improved.py
```

## 🌐 Acceso a la Aplicación

Una vez iniciados todos los servicios:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Chatbot API**: http://localhost:8000
- **Documentación API**: http://localhost:3000/api

## 🔧 Configuración Adicional

### Variables de Entorno del Frontend

Crear archivo `.env` en la carpeta `frontend`:
```env
VITE_API_URL=http://localhost:3000
VITE_CHATBOT_URL=http://localhost:8000
```

### Configuración de Email (Opcional)

Para funcionalidades de email (recuperación de contraseña, notificaciones):

1. Configurar cuenta de Gmail con autenticación de 2 factores
2. Generar contraseña de aplicación
3. Actualizar variables SMTP en el backend

## 🐛 Solución de Problemas

### Error: "Port already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Error: "Database connection failed"
- Verificar que PostgreSQL esté ejecutándose
- Comprobar credenciales en `.env`
- Verificar que la base de datos existe

### Error: "Module not found"
```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Python virtual environment"
```bash
# Recrear entorno virtual
rm -rf venv
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
```

## 📁 Estructura del Proyecto

```
experimento/
├── backend/                 # API NestJS
│   ├── src/
│   ├── prisma/
│   └── package.json
├── frontend/               # React + Vite
│   ├── src/
│   └── package.json
├── chatbot/               # FastAPI Python
│   ├── main_improved.py
│   └── requirements.txt
├── documentacion/         # Esta carpeta
├── start-all.bat         # Script Windows
├── start-all.sh          # Script Unix
└── .gitignore
```

## 🔒 Seguridad

- Cambiar todas las contraseñas por defecto
- Usar variables de entorno para credenciales
- Configurar HTTPS en producción
- Mantener dependencias actualizadas

## 📞 Soporte

Para problemas técnicos o preguntas:
1. Revisar la sección de solución de problemas
2. Verificar logs en las consolas de cada servicio
3. Comprobar que todos los puertos estén disponibles

## 🚀 Despliegue en Producción

Para información sobre despliegue en producción, consultar:
- [Guía de Despliegue](./despliegue-produccion.md)
- [Configuración de Servidor](./configuracion-servidor.md)
- [Optimización de Rendimiento](./optimizacion.md) 