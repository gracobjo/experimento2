#!/usr/bin/env python3
"""
Script final para probar el chatbot con logging detallado
"""

import requests
import json
import time

def test_chatbot_with_detailed_logging():
    """Prueba el chatbot con logging detallado para identificar el problema exacto"""
    
    chatbot_url = "http://localhost:8000"
    backend_url = "http://localhost:3000"
    
    print("🔍 PRUEBA FINAL DEL CHATBOT CON LOGGING DETALLADO")
    print("=" * 60)
    
    # Verificar que el chatbot esté funcionando
    try:
        health_response = requests.get(f"{chatbot_url}/health", timeout=5)
        print(f"✅ Chatbot salud: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        print("   Asegúrate de que el chatbot esté ejecutándose en el puerto 8000")
        return
    
    # Verificar que el backend esté funcionando
    try:
        backend_health = requests.get(f"{backend_url}/api/docs", timeout=5)
        print(f"✅ Backend salud: {backend_health.status_code}")
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        print("   Asegúrate de que el backend esté ejecutándose en el puerto 3000")
        return
    
    # Conversación de prueba
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
    
    print(f"\n💬 Iniciando conversación con chatbot...")
    print("-" * 50)
    
    user_id = "test_user_final_123"
    
    for i, message in enumerate(conversation, 1):
        print(f"\n{i}. Enviando: '{message}'")
        
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
                print(f"   🤖 Respuesta: {bot_response[:150]}...")
                
                # Verificar si hay errores específicos
                if "error" in bot_response.lower() or "problema" in bot_response.lower():
                    print(f"   ⚠️  ERROR DETECTADO en la respuesta")
                    print(f"   📄 Respuesta completa: {bot_response}")
                    
                    # Si es el paso final y hay error, mostrar detalles
                    if i == 10:
                        print(f"\n🔍 ANALIZANDO ERROR EN PASO FINAL...")
                        print(f"   • Mensaje enviado: '{message}'")
                        print(f"   • Respuesta del chatbot: '{bot_response}'")
                        print(f"   • User ID: {user_id}")
                        
                        # Verificar si hay citas creadas
                        print(f"\n🔍 Verificando citas en backend...")
                        try:
                            appointments_response = requests.get(f"{backend_url}/api/appointments/visitor", timeout=5)
                            if appointments_response.status_code == 200:
                                appointments = appointments_response.json()
                                recent_appointments = [apt for apt in appointments if apt.get('fullName') == 'Juan Pérez López']
                                if recent_appointments:
                                    print(f"   ✅ Se encontraron {len(recent_appointments)} citas para Juan Pérez López")
                                    for apt in recent_appointments:
                                        print(f"      📅 ID: {apt.get('id')} - Estado: {apt.get('status')}")
                                else:
                                    print(f"   ❌ No se encontraron citas para Juan Pérez López")
                            else:
                                print(f"   ❌ Error obteniendo citas: {appointments_response.status_code}")
                        except Exception as e:
                            print(f"   ❌ Error verificando citas: {e}")
                
            else:
                print(f"   ❌ Error HTTP: {response.status_code}")
                print(f"   📄 Respuesta: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
        
        time.sleep(0.5)
    
    print("\n" + "=" * 60)
    print("📊 RESUMEN DE LA PRUEBA")
    print("=" * 60)
    
    print("✅ Si ves errores en el paso 10, el problema está en:")
    print("   1. La lógica de confirmación del chatbot")
    print("   2. El manejo de la respuesta del backend")
    print("   3. Los datos que se envían al backend")
    
    print("\n💡 PRÓXIMOS PASOS:")
    print("   1. Revisar los logs del chatbot en tiempo real")
    print("   2. Verificar que el chatbot esté usando los endpoints correctos")
    print("   3. Comprobar que los datos se envían en el formato correcto")

if __name__ == "__main__":
    test_chatbot_with_detailed_logging() 