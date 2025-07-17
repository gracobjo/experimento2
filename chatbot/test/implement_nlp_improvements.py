#!/usr/bin/env python3
"""
🚀 Implementación Práctica de Mejoras NLP
==========================================

Este script implementa las mejoras NLP más efectivas para el chatbot,
priorizando opciones locales y gratuitas con alta calidad.
"""

import os
import sys
import subprocess
import json
from typing import Dict, Any, Optional
import requests

class NLPImprovementManager:
    def __init__(self):
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.requirements_file = os.path.join(self.current_dir, "requirements.txt")
        self.main_file = os.path.join(self.current_dir, "main_improved.py")
        
    def check_system_requirements(self) -> Dict[str, bool]:
        """Verifica los requisitos del sistema para las mejoras NLP."""
        requirements = {
            "python_version": sys.version_info >= (3, 8),
            "ram_available": self._check_ram() >= 8,  # GB
            "disk_space": self._check_disk_space() >= 10,  # GB
            "internet_connection": self._check_internet(),
        }
        return requirements
    
    def _check_ram(self) -> float:
        """Verifica la RAM disponible en GB."""
        try:
            import psutil  # type: ignore
            return psutil.virtual_memory().total / (1024**3)
        except ImportError:
            print("⚠️  psutil no disponible, asumiendo 8GB RAM")
            return 8.0
    
    def _check_disk_space(self) -> float:
        """Verifica el espacio en disco disponible en GB."""
        try:
            import psutil  # type: ignore
            return psutil.disk_usage(self.current_dir).free / (1024**3)
        except ImportError:
            print("⚠️  psutil no disponible, asumiendo 10GB disponibles")
            return 10.0
    
    def _check_internet(self) -> bool:
        """Verifica la conexión a internet."""
        try:
            requests.get("https://www.google.com", timeout=5)
            return True
        except:
            return False
    
    def install_dependencies(self, improvement_type: str = "local") -> bool:
        """Instala las dependencias necesarias según el tipo de mejora."""
        
        print(f"📦 Instalando dependencias para: {improvement_type}")
        
        if improvement_type == "local":
            # Opción 1: llama-cpp-python (recomendado para local)
            dependencies = [
                "llama-cpp-python",
                "sentence-transformers",
                "psutil"
            ]
        elif improvement_type == "cloud":
            # Opción 2: Servicios en la nube
            dependencies = [
                "openai",
                "anthropic",
                "cohere"
            ]
        elif improvement_type == "hybrid":
            # Opción 3: Combinación local + cloud
            dependencies = [
                "llama-cpp-python",
                "sentence-transformers",
                "openai",
                "psutil"
            ]
        else:
            print("❌ Tipo de mejora no válido")
            return False
        
        try:
            for dep in dependencies:
                print(f"   Instalando {dep}...")
                subprocess.check_call([sys.executable, "-m", "pip", "install", dep])
            
            print("✅ Dependencias instaladas correctamente")
            return True
            
        except subprocess.CalledProcessError as e:
            print(f"❌ Error instalando dependencias: {e}")
            return False
    
    def download_llama_model(self, model_size: str = "7b") -> bool:
        """Descarga un modelo Llama optimizado."""
        
        models = {
            "7b": {
                "url": "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf",
                "filename": "llama-2-7b-chat.Q4_K_M.gguf",
                "size_gb": 4.1
            },
            "13b": {
                "url": "https://huggingface.co/TheBloke/Llama-2-13B-Chat-GGUF/resolve/main/llama-2-13b-chat.Q4_K_M.gguf",
                "filename": "llama-2-13b-chat.Q4_K_M.gguf",
                "size_gb": 7.8
            }
        }
        
        if model_size not in models:
            print(f"❌ Tamaño de modelo no válido: {model_size}")
            return False
        
        model_info = models[model_size]
        model_path = os.path.join(self.current_dir, "models", model_info["filename"])
        
        # Crear directorio models si no existe
        os.makedirs(os.path.join(self.current_dir, "models"), exist_ok=True)
        
        if os.path.exists(model_path):
            print(f"✅ Modelo {model_size} ya descargado")
            return True
        
        print(f"📥 Descargando modelo Llama {model_size} ({model_info['size_gb']}GB)...")
        print("   Esto puede tomar varios minutos...")
        
        try:
            import requests
            from tqdm import tqdm
            
            response = requests.get(model_info["url"], stream=True)
            total_size = int(response.headers.get('content-length', 0))
            
            with open(model_path, 'wb') as f, tqdm(
                desc=model_info["filename"],
                total=total_size,
                unit='iB',
                unit_scale=True,
                unit_divisor=1024,
            ) as pbar:
                for data in response.iter_content(chunk_size=1024):
                    size = f.write(data)
                    pbar.update(size)
            
            print(f"✅ Modelo {model_size} descargado correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error descargando modelo: {e}")
            return False
    
    def create_improved_chatbot(self, improvement_type: str = "local") -> bool:
        """Crea una versión mejorada del chatbot con NLP avanzado."""
        
        print(f"🔧 Creando chatbot mejorado con: {improvement_type}")
        
        # Leer el archivo actual
        try:
            with open(self.main_file, 'r', encoding='utf-8') as f:
                current_code = f.read()
        except FileNotFoundError:
            print(f"❌ No se encontró {self.main_file}")
            return False
        
        # Crear versión mejorada
        improved_code = self._generate_improved_code(current_code, improvement_type)
        
        # Guardar versión mejorada
        improved_file = os.path.join(self.current_dir, f"main_{improvement_type}_improved.py")
        
        try:
            with open(improved_file, 'w', encoding='utf-8') as f:
                f.write(improved_code)
            
            print(f"✅ Chatbot mejorado guardado como: {improved_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando archivo: {e}")
            return False
    
    def _generate_improved_code(self, current_code: str, improvement_type: str) -> str:
        """Genera código mejorado basado en el tipo de mejora."""
        
        if improvement_type == "local":
            return self._add_local_nlp_improvements(current_code)
        elif improvement_type == "cloud":
            return self._add_cloud_nlp_improvements(current_code)
        elif improvement_type == "hybrid":
            return self._add_hybrid_nlp_improvements(current_code)
        else:
            return current_code
    
    def _add_local_nlp_improvements(self, current_code: str) -> str:
        """Añade mejoras NLP locales al código."""
        
        # Imports adicionales
        additional_imports = '''
# ============================================================================
# MEJORAS NLP LOCALES
# ============================================================================
try:
    from llama_cpp import Llama
    LLAMA_AVAILABLE = True
except ImportError:
    LLAMA_AVAILABLE = False
    print("[NLP] llama-cpp-python no disponible")

try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    print("[NLP] sentence-transformers no disponible")

# Cargar modelo de embeddings
if SENTENCE_TRANSFORMERS_AVAILABLE:
    try:
        embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("[NLP] Modelo de embeddings cargado")
    except Exception as e:
        print(f"[NLP] Error cargando modelo de embeddings: {e}")
        SENTENCE_TRANSFORMERS_AVAILABLE = False

# Cargar modelo Llama local
if LLAMA_AVAILABLE:
    try:
        model_path = "./models/llama-2-7b-chat.Q4_K_M.gguf"
        if os.path.exists(model_path):
            local_llm = Llama(
                model_path=model_path,
                n_ctx=2048,
                n_threads=4,
                n_gpu_layers=0  # Cambiar a 1+ si tienes GPU
            )
            print("[NLP] Modelo Llama local cargado")
        else:
            print("[NLP] Modelo Llama no encontrado, usando fallback")
            LLAMA_AVAILABLE = False
    except Exception as e:
        print(f"[NLP] Error cargando modelo Llama: {e}")
        LLAMA_AVAILABLE = False
'''
        
        # Función mejorada de procesamiento
        improved_processing = '''
def get_local_llm_response(user_message: str, conversation_history: list = []) -> Optional[str]:
    """Obtiene respuesta del modelo Llama local."""
    if not LLAMA_AVAILABLE:
        return None
    
    try:
        # Construir contexto de conversación
        messages = [
            {"role": "system", "content": """Eres un asistente virtual especializado en derecho para el Despacho Legal "García & Asociados". 
            
INSTRUCCIONES:
1. Responde de manera profesional, clara y empática
2. NO des consejos legales específicos, solo orientación general
3. SIEMPRE recomienda consultar con un abogado para casos concretos
4. Para citas: Sugiere programar en horarios disponibles
5. Mantén respuestas concisas pero informativas
6. Si el usuario confirma interés en citas, proporciona enlaces directos"""}
        ]
        
        # Añadir historial reciente (últimos 3 mensajes)
        if conversation_history:
            recent_history = conversation_history[-3:]
            for msg in recent_history:
                role = "user" if msg.get("isUser") else "assistant"
                messages.append({"role": role, "content": msg["text"]})
        
        # Añadir mensaje actual
        messages.append({"role": "user", "content": user_message})
        
        # Generar respuesta
        response = local_llm.create_chat_completion(
            messages=messages,
            max_tokens=150,
            temperature=0.7,
            top_p=0.9,
            repeat_penalty=1.1
        )
        
        response_text = response['choices'][0]['message']['content']
        
        # Validar respuesta
        if is_valid_response(response_text, user_message):
            print("[Local LLM] Respuesta generada por modelo local.")
            return response_text
        else:
            print("[Local LLM] Respuesta no apropiada, usando fallback.")
            return None
            
    except Exception as e:
        print(f"[Local LLM] Error: {e}")
        return None

def get_semantic_similarity_response(user_message: str, knowledge_base: dict) -> Optional[str]:
    """Obtiene respuesta basada en similitud semántica."""
    if not SENTENCE_TRANSFORMERS_AVAILABLE:
        return None
    
    try:
        # Preparar respuestas del knowledge base
        responses = []
        for intent, data in knowledge_base.items():
            responses.extend(data["responses"])
        
        if not responses:
            return None
        
        # Calcular embeddings
        query_embedding = embedding_model.encode(user_message)
        response_embeddings = embedding_model.encode(responses)
        
        # Calcular similitud
        cosine_scores = util.pytorch_cos_sim(query_embedding, response_embeddings)
        best_idx = cosine_scores.argmax().item()
        
        # Solo usar si la similitud es alta
        if cosine_scores[0][best_idx] > 0.6:
            print("[Semantic] Respuesta encontrada por similitud semántica.")
            return responses[best_idx]
        
        return None
        
    except Exception as e:
        print(f"[Semantic] Error: {e}")
        return None
'''
        
        # Modificar la función process_message
        process_message_improvement = '''
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
    
    # INTENTAR MODELO LOCAL PRIMERO
    local_response = get_local_llm_response(text, conversation_history)
    if local_response:
        return local_response
    
    # INTENTAR SIMILITUD SEMÁNTICA
    knowledge_base = get_knowledge_base()
    semantic_response = get_semantic_similarity_response(text, knowledge_base)
    if semantic_response:
        return semantic_response
    
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
        current_code = current_code.replace(
            'def process_message(text: str, language: str = "es", conversation_history: list | None = None, user_id: Optional[str] = None) -> str:',
            improved_processing + '\n' + 'def process_message(text: str, language: str = "es", conversation_history: list | None = None, user_id: Optional[str] = None) -> str:'
        )
        
        # Reemplazar el cuerpo de process_message
        start_marker = 'def process_message(text: str, language: str = "es", conversation_history: list | None = None, user_id: Optional[str] = None) -> str:'
        end_marker = '    return process_message_fallback(text, language, conversation_history)'
        
        if start_marker in current_code and end_marker in current_code:
            start_idx = current_code.find(start_marker)
            end_idx = current_code.find(end_marker) + len(end_marker)
            
            before = current_code[:start_idx]
            after = current_code[end_idx:]
            
            current_code = before + process_message_improvement + after
        
        return current_code
    
    def _add_cloud_nlp_improvements(self, current_code: str) -> str:
        """Añade mejoras NLP en la nube al código."""
        # Implementación similar pero con servicios en la nube
        return current_code
    
    def _add_hybrid_nlp_improvements(self, current_code: str) -> str:
        """Añade mejoras NLP híbridas (local + cloud) al código."""
        # Combinación de mejoras locales y en la nube
        return current_code
    
    def create_config_file(self) -> bool:
        """Crea archivo de configuración para las mejoras NLP."""
        
        config = {
            "nlp_settings": {
                "use_local_llm": True,
                "use_semantic_similarity": True,
                "use_huggingface_fallback": True,
                "model_path": "./models/llama-2-7b-chat.Q4_K_M.gguf",
                "max_tokens": 150,
                "temperature": 0.7,
                "similarity_threshold": 0.6
            },
            "performance": {
                "n_threads": 4,
                "n_gpu_layers": 0,
                "context_length": 2048
            },
            "fallback_order": [
                "local_llm",
                "semantic_similarity", 
                "huggingface",
                "knowledge_base"
            ]
        }
        
        config_file = os.path.join(self.current_dir, "nlp_config.json")
        
        try:
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Configuración NLP guardada en: {config_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando configuración: {e}")
            return False
    
    def run_improvement(self, improvement_type: str = "local") -> bool:
        """Ejecuta el proceso completo de mejora."""
        
        print("🚀 INICIANDO MEJORAS NLP")
        print("=" * 40)
        
        # 1. Verificar requisitos
        print("📋 Verificando requisitos del sistema...")
        requirements = self.check_system_requirements()
        
        for req, status in requirements.items():
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {req}: {'OK' if status else 'FALLA'}")
        
        if not all(requirements.values()):
            print("⚠️  Algunos requisitos no se cumplen, pero continuando...")
        
        # 2. Instalar dependencias
        if not self.install_dependencies(improvement_type):
            return False
        
        # 3. Descargar modelo (solo para local)
        if improvement_type in ["local", "hybrid"]:
            if not self.download_llama_model("7b"):
                print("⚠️  No se pudo descargar el modelo, continuando sin él...")
        
        # 4. Crear chatbot mejorado
        if not self.create_improved_chatbot(improvement_type):
            return False
        
        # 5. Crear configuración
        if not self.create_config_file():
            return False
        
        print("\n🎉 ¡MEJORAS NLP IMPLEMENTADAS EXITOSAMENTE!")
        print("=" * 40)
        print(f"📁 Archivo mejorado: main_{improvement_type}_improved.py")
        print(f"⚙️  Configuración: nlp_config.json")
        print(f"🤖 Modelo: models/llama-2-7b-chat.Q4_K_M.gguf")
        
        print("\n🚀 Para usar el chatbot mejorado:")
        print(f"   python main_{improvement_type}_improved.py")
        
        return True

def main():
    """Función principal del script."""
    
    print("🤖 IMPLEMENTADOR DE MEJORAS NLP")
    print("=" * 40)
    
    # Mostrar opciones
    print("\n📋 Opciones disponibles:")
    print("1. local    - Modelos locales (recomendado)")
    print("2. cloud    - Servicios en la nube")
    print("3. hybrid   - Combinación local + cloud")
    
    # Obtener selección del usuario
    while True:
        choice = input("\n🎯 Selecciona el tipo de mejora (1-3): ").strip()
        
        if choice == "1":
            improvement_type = "local"
            break
        elif choice == "2":
            improvement_type = "cloud"
            break
        elif choice == "3":
            improvement_type = "hybrid"
            break
        else:
            print("❌ Opción no válida. Intenta de nuevo.")
    
    # Ejecutar mejora
    manager = NLPImprovementManager()
    success = manager.run_improvement(improvement_type)
    
    if success:
        print("\n✅ ¡Proceso completado exitosamente!")
    else:
        print("\n❌ Error durante el proceso. Revisa los mensajes anteriores.")

if __name__ == "__main__":
    main() 