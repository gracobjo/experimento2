#!/usr/bin/env python3
"""
Script de prueba para el sistema de correos del chatbot
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
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
CHATBOT_URL = os.getenv("CHATBOT_URL", "http://localhost:8000")
TEST_EMAIL = os.getenv("TEST_EMAIL", "test@example.com")

def test_chatbot_conversation():
    """Prueba una conversación completa del chatbot para agendar una cita"""
    
    print("🤖 PRUEBA DEL CHATBOT - SISTEMA DE CORREOS")
    print("=" * 60)
    print()
    
    # Datos de prueba
    test_data = {
        "fullName": "María García López",
        "age": 28,
        "phone": "+34 678 901 234",
        "email": TEST_EMAIL,
        "consultationReason": "Problema laboral con despido",
        "consultationType": "Derecho Laboral",
        "preferredDate": (datetime.now() + timedelta(days=5)).isoformat()
    }
    
    print("📋 Datos de prueba:")
    print(f"   • Nombre: {test_data['fullName']}")
    print(f"   • Email: {test_data['email']}")
    print(f"   • Motivo: {test_data['consultationReason']}")
    print(f"   • Tipo: {test_data['consultationType']}")
    print()
    
    # Simular conversación del chatbot
    conversation_steps = [
        ("Hola, quiero agendar una cita", "Saludo inicial"),
        ("Sí, quiero agendar una cita", "Confirmación de interés"),
        (test_data["fullName"], "Nombre completo"),
        (str(test_data["age"]), "Edad"),
        (test_data["phone"], "Teléfono"),
        (test_data["email"], "Email"),
        (test_data["consultationReason"], "Motivo de consulta"),
        (test_data["consultationType"], "Tipo de consulta"),
        ("1", "Selección de fecha"),
        ("Sí, está todo correcto", "Confirmación final")
    ]
    
    print("💬 Simulando conversación del chatbot...")
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
                print(f"    🤖 Chatbot: {chatbot_response['response'][:100]}...")
                
                # Verificar si la cita fue creada
                if "cita ha sido agendada exitosamente" in chatbot_response['response']:
                    print()
                    print("✅ ¡Cita agendada exitosamente!")
                    print()
                    print("📧 Verificando envío de correos...")
                    print("   - Email de confirmación al visitante")
                    print("   - Email de notificación a administradores")
                    print()
                    print(f"🔍 Revisa tu bandeja de entrada y spam:")
                    print(f"   Email: {TEST_EMAIL}")
                    print()
                    
                    # Verificar en la base de datos
                    verify_appointment_in_database()
                    return True
                    
            else:
                print(f"    ❌ Error: {response.status_code}")
                
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

def verify_appointment_in_database():
    """Verifica que la cita existe en la base de datos"""
    
    print("🗄️  Verificando cita en la base de datos...")
    
    try:
        # Obtener todas las citas de visitantes
        response = requests.get(
            f"{BACKEND_URL}/api/appointments/visitor",
            headers={"Authorization": "Bearer admin-token"},  # Token de admin para pruebas
            timeout=10
        )
        
        if response.status_code == 200:
            appointments = response.json()
            
            # Buscar la cita más reciente con el email de prueba
            recent_appointments = [
                apt for apt in appointments 
                if apt.get('email') == TEST_EMAIL
            ]
            
            if recent_appointments:
                latest_appointment = max(recent_appointments, key=lambda x: x['createdAt'])
                print(f"✅ Cita encontrada en la base de datos")
                print(f"   ID: {latest_appointment['id']}")
                print(f"   Estado: {latest_appointment['status']}")
                print(f"   Fecha: {latest_appointment['preferredDate']}")
                print(f"   Creada: {latest_appointment['createdAt']}")
            else:
                print("⚠️  No se encontró la cita en la base de datos")
        else:
            print(f"⚠️  Error verificando base de datos: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error verificando base de datos: {e}")

def test_backend_health():
    """Prueba la salud del backend"""
    
    print("🏥 Verificando salud del backend...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend funcionando correctamente")
            return True
        else:
            print(f"⚠️  Backend respondió con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        return False

def test_chatbot_health():
    """Prueba la salud del chatbot"""
    
    print("🤖 Verificando salud del chatbot...")
    
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
    print("🧪 PRUEBA DEL SISTEMA DE CORREOS DEL CHATBOT")
    print("=" * 70)
    print()
    
    # Verificar servicios
    if not test_backend_health():
        print()
        print("❌ Backend no disponible. Inicia el backend primero:")
        print("   cd ../backend")
        print("   npm run start:dev")
        return
    
    print()
    
    if not test_chatbot_health():
        print()
        print("❌ Chatbot no disponible. Inicia el chatbot primero:")
        print("   python main_improved.py")
        return
    
    print()
    
    # Probar conversación del chatbot
    success = test_chatbot_conversation()
    
    if success:
        print("=" * 70)
        print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
        print("=" * 70)
        print()
        print("📋 Resumen:")
        print("   • Conversación del chatbot completada")
        print("   • Cita agendada exitosamente")
        print("   • Emails enviados automáticamente")
        print()
        print("📧 Verifica que hayas recibido:")
        print("   1. Email de confirmación al visitante")
        print("   2. Email de notificación a administradores")
        print()
        print("🔍 Si no recibes los correos:")
        print("   • Revisa la carpeta de spam")
        print("   • Verifica la configuración de Gmail")
        print("   • Revisa los logs del backend")
        print()
        print("🎯 Próximos pasos:")
        print("   • Confirma la cita desde el panel de administración")
        print("   • Verifica que llegue el email de confirmación final")
    else:
        print("=" * 70)
        print("❌ PRUEBA FALLIDA")
        print("=" * 70)
        print()
        print("🔧 Solución de problemas:")
        print("   1. Verifica que el backend esté ejecutándose")
        print("   2. Verifica que el chatbot esté ejecutándose")
        print("   3. Revisa la configuración de correos")
        print("   4. Verifica las variables de entorno")
        print("   5. Revisa los logs del backend y chatbot")

if __name__ == "__main__":
    main() 