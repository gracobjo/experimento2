#!/usr/bin/env python3
"""
Bot de Telegram para el Despacho Legal
Integra con el chatbot principal para proporcionar asistencia legal 24/7
"""

import os
import json
import logging
import requests
import telebot
from telebot import types
from datetime import datetime
import threading
import time

# Configuración de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('telegram_bot.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class LegalTelegramBot:
    def __init__(self):
        # Configuración del bot
        self.bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
        self.chatbot_url = os.getenv('CHATBOT_URL', 'http://localhost:8000')
        
        if not self.bot_token:
            raise ValueError("TELEGRAM_BOT_TOKEN no está configurado")
        
        # Inicializar bot
        self.bot = telebot.TeleBot(self.bot_token)
        
        # Almacenar sesiones de usuarios
        self.user_sessions = {}
        
        # Configurar comandos
        self.setup_commands()
        
        # Configurar handlers
        self.setup_handlers()
        
        logger.info("Bot de Telegram inicializado correctamente")
    
    def setup_commands(self):
        """Configurar comandos del bot"""
        commands = [
            types.BotCommand("start", "Iniciar conversación"),
            types.BotCommand("help", "Mostrar ayuda"),
            types.BotCommand("services", "Ver servicios legales"),
            types.BotCommand("appointment", "Agendar cita"),
            types.BotCommand("pricing", "Información de precios"),
            types.BotCommand("contact", "Información de contacto"),
            types.BotCommand("reset", "Reiniciar conversación")
        ]
        
        try:
            self.bot.set_my_commands(commands)
            logger.info("Comandos configurados correctamente")
        except Exception as e:
            logger.error(f"Error configurando comandos: {e}")
    
    def setup_handlers(self):
        """Configurar manejadores de mensajes"""
        
        @self.bot.message_handler(commands=['start'])
        def start_command(message):
            """Comando /start - Iniciar conversación"""
            user_id = message.from_user.id
            username = message.from_user.username or message.from_user.first_name
            
            welcome_message = f"""
🤖 **¡Bienvenido al Asistente Legal Virtual!**

Hola {username}, soy tu asistente legal personal. Puedo ayudarte con:

📋 **Servicios disponibles:**
• Derecho Civil
• Derecho Mercantil  
• Derecho Laboral
• Derecho Familiar
• Derecho Penal
• Derecho Administrativo

💬 **¿En qué puedo ayudarte hoy?**

También puedes usar estos comandos:
/help - Mostrar ayuda
/services - Ver servicios
/appointment - Agendar cita
/pricing - Información de precios
/contact - Contacto
            """
            
            # Crear teclado con opciones
            markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
            markup.add(
                types.KeyboardButton("📋 Ver servicios"),
                types.KeyboardButton("📅 Agendar cita"),
                types.KeyboardButton("💰 Precios"),
                types.KeyboardButton("📞 Contacto"),
                types.KeyboardButton("❓ Ayuda")
            )
            
            # Inicializar sesión del usuario
            self.user_sessions[user_id] = {
                'username': username,
                'start_time': datetime.now(),
                'message_count': 0,
                'last_activity': datetime.now()
            }
            
            self.bot.reply_to(message, welcome_message, parse_mode='Markdown', reply_markup=markup)
            logger.info(f"Usuario {user_id} ({username}) inició conversación")
        
        @self.bot.message_handler(commands=['help'])
        def help_command(message):
            """Comando /help - Mostrar ayuda"""
            help_text = """
🔧 **Comandos disponibles:**

/start - Iniciar conversación
/help - Mostrar esta ayuda
/services - Ver servicios legales
/appointment - Agendar cita
/pricing - Información de precios
/contact - Información de contacto
/reset - Reiniciar conversación

💡 **Consejos:**
• Escribe tu consulta de forma natural
• Puedes preguntar sobre cualquier área legal
• Para casos complejos, te recomendaré agendar una cita
• El bot funciona 24/7 para consultas básicas

📞 **Para casos urgentes:**
Llama directamente al despacho
            """
            
            self.bot.reply_to(message, help_text, parse_mode='Markdown')
        
        @self.bot.message_handler(commands=['services'])
        def services_command(message):
            """Comando /services - Mostrar servicios"""
            services_text = """
⚖️ **Servicios Legales Disponibles:**

🏠 **Derecho Civil**
• Contratos y acuerdos
• Propiedad y bienes raíces
• Responsabilidad civil
• Sucesiones y herencias

🏢 **Derecho Mercantil**
• Constitución de empresas
• Contratos comerciales
• Derecho societario
• Propiedad intelectual

👔 **Derecho Laboral**
• Contratos de trabajo
• Despidos y finiquitos
• Acoso laboral
• Seguridad social

👨‍👩‍👧‍👦 **Derecho Familiar**
• Divorcios
• Custodia de hijos
• Pensión alimenticia
• Adopciones

⚖️ **Derecho Penal**
• Defensa penal
• Asesoría en delitos
• Recursos penales

🏛️ **Derecho Administrativo**
• Recursos administrativos
• Licencias y permisos
• Contratación pública

💬 **¿Sobre cuál área necesitas información?**
            """
            
            self.bot.reply_to(message, services_text, parse_mode='Markdown')
        
        @self.bot.message_handler(commands=['appointment'])
        def appointment_command(message):
            """Comando /appointment - Agendar cita"""
            appointment_text = """
📅 **Agendar Cita Legal**

Para agendar una cita, puedes:

1️⃣ **Llamar directamente:**
   📞 +34 XXX XXX XXX
   📱 WhatsApp: +34 XXX XXX XXX

2️⃣ **Enviar email:**
   📧 info@despacholegal.com

3️⃣ **Horarios de atención:**
   🕘 Lunes a Viernes: 9:00 - 18:00
   🕘 Sábados: 9:00 - 14:00

4️⃣ **Consulta inicial:**
   ✅ **GRATUITA** para evaluar tu caso

💡 **¿Te gustaría que te ayude a preparar tu consulta antes de la cita?**
            """
            
            self.bot.reply_to(message, appointment_text, parse_mode='Markdown')
        
        @self.bot.message_handler(commands=['pricing'])
        def pricing_command(message):
            """Comando /pricing - Información de precios"""
            pricing_text = """
💰 **Información de Precios**

💵 **Consultas:**
• Primera consulta: **GRATUITA**
• Consultas posteriores: €50 - €300
• Depende de la complejidad del caso

📋 **Servicios por área:**

🏠 **Derecho Civil:**
• Contratos: €100 - €500
• Sucesiones: €200 - €800

🏢 **Derecho Mercantil:**
• Constitución empresa: €300 - €1000
• Contratos comerciales: €150 - €600

👔 **Derecho Laboral:**
• Despidos: €200 - €600
• Acoso laboral: €300 - €800

👨‍👩‍👧‍👦 **Derecho Familiar:**
• Divorcios: €500 - €1500
• Custodia: €300 - €800

⚖️ **Derecho Penal:**
• Defensa penal: €500 - €2000

💡 **Todos los precios incluyen IVA**
📞 **Consulta personalizada sin compromiso**
            """
            
            self.bot.reply_to(message, pricing_text, parse_mode='Markdown')
        
        @self.bot.message_handler(commands=['contact'])
        def contact_command(message):
            """Comando /contact - Información de contacto"""
            contact_text = """
📞 **Información de Contacto**

🏢 **Despacho Legal**
📍 Dirección: Calle Principal, 123
🏙️ Ciudad: Madrid
📮 Código Postal: 28001

📞 **Teléfonos:**
• Oficina: +34 XXX XXX XXX
• Móvil: +34 XXX XXX XXX
• WhatsApp: +34 XXX XXX XXX

📧 **Email:**
• info@despacholegal.com
• consultas@despacholegal.com

🌐 **Web:**
• www.despacholegal.com

🕘 **Horarios:**
• Lunes a Viernes: 9:00 - 18:00
• Sábados: 9:00 - 14:00
• Domingos: Cerrado

🚇 **Transporte:**
• Metro: Línea 1, Estación Principal
• Autobús: Líneas 10, 15, 20
            """
            
            self.bot.reply_to(message, contact_text, parse_mode='Markdown')
        
        @self.bot.message_handler(commands=['reset'])
        def reset_command(message):
            """Comando /reset - Reiniciar conversación"""
            user_id = message.from_user.id
            
            # Limpiar sesión
            if user_id in self.user_sessions:
                del self.user_sessions[user_id]
            
            reset_message = """
🔄 **Conversación reiniciada**

¡Listo! He reiniciado nuestra conversación. Puedes empezar de nuevo con:

/start - Iniciar conversación
/help - Ver comandos disponibles

¿En qué puedo ayudarte?
            """
            
            self.bot.reply_to(message, reset_message, parse_mode='Markdown')
        
        @self.bot.message_handler(func=lambda message: True)
        def handle_all_messages(message):
            """Manejar todos los demás mensajes"""
            self.process_user_message(message)
    
    def process_user_message(self, message):
        """Procesar mensaje del usuario a través del chatbot"""
        user_id = message.from_user.id
        user_text = message.text
        username = message.from_user.username or message.from_user.first_name
        
        # Actualizar sesión
        if user_id not in self.user_sessions:
            self.user_sessions[user_id] = {
                'username': username,
                'start_time': datetime.now(),
                'message_count': 0,
                'last_activity': datetime.now()
            }
        
        self.user_sessions[user_id]['message_count'] += 1
        self.user_sessions[user_id]['last_activity'] = datetime.now()
        
        logger.info(f"Usuario {user_id} ({username}): {user_text}")
        
        # Mostrar indicador de escritura
        self.bot.send_chat_action(message.chat.id, 'typing')
        
        try:
            # Enviar mensaje al chatbot
            chatbot_response = self.send_to_chatbot(user_text, f"telegram_{user_id}")
            
            # Procesar respuesta
            if chatbot_response:
                # Verificar si la respuesta contiene opciones
                if "opciones:" in chatbot_response.lower() or "puedes:" in chatbot_response.lower():
                    # Crear botones para las opciones
                    markup = self.create_options_keyboard(chatbot_response)
                    self.bot.reply_to(message, chatbot_response, parse_mode='Markdown', reply_markup=markup)
                else:
                    # Respuesta normal
                    self.bot.reply_to(message, chatbot_response, parse_mode='Markdown')
            else:
                # Respuesta de fallback
                fallback_response = """
🤖 **Respuesta automática:**

Gracias por tu mensaje. Para darte la mejor asesoría legal, te recomiendo:

📞 **Llamar al despacho:** +34 XXX XXX XXX
📧 **Enviar email:** info@despacholegal.com
📅 **Agendar cita:** /appointment

¿En qué más puedo ayudarte?
                """
                self.bot.reply_to(message, fallback_response, parse_mode='Markdown')
                
        except Exception as e:
            logger.error(f"Error procesando mensaje: {e}")
            error_response = """
❌ **Error de conexión**

Lo siento, hay un problema técnico temporal. Por favor:

📞 Llama directamente: +34 XXX XXX XXX
📧 Envía email: info@despacholegal.com

Intentaré resolver el problema pronto.
            """
            self.bot.reply_to(message, error_response, parse_mode='Markdown')
    
    def send_to_chatbot(self, message, user_id):
        """Enviar mensaje al chatbot principal"""
        try:
            response = requests.post(
                f"{self.chatbot_url}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get('response', '')
            else:
                logger.error(f"Error del chatbot: {response.status_code}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error de conexión con chatbot: {e}")
            return None
    
    def create_options_keyboard(self, response_text):
        """Crear teclado con opciones basado en la respuesta"""
        markup = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
        
        # Extraer opciones del texto (simplificado)
        options = []
        
        # Opciones comunes
        common_options = [
            "📋 Ver servicios",
            "📅 Agendar cita", 
            "💰 Precios",
            "📞 Contacto",
            "❓ Ayuda",
            "🏠 Derecho Civil",
            "🏢 Derecho Mercantil",
            "👔 Derecho Laboral",
            "👨‍👩‍👧‍👦 Derecho Familiar",
            "⚖️ Derecho Penal",
            "🏛️ Derecho Administrativo"
        ]
        
        # Agregar opciones comunes
        for option in common_options:
            if any(keyword in response_text.lower() for keyword in option.lower().split()):
                options.append(types.KeyboardButton(option))
        
        # Si no hay opciones específicas, agregar las básicas
        if not options:
            options = [
                types.KeyboardButton("📋 Ver servicios"),
                types.KeyboardButton("📅 Agendar cita"),
                types.KeyboardButton("💰 Precios"),
                types.KeyboardButton("📞 Contacto")
            ]
        
        markup.add(*options)
        return markup
    
    def cleanup_inactive_sessions(self):
        """Limpiar sesiones inactivas"""
        current_time = datetime.now()
        inactive_users = []
        
        for user_id, session in self.user_sessions.items():
            time_diff = current_time - session['last_activity']
            if time_diff.total_seconds() > 3600:  # 1 hora
                inactive_users.append(user_id)
        
        for user_id in inactive_users:
            del self.user_sessions[user_id]
            logger.info(f"Sesión inactiva eliminada para usuario {user_id}")
    
    def start_cleanup_thread(self):
        """Iniciar hilo de limpieza de sesiones"""
        def cleanup_loop():
            while True:
                self.cleanup_inactive_sessions()
                time.sleep(300)  # Cada 5 minutos
        
        cleanup_thread = threading.Thread(target=cleanup_loop, daemon=True)
        cleanup_thread.start()
        logger.info("Hilo de limpieza iniciado")
    
    def run(self):
        """Ejecutar el bot"""
        logger.info("Iniciando bot de Telegram...")
        
        # Iniciar hilo de limpieza
        self.start_cleanup_thread()
        
        # Ejecutar bot
        try:
            logger.info("Bot ejecutándose... Presiona Ctrl+C para detener")
            self.bot.polling(none_stop=True, interval=0)
        except KeyboardInterrupt:
            logger.info("Bot detenido por el usuario")
        except Exception as e:
            logger.error(f"Error ejecutando bot: {e}")

def main():
    """Función principal"""
    try:
        # Verificar variables de entorno
        if not os.getenv('TELEGRAM_BOT_TOKEN'):
            print("❌ Error: TELEGRAM_BOT_TOKEN no está configurado")
            print("💡 Configura la variable de entorno:")
            print("export TELEGRAM_BOT_TOKEN='tu_token_aqui'")
            return
        
        # Crear y ejecutar bot
        bot = LegalTelegramBot()
        bot.run()
        
    except Exception as e:
        logger.error(f"Error inicializando bot: {e}")
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main() 