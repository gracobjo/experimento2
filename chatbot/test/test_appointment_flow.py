#!/usr/bin/env python3
"""
Script para probar el flujo completo de citas con las mejoras implementadas
"""

import requests
import json
import time

def test_appointment_flow():
    """Prueba el flujo completo de citas"""
    
    chatbot_url = "http://localhost:8000"
    user_id = "test_user_appointment"
    
    print("=" * 60)
    print("PRUEBA DEL FLUJO COMPLETO DE CITAS")
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
    
    # Simular conversación completa
    conversation_steps = [
        ("hola, quiero una cita", "Inicio de conversación"),
        ("Juan Pérez García", "Nombre"),
        ("35", "Edad"),
        ("612345678", "Teléfono"),
        ("juan.perez@email.com", "Email"),
        ("problema laboral", "Motivo"),
        ("laboral", "Área"),
        ("1", "Fecha seleccionada"),
        ("no", "Rechazo confirmación"),
        ("7", "Modificar fecha"),
        ("2", "Nueva fecha seleccionada"),
        ("sí", "Confirmación final")
    ]
    
    print("\n2. Simulando conversación de cita...")
    
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
                print(f"Chatbot: {bot_response[:100]}...")
                
                # Verificar respuestas específicas
                if i == 8:  # Después de seleccionar fecha
                    if "Resumen de tu cita" in bot_response and "Fecha y hora" in bot_response:
                        print("✅ Confirmación muestra fecha y hora correctamente")
                    else:
                        print("❌ Confirmación no muestra fecha y hora")
                
                elif i == 9:  # Después de decir "no"
                    if "modificar" in bot_response.lower() and "opciones disponibles" in bot_response.lower():
                        print("✅ Opciones de modificación mostradas correctamente")
                    else:
                        print("❌ No se muestran opciones de modificación")
                
                elif i == 10:  # Después de seleccionar modificar fecha
                    if "fecha prefieres" in bot_response.lower():
                        print("✅ Permite modificar fecha correctamente")
                    else:
                        print("❌ No permite modificar fecha")
                
                elif i == 12:  # Confirmación final
                    if "agendada exitosamente" in bot_response and "Fecha y hora" in bot_response:
                        print("✅ Cita creada exitosamente con fecha y hora")
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

def test_date_formatting():
    """Prueba el formateo de fechas"""
    
    print("\n3. Probando formateo de fechas...")
    
    from datetime import datetime
    
    # Simular diferentes formatos de fecha
    test_dates = [
        "2025-07-16T09:00:00",
        "2025-07-16T10:00:00Z",
        "2025-07-17T16:00:00+00:00"
    ]
    
    for date_str in test_dates:
        try:
            date_obj = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            formatted = date_obj.strftime('%d/%m/%Y a las %H:%M')
            print(f"✅ {date_str} → {formatted}")
        except Exception as e:
            print(f"❌ Error formateando {date_str}: {e}")

if __name__ == "__main__":
    test_appointment_flow()
    test_date_formatting() 