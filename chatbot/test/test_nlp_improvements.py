#!/usr/bin/env python3
"""
🧪 Script de Pruebas para Mejoras NLP
=====================================

Este script prueba las diferentes mejoras NLP implementadas
para validar su funcionamiento y rendimiento.
"""

import os
import sys
import time
import json
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime

class NLPTestSuite:
    def __init__(self):
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "tests": {},
            "summary": {}
        }
        
    def test_local_llm(self) -> Dict[str, Any]:
        """Prueba el modelo Llama local."""
        print("🔍 Probando modelo Llama local...")
        
        test_result = {
            "status": "failed",
            "response_time": 0,
            "response": "",
            "error": ""
        }
        
        try:
            # Intentar importar llama-cpp-python
            try:
                from llama_cpp import Llama  # type: ignore
            except ImportError:
                # Intentar alternativa ctransformers
                try:
                    from ctransformers import AutoModelForCausalLM  # type: ignore
                    print("[Test] Usando ctransformers como alternativa")
                    test_result["error"] = "llama-cpp-python no disponible, pero ctransformers está disponible"
                    return test_result
                except ImportError:
                    test_result["error"] = "No hay modelos locales disponibles"
                    return test_result
            
            # Verificar si existe el modelo
            model_path = "./models/llama-2-7b-chat.Q4_K_M.gguf"
            if not os.path.exists(model_path):
                test_result["error"] = f"Modelo no encontrado: {model_path}"
                return test_result
            
            # Cargar modelo
            start_time = time.time()
            llm = Llama(
                model_path=model_path,
                n_ctx=1024,
                n_threads=4,
                n_gpu_layers=0
            )
            load_time = time.time() - start_time
            
            # Probar respuesta
            test_prompt = "¿Cómo puedo agendar una cita legal?"
            
            start_time = time.time()
            response = llm.create_chat_completion([
                {"role": "system", "content": "Eres un asistente legal profesional."},
                {"role": "user", "content": test_prompt}
            ], max_tokens=100, temperature=0.7)
            
            response_time = time.time() - start_time
            response_text = response['choices'][0]['message']['content']
            
            test_result.update({
                "status": "success",
                "load_time": load_time,
                "response_time": response_time,
                "response": response_text,
                "model_size_mb": os.path.getsize(model_path) / (1024 * 1024)
            })
            
            print(f"✅ Modelo local funcionando - Tiempo: {response_time:.2f}s")
            
        except ImportError:
            test_result["error"] = "llama-cpp-python no instalado"
            print("❌ llama-cpp-python no instalado")
        except Exception as e:
            test_result["error"] = str(e)
            print(f"❌ Error en modelo local: {e}")
        
        return test_result
    
    def test_semantic_similarity(self) -> Dict[str, Any]:
        """Prueba la similitud semántica."""
        print("🔍 Probando similitud semántica...")
        
        test_result = {
            "status": "failed",
            "response_time": 0,
            "similarity_score": 0,
            "error": ""
        }
        
        try:
            # Intentar importar sentence-transformers
            try:
                from sentence_transformers import SentenceTransformer, util  # type: ignore
            except ImportError:
                test_result["error"] = "sentence-transformers no instalado"
                print("❌ sentence-transformers no instalado")
                return test_result
            
            # Cargar modelo
            start_time = time.time()
            model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
            load_time = time.time() - start_time
            
            # Probar similitud
            query = "¿Cómo agendo una cita?"
            responses = [
                "Para agendar una cita, necesito algunos datos...",
                "Las citas se programan de lunes a viernes...",
                "Nuestro horario es de 9:00 a 18:00...",
                "Puedo ayudarte a programar una cita..."
            ]
            
            start_time = time.time()
            query_embedding = model.encode(query)
            response_embeddings = model.encode(responses)
            
            cosine_scores = util.pytorch_cos_sim(query_embedding, response_embeddings)
            best_score = cosine_scores.max().item()
            best_response = responses[cosine_scores.argmax().item()]
            
            response_time = time.time() - start_time
            
            test_result.update({
                "status": "success",
                "load_time": load_time,
                "response_time": response_time,
                "similarity_score": best_score,
                "best_response": best_response,
                "model_name": "paraphrase-multilingual-MiniLM-L12-v2"
            })
            
            print(f"✅ Similitud semántica funcionando - Score: {best_score:.3f}")
            
        except ImportError:
            test_result["error"] = "sentence-transformers no instalado"
            print("❌ sentence-transformers no instalado")
        except Exception as e:
            test_result["error"] = str(e)
            print(f"❌ Error en similitud semántica: {e}")
        
        return test_result
    
    def test_cloud_services(self) -> Dict[str, Any]:
        """Prueba servicios en la nube."""
        print("🔍 Probando servicios en la nube...")
        
        test_result = {
            "status": "failed",
            "services": {},
            "error": ""
        }
        
        # Probar OpenAI
        if os.getenv("OPENAI_API_KEY"):
            try:
                import openai  # type: ignore
                client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
                
                start_time = time.time()
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "user", "content": "¿Cómo puedo agendar una cita?"}
                    ],
                    max_tokens=50
                )
                response_time = time.time() - start_time
                
                test_result["services"]["openai"] = {
                    "status": "success",
                    "response_time": response_time,
                    "response": response.choices[0].message.content
                }
                print(f"✅ OpenAI funcionando - Tiempo: {response_time:.2f}s")
                
            except Exception as e:
                test_result["services"]["openai"] = {
                    "status": "failed",
                    "error": str(e)
                }
                print(f"❌ Error en OpenAI: {e}")
        else:
            test_result["services"]["openai"] = {
                "status": "skipped",
                "error": "API key no configurada"
            }
            print("⚠️  OpenAI saltado - API key no configurada")
        
        # Probar Cohere
        if os.getenv("COHERE_API_KEY"):
            try:
                import cohere  # type: ignore
                co = cohere.Client(os.getenv("COHERE_API_KEY"))
                
                start_time = time.time()
                response = co.generate(
                    model="command",
                    prompt="¿Cómo puedo agendar una cita?",
                    max_tokens=50
                )
                response_time = time.time() - start_time
                
                test_result["services"]["cohere"] = {
                    "status": "success",
                    "response_time": response_time,
                    "response": response.generations[0].text
                }
                print(f"✅ Cohere funcionando - Tiempo: {response_time:.2f}s")
                
            except Exception as e:
                test_result["services"]["cohere"] = {
                    "status": "failed",
                    "error": str(e)
                }
                print(f"❌ Error en Cohere: {e}")
        else:
            test_result["services"]["cohere"] = {
                "status": "skipped",
                "error": "API key no configurada"
            }
            print("⚠️  Cohere saltado - API key no configurada")
        
        # Determinar estado general
        successful_services = [s for s in test_result["services"].values() if s["status"] == "success"]
        if successful_services:
            test_result["status"] = "success"
        elif any(s["status"] == "skipped" for s in test_result["services"].values()):
            test_result["status"] = "partial"
        else:
            test_result["status"] = "failed"
        
        return test_result
    
    def test_spacy_improvements(self) -> Dict[str, Any]:
        """Prueba mejoras de spaCy."""
        print("🔍 Probando mejoras de spaCy...")
        
        test_result = {
            "status": "failed",
            "response_time": 0,
            "entities": [],
            "error": ""
        }
        
        try:
            import spacy
            
            # Probar modelo básico
            start_time = time.time()
            nlp = spacy.load("es_core_news_sm")
            load_time = time.time() - start_time
            
            # Probar procesamiento
            test_text = "Necesito agendar una cita para consulta sobre divorcio con el abogado García"
            
            start_time = time.time()
            doc = nlp(test_text)
            response_time = time.time() - start_time
            
            entities = [(ent.text, ent.label_) for ent in doc.ents]
            
            test_result.update({
                "status": "success",
                "load_time": load_time,
                "response_time": response_time,
                "entities": entities,
                "model": "es_core_news_sm"
            })
            
            print(f"✅ spaCy funcionando - Entidades: {len(entities)}")
            
        except Exception as e:
            test_result["error"] = str(e)
            print(f"❌ Error en spaCy: {e}")
        
        return test_result
    
    def test_chatbot_integration(self) -> Dict[str, Any]:
        """Prueba la integración con el chatbot."""
        print("🔍 Probando integración con chatbot...")
        
        test_result = {
            "status": "failed",
            "response_time": 0,
            "response": "",
            "error": ""
        }
        
        try:
            # Intentar conectar al chatbot
            chatbot_url = "http://localhost:8000"
            
            start_time = time.time()
            response = requests.post(
                f"{chatbot_url}/chat",
                json={
                    "text": "¿Cómo puedo agendar una cita?",
                    "language": "es",
                    "user_id": "test_user"
                },
                timeout=10
            )
            response_time = time.time() - start_time
            
            if response.status_code == 200:
                data = response.json()
                test_result.update({
                    "status": "success",
                    "response_time": response_time,
                    "response": data.get("response", ""),
                    "status_code": response.status_code
                })
                print(f"✅ Chatbot respondiendo - Tiempo: {response_time:.2f}s")
            else:
                test_result.update({
                    "status": "failed",
                    "error": f"Status code: {response.status_code}",
                    "response_time": response_time
                })
                print(f"❌ Chatbot error - Status: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            test_result["error"] = "Chatbot no está ejecutándose"
            print("❌ Chatbot no está ejecutándose")
        except Exception as e:
            test_result["error"] = str(e)
            print(f"❌ Error conectando al chatbot: {e}")
        
        return test_result
    
    def run_all_tests(self) -> Dict[str, Any]:
        """Ejecuta todas las pruebas."""
        print("🚀 INICIANDO SUITE DE PRUEBAS NLP")
        print("=" * 50)
        
        # Ejecutar pruebas
        self.results["tests"]["local_llm"] = self.test_local_llm()
        self.results["tests"]["semantic_similarity"] = self.test_semantic_similarity()
        self.results["tests"]["cloud_services"] = self.test_cloud_services()
        self.results["tests"]["spacy_improvements"] = self.test_spacy_improvements()
        self.results["tests"]["chatbot_integration"] = self.test_chatbot_integration()
        
        # Generar resumen
        self.results["summary"] = self._generate_summary()
        
        return self.results
    
    def _generate_summary(self) -> Dict[str, Any]:
        """Genera un resumen de los resultados."""
        summary = {
            "total_tests": len(self.results["tests"]),
            "passed": 0,
            "failed": 0,
            "skipped": 0,
            "average_response_time": 0,
            "recommendations": []
        }
        
        response_times = []
        
        for test_name, test_result in self.results["tests"].items():
            if test_result["status"] == "success":
                summary["passed"] += 1
                if "response_time" in test_result:
                    response_times.append(test_result["response_time"])
            elif test_result["status"] == "failed":
                summary["failed"] += 1
            elif test_result["status"] == "partial":
                summary["skipped"] += 1
        
        if response_times:
            summary["average_response_time"] = sum(response_times) / len(response_times)
        
        # Generar recomendaciones
        if summary["failed"] > 0:
            summary["recommendations"].append("Revisar errores en las pruebas fallidas")
        
        if summary["average_response_time"] > 5:
            summary["recommendations"].append("Optimizar tiempos de respuesta")
        
        if self.results["tests"]["local_llm"]["status"] == "success":
            summary["recommendations"].append("Modelo local funcionando correctamente")
        
        if self.results["tests"]["semantic_similarity"]["status"] == "success":
            summary["recommendations"].append("Similitud semántica disponible")
        
        return summary
    
    def save_results(self, filename: str = "nlp_test_results.json"):
        """Guarda los resultados en un archivo JSON."""
        filepath = os.path.join(self.current_dir, filename)
        
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(self.results, f, indent=2, ensure_ascii=False)
            
            print(f"📄 Resultados guardados en: {filepath}")
            return True
            
        except Exception as e:
            print(f"❌ Error guardando resultados: {e}")
            return False
    
    def print_summary(self):
        """Imprime un resumen de los resultados."""
        print("\n" + "=" * 50)
        print("📊 RESUMEN DE PRUEBAS NLP")
        print("=" * 50)
        
        summary = self.results["summary"]
        
        print(f"✅ Pruebas exitosas: {summary['passed']}")
        print(f"❌ Pruebas fallidas: {summary['failed']}")
        print(f"⚠️  Pruebas saltadas: {summary['skipped']}")
        print(f"⏱️  Tiempo promedio: {summary['average_response_time']:.2f}s")
        
        if summary["recommendations"]:
            print("\n💡 Recomendaciones:")
            for rec in summary["recommendations"]:
                print(f"   • {rec}")
        
        print("\n🔍 Detalles por prueba:")
        for test_name, test_result in self.results["tests"].items():
            status_icon = "✅" if test_result["status"] == "success" else "❌" if test_result["status"] == "failed" else "⚠️"
            print(f"   {status_icon} {test_name}: {test_result['status']}")
            
            if "response_time" in test_result and test_result["response_time"] > 0:
                print(f"      ⏱️  Tiempo: {test_result['response_time']:.2f}s")
            
            if "error" in test_result and test_result["error"]:
                print(f"      ❌ Error: {test_result['error']}")

def main():
    """Función principal del script de pruebas."""
    
    print("🧪 SCRIPT DE PRUEBAS NLP")
    print("=" * 30)
    
    # Crear suite de pruebas
    test_suite = NLPTestSuite()
    
    # Ejecutar todas las pruebas
    results = test_suite.run_all_tests()
    
    # Mostrar resumen
    test_suite.print_summary()
    
    # Guardar resultados
    test_suite.save_results()
    
    # Determinar éxito general
    summary = results["summary"]
    if summary["failed"] == 0 and summary["passed"] > 0:
        print("\n🎉 ¡Todas las pruebas exitosas!")
        return 0
    elif summary["passed"] > 0:
        print("\n⚠️  Algunas pruebas fallaron, pero hay funcionalidad disponible")
        return 1
    else:
        print("\n❌ Todas las pruebas fallaron")
        return 2

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 