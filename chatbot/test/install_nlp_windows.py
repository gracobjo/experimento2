#!/usr/bin/env python3
"""
🪟 Instalador NLP para Windows
==============================

Script específico para Windows que evita problemas de compilación
y usa alternativas más compatibles.
"""

import os
import sys
import subprocess
import platform
from typing import Dict, List, Any, Optional

class WindowsNLPInstaller:
    def __init__(self):
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.is_windows = platform.system() == "Windows"
        
    def check_windows_requirements(self) -> Dict[str, bool]:
        """Verifica requisitos específicos de Windows."""
        requirements = {
            "windows_version": self.is_windows,
            "python_version": sys.version_info >= (3, 8),
            "pip_available": self._check_pip(),
            "visual_studio": self._check_visual_studio(),
            "git_available": self._check_git()
        }
        return requirements
    
    def _check_pip(self) -> bool:
        """Verifica si pip está disponible."""
        try:
            subprocess.run([sys.executable, "-m", "pip", "--version"], 
                         capture_output=True, check=True)
            return True
        except:
            return False
    
    def _check_visual_studio(self) -> bool:
        """Verifica si Visual Studio Build Tools están disponibles."""
        try:
            # Verificar si nmake está disponible
            result = subprocess.run(["nmake", "/?"], 
                                  capture_output=True, text=True)
            return result.returncode == 0
        except FileNotFoundError:
            return False
    
    def _check_git(self) -> bool:
        """Verifica si Git está disponible."""
        try:
            subprocess.run(["git", "--version"], 
                         capture_output=True, check=True)
            return True
        except:
            return False
    
    def install_windows_compatible_dependencies(self) -> bool:
        """Instala dependencias compatibles con Windows."""
        
        print("🪟 Instalando dependencias compatibles con Windows...")
        
        # Dependencias que funcionan bien en Windows
        windows_dependencies = [
            "sentence-transformers",
            "transformers",
            "torch",
            "psutil",
            "openai",
            "anthropic",
            "cohere",
            "spacy-transformers"
        ]
        
        # Dependencias opcionales (requieren compilación)
        optional_dependencies = [
            "llama-cpp-python"
        ]
        
        success_count = 0
        
        # Instalar dependencias principales
        for dep in windows_dependencies:
            print(f"   Instalando {dep}...")
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", dep
                ])
                success_count += 1
                print(f"   ✅ {dep} instalado correctamente")
            except subprocess.CalledProcessError as e:
                print(f"   ❌ Error instalando {dep}: {e}")
        
        # Intentar instalar dependencias opcionales
        print("\n🔧 Intentando instalar dependencias opcionales...")
        
        for dep in optional_dependencies:
            print(f"   Intentando {dep}...")
            try:
                # Para llama-cpp-python, intentar con precompilado
                if dep == "llama-cpp-python":
                    subprocess.check_call([
                        sys.executable, "-m", "pip", "install", 
                        "llama-cpp-python", "--prefer-binary"
                    ])
                else:
                    subprocess.check_call([
                        sys.executable, "-m", "pip", "install", dep
                    ])
                success_count += 1
                print(f"   ✅ {dep} instalado correctamente")
            except subprocess.CalledProcessError as e:
                print(f"   ⚠️  {dep} no se pudo instalar (opcional): {e}")
                print(f"      Esto es normal en Windows sin compiladores C++")
        
        print(f"\n📊 Resumen: {success_count}/{len(windows_dependencies + optional_dependencies)} dependencias instaladas")
        return success_count >= len(windows_dependencies)
    
    def install_alternative_llama(self) -> bool:
        """Instala una alternativa a llama-cpp-python para Windows."""
        
        print("\n🔄 Instalando alternativa a llama-cpp-python...")
        
        alternatives = [
            "ctransformers",  # Alternativa más compatible
            "llama-cpp-python-cuda",  # Versión con CUDA
            "llama-cpp-python-cublas"  # Versión con cuBLAS
        ]
        
        for alt in alternatives:
            print(f"   Intentando {alt}...")
            try:
                subprocess.check_call([
                    sys.executable, "-m", "pip", "install", alt
                ])
                print(f"   ✅ {alt} instalado correctamente")
                return True
            except subprocess.CalledProcessError as e:
                print(f"   ❌ {alt} no disponible: {e}")
        
        print("   ⚠️  No se pudo instalar ninguna alternativa")
        return False
    
    def create_windows_compatible_chatbot(self) -> bool:
        """Crea una versión del chatbot compatible con Windows."""
        
        print("\n🔧 Creando chatbot compatible con Windows...")
        
        # Leer el archivo actual
        main_file = os.path.join(self.current_dir, "main_improved.py")
        try:
            with open(main_file, 'r', encoding='utf-8') as f:
                current_code = f.read()
        except FileNotFoundError:
            print(f"❌ No se encontró {main_file}")
            return False
        
        # Crear versión compatible con Windows
        windows_code = self._generate_windows_compatible_code(current_code)
        
        # Guardar versión compatible
        windows_file = os.path.join(self.current_dir, "main_windows_compatible.py")
        
        try:
            with open(windows_file, 'w', encoding='utf-8') as f:
                f.write(windows_code)
            
            print(f"✅ Chatbot compatible con Windows guardado como: {windows_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando archivo: {e}")
            return False
    
    def _generate_windows_compatible_code(self, current_code: str) -> str:
        """Genera código compatible con Windows."""
        
        # Imports adicionales compatibles con Windows
        additional_imports = '''
# ============================================================================
# MEJORAS NLP COMPATIBLES CON WINDOWS
# ============================================================================
import platform
WINDOWS_SYSTEM = platform.system() == "Windows"

# Intentar cargar modelos locales (con fallbacks)
LLAMA_AVAILABLE = False
CTRANSFORMERS_AVAILABLE = False

try:
    from llama_cpp import Llama
    LLAMA_AVAILABLE = True
    print("[NLP] llama-cpp-python disponible")
except ImportError:
    print("[NLP] llama-cpp-python no disponible")
    try:
        from ctransformers import AutoModelForCausalLM
        CTRANSFORMERS_AVAILABLE = True
        print("[NLP] ctransformers disponible como alternativa")
    except ImportError:
        print("[NLP] No hay modelos locales disponibles")

# Cargar sentence-transformers (siempre disponible)
SENTENCE_TRANSFORMERS_AVAILABLE = False
try:
    from sentence_transformers import SentenceTransformer, util
    SENTENCE_TRANSFORMERS_AVAILABLE = True
    print("[NLP] sentence-transformers disponible")
except ImportError:
    print("[NLP] sentence-transformers no disponible")

# Cargar modelos de embeddings
embedding_model = None
if SENTENCE_TRANSFORMERS_AVAILABLE:
    try:
        embedding_model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("[NLP] Modelo de embeddings cargado")
    except Exception as e:
        print(f"[NLP] Error cargando modelo de embeddings: {e}")
        SENTENCE_TRANSFORMERS_AVAILABLE = False

# Cargar modelo local (con múltiples alternativas)
local_llm = None
if LLAMA_AVAILABLE:
    try:
        model_path = "./models/llama-2-7b-chat.Q4_K_M.gguf"
        if os.path.exists(model_path):
            local_llm = Llama(
                model_path=model_path,
                n_ctx=1024,  # Reducido para Windows
                n_threads=2,  # Reducido para Windows
                n_gpu_layers=0
            )
            print("[NLP] Modelo Llama local cargado")
        else:
            print("[NLP] Modelo Llama no encontrado")
    except Exception as e:
        print(f"[NLP] Error cargando modelo Llama: {e}")
        LLAMA_AVAILABLE = False

elif CTRANSFORMERS_AVAILABLE:
    try:
        model_path = "./models/llama-2-7b-chat.Q4_K_M.gguf"
        if os.path.exists(model_path):
            local_llm = AutoModelForCausalLM.from_pretrained(
                model_path,
                model_type="llama",
                gpu_layers=0,
                threads=2
            )
            print("[NLP] Modelo ctransformers cargado")
        else:
            print("[NLP] Modelo no encontrado")
    except Exception as e:
        print(f"[NLP] Error cargando modelo ctransformers: {e}")
        CTRANSFORMERS_AVAILABLE = False
'''
        
        # Función mejorada de procesamiento para Windows
        improved_processing = '''
def get_local_llm_response(user_message: str, conversation_history: list = []) -> Optional[str]:
    """Obtiene respuesta del modelo local (compatible con Windows)."""
    
    if not local_llm:
        return None
    
    try:
        # Construir contexto de conversación
        if LLAMA_AVAILABLE:
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
            
            # Añadir historial reciente (últimos 2 mensajes para Windows)
            if conversation_history:
                recent_history = conversation_history[-2:]
                for msg in recent_history:
                    role = "user" if msg.get("isUser") else "assistant"
                    messages.append({"role": role, "content": msg["text"]})
            
            # Añadir mensaje actual
            messages.append({"role": "user", "content": user_message})
            
            # Generar respuesta
            response = local_llm.create_chat_completion(
                messages=messages,
                max_tokens=100,  # Reducido para Windows
                temperature=0.7,
                top_p=0.9,
                repeat_penalty=1.1
            )
            
            response_text = response['choices'][0]['message']['content']
            
        elif CTRANSFORMERS_AVAILABLE:
            # Usar ctransformers
            prompt = f"Usuario: {user_message}\\nAsistente:"
            response_text = local_llm(prompt, max_new_tokens=100, temperature=0.7)
        
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
    if not SENTENCE_TRANSFORMERS_AVAILABLE or not embedding_model:
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
    
    # INTENTAR MODELO LOCAL PRIMERO (si está disponible)
    if local_llm:
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
            
            current_code = before + improved_processing + '\n' + process_message_improvement + after
        
        return current_code
    
    def download_windows_compatible_model(self) -> bool:
        """Descarga un modelo compatible con Windows."""
        
        print("\n📥 Descargando modelo compatible con Windows...")
        
        # Crear directorio models si no existe
        models_dir = os.path.join(self.current_dir, "models")
        os.makedirs(models_dir, exist_ok=True)
        
        # Modelo más pequeño y compatible
        model_url = "https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_0.gguf"
        model_filename = "llama-2-7b-chat.Q4_0.gguf"
        model_path = os.path.join(models_dir, model_filename)
        
        if os.path.exists(model_path):
            print(f"✅ Modelo ya descargado: {model_filename}")
            return True
        
        print(f"📥 Descargando {model_filename} (3.8GB)...")
        print("   Esto puede tomar varios minutos...")
        
        try:
            import requests
            from tqdm import tqdm
            
            response = requests.get(model_url, stream=True)
            total_size = int(response.headers.get('content-length', 0))
            
            with open(model_path, 'wb') as f, tqdm(
                desc=model_filename,
                total=total_size,
                unit='iB',
                unit_scale=True,
                unit_divisor=1024,
            ) as pbar:
                for data in response.iter_content(chunk_size=1024):
                    size = f.write(data)
                    pbar.update(size)
            
            print(f"✅ Modelo descargado correctamente")
            return True
            
        except Exception as e:
            print(f"❌ Error descargando modelo: {e}")
            print("   Puedes descargarlo manualmente desde:")
            print(f"   {model_url}")
            return False
    
    def create_windows_config(self) -> bool:
        """Crea configuración específica para Windows."""
        
        config = {
            "windows_settings": {
                "use_local_llm": True,
                "use_semantic_similarity": True,
                "use_huggingface_fallback": True,
                "model_path": "./models/llama-2-7b-chat.Q4_0.gguf",
                "max_tokens": 100,
                "temperature": 0.7,
                "similarity_threshold": 0.6
            },
            "performance": {
                "n_threads": 2,
                "n_gpu_layers": 0,
                "context_length": 1024,
                "memory_optimization": True
            },
            "fallback_order": [
                "local_llm",
                "semantic_similarity", 
                "huggingface",
                "knowledge_base"
            ],
            "windows_compatibility": {
                "avoid_compilation": True,
                "use_precompiled_binaries": True,
                "reduced_memory_usage": True
            }
        }
        
        config_file = os.path.join(self.current_dir, "windows_nlp_config.json")
        
        try:
            import json
            with open(config_file, 'w', encoding='utf-8') as f:
                json.dump(config, f, indent=2, ensure_ascii=False)
            
            print(f"✅ Configuración Windows guardada en: {config_file}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando configuración: {e}")
            return False
    
    def run_windows_installation(self) -> bool:
        """Ejecuta la instalación completa para Windows."""
        
        print("🪟 INSTALADOR NLP PARA WINDOWS")
        print("=" * 40)
        
        # 1. Verificar requisitos de Windows
        print("📋 Verificando requisitos de Windows...")
        requirements = self.check_windows_requirements()
        
        for req, status in requirements.items():
            status_icon = "✅" if status else "❌"
            print(f"   {status_icon} {req}: {'OK' if status else 'FALLA'}")
        
        if not requirements["python_version"]:
            print("❌ Python 3.8+ requerido")
            return False
        
        # 2. Instalar dependencias compatibles
        if not self.install_windows_compatible_dependencies():
            print("❌ Error instalando dependencias básicas")
            return False
        
        # 3. Intentar instalar alternativas a llama-cpp-python
        self.install_alternative_llama()
        
        # 4. Descargar modelo (opcional)
        print("\n📥 ¿Descargar modelo local? (3.8GB)")
        download_choice = input("   (s/n): ").strip().lower()
        if download_choice in ['s', 'si', 'sí', 'y', 'yes']:
            self.download_windows_compatible_model()
        
        # 5. Crear chatbot compatible
        if not self.create_windows_compatible_chatbot():
            return False
        
        # 6. Crear configuración
        if not self.create_windows_config():
            return False
        
        print("\n🎉 ¡INSTALACIÓN WINDOWS COMPLETADA!")
        print("=" * 40)
        print("📁 Archivo compatible: main_windows_compatible.py")
        print("⚙️  Configuración: windows_nlp_config.json")
        print("🤖 Modelo: models/llama-2-7b-chat.Q4_0.gguf (si se descargó)")
        
        print("\n🚀 Para usar el chatbot compatible con Windows:")
        print("   python main_windows_compatible.py")
        
        print("\n💡 Características habilitadas:")
        print("   ✅ sentence-transformers (similitud semántica)")
        print("   ✅ Servicios en la nube (OpenAI, Cohere, etc.)")
        print("   ✅ Modelos locales (si se instalaron)")
        print("   ✅ Optimizaciones para Windows")
        
        return True

def main():
    """Función principal del instalador Windows."""
    
    print("🪟 INSTALADOR NLP PARA WINDOWS")
    print("=" * 30)
    
    installer = WindowsNLPInstaller()
    success = installer.run_windows_installation()
    
    if success:
        print("\n✅ ¡Instalación completada exitosamente!")
        print("   El chatbot ahora es compatible con Windows")
    else:
        print("\n❌ Error durante la instalación")
        print("   Revisa los mensajes anteriores")

if __name__ == "__main__":
    main() 