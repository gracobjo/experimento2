#!/usr/bin/env python3
"""
Script para probar el chatbot manualmente
"""

import requests
import json

def send_message(text, user_id="test_user"):
    """Envía un mensaje al chatbot"""
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json={
                "text": text,
                "language": "es",
                "user_id": user_id
            },
            timeout=10
        )
        
        if response.status_code == 200:
            return response.json()["response"]
        else:
            return f"Error {response.status_code}: {response.text}"
            
    except Exception as e:
        return f"Error de conexión: {e}"

def main():
    """Función principal"""
    print("🤖 PRUEBA MANUAL DEL CHATBOT")
    print("=" * 40)
    print("Este script te permite probar el chatbot paso a paso")
    print("Escribe 'salir' para terminar")
    print("Escribe 'reset' para reiniciar la conversación")
    print("=" * 40)
    
    user_id = "manual_test_user"
    
    while True:
        # Obtener mensaje del usuario
        user_message = input("\n👤 Tú: ").strip()
        
        if user_message.lower() == 'salir':
            print("👋 ¡Hasta luego!")
            break
        elif user_message.lower() == 'reset':
            user_id = f"manual_test_user_{int(time.time())}"
            print("🔄 Conversación reiniciada")
            continue
        elif not user_message:
            continue
        
        # Enviar mensaje al chatbot
        print("⏳ Enviando mensaje...")
        bot_response = send_message(user_message, user_id)
        
        # Mostrar respuesta
        print(f"🤖 Chatbot: {bot_response}")

if __name__ == "__main__":
    import time
    main() 