#!/usr/bin/env python3
"""
Script para verificar qué versión del chatbot está ejecutándose
"""

import requests
import json

def check_chatbot_version():
    """Verifica qué versión del chatbot está ejecutándose"""
    
    chatbot_url = "http://localhost:8000"
    
    print("🔍 VERIFICACIÓN DE VERSIÓN DEL CHATBOT")
    print("=" * 50)
    
    # Verificar que el chatbot esté funcionando
    try:
        health_response = requests.get(f"{chatbot_url}/health", timeout=5)
        print(f"✅ Chatbot salud: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        print("   El chatbot no está ejecutándose")
        return
    
    # Probar conversación específica para detectar la versión
    test_conversation = [
        ("Hola", "Saludo"),
        ("quiero una cita", "Solicitud directa"),
        ("si", "Respuesta afirmativa")
    ]
    
    print(f"\n🧪 Probando comportamiento específico...")
    print("-" * 50)
    
    user_id = "version_check_123"
    
    for i, (message, description) in enumerate(test_conversation, 1):
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
                
                # Detectar versión basada en el comportamiento
                if i == 3:  # Respuesta a "si"
                    if "nombre completo" in bot_response.lower():
                        print(f"   ✅ VERSIÓN MEJORADA: Inicia flujo de citas correctamente")
                    elif "Para responder adecuadamente" in bot_response:
                        print(f"   ❌ VERSIÓN ANTIGUA: Respuesta genérica repetitiva")
                        print(f"   💡 Necesitas ejecutar: python main_improved_fixed.py")
                    else:
                        print(f"   ❓ VERSIÓN DESCONOCIDA: Comportamiento inesperado")
                
            else:
                print(f"   ❌ Error HTTP: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
    
    print("\n" + "=" * 50)
    print("📋 INSTRUCCIONES")
    print("=" * 50)
    
    print("Si ves 'VERSIÓN ANTIGUA', ejecuta:")
    print("1. Detén el chatbot actual (Ctrl+C)")
    print("2. Ejecuta: python main_improved_fixed.py")
    print("3. Vuelve a probar: python test_improved_conversation.py")
    
    print("\nSi ves 'VERSIÓN MEJORADA', el problema está en la lógica.")
    print("Necesitamos revisar el código de detección de intenciones.")

if __name__ == "__main__":
    check_chatbot_version() 