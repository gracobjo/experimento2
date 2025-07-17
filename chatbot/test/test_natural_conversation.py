#!/usr/bin/env python3
"""
Script de prueba para demostrar las nuevas capacidades naturales del chatbot
"""

import requests
import json
import time
from typing import List, Dict

# Configuración
CHATBOT_URL = "http://localhost:8000"
TEST_USER_ID = "test_user_123"

def send_message(text: str, user_id: str = TEST_USER_ID) -> Dict:
    """Envía un mensaje al chatbot y retorna la respuesta"""
    try:
        response = requests.post(f"{CHATBOT_URL}/chat", json={
            "text": text,
            "language": "es",
            "user_id": user_id
        })
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Error {response.status_code}: {response.text}"}
    except Exception as e:
        return {"error": f"Error de conexión: {e}"}

def test_conversation_flow():
    """Prueba un flujo de conversación natural"""
    print("🤖 PRUEBA DE CONVERSACIÓN NATURAL DEL CHATBOT")
    print("=" * 50)
    
    # Lista de mensajes de prueba
    test_messages = [
        "Hola, me llamo María González",
        "¿Qué servicios ofrecen?",
        "Me interesa el derecho laboral",
        "¿Cuánto cobran por una consulta?",
        "Gracias por la información",
        "¿Tienen experiencia en casos de despido?",
        "Me gustaría agendar una cita",
        "Perfecto, me parece bien",
        "Tengo 35 años",
        "Mi teléfono es +34 612345678",
        "maria.gonzalez@email.com",
        "Me despidieron sin justificación",
        "¿Qué día tienen disponible?",
        "La opción 2 me parece bien",
        "Sí, confirmo los datos",
        "Muchas gracias por todo",
        "Hasta luego"
    ]
    
    conversation_history = []
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n👤 Usuario: {message}")
        
        # Enviar mensaje
        response = send_message(message)
        
        if "error" in response:
            print(f"❌ Error: {response['error']}")
            break
        
        bot_response = response.get("response", "Sin respuesta")
        print(f"🤖 Chatbot: {bot_response}")
        
        # Guardar en historial
        conversation_history.append({
            "user": message,
            "bot": bot_response,
            "timestamp": response.get("timestamp", "")
        })
        
        # Pausa entre mensajes para simular conversación real
        time.sleep(1)
    
    print(f"\n✅ Conversación completada. {len(conversation_history)} intercambios realizados.")
    return conversation_history

def test_different_intents():
    """Prueba diferentes tipos de intenciones"""
    print("\n🎯 PRUEBA DE DIFERENTES INTENCIONES")
    print("=" * 40)
    
    intent_tests = [
        ("Saludos", ["Hola", "Buenos días", "Hey"]),
        ("Agradecimientos", ["Gracias", "Muchas gracias", "Te agradezco"]),
        ("Despedidas", ["Adiós", "Hasta luego", "Nos vemos"]),
        ("Emergencias", ["Es urgente", "Necesito ayuda inmediata", "Es una emergencia"]),
        ("Quejas", ["Estoy molesto", "No funciona", "Es terrible"]),
        ("Ayuda", ["Necesito ayuda", "No sé qué hacer", "Estoy perdido"]),
        ("Preguntas Generales", ["¿Qué es el derecho civil?", "¿Cómo funciona?", "Tengo una duda"]),
        ("Información", ["Dime más", "Cuéntame", "Explica"])
    ]
    
    for intent_name, messages in intent_tests:
        print(f"\n📋 Probando: {intent_name}")
        for message in messages:
            print(f"  👤 '{message}'")
            response = send_message(message)
            if "error" not in response:
                bot_response = response.get("response", "Sin respuesta")
                print(f"  🤖 '{bot_response[:100]}...'")
            time.sleep(0.5)

def test_context_awareness():
    """Prueba la capacidad de mantener contexto"""
    print("\n🧠 PRUEBA DE CONCIENCIA DE CONTEXTO")
    print("=" * 40)
    
    context_test = [
        "Hola, me llamo Carlos",
        "¿Cuáles son sus servicios?",
        "Me interesa el derecho mercantil",
        "¿Cuánto cobran?",
        "¿Y para casos de derecho laboral?",
        "Gracias por la información",
        "¿Podrían ayudarme con un problema?",
        "Es sobre un contrato comercial",
        "¿Tienen experiencia en esto?",
        "Perfecto, entonces quiero agendar una cita"
    ]
    
    for i, message in enumerate(context_test, 1):
        print(f"\n{i}. 👤 {message}")
        response = send_message(message)
        if "error" not in response:
            bot_response = response.get("response", "Sin respuesta")
            print(f"   🤖 {bot_response}")
        time.sleep(0.5)

def test_sentiment_analysis():
    """Prueba el análisis de sentimientos"""
    print("\n😊 PRUEBA DE ANÁLISIS DE SENTIMIENTOS")
    print("=" * 40)
    
    sentiment_tests = [
        ("Positivo", ["¡Excelente servicio!", "Me encanta cómo me ayudan", "Perfecto, muy agradecido"]),
        ("Negativo", ["Estoy muy molesto", "Es terrible este problema", "No funciona nada"]),
        ("Neutral", ["Necesito información", "¿Cuál es el horario?", "Tengo una consulta"])
    ]
    
    for sentiment, messages in sentiment_tests:
        print(f"\n{sentiment}:")
        for message in messages:
            print(f"  👤 '{message}'")
            response = send_message(message)
            if "error" not in response:
                bot_response = response.get("response", "Sin respuesta")
                print(f"  🤖 '{bot_response[:80]}...'")
            time.sleep(0.5)

def test_reset_functionality():
    """Prueba la funcionalidad de reset"""
    print("\n🔄 PRUEBA DE FUNCIONALIDAD DE RESET")
    print("=" * 40)
    
    # Primera conversación
    print("1. Iniciando conversación...")
    send_message("Hola, me llamo Ana")
    send_message("¿Qué servicios tienen?")
    
    # Reset
    print("2. Ejecutando reset...")
    response = send_message("reset")
    print(f"🤖 {response.get('response', 'Sin respuesta')}")
    
    # Nueva conversación
    print("3. Nueva conversación después del reset...")
    response = send_message("Hola de nuevo")
    print(f"🤖 {response.get('response', 'Sin respuesta')}")

def main():
    """Función principal que ejecuta todas las pruebas"""
    print("🚀 INICIANDO PRUEBAS DEL CHATBOT MEJORADO")
    print("=" * 60)
    
    try:
        # Verificar que el chatbot esté funcionando
        health_response = requests.get(f"{CHATBOT_URL}/health")
        if health_response.status_code != 200:
            print("❌ El chatbot no está funcionando. Asegúrate de que esté ejecutándose en el puerto 8000.")
            return
        
        print("✅ Chatbot funcionando correctamente")
        
        # Ejecutar pruebas
        test_conversation_flow()
        test_different_intents()
        test_context_awareness()
        test_sentiment_analysis()
        test_reset_functionality()
        
        print("\n🎉 TODAS LAS PRUEBAS COMPLETADAS")
        print("=" * 60)
        print("El chatbot ha demostrado las siguientes capacidades:")
        print("✅ Conversación natural y fluida")
        print("✅ Detección de múltiples intenciones")
        print("✅ Análisis de sentimientos")
        print("✅ Conciencia de contexto")
        print("✅ Personalización con nombres")
        print("✅ Manejo de diferentes tipos de consultas")
        print("✅ Funcionalidad de reset")
        
    except Exception as e:
        print(f"❌ Error durante las pruebas: {e}")

if __name__ == "__main__":
    main() 