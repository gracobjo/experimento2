#!/usr/bin/env python3
"""
Script para probar el flujo de edición mejorado
"""

import requests
import json
import time

def test_edit_flow():
    """Prueba el flujo de edición mejorado"""
    
    chatbot_url = "http://localhost:8000"
    user_id = "test_user_edit"
    
    print("=" * 60)
    print("PRUEBA DEL FLUJO DE EDICIÓN MEJORADO")
    print("=" * 60)
    
    # Verificar que el chatbot esté funcionando
    print("\n1. Verificando estado del chatbot...")
    try:
        health_response = requests.get(f"{chatbot_url}/health", timeout=5)
        if health_response.status_code == 200:
            print("✅ Chatbot está funcionando")
        else:
            print(f"❌ Chatbot no responde: {health_response.status_code}")
            return
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        return
    
    # Simular conversación con edición
    conversation_steps = [
        ("hola, quiero una cita", "Inicio de conversación"),
        ("María García López", "Nombre"),
        ("28", "Edad"),
        ("612345678", "Teléfono"),
        ("maria.garcia@email.com", "Email"),
        ("problema de herencia", "Motivo"),
        ("civil", "Área"),
        ("1", "Fecha seleccionada"),
        ("no", "Rechazo confirmación"),
        ("4", "Modificar email"),
        ("maria.garcia.nueva@email.com", "Nuevo email"),
        ("sí", "Confirmación final")
    ]
    
    print("\n2. Simulando conversación con edición...")
    
    for i, (message, description) in enumerate(conversation_steps, 1):
        print(f"\n--- Paso {i}: {description} ---")
        print(f"Usuario: {message}")
        
        try:
            response = requests.post(
                f"{chatbot_url}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                response_data = response.json()
                bot_response = response_data.get("response", "")
                print(f"Chatbot: {bot_response[:150]}...")
                
                # Verificar respuestas específicas
                if i == 8:  # Después de seleccionar fecha
                    if "Resumen de tu cita" in bot_response and "maria.garcia@email.com" in bot_response:
                        print("✅ Confirmación inicial correcta")
                    else:
                        print("❌ Confirmación inicial incorrecta")
                
                elif i == 9:  # Después de decir "no"
                    if "modificar" in bot_response.lower() and "opciones disponibles" in bot_response.lower():
                        print("✅ Menú de modificación mostrado")
                    else:
                        print("❌ Menú de modificación no mostrado")
                
                elif i == 10:  # Después de seleccionar modificar email
                    if "correo electrónico" in bot_response.lower() and "maria.garcia@email.com" in bot_response:
                        print("✅ Pregunta por nuevo email con valor actual")
                    else:
                        print("❌ No pregunta correctamente por nuevo email")
                
                elif i == 11:  # Después de ingresar nuevo email
                    if "Resumen de tu cita" in bot_response and "maria.garcia.nueva@email.com" in bot_response:
                        print("✅ Vuelve a confirmación con email actualizado")
                    else:
                        print("❌ No vuelve a confirmación o no actualiza email")
                
                elif i == 12:  # Confirmación final
                    if "agendada exitosamente" in bot_response and "maria.garcia.nueva@email.com" in bot_response:
                        print("✅ Cita creada con email actualizado")
                    else:
                        print("❌ Error en la creación final de la cita")
                
            else:
                print(f"❌ Error en paso {i}: {response.status_code}")
                break
                
        except Exception as e:
            print(f"❌ Error en paso {i}: {e}")
            break
        
        time.sleep(1)  # Pausa entre mensajes
    
    print("\n" + "=" * 60)
    print("PRUEBA COMPLETADA")
    print("=" * 60)

def test_multiple_edits():
    """Prueba múltiples ediciones consecutivas"""
    
    print("\n3. Probando múltiples ediciones...")
    
    chatbot_url = "http://localhost:8000"
    user_id = "test_user_multiple_edits"
    
    # Simular múltiples ediciones
    edits = [
        ("hola, quiero una cita", "Inicio"),
        ("Juan Pérez", "Nombre"),
        ("45", "Edad"),
        ("612345678", "Teléfono"),
        ("juan.perez@email.com", "Email"),
        ("problema laboral", "Motivo"),
        ("laboral", "Área"),
        ("1", "Fecha"),
        ("no", "Rechazar"),
        ("2", "Modificar edad"),
        ("46", "Nueva edad"),
        ("no", "Rechazar de nuevo"),
        ("5", "Modificar motivo"),
        ("despido laboral", "Nuevo motivo"),
        ("sí", "Confirmar")
    ]
    
    for i, (message, description) in enumerate(edits, 1):
        print(f"\n--- Edición {i}: {description} ---")
        
        try:
            response = requests.post(
                f"{chatbot_url}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                response_data = response.json()
                bot_response = response_data.get("response", "")
                
                # Verificar que después de cada edición vuelve a confirmación
                if i in [11, 14]:  # Después de editar edad y motivo
                    if "Resumen de tu cita" in bot_response:
                        print(f"✅ Vuelve a confirmación después de editar {description}")
                    else:
                        print(f"❌ No vuelve a confirmación después de editar {description}")
                
            else:
                print(f"❌ Error en edición {i}: {response.status_code}")
                break
                
        except Exception as e:
            print(f"❌ Error en edición {i}: {e}")
            break
        
        time.sleep(1)

if __name__ == "__main__":
    test_edit_flow()
    test_multiple_edits() 