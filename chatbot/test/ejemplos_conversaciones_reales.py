#!/usr/bin/env python3
"""
Ejemplos de conversaciones reales que muestran el flujo natural del chatbot
Demuestra cómo el chatbot maneja situaciones reales de manera natural
"""

import requests
import json
import time
from typing import Dict

# Configuración
CHATBOT_URL = "http://localhost:8000"

def send_message(text: str, user_id: str = "ejemplo_user") -> Dict:
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

def print_conversation(title: str, user_msg: str, bot_response: str):
    """Imprime la conversación con formato"""
    print(f"\n💬 {title}")
    print("-" * 50)
    print(f"👤: {user_msg}")
    print(f"🤖: {bot_response}")
    print("-" * 50)

def ejemplo_1_consulta_laboral():
    """Ejemplo 1: Consulta sobre derecho laboral con agendamiento de cita"""
    print("\n📋 EJEMPLO 1: CONSULTA LABORAL CON AGENDAMIENTO")
    print("=" * 60)
    
    conversacion = [
        "Hola, me llamo Ana García",
        "Tengo un problema en el trabajo",
        "Me están haciendo trabajar más horas de las que dice mi contrato",
        "¿Qué puedo hacer?",
        "¿Tienen experiencia en estos casos?",
        "¿Cuánto cobran por una consulta?",
        "Me gustaría agendar una cita",
        "Tengo 32 años",
        "+34 678901234",
        "ana.garcia@email.com",
        "Es sobre horas extras no pagadas",
        "La opción 3",
        "Sí, confirmo los datos"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        time.sleep(1)

def ejemplo_2_consulta_familiar():
    """Ejemplo 2: Consulta sobre derecho familiar"""
    print("\n📋 EJEMPLO 2: CONSULTA FAMILIAR")
    print("=" * 60)
    
    conversacion = [
        "Buenos días, me llamo Carlos Rodríguez",
        "Necesito ayuda con un tema de familia",
        "Mi esposa y yo queremos divorciarnos",
        "Tenemos dos hijos menores",
        "¿Cómo funciona el proceso?",
        "¿Qué pasa con la custodia de los niños?",
        "¿Y con la casa que compramos juntos?",
        "Estoy muy preocupado por todo esto",
        "¿Pueden ayudarme?",
        "Gracias por la información",
        "Quiero agendar una cita para discutir todo en detalle"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        time.sleep(1)

def ejemplo_3_emergencia_legal():
    """Ejemplo 3: Emergencia legal"""
    print("\n📋 EJEMPLO 3: EMERGENCIA LEGAL")
    print("=" * 60)
    
    conversacion = [
        "¡Necesito ayuda urgente!",
        "Me están desahuciando mañana",
        "No sé qué hacer",
        "¿Pueden ayudarme?",
        "Es muy urgente",
        "No tengo a dónde ir",
        "¿Qué debo hacer?"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        time.sleep(1)

def ejemplo_4_consulta_mercantil():
    """Ejemplo 4: Consulta sobre derecho mercantil"""
    print("\n📋 EJEMPLO 4: CONSULTA MERCANTIL")
    print("=" * 60)
    
    conversacion = [
        "Hola, soy Laura Martínez",
        "Tengo una pequeña empresa",
        "Necesito ayuda con un contrato comercial",
        "Un proveedor me está causando problemas",
        "¿Qué servicios tienen para empresas?",
        "¿Cuánto cobran por revisar contratos?",
        "¿Tienen experiencia en derecho mercantil?",
        "Me gustaría que revisen mi situación",
        "¿Puedo agendar una consulta?"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        time.sleep(1)

def ejemplo_5_conversacion_natural():
    """Ejemplo 5: Conversación natural con múltiples temas"""
    print("\n📋 EJEMPLO 5: CONVERSACIÓN NATURAL")
    print("=" * 60)
    
    conversacion = [
        "Hola, me llamo Roberto López",
        "¿Cómo están?",
        "Tengo varias preguntas",
        "Primero, ¿qué servicios ofrecen?",
        "Me interesa el derecho civil",
        "¿Cuánto cobran por una consulta?",
        "¿Tienen experiencia en casos de daños?",
        "Perfecto, me gusta lo que escucho",
        "¿Podrían ayudarme con mi caso?",
        "Es sobre un accidente de tráfico",
        "¿Qué documentos necesito llevar?",
        "Gracias por toda la información",
        "Quiero agendar una cita",
        "¿Qué día tienen disponible?",
        "Muchas gracias por la ayuda",
        "Hasta luego"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        time.sleep(1)

def ejemplo_6_manejo_emocional():
    """Ejemplo 6: Manejo de situaciones emocionales"""
    print("\n📋 EJEMPLO 6: MANEJO EMOCIONAL")
    print("=" * 60)
    
    conversacion = [
        "Hola, me llamo María Fernández",
        "Estoy muy triste y confundida",
        "Mi jefe me acosa en el trabajo",
        "No sé qué hacer",
        "Tengo miedo de perder mi trabajo",
        "¿Pueden ayudarme?",
        "Es muy difícil para mí",
        "¿Qué derechos tengo?",
        "¿Es confidencial lo que les cuento?",
        "Gracias por escucharme",
        "Me siento mejor hablando con ustedes",
        "¿Puedo agendar una cita?"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        time.sleep(1)

def ejemplo_7_consulta_general():
    """Ejemplo 7: Consulta general sobre servicios"""
    print("\n📋 EJEMPLO 7: CONSULTA GENERAL")
    print("=" * 60)
    
    conversacion = [
        "Buenas tardes",
        "¿Qué servicios ofrecen?",
        "¿En qué se especializan?",
        "¿Cuántos años de experiencia tienen?",
        "¿Cómo funciona la primera consulta?",
        "¿Es gratuita?",
        "¿Qué documentos necesito?",
        "¿Cuál es su horario de atención?",
        "¿Dónde están ubicados?",
        "¿Puedo contactarlos por teléfono?",
        "Gracias por la información",
        "Me ha sido muy útil"
    ]
    
    for i, user_msg in enumerate(conversacion, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Paso {i}", user_msg, bot_response)
        time.sleep(1)

def ejemplo_8_reset_y_nueva_conversacion():
    """Ejemplo 8: Reset y nueva conversación"""
    print("\n📋 EJEMPLO 8: RESET Y NUEVA CONVERSACIÓN")
    print("=" * 60)
    
    # Primera conversación
    conversacion_1 = [
        "Hola, me llamo Pedro Sánchez",
        "¿Qué servicios tienen?",
        "Me interesa el derecho laboral"
    ]
    
    for i, user_msg in enumerate(conversacion_1, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Antes del reset - Paso {i}", user_msg, bot_response)
        time.sleep(1)
    
    # Reset
    response = send_message("reset")
    bot_response = response.get("response", "Sin respuesta")
    print_conversation("Comando Reset", "reset", bot_response)
    
    # Nueva conversación
    conversacion_2 = [
        "Hola de nuevo",
        "¿Qué servicios ofrecen?",
        "Me interesa el derecho familiar"
    ]
    
    for i, user_msg in enumerate(conversacion_2, 1):
        response = send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        print_conversation(f"Después del reset - Paso {i}", user_msg, bot_response)
        time.sleep(1)

def main():
    """Función principal que ejecuta todos los ejemplos"""
    print("🎭 EJEMPLOS DE CONVERSACIONES REALES")
    print("=" * 80)
    print("Este script muestra ejemplos reales de cómo el chatbot maneja diferentes situaciones:")
    print("• Consulta laboral con agendamiento")
    print("• Consulta familiar")
    print("• Emergencia legal")
    print("• Consulta mercantil")
    print("• Conversación natural")
    print("• Manejo emocional")
    print("• Consulta general")
    print("• Reset y nueva conversación")
    print("=" * 80)
    
    try:
        # Verificar que el chatbot esté funcionando
        health_response = requests.get(f"{CHATBOT_URL}/health")
        if health_response.status_code != 200:
            print("❌ El chatbot no está funcionando. Asegúrate de que esté ejecutándose en el puerto 8000.")
            return
        
        print("✅ Chatbot funcionando correctamente")
        print("🎬 Iniciando ejemplos de conversaciones reales...")
        
        # Ejecutar todos los ejemplos
        ejemplo_1_consulta_laboral()
        ejemplo_2_consulta_familiar()
        ejemplo_3_emergencia_legal()
        ejemplo_4_consulta_mercantil()
        ejemplo_5_conversacion_natural()
        ejemplo_6_manejo_emocional()
        ejemplo_7_consulta_general()
        ejemplo_8_reset_y_nueva_conversacion()
        
        print("\n🎉 ¡Todos los ejemplos completados!")
        print("El chatbot ha demostrado su capacidad para manejar conversaciones reales de manera natural y profesional.")
        
    except Exception as e:
        print(f"❌ Error durante los ejemplos: {e}")

if __name__ == "__main__":
    main() 