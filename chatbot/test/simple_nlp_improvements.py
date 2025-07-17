#!/usr/bin/env python3
"""
🚀 Mejoras NLP Simplificadas para Windows
==========================================

Versión simplificada que evita problemas de compilación en Windows
y usa alternativas más compatibles.
"""

import os
import sys
import subprocess
import json
from typing import Dict, Any, Optional, List

class SimpleNLPImprovements:
    def __init__(self):
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        
    def install_simple_dependencies(self) -> bool:
        """Instala dependencias simples y compatibles con Windows."""
        
        print("📦 Instalando dependencias simples...")
        
        # Dependencias que funcionan bien en Windows sin compilación
        simple_dependencies = [
            "sentence-transformers",
            "transformers",
            "torch",
            "openai",
            "anthropic", 
            "cohere",
            "spacy-transformers"
        ]
        
        success_count = 0
        
        for dep in simple_dependencies:
            print(f"   Instalando {dep}...")
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", dep
                ])
                success_count += 1
                print(f"   ✅ {dep} instalado correctamente")
            except subprocess.CalledProcessError as e:
                print(f"   ❌ Error instalando {dep}: {e}")
        
        print(f"\n📊 Resumen: {success_count}/{len(simple_dependencies)} dependencias instaladas")
        return success_count >= 3  # Al menos 3 dependencias básicas
    
    def create_simple_improved_chatbot(self) -> bool:
        """Crea una versión mejorada del chatbot sin modelos locales complejos."""
        
        print("\n🔧 Creando chatbot con mejoras simples...")
        
        # Leer el archivo actual
        main_file = os.path.join(self.current_dir, "main_improved.py")
        try:
            with open(main_file, 'r', encoding='utf-8') as f:
                current_code = f.read()
        except FileNotFoundError:
            print(f"❌ No se encontró {main_file}")
            return False
        
        # Crear versión mejorada
        improved_code = self._generate_simple_improvements(current_code)
        
        # Guardar versión mejorada
        improved_file = os.path.join(self.current_dir, "main_simple_improved.py")
        
        try:
            with open(improved_file, 'w', encoding='utf-8') as f:
                f.write(improved_code)
            
            print(f"✅ Chatbot mejorado guardado como: {improved_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando archivo: {e}")
            return False
    
    def _generate_simple_improvements(self, current_code: str) -> str:
        """Genera mejoras simples sin modelos locales complejos."""
        
        # Imports adicionales simples
        additional_imports = '''
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
'''
        
        # Función de similitud semántica
        semantic_function = '''
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
'''
        
        # Función process_message mejorada
        improved_process_message = '''
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
                return "¡Perfecto! Te ayudo a agendar tu cita. Para comenzar, necesito algunos datos:\\n\\n¿Cuál es tu nombre completo?"
    
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
'''
        
        # Insertar imports adicionales después de los imports existentes
        lines = current_code.split('\n')
        import_end = 0
        for i, line in enumerate(lines):
            if line.startswith('import ') or line.startswith('from '):
                import_end = i + 1
        
        lines.insert(import_end, additional_imports)
        
        # Reemplazar la función process_message
        current_code = '\n'.join(lines)
        
        # Buscar y reemplazar la función process_message
        if 'def process_message(' in current_code:
            # Encontrar el inicio de la función
            start_idx = current_code.find('def process_message(')
            # Encontrar el final de la función (buscar la siguiente función)
            end_markers = [
                '\ndef ',
                '\n@app.',
                '\nif __name__'
            ]
            
            end_idx = len(current_code)
            for marker in end_markers:
                marker_idx = current_code.find(marker, start_idx + 1)
                if marker_idx != -1 and marker_idx < end_idx:
                    end_idx = marker_idx
            
            # Reemplazar la función
            before = current_code[:start_idx]
            after = current_code[end_idx:]
            
            current_code = before + semantic_function + '\n' + improved_process_message + after
        
        return current_code
    
    def create_simple_config(self) -> bool:
        """Crea configuración simple."""
        
        config = {
            "simple_nlp_settings": {
                "use_semantic_similarity": True,
                "use_cloud_services": True,
                "use_huggingface_fallback": True,
                "similarity_threshold": 0.6,
                "max_tokens": 100,
                "temperature": 0.7
            },
            "cloud_services": {
                "openai": {
                    "enabled": True,
                    "model": "gpt-3.5-turbo",
                    "max_tokens": 100
                },
                "cohere": {
                    "enabled": True,
                    "model": "command",
                    "max_tokens": 100
                },
                "anthropic": {
                    "enabled": True,
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 100
                }
            },
            "fallback_order": [
                "semantic_similarity",
                "cloud_services",
                "huggingface",
                "knowledge_base"
            ],
            "windows_compatibility": {
                "no_compilation_required": True,
                "simple_installation": True,
                "cloud_first": True
            }
        }
        
        config_file = os.path.join(self.current_dir, "simple_nlp_config.json")
        
        try:
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Configuración simple guardada en: {config_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando configuración: {e}")
            return False
    
    def create_env_template(self) -> bool:
        """Crea plantilla de variables de entorno."""
        
        env_template = '''# ============================================================================
# CONFIGURACIÓN DE SERVICIOS EN LA NUBE (OPCIONAL)
# ============================================================================

# OpenAI (recomendado para mejor calidad)
OPENAI_API_KEY="tu-api-key-de-openai"

# Cohere (buena relación calidad-precio)
COHERE_API_KEY="tu-api-key-de-cohere"

# Anthropic (excelente razonamiento)
ANTHROPIC_API_KEY="tu-api-key-de-anthropic"

# ============================================================================
# CONFIGURACIÓN DEL CHATBOT
# ============================================================================
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# ============================================================================
# CONFIGURACIÓN DE HUGGING FACE (FALLBACK)
# ============================================================================
HF_API_TOKEN="tu-token-de-huggingface"
'''
        
        env_file = os.path.join(self.current_dir, ".env.template")
        
        try:
            with open(env_file, 'w', encoding='utf-8') as f:
                f.write(env_template)
            
            print(f"✅ Plantilla de variables de entorno guardada en: {env_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando plantilla: {e}")
            return False
    
    def run_simple_installation(self) -> bool:
        """Ejecuta la instalación simple."""
        
        print("🚀 INSTALACIÓN NLP SIMPLE")
        print("=" * 30)
        
        # 1. Instalar dependencias simples
        if not self.install_simple_dependencies():
            print("❌ Error instalando dependencias básicas")
            return False
        
        # 2. Crear chatbot mejorado
        if not self.create_simple_improved_chatbot():
            return False
        
        # 3. Crear configuración
        if not self.create_simple_config():
            return False
        
        # 4. Crear plantilla de variables de entorno
        if not self.create_env_template():
            return False
        
        print("\n🎉 ¡INSTALACIÓN SIMPLE COMPLETADA!")
        print("=" * 40)
        print("📁 Archivo mejorado: main_simple_improved.py")
        print("⚙️  Configuración: simple_nlp_config.json")
        print("🔧 Plantilla ENV: .env.template")
        
        print("\n🚀 Para usar el chatbot mejorado:")
        print("   python main_simple_improved.py")
        
        print("\n💡 Características habilitadas:")
        print("   ✅ Similitud semántica (sentence-transformers)")
        print("   ✅ Servicios en la nube (OpenAI, Cohere, Anthropic)")
        print("   ✅ Fallback a Hugging Face")
        print("   ✅ Compatible con Windows")
        print("   ✅ Sin compilación requerida")
        
        print("\n🔑 Para usar servicios en la nube:")
        print("   1. Copia .env.template a .env")
        print("   2. Añade tus API keys")
        print("   3. Reinicia el chatbot")
        
        return True

def main():
    """Función principal."""
    
    print("🚀 INSTALADOR NLP SIMPLE")
    print("=" * 25)
    
    installer = SimpleNLPImprovements()
    success = installer.run_simple_installation()
    
    if success:
        print("\n✅ ¡Instalación completada exitosamente!")
        print("   El chatbot ahora tiene mejoras NLP sin problemas de compilación")
    else:
        print("\n❌ Error durante la instalación")
        print("   Revisa los mensajes anteriores")

if __name__ == "__main__":
    main() 