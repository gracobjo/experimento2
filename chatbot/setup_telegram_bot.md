# 📁 Configuración del Archivo .env para Bot de Telegram

## 🎯 **Ubicación del Archivo .env**

El archivo `.env` debe estar en el **mismo directorio** que el script del bot de Telegram.

### **Estructura de Directorios:**
```
chatbot/
├── telegram_bot_example.py    # Script principal del bot
├── .env                       # ← AQUÍ va el archivo .env
├── requirements_telegram.txt
├── telegram_setup.md
├── env_example.txt
└── setup_telegram_bot.md
```

---

## 🔧 **Paso a Paso para Crear el .env**

### **Paso 1: Crear el archivo .env**

En el directorio `chatbot/`, ejecuta:

```bash
# En Windows (PowerShell)
New-Item -Path ".env" -ItemType File

# En Linux/Mac
touch .env
```

### **Paso 2: Editar el archivo .env**

Abre el archivo `.env` con tu editor favorito y agrega:

```bash
# Token del bot de Telegram (obtenido de @BotFather)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# URL del chatbot principal
CHATBOT_URL=http://localhost:8000

# Configuración opcional
LOG_LEVEL=INFO
CLEANUP_INTERVAL=300
```

### **Paso 3: Reemplazar con tus valores reales**

```bash
# Ejemplo con valores reales:
TELEGRAM_BOT_TOKEN=5678901234:XYZabcDEFghiJKLmnopQRS
CHATBOT_URL=http://localhost:8000
LOG_LEVEL=INFO
CLEANUP_INTERVAL=300
```

---

## 🔍 **Verificación de la Configuración**

### **Verificar que el archivo existe:**
```bash
# En Windows
dir .env

# En Linux/Mac
ls -la .env
```

### **Verificar contenido del archivo:**
```bash
# En Windows
type .env

# En Linux/Mac
cat .env
```

### **Verificar que Python puede leer las variables:**
```python
# Crear archivo test_env.py
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Verificar variables
print(f"TELEGRAM_BOT_TOKEN: {os.getenv('TELEGRAM_BOT_TOKEN')}")
print(f"CHATBOT_URL: {os.getenv('CHATBOT_URL')}")

# Ejecutar
python test_env.py
```

---

## 🚨 **Problemas Comunes y Soluciones**

### **Problema 1: Archivo .env no encontrado**
```
Error: TELEGRAM_BOT_TOKEN no está configurado
```

**Solución:**
```bash
# Verificar que estás en el directorio correcto
pwd  # Linux/Mac
cd   # Windows

# Verificar que el archivo existe
ls -la .env  # Linux/Mac
dir .env     # Windows
```

### **Problema 2: Variables no se cargan**
```python
# En telegram_bot_example.py, agregar:
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Verificar que se cargaron
if not os.getenv('TELEGRAM_BOT_TOKEN'):
    print("❌ Error: TELEGRAM_BOT_TOKEN no está configurado")
    print("💡 Verifica que el archivo .env existe y tiene el token correcto")
    exit(1)
```

### **Problema 3: Token inválido**
```
Error: Unauthorized
```

**Solución:**
1. Verificar que el token es correcto
2. Obtener nuevo token de @BotFather
3. Actualizar el archivo .env

---

## 🔒 **Seguridad del Archivo .env**

### **1. No subir a Git:**
```bash
# Agregar .env al .gitignore
echo ".env" >> .gitignore
```

### **2. Permisos de archivo (Linux/Mac):**
```bash
# Restringir permisos
chmod 600 .env
```

### **3. Backup seguro:**
```bash
# Crear backup encriptado
gpg -c .env
# Guardar .env.gpg en lugar seguro
```

---

## 🚀 **Configuración para Diferentes Entornos**

### **Desarrollo (Local):**
```bash
# .env
TELEGRAM_BOT_TOKEN=tu_token_de_desarrollo
CHATBOT_URL=http://localhost:8000
LOG_LEVEL=DEBUG
CLEANUP_INTERVAL=300
```

### **Producción:**
```bash
# .env
TELEGRAM_BOT_TOKEN=tu_token_de_produccion
CHATBOT_URL=https://tu-dominio.com
LOG_LEVEL=INFO
CLEANUP_INTERVAL=300
```

### **Testing:**
```bash
# .env.test
TELEGRAM_BOT_TOKEN=tu_token_de_test
CHATBOT_URL=http://localhost:8001
LOG_LEVEL=DEBUG
CLEANUP_INTERVAL=60
```

---

## 📋 **Comandos Útiles**

### **Crear archivo .env desde ejemplo:**
```bash
# Copiar archivo de ejemplo
cp env_example.txt .env

# Editar con tu editor
nano .env
# o
code .env
# o
notepad .env
```

### **Verificar configuración:**
```bash
# Verificar que todas las variables están configuradas
python -c "
import os
from dotenv import load_dotenv
load_dotenv()
required_vars = ['TELEGRAM_BOT_TOKEN', 'CHATBOT_URL']
missing_vars = [var for var in required_vars if not os.getenv(var)]
if missing_vars:
    print(f'❌ Variables faltantes: {missing_vars}')
else:
    print('✅ Todas las variables están configuradas')
"
```

### **Probar conexión:**
```bash
# Probar token de Telegram
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Probar conexión con chatbot
curl -X GET "$CHATBOT_URL/health"
```

---

## 🎯 **Resumen de Pasos**

1. **Crear archivo .env** en el directorio `chatbot/`
2. **Agregar variables** con tus valores reales
3. **Verificar configuración** con test_env.py
4. **Ejecutar bot** con `python telegram_bot_example.py`
5. **Probar funcionamiento** enviando mensaje al bot

---

## 📞 **Soporte**

Si tienes problemas con la configuración:

1. **Verificar archivo .env** existe y tiene el formato correcto
2. **Verificar token** es válido con curl
3. **Verificar chatbot** está ejecutándose
4. **Revisar logs** del bot para errores específicos

**Comandos de diagnóstico:**
```bash
# Verificar estructura
ls -la chatbot/

# Verificar contenido .env
cat chatbot/.env

# Probar variables
cd chatbot/
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('Token:', os.getenv('TELEGRAM_BOT_TOKEN')[:10] + '...')"
``` 