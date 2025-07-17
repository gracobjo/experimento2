from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import nltk
import requests
import json
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta
import random
from typing import Optional, Dict, Any

# ============================================================================
# MEJORAS NLP SIMPLES (COMPATIBLE CON WINDOWS)
# ============================================================================

# Cargar sentence-transformers para similitud semántica
SENTENCE_TRANSFORMERS_AVAILABLE = False
embedding_model = None

try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
    print("[NLP] sentence-transformers disponible")
    
    # Cargar modelo de embeddings
    try:
        embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("[NLP] Modelo de embeddings cargado")
    except Exception as e:
        print(f"[NLP] Error cargando modelo de embeddings: {e}")
        SENTENCE_TRANSFORMERS_AVAILABLE = False
        
except ImportError:
    print("[NLP] sentence-transformers no disponible")

# Verificar servicios en la nube
CLOUD_SERVICES_AVAILABLE = {
    "openai": False,
    "anthropic": False,
    "cohere": False
}

try:
    import openai
    CLOUD_SERVICES_AVAILABLE["openai"] = True
    print("[NLP] OpenAI disponible")
except ImportError:
    print("[NLP] OpenAI no disponible")

try:
    import anthropic
    CLOUD_SERVICES_AVAILABLE["anthropic"] = True
    print("[NLP] Anthropic disponible")
except ImportError:
    print("[NLP] Anthropic no disponible")

try:
    import cohere
    CLOUD_SERVICES_AVAILABLE["cohere"] = True
    print("[NLP] Cohere disponible")
except ImportError:
    print("[NLP] Cohere no disponible")


# Cargar variables de entorno
load_dotenv()

# Configurar Hugging Face
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
print(f"[DEBUG] HF_API_TOKEN loaded: {bool(HF_API_TOKEN)}")
# Cambiar a un modelo abierto y gratuito que esté disponible en la API
HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"

# Configuración del backend
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")

# Descargar recursos necesarios de NLTK
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

# Cargar modelos de spaCy
try:
    nlp_es = spacy.load("es_core_news_sm")
    nlp_en = spacy.load("en_core_web_sm")
except OSError:
    print("Modelos de spaCy no encontrados. Instalando...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "es_core_news_sm"])
    subprocess.run(["python", "-m", "spacy", "download", "en_core_web_sm"])
    nlp_es = spacy.load("es_core_news_sm")
    nlp_en = spacy.load("en_core_web_sm")

app = FastAPI(title="Despacho Legal Chatbot", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    text: str
    language: str = "es"
    user_id: Optional[str] = None

# Estructura para manejar conversaciones de citas
class AppointmentConversation:
    def __init__(self):
        self.stage: str = "initial"  # initial, collecting_info, confirmation, editing, completed
        self.data: Dict[str, Optional[str | int]] = {
            "fullName": None,
            "age": None,
            "phone": None,
            "email": None,
            "consultationReason": None,
            "preferredDate": None,
            "alternativeDate": None,
            "consultationType": None,
            "notes": None,
            "location": None
        }
        self.current_question: Optional[str] = None
        self.edit_mode: bool = False
        self.fields_to_edit: list = []

# Almacenar conversaciones activas
active_conversations: Dict[str, AppointmentConversation] = {}

def get_backend_info():
    """Obtiene información del backend"""
    try:
        # Obtener parámetros de contacto
        contact_response = requests.get(f"{BACKEND_URL}/api/parametros/contact", timeout=5)
        if contact_response.status_code == 200:
            contact_params = contact_response.json()
            contact_info = {}
            for param in contact_params:
                contact_info[param['clave']] = param['valor']
            return contact_info
    except Exception as e:
        print(f"[Backend] Error obteniendo información: {e}")
    return {}

def get_services_info():
    """Obtiene información de servicios del backend"""
    try:
        # Obtener información de casos/expedientes para entender servicios
        cases_response = requests.get(f"{BACKEND_URL}/api/cases", timeout=5)
        if cases_response.status_code == 200:
            cases = cases_response.json()
            # Analizar tipos de casos para determinar servicios
            services = set()
            for case in cases:
                if 'title' in case:
                    title = case['title'].lower()
                    if 'civil' in title or 'civil' in case.get('description', '').lower():
                        services.add('Derecho Civil')
                    if 'mercantil' in title or 'comercial' in title:
                        services.add('Derecho Mercantil')
                    if 'laboral' in title or 'trabajo' in title:
                        services.add('Derecho Laboral')
                    if 'familiar' in title or 'familia' in title:
                        services.add('Derecho Familiar')
                    if 'penal' in title or 'criminal' in title:
                        services.add('Derecho Penal')
                    if 'administrativo' in title:
                        services.add('Derecho Administrativo')
            
            if not services:
                services = {'Derecho Civil', 'Derecho Mercantil', 'Derecho Laboral', 'Derecho Familiar', 'Derecho Penal', 'Derecho Administrativo'}
            
            return list(services)
    except Exception as e:
        print(f"[Backend] Error obteniendo servicios: {e}")
    return ['Derecho Civil', 'Derecho Mercantil', 'Derecho Laboral', 'Derecho Familiar', 'Derecho Penal', 'Derecho Administrativo']

def get_honorarios_info():
    """Obtiene información de honorarios"""
    try:
        # Obtener facturas para entender estructura de honorarios
        invoices_response = requests.get(f"{BACKEND_URL}/api/invoices", timeout=5)
        if invoices_response.status_code == 200:
            invoices = invoices_response.json()
            if invoices:
                # Calcular promedio de honorarios
                total_amount = sum(invoice.get('importeTotal', 0) for invoice in invoices)
                avg_amount = total_amount / len(invoices)
                return {
                    'promedio': avg_amount,
                    'rango': f"€{min(invoice.get('importeTotal', 0) for invoice in invoices):.2f} - €{max(invoice.get('importeTotal', 0) for invoice in invoices):.2f}",
                    'consulta_inicial': 'Gratuita'
                }
    except Exception as e:
        print(f"[Backend] Error obteniendo honorarios: {e}")
    
    return {
        'promedio': 150.0,
        'rango': '€50.00 - €500.00',
        'consulta_inicial': 'Gratuita'
    }

def is_affirmative_response(text: str) -> bool:
    """Detecta si la respuesta del usuario es afirmativa"""
    affirmative_words = [
        'sí', 'si', 'yes', 'ok', 'okay', 'claro', 'perfecto', 'excelente',
        'genial', 'bueno', 'vale', 'correcto', 'afirmativo', 'por supuesto',
        'desde luego', 'naturalmente', 'evidentemente', 'seguro', 'cierto'
    ]
    text_lower = text.lower().strip()
    return any(word in text_lower for word in affirmative_words)

def is_negative_response(text: str) -> bool:
    """Detecta si la respuesta del usuario es negativa"""
    negative_words = [
        'no', 'nop', 'nope', 'negativo', 'tampoco', 'nada', 'ninguno',
        'ninguna', 'imposible', 'improbable', 'difícil', 'difícilmente'
    ]
    text_lower = text.lower().strip()
    return any(word in text_lower for word in negative_words)

def get_appointment_links():
    """Obtiene enlaces para agendar citas"""
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    return {
        'appointments_page': f"{frontend_url}/appointments",
        'contact_page': f"{frontend_url}/contact",
        'phone': get_backend_info().get('CONTACT_PHONE', '(555) 123-4567'),
        'email': get_backend_info().get('CONTACT_EMAIL', 'info@despacholegal.com')
    }

def extract_age(text: str) -> Optional[int]:
    """Extrae edad del texto"""
    import re
    numbers = re.findall(r'\b\d+\b', text)
    for num in numbers:
        age = int(num)
        if 18 <= age <= 120:
            return age
    return None

def extract_phone(text: str) -> Optional[str]:
    """Extrae número de teléfono del texto"""
    import re
    # Patrones para teléfonos españoles
    patterns = [
        r'\+34\s*\d{9}',
        r'\d{9}',
        r'\d{3}\s\d{3}\s\d{3}',
        r'\d{3}-\d{3}-\d{3}'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            return match.group()
    return None

def extract_email(text: str) -> Optional[str]:
    """Extrae email del texto"""
    import re
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group() if match else None

def get_available_dates():
    """Obtiene fechas disponibles para citas"""
    # Generar fechas disponibles (lunes a viernes, 9:00-18:00)
    available_dates = []
    today = datetime.now()
    
    for i in range(1, 15):  # Próximas 2 semanas
        base_date = today + timedelta(days=i)
        if base_date.weekday() < 5:  # Lunes a viernes
            for hour in [9, 10, 11, 12, 16, 17]:  # Horarios disponibles
                # Crear fecha específica con la hora correcta
                specific_date = base_date.replace(hour=hour, minute=0, second=0, microsecond=0)
                
                # Formatear la fecha correctamente
                formatted_date = specific_date.strftime('%A %d de %B a las %H:%M')
                formatted_date = formatted_date.replace('Monday', 'Lunes')
                formatted_date = formatted_date.replace('Tuesday', 'Martes')
                formatted_date = formatted_date.replace('Wednesday', 'Miércoles')
                formatted_date = formatted_date.replace('Thursday', 'Jueves')
                formatted_date = formatted_date.replace('Friday', 'Viernes')
                formatted_date = formatted_date.replace('January', 'Enero')
                formatted_date = formatted_date.replace('February', 'Febrero')
                formatted_date = formatted_date.replace('March', 'Marzo')
                formatted_date = formatted_date.replace('April', 'Abril')
                formatted_date = formatted_date.replace('May', 'Mayo')
                formatted_date = formatted_date.replace('June', 'Junio')
                formatted_date = formatted_date.replace('July', 'Julio')
                formatted_date = formatted_date.replace('August', 'Agosto')
                formatted_date = formatted_date.replace('September', 'Septiembre')
                formatted_date = formatted_date.replace('October', 'Octubre')
                formatted_date = formatted_date.replace('November', 'Noviembre')
                formatted_date = formatted_date.replace('December', 'Diciembre')
                
                available_dates.append({
                    'date': specific_date,
                    'formatted': formatted_date
                })
    
    return available_dates

def handle_appointment_conversation(user_id: str, message: str) -> str:
    """Maneja la conversación para agendar citas"""
    if user_id not in active_conversations:
        active_conversations[user_id] = AppointmentConversation()
    
    conv = active_conversations[user_id]
    
    # Si es la primera vez que menciona cita o confirma que quiere agendar
    if conv.stage == "initial":
        text_lower = message.lower().strip()
        appointment_keywords = ["cita", "agendar", "programar", "consulta"]
        
        if any(keyword in text_lower for keyword in appointment_keywords) or is_affirmative_response(message):
            conv.stage = "collecting_info"
            return "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo?"
    
    # Recolectar información
    if conv.stage == "collecting_info":
        if not conv.data["fullName"]:
            conv.data["fullName"] = message.strip()
            # Si estamos en modo edición, volver a confirmación
            if conv.edit_mode:
                conv.stage = "confirmation"
                conv.edit_mode = False
                return create_confirmation_message(conv.data)
            else:
                conv.current_question = "age"
                return f"Gracias {conv.data['fullName']}. ¿Cuál es tu edad?"
        
        elif conv.current_question == "age":
            age = extract_age(message)
            if age:
                conv.data["age"] = age
                # Si estamos en modo edición, volver a confirmación
                if conv.edit_mode:
                    conv.stage = "confirmation"
                    conv.edit_mode = False
                    return create_confirmation_message(conv.data)
                else:
                    conv.current_question = "phone"
                    return f"Perfecto. ¿Cuál es tu número de teléfono de contacto?"
            else:
                return "Por favor, indica tu edad (debe ser un número entre 18 y 120 años)."
        
        elif conv.current_question == "phone":
            phone = extract_phone(message)
            if phone:
                conv.data["phone"] = phone
                # Si estamos en modo edición, volver a confirmación
                if conv.edit_mode:
                    conv.stage = "confirmation"
                    conv.edit_mode = False
                    return create_confirmation_message(conv.data)
                else:
                    conv.current_question = "email"
                    return "Excelente. ¿Cuál es tu correo electrónico?"
            else:
                return "Por favor, proporciona un número de teléfono válido (ejemplo: 612345678 o +34 612345678)."
        
        elif conv.current_question == "email":
            email = extract_email(message)
            if email:
                conv.data["email"] = email  # type: ignore
                # Si estamos en modo edición, volver a confirmación
                if conv.edit_mode:
                    conv.stage = "confirmation"
                    conv.edit_mode = False
                    return create_confirmation_message(conv.data)
                else:
                    conv.current_question = "reason"  # type: ignore
                    return "Muy bien. ¿Cuál es el motivo de tu consulta? (Por ejemplo: divorcio, problema laboral, herencia, etc.)"
            else:
                return "Por favor, proporciona un correo electrónico válido (ejemplo: tu@email.com)."
        
        elif conv.current_question == "reason":
            conv.data["consultationReason"] = message.strip()
            # Si estamos en modo edición, volver a confirmación
            if conv.edit_mode:
                conv.stage = "confirmation"
                conv.edit_mode = False
                return create_confirmation_message(conv.data)
            else:
                conv.current_question = "type"
                services = get_services_info()
                return f"Entiendo. ¿En qué área del derecho necesitas ayuda?\n\nOpciones disponibles:\n" + "\n".join([f"• {service}" for service in services])
        
        elif conv.current_question == "type":
            conv.data["consultationType"] = message.strip()
            # Si estamos en modo edición, volver a confirmación
            if conv.edit_mode:
                conv.stage = "confirmation"
                conv.edit_mode = False
                return create_confirmation_message(conv.data)
            else:
                conv.current_question = "date"
                available_dates = get_available_dates()
                date_options = "\n".join([f"• {i+1}. {date['formatted']}" for i, date in enumerate(available_dates[:5])])
                return f"Perfecto. ¿Qué fecha prefieres para tu consulta?\n\nOpciones disponibles:\n{date_options}\n\nResponde con el número de la opción que prefieras."
        
        elif conv.current_question == "date":
            try:
                date_index = int(message.strip()) - 1
                available_dates = get_available_dates()
                if 0 <= date_index < len(available_dates):
                    selected_date = available_dates[date_index]
                    conv.data["preferredDate"] = selected_date['date'].isoformat()
                    conv.stage = "confirmation"
                    conv.edit_mode = False
                    return create_confirmation_message(conv.data)
                else:
                    return "Por favor, selecciona un número válido de la lista."
            except ValueError:
                return "Por favor, responde con el número de la opción que prefieras."
    
    # Confirmación
    elif conv.stage == "confirmation":
        if is_affirmative_response(message):
            # Guardar cita en backend
            try:
                print(f"[DEBUG] Intentando crear cita con datos: {conv.data}")
                response = requests.post(f"{BACKEND_URL}/api/appointments/visitor", json=conv.data, timeout=10)
                print(f"[DEBUG] Respuesta del backend: {response.status_code} - {response.text}")
                
                if response.status_code == 201:
                    conv.stage = "completed"
                    del active_conversations[user_id]  # Limpiar conversación
                    preferred_date = conv.data['preferredDate']
                    if isinstance(preferred_date, str):
                        try:
                            from datetime import datetime
                            date_obj = datetime.fromisoformat(preferred_date.replace('Z', '+00:00'))
                            date_str = date_obj.strftime('%d/%m/%Y a las %H:%M')
                        except:
                            date_str = preferred_date[:10]
                    else:
                        date_str = "Fecha no especificada"
                    return f"¡Perfecto! Tu cita ha sido agendada exitosamente.\n\n📅 **Detalles de tu cita:**\n• Nombre: {conv.data['fullName']}\n• Fecha y hora: {date_str}\n• Motivo: {conv.data['consultationReason']}\n\nTe hemos enviado un email de confirmación a {conv.data['email']}.\n\nUn abogado se pondrá en contacto contigo pronto para confirmar los detalles. ¡Gracias por confiar en nosotros!"
                else:
                    print(f"[DEBUG] Error del backend: {response.status_code} - {response.text}")
                    return f"Lo siento, hubo un problema al agendar tu cita (Error {response.status_code}). Por favor, contacta directamente al despacho por teléfono o email."
            except Exception as e:
                print(f"[DEBUG] Error saving appointment: {e}")
                return f"Lo siento, hubo un problema al agendar tu cita (Error: {str(e)}). Por favor, contacta directamente al despacho por teléfono o email."
        elif is_negative_response(message):
            # Preguntar qué quiere modificar
            conv.stage = "editing"
            return """Entiendo que quieres modificar algo. ¿Qué te gustaría cambiar?

Opciones disponibles:
• 1. Nombre
• 2. Edad
• 3. Teléfono
• 4. Email
• 5. Motivo de consulta
• 6. Área del derecho
• 7. Fecha y hora
• 8. Todo (empezar de nuevo)

Responde con el número de la opción que quieres modificar."""
        else:
            return "Por favor, responde 'sí' para confirmar o 'no' para modificar algo."
    
    # Modo de edición
    elif conv.stage == "editing":
        try:
            choice = int(message.strip())
            if choice == 1:  # Nombre
                conv.current_question = "fullName"
                conv.stage = "collecting_info"
                conv.edit_mode = True
                return "Perfecto. ¿Cuál es tu nombre completo?"
            elif choice == 2:  # Edad
                conv.current_question = "age"
                conv.stage = "collecting_info"
                conv.edit_mode = True
                return f"Perfecto. ¿Cuál es tu edad? (Actualmente: {conv.data['age']} años)"
            elif choice == 3:  # Teléfono
                conv.current_question = "phone"
                conv.stage = "collecting_info"
                conv.edit_mode = True
                return f"Perfecto. ¿Cuál es tu número de teléfono? (Actualmente: {conv.data['phone']})"
            elif choice == 4:  # Email
                conv.current_question = "email"
                conv.stage = "collecting_info"
                conv.edit_mode = True
                return f"Perfecto. ¿Cuál es tu correo electrónico? (Actualmente: {conv.data['email']})"
            elif choice == 5:  # Motivo
                conv.current_question = "reason"
                conv.stage = "collecting_info"
                conv.edit_mode = True
                return f"Perfecto. ¿Cuál es el motivo de tu consulta? (Actualmente: {conv.data['consultationReason']})"
            elif choice == 6:  # Área
                conv.current_question = "type"
                conv.stage = "collecting_info"
                conv.edit_mode = True
                services = get_services_info()
                return f"Perfecto. ¿En qué área del derecho necesitas ayuda? (Actualmente: {conv.data['consultationType']})\n\nOpciones disponibles:\n" + "\n".join([f"• {service}" for service in services])
            elif choice == 7:  # Fecha
                conv.current_question = "date"
                conv.stage = "collecting_info"
                conv.edit_mode = True
                available_dates = get_available_dates()
                date_options = "\n".join([f"• {i+1}. {date['formatted']}" for i, date in enumerate(available_dates[:5])])
                return f"Perfecto. ¿Qué fecha prefieres para tu consulta?\n\nOpciones disponibles:\n{date_options}\n\nResponde con el número de la opción que prefieras."
            elif choice == 8:  # Todo
                conv.stage = "collecting_info"
                conv.data = {key: None for key in conv.data}
                conv.current_question = None
                conv.edit_mode = False
                return "Entiendo. Empecemos de nuevo. ¿Cuál es tu nombre completo?"
            else:
                return "Por favor, selecciona un número válido del 1 al 8."
        except ValueError:
            return "Por favor, responde con el número de la opción que quieres modificar."
    
    return "No entiendo. ¿Podrías repetir?"

def create_confirmation_message(data: Dict[str, Any]) -> str:
    """Crea mensaje de confirmación con los datos recopilados"""
    preferred_date = data['preferredDate']
    if isinstance(preferred_date, str):
        # Parsear la fecha ISO para mostrar fecha y hora
        try:
            from datetime import datetime
            date_obj = datetime.fromisoformat(preferred_date.replace('Z', '+00:00'))
            date_str = date_obj.strftime('%d/%m/%Y a las %H:%M')
        except:
            date_str = preferred_date[:10]
    else:
        date_str = "Fecha no especificada"
    
    return f"""📋 **Resumen de tu cita:**

👤 **Datos personales:**
• Nombre: {data['fullName']}
• Edad: {data['age']} años
• Teléfono: {data['phone']}
• Email: {data['email']}

⚖️ **Consulta:**
• Motivo: {data['consultationReason']}
• Área: {data['consultationType']}
• Fecha y hora: {date_str}

¿Está todo correcto? Responde 'sí' para confirmar o 'no' para modificar algo."""

# Base de conocimientos mejorada con información dinámica
def get_knowledge_base():
    """Obtiene base de conocimientos con información dinámica del backend"""
    contact_info = get_backend_info()
    services = get_services_info()
    honorarios = get_honorarios_info()
    appointment_links = get_appointment_links()
    
    return {
        "saludos": {
            "patterns": ["hola", "buenos días", "buenas tardes", "buenas noches", "saludos", "hey"],
            "responses": [
                "¡Hola! Soy el asistente virtual del despacho legal. ¿En qué puedo ayudarte hoy?",
                "¡Buenos días! Bienvenido al despacho. ¿Cómo puedo asistirte?",
                "¡Hola! Estoy aquí para ayudarte con cualquier consulta legal. ¿Qué necesitas?"
            ]
        },
        "consulta_legal": {
            "patterns": ["consulta", "asesoría", "asesoramiento", "ayuda legal", "problema legal", "derecho"],
            "responses": [
                "Para una consulta legal, puedo ayudarte a agendar una cita con nuestros abogados especializados. ¿Te gustaría que te ayude a programar una cita?",
                "Nuestros abogados están disponibles para asesorarte. ¿En qué área del derecho necesitas ayuda?",
                "Ofrecemos consultas iniciales para evaluar tu caso. ¿Qué tipo de asunto legal tienes?"
            ]
        },
        "citas": {
            "patterns": ["cita", "agendar", "programar", "reunión", "consulta presencial", "visita"],
            "responses": [
                f"Para agendar una cita, puedo ayudarte a recopilar toda la información necesaria. ¿Te gustaría que empecemos ahora?",
                "Las citas se pueden programar de lunes a viernes de 9:00 AM a 6:00 PM. ¿Prefieres una consulta presencial o virtual?",
                "Puedo ayudarte a programar una cita. ¿Qué día y hora te resulta más conveniente?"
            ]
        },
        "confirmacion_cita": {
            "patterns": ["sí", "si", "yes", "ok", "okay", "claro", "perfecto", "excelente", "genial", "bueno", "vale"],
            "responses": [
                "¡Perfecto! Vamos a agendar tu cita. Te haré algunas preguntas para recopilar la información necesaria.\n\n¿Cuál es tu nombre completo?",
                "¡Excelente decisión! Para agendar tu cita necesito algunos datos.\n\n¿Cuál es tu nombre completo?",
                "¡Genial! Empecemos a agendar tu cita.\n\n¿Cuál es tu nombre completo?"
            ]
        },
        "horarios": {
            "patterns": ["horario", "atención", "abierto", "cerrado", "cuándo", "días"],
            "responses": [
                "Nuestro horario de atención es de lunes a viernes de 9:00 AM a 6:00 PM. Los sábados de 9:00 AM a 1:00 PM.",
                "Estamos abiertos de lunes a viernes de 9:00 AM a 6:00 PM. ¿En qué horario te gustaría programar tu consulta?",
                "Nuestro despacho atiende de lunes a viernes de 9:00 AM a 6:00 PM. También ofrecemos consultas virtuales."
            ]
        },
        "servicios": {
            "patterns": ["servicios", "áreas", "especialidades", "practican", "derecho civil", "derecho mercantil", "derecho laboral"],
            "responses": [
                f"Ofrecemos servicios en: {', '.join(services)}. ¿En qué área específica necesitas ayuda?",
                f"Nuestras especialidades incluyen: {', '.join(services)}. ¿Qué tipo de caso tienes?",
                f"Somos especialistas en múltiples áreas del derecho: {', '.join(services)}. ¿Podrías contarme más sobre tu situación legal?"
            ]
        },
        "costos": {
            "patterns": ["costo", "precio", "honorarios", "cobran", "tarifa", "pago"],
            "responses": [
                f"Los honorarios varían según la complejidad del caso. Rango típico: {honorarios['rango']}. Ofrecemos una consulta inicial gratuita para evaluar tu situación.",
                f"Nuestros costos son competitivos y transparentes. Honorarios promedio: €{honorarios['promedio']:.2f}. Durante la consulta inicial discutiremos los honorarios específicos.",
                f"Los honorarios se determinan caso por caso. Rango: {honorarios['rango']}. ¿Te gustaría programar una consulta gratuita para conocer los costos?"
            ]
        },
        "contacto": {
            "patterns": ["contacto", "teléfono", "email", "dirección", "ubicación", "dónde"],
            "responses": [
                f"Puedes contactarnos al {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}, por email a {contact_info.get('CONTACT_EMAIL', 'info@despacholegal.com')}, o visitarnos en Av. Principal 123, Ciudad.",
                f"Nuestros datos de contacto: Teléfono {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}, Email: {contact_info.get('CONTACT_EMAIL', 'info@despacholegal.com')}",
                f"Estamos ubicados en Av. Principal 123, Ciudad. Teléfono: {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}"
            ]
        },
        "emergencia": {
            "patterns": ["emergencia", "urgente", "inmediato", "ahora", "pronto"],
            "responses": [
                f"Para casos urgentes, puedes llamarnos al {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}. Tenemos abogados disponibles para emergencias.",
                f"En caso de emergencia legal, llama inmediatamente al {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}. Estamos disponibles 24/7 para casos urgentes.",
                f"Para situaciones urgentes, contacta directamente al {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}. Nuestro equipo está preparado para emergencias."
            ]
        },
        "documentos": {
            "patterns": ["documento", "papeles", "escritura", "contrato", "demanda"],
            "responses": [
                "Para revisar documentos legales, necesitarás una cita con nuestros abogados. ¿Te gustaría programar una consulta?",
                "La revisión de documentos requiere análisis especializado. Nuestros abogados pueden ayudarte con esto.",
                "Los documentos legales deben ser revisados por profesionales. ¿Qué tipo de documento necesitas revisar?"
            ]
        }
    }

def build_prompt(conversation_history, user_message):
    # Obtener información dinámica del backend
    contact_info = get_backend_info()
    services = get_services_info()
    honorarios = get_honorarios_info()
    
    # Prompt más específico y estructurado para el despacho legal
    system_prompt = f"""Eres un asistente virtual especializado en derecho para el Despacho Legal "García & Asociados". 

INFORMACIÓN DEL DESPACHO:
- Horarios: Lunes a Viernes 9:00 AM - 6:00 PM, Sábados 9:00 AM - 1:00 PM
- Teléfono: {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}
- Email: {contact_info.get('CONTACT_EMAIL', 'info@despacholegal.com')}
- Dirección: Av. Principal 123, Ciudad
- Servicios: {', '.join(services)}
- Honorarios: Rango {honorarios['rango']}, Consulta inicial gratuita
- Contacto: {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}

INSTRUCCIONES:
1. Responde de manera profesional, clara y empática
2. NO des consejos legales específicos, solo orientación general
3. SIEMPRE recomienda consultar con un abogado para casos concretos
4. Para citas: Sugiere programar en horarios disponibles
5. Para horarios: Proporciona la información exacta
6. Para servicios: Lista las áreas de especialización
7. Para contacto: Da la información de contacto completa
8. Para honorarios: Menciona el rango y consulta gratuita
9. Mantén respuestas concisas pero informativas
10. Si el usuario confirma interés en citas, proporciona enlaces directos

CONTEXTO DE LA CONVERSACIÓN:"""

    # Construir el contexto de la conversación
    conversation_context = ""
    if conversation_history:
        # Tomar solo los últimos 3 mensajes para contexto
        recent_messages = conversation_history[-3:]
        for msg in recent_messages:
            role = "Usuario" if msg.get("isUser") else "Asistente"
            conversation_context += f"{role}: {msg['text']}\n"
    
    full_prompt = f"{system_prompt}\n{conversation_context}Usuario: {user_message}\nAsistente:"
    return full_prompt

def is_valid_response(response: str, user_message: str) -> bool:
    """Valida si la respuesta es apropiada para un chatbot de despacho legal"""
    # Verificar que la respuesta no esté vacía o sea muy corta
    if not response or len(response.strip()) < 10:
        return False
    
    # Verificar que no contenga respuestas genéricas o irrelevantes
    invalid_phrases = [
        "no puedo ayudarte",
        "no tengo información",
        "no sé",
        "no entiendo",
        "no puedo responder",
        "no tengo acceso",
        "no puedo proporcionar",
        "lo siento, no puedo"
    ]
    
    response_lower = response.lower()
    for phrase in invalid_phrases:
        if phrase in response_lower:
            return False
    
    # Verificar que la respuesta sea relevante al contexto legal
    legal_keywords = [
        "despacho", "abogado", "legal", "consulta", "cita", "horario", 
        "servicio", "derecho", "asesoría", "contacto", "teléfono", "email"
    ]
    
    user_lower = user_message.lower()
    has_legal_context = any(keyword in user_lower for keyword in legal_keywords)
    
    # Si el usuario pregunta algo legal, la respuesta debe ser apropiada
    if has_legal_context:
        return len(response.strip()) > 20  # Respuesta debe ser sustancial
    
    return True

def get_hf_response(user_message: str, conversation_history: list = []) -> Optional[str]:
    """Obtiene respuesta de Hugging Face"""
    if not HF_API_TOKEN:
        print("[HuggingFace] No API token found.")
        return None
    prompt = build_prompt(conversation_history, user_message)
    headers = {
        "Authorization": f"Bearer {HF_API_TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "inputs": prompt,
        "parameters": {
            "max_new_tokens": 150,
            "temperature": 0.5,
            "do_sample": True,
            "top_p": 0.9,
            "repetition_penalty": 1.1
        }
    }
    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        data = response.json()
        if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
            generated_text = data[0]["generated_text"]
            # Extraer solo la parte de la respuesta del asistente
            if "Asistente:" in generated_text:
                response_text = generated_text.split("Asistente:")[-1].strip()
            else:
                response_text = generated_text.strip()
            
            # Validar que la respuesta sea apropiada
            if is_valid_response(response_text, user_message):
                print("[HuggingFace] Respuesta generada por IA.")
                return response_text
            else:
                print("[HuggingFace] Respuesta no apropiada, usando fallback.")
                return None
        elif isinstance(data, dict) and "error" in data:
            print("[HuggingFace] error:", data["error"])
            return None
        else:
            print("[HuggingFace] Respuesta inesperada:", data)
            return None
    except Exception as e:
        print("[HuggingFace] Error:", e)
        return None

def process_message_fallback(text: str, language: str = "es", conversation_history: list = []) -> str:
    nlp = nlp_es if language == "es" else nlp_en
    doc = nlp(text.lower())
    keywords = [token.text for token in doc if not token.is_stop and token.is_alpha]
    
    # Obtener base de conocimientos dinámica
    knowledge_base = get_knowledge_base()
    
    # Verificar si es una respuesta afirmativa
    if is_affirmative_response(text):
        # Buscar en el historial si se estaba hablando de citas
        if conversation_history:
            last_assistant_message = None
            for msg in reversed(conversation_history):
                if not msg.get("isUser"):
                    last_assistant_message = msg.get("text", "").lower()
                    break
            
            # Si el último mensaje del asistente mencionaba citas, dar información de agendamiento
            if last_assistant_message and any(word in last_assistant_message for word in ["cita", "agendar", "programar", "consulta"]):
                return random.choice(knowledge_base["confirmacion_cita"]["responses"])
    
    # Verificar si es una respuesta negativa
    if is_negative_response(text):
        return "Entiendo. Si cambias de opinión o necesitas ayuda en el futuro, no dudes en contactarnos. ¿Hay algo más en lo que pueda ayudarte?"
    
    # Verificar intención de citas específicamente
    text_lower = text.lower().strip()
    appointment_keywords = ["cita", "agendar", "programar", "consulta", "reunión", "visita"]
    
    if any(keyword in text_lower for keyword in appointment_keywords):
        return random.choice(knowledge_base["citas"]["responses"])
    
    # Buscar mejor coincidencia en la base de conocimientos
    best_match = None
    max_matches = 0
    for intent, data in knowledge_base.items():
        matches = sum(1 for pattern in data["patterns"] if any(keyword in pattern for keyword in keywords))
        if matches > max_matches:
            max_matches = matches
            best_match = data
    
    if best_match and max_matches > 0:
        return random.choice(best_match["responses"])
    
    # Respuestas por defecto más específicas
    default_responses = [
        "Entiendo tu consulta. Para brindarte la mejor asesoría, te recomiendo programar una cita con nuestros abogados especializados.",
        "Tu pregunta es importante. Nuestros abogados pueden ayudarte mejor con este tema. ¿Te gustaría agendar una cita?",
        "Para responder adecuadamente a tu consulta, necesitaría más contexto. ¿Podrías programar una cita para discutir los detalles?",
        "Esta es una consulta que requiere análisis especializado. Nuestros abogados están disponibles para ayudarte. ¿Te gustaría contactarnos?"
    ]
    return random.choice(default_responses)


def get_semantic_similarity_response(user_message: str, knowledge_base: dict) -> Optional[str]:
    """Obtiene respuesta basada en similitud semántica."""
    if not SENTENCE_TRANSFORMERS_AVAILABLE or not embedding_model:
        return None
    
    try:
        # Preparar respuestas del knowledge base
        responses = []
        response_sources = []
        
        for intent, data in knowledge_base.items():
            for response in data["responses"]:
                responses.append(response)
                response_sources.append(intent)
        
        if not responses:
            return None
        
        # Calcular embeddings
        query_embedding = embedding_model.encode(user_message)
        response_embeddings = embedding_model.encode(responses)
        
        # Calcular similitud
        cosine_scores = util.pytorch_cos_sim(query_embedding, response_embeddings)
        best_idx = cosine_scores.argmax().item()
        best_score = cosine_scores[0][best_idx].item()
        
        # Solo usar si la similitud es alta
        if best_score > 0.6:
            print(f"[Semantic] Respuesta encontrada por similitud semántica (score: {best_score:.3f})")
            return responses[best_idx]
        
        return None
        
    except Exception as e:
        print(f"[Semantic] Error: {e}")
        return None

def get_cloud_service_response(user_message: str, service: str = "openai") -> Optional[str]:
    """Obtiene respuesta de servicios en la nube."""
    
    if service == "openai" and CLOUD_SERVICES_AVAILABLE["openai"]:
        try:
            import openai
            client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "Eres un asistente legal profesional. Responde de manera clara y concisa."},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=100,
                temperature=0.7
            )
            
            response_text = response.choices[0].message.content
            print("[OpenAI] Respuesta generada por OpenAI")
            return response_text
            
        except Exception as e:
            print(f"[OpenAI] Error: {e}")
            return None
    
    elif service == "cohere" and CLOUD_SERVICES_AVAILABLE["cohere"]:
        try:
            import cohere
            co = cohere.Client(os.getenv("COHERE_API_KEY"))
            
            response = co.generate(
                model="command",
                prompt=f"Eres un asistente legal. Usuario: {user_message}",
                max_tokens=100,
                temperature=0.7
            )
            
            response_text = response.generations[0].text
            print("[Cohere] Respuesta generada por Cohere")
            return response_text
            
        except Exception as e:
            print(f"[Cohere] Error: {e}")
            return None
    
    elif service == "anthropic" and CLOUD_SERVICES_AVAILABLE["anthropic"]:
        try:
            import anthropic
            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            
            response = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=100,
                messages=[
                    {"role": "user", "content": f"Eres un asistente legal. {user_message}"}
                ]
            )
            
            response_text = response.content[0].text
            print("[Anthropic] Respuesta generada por Anthropic")
            return response_text
            
        except Exception as e:
            print(f"[Anthropic] Error: {e}")
            return None
    
    return None


def process_message(text: str, language: str = "es", conversation_history: list | None = None, user_id: Optional[str] = None) -> str:
    if conversation_history is None:
        conversation_history = []
    
    # Generar user_id si no se proporciona
    if not user_id:
        user_id = "anonymous"
    
    # Verificar si hay una conversación activa de cita
    if user_id in active_conversations:
        appointment_response = handle_appointment_conversation(user_id, text)
        if appointment_response:
            return appointment_response
    
    # Detectar intención de agendar cita
    text_lower = text.lower().strip()
    appointment_keywords = ["cita", "agendar", "programar", "consulta", "reunión", "visita"]
    
    # Si el usuario menciona citas y no hay conversación activa, iniciar una
    if any(keyword in text_lower for keyword in appointment_keywords):
        active_conversations[user_id] = AppointmentConversation()
        appointment_response = handle_appointment_conversation(user_id, text)
        if appointment_response:
            return appointment_response
    
    # Verificar respuestas afirmativas que podrían ser sobre citas
    if is_affirmative_response(text):
        if conversation_history:
            last_assistant_message = None
            for msg in reversed(conversation_history):
                if not msg.get("isUser"):
                    last_assistant_message = msg.get("text", "").lower()
                    break
            
            if last_assistant_message and any(word in last_assistant_message for word in ["cita", "agendar", "programar", "consulta"]):
                active_conversations[user_id] = AppointmentConversation()
                return "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo?"
    
    # INTENTAR SIMILITUD SEMÁNTICA PRIMERO
    knowledge_base = get_knowledge_base()
    semantic_response = get_semantic_similarity_response(text, knowledge_base)
    if semantic_response:
        return semantic_response
    
    # INTENTAR SERVICIOS EN LA NUBE (en orden de preferencia)
    cloud_services = ["openai", "cohere", "anthropic"]
    for service in cloud_services:
        cloud_response = get_cloud_service_response(text, service)
        if cloud_response:
            return cloud_response
    
    # Intentar obtener respuesta de Hugging Face (fallback)
    hf_response = get_hf_response(text, conversation_history)
    if hf_response:
        return hf_response
    
    print("[Fallback] Usando base de conocimientos local.")
    return process_message_fallback(text, language, conversation_history)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    conversation_history = []
    user_id = None
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            user_id = message.get("user_id", "anonymous")
            conversation_history.append({
                "text": message["text"],
                "isUser": True,
                "timestamp": datetime.now().isoformat()
            })
            response = process_message(
                message["text"],
                message.get("language", "es"),
                conversation_history,
                user_id
            )
            conversation_history.append({
                "text": response,
                "isUser": False,
                "timestamp": datetime.now().isoformat()
            })
            await websocket.send_text(json.dumps({
                "response": response,
                "timestamp": datetime.now().isoformat()
            }))
    except WebSocketDisconnect:
        pass

@app.post("/chat")
async def chat(message: Message):
    response = process_message(message.text, message.language, user_id=message.user_id)
    return {
        "response": response,
        "timestamp": datetime.now().isoformat()
    }

@app.post("/end_chat")
async def end_chat(message: Message):
    """Termina la conversación y limpia el estado del usuario"""
    user_id = message.user_id or "anonymous"
    
    # Limpiar conversación activa si existe
    if user_id in active_conversations:
        del active_conversations[user_id]
        print(f"[Chat] Conversación terminada para usuario: {user_id}")
    
    return {
        "status": "conversation_ended",
        "message": "Conversación terminada",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 