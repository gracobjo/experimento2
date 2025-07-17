from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import spacy
import nltk
import requests
import json
import os
from dotenv import load_dotenv
from datetime import datetime
import random
from typing import Optional, List, Dict
import uuid
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

# Cargar variables de entorno
load_dotenv()

# Configurar Hugging Face
HF_API_TOKEN = os.getenv("HF_API_TOKEN")
print(f"[DEBUG] HF_API_TOKEN loaded: {bool(HF_API_TOKEN)}")
# Cambiar a un modelo más simple y confiable
HF_API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"

# Descargar recursos necesarios de NLTK
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)

# Cargar modelo de spaCy en español
try:
    nlp = spacy.load("es_core_news_sm")
    print("✅ Modelo spaCy español cargado correctamente")
except OSError:
    print("Modelo de spaCy español no encontrado. Instalando...")
    import subprocess
    subprocess.run(["python", "-m", "spacy", "download", "es_core_news_sm"])
    nlp = spacy.load("es_core_news_sm")
    print("✅ Modelo spaCy español instalado y cargado")

app = FastAPI(title="Despacho Legal Chatbot", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar archivos estáticos para JS
if not os.path.exists("static"):
    os.makedirs("static/js", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

class Message(BaseModel):
    text: str
    language: str = "es"
    user_id: Optional[str] = None

# Base de conocimientos mejorada
KNOWLEDGE_BASE = {
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
            "Para una consulta legal, puedes programar una cita con nuestros abogados especializados. ¿Te gustaría que te ayude a agendar una cita?",
            "Nuestros abogados están disponibles para asesorarte. ¿En qué área del derecho necesitas ayuda?",
            "Ofrecemos consultas iniciales para evaluar tu caso. ¿Qué tipo de asunto legal tienes?"
        ]
    },
    "citas": {
        "patterns": ["cita", "agendar", "programar", "reunión", "consulta presencial", "visita"],
        "responses": [
            "Para agendar una cita, puedes usar nuestro sistema en línea en la sección 'Programar Cita' o llamarnos al (555) 123-4567.",
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
            "Ofrecemos servicios en: Derecho Civil, Mercantil, Laboral, Familiar, Penal y Administrativo. ¿En qué área específica necesitas ayuda?",
            "Nuestras especialidades incluyen: Contratos, Litigios, Derecho de Familia, Laboral y más. ¿Qué tipo de caso tienes?",
            "Somos especialistas en múltiples áreas del derecho. ¿Podrías contarme más sobre tu situación legal?"
        ]
    },
    "costos": {
        "patterns": ["costo", "precio", "honorarios", "cobran", "tarifa", "pago"],
        "responses": [
            "Los honorarios varían según la complejidad del caso. Ofrecemos una consulta inicial gratuita para evaluar tu situación.",
            "Nuestros costos son competitivos y transparentes. Durante la consulta inicial discutiremos los honorarios específicos.",
            "Los honorarios se determinan caso por caso. ¿Te gustaría programar una consulta gratuita para conocer los costos?"
        ]
    },
    "contacto": {
        "patterns": ["contacto", "teléfono", "email", "dirección", "ubicación", "dónde"],
        "responses": [
            "Puedes contactarnos al (555) 123-4567, por email a info@despacholegal.com, o visitarnos en Av. Principal 123, Ciudad.",
            "Nuestros datos de contacto: Teléfono (555) 123-4567, Email: info@despacholegal.com",
            "Estamos ubicados en Av. Principal 123, Ciudad. Teléfono: (555) 123-4567"
        ]
    },
    "emergencia": {
        "patterns": ["emergencia", "urgente", "inmediato", "ahora", "pronto"],
        "responses": [
            "Para casos urgentes, puedes llamarnos al (555) 123-4567. Tenemos abogados disponibles para emergencias.",
            "En caso de emergencia legal, llama inmediatamente al (555) 123-4567. Estamos disponibles 24/7 para casos urgentes.",
            "Para situaciones urgentes, contacta directamente al (555) 123-4567. Nuestro equipo está preparado para emergencias."
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
    # Prompt más simple y directo
    system_prompt = """Eres un asistente virtual amigable para un despacho legal. Responde de manera natural y concisa.

Información del despacho:
- Horarios: Lunes a Viernes 9:00 AM - 6:00 PM, Sábados 9:00 AM - 1:00 PM
- Teléfono: (555) 123-4567
- Email: info@despacholegal.com
- Servicios: Derecho Civil, Mercantil, Laboral, Familiar, Penal, Administrativo

Instrucciones:
- Responde de manera natural y conversacional
- Mantén respuestas cortas y directas
- Para citas: sugiere horarios disponibles
- Para horarios: da la información exacta
- NO des consejos legales específicos"""

    # Construir el contexto de la conversación
    conversation_context = ""
    if conversation_history:
        # Tomar solo los últimos 2 mensajes para contexto
        recent_messages = conversation_history[-2:]
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

def process_message_fallback(text: str, language: str = "es") -> str:
    # Usar el modelo español para todos los idiomas (simplificado)
    doc = nlp(text.lower())
    keywords = [token.text for token in doc if not token.is_stop and token.is_alpha]
    best_match = None
    max_matches = 0
    for intent, data in KNOWLEDGE_BASE.items():
        matches = sum(1 for pattern in data["patterns"] if any(keyword in pattern for keyword in keywords))
        if matches > max_matches:
            max_matches = matches
            best_match = data
    if best_match and max_matches > 0:
        return random.choice(best_match["responses"])
    default_responses = [
        "Entiendo tu consulta. Para brindarte la mejor asesoría, te recomiendo programar una cita con nuestros abogados especializados.",
        "Tu pregunta es importante. Nuestros abogados pueden ayudarte mejor con este tema. ¿Te gustaría agendar una cita?",
        "Para responder adecuadamente a tu consulta, necesitaría más contexto. ¿Podrías programar una cita para discutir los detalles?",
        "Esta es una consulta que requiere análisis especializado. Nuestros abogados están disponibles para ayudarte. ¿Te gustaría contactarnos?"
    ]
    return random.choice(default_responses)

def process_message(text: str, language: str = "es", conversation_history: list | None = None) -> str:
    if conversation_history is None:
        conversation_history = []
    hf_response = get_hf_response(text, conversation_history)
    if hf_response:
        return hf_response
    print("[Fallback] Usando base de conocimientos local.")
    return process_message_fallback(text, language)

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    conversation_history = []
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            conversation_history.append({
                "text": message["text"],
                "isUser": True,
                "timestamp": datetime.now().isoformat()
            })
            response = process_message(
                message["text"],
                message.get("language", "es"),
                conversation_history
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
    response = process_message(message.text, message.language)
    return {
        "response": response,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "chatbot", "timestamp": datetime.now().isoformat()}

# --- TELEASISTENCIA ---

# Base de datos en memoria para sesiones de teleasistencia
teleassist_sessions_db = {
    "pending": [],
    "active": {},
    "completed": []
}

class TeleassistSession:
    def __init__(self, user_id: str, issue: str, remote_tool: str = "TeamViewer"):
        self.session_id = str(uuid.uuid4())
        self.user_id = user_id
        self.issue = issue
        self.remote_tool = remote_tool
        self.created_at = datetime.now().isoformat()
        self.status = "pending"

# Endpoint para crear sesión
@app.post("/teleassist/create_session")
async def create_teleassist_session(user_id: str, issue: str, remote_tool: str = "TeamViewer"):
    new_session = TeleassistSession(user_id, issue, remote_tool)
    teleassist_sessions_db["pending"].append(new_session.__dict__)
    return {"session_id": new_session.session_id}

# Endpoint para listar sesiones
@app.get("/teleassist/sessions")
async def list_teleassist_sessions():
    return {
        "pending": teleassist_sessions_db["pending"],
        "active": list(teleassist_sessions_db["active"].values()),
        "completed": teleassist_sessions_db["completed"]
    }

# Endpoint para aceptar sesión (mueve de pending a active)
@app.post("/teleassist/accept_session/{session_id}")
async def accept_teleassist_session(session_id: str):
    session = next((s for s in teleassist_sessions_db["pending"] if s["session_id"] == session_id), None)
    if not session:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    teleassist_sessions_db["pending"] = [s for s in teleassist_sessions_db["pending"] if s["session_id"] != session_id]
    session["status"] = "active"
    teleassist_sessions_db["active"][session_id] = session
    return {"status": "accepted", "session": session}

# Endpoint para servir el dashboard HTML
@app.get("/teleassist/dashboard", response_class=HTMLResponse)
async def teleassist_dashboard():
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Teleasistencia</title>
        <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' rel='stylesheet'>
    </head>
    <body>
        <div class='container mt-5'>
            <h1 class='mb-4'>Sistema de Teleasistencia (Demo)</h1>
            <div class='row'>
                <div class='col-md-4'>
                    <div class='card'>
                        <div class='card-header bg-primary text-white'>Nueva Sesión</div>
                        <div class='card-body'>
                            <form id='sessionForm'>
                                <div class='mb-3'>
                                    <label class='form-label'>ID de Usuario</label>
                                    <input type='text' class='form-control' id='userId' required>
                                </div>
                                <div class='mb-3'>
                                    <label class='form-label'>Problema</label>
                                    <textarea class='form-control' id='issue' rows='3' required></textarea>
                                </div>
                                <div class='mb-3'>
                                    <label class='form-label'>Herramienta Remota</label>
                                    <select class='form-select' id='remoteTool'>
                                        <option value='TeamViewer'>TeamViewer</option>
                                        <option value='AnyDesk'>AnyDesk</option>
                                        <option value='VNC'>VNC</option>
                                    </select>
                                </div>
                                <button type='submit' class='btn btn-primary'>Crear Sesión</button>
                            </form>
                        </div>
                    </div>
                </div>
                <div class='col-md-8'>
                    <div class='card'>
                        <div class='card-header bg-info text-white'>Sesiones Pendientes</div>
                        <div class='card-body'>
                            <ul class='list-group' id='pendingSessionsList'></ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <script src='/static/js/teleassist.js'></script>
    </body>
    </html>
    """

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 