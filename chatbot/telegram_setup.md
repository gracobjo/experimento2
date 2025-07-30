# 🤖 Guía Completa: Bot de Telegram para Despacho Legal

## 📋 **Resumen**

Este bot de Telegram integra con el chatbot principal del despacho legal para proporcionar asistencia legal 24/7 a través de Telegram.

---

## 🚀 **Paso 1: Crear el Bot en Telegram**

### **1.1. Obtener Token del Bot**

1. **Abrir Telegram** y buscar `@BotFather`
2. **Enviar comando:** `/newbot`
3. **Seguir instrucciones:**
   ```
   BotFather: Alright, a new bot. How are we going to call it? Please choose a name for your bot.
   Tú: Despacho Legal Bot
   
   BotFather: Good. Now let's choose a username for your bot. It must end in `bot`. Like this: TetrisBot or tetris_bot.
   Tú: despacho_legal_bot
   ```

4. **Recibir token:**
   ```
   BotFather: Done! Congratulations on your new bot. You will find it at t.me/despacho_legal_bot
   
   Use this token to access the HTTP API:
   1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### **1.2. Configurar el Bot**

Enviar estos comandos a `@BotFather`:

```
/setdescription - Descripción del bot
/setabouttext - Información sobre el bot
/setuserpic - Foto del bot (opcional)
/setcommands - Comandos del bot
```

**Ejemplo de comandos:**
```
start - Iniciar conversación
help - Mostrar ayuda
services - Ver servicios legales
appointment - Agendar cita
pricing - Información de precios
contact - Información de contacto
reset - Reiniciar conversación
```

---

## 🔧 **Paso 2: Configuración del Entorno**

### **2.1. Variables de Entorno**

Crear archivo `.env`:

```bash
# Token del bot de Telegram
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# URL del chatbot principal
CHATBOT_URL=http://localhost:8000

# Configuración opcional
LOG_LEVEL=INFO
CLEANUP_INTERVAL=300
```

### **2.2. Instalar Dependencias**

```bash
# Instalar dependencias
pip install -r requirements_telegram.txt

# O instalar manualmente
pip install pyTelegramBotAPI requests python-dotenv
```

---

## 🏃‍♂️ **Paso 3: Ejecutar el Bot**

### **3.1. Ejecución Básica**

```bash
# Ejecutar bot
python telegram_bot_example.py
```

### **3.2. Ejecución en Producción**

```bash
# Con variables de entorno
export TELEGRAM_BOT_TOKEN="tu_token"
export CHATBOT_URL="https://tu-chatbot.com"
python telegram_bot_example.py
```

### **3.3. Ejecución con PM2 (Recomendado)**

```bash
# Instalar PM2
npm install -g pm2

# Crear archivo ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'telegram-bot',
    script: 'telegram_bot_example.py',
    interpreter: 'python3',
    env: {
      TELEGRAM_BOT_TOKEN: 'tu_token',
      CHATBOT_URL: 'https://tu-chatbot.com'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
EOF

# Ejecutar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## 📱 **Paso 4: Funcionalidades del Bot**

### **4.1. Comandos Disponibles**

| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `/start` | Iniciar conversación | `/start` |
| `/help` | Mostrar ayuda | `/help` |
| `/services` | Ver servicios legales | `/services` |
| `/appointment` | Agendar cita | `/appointment` |
| `/pricing` | Información de precios | `/pricing` |
| `/contact` | Información de contacto | `/contact` |
| `/reset` | Reiniciar conversación | `/reset` |

### **4.2. Flujo de Conversación**

```
Usuario: /start
Bot: 🤖 ¡Bienvenido al Asistente Legal Virtual!
     [Botones: Ver servicios, Agendar cita, Precios, Contacto]

Usuario: Necesito ayuda con un contrato
Bot: Has indicado el área: Derecho Civil...
     [Botones: Derecho Civil, Derecho Mercantil, etc.]

Usuario: [Selecciona botón]
Bot: Respuesta específica del área seleccionada
```

### **4.3. Integración con Chatbot Principal**

```python
# El bot envía mensajes al chatbot principal
response = requests.post(
    "http://localhost:8000/chat",
    json={
        "text": "Necesito ayuda con un contrato",
        "language": "es", 
        "user_id": "telegram_123456"
    }
)

# Recibe respuesta y la formatea para Telegram
chatbot_response = response.json()["response"]
# Formatear con Markdown y botones
```

---

## 🔒 **Paso 5: Seguridad y Configuración**

### **5.1. Configuración de Seguridad**

```python
# En telegram_bot_example.py
class LegalTelegramBot:
    def __init__(self):
        # Verificar token
        if not self.bot_token:
            raise ValueError("TELEGRAM_BOT_TOKEN no está configurado")
        
        # Configurar rate limiting
        self.rate_limit = {}  # user_id -> timestamp
        
        # Configurar usuarios permitidos (opcional)
        self.allowed_users = set()  # IDs de usuarios permitidos
```

### **5.2. Rate Limiting**

```python
def check_rate_limit(self, user_id):
    """Verificar límite de mensajes por usuario"""
    current_time = time.time()
    
    if user_id in self.rate_limit:
        last_message = self.rate_limit[user_id]
        if current_time - last_message < 1:  # 1 segundo entre mensajes
            return False
    
    self.rate_limit[user_id] = current_time
    return True
```

### **5.3. Logs y Monitoreo**

```python
# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('telegram_bot.log'),
        logging.StreamHandler()
    ]
)

# Métricas de uso
def log_user_activity(self, user_id, action):
    logger.info(f"Usuario {user_id}: {action}")
```

---

## 🚀 **Paso 6: Despliegue en Producción**

### **6.1. Docker**

```dockerfile
FROM python:3.9-slim

WORKDIR /app

# Instalar dependencias
COPY requirements_telegram.txt .
RUN pip install -r requirements_telegram.txt

# Copiar código
COPY telegram_bot_example.py .
COPY .env .

# Ejecutar bot
CMD ["python", "telegram_bot_example.py"]
```

```bash
# Construir imagen
docker build -t telegram-bot .

# Ejecutar contenedor
docker run -d \
  --name telegram-bot \
  --env-file .env \
  telegram-bot
```

### **6.2. Docker Compose**

```yaml
# docker-compose.yml
version: '3.8'

services:
  telegram-bot:
    build: .
    environment:
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - CHATBOT_URL=${CHATBOT_URL}
    restart: unless-stopped
    depends_on:
      - chatbot
    networks:
      - legal-network

  chatbot:
    build: ../chatbot
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    networks:
      - legal-network

networks:
  legal-network:
    driver: bridge
```

### **6.3. Nginx (Proxy Reverso)**

```nginx
# /etc/nginx/sites-available/telegram-bot
server {
    listen 80;
    server_name tu-dominio.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 📊 **Paso 7: Monitoreo y Mantenimiento**

### **7.1. Health Check**

```python
def health_check(self):
    """Verificar estado del bot"""
    try:
        # Verificar conexión con Telegram
        bot_info = self.bot.get_me()
        
        # Verificar conexión con chatbot
        response = requests.get(f"{self.chatbot_url}/health", timeout=5)
        
        return {
            "status": "healthy",
            "bot_info": bot_info.username,
            "chatbot_status": response.status_code
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }
```

### **7.2. Métricas de Uso**

```python
# Contadores de uso
self.metrics = {
    'total_messages': 0,
    'active_users': 0,
    'commands_used': {},
    'errors': 0
}

def update_metrics(self, action, user_id=None):
    """Actualizar métricas"""
    self.metrics['total_messages'] += 1
    
    if user_id:
        if user_id not in self.user_sessions:
            self.metrics['active_users'] += 1
    
    if action in self.metrics['commands_used']:
        self.metrics['commands_used'][action] += 1
    else:
        self.metrics['commands_used'][action] = 1
```

### **7.3. Backup y Recuperación**

```bash
# Script de backup
#!/bin/bash
# backup_telegram_bot.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/telegram-bot"

# Crear backup
mkdir -p $BACKUP_DIR
cp telegram_bot_example.py $BACKUP_DIR/telegram_bot_$DATE.py
cp .env $BACKUP_DIR/env_$DATE
cp telegram_bot.log $BACKUP_DIR/log_$DATE

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.py" -mtime +7 -delete
find $BACKUP_DIR -name "env_*" -mtime +7 -delete
find $BACKUP_DIR -name "log_*" -mtime +7 -delete

echo "Backup completado: $DATE"
```

---

## 🔧 **Paso 8: Personalización**

### **8.1. Personalizar Respuestas**

```python
# En telegram_bot_example.py
CUSTOM_RESPONSES = {
    'greeting': [
        "¡Hola! Soy tu asistente legal virtual 🤖",
        "Bienvenido al despacho legal ⚖️",
        "¡Hola! ¿En qué puedo ayudarte hoy? 💼"
    ],
    'farewell': [
        "¡Que tengas un excelente día! 👋",
        "Gracias por contactarnos. ¡Hasta pronto! 🙏",
        "Si necesitas más ayuda, no dudes en escribirnos 📞"
    ]
}

def get_random_response(self, category):
    """Obtener respuesta aleatoria de una categoría"""
    responses = CUSTOM_RESPONSES.get(category, [])
    return random.choice(responses) if responses else ""
```

### **8.2. Agregar Nuevos Comandos**

```python
@self.bot.message_handler(commands=['faq'])
def faq_command(message):
    """Comando /faq - Preguntas frecuentes"""
    faq_text = """
❓ **Preguntas Frecuentes:**

Q: ¿Cuánto cuesta la primera consulta?
A: Es completamente GRATUITA.

Q: ¿Atienden casos urgentes?
A: Sí, tenemos disponibilidad inmediata.

Q: ¿Puedo consultar por WhatsApp?
A: Sí, +34 XXX XXX XXX

Q: ¿Trabajan los fines de semana?
A: Sábados de 9:00 a 14:00.
    """
    
    self.bot.reply_to(message, faq_text, parse_mode='Markdown')
```

### **8.3. Integración con Base de Datos**

```python
import sqlite3

class DatabaseManager:
    def __init__(self):
        self.db_path = "telegram_bot.db"
        self.init_database()
    
    def init_database(self):
        """Inicializar base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                message_count INTEGER DEFAULT 0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                message_text TEXT,
                response_text TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def save_user(self, user_id, username, first_name, last_name):
        """Guardar usuario en base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO users 
            (user_id, username, first_name, last_name, last_activity)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user_id, username, first_name, last_name))
        
        conn.commit()
        conn.close()
    
    def save_message(self, user_id, message_text, response_text):
        """Guardar mensaje en base de datos"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO messages (user_id, message_text, response_text)
            VALUES (?, ?, ?)
        ''', (user_id, message_text, response_text))
        
        cursor.execute('''
            UPDATE users 
            SET message_count = message_count + 1, 
                last_activity = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (user_id,))
        
        conn.commit()
        conn.close()
```

---

## 🎯 **Paso 9: Testing**

### **9.1. Tests Unitarios**

```python
# test_telegram_bot.py
import unittest
from unittest.mock import Mock, patch
from telegram_bot_example import LegalTelegramBot

class TestTelegramBot(unittest.TestCase):
    def setUp(self):
        self.bot = LegalTelegramBot()
    
    def test_start_command(self):
        """Test del comando /start"""
        message = Mock()
        message.from_user.id = 123
        message.from_user.username = "test_user"
        
        with patch.object(self.bot.bot, 'reply_to') as mock_reply:
            self.bot.start_command(message)
            mock_reply.assert_called_once()
    
    def test_chatbot_integration(self):
        """Test de integración con chatbot"""
        with patch('requests.post') as mock_post:
            mock_post.return_value.status_code = 200
            mock_post.return_value.json.return_value = {"response": "Test response"}
            
            response = self.bot.send_to_chatbot("test message", "test_user")
            self.assertEqual(response, "Test response")

if __name__ == '__main__':
    unittest.main()
```

### **9.2. Tests de Integración**

```bash
# Script de test de integración
#!/bin/bash
# test_integration.sh

echo "🧪 Ejecutando tests de integración..."

# Test 1: Verificar que el bot responde
echo "Test 1: Verificar respuesta del bot"
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Test 2: Verificar conexión con chatbot
echo "Test 2: Verificar conexión con chatbot"
curl -X GET "$CHATBOT_URL/health"

# Test 3: Verificar envío de mensaje
echo "Test 3: Verificar envío de mensaje"
curl -X POST "$CHATBOT_URL/chat" \
  -H "Content-Type: application/json" \
  -d '{"text": "test", "language": "es", "user_id": "test"}'

echo "✅ Tests completados"
```

---

## 📈 **Paso 10: Análisis y Reportes**

### **10.1. Generar Reportes**

```python
def generate_report(self):
    """Generar reporte de uso"""
    report = {
        "fecha": datetime.now().strftime("%Y-%m-%d"),
        "usuarios_activos": len(self.user_sessions),
        "total_mensajes": self.metrics['total_messages'],
        "comandos_mas_usados": sorted(
            self.metrics['commands_used'].items(),
            key=lambda x: x[1],
            reverse=True
        )[:5],
        "errores": self.metrics['errors']
    }
    
    return report

def save_report(self, report):
    """Guardar reporte en archivo"""
    filename = f"reporte_{datetime.now().strftime('%Y%m%d')}.json"
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
```

### **10.2. Dashboard Web**

```python
# dashboard.py
from flask import Flask, render_template
import json

app = Flask(__name__)

@app.route('/')
def dashboard():
    """Dashboard de métricas del bot"""
    # Cargar métricas
    with open('metrics.json', 'r') as f:
        metrics = json.load(f)
    
    return render_template('dashboard.html', metrics=metrics)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

---

## 🚨 **Solución de Problemas**

### **Problema 1: Bot no responde**
```bash
# Verificar token
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Verificar logs
tail -f telegram_bot.log

# Verificar conexión con chatbot
curl -X GET "$CHATBOT_URL/health"
```

### **Problema 2: Error de conexión**
```python
# Agregar manejo de errores
try:
    response = requests.post(url, json=data, timeout=10)
except requests.exceptions.Timeout:
    logger.error("Timeout en conexión con chatbot")
except requests.exceptions.ConnectionError:
    logger.error("Error de conexión con chatbot")
```

### **Problema 3: Bot bloqueado**
```bash
# Verificar estado del bot
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getMe"

# Si está bloqueado, contactar a @BotFather
# Enviar: /mybots -> Seleccionar bot -> Bot Settings -> Group Privacy -> Turn off
```

---

## 📞 **Soporte**

### **Recursos Útiles:**
- [Documentación de pyTelegramBotAPI](https://github.com/eternnoir/pyTelegramBotAPI)
- [API de Telegram Bot](https://core.telegram.org/bots/api)
- [@BotFather](https://t.me/botfather) - Para configurar bots

### **Contacto:**
- 📧 Email: soporte@despacholegal.com
- 📞 Teléfono: +34 XXX XXX XXX
- 💬 Telegram: @despacho_legal_soporte

---

*Última actualización: Diciembre 2024*
*Versión del bot: 1.0* 