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
import time
import threading
from fastapi import Request

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

# Verificar servicios en la nube (opcionales)
CLOUD_SERVICES_AVAILABLE = {
    "openai": False,
    "anthropic": False,
    "cohere": False
}

# Importar servicios de IA en la nube (opcionales)
try:
    import openai
    CLOUD_SERVICES_AVAILABLE["openai"] = True
    print("[NLP] OpenAI disponible")
except ImportError:
    print("[NLP] OpenAI no disponible - instalar con: pip install openai")

try:
    import anthropic  # type: ignore
    CLOUD_SERVICES_AVAILABLE["anthropic"] = True
    print("[NLP] Anthropic disponible")
except ImportError:
    print("[NLP] Anthropic no disponible - instalar con: pip install anthropic")

try:
    import cohere
    CLOUD_SERVICES_AVAILABLE["cohere"] = True
    print("[NLP] Cohere disponible")
except ImportError:
    print("[NLP] Cohere no disponible - instalar con: pip install cohere")

# Cargar variables de entorno
load_dotenv()

# Configurar Hugging Face
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
print(f"[DEBUG] HF_API_TOKEN loaded: {bool(HF_API_TOKEN)}")
HF_API_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta"

# Configuración del backend
BACKEND_URL = os.getenv("BACKEND_URL", "https://experimento2-production.up.railway.app")

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

app = FastAPI(title="Despacho Legal Chatbot", version="1.0.0")

# Configurar CORS
cors_origins = os.getenv("CORS_ORIGIN")
if cors_origins:
    # Si existe CORS_ORIGIN, dividir por comas y usar esos dominios
    allowed_origins = [origin.strip() for origin in cors_origins.split(",")]
    print(f"[CORS] Configurando con dominios: {allowed_origins}")
else:
    # Fallback a dominios por defecto
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://experimento2-fenm.vercel.app",
        "https://experimento2-production.up.railway.app",
        "https://experimento2-production-54c0.up.railway.app",
        "https://chatbot-legal-production-b91c.up.railway.app",
        "https://chatbot-legal-production.up.railway.app",
        os.getenv("FRONTEND_URL", "http://localhost:5173")
    ]
    print(f"[CORS] Usando dominios por defecto: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Endpoint OPTIONS general para todas las rutas
@app.options("/{full_path:path}")
async def options_handler(request: Request, full_path: str):
    from fastapi.responses import Response
    
    # Obtener el origen de la petición
    origin = request.headers.get("origin", "")
    
    # Verificar si el origen está permitido
    if origin in allowed_origins:
        cors_origin = origin
    else:
        # Si no está en la lista, usar el primer origen permitido como fallback
        cors_origin = allowed_origins[0] if allowed_origins else "*"
    
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        }
    )

class Message(BaseModel):
    text: str
    language: str = "es"
    user_id: Optional[str] = None

# Estructura para manejar conversaciones de citas
class AppointmentConversation:
    def __init__(self):
        self.stage: str = "initial"  # initial, collecting_info, confirmation, completed
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
        self.context: Dict[str, Any] = {}  # Para mantener contexto de la conversación

# Estructura para manejar el contexto general de la conversación
class ConversationContext:
    def __init__(self):
        self.user_name: Optional[str] = None
        self.preferred_language: str = "es"
        self.topics_discussed: list = []
        self.user_sentiment: str = "neutral"  # positive, negative, neutral
        self.conversation_style: str = "formal"  # formal, casual, professional
        self.last_intent: Optional[str] = None
        self.conversation_start_time: datetime = datetime.now()
        self.interaction_count: int = 0

# Almacenar conversaciones activas
active_conversations: Dict[str, AppointmentConversation] = {}

# Almacenar historial de conversaciones
conversation_histories: Dict[str, list] = {}

# Almacenar contexto de conversación por usuario
conversation_contexts: Dict[str, ConversationContext] = {}

# Almacenar última actividad por usuario
last_activity: Dict[str, float] = {}
# Almacenar advertencia enviada
warned_inactive: Dict[str, bool] = {}

# Almacenar conexiones WebSocket activas por usuario
active_websockets: Dict[str, WebSocket] = {}

def get_backend_info():
    """Obtiene información del backend"""
    try:
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
        cases_response = requests.get(f"{BACKEND_URL}/api/cases", timeout=5)
        if cases_response.status_code == 200:
            cases = cases_response.json()
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
        invoices_response = requests.get(f"{BACKEND_URL}/api/invoices", timeout=5)
        if invoices_response.status_code == 200:
            invoices = invoices_response.json()
            if invoices:
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
        'rango': '€50.00 - €300.00',
        'consulta_inicial': 'Gratuita'
    }

def is_affirmative_response(text: str) -> bool:
    """Verifica si la respuesta es afirmativa"""
    # Palabras específicamente afirmativas (siempre indican afirmación)
    affirmative_words = ["sí", "si", "yes", "ok", "okay", "claro", "correcto", "exacto", "afirmativo"]
    # Palabras que pueden ser afirmativas pero también descriptivas
    context_dependent_words = ["perfecto", "excelente", "genial", "bueno", "vale"]
    
    text_lower = text.lower().strip()
    
    # Si contiene palabras específicamente afirmativas
    if any(word in text_lower for word in affirmative_words):
        return True
    
    # Para palabras dependientes del contexto, verificar que sea una respuesta muy específica
    for word in context_dependent_words:
        if word in text_lower:
            # Solo considerar afirmativa si es una respuesta muy corta y directa
            words = text_lower.split()
            if len(words) == 1 and words[0] == word:
                return True
            # O si es una respuesta muy corta con una palabra adicional
            if len(words) == 2 and words[0] == word and words[1] in ["gracias", "ok", "vale"]:
                return True
    
    return False

def is_negative_response(text: str) -> bool:
    """Verifica si la respuesta es negativa"""
    negative_words = ["no", "nop", "nope", "negativo", "incorrecto", "mal", "error", "no me interesa", "no por ahora"]
    return any(word in text.lower() for word in negative_words)

def detect_intent(text: str, conversation_history: list = []) -> Dict[str, float]:
    """Detecta múltiples intenciones con puntuaciones de confianza"""
    text_lower = text.lower().strip()
    
    intents = {
        "appointment": 0.0,
        "greeting": 0.0,
        "farewell": 0.0,
        "information_request": 0.0,
        "complaint": 0.0,
        "thanks": 0.0,
        "help": 0.0,
        "emergency": 0.0,
        "document_request": 0.0,
        "pricing": 0.0,
        "location": 0.0,
        "schedule": 0.0,
        "general_question": 0.0
    }
    
    # Patrones más específicos para cada intención
    patterns = {
        "appointment": ["agendar cita", "programar cita", "cita con abogado", "consultar abogado", "quiero una cita", "necesito cita", "hacer cita", "quiero agendar", "necesito agendar", "quiero programar", "necesito programar", "cita", "quiero cita", "necesito una cita"],
        "greeting": ["hola", "buenos días", "buenas tardes", "buenas noches", "saludos", "hey", "buen día"],
        "farewell": ["adiós", "hasta luego", "nos vemos", "chao", "bye", "hasta la vista", "que tengas buen día"],
        "information_request": ["información", "dime", "cuéntame", "qué", "cómo", "dónde", "cuándo", "por qué", "explica"],
        "complaint": ["queja", "problema", "mal", "pésimo", "terrible", "no funciona", "error", "molesto"],
        "thanks": ["gracias", "thank you", "muchas gracias", "te agradezco", "muy agradecido"],
        "help": ["ayuda", "help", "socorro", "necesito ayuda", "no sé qué hacer", "perdido"],
        "emergency": ["emergencia", "urgente", "inmediato", "ahora", "pronto", "crítico", "grave"],
        "document_request": ["documento", "papeles", "escritura", "contrato", "demanda", "expediente", "certificado"],
        "pricing": ["costo", "precio", "honorarios", "cobran", "tarifa", "pago", "cuánto cuesta", "valor"],
        "location": ["dónde", "ubicación", "dirección", "lugar", "sitio", "oficina", "despacho"],
        "schedule": ["horario", "atención", "abierto", "cerrado", "cuándo", "días", "horas"],
        "general_question": ["pregunta", "duda", "curiosidad", "saber", "conocer", "entender"]
    }
    
    # Calcular puntuaciones con umbral más alto
    for intent, pattern_list in patterns.items():
        matches = sum(1 for pattern in pattern_list if pattern in text_lower)
        if matches > 0:
            # Aumentar el umbral para evitar detecciones falsas
            intents[intent] = min(1.0, matches / len(pattern_list) + 0.5)
    
    # Análisis contextual basado en el historial
    if conversation_history:
        last_messages = conversation_history[-3:]
        for msg in last_messages:
            if msg.get("isUser"):
                msg_text = msg.get("text", "").lower()
                # Si el usuario mencionó citas antes, aumentar probabilidad
                if any(word in msg_text for word in ["agendar cita", "programar cita", "cita con abogado", "quiero agendar", "necesito agendar", "cita", "quiero cita", "necesito una cita"]):
                    intents["appointment"] += 0.3
                # Si mencionó precios, aumentar probabilidad
                if any(word in msg_text for word in ["costo", "precio", "honorarios"]):
                    intents["pricing"] += 0.3
    
    return intents

def analyze_sentiment(text: str) -> str:
    """Analiza el sentimiento del texto"""
    text_lower = text.lower()
    
    positive_words = ["gracias", "excelente", "perfecto", "genial", "bueno", "me gusta", "satisfecho", "contento", "feliz", "agradecido"]
    negative_words = ["mal", "pésimo", "terrible", "molesto", "enojado", "frustrado", "problema", "queja", "no funciona", "decepcionado"]
    
    positive_count = sum(1 for word in positive_words if word in text_lower)
    negative_count = sum(1 for word in negative_words if word in text_lower)
    
    if positive_count > negative_count:
        return "positive"
    elif negative_count > positive_count:
        return "negative"
    else:
        return "neutral"

def extract_user_name(text: str) -> Optional[str]:
    """Extrae el nombre del usuario del texto"""
    text_lower = text.lower()
    
    # Patrones comunes para nombres
    name_patterns = [
        "me llamo", "mi nombre es", "soy", "me llaman", "mi nombre completo es"
    ]
    
    for pattern in name_patterns:
        if pattern in text_lower:
            # Extraer el texto después del patrón
            start_idx = text_lower.find(pattern) + len(pattern)
            name_part = text[start_idx:].strip()
            
            # Limpiar y validar el nombre
            if name_part and len(name_part) > 2:
                # Tomar solo la primera parte del nombre
                name_parts = name_part.split()[:2]  # Primer nombre y apellido
                return " ".join(name_parts).title()
    
    return None

def get_conversation_context(user_id: str) -> ConversationContext:
    """Obtiene o crea el contexto de conversación para un usuario"""
    if user_id not in conversation_contexts:
        conversation_contexts[user_id] = ConversationContext()
    return conversation_contexts[user_id]

def update_conversation_context(user_id: str, text: str, intent: str, sentiment: str):
    """Actualiza el contexto de conversación del usuario"""
    context = get_conversation_context(user_id)
    
    # Extraer nombre si no se tiene
    if not context.user_name:
        extracted_name = extract_user_name(text)
        if extracted_name:
            context.user_name = extracted_name
    
    # Actualizar temas discutidos
    if intent not in context.topics_discussed:
        context.topics_discussed.append(intent)
    
    # Actualizar sentimiento
    context.user_sentiment = sentiment
    context.last_intent = intent
    context.interaction_count += 1
    
    # Determinar estilo de conversación basado en el sentimiento
    if sentiment == "positive":
        context.conversation_style = "casual"
    elif sentiment == "negative":
        context.conversation_style = "professional"
    else:
        context.conversation_style = "formal"

def get_appointment_links():
    """Obtiene enlaces para agendar citas"""
    return {
        "online": "https://calendly.com/despacholegal",
        "phone": "+34 91 123 4567",
        "email": "citas@despacholegal.com"
    }

def extract_age(text: str) -> Optional[int]:
    """Extrae edad del texto con validación estricta"""
    try:
        # Limpiar el texto y buscar solo números
        import re
        # Buscar números que estén solos (no parte de otros números)
        numbers = re.findall(r'\b(\d{1,3})\b', text.strip())
        
        # Si hay múltiples números, tomar el primero que sea válido
        for num in numbers:
            age = int(num)
            # Validación estricta: solo edades entre 18 y 100
            if 18 <= age <= 100:
                return age
        
        # Si no se encontró una edad válida, verificar si el texto es solo un número
        text_clean = text.strip()
        if text_clean.isdigit():
            age = int(text_clean)
            if 18 <= age <= 100:
                return age
            else:
                return None  # Edad fuera del rango válido
                
    except (ValueError, TypeError):
        pass
    
    return None

def extract_phone(text: str) -> Optional[str]:
    """Extrae número de teléfono del texto"""
    import re
    # Patrones para teléfonos españoles
    patterns = [
        r'\+34\s*\d{9}',  # +34 612345678
        r'\+34\s*\d{3}\s*\d{3}\s*\d{3}',  # +34 612 345 678
        r'\d{9}',  # 612345678
        r'\d{3}\s*\d{3}\s*\d{3}'  # 612 345 678
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            phone = match.group()
            # Limpiar espacios
            phone = re.sub(r'\s+', '', phone)
            return phone
    return None

def extract_email(text: str) -> Optional[str]:
    """Extrae email del texto"""
    import re
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group() if match else None

def get_available_dates():
    """Genera fechas disponibles para citas"""
    dates = []
    base_date = datetime.now()
    
    # Generar fechas para los próximos 15 días, solo días laborables
    for i in range(1, 16):
        date = base_date + timedelta(days=i)
        if date.weekday() < 5:  # Lunes a Viernes (0-4)
            # Generar horarios diferentes para cada día
            hours = [9, 11, 14, 16, 18]  # Horarios disponibles
            for hour in hours:
                appointment_date = date.replace(hour=hour, minute=0, second=0, microsecond=0)
                dates.append(appointment_date)
    
    return dates[:8]  # Limitar a 8 opciones (más manejable)

def handle_appointment_conversation(user_id: str, message: str) -> str:
    """Maneja la conversación de agendar citas"""
    conv = active_conversations[user_id]
    text_lower = message.lower().strip()
    
    print(f"[DEBUG] Appointment conversation - Stage: {conv.stage}, Message: '{message}', Data: {conv.data}")
    
    # Etapa inicial - detectar si quiere agendar cita
    if conv.stage == "initial":
        if any(word in text_lower for word in ["cita", "agendar", "programar", "consulta", "reunión", "visita"]):
            conv.stage = "collecting_info"
            return "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo?"
        elif is_affirmative_response(text_lower):
            conv.stage = "collecting_info"
            return "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo?"
        else:
            return "Entiendo. ¿Te gustaría agendar una cita para que nuestros abogados puedan ayudarte mejor?"
    
    # Etapa de recopilación de información
    elif conv.stage == "collecting_info":
        # Pregunta actual basada en qué datos faltan
        if conv.data['fullName'] is None:
            if len(message.strip()) > 2:  # Validar que no sea muy corto
                conv.data['fullName'] = message.strip()
                return f"Gracias {conv.data['fullName']}. ¿Cuál es tu edad?"
            else:
                return "Por favor, proporciona tu nombre completo."
        
        elif conv.data['age'] is None:
            age = extract_age(message)
            print(f"[DEBUG] Age extraction - Input: '{message}', Extracted age: {age}")
            if age:
                conv.data['age'] = age
                return "Perfecto. ¿Cuál es tu número de teléfono de contacto?"
            else:
                # Mensaje más específico según el tipo de error
                text_clean = message.strip()
                if text_clean.isdigit():
                    age_value = int(text_clean)
                    if age_value < 18:
                        return "Debes ser mayor de edad (18 años o más) para agendar una cita. Por favor, proporciona tu edad real."
                    elif age_value > 100:
                        return "Por favor, proporciona una edad válida (entre 18 y 100 años)."
                else:
                    return "Por favor, proporciona tu edad (solo el número, entre 18 y 100 años)."
        
        elif conv.data['phone'] is None:
            phone = extract_phone(message)
            if phone:
                conv.data['phone'] = phone
                return "Excelente. ¿Cuál es tu correo electrónico?"
            else:
                return "Por favor, proporciona un número de teléfono válido (ejemplo: 612345678 o +34 612345678)."
        
        elif conv.data['email'] is None:
            email = extract_email(message)
            if email:
                conv.data['email'] = email
                return "Muy bien. ¿Cuál es el motivo de tu consulta? (Por ejemplo: despido, acoso laboral, impago de salarios, etc.)"
            else:
                return "Por favor, proporciona un email válido."
        
        elif conv.data['consultationReason'] is None:
            if len(message.strip()) > 3:  # Validar que no sea muy corto
                conv.data['consultationReason'] = message.strip()
                # Determinar automáticamente el tipo de consulta basado en el motivo
                reason_lower = message.lower()
                if any(word in reason_lower for word in ["despido", "trabajo", "laboral", "empleo", "contrato", "salario", "horario"]):
                    conv.data['consultationType'] = "Derecho Laboral"
                elif any(word in reason_lower for word in ["divorcio", "familia", "hijos", "custodia", "pensión"]):
                    conv.data['consultationType'] = "Derecho Familiar"
                elif any(word in reason_lower for word in ["herencia", "testamento", "sucesión"]):
                    conv.data['consultationType'] = "Derecho Civil"
                elif any(word in reason_lower for word in ["empresa", "comercial", "mercantil", "sociedad"]):
                    conv.data['consultationType'] = "Derecho Mercantil"
                elif any(word in reason_lower for word in ["multa", "sanción", "administrativo"]):
                    conv.data['consultationType'] = "Derecho Administrativo"
                else:
                    conv.data['consultationType'] = "Derecho Civil"  # Por defecto
                
                # Generar fechas disponibles
                available_dates = get_available_dates()
                conv.context['available_dates'] = available_dates
                
                date_options = []
                for i, date in enumerate(available_dates, 1):
                    date_str = date.strftime("%A %d de %B a las %H:%M")
                    date_options.append(f"• {i}. {date_str}")
                
                return f"Perfecto. ¿Qué fecha prefieres para tu consulta?\n\nOpciones disponibles:\n" + "\n".join(date_options) + f"\n\nResponde con el número de la opción que prefieras (1-{len(available_dates)})."
            else:
                return "Por favor, describe el motivo de tu consulta con más detalle."
        
        elif conv.data['preferredDate'] is None:
            try:
                date_index = int(message.strip()) - 1
                available_dates = conv.context.get('available_dates', [])
                print(f"[DEBUG] Date selection - Input: '{message}', Parsed index: {date_index}, Available dates count: {len(available_dates)}")
                
                if 0 <= date_index < len(available_dates):
                    selected_date = available_dates[date_index]
                    conv.data['preferredDate'] = selected_date.isoformat() + "Z"
                    conv.stage = "confirmation"
                    return create_confirmation_message(conv.data)
                else:
                    # Mostrar las opciones disponibles nuevamente
                    date_options = []
                    for i, date in enumerate(available_dates, 1):
                        date_str = date.strftime("%A %d de %B a las %H:%M")
                        date_options.append(f"• {i}. {date_str}")
                    
                    return f"Por favor, selecciona una opción válida (1-{len(available_dates)}):\n\n" + "\n".join(date_options)
            except ValueError:
                print(f"[DEBUG] Date selection - Invalid input: '{message}'")
                # Mostrar las opciones disponibles nuevamente
                available_dates = conv.context.get('available_dates', [])
                date_options = []
                for i, date in enumerate(available_dates, 1):
                    date_str = date.strftime("%A %d de %B a las %H:%M")
                    date_options.append(f"• {i}. {date_str}")
                
                return f"Por favor, responde con el número de la opción (1-{len(available_dates)}):\n\n" + "\n".join(date_options)
    
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
                        date_str = preferred_date[:10]
                    else:
                        date_str = "Fecha no especificada"
                    return f"¡Perfecto! Tu cita ha sido agendada exitosamente.\n\n📅 **Detalles de tu cita:**\n• Nombre: {conv.data['fullName']}\n• Fecha: {date_str}\n• Motivo: {conv.data['consultationReason']}\n\nTe hemos enviado un email de confirmación a {conv.data['email']}.\n\nUn abogado se pondrá en contacto contigo pronto para confirmar los detalles. ¡Gracias por confiar en nosotros!"
                else:
                    print(f"[DEBUG] Error del backend: {response.status_code} - {response.text}")
                    return f"Lo siento, hubo un problema al agendar tu cita (Error {response.status_code}). Por favor, contacta directamente al despacho por teléfono o email."
            except Exception as e:
                print(f"[DEBUG] Error saving appointment: {e}")
                return f"Lo siento, hubo un problema al agendar tu cita (Error: {str(e)}). Por favor, contacta directamente al despacho por teléfono o email."
        elif is_negative_response(message):
            conv.stage = "collecting_info"
            conv.data = {key: None for key in conv.data}
            conv.current_question = None
            return "Entiendo. Empecemos de nuevo. ¿Cuál es tu nombre completo?"
        else:
            return "Por favor, responde 'sí' para confirmar o 'no' para empezar de nuevo."
    
    return "No entiendo. ¿Podrías repetir?"

def create_confirmation_message(data: Dict[str, Any]) -> str:
    """Crea mensaje de confirmación con los datos recopilados"""
    preferred_date = data['preferredDate']
    if isinstance(preferred_date, str):
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
• Fecha preferida: {date_str}

¿Está todo correcto? Responde 'sí' para confirmar o 'no' para empezar de nuevo."""

# Base de conocimientos mejorada
def get_knowledge_base():
    """Obtiene base de conocimientos con información dinámica del backend"""
    contact_info = get_backend_info()
    services = get_services_info()
    honorarios = get_honorarios_info()
    
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
            "patterns": ["agendar cita", "programar cita", "cita con abogado", "consultar abogado", "quiero una cita", "necesito cita", "hacer cita"],
            "responses": [
                "Para agendar una cita, puedo ayudarte a recopilar toda la información necesaria. ¿Te gustaría que empecemos ahora?",
                "Las citas se pueden programar de lunes a viernes de 9:00 AM a 6:00 PM. ¿Prefieres una consulta presencial o virtual?",
                "Puedo ayudarte a programar una cita. ¿Qué día y hora te resulta más conveniente?"
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
            "patterns": ["documento", "papeles", "escritura", "contrato", "demanda", "expediente", "certificado", "revisar documentos"],
            "responses": [
                "Para revisar documentos legales, necesitarás una cita con nuestros abogados. ¿Te gustaría programar una consulta?",
                "La revisión de documentos requiere análisis especializado. Nuestros abogados pueden ayudarte con esto.",
                "Los documentos legales deben ser revisados por profesionales. ¿Qué tipo de documento necesitas revisar?",
                "La revisión de documentos legales es un servicio especializado. ¿Podrías contarme qué tipo de documento necesitas revisar?"
            ]
        },
        "despedida": {
            "patterns": ["adiós", "hasta luego", "nos vemos", "chao", "bye", "hasta la vista", "que tengas buen día", "gracias por la ayuda"],
            "responses": [
                "¡Hasta luego! Ha sido un placer ayudarte. Si necesitas algo más, no dudes en volver.",
                "¡Que tengas un excelente día! Estamos aquí cuando necesites asesoramiento legal.",
                "¡Hasta pronto! Recuerda que estamos disponibles para cualquier consulta legal que tengas.",
                "¡Adiós! Ha sido un gusto asistirte. ¡Que tengas un buen día!"
            ]
        },
        "agradecimiento": {
            "patterns": ["gracias", "thank you", "muchas gracias", "te agradezco", "muy agradecido", "gracias por la ayuda"],
            "responses": [
                "¡De nada! Es un placer poder ayudarte. ¿Hay algo más en lo que pueda asistirte?",
                "¡Por supuesto! Estoy aquí para ayudarte. ¿Necesitas información sobre algún otro tema?",
                "¡Encantado de ayudar! Si tienes más preguntas, no dudes en preguntarme.",
                "¡De nada! Me alegra haber podido ayudarte. ¿Hay algo más que te gustaría saber?"
            ]
        },
        "ayuda_general": {
            "patterns": ["ayuda", "help", "socorro", "necesito ayuda", "no sé qué hacer", "perdido", "confundido"],
            "responses": [
                "¡No te preocupes! Estoy aquí para ayudarte. ¿Qué tipo de asunto legal tienes?",
                "Tranquilo, te ayudo a encontrar la solución. ¿Podrías contarme qué necesitas?",
                "¡Por supuesto! Te guío paso a paso. ¿En qué área del derecho necesitas asesoramiento?",
                "No te sientas perdido, te oriento. ¿Qué te trae al despacho hoy?"
            ]
        },
        "preguntas_generales": {
            "patterns": ["pregunta", "duda", "curiosidad", "saber", "conocer", "entender", "qué es", "cómo funciona"],
            "responses": [
                "¡Me encanta que tengas curiosidad! ¿Qué te gustaría saber sobre nuestros servicios legales?",
                "¡Excelente pregunta! Estoy aquí para aclarar todas tus dudas. ¿Qué te interesa conocer?",
                "¡Por supuesto! Te explico todo lo que necesites saber. ¿Qué te gustaría entender mejor?",
                "¡Me alegra tu interés! ¿Sobre qué tema legal te gustaría aprender más?"
            ]
        },
        "experiencia": {
            "patterns": ["experiencia", "años", "tiempo", "cuánto tiempo", "antigüedad", "trayectoria"],
            "responses": [
                "Nuestro despacho tiene años de experiencia en múltiples áreas del derecho. Nuestros abogados son profesionales altamente calificados.",
                "Contamos con amplia experiencia en casos complejos. Nuestro equipo tiene décadas de práctica legal combinada.",
                "Tenemos una sólida trayectoria en el ámbito legal. Nuestros abogados están especializados en sus respectivas áreas.",
                "Nuestra experiencia nos respalda. Hemos manejado casos exitosos en todas las áreas del derecho que practicamos."
            ]
        },
        "confidencialidad": {
            "patterns": ["confidencial", "secreto", "privacidad", "discreto", "confianza", "reservado"],
            "responses": [
                "La confidencialidad es fundamental en nuestro trabajo. Todas las consultas y casos son tratados con absoluta discreción.",
                "Tu privacidad es nuestra prioridad. Toda la información que compartas con nosotros está protegida por el secreto profesional.",
                "Puedes confiar en nuestra discreción. El secreto profesional es la base de nuestra relación con los clientes.",
                "La confidencialidad está garantizada. Tu información personal y legal está completamente protegida."
            ]
        }
    }

def get_semantic_similarity_response(user_message: str, knowledge_base: dict) -> Optional[str]:
    """Obtiene respuesta usando similitud semántica"""
    if not SENTENCE_TRANSFORMERS_AVAILABLE or not embedding_model:
        return None
    
    try:
        # Buscar la categoría más similar
        best_category = None
        best_score = 0
        
        for category, info in knowledge_base.items():
            patterns = info.get("patterns", [])
            if not patterns:
                continue
            
            # Calcular embeddings
            query_embedding = embedding_model.encode(user_message)
            pattern_embeddings = embedding_model.encode(patterns)
            
            # Calcular similitud
            cosine_scores = util.pytorch_cos_sim(query_embedding, pattern_embeddings)
            max_score = cosine_scores.max().item()
            
            if max_score > best_score:
                best_score = max_score
                best_category = category
        
        if best_category and best_score > 0.6:
            responses = knowledge_base[best_category]["responses"]
            return random.choice(responses)
        
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

def get_hf_response(user_message: str, conversation_history: list = []) -> Optional[str]:
    """Obtiene respuesta de Hugging Face"""
    if not HF_API_TOKEN:
        return None
    
    try:
        headers = {"Authorization": f"Bearer {HF_API_TOKEN}"}
        
        # Construir prompt
        prompt = build_prompt(conversation_history, user_message)
        
        response = requests.post(
            HF_API_URL,
            headers=headers,
            json={"inputs": prompt, "parameters": {"max_new_tokens": 150, "temperature": 0.7}}
        )
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                generated_text = result[0].get("generated_text", "")
                # Extraer solo la respuesta del asistente
                if "Asistente:" in generated_text:
                    response_text = generated_text.split("Asistente:")[-1].strip()
                    return response_text
                return generated_text
        
        return None
        
    except Exception as e:
        print(f"[HF] Error: {e}")
        return None

def build_prompt(conversation_history, user_message):
    """Construye el prompt para Hugging Face"""
    contact_info = get_backend_info()
    services = get_services_info()
    honorarios = get_honorarios_info()
    
    system_prompt = f"""Eres un asistente virtual especializado en derecho para el Despacho Legal "García & Asociados". 

INFORMACIÓN DEL DESPACHO:
- Horarios: Lunes a Viernes 9:00 AM - 6:00 PM, Sábados 9:00 AM - 1:00 PM
- Teléfono: {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}
- Email: {contact_info.get('CONTACT_EMAIL', 'info@despacholegal.com')}
- Dirección: Av. Principal 123, Ciudad
- Servicios: {', '.join(services)}
- Honorarios: Rango {honorarios['rango']}, Consulta inicial gratuita

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

    conversation_context = ""
    if conversation_history:
        recent_messages = conversation_history[-3:]
        for msg in recent_messages:
            role = "Usuario" if msg.get("isUser") else "Asistente"
            conversation_context += f"{role}: {msg['text']}\n"
    
    full_prompt = f"{system_prompt}\n{conversation_context}Usuario: {user_message}\nAsistente:"
    return full_prompt

def process_message_fallback(text: str, language: str = "es", conversation_history: list = []) -> str:
    """Procesa mensaje usando base de conocimientos local con mejor contexto"""
    knowledge_base = get_knowledge_base()
    text_lower = text.lower().strip()
    
    # Buscar coincidencias exactas primero
    for category, info in knowledge_base.items():
        patterns = info.get("patterns", [])
        if any(pattern in text_lower for pattern in patterns):
            responses = info.get("responses", [])
            if responses:
                return random.choice(responses)
    
    # Analizar el contexto de la conversación para respuestas más naturales
    if conversation_history:
        recent_messages = conversation_history[-3:]
        user_messages = [msg.get("text", "").lower() for msg in recent_messages if msg.get("isUser")]
        
        # Si el usuario ha estado preguntando sobre temas específicos
        if any("precio" in msg or "costo" in msg or "honorarios" in msg for msg in user_messages):
            return "Entiendo tu interés en los costos. Para darte una estimación precisa, necesitaría conocer más detalles de tu caso. ¿Te gustaría agendar una consulta gratuita para discutir los honorarios específicos?"
        
        if any("servicio" in msg or "especialidad" in msg or "área" in msg for msg in user_messages):
            return "Me alegra tu interés en nuestros servicios. ¿En qué área específica del derecho necesitas ayuda o tienes alguna pregunta concreta sobre nuestros servicios?"
        
        if any("contacto" in msg or "teléfono" in msg or "email" in msg for msg in user_messages):
            return "¿Hay algo más en lo que pueda ayudarte o te gustaría agendar una cita para discutir tu caso en detalle?"
    
    # Respuestas genéricas más naturales y variadas
    generic_responses = [
        "Entiendo tu consulta. Para brindarte la mejor asesoría, te recomiendo programar una cita con nuestros abogados especializados. ¿Te gustaría que te ayude con eso?",
        "Tu pregunta es importante. Nuestros abogados pueden ayudarte mejor con este tema. ¿Te gustaría agendar una cita?",
        "Para responder adecuadamente a tu consulta, necesitaría más contexto. ¿Podrías programar una cita para discutir los detalles?",
        "Nuestros abogados están especializados en este tipo de casos. ¿Te gustaría que te ayude a agendar una consulta?",
        "Para darte una respuesta precisa, necesitaría revisar los detalles de tu caso. ¿Podrías programar una cita?",
        "Me gustaría ayudarte mejor con tu consulta. ¿Te parece si agendamos una cita para que nuestros abogados puedan asesorarte adecuadamente?",
        "Tu situación requiere análisis especializado. ¿Te gustaría que te ayude a programar una consulta con nuestros expertos?",
        "Para brindarte la mejor orientación, necesitaría más información sobre tu caso. ¿Podrías contarme más detalles o prefieres agendar una cita?"
    ]
    
    return random.choice(generic_responses)

def process_message(text: str, language: str = "es", conversation_history: list | None = None, user_id: Optional[str] = None) -> str:
    if conversation_history is None:
        conversation_history = []
    
    # Generar user_id si no se proporciona
    if not user_id:
        user_id = "anonymous"
    
    # Obtener contexto de conversación
    context = get_conversation_context(user_id)
    
    # Detectar intenciones y sentimiento
    intents = detect_intent(text, conversation_history)
    sentiment = analyze_sentiment(text)
    
    # Actualizar contexto
    primary_intent = max(intents.items(), key=lambda x: x[1])[0] if intents else "general_question"
    update_conversation_context(user_id, text, primary_intent, sentiment)
    
    # Comando de reset para limpiar conversaciones
    if text.lower().strip() in ["reset", "reiniciar", "limpiar", "nuevo", "empezar de nuevo"]:
        if user_id in active_conversations:
            del active_conversations[user_id]
        conversation_contexts.pop(user_id, None)
        return "🔄 Conversación reiniciada. ¿En qué puedo ayudarte?"
    
    # Verificar si hay una conversación activa de cita (PRIORIDAD ALTA)
    if user_id in active_conversations:
        appointment_response = handle_appointment_conversation(user_id, text)
        if appointment_response:
            return appointment_response
    
    # Manejar opciones numéricas del menú (solo si NO hay conversación activa)
    if text.strip() in ["1", "1️⃣", "uno", "primero"]:
        active_conversations[user_id] = AppointmentConversation()
        return "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo?"
    
    if text.strip() in ["2", "2️⃣", "dos", "segundo"]:
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
    
    if text.strip() in ["3", "3️⃣", "tres", "tercero"]:
        contact_info = get_backend_info()
        return f"""📞 **Información de Contacto:**

📱 **Teléfono:** {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}
📧 **Email:** {contact_info.get('CONTACT_EMAIL', 'info@despacholegal.com')}
📍 **Dirección:** {contact_info.get('CONTACT_ADDRESS', 'Av. Principal 123, Madrid')}

🕐 **Horarios de atención:**
• Lunes a Viernes: 9:00 AM - 6:00 PM
• Sábados: 9:00 AM - 1:00 PM

¿Te gustaría agendar una cita o tienes alguna otra consulta?"""
    
    if text.strip() in ["4", "4️⃣", "cuatro", "cuarto"]:
        return "Por favor, cuéntame más sobre tu consulta específica. ¿En qué puedo ayudarte?"
    
    # Manejar despedidas
    if intents.get("farewell", 0) > 0.5:
        return "¡Hasta luego! Ha sido un placer ayudarte. Si necesitas algo más, no dudes en volver."
    
    # Manejar agradecimientos
    if intents.get("thanks", 0) > 0.5:
        return "¡De nada! Es un placer poder ayudarte. ¿Hay algo más en lo que pueda asistirte?"
    
    # Manejar saludos con personalización
    if intents.get("greeting", 0) > 0.5:
        if context.user_name:
            return f"¡Hola {context.user_name}! Me alegra verte de nuevo. ¿En qué puedo ayudarte hoy?"
        else:
            return "¡Hola! Soy el asistente virtual del despacho legal. ¿En qué puedo ayudarte hoy? Puedo informarte sobre nuestros servicios, honorarios, horarios de atención o ayudarte a agendar una cita."
    
    # Detectar intención de agendar cita (umbral ajustado)
    if intents.get("appointment", 0) > 0.6:
        active_conversations[user_id] = AppointmentConversation()
        appointment_response = handle_appointment_conversation(user_id, text)
        if appointment_response:
            return appointment_response
    
    # Verificar respuestas afirmativas que podrían ser sobre citas (contexto más específico)
    if is_affirmative_response(text):
        if conversation_history:
            last_assistant_message = None
            for msg in reversed(conversation_history):
                if not msg.get("isUser"):
                    last_assistant_message = msg.get("text", "").lower()
                    break
            
            # Verificar que el último mensaje del asistente sea específicamente sobre agendar citas
            if last_assistant_message and any(phrase in last_assistant_message for phrase in [
                "agendar tu cita", "programar tu cita", "ayudarte a agendar", "empezar a agendar",
                "¿te gustaría que te ayude a programar una cita?", "¿te gustaría agendar una cita?",
                "te recomiendo programar una cita", "brindarte la mejor asesoría"
            ]):
                active_conversations[user_id] = AppointmentConversation()
                return "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\n\n¿Cuál es tu nombre completo?"
    
    # Manejar emergencias
    if intents.get("emergency", 0) > 0.6:
        contact_info = get_backend_info()
        return f"Para casos urgentes, puedes llamarnos al {contact_info.get('CONTACT_PHONE', '(555) 123-4567')}. Tenemos abogados disponibles para emergencias."
    
    # Manejar quejas con empatía
    if intents.get("complaint", 0) > 0.5:
        return "Entiendo tu frustración. Estoy aquí para ayudarte a encontrar una solución. ¿Podrías contarme más sobre tu situación?"
    
    # Manejar solicitudes de ayuda general
    if intents.get("help", 0) > 0.5:
        return "¡No te preocupes! Estoy aquí para ayudarte. ¿Qué tipo de asunto legal tienes?"
    
    # Buscar en la base de conocimientos específica
    knowledge_base = get_knowledge_base()
    text_lower = text.lower().strip()
    
    # Buscar coincidencias específicas en la base de conocimientos
    for category, info in knowledge_base.items():
        patterns = info.get("patterns", [])
        if any(pattern in text_lower for pattern in patterns):
            responses = info.get("responses", [])
            if responses:
                # Usar la primera respuesta en lugar de aleatoria para mayor coherencia
                return responses[0]
    
    # Respuestas contextuales basadas en el historial de temas
    if context.topics_discussed:
        last_topic = context.topics_discussed[-1]
        if last_topic == "pricing":
            return "¿Te gustaría que te ayude a agendar una consulta gratuita para discutir los honorarios específicos de tu caso?"
        elif last_topic == "services":
            return "¿En cuál de nuestras especialidades te gustaría profundizar o necesitas ayuda con algún caso específico?"
        elif last_topic == "contact":
            return "¿Hay algo más en lo que pueda ayudarte o te gustaría agendar una cita?"

    # --- NUEVO: Respuesta conversacional y menú vertical con explicación de área legal ---
    # Detectar si el texto menciona un área legal concreta
    area_legal = None
    area_explicacion = None
    text_lower = text.lower().strip()
    
    # Mejorar la detección de áreas legales
    if any(word in text_lower for word in ["laboral", "trabajo", "empleo", "despido", "acoso", "contrato laboral", "salario"]):
        area_legal = "Derecho Laboral"
        area_explicacion = "El Derecho Laboral abarca temas como despidos, acoso laboral, contratos de trabajo, salarios y condiciones laborales."
    elif any(word in text_lower for word in ["civil", "herencia", "testamento", "sucesión", "contrato civil", "reclamación"]):
        area_legal = "Derecho Civil"
        area_explicacion = "El Derecho Civil incluye herencias, testamentos, sucesiones, contratos civiles y reclamaciones de cantidad."
    elif any(word in text_lower for word in ["familiar", "divorcio", "custodia", "pensión", "hijos", "matrimonio", "separación"]):
        area_legal = "Derecho Familiar"
        area_explicacion = "El Derecho Familiar trata sobre divorcios, custodias, pensiones alimenticias y otros asuntos familiares."
    elif any(word in text_lower for word in ["mercantil", "empresa", "comercial", "sociedad", "negocio", "compañía"]):
        area_legal = "Derecho Mercantil"
        area_explicacion = "El Derecho Mercantil regula la actividad de empresas, sociedades y contratos comerciales."
    elif any(word in text_lower for word in ["penal", "delito", "acusación", "defensa", "crimen", "juicio penal"]):
        area_legal = "Derecho Penal"
        area_explicacion = "El Derecho Penal se ocupa de delitos, acusaciones y defensa penal."
    elif any(word in text_lower for word in ["administrativo", "multa", "sanción", "administración", "gobierno"]):
        area_legal = "Derecho Administrativo"
        area_explicacion = "El Derecho Administrativo abarca sanciones, multas y relaciones con la administración pública."

    # Construir la explicación de manera más robusta
    if area_legal:
        explicacion = f"Has indicado el área: {area_legal}. {area_explicacion}\n\n"
    else:
        explicacion = ""

    return f"""{explicacion}Entiendo tu consulta. ¿Qué te gustaría hacer?

📋 **Opciones disponibles:**

1️⃣ **Agendar una cita**
   Para consulta personalizada con nuestros abogados

2️⃣ **Información general**
   Sobre servicios, honorarios, horarios

3️⃣ **Contacto directo**
   Teléfono, email, ubicación

4️⃣ **Otro asunto**
   Especifica tu consulta

Responde con el número de la opción que prefieras o escribe tu consulta directamente."""

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
            # REGISTRA el websocket activo
            active_websockets[user_id] = websocket
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
        if user_id and user_id in active_websockets:
            del active_websockets[user_id]
        pass

@app.post("/end_chat")
async def end_chat(request: Request):
    data = await request.json()
    user_id = data.get("user_id", "anonymous")
    active_conversations.pop(user_id, None)
    conversation_histories.pop(user_id, None)
    conversation_contexts.pop(user_id, None)  # Limpiar contexto de conversación
    last_activity.pop(user_id, None)
    warned_inactive.pop(user_id, None)
    return {"status": "ended"}

# Modificar el endpoint /chat para registrar actividad
@app.post("/chat")
async def chat(message: Message):
    user_id = message.user_id or "anonymous"
    # Registrar última actividad
    last_activity[user_id] = time.time()
    warned_inactive[user_id] = False
    # Obtener o crear historial de conversación
    if user_id not in conversation_histories:
        conversation_histories[user_id] = []
    conversation_history = conversation_histories[user_id]
    conversation_history.append({
        "text": message.text,
        "isUser": True,
        "timestamp": datetime.now().isoformat()
    })
    response = process_message(message.text, message.language, conversation_history, user_id)
    conversation_history.append({
        "text": response,
        "isUser": False,
        "timestamp": datetime.now().isoformat()
    })
    if len(conversation_history) > 10:
        conversation_history = conversation_history[-10:]
        conversation_histories[user_id] = conversation_history
    return {
        "response": response,
        "timestamp": datetime.now().isoformat()
    }

# Tarea background para limpiar sesiones inactivas y advertir

def cleanup_inactive_sessions():
    import asyncio
    while True:
        now = time.time()
        for user_id in list(last_activity.keys()):
            inactivity = now - last_activity[user_id]
            if inactivity > 50 and not warned_inactive.get(user_id, False):
                # Enviar advertencia por inactividad (se guarda en historial)
                warning_msg = "⚠️ No hay actividad. El chat se cerrará automáticamente en 10 segundos si no respondes."
                if user_id in conversation_histories:
                    conversation_histories[user_id].append({
                        "text": warning_msg,
                        "isUser": False,
                        "timestamp": datetime.now().isoformat()
                    })
                warned_inactive[user_id] = True
            if inactivity > 60:
                # ENVÍA mensaje de cierre si el websocket está activo
                ws = active_websockets.get(user_id)
                if ws:
                    try:
                        # Mensaje especial para el frontend
                        asyncio.run_coroutine_threadsafe(
                            ws.send_text('{"type": "close", "message": "El chat se ha cerrado por inactividad."}'),
                            asyncio.get_event_loop()
                        )
                    except Exception as e:
                        pass
                    # Elimina la referencia al websocket
                    del active_websockets[user_id]
                # Limpia la sesión como antes
                active_conversations.pop(user_id, None)
                conversation_histories.pop(user_id, None)
                conversation_contexts.pop(user_id, None)
                last_activity.pop(user_id, None)
                warned_inactive.pop(user_id, None)
        time.sleep(5)

threading.Thread(target=cleanup_inactive_sessions, daemon=True).start()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot", "timestamp": datetime.now().isoformat()}

@app.get("/test-cors")
async def test_cors():
    return {
        "message": "CORS test successful", 
        "timestamp": datetime.now().isoformat(),
        "cors_origins": os.getenv("CORS_ORIGIN", "No configurado"),
        "allowed_origins": allowed_origins,
        "backend_url": os.getenv("BACKEND_URL", "No configurado"),
        "frontend_url": os.getenv("FRONTEND_URL", "No configurado"),
        "cors_middleware_active": True
    }

@app.get("/debug-cors")
async def debug_cors():
    return {
        "status": "CORS Debug Info",
        "timestamp": datetime.now().isoformat(),
        "environment_variables": {
            "CORS_ORIGIN": os.getenv("CORS_ORIGIN", "No configurado"),
            "BACKEND_URL": os.getenv("BACKEND_URL", "No configurado"),
            "FRONTEND_URL": os.getenv("FRONTEND_URL", "No configurado")
        },
        "cors_configuration": {
            "allowed_origins": allowed_origins,
            "middleware_active": True,
            "total_origins": len(allowed_origins)
        },
        "current_origin_check": "Verificar que tu dominio esté en allowed_origins"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 