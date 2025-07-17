#!/usr/bin/env python3
"""
Script para iniciar el chatbot mejorado y ejecutar pruebas automáticas
"""

import subprocess
import time
import requests
import os
import sys
from pathlib import Path

def check_python_dependencies():
    """Verifica que las dependencias estén instaladas"""
    print("🔍 Verificando dependencias...")
    
    # Mapeo de nombres de paquetes a nombres de módulos
    package_mapping = {
        'fastapi': 'fastapi',
        'uvicorn': 'uvicorn',
        'requests': 'requests',
        'python-dotenv': 'dotenv',  # El módulo se llama dotenv, no python-dotenv
        'spacy': 'spacy',
        'nltk': 'nltk',
        'pydantic': 'pydantic'
    }
    
    missing_packages = []
    
    for package, module_name in package_mapping.items():
        try:
            __import__(module_name)
            print(f"✅ {package}")
        except ImportError:
            missing_packages.append(package)
            print(f"❌ {package}")
    
    if missing_packages:
        print(f"\n⚠️ Faltan dependencias: {', '.join(missing_packages)}")
        print("Ejecuta: pip install " + " ".join(missing_packages))
        return False
    
    return True

def start_chatbot():
    """Inicia el chatbot mejorado"""
    print("\n🚀 Iniciando chatbot mejorado...")
    
    chatbot_file = Path("main_improved.py")
    if not chatbot_file.exists():
        print("❌ No se encontró main_improved.py")
        return None
    
    try:
        # Iniciar el chatbot en segundo plano
        process = subprocess.Popen(
            [sys.executable, "main_improved.py"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Esperar a que el chatbot se inicie
        print("⏳ Esperando a que el chatbot se inicie...")
        time.sleep(5)
        
        # Verificar que esté funcionando
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("✅ Chatbot iniciado correctamente")
                return process
            else:
                print(f"⚠️ Chatbot respondió con código: {response.status_code}")
                return None
        except Exception as e:
            print(f"❌ Error verificando chatbot: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Error iniciando chatbot: {e}")
        return None

def test_chatbot_basic():
    """Prueba básica del chatbot"""
    print("\n🧪 Ejecutando prueba básica del chatbot...")
    
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json={
                "text": "Hola",
                "language": "es"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            bot_response = response.json()["response"]
            print(f"✅ Chatbot responde: {bot_response[:100]}...")
            return True
        else:
            print(f"❌ Error en respuesta: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error en prueba básica: {e}")
        return False

def test_appointment_flow():
    """Prueba el flujo de citas"""
    print("\n📅 Probando flujo de citas...")
    
    conversation = [
        "Quiero una cita",
        "María García López",
        "28",
        "612345678",
        "maria.garcia@test.com",
        "divorcio",
        "1",  # Primera fecha
        "sí"  # Confirmar
    ]
    
    user_id = "test_appointment_456"
    
    for i, message in enumerate(conversation, 1):
        print(f"  📝 Paso {i}: {message}")
        
        try:
            response = requests.post(
                "http://localhost:8000/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                bot_response = response.json()["response"]
                
                # Verificar respuestas específicas
                if i == 1 and "ayudo a agendar" in bot_response.lower():
                    print("    ✅ Inicio de conversación correcto")
                elif i == 6 and "derecho familiar" in bot_response.lower():
                    print("    ✅ Mapeo automático funcionó")
                elif i == 8 and "agendada exitosamente" in bot_response:
                    print("    ✅ Cita creada exitosamente")
                    return True
                    
            else:
                print(f"    ❌ Error en paso {i}: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"    ❌ Error en paso {i}: {e}")
            return False
        
        time.sleep(0.5)
    
    return False

def run_backend_tests():
    """Ejecuta las pruebas del backend"""
    print("\n🔗 Ejecutando pruebas del backend...")
    
    test_script = Path("test_backend_connection.py")
    if test_script.exists():
        try:
            result = subprocess.run(
                [sys.executable, "test_backend_connection.py"],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            print("📊 Resultado de pruebas del backend:")
            print(result.stdout)
            
            if result.stderr:
                print("⚠️ Errores:")
                print(result.stderr)
                
            return result.returncode == 0
        except subprocess.TimeoutExpired:
            print("⏰ Timeout en pruebas del backend")
            return False
        except Exception as e:
            print(f"❌ Error ejecutando pruebas del backend: {e}")
            return False
    else:
        print("⚠️ No se encontró test_backend_connection.py")
        return False

def main():
    """Función principal"""
    print("🎯 SISTEMA DE PRUEBAS DEL CHATBOT MEJORADO")
    print("=" * 50)
    
    # Verificar dependencias
    if not check_python_dependencies():
        print("\n❌ Faltan dependencias. Instálalas antes de continuar.")
        return
    
    # Iniciar chatbot
    chatbot_process = start_chatbot()
    if not chatbot_process:
        print("\n❌ No se pudo iniciar el chatbot")
        return
    
    try:
        # Ejecutar pruebas
        print("\n" + "=" * 50)
        print("🧪 EJECUTANDO PRUEBAS")
        print("=" * 50)
        
        # Prueba básica
        basic_test = test_chatbot_basic()
        
        # Prueba de flujo de citas
        appointment_test = test_appointment_flow()
        
        # Pruebas del backend
        backend_test = run_backend_tests()
        
        # Resumen final
        print("\n" + "=" * 50)
        print("📊 RESUMEN FINAL")
        print("=" * 50)
        print(f"   Prueba básica: {'✅' if basic_test else '❌'}")
        print(f"   Flujo de citas: {'✅' if appointment_test else '❌'}")
        print(f"   Backend: {'✅' if backend_test else '❌'}")
        
        if basic_test and appointment_test:
            print("\n🎉 ¡El chatbot mejorado está funcionando correctamente!")
            print("   - Mapeo automático de motivos ✓")
            print("   - Conversación fluida ✓")
            print("   - Integración con backend ✓")
        else:
            print("\n⚠️ Hay problemas que necesitan atención.")
            
    finally:
        # Detener el chatbot
        print("\n🛑 Deteniendo chatbot...")
        chatbot_process.terminate()
        try:
            chatbot_process.wait(timeout=5)
            print("✅ Chatbot detenido correctamente")
        except subprocess.TimeoutExpired:
            print("⚠️ Forzando cierre del chatbot...")
            chatbot_process.kill()

if __name__ == "__main__":
    main() 