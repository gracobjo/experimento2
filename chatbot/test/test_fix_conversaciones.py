#!/usr/bin/env python3
"""
Script de prueba para verificar que el chatbot ya no pida la edad incorrectamente
Prueba conversaciones normales que antes causaban el problema
"""

import requests
import json
import time
from typing import Dict

# Configuración
CHATBOT_URL = "http://localhost:8000"

def send_message(text: str, user_id: str = "test_user") -> Dict:
    """Envía un mensaje al chatbot"""
    try:
        response = requests.post(f"{CHATBOT_URL}/chat", json={
            "text": text,
            "language": "es",
            "user_id": user_id
        })
        if response.status_code == 200:
            return response.json()
        else:
            return {"error": f"Error {response.status_code}"}
    except Exception as e:
        return {"error": f"Error de conexión: {e}"}

def reset_conversation(user_id: str):
    """Resetea la conversación para un usuario específico"""
    try:
        requests.post(f"{CHATBOT_URL}/end_chat", json={"user_id": user_id})
    except:
        pass

def print_conversation(title: str, user_msg: str, bot_response: str):
    """Imprime la conversación con formato"""
    print(f"\n💬 {title}")
    print("-" * 50)
    print(f"👤: {user_msg}")
    print(f"🤖: {bot_response}")
    print("-" * 50)

def test_1_conversacion_normal():
    """Test 1: Conversación normal que no debería activar el flujo de citas"""
    print("\n🧪 TEST 1: CONVERSACIÓN NORMAL")
    print("=" * 60)
    
    user_id = "test_1_normal"
    reset_conversation(user_id)
    
    conversacion = [
        "Hola, me llamo Juan Pérez",
        "¿Cómo están?",
        "Tengo una pregunta sobre sus servicios",
        "¿Qué áreas del derecho practican?",
        "Perfecto, me interesa el derecho civil",
        "¿Cuánto cobran por una consulta?",
        "Excelente, gracias por la información",
        "¿Tienen experiencia en casos de daños?",
        "Genial, me gusta lo que escucho",
        "¿Podrían ayudarme con mi situación?",
        "Es sobre un problema con mi vecino",
        "Gracias por toda la información"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg, user_id)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        
        # Verificar que no pida la edad incorrectamente
        if "edad" in bot_response.lower() and "por favor" in bot_response.lower():
            print("❌ ERROR: El chatbot está pidiendo la edad incorrectamente!")
            return False
        
        time.sleep(1)
    
    print("✅ Test 1 completado sin errores")
    return True

def test_2_palabras_afirmativas():
    """Test 2: Palabras afirmativas que no deberían activar citas"""
    print("\n🧪 TEST 2: PALABRAS AFIRMATIVAS")
    print("=" * 60)
    
    user_id = "test_2_afirmativas"
    reset_conversation(user_id)
    
    conversacion = [
        "Hola",
        "Perfecto",
        "Excelente",
        "Genial",
        "Bueno",
        "Vale",
        "Claro",
        "Sí, entiendo",
        "Gracias"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg, user_id)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        
        # Verificar que no pida la edad incorrectamente
        if "edad" in bot_response.lower() and "por favor" in bot_response.lower():
            print("❌ ERROR: El chatbot está pidiendo la edad incorrectamente!")
            return False
        
        time.sleep(1)
    
    print("✅ Test 2 completado sin errores")
    return True

def test_3_consulta_general():
    """Test 3: Consulta general que no debería activar citas"""
    print("\n🧪 TEST 3: CONSULTA GENERAL")
    print("=" * 60)
    
    user_id = "test_3_general"
    reset_conversation(user_id)
    
    conversacion = [
        "Buenos días",
        "¿Qué servicios ofrecen?",
        "¿En qué se especializan?",
        "¿Cuántos años de experiencia tienen?",
        "¿Cómo funciona la primera consulta?",
        "¿Cuál es su horario de atención?",
        "¿Dónde están ubicados?",
        "Perfecto, gracias por la información",
        "Hasta luego"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg, user_id)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        
        # Verificar que no pida la edad incorrectamente
        if "edad" in bot_response.lower() and "por favor" in bot_response.lower():
            print("❌ ERROR: El chatbot está pidiendo la edad incorrectamente!")
            return False
        
        time.sleep(1)
    
    print("✅ Test 3 completado sin errores")
    return True

def test_4_cita_explicita():
    """Test 4: Solicitud explícita de cita (debería funcionar correctamente)"""
    print("\n🧪 TEST 4: CITA EXPLÍCITA")
    print("=" * 60)
    
    user_id = "test_4_cita"
    reset_conversation(user_id)
    
    conversacion = [
        "Hola",
        "Quiero agendar una cita",
        "Me llamo María García",
        "Tengo 35 años",
        "+34 612345678",
        "maria.garcia@email.com",
        "Es sobre un problema laboral",
        "La opción 1",
        "Sí, confirmo"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg, user_id)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        
        # En este caso SÍ debería pedir la edad
        if i == 3 and "edad" not in bot_response.lower():
            print("❌ ERROR: El chatbot debería estar pidiendo la edad en este punto!")
            return False
        
        time.sleep(1)
    
    print("✅ Test 4 completado correctamente")
    return True

def test_5_reset_conversacion():
    """Test 5: Reset de conversación"""
    print("\n🧪 TEST 5: RESET DE CONVERSACIÓN")
    print("=" * 60)
    
    user_id = "test_5_reset"
    reset_conversation(user_id)
    
    conversacion = [
        "Hola",
        "Quiero agendar una cita",
        "Me llamo Pedro López",
        "reset",
        "Hola de nuevo",
        "¿Qué servicios tienen?",
        "Perfecto, gracias"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg, user_id)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        
        # Verificar que después del reset no pida la edad incorrectamente
        if i > 4 and "edad" in bot_response.lower() and "por favor" in bot_response.lower():
            print("❌ ERROR: El chatbot está pidiendo la edad después del reset!")
            return False
        
        time.sleep(1)
    
    print("✅ Test 5 completado sin errores")
    return True

def main():
    """Ejecuta todos los tests"""
    print("🚀 INICIANDO TESTS DE CORRECCIÓN DEL CHATBOT")
    print("=" * 60)
    
    tests = [
        test_1_conversacion_normal,
        test_2_palabras_afirmativas,
        test_3_consulta_general,
        test_4_cita_explicita,
        test_5_reset_conversacion
    ]
    
    resultados = []
    
    for test in tests:
        try:
            resultado = test()
            resultados.append(resultado)
        except Exception as e:
            print(f"❌ Error ejecutando test: {e}")
            resultados.append(False)
        
        print("\n" + "="*60 + "\n")
        time.sleep(2)
    
    # Resumen de resultados
    print("📊 RESUMEN DE RESULTADOS")
    print("=" * 60)
    
    for i, resultado in enumerate(resultados, 1):
        status = "✅ PASÓ" if resultado else "❌ FALLÓ"
        print(f"Test {i}: {status}")
    
    total_passed = sum(resultados)
    total_tests = len(resultados)
    
    print(f"\nTotal: {total_passed}/{total_tests} tests pasaron")
    
    if total_passed == total_tests:
        print("🎉 ¡TODOS LOS TESTS PASARON! El chatbot está funcionando correctamente.")
    else:
        print("⚠️ Algunos tests fallaron. Revisar la lógica del chatbot.")

if __name__ == "__main__":
    main() 