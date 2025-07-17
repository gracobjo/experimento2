#!/usr/bin/env python3
"""
Prueba rápida para verificar que el chatbot ya no pida la edad incorrectamente
"""

import requests
import time

CHATBOT_URL = "http://localhost:8000"

def reset_conversation(user_id: str):
    """Resetea la conversación para un usuario específico"""
    try:
        requests.post(f"{CHATBOT_URL}/end_chat", json={"user_id": user_id})
    except:
        pass

def test_conversacion():
    """Prueba una conversación que antes causaba el problema"""
    print("🧪 PRUEBA RÁPIDA - Verificando corrección del chatbot")
    print("=" * 60)
    
    user_id = "prueba_rapida_user"
    reset_conversation(user_id)
    
    # Mensajes que antes causaban el problema
    mensajes = [
        "Hola",
        "Perfecto",
        "¿Qué servicios tienen?",
        "Excelente",
        "Gracias"
    ]
    
    for i, mensaje in enumerate(mensajes, 1):
        try:
            response = requests.post(f"{CHATBOT_URL}/chat", json={
                "text": mensaje,
                "language": "es",
                "user_id": user_id
            })
            
            if response.status_code == 200:
                bot_response = response.json().get("response", "")
                print(f"\n👤: {mensaje}")
                print(f"🤖: {bot_response}")
                
                # Verificar si pide la edad incorrectamente
                if "edad" in bot_response.lower() and "por favor" in bot_response.lower():
                    print("❌ ERROR: El chatbot está pidiendo la edad incorrectamente!")
                    return False
                    
            else:
                print(f"❌ Error en la respuesta: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            return False
        
        time.sleep(1)
    
    print("\n✅ ¡PRUEBA EXITOSA! El chatbot ya no pide la edad incorrectamente.")
    return True

def test_palabras_afirmativas():
    """Prueba específicamente palabras afirmativas que causaban problemas"""
    print("\n🧪 PRUEBA PALABRAS AFIRMATIVAS")
    print("=" * 60)
    
    user_id = "prueba_afirmativas_user"
    reset_conversation(user_id)
    
    palabras_problematicas = ["Perfecto", "Excelente", "Genial", "Bueno", "Vale"]
    
    for palabra in palabras_problematicas:
        try:
            response = requests.post(f"{CHATBOT_URL}/chat", json={
                "text": palabra,
                "language": "es",
                "user_id": user_id
            })
            
            if response.status_code == 200:
                bot_response = response.json().get("response", "")
                print(f"\n👤: {palabra}")
                print(f"🤖: {bot_response}")
                
                # Verificar si pide la edad incorrectamente
                if "edad" in bot_response.lower() and "por favor" in bot_response.lower():
                    print(f"❌ ERROR: El chatbot pide la edad con '{palabra}'!")
                    return False
                
                # Verificar si activa el flujo de citas incorrectamente
                if "nombre completo" in bot_response.lower() and "agendar" in bot_response.lower():
                    print(f"❌ ERROR: El chatbot activa citas con '{palabra}'!")
                    return False
                    
            else:
                print(f"❌ Error en la respuesta: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            return False
        
        time.sleep(1)
    
    print("\n✅ ¡PRUEBA EXITOSA! Las palabras afirmativas no activan el flujo de citas.")
    return True

def test_cita_explicita():
    """Prueba que las citas explícitas SÍ funcionen correctamente"""
    print("\n🧪 PRUEBA CITA EXPLÍCITA")
    print("=" * 60)
    
    user_id = "prueba_cita_user"
    reset_conversation(user_id)
    
    # Mensajes que SÍ deberían activar el flujo de citas
    mensajes_cita = [
        "Hola",
        "Quiero agendar una cita",
        "Me llamo Juan Pérez",
        "Tengo 30 años"
    ]
    
    for i, mensaje in enumerate(mensajes_cita, 1):
        try:
            response = requests.post(f"{CHATBOT_URL}/chat", json={
                "text": mensaje,
                "language": "es",
                "user_id": user_id
            })
            
            if response.status_code == 200:
                bot_response = response.json().get("response", "")
                print(f"\n👤: {mensaje}")
                print(f"🤖: {bot_response}")
                
                # Verificar que SÍ pida la edad cuando corresponde
                if i == 3 and "edad" not in bot_response.lower():
                    print("❌ ERROR: El chatbot debería estar pidiendo la edad en este punto!")
                    return False
                    
            else:
                print(f"❌ Error en la respuesta: {response.status_code}")
                return False
                
        except Exception as e:
            print(f"❌ Error de conexión: {e}")
            return False
        
        time.sleep(1)
    
    print("\n✅ ¡PRUEBA EXITOSA! Las citas explícitas funcionan correctamente.")
    return True

if __name__ == "__main__":
    print("🚀 INICIANDO PRUEBAS RÁPIDAS")
    print("=" * 60)
    
    # Prueba 1: Conversación normal
    resultado1 = test_conversacion()
    
    print("\n" + "="*60 + "\n")
    
    # Prueba 2: Palabras afirmativas
    resultado2 = test_palabras_afirmativas()
    
    print("\n" + "="*60 + "\n")
    
    # Prueba 3: Cita explícita
    resultado3 = test_cita_explicita()
    
    print("\n" + "="*60)
    print("📊 RESUMEN DE PRUEBAS RÁPIDAS")
    print("=" * 60)
    
    if resultado1 and resultado2 and resultado3:
        print("🎉 ¡TODAS LAS PRUEBAS PASARON! El chatbot está funcionando correctamente.")
    else:
        print("⚠️ Algunas pruebas fallaron. Revisar la lógica del chatbot.") 