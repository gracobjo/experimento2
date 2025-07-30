from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import json
from datetime import datetime
import time
import re
import asyncio
from threading import Thread

app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    text: str
    language: str = "es"
    user_id: Optional[str] = None

# Simular conversaciones activas
active_conversations = {}
conversation_states = {}
last_activity = {}
warned_inactive = {}

# Configuración de inactividad (en segundos)
INACTIVITY_TIMEOUT = 300  # 5 minutos
WARNING_TIMEOUT = 240     # 4 minutos (1 minuto antes del cierre)

def cleanup_inactive_sessions():
    """Limpiar sesiones inactivas"""
    current_time = time.time()
    inactive_users = []
    
    for user_id, last_time in last_activity.items():
        if current_time - last_time > INACTIVITY_TIMEOUT:
            inactive_users.append(user_id)
    
    for user_id in inactive_users:
        print(f"🔄 Cerrando sesión inactiva para usuario: {user_id}")
        del last_activity[user_id]
        del warned_inactive[user_id]
        conversation_states.pop(user_id, None)
        active_conversations.pop(user_id, None)

def check_inactivity_warning(user_id: str) -> Optional[str]:
    """Verificar si debe enviar advertencia de inactividad"""
    if user_id not in last_activity:
        return None
    
    current_time = time.time()
    time_since_activity = current_time - last_activity[user_id]
    
    # Si han pasado 4 minutos y no se ha advertido
    if time_since_activity > WARNING_TIMEOUT and not warned_inactive.get(user_id, False):
        warned_inactive[user_id] = True
        return "⚠️ **Advertencia de inactividad:** Tu sesión se cerrará en 1 minuto por inactividad. Escribe algo para mantener la conversación activa."
    
    # Si han pasado 5 minutos, cerrar sesión
    if time_since_activity > INACTIVITY_TIMEOUT:
        cleanup_inactive_sessions()
        return "🔄 **Sesión cerrada:** Tu sesión ha sido cerrada por inactividad. Puedes iniciar una nueva conversación cuando quieras."
    
    return None

def update_user_activity(user_id: str):
    """Actualizar la actividad del usuario"""
    last_activity[user_id] = time.time()
    warned_inactive[user_id] = False

def validate_name(name: str) -> tuple[bool, str]:
    """Validar nombre completo"""
    name = name.strip()
    
    if len(name) < 3:
        return False, "El nombre debe tener al menos 3 caracteres."
    
    if len(name) > 100:
        return False, "El nombre es demasiado largo."
    
    # Verificar que contenga al menos un espacio (nombre y apellido)
    if ' ' not in name:
        return False, "Por favor, ingresa tu nombre completo (nombre y apellido)."
    
    # Verificar que solo contenga letras, espacios y algunos caracteres especiales
    if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', name):
        return False, "El nombre solo debe contener letras y espacios."
    
    return True, ""

def validate_age(age_str: str) -> tuple[bool, str]:
    """Validar edad"""
    try:
        age = int(age_str.strip())
        if age < 18:
            return False, "Debes ser mayor de edad (18 años o más) para agendar una cita."
        if age > 120:
            return False, "Por favor, ingresa una edad válida (entre 18 y 120 años)."
        return True, ""
    except ValueError:
        return False, "Por favor, ingresa una edad válida (número entero)."

def validate_phone(phone: str) -> tuple[bool, str]:
    """Validar número de teléfono"""
    phone = phone.strip()
    
    # Remover espacios, guiones y paréntesis
    phone_clean = re.sub(r'[\s\-\(\)]', '', phone)
    
    if len(phone_clean) < 9:
        return False, "El número de teléfono debe tener al menos 9 dígitos."
    
    if len(phone_clean) > 15:
        return False, "El número de teléfono es demasiado largo."
    
    # Verificar que solo contenga dígitos
    if not phone_clean.isdigit():
        return False, "El número de teléfono solo debe contener dígitos."
    
    return True, ""

def validate_email(email: str) -> tuple[bool, str]:
    """Validar correo electrónico"""
    email = email.strip()
    
    if len(email) < 5:
        return False, "El correo electrónico es demasiado corto."
    
    if len(email) > 100:
        return False, "El correo electrónico es demasiado largo."
    
    # Patrón básico para validar email
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        return False, "Por favor, ingresa un correo electrónico válido (ejemplo: usuario@dominio.com)."
    
    return True, ""

def validate_reason(reason: str) -> tuple[bool, str]:
    """Validar motivo de consulta"""
    reason = reason.strip()
    
    if len(reason) < 5:
        return False, "Por favor, describe el motivo de tu consulta con más detalle (mínimo 5 caracteres)."
    
    if len(reason) > 500:
        return False, "El motivo de la consulta es demasiado largo."
    
    # Verificar que no sea solo caracteres repetidos
    if len(set(reason)) < 3:
        return False, "Por favor, ingresa una descripción más específica del motivo de tu consulta."
    
    return True, ""

def detect_intent(text: str) -> Dict[str, float]:
    """Detectar intenciones básicas con mejor precisión"""
    text_lower = text.lower().strip()
    
    intents = {
        "greeting": 0.0,
        "appointment": 0.0,
        "information": 0.0,
        "contact": 0.0,
        "farewell": 0.0,
        "thanks": 0.0,
        "affirmative": 0.0,
        "negative": 0.0,
        "menu": 0.0
    }
    
    # Saludos
    if any(word in text_lower for word in ["hola", "buenos días", "buenas", "hey", "hi", "hello"]):
        intents["greeting"] = 0.9
    
    # Citas
    if any(word in text_lower for word in ["cita", "citas", "agendar", "programar", "consulta", "reservar"]):
        intents["appointment"] = 0.8
    
    # Información
    if any(word in text_lower for word in ["información", "info", "servicios", "honorarios", "precios", "costos", "tarifas"]):
        intents["information"] = 0.8
    
    # Contacto
    if any(word in text_lower for word in ["contacto", "teléfono", "email", "dirección", "ubicación", "dónde"]):
        intents["contact"] = 0.8
    
    # Despedidas
    if any(word in text_lower for word in ["adiós", "hasta luego", "chao", "nos vemos", "bye", "salir"]):
        intents["farewell"] = 0.9
    
    # Agradecimientos
    if any(word in text_lower for word in ["gracias", "thank you", "thanks"]):
        intents["thanks"] = 0.8
    
    # Respuestas afirmativas
    if any(word in text_lower for word in ["sí", "si", "yes", "ok", "vale", "correcto", "confirmo", "claro", "por supuesto"]):
        intents["affirmative"] = 0.7
    
    # Respuestas negativas
    if any(word in text_lower for word in ["no", "nop", "cancelar", "no gracias"]):
        intents["negative"] = 0.7
    
    # Solicitud de menú
    if any(word in text_lower for word in ["menú", "opciones", "qué puedes hacer", "ayuda", "qué servicios"]):
        intents["menu"] = 0.9
    
    return intents

def show_main_menu() -> str:
    """Mostrar menú principal"""
    return """📋 **¿En qué puedo ayudarte?**

🎯 **Opciones disponibles:**

1️⃣ **Agendar una cita**
   Para consulta personalizada con nuestros abogados

2️⃣ **Información general**
   Sobre servicios, honorarios, horarios

3️⃣ **Contacto directo**
   Teléfono, email, ubicación

4️⃣ **Otro asunto**
   Especifica tu consulta

Responde con el número de la opción que prefieras o escribe tu consulta directamente."""

def show_information_menu() -> str:
    """Mostrar menú de información"""
    return """📋 **Información General del Despacho:**

⚖️ **Servicios disponibles:**
• Derecho Civil y Mercantil
• Derecho Laboral
• Derecho Familiar
• Derecho Penal
• Derecho Administrativo

💰 **Honorarios:**
• Consulta inicial: Gratuita
• Rango promedio: €50 - €300
• Depende de la complejidad del caso

🕐 **Horarios de atención:**
• Lunes a Viernes: 9:00 AM - 6:00 PM
• Sábados: 9:00 AM - 1:00 PM

¿Te gustaría agendar una cita para discutir tu caso específico?"""

def show_contact_menu() -> str:
    """Mostrar información de contacto"""
    return """📞 **Información de Contacto:**

📱 **Teléfono:** (555) 123-4567
📧 **Email:** info@despacholegal.com
📍 **Dirección:** Av. Principal 123, Madrid

🕐 **Horarios de atención:**
• Lunes a Viernes: 9:00 AM - 6:00 PM
• Sábados: 9:00 AM - 1:00 PM

¿Te gustaría agendar una cita o tienes alguna otra consulta?"""

def handle_appointment_flow(user_id: str, text: str) -> str:
    """Manejar el flujo de citas con validaciones"""
    if user_id not in conversation_states:
        conversation_states[user_id] = {"step": "name", "data": {}}
    
    state = conversation_states[user_id]
    text_lower = text.lower().strip()
    
    if state["step"] == "name":
        is_valid, error_msg = validate_name(text)
        if not is_valid:
            return f"❌ {error_msg}\n\nPor favor, ingresa tu nombre completo (ejemplo: Juan Pérez López):"
        
        state["data"]["name"] = text
        state["step"] = "age"
        return "✅ Gracias. ¿Cuál es tu edad?"
    
    elif state["step"] == "age":
        is_valid, error_msg = validate_age(text)
        if not is_valid:
            return f"❌ {error_msg}\n\nPor favor, ingresa tu edad (número entero):"
        
        state["data"]["age"] = int(text)
        state["step"] = "phone"
        return "✅ Perfecto. ¿Cuál es tu número de teléfono de contacto?"
    
    elif state["step"] == "phone":
        is_valid, error_msg = validate_phone(text)
        if not is_valid:
            return f"❌ {error_msg}\n\nPor favor, ingresa tu número de teléfono (ejemplo: 612345678):"
        
        state["data"]["phone"] = text
        state["step"] = "email"
        return "✅ Excelente. ¿Cuál es tu correo electrónico?"
    
    elif state["step"] == "email":
        is_valid, error_msg = validate_email(text)
        if not is_valid:
            return f"❌ {error_msg}\n\nPor favor, ingresa tu correo electrónico (ejemplo: usuario@email.com):"
        
        state["data"]["email"] = text
        state["step"] = "reason"
        return "✅ Muy bien. ¿Cuál es el motivo de tu consulta? (Por ejemplo: despido, acoso laboral, impago de salarios, etc.)"
    
    elif state["step"] == "reason":
        is_valid, error_msg = validate_reason(text)
        if not is_valid:
            return f"❌ {error_msg}\n\nPor favor, describe el motivo de tu consulta con más detalle:"
        
        state["data"]["reason"] = text
        state["step"] = "date_selection"
        return """✅ Perfecto. ¿Qué fecha prefieres para tu consulta?

📅 **Opciones disponibles:**
• 1. Lunes 21 de Julio a las 09:00
• 2. Lunes 21 de Julio a las 11:00
• 3. Martes 22 de Julio a las 10:00
• 4. Miércoles 23 de Julio a las 16:00
• 5. Jueves 24 de Julio a las 17:00

Responde con el número de la opción que prefieras."""
    
    elif state["step"] == "date_selection":
        # Procesar selección de fecha
        if text.strip() in ["1", "2", "3", "4", "5"]:
            dates = [
                "Lunes 21 de Julio a las 09:00",
                "Lunes 21 de Julio a las 11:00", 
                "Martes 22 de Julio a las 10:00",
                "Miércoles 23 de Julio a las 16:00",
                "Jueves 24 de Julio a las 17:00"
            ]
            selected_date = dates[int(text) - 1]
            state["data"]["selected_date"] = selected_date
            state["step"] = "confirmation"
            return f"✅ Perfecto. Has seleccionado: {selected_date}\n\n¿Confirmas esta cita?"
        
        # Si el usuario envía una fecha formateada directamente
        elif "lunes" in text_lower or "martes" in text_lower or "miércoles" in text_lower or "jueves" in text_lower:
            state["data"]["selected_date"] = text
            state["step"] = "confirmation"
            return f"✅ Perfecto. Has seleccionado: {text}\n\n¿Confirmas esta cita?"
        
        else:
            return "❌ Por favor, selecciona una opción válida (1-5) o escribe la fecha completa."
    
    elif state["step"] == "confirmation":
        if any(word in text_lower for word in ["sí", "si", "yes", "confirmo", "ok", "vale", "correcto"]):
            # Cita confirmada
            data = state["data"]
            del conversation_states[user_id]
            return f"""🎉 ¡Excelente! Tu cita ha sido confirmada:

📅 **Detalles de la cita:**
• Nombre: {data.get('name', 'N/A')}
• Edad: {data.get('age', 'N/A')} años
• Fecha: {data.get('selected_date', 'N/A')}
• Motivo: {data.get('reason', 'N/A')}

📞 **Información de contacto:**
• Teléfono: {data.get('phone', 'N/A')}
• Email: {data.get('email', 'N/A')}

📧 Te enviaremos un recordatorio por email.
📱 También recibirás un SMS de confirmación.

¡Nos vemos pronto! 👨‍💼"""
        
        elif any(word in text_lower for word in ["no", "cancelar", "cambiar", "nop"]):
            state["step"] = "date_selection"
            return "🔄 Entendido. ¿Qué fecha prefieres para tu consulta?\n\n📅 **Opciones disponibles:**\n• 1. Lunes 21 de Julio a las 09:00\n• 2. Lunes 21 de Julio a las 11:00\n• 3. Martes 22 de Julio a las 10:00\n• 4. Miércoles 23 de Julio a las 16:00\n• 5. Jueves 24 de Julio a las 17:00"
        
        else:
            return "❓ Por favor, responde 'sí' para confirmar o 'no' para cambiar la fecha."
    
    return "❌ Error en el flujo de citas."

@app.post("/chat")
async def chat(message: Message):
    user_id = message.user_id or "anonymous"
    text = message.text.strip()
    
    # Actualizar actividad del usuario
    update_user_activity(user_id)
    
    # Verificar inactividad
    inactivity_warning = check_inactivity_warning(user_id)
    if inactivity_warning:
        return {"response": inactivity_warning}
    
    # Detectar intenciones
    intents = detect_intent(text)
    
    # Si hay una conversación activa de citas, manejarla PRIMERO
    if user_id in conversation_states:
        appointment_response = handle_appointment_flow(user_id, text)
        if appointment_response:
            return {"response": appointment_response}
    
    # Si no hay conversación activa, verificar si el texto parece una fecha seleccionada
    # y si es así, ignorarlo y mostrar menú
    text_lower = text.lower()
    if any(word in text_lower for word in ["he seleccionado", "seleccionado", "opción", "fecha"]) and any(month in text_lower for month in ["julio", "enero", "febrero", "marzo", "abril", "mayo", "junio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]):
        return {"response": "Para agendar una cita, primero necesito algunos datos. " + show_main_menu()}
    
    # Manejar opciones numéricas del menú
    if text.strip() in ["1", "1️⃣", "uno", "primero"]:
        conversation_states[user_id] = {"step": "name", "data": {}}
        return {"response": "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo? (ejemplo: Juan Pérez López)"}
    
    if text.strip() in ["2", "2️⃣", "dos", "segundo"]:
        return {"response": show_information_menu()}
    
    if text.strip() in ["3", "3️⃣", "tres", "tercero"]:
        return {"response": show_contact_menu()}
    
    if text.strip() in ["4", "4️⃣", "cuatro", "cuarto"]:
        return {"response": "Por favor, cuéntame más sobre tu consulta específica. ¿En qué puedo ayudarte?"}
    
    # Manejar saludos
    if intents["greeting"] > 0.5:
        # Limpiar cualquier sesión anterior al saludar
        cleanup_user_session(user_id)
        return {"response": "¡Hola! Soy el asistente virtual del despacho legal. " + show_main_menu()}
    
    # Manejar solicitudes de citas
    if intents["appointment"] > 0.5:
        conversation_states[user_id] = {"step": "name", "data": {}}
        return {"response": "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo? (ejemplo: Juan Pérez López)"}
    
    # Manejar solicitudes de información
    if intents["information"] > 0.5:
        return {"response": show_information_menu()}
    
    # Manejar solicitudes de contacto
    if intents["contact"] > 0.5:
        return {"response": show_contact_menu()}
    
    # Manejar solicitudes de menú
    if intents["menu"] > 0.5:
        return {"response": show_main_menu()}
    
    # Manejar despedidas
    if intents["farewell"] > 0.5:
        # Limpiar sesión del usuario
        cleanup_user_session(user_id)
        return {"response": "¡Hasta luego! Ha sido un placer ayudarte. Si necesitas algo más, no dudes en volver."}
    
    # Manejar agradecimientos
    if intents["thanks"] > 0.5:
        return {"response": "¡De nada! Es un placer poder ayudarte. ¿Hay algo más en lo que pueda asistirte?"}
    
    # Manejar respuestas afirmativas sin contexto claro
    if intents["affirmative"] > 0.5:
        return {"response": "Entiendo que estás de acuerdo. " + show_main_menu()}
    
    # Manejar respuestas negativas sin contexto claro
    if intents["negative"] > 0.5:
        return {"response": "Entiendo. " + show_main_menu()}
    
    # Para textos cortos o ambiguos, mostrar menú
    if len(text) < 10 or text.lower() in ["si", "sí", "vale", "ok", "claro"]:
        return {"response": "Para ayudarte mejor, " + show_main_menu()}
    
    # Respuesta por defecto con menú
    return {"response": "Entiendo tu consulta. " + show_main_menu()}

def cleanup_user_session(user_id: str):
    """Limpiar sesión de un usuario específico"""
    print(f"🧹 Limpiando sesión para usuario: {user_id}")
    last_activity.pop(user_id, None)
    warned_inactive.pop(user_id, None)
    conversation_states.pop(user_id, None)
    active_conversations.pop(user_id, None)
    print(f"✅ Sesión limpiada para usuario: {user_id}")
    print(f"📊 Estado actual - Usuarios activos: {len(last_activity)}, Conversaciones: {len(conversation_states)}")

@app.post("/end_chat")
async def end_chat(request: Request):
    """Endpoint para cerrar chat manualmente"""
    try:
        data = await request.json()
        user_id = data.get("user_id", "anonymous")
        cleanup_user_session(user_id)
        return {"status": "ended", "message": "Chat cerrado exitosamente"}
    except Exception as e:
        return {"status": "error", "message": f"Error al cerrar chat: {str(e)}"}

@app.get("/health")
async def health_check():
    """Endpoint de salud del sistema"""
    active_sessions = len(last_activity)
    return {
        "status": "ok", 
        "timestamp": datetime.now().isoformat(),
        "active_sessions": active_sessions,
        "inactivity_timeout": INACTIVITY_TIMEOUT,
        "warning_timeout": WARNING_TIMEOUT
    }

def background_cleanup():
    """Función de limpieza en segundo plano"""
    while True:
        try:
            cleanup_inactive_sessions()
            time.sleep(60)  # Verificar cada minuto
        except Exception as e:
            print(f"Error en limpieza de fondo: {e}")
            time.sleep(60)

# Iniciar limpieza en segundo plano
cleanup_thread = Thread(target=background_cleanup, daemon=True)
cleanup_thread.start()

def reset_all_sessions():
    """Limpiar todas las sesiones al inicio"""
    global last_activity, warned_inactive, conversation_states, active_conversations
    last_activity.clear()
    warned_inactive.clear()
    conversation_states.clear()
    active_conversations.clear()
    print("🧹 Todas las sesiones han sido limpiadas al inicio")

if __name__ == "__main__":
    import uvicorn
    print(f"🤖 Chatbot iniciado con timeout de inactividad: {INACTIVITY_TIMEOUT} segundos")
    print(f"⚠️  Advertencia de inactividad: {WARNING_TIMEOUT} segundos")
    reset_all_sessions()
    uvicorn.run(app, host="0.0.0.0", port=8000) 