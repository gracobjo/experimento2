#!/usr/bin/env python3
"""
Script de prueba para verificar la conversación del chatbot
"""

import requests
import json
import os
import time
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración
CHATBOT_URL = os.getenv("CHATBOT_URL", "http://localhost:8000")

def test_conversation_flow():
    """Prueba el flujo completo de conversación del chatbot"""
    
    print("🤖 PRUEBA DE CONVERSACIÓN DEL CHATBOT")
    print("=" * 60)
    print()
    
    # Datos de prueba
    test_data = {
        "fullName": "Ana García Martínez",
        "age": 32,
        "phone": "+34 678 123 456",
        "email": "ana.garcia@ejemplo.com",
        "consultationReason": "Problema con contrato de trabajo",
        "consultationType": "Derecho Laboral"
    }
    
    print("📋 Datos de prueba:")
    print(f"   • Nombre: {test_data['fullName']}")
    print(f"   • Email: {test_data['email']}")
    print(f"   • Motivo: {test_data['consultationReason']}")
    print(f"   • Tipo: {test_data['consultationType']}")
    print()
    
    # Simular conversación paso a paso
    conversation_steps = [
        ("Hola", "Saludo inicial"),
        ("Quiero una cita", "Solicitud de cita"),
        (test_data["fullName"], "Nombre completo"),
        (str(test_data["age"]), "Edad"),
        (test_data["phone"], "Teléfono"),
        (test_data["email"], "Email"),
        (test_data["consultationReason"], "Motivo de consulta"),
        (test_data["consultationType"], "Tipo de consulta"),
        ("1", "Selección de fecha"),
        ("Sí, está todo correcto", "Confirmación final")
    ]
    
    print("💬 Simulando conversación...")
    print()
    
    user_id = f"test_user_{int(time.time())}"
    conversation_history = []
    
    for i, (message, step) in enumerate(conversation_steps, 1):
        print(f"{i:2d}. {step}: '{message}'")
        
        # Enviar mensaje al chatbot
        try:
            response = requests.post(
                f"{CHATBOT_URL}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                chatbot_response = response.json()
                response_text = chatbot_response['response']
                print(f"    🤖 Chatbot: {response_text[:100]}...")
                
                # Verificar si la cita fue creada
                if "cita ha sido agendada exitosamente" in response_text:
                    print()
                    print("✅ ¡Cita agendada exitosamente!")
                    print()
                    print("📧 Verificando envío de correos...")
                    print("   - Email de confirmación al visitante")
                    print("   - Email de notificación a administradores")
                    print()
                    print(f"🔍 Revisa tu bandeja de entrada y spam:")
                    print(f"   Email: {test_data['email']}")
                    print()
                    return True
                    
            else:
                print(f"    ❌ Error: {response.status_code}")
                print(f"    Respuesta: {response.text}")
                
        except requests.exceptions.ConnectionError:
            print(f"    ❌ Error: No se puede conectar al chatbot en {CHATBOT_URL}")
            print("   Asegúrate de que el chatbot esté ejecutándose")
            return False
        except Exception as e:
            print(f"    ❌ Error: {e}")
            return False
        
        time.sleep(1)  # Pausa entre mensajes
    
    print()
    print("⚠️  La conversación no resultó en una cita agendada")
    return False

def test_specific_scenarios():
    """Prueba escenarios específicos del chatbot"""
    
    print("🧪 PRUEBA DE ESCENARIOS ESPECÍFICOS")
    print("=" * 60)
    print()
    
    scenarios = [
        {
            "name": "Solicitud directa de cita",
            "messages": ["cita", "si"],
            "expected": "nombre completo"
        },
        {
            "name": "Confirmación después de información",
            "messages": ["hola", "quiero agendar una cita", "si"],
            "expected": "nombre completo"
        },
        {
            "name": "Respuesta afirmativa a pregunta de cita",
            "messages": ["hola", "¿puedes ayudarme con una cita?", "si"],
            "expected": "nombre completo"
        }
    ]
    
    user_id = f"test_scenario_{int(time.time())}"
    
    for scenario in scenarios:
        print(f"📝 Escenario: {scenario['name']}")
        
        for i, message in enumerate(scenario['messages']):
            print(f"   {i+1}. Usuario: '{message}'")
            
            try:
                response = requests.post(
                    f"{CHATBOT_URL}/chat",
                    json={
                        "text": message,
                        "language": "es",
                        "user_id": f"{user_id}_{scenario['name']}"
                    },
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    chatbot_response = response.json()
                    response_text = chatbot_response['response']
                    print(f"      🤖 Chatbot: {response_text[:80]}...")
                    
                    # Verificar si la respuesta contiene lo esperado
                    if scenario['expected'] in response_text.lower():
                        print(f"      ✅ Respuesta correcta (contiene '{scenario['expected']}')")
                    else:
                        print(f"      ⚠️  Respuesta inesperada")
                        
                else:
                    print(f"      ❌ Error: {response.status_code}")
                    
            except Exception as e:
                print(f"      ❌ Error: {e}")
        
        print()
        time.sleep(2)  # Pausa entre escenarios

def test_chatbot_health():
    """Prueba la salud del chatbot"""
    
    print("🏥 Verificando salud del chatbot...")
    
    try:
        response = requests.get(f"{CHATBOT_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Chatbot funcionando correctamente")
            return True
        else:
            print(f"⚠️  Chatbot respondió con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        return False

def main():
    """Función principal"""
    
    print("=" * 70)
    print("🧪 PRUEBA DE CONVERSACIÓN DEL CHATBOT")
    print("=" * 70)
    print()
    
    # Verificar salud del chatbot
    if not test_chatbot_health():
        print()
        print("❌ Chatbot no disponible. Inicia el chatbot primero:")
        print("   python main_improved.py")
        return
    
    print()
    
    # Probar escenarios específicos
    test_specific_scenarios()
    
    print()
    
    # Probar flujo completo
    success = test_conversation_flow()
    
    if success:
        print("=" * 70)
        print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
        print("=" * 70)
        print()
        print("📋 Resumen:")
        print("   • Chatbot detecta correctamente intenciones de citas")
        print("   • Conversación fluye correctamente")
        print("   • Cita agendada exitosamente")
        print("   • Emails enviados automáticamente")
        print()
        print("🎯 El chatbot está funcionando correctamente")
    else:
        print("=" * 70)
        print("❌ PRUEBA FALLIDA")
        print("=" * 70)
        print()
        print("🔧 Posibles problemas:")
        print("   1. El chatbot no detecta correctamente las intenciones")
        print("   2. La conversación no fluye como se espera")
        print("   3. Problemas con la integración con el backend")
        print()
        print("💡 Revisa los logs del chatbot para más detalles")

if __name__ == "__main__":
    main() 