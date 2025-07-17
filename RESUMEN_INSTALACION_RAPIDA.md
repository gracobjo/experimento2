# ⚡ Resumen de Instalación Rápida

## 🚀 Comandos Esenciales (En Orden)

### 1. Instalar Software Base
```powershell
# Instalar Node.js
winget install OpenJS.NodeJS.LTS

# Instalar Python
winget install Python.Python.3.11

# Instalar PostgreSQL (descargar manualmente desde postgresql.org)
# Configurar: puerto 5432, contraseña postgres, base de datos despacho_legal
```

### 2. Configurar Variables de Entorno

**Backend (.env):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/despacho_legal"
JWT_SECRET="tu_jwt_secret_super_seguro_y_largo_para_produccion"
JWT_EXPIRES_IN="24h"
PORT=3000
NODE_ENV=development
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

**Chatbot (.env):**
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/despacho_legal"
API_KEY="tu_api_key_segura_para_chatbot"
API_HOST="0.0.0.0"
API_PORT=5000
BACKEND_URL="http://localhost:3000"
```

### 3. Instalar Dependencias
```powershell
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# Chatbot
cd ../chatbot
pip install -r requirements.txt
python -m spacy download es_core_news_sm
```

### 4. Configurar Base de Datos
```powershell
cd backend
npx prisma migrate deploy
npx prisma generate
npm run seed
```

### 5. Iniciar Servicios
```powershell
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Chatbot
cd chatbot
python main.py
```

## 🎯 URLs Finales
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:3000
- **Chatbot:** http://localhost:5000
- **Swagger:** http://localhost:3000/api

## 🔑 Credenciales de Prueba
- **Admin:** admin@despacho.com / password123
- **Abogado:** lawyer1@example.com / password123
- **Cliente:** client1@example.com / password123

## ⚠️ Problemas Comunes
- **Node no reconocido:** Cerrar y abrir nueva terminal
- **Python no reconocido:** Verificar PATH o reinstalar Python
- **PostgreSQL no conecta:** Verificar que esté ejecutándose
- **Puerto ocupado:** Cambiar puerto en .env o terminar proceso
- **spaCy error:** Ejecutar `python -m spacy download es_core_news_sm`

## 📋 Checklist Rápido
- [ ] Node.js instalado
- [ ] Python instalado
- [ ] PostgreSQL instalado y ejecutándose
- [ ] Base de datos `despacho_legal` creada
- [ ] Archivos .env creados (backend, frontend, chatbot)
- [ ] Dependencias instaladas (npm install en backend/frontend, pip install en chatbot)
- [ ] Modelo spaCy descargado
- [ ] Migraciones ejecutadas
- [ ] Seed ejecutado
- [ ] Backend iniciado (puerto 3000)
- [ ] Frontend iniciado (puerto 5173)
- [ ] Chatbot iniciado (puerto 5000)
- [ ] Login funcionando

---

**¡Listo! Tu sistema completo está funcionando. 🎉** 