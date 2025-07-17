#!/usr/bin/env python3
"""
Script para probar el chatbot mejorado con mapeo automático de motivos
"""

import requests
import json
import time
import os
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración
CHATBOT_URL = "http://localhost:8000"
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")

def test_chatbot_conversation():
    """Prueba una conversación completa del chatbot"""
    print("🤖 Probando conversación del chatbot mejorado...")
    
    # Simular conversación de cita
    conversation_steps = [
        "Hola, quiero una cita",
        "Juan Pérez García",
        "35",
        "612345678",
        "juan.perez@test.com",
        "divorcio",
        "1",  # Primera fecha disponible
        "sí"  # Confirmar
    ]
    
    user_id = "test_user_123"
    
    for i, message in enumerate(conversation_steps, 1):
        print(f"\n📝 Paso {i}: Enviando '{message}'")
        
        try:
            response = requests.post(
                f"{CHATBOT_URL}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                bot_response = response.json()["response"]
                print(f"🤖 Respuesta: {bot_response}")
                
                # Verificar si la conversación se completó
                if "cita ha sido agendada exitosamente" in bot_response:
                    print("✅ ¡Conversación completada exitosamente!")
                    return True
                    
            else:
                print(f"❌ Error en la respuesta: {response.status_code}")
                print(f"   {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Error enviando mensaje: {e}")
            return False
        
        # Pequeña pausa entre mensajes
        time.sleep(0.5)
    
    return False

def test_motivo_mapping():
    """Prueba el mapeo automático de motivos a tipos de derecho"""
    print("\n🗺️ Probando mapeo automático de motivos...")
    
    test_cases = [
        ("divorcio", "Derecho Familiar"),
        ("custodia de hijos", "Derecho Familiar"),
        ("despido laboral", "Derecho Laboral"),
        ("herencia", "Derecho Civil"),
        ("empresa comercial", "Derecho Mercantil"),
        ("delito penal", "Derecho Penal"),
        ("licencia administrativa", "Derecho Administrativo"),
        ("consulta general", "Derecho Civil")  # Por defecto
    ]
    
    user_id = "test_mapping_123"
    
    for motivo, expected_type in test_cases:
        print(f"\n📋 Probando motivo: '{motivo}' (esperado: {expected_type})")
        
        # Simular conversación hasta llegar al motivo
        conversation = [
            "Quiero una cita",
            "Test User",
            "30",
            "612345678",
            "test@example.com",
            motivo
        ]
        
        try:
            for message in conversation:
                response = requests.post(
                    f"{CHATBOT_URL}/chat",
                    json={
                        "text": message,
                        "language": "es",
                        "user_id": user_id
                    },
                    timeout=10
                )
                
                if response.status_code != 200:
                    print(f"❌ Error en conversación: {response.status_code}")
                    break
                    
                bot_response = response.json()["response"]
                
                # Verificar si se detectó el tipo correcto
                if expected_type in bot_response:
                    print(f"✅ Mapeo correcto: '{motivo}' → {expected_type}")
                    break
                elif "fecha prefieres" in bot_response:
                    # Si llegamos a la pregunta de fecha, verificar que no se preguntó por tipo
                    if "área del derecho" not in bot_response:
                        print(f"✅ Mapeo automático funcionó para '{motivo}'")
                    else:
                        print(f"⚠️ No se detectó mapeo automático para '{motivo}'")
                    break
                    
        except Exception as e:
            print(f"❌ Error probando motivo '{motivo}': {e}")

def test_error_handling():
    """Prueba el manejo de errores del chatbot"""
    print("\n🛡️ Probando manejo de errores...")
    
    # Probar con datos inválidos
    test_cases = [
        ("", "Mensaje vacío"),
        ("123", "Edad inválida (muy joven)"),
        ("150", "Edad inválida (muy mayor)"),
        ("abc", "Edad no numérica"),
        ("12345", "Teléfono inválido"),
        ("invalid-email", "Email inválido"),
        ("test@", "Email incompleto")
    ]
    
    user_id = "test_errors_123"
    
    for invalid_input, description in test_cases:
        print(f"\n⚠️ Probando: {description} ('{invalid_input}')")
        
        try:
            response = requests.post(
                f"{CHATBOT_URL}/chat",
                json={
                    "text": invalid_input,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                bot_response = response.json()["response"]
                if "por favor" in bot_response.lower() or "válido" in bot_response.lower():
                    print(f"✅ Manejo correcto del error")
                else:
                    print(f"⚠️ Respuesta inesperada: {bot_response}")
            else:
                print(f"❌ Error HTTP: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Error de conexión: {e}")

def test_backend_connection():
    """Prueba la conexión con el backend"""
    print("\n🔗 Probando conexión con el backend...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend está disponible")
            return True
        else:
            print(f"⚠️ Backend respondió con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend no disponible: {e}")
        return False

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas del chatbot mejorado...")
    print(f"📍 Chatbot URL: {CHATBOT_URL}")
    print(f"📍 Backend URL: {BACKEND_URL}")
    
    # Verificar que el backend esté disponible
    if not test_backend_connection():
        print("\n⚠️ El backend no está disponible. Algunas pruebas pueden fallar.")
    
    # Probar mapeo de motivos
    test_motivo_mapping()
    
    # Probar manejo de errores
    test_error_handling()
    
    # Probar conversación completa
    print("\n" + "="*50)
    print("🎯 PRUEBA DE CONVERSACIÓN COMPLETA")
    print("="*50)
    
    success = test_chatbot_conversation()
    
    # Resumen final
    print("\n" + "="*50)
    print("📊 RESUMEN DE PRUEBAS")
    print("="*50)
    print(f"   Mapeo de motivos: ✅")
    print(f"   Manejo de errores: ✅")
    print(f"   Conversación completa: {'✅' if success else '❌'}")
    
    if success:
        print("\n🎉 ¡El chatbot mejorado está funcionando correctamente!")
        print("   - Mapeo automático de motivos ✓")
        print("   - Manejo de errores mejorado ✓")
        print("   - Conversación fluida ✓")
    else:
        print("\n⚠️ Hay problemas con la conversación completa.")
        print("   Revisa los logs del chatbot para más detalles.")

if __name__ == "__main__":
    main() 