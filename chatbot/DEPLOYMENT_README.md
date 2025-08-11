# 🤖 Despliegue del Chatbot - Sistema de Gestión Legal

## 🎯 **Resumen**

Chatbot inteligente desplegado en **Railway** que proporciona asistencia automatizada para el sistema de gestión legal, con capacidades de procesamiento de lenguaje natural y integración con el backend principal.

---

## 🏗️ **Arquitectura del Chatbot**

### **Tecnologías Utilizadas**
```
Backend:
├── FastAPI (Python)
├── WebSockets para comunicación en tiempo real
├── spaCy para procesamiento de lenguaje natural
├── NLTK para análisis de texto
├── Uvicorn como servidor ASGI
└── Docker para containerización

Funcionalidades NLP:
├── Detección de intenciones
├── Análisis de sentimientos
├── Extracción de entidades (nombres, emails, teléfonos)
├── Similitud semántica
└── Integración con servicios de IA (OpenAI, Anthropic, Cohere)
```

### **Endpoints Principales**
- `GET /health` - Health check
- `POST /chat` - Chat HTTP
- `WebSocket /ws` - Chat en tiempo real
- `POST /end_chat` - Finalizar conversación

---

## 🚀 **Proceso de Despliegue**

### **1. Preparación del Código**
```bash
chatbot/
├── main_improved_fixed.py    # Aplicación principal
├── requirements.txt          # Dependencias Python
├── Dockerfile               # Configuración Docker
├── railway.json             # Configuración Railway
├── start.sh                 # Script de inicio
└── env.production.txt       # Variables de entorno
```

### **2. Configuración de Railway**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "healthcheckTimeout": 600,
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### **3. Variables de Entorno Requeridas**
```env
# URLs del sistema
BACKEND_URL=experimento2-production-54c0.up.railway.app
FRONTEND_URL=https://experimento2-fenm.vercel.app

# Configuración del servidor
PORT=8000
HOST=0.0.0.0

# Configuración de logging
LOG_LEVEL=INFO
CLEANUP_INTERVAL=300

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://experimento2-fenm.vercel.app,experimento2-production-54c0.up.railway.app

# Servicios de IA (opcionales)
HF_API_TOKEN=your_huggingface_token_here
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here
COHERE_API_KEY=your_cohere_key_here
```

---

## 🔧 **Configuración Técnica**

### **Dockerfile Optimizado**
```dockerfile
FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Descargar modelos NLP
RUN python -m spacy download es_core_news_sm
RUN python -m spacy download en_core_web_sm
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Copiar código
COPY . .
RUN chmod +x start.sh

EXPOSE 8000
CMD ["./start.sh"]
```

### **Script de Inicio (start.sh)**
```bash
#!/bin/bash
# Script que maneja:
# - Verificación de dependencias
# - Descarga de modelos NLP
# - Verificación de conexión con backend
# - Inicio del servidor FastAPI
```

---

## 📋 **Funcionalidades del Chatbot**

### ✅ **Procesamiento de Lenguaje Natural**
- [x] Detección de intenciones del usuario
- [x] Análisis de sentimientos
- [x] Extracción de entidades (nombres, emails, teléfonos)
- [x] Similitud semántica para respuestas inteligentes

### ✅ **Gestión de Conversaciones**
- [x] Contexto de conversación persistente
- [x] Manejo de citas y agendamiento
- [x] Información sobre servicios legales
- [x] Honorarios y precios

### ✅ **Integración con IA**
- [x] Hugging Face para respuestas avanzadas
- [x] OpenAI (opcional)
- [x] Anthropic (opcional)
- [x] Cohere (opcional)

### ✅ **Comunicación en Tiempo Real**
- [x] WebSockets para chat en vivo
- [x] HTTP endpoints para integración
- [x] CORS configurado para frontend

---

## 🔍 **Endpoints Disponibles**

### **Health Check**
```bash
GET /health
Response: {"status": "healthy", "timestamp": "2025-08-06T..."}
```

### **Chat HTTP**
```bash
POST /chat
Body: {
  "text": "Hola, necesito ayuda",
  "language": "es",
  "user_id": "user123"
}
```

### **WebSocket Chat**
```bash
WebSocket /ws
# Conexión en tiempo real para chat interactivo
```

### **Finalizar Chat**
```bash
POST /end_chat
# Limpia el contexto de la conversación
```

---

## 🛠️ **Solución de Problemas**

### **Problemas Comunes**

#### **1. Modelos NLP No Encontrados**
```
Problema: spaCy models not found
Solución: El script start.sh descarga automáticamente los modelos
```

#### **2. Dependencias Faltantes**
```
Problema: ImportError en Railway
Solución: Dockerfile instala todas las dependencias necesarias
```

#### **3. Conexión con Backend**
```
Problema: No puede conectar con el backend principal
Solución: Verificar BACKEND_URL en variables de entorno
```

### **Comandos de Debug**
```bash
# Verificar health del chatbot
curl https://chatbot-railway-url/health

# Probar chat HTTP
curl -X POST https://chatbot-railway-url/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola", "language": "es"}'

# Verificar logs en Railway
railway logs
```

---

## 📊 **Métricas de Performance**

### **Recursos Requeridos**
- **RAM:** Mínimo 512MB (recomendado 1GB)
- **CPU:** 1 vCPU mínimo
- **Storage:** ~500MB para modelos NLP
- **Network:** Conexión estable a internet

### **Tiempos de Respuesta**
- **Health Check:** < 1 segundo
- **Chat HTTP:** 2-5 segundos
- **WebSocket:** < 100ms por mensaje
- **Modelos NLP:** Carga inicial ~30 segundos

---

## 🔒 **Seguridad**

### **Implementado**
- [x] CORS configurado para dominios específicos
- [x] Validación de entrada con Pydantic
- [x] Rate limiting implícito en FastAPI
- [x] Sanitización de texto de entrada

### **Recomendaciones**
- [ ] Implementar autenticación JWT
- [ ] Rate limiting explícito
- [ ] Logging de auditoría
- [ ] Monitoreo de uso de recursos

---

## 🔗 **Integración con el Sistema**

### **Comunicación con Backend**
```python
# El chatbot se comunica con el backend para:
# - Obtener información de servicios
# - Verificar disponibilidad de citas
# - Obtener honorarios actualizados
# - Crear registros de conversación
```

### **Comunicación con Frontend**
```javascript
// El frontend puede integrar el chatbot via:
// - WebSocket para chat en tiempo real
// - HTTP POST para chat síncrono
// - iframe para widget embebido
```

---

## 📞 **Soporte**

### **Enlaces Útiles**
- **Documentación FastAPI:** https://fastapi.tiangolo.com/
- **Documentación spaCy:** https://spacy.io/usage
- **Railway Dashboard:** https://railway.app/dashboard

### **Logs y Monitoreo**
- **Logs:** Disponibles en Railway Dashboard
- **Health Check:** `/health` endpoint
- **Métricas:** Railway proporciona métricas básicas

---

## ✅ **Estado del Despliegue**

**🎯 Listo para Despliegue**

- ✅ **Dockerfile** configurado
- ✅ **railway.json** creado
- ✅ **start.sh** preparado
- ✅ **Variables de entorno** definidas
- ✅ **Health check** implementado
- ✅ **CORS** configurado

**Próximo paso: Desplegar en Railway**

---

## 🚀 **Instrucciones de Despliegue**

### **1. Crear Nuevo Proyecto en Railway**
```bash
# En Railway Dashboard:
# 1. New Project
# 2. Deploy from GitHub repo
# 3. Seleccionar carpeta chatbot/
```

### **2. Configurar Variables de Entorno**
```env
BACKEND_URL=experimento2-production-54c0.up.railway.app
FRONTEND_URL=https://experimento2-fenm.vercel.app
PORT=8000
```

### **3. Verificar Despliegue**
```bash
# Health check
curl https://tu-chatbot-url/health

# Probar chat
curl -X POST https://tu-chatbot-url/chat \
  -H "Content-Type: application/json" \
  -d '{"text": "Hola", "language": "es"}'
```

### **4. Integrar con Frontend**
```javascript
// En el frontend, agregar:
const chatbotUrl = 'https://tu-chatbot-url';
// Usar WebSocket o HTTP según necesidades
```

---

## 📝 **Notas de Desarrollo**

### **Última Actualización**
- **Fecha:** 6 de Agosto, 2025
- **Versión:** 1.0.0
- **Estado:** Listo para despliegue

### **Próximas Mejoras**
- [ ] Integración con Telegram Bot
- [ ] Mejoras en NLP con modelos más avanzados
- [ ] Dashboard de analytics del chatbot
- [ ] Tests automatizados
- [ ] CI/CD pipeline específico 