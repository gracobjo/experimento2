# Scripts de Arranque del Sistema

Este documento describe los scripts disponibles para gestionar el sistema completo (Backend, Chatbot y Frontend).

## 📁 Archivos de Scripts

### 1. `start-all-services.bat` - Arranque Completo
**Función:** Inicia todos los servicios del sistema en orden correcto.

**Características:**
- ✅ Verifica puertos disponibles antes de iniciar
- ✅ Inicia servicios en ventanas separadas
- ✅ Espera tiempos apropiados entre servicios
- ✅ Verifica el estado final de todos los servicios
- ✅ Proporciona URLs de acceso y comandos útiles

**Orden de inicio:**
1. **Backend** (Puerto 3000) - NestJS
2. **Chatbot** (Puerto 5000) - Python con mejoras NLP
3. **Frontend** (Puerto 5173) - React

### 2. `stop-all-services.bat` - Detención Completa
**Función:** Detiene todos los servicios del sistema de forma segura.

**Características:**
- 🛑 Detiene procesos por puerto específico
- 🛑 Termina procesos Node.js y Python
- 🛑 Verifica que los puertos estén libres
- 🛑 Proporciona feedback del estado de detención

### 3. `check-status.bat` - Verificación de Estado
**Función:** Verifica el estado actual de todos los servicios.

**Características:**
- 🔍 Verifica Backend, Chatbot, Frontend, Base de datos
- 🔍 Verifica parámetros del sistema y documentación API
- 🔍 Proporciona URLs de acceso y comandos de reinicio
- 🔍 Muestra logs útiles para debugging

## 🚀 Uso de los Scripts

### Arranque Completo del Sistema
```bash
# Desde la raíz del proyecto
.\start-all-services.bat
```

**Resultado esperado:**
- 3 ventanas de terminal abiertas (una por servicio)
- Verificación automática del estado
- URLs de acceso mostradas

### Verificación de Estado
```bash
# Verificar estado actual
.\check-status.bat
```

### Detención Completa
```bash
# Detener todos los servicios
.\stop-all-services.bat
```

## 📋 Servicios del Sistema

### Backend (NestJS - Puerto 3000)
- **Archivo de arranque:** `experimento/backend/main.ts`
- **Comando manual:** `cd backend && npm run start:dev`
- **URLs:**
  - API: http://localhost:3000
  - Health Check: http://localhost:3000/health
  - Swagger Docs: http://localhost:3000/api

### Chatbot (Python - Puerto 5000)
- **Archivo de arranque:** `experimento/chatbot/main_simple_improved.py`
- **Comando manual:** `cd chatbot && python main_simple_improved.py`
- **URLs:**
  - API: http://localhost:5000
  - Health Check: http://localhost:5000/health
- **Características:**
  - Mejoras NLP implementadas
  - Gestión de sesiones
  - Timeout automático
  - Integración con backend

### Frontend (React - Puerto 5173)
- **Archivo de arranque:** `experimento/frontend/src/main.tsx`
- **Comando manual:** `cd frontend && npm run dev`
- **URLs:**
  - Aplicación: http://localhost:5173
- **Características:**
  - Widget de chatbot integrado
  - Gestión de sesiones
  - Timeout de inactividad

## 🔧 Comandos Manuales

### Iniciar Servicios Individualmente

**Backend:**
```bash
cd experimento/backend
npm run start:dev
```

**Chatbot:**
```bash
cd experimento/chatbot
python main_simple_improved.py
```

**Frontend:**
```bash
cd experimento/frontend
npm run dev
```

### Verificar Logs

**Backend:**
```bash
cd experimento/backend
npm run start:dev
```

**Chatbot:**
```bash
cd experimento/chatbot
python main_simple_improved.py
```

**Frontend:**
```bash
cd experimento/frontend
npm run dev
```

## 🐛 Solución de Problemas

### Puerto Ocupado
Si un puerto está ocupado:
1. Ejecuta `.\stop-all-services.bat`
2. Espera 10 segundos
3. Ejecuta `.\start-all-services.bat`

### Servicio No Responde
Si un servicio no responde:
1. Verifica la ventana del servicio para errores
2. Ejecuta `.\check-status.bat` para diagnóstico
3. Reinicia el servicio específico manualmente

### Base de Datos
Si hay problemas con la base de datos:
```bash
cd experimento/backend
npx prisma db push
npx prisma generate
```

### Dependencias
Si hay problemas de dependencias:

**Backend:**
```bash
cd experimento/backend
npm install
```

**Frontend:**
```bash
cd experimento/frontend
npm install
```

**Chatbot:**
```bash
cd experimento/chatbot
pip install -r requirements.txt
```

## 📝 Notas Importantes

1. **Orden de inicio:** Siempre iniciar Backend → Chatbot → Frontend
2. **Tiempos de espera:** Los scripts incluyen tiempos de espera apropiados
3. **Ventanas separadas:** Cada servicio se ejecuta en su propia ventana
4. **Logs:** Los logs aparecen en las ventanas de cada servicio
5. **Detención:** Usar `stop-all-services.bat` para detener todo correctamente

## 🎯 Prueba del Sistema

Después del arranque completo:

1. **Abrir:** http://localhost:5173
2. **Hacer clic** en el widget del chatbot
3. **Escribir:** "quiero una cita" o "necesito una consulta"
4. **Seguir** el flujo de conversación
5. **Verificar** que se crea la cita en el backend

## 🔄 Flujo de Trabajo Recomendado

1. **Desarrollo:** Usar comandos manuales para debugging
2. **Pruebas:** Usar `start-all-services.bat` para pruebas completas
3. **Verificación:** Usar `check-status.bat` para diagnóstico
4. **Limpieza:** Usar `stop-all-services.bat` al terminar 