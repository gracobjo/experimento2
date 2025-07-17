#!/usr/bin/env python3
"""
Script para debuggear el chatbot con logging detallado
"""

import requests
import json
import time

def test_chatbot_with_debug():
    """Prueba el chatbot con logging detallado"""
    
    base_url = "http://localhost:8000"
    
    print("🔍 DEBUG DEL CHATBOT")
    print("=" * 50)
    
    # Verificar que el chatbot esté funcionando
    try:
        health_response = requests.get(f"{base_url}/health", timeout=5)
        print(f"✅ Chatbot salud: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        return
    
    # Simular conversación paso a paso
    conversation = [
        "Hola",
        "Quiero una cita",
        "Juan Pérez López",
        "28",
        "+34 612 345 678",
        "juan.perez@email.com",
        "Problema con contrato de trabajo",
        "Derecho Laboral",
        "1",
        "Sí, está todo correcto"
    ]
    
    print("\n💬 Simulando conversación con debug...")
    print("-" * 50)
    
    for i, message in enumerate(conversation, 1):
        print(f"\n{i}. Enviando: '{message}'")
        
        try:
            response = requests.post(
                f"{base_url}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": "test_user_123"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                bot_response = result.get('response', 'Sin respuesta')
                print(f"   🤖 Respuesta: {bot_response[:100]}...")
                
                # Verificar si hay errores en la respuesta
                if "error" in bot_response.lower() or "problema" in bot_response.lower():
                    print(f"   ⚠️  Posible error detectado en la respuesta")
                
            else:
                print(f"   ❌ Error HTTP: {response.status_code}")
                print(f"   📄 Respuesta: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
        
        time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("🔍 Verificando citas creadas...")
    
    # Verificar si se creó alguna cita
    try:
        backend_url = "http://localhost:3000"
        appointments_response = requests.get(f"{backend_url}/api/appointments/visitor", timeout=5)
        
        if appointments_response.status_code == 200:
            appointments = appointments_response.json()
            recent_appointments = [apt for apt in appointments if apt.get('fullName') == 'Juan Pérez López']
            
            if recent_appointments:
                print(f"✅ Se encontraron {len(recent_appointments)} citas para Juan Pérez López")
                for apt in recent_appointments:
                    print(f"   📅 Cita ID: {apt.get('id')}")
                    print(f"   📅 Estado: {apt.get('status')}")
                    print(f"   📅 Creada: {apt.get('createdAt')}")
            else:
                print("❌ No se encontraron citas para Juan Pérez López")
        else:
            print(f"❌ Error obteniendo citas: {appointments_response.status_code}")
            
    except Exception as e:
        print(f"❌ Error verificando citas: {e}")

if __name__ == "__main__":
    test_chatbot_with_debug() 