# 🤖 Guía de Instalación Completa del Chatbot

## 📋 Índice
1. [Requisitos Previos](#requisitos-previos)
2. [Instalar Python 3.11.9](#instalar-python-3119)
3. [Verificar Instalación](#verificar-instalación)
4. [Instalar pip](#instalar-pip)
5. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
6. [Instalar Dependencias](#instalar-dependencias)
7. [Descargar Modelos de IA](#descargar-modelos-de-ia)
8. [Configurar Base de Datos](#configurar-base-de-datos)
9. [Iniciar Chatbot](#iniciar-chatbot)
10. [Verificar Funcionamiento](#verificar-funcionamiento)
11. [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

### Software Necesario:
- **Python 3.11.9** (versión específica)
- **pip** (gestor de paquetes de Python)
- **PostgreSQL** (ya configurado para el proyecto principal)
- **Git** (para clonar el repositorio)

### Espacio en Disco:
- Mínimo 1GB para Python y dependencias
- 500MB adicionales para modelos de IA

---

## 🐍 Instalar Python 3.11.9

### Opción 1: Usando winget (Recomendado)
```powershell
winget install Python.Python.3.11
```

### Opción 2: Descarga Manual
1. Ve a: https://www.python.org/downloads/release/python-3119/
2. Descarga "Windows installer (64-bit)"
3. Ejecuta el instalador como administrador
4. **IMPORTANTE:** Marcar "Add Python 3.11 to PATH"

### Opción 3: Usando Microsoft Store
```powershell
# Buscar en Microsoft Store: "Python 3.11"
# O usar winget
winget install 9NRWMJP3717K
```

### Verificar Instalación:
```powershell
python --version
```

**Resultado esperado:**
```
Python 3.11.9
```

---

## ✅ Verificar Instalación

### 1. Verificar Python
```powershell
python --version
python -c "import sys; print(sys.executable)"
```

### 2. Verificar pip
```powershell
pip --version
python -m pip --version
```

### 3. Verificar PATH
```powershell
where python
where pip
```

**Resultado esperado:**
```
C:\Users\[usuario]\AppData\Local\Programs\Python\Python311\python.exe
C:\Users\[usuario]\AppData\Local\Programs\Python\Python311\Scripts\pip.exe
```

---

## 📦 Instalar pip

### Si pip no está disponible:
```powershell
# Descargar get-pip.py
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py

# Instalar pip
python get-pip.py

# Verificar instalación
python -m pip --version
```

### Actualizar pip si es necesario:
```powershell
python -m pip install --upgrade pip
```

**Resultado esperado:**
```
pip 23.x.x from C:\Users\[usuario]\AppData\Local\Programs\Python\Python311\Lib\site-packages\pip (python 3.11)
```

---

## ⚙️ Configurar Variables de Entorno

### 1. Navegar al directorio del chatbot
```powershell
cd experimento/chatbot
```

### 2. Crear archivo .env
```powershell
# Crear archivo .env
New-Item -Path ".env" -ItemType File -Force
```

### 3. Agregar configuración al .env
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

### 4. Verificar archivo .env
```powershell
Get-Content ".env"
```

---

## 📚 Instalar Dependencias

### 1. Verificar requirements.txt
```powershell
Get-Content "requirements.txt"
```

**Contenido esperado:**
```
fastapi==0.109.2
uvicorn==0.27.1
websockets==12.0
pydantic==1.10.14
starlette==0.36.3
python-dotenv==1.0.0
requests==2.31.0
spacy==3.7.2
nltk==3.8.1
python-multipart==0.0.6
```

### 2. Instalar dependencias
```powershell
python -m pip install -r requirements.txt
```

**Resultado esperado:**
```
Collecting fastapi==0.109.2
  Downloading fastapi-0.109.2-py3-none-any.whl (76 kB)
Installing collected packages: fastapi, uvicorn, websockets, pydantic, starlette, python-dotenv, requests, spacy, nltk, python-multipart
Successfully installed fastapi-0.109.2 uvicorn-0.27.1 websockets-12.0 pydantic-1.10.14 starlette-0.36.3 python-dotenv-1.0.0 requests-2.31.0 spacy-3.7.2 nltk-3.8.1 python-multipart-0.0.6
```

### 3. Verificar instalación
```powershell
python -c "import fastapi, uvicorn, spacy, nltk; print('✅ Todas las dependencias instaladas correctamente')"
```

---

## 🤖 Descargar Modelos de IA

### 1. Descargar modelo spaCy para español
```powershell
python -m spacy download es_core_news_sm
```

**Resultado esperado:**
```
✔ Download and installation successful
You can now load the package via spacy.load('es_core_news_sm')
```

### 2. Verificar modelo spaCy
```powershell
python -c "import spacy; nlp = spacy.load('es_core_news_sm'); print('✅ Modelo spaCy cargado correctamente')"
```

### 3. Descargar datos de NLTK
```powershell
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); print('✅ Datos NLTK descargados')"
```

### 4. Verificar NLTK
```powershell
python -c "import nltk; print('✅ NLTK configurado correctamente')"
```

---

## 🗄️ Configurar Base de Datos

### 1. Verificar conexión a PostgreSQL
```powershell
# Verificar que PostgreSQL esté ejecutándose
# La base de datos debe estar creada desde el backend
```

### 2. Verificar archivo .env del chatbot
```powershell
Get-Content ".env" | Select-String "DATABASE_URL"
```

**Resultado esperado:**
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/despacho_legal"
```

### 3. Probar conexión a base de datos
```powershell
python -c "
import psycopg2
try:
    conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/despacho_legal')
    print('✅ Conexión a base de datos exitosa')
    conn.close()
except Exception as e:
    print(f'❌ Error de conexión: {e}')
"
```

---

## 🚀 Iniciar Chatbot

### 1. Verificar archivo principal
```powershell
Get-Content "main.py" | Select-Object -First 10
```

### 2. Iniciar chatbot
```powershell
python main.py
```

**Resultado esperado:**
```
INFO:     Started server process [1234]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000 (Press CTRL+C to quit)
```

### 3. Alternativa usando uvicorn directamente
```powershell
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

---

## ✅ Verificar Funcionamiento

### 1. Verificar que el servidor esté ejecutándose
```powershell
# En otra terminal
curl http://localhost:5000/health
```

**Resultado esperado:**
```json
{"status": "healthy", "message": "Chatbot API is running"}
```

### 2. Verificar endpoints disponibles
```powershell
curl http://localhost:5000/docs
```

### 3. Probar endpoint de chat
```powershell
curl -X POST "http://localhost:5000/chat" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"Hola, ¿cómo estás?\"}"
```

---

## 🔧 Solución de Problemas

### Problema: "python no se reconoce"
**Solución:**
```powershell
# Verificar PATH
echo $env:PATH

# Agregar Python al PATH manualmente
$env:PATH += ";C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311;C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311\Scripts"

# O reinstalar Python marcando "Add to PATH"
```

### Problema: "pip no se reconoce"
**Solución:**
```powershell
# Usar python -m pip en lugar de pip
python -m pip install -r requirements.txt

# O instalar pip manualmente
python -m ensurepip --upgrade
```

### Problema: "Error al instalar spaCy"
**Solución:**
```powershell
# Actualizar pip primero
python -m pip install --upgrade pip

# Instalar spaCy con --no-cache
python -m pip install spacy --no-cache-dir

# Descargar modelo
python -m spacy download es_core_news_sm
```

### Problema: "Error de conexión a base de datos"
**Solución:**
```powershell
# Verificar que PostgreSQL esté ejecutándose
Get-Service postgresql*

# Verificar credenciales en .env
Get-Content ".env" | Select-String "DATABASE_URL"

# Probar conexión manual
python -c "import psycopg2; conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/despacho_legal'); print('OK'); conn.close()"
```

### Problema: "Puerto 5000 ocupado"
**Solución:**
```powershell
# Encontrar proceso que usa el puerto
netstat -ano | findstr :5000

# Terminar proceso
taskkill /PID <PID> /F

# O cambiar puerto en .env
# API_PORT=5001
```

### Problema: "Error de permisos"
**Solución:**
```powershell
# Ejecutar PowerShell como administrador
# O usar --user flag
python -m pip install --user -r requirements.txt
```

---

## 📝 Comandos Rápidos

### Instalación completa en un script:
```powershell
# Crear script de instalación
@"
# Instalar Python 3.11.9
winget install Python.Python.3.11

# Navegar al chatbot
cd experimento/chatbot

# Instalar dependencias
python -m pip install -r requirements.txt

# Descargar modelos
python -m spacy download es_core_news_sm
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"

# Crear .env
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/despacho_legal"' > .env
echo 'API_KEY="tu_api_key_segura_para_chatbot"' >> .env
echo 'API_HOST="0.0.0.0"' >> .env
echo 'API_PORT=5000' >> .env
echo 'BACKEND_URL="http://localhost:3000"' >> .env

# Iniciar chatbot
python main.py
"@ > install_chatbot.ps1

# Ejecutar script
.\install_chatbot.ps1
```

---

## 🎯 Checklist de Instalación del Chatbot

- [ ] Python 3.11.9 instalado
- [ ] pip instalado y funcionando
- [ ] Archivo .env creado con configuración correcta
- [ ] Dependencias instaladas (requirements.txt)
- [ ] Modelo spaCy descargado (es_core_news_sm)
- [ ] Datos NLTK descargados
- [ ] Conexión a base de datos verificada
- [ ] Chatbot iniciado (puerto 5000)
- [ ] Endpoints respondiendo correctamente
- [ ] Integración con backend funcionando

---

## 📞 URLs del Chatbot

- **API del Chatbot:** http://localhost:5000
- **Documentación Swagger:** http://localhost:5000/docs
- **Health Check:** http://localhost:5000/health
- **Endpoint de Chat:** http://localhost:5000/chat

---

**¡Tu chatbot está listo para funcionar! 🤖✨** 