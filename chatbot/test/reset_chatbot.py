#!/usr/bin/env python3
"""
Script para resetear el estado del chatbot
"""

import requests
import json

def reset_chatbot_state():
    """Resetea el estado del chatbot enviando un mensaje de reset"""
    print("🔄 Reseteando estado del chatbot...")
    
    # Enviar mensaje de reset
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json={
                "text": "reset",
                "language": "es",
                "user_id": "reset_user"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            bot_response = response.json()["response"]
            print(f"✅ Reset completado: {bot_response}")
            return True
        else:
            print(f"❌ Error en reset: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        return False

def test_fresh_conversation():
    """Prueba una conversación fresca después del reset"""
    print("\n🧪 Probando conversación fresca...")
    
    conversation = [
        "Hola, quiero una cita",
        "Test User",
        "25",
        "612345678",
        "test@example.com",
        "divorcio"
    ]
    
    user_id = "fresh_test_user"
    
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
                print(f"    🤖 {bot_response[:100]}...")
                
                # Verificar que no esté en estado de confirmación
                if "confirma" in bot_response.lower() and i < len(conversation):
                    print("    ⚠️ Chatbot en estado de confirmación inesperado")
                    return False
                    
            else:
                print(f"    ❌ Error: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
            return False
    
    return True

def main():
    """Función principal"""
    print("🔄 RESET DEL CHATBOT")
    print("=" * 40)
    
    # Resetear estado
    if reset_chatbot_state():
        print("\n✅ Estado reseteado correctamente")
        
        # Probar conversación fresca
        if test_fresh_conversation():
            print("\n🎉 ¡El chatbot está funcionando correctamente!")
        else:
            print("\n⚠️ Hay problemas con la conversación")
    else:
        print("\n❌ No se pudo resetear el estado")

if __name__ == "__main__":
    main() 