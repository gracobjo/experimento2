#!/usr/bin/env python3
"""
Script para probar el endpoint /end_chat del chatbot
"""

import requests
import json
import time

def test_end_chat():
    """Prueba el endpoint /end_chat"""
    
    chatbot_url = "http://localhost:8000"
    
    print("=" * 50)
    print("PRUEBA DEL ENDPOINT /end_chat")
    print("=" * 50)
    
    # 1. Verificar que el chatbot esté funcionando
    print("\n1. Verificando estado del chatbot...")
    try:
        health_response = requests.get(f"{chatbot_url}/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Chatbot está funcionando")
        else:
            print(f"❌ Chatbot no responde correctamente: {health_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        return
    
    # 2. Probar endpoint /end_chat
    print("\n2. Probando endpoint /end_chat...")
    
    test_data = {
        "text": "terminar conversación",
        "language": "es",
        "user_id": "test_user_123"
    }
    
    try:
        end_chat_response = requests.post(
            f"{chatbot_url}/end_chat",
            json=test_data,
            timeout=5
        )
        
        print(f"Status Code: {end_chat_response.status_code}")
        print(f"Response: {end_chat_response.text}")
        
        if end_chat_response.status_code == 200:
            print("✅ Endpoint /end_chat funciona correctamente")
            response_data = end_chat_response.json()
            print(f"   Status: {response_data.get('status')}")
            print(f"   Message: {response_data.get('message')}")
        else:
            print(f"❌ Endpoint /end_chat falló: {end_chat_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error probando /end_chat: {e}")
    
    # 3. Probar flujo completo de conversación y terminación
    print("\n3. Probando flujo completo...")
    
    # Iniciar conversación
    chat_data = {
        "text": "hola",
        "language": "es",
        "user_id": "test_user_456"
    }
    
    try:
        chat_response = requests.post(
            f"{chatbot_url}/chat",
            json=chat_data,
            timeout=5
        )
        
        if chat_response.status_code == 200:
            print("✅ Conversación iniciada correctamente")
            
            # Terminar conversación
            end_data = {
                "text": "terminar",
                "language": "es",
                "user_id": "test_user_456"
            }
            
            end_response = requests.post(
                f"{chatbot_url}/end_chat",
                json=end_data,
                timeout=5
            )
            
            if end_response.status_code == 200:
                print("✅ Conversación terminada correctamente")
            else:
                print(f"❌ Error terminando conversación: {end_response.status_code}")
        else:
            print(f"❌ Error iniciando conversación: {chat_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error en flujo completo: {e}")
    
    print("\n" + "=" * 50)
    print("PRUEBA COMPLETADA")
    print("=" * 50)

if __name__ == "__main__":
    test_end_chat() 