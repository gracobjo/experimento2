#!/usr/bin/env python3
"""
Script para probar la corrección del contexto de conversación
"""

import requests
import json
import time

def test_context_fix():
    """Prueba que el contexto de conversación funcione correctamente"""
    
    chatbot_url = "http://localhost:8000"
    
    print("🧪 PRUEBA DE CORRECCIÓN DE CONTEXTO")
    print("=" * 50)
    
    # Verificar que el chatbot esté funcionando
    try:
        health_response = requests.get(f"{chatbot_url}/health", timeout=5)
        print(f"✅ Chatbot salud: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        print("   Ejecuta: python main_improved_fixed.py")
        return
    
    # Conversación que reproduce el problema original
    conversation = [
        ("Hola", "Saludo inicial"),
        ("quería hablar con un abogado", "Solicitud de contacto"),
        ("laboral", "Menciona área"),
        ("despido", "Menciona motivo"),
        ("si", "Respuesta afirmativa - DEBERÍA iniciar citas"),
        ("si", "Segunda respuesta afirmativa - DEBERÍA iniciar citas"),
        ("si", "Tercera respuesta afirmativa - DEBERÍA iniciar citas")
    ]
    
    print(f"\n💬 Probando corrección de contexto...")
    print("-" * 50)
    
    user_id = "test_context_fix_123"
    
    for i, (message, description) in enumerate(conversation, 1):
        print(f"\n{i}. {description}: '{message}'")
        
        try:
            response = requests.post(
                f"{chatbot_url}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                bot_response = result.get('response', 'Sin respuesta')
                print(f"   🤖 Respuesta: {bot_response[:100]}...")
                
                # Verificar si la corrección funciona
                if i in [5, 6, 7] and "nombre completo" in bot_response.lower():
                    print(f"   ✅ CORRECCIÓN FUNCIONA: Inicia flujo de citas correctamente")
                elif i in [5, 6, 7] and ("Para responder adecuadamente" in bot_response or "Tu pregunta es importante" in bot_response):
                    print(f"   ❌ PROBLEMA PERSISTE: Respuesta genérica repetitiva")
                elif i in [5, 6, 7]:
                    print(f"   ❓ RESPUESTA INESPERADA: {bot_response[:50]}...")
                
            else:
                print(f"   ❌ Error HTTP: {response.status_code}")
                print(f"   📄 Respuesta: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
        
        time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE LA CORRECCIÓN")
    print("=" * 50)
    
    print("✅ Si ves 'CORRECCIÓN FUNCIONA' en los pasos 5, 6, 7:")
    print("   El problema está resuelto completamente")
    
    print("\n❌ Si ves 'PROBLEMA PERSISTE' en los pasos 5, 6, 7:")
    print("   Necesitamos revisar más la lógica de detección")
    
    print("\n💡 La corrección implementada:")
    print("   • Mantiene historial de conversación por usuario")
    print("   • Detecta contexto de citas en respuestas afirmativas")
    print("   • Inicia flujo de citas automáticamente")

if __name__ == "__main__":
    test_context_fix() 