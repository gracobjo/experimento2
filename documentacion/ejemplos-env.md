# 🔧 Ejemplos de Variables de Entorno

## Backend (.env)

```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://despacho_user:tu_password@localhost:5432/despacho_abogados"

# ========================================
# JWT Y AUTENTICACIÓN
# ========================================
JWT_SECRET="tu_jwt_secret_super_seguro_y_largo_para_produccion"
JWT_EXPIRES_IN="24h"

# ========================================
# EMAIL (SMTP)
# ========================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-password-de-aplicacion"
SMTP_FROM="Despacho Legal <noreply@tudominio.com>"

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

# ========================================
# LOGS
# ========================================
LOG_LEVEL="debug"
LOG_FILE="./logs/app.log"

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_TTL=60000    # 1 minuto
RATE_LIMIT_LIMIT=100    # 100 requests por minuto

# ========================================
# CHATBOT
# ========================================
CHATBOT_URL="http://localhost:8000"
CHATBOT_API_KEY="tu_chatbot_api_key"

# ========================================
# FACTURACIÓN ELECTRÓNICA
# ========================================
CERTIFICATE_PATH="./certs/certificado.p12"
CERTIFICATE_PASSWORD="password_certificado"
FACTURAE_VERSION="3.2.2"
```

## Frontend (.env)

```env
# ========================================
# URLs DE API
# ========================================
VITE_API_URL=http://localhost:3000
VITE_CHATBOT_URL=http://localhost:8000

# ========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ========================================
VITE_APP_NAME="Despacho Legal"
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION="Sistema de gestión para despacho de abogados"

# ========================================
# ANALYTICS
# ========================================
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# ========================================
# FEATURES
# ========================================
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOAD=true

# ========================================
# CONFIGURACIÓN DE DESARROLLO
# ========================================
VITE_DEV_MODE=true
VITE_DEBUG_MODE=true
```

## Chatbot (.env)

```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://despacho_user:tu_password@localhost:5432/despacho_abogados"

# ========================================
# API
# ========================================
API_KEY="tu_api_key_segura_para_chatbot"
API_HOST="0.0.0.0"
API_PORT=8000

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

## Producción (.env.production)

### Backend Producción
```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://despacho_user:password_super_seguro@localhost:5432/despacho_abogados_prod"

# ========================================
# JWT Y AUTENTICACIÓN
# ========================================
JWT_SECRET="jwt_secret_super_seguro_y_largo_para_produccion_con_muchos_caracteres"
JWT_EXPIRES_IN="24h"

# ========================================
# EMAIL (SMTP)
# ========================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="noreply@tudominio.com"
SMTP_PASS="password_de_aplicacion_segura"
SMTP_FROM="Despacho Legal <noreply@tudominio.com>"

# ========================================
# SERVIDOR
# ========================================
PORT=3000
NODE_ENV=production
CORS_ORIGIN="https://tu-dominio.com"

# ========================================
# UPLOADS
# ========================================
UPLOAD_DEST="/var/www/uploads"
MAX_FILE_SIZE=10485760

# ========================================
# LOGS
# ========================================
LOG_LEVEL="warn"
LOG_FILE="/var/log/despacho/backend.log"

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100

# ========================================
# CHATBOT
# ========================================
CHATBOT_URL="https://chatbot.tu-dominio.com"
CHATBOT_API_KEY="chatbot_api_key_produccion"

# ========================================
# REDIS (Caché)
# ========================================
REDIS_URL="redis://localhost:6379"
REDIS_TTL=3600

# ========================================
# MONITORING
# ========================================
ENABLE_METRICS=true
METRICS_PORT=9090
```

### Frontend Producción
```env
# ========================================
# URLs DE API
# ========================================
VITE_API_URL=https://api.tu-dominio.com
VITE_CHATBOT_URL=https://chatbot.tu-dominio.com

# ========================================
# CONFIGURACIÓN DE LA APLICACIÓN
# ========================================
VITE_APP_NAME="Despacho Legal"
VITE_APP_VERSION=1.0.0
VITE_APP_DESCRIPTION="Sistema de gestión para despacho de abogados"

# ========================================
# ANALYTICS
# ========================================
VITE_ENABLE_ANALYTICS=true
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX

# ========================================
# FEATURES
# ========================================
VITE_ENABLE_CHAT=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOAD=true

# ========================================
# CONFIGURACIÓN DE PRODUCCIÓN
# ========================================
VITE_DEV_MODE=false
VITE_DEBUG_MODE=false
VITE_ENABLE_SOURCE_MAPS=false
```

### Chatbot Producción
```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://despacho_user:password_super_seguro@localhost:5432/despacho_abogados_prod"

# ========================================
# API
# ========================================
API_KEY="api_key_super_segura_para_produccion"
API_HOST="0.0.0.0"
API_PORT=8000

# ========================================
# CORS
# ========================================
CORS_ORIGINS="https://tu-dominio.com,https://www.tu-dominio.com"
CORS_METHODS="GET,POST,PUT,DELETE,OPTIONS"
CORS_HEADERS="Content-Type,Authorization"

# ========================================
# MODELO DE IA
# ========================================
MODEL_PATH="/var/www/models/legal_model"
SPACY_MODEL="es_core_news_sm"
NLTK_DATA_PATH="/var/www/nltk_data"

# ========================================
# CONFIGURACIÓN DE CHAT
# ========================================
MAX_MESSAGE_LENGTH=1000
SESSION_TIMEOUT=3600
MAX_CONVERSATION_HISTORY=50

# ========================================
# LOGS
# ========================================
LOG_LEVEL="WARNING"
LOG_FILE="/var/log/despacho/chatbot.log"

# ========================================
# BACKEND INTEGRATION
# ========================================
BACKEND_URL="https://api.tu-dominio.com"
BACKEND_API_KEY="backend_api_key_produccion"

# ========================================
# MONITORING
# ========================================
ENABLE_HEALTH_CHECK=true
HEALTH_CHECK_INTERVAL=300
```

## Desarrollo (.env.development)

### Backend Desarrollo
```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://despacho_user:dev_password@localhost:5432/despacho_abogados_dev"

# ========================================
# JWT Y AUTENTICACIÓN
# ========================================
JWT_SECRET="dev_jwt_secret_para_desarrollo"
JWT_EXPIRES_IN="24h"

# ========================================
# EMAIL (SMTP)
# ========================================
SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER="tu_mailtrap_user"
SMTP_PASS="tu_mailtrap_password"
SMTP_FROM="Dev <dev@localhost>"

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
MAX_FILE_SIZE=10485760

# ========================================
# LOGS
# ========================================
LOG_LEVEL="debug"
LOG_FILE="./logs/app.log"

# ========================================
# RATE LIMITING
# ========================================
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=1000

# ========================================
# CHATBOT
# ========================================
CHATBOT_URL="http://localhost:8000"
CHATBOT_API_KEY="dev_chatbot_key"

# ========================================
# DEBUG
# ========================================
DEBUG=true
ENABLE_SWAGGER=true
```

## Testing (.env.test)

```env
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://test_user:test_password@localhost:5432/despacho_abogados_test"

# ========================================
# JWT Y AUTENTICACIÓN
# ========================================
JWT_SECRET="test_jwt_secret"
JWT_EXPIRES_IN="1h"

# ========================================
# EMAIL (SMTP)
# ========================================
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER="test"
SMTP_PASS="test"
SMTP_FROM="Test <test@localhost>"

# ========================================
# SERVIDOR
# ========================================
PORT=3001
NODE_ENV=test
CORS_ORIGIN="http://localhost:5174"

# ========================================
# UPLOADS
# ========================================
UPLOAD_DEST="./test-uploads"
MAX_FILE_SIZE=1048576

# ========================================
# LOGS
# ========================================
LOG_LEVEL="error"
LOG_FILE="./test-logs/app.log"

# ========================================
# TESTING
# ========================================
TEST_DATABASE_URL="postgresql://test_user:test_password@localhost:5432/despacho_abogados_test"
ENABLE_TEST_LOGS=false
```

## 🔒 Seguridad

### Recomendaciones para Variables de Entorno:

1. **Nunca committear archivos .env reales**
2. **Usar contraseñas fuertes y únicas**
3. **Rotar claves regularmente**
4. **Usar diferentes credenciales por entorno**
5. **Limitar acceso a archivos .env**
6. **Usar gestores de secretos en producción**

### Ejemplo de .env.example:
```env
# Copiar este archivo como .env y configurar los valores
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your_jwt_secret_here"
SMTP_HOST="smtp.example.com"
SMTP_USER="your_email@example.com"
SMTP_PASS="your_password_here"
```

### Comandos Útiles:
```bash
# Generar JWT secret seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Verificar variables de entorno
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"

# Validar archivo .env
npx dotenv-cli -e .env -- node -e "console.log('Variables cargadas correctamente')"
``` 