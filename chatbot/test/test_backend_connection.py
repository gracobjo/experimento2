#!/usr/bin/env python3
"""
Script para probar la conexión con el backend y verificar el endpoint de citas de visitantes
"""

import requests
import json
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

# Configuración
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:3000")
TEST_EMAIL = "test@example.com"

def test_backend_health():
    """Prueba la salud del backend"""
    print("🏥 Probando salud del backend...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend está funcionando correctamente")
            return True
        else:
            print(f"⚠️ Backend respondió con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error conectando al backend: {e}")
        return False

def test_visitor_appointment_endpoint():
    """Prueba el endpoint de citas de visitantes"""
    print("\n📅 Probando endpoint de citas de visitantes...")
    
    # Datos de prueba
    test_appointment = {
        "fullName": "Test User",
        "age": 30,
        "phone": "612345678",
        "email": TEST_EMAIL,
        "consultationReason": "Divorcio",
        "preferredDate": (datetime.now() + timedelta(days=7)).isoformat(),
        "consultationType": "Derecho Familiar",
        "notes": "Prueba del chatbot",
        "location": "Oficina principal"
    }
    
    print(f"📤 Enviando datos de prueba: {json.dumps(test_appointment, indent=2)}")
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/appointments/visitor", 
            json=test_appointment, 
            timeout=10
        )
        
        print(f"📥 Respuesta del backend:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Headers: {dict(response.headers)}")
        print(f"   Body: {response.text}")
        
        if response.status_code == 201:
            print("✅ Cita creada exitosamente")
            appointment_data = response.json()
            print(f"   ID de la cita: {appointment_data.get('id')}")
            return True
        else:
            print("❌ Error creando la cita")
            if response.status_code == 400:
                print("   Error de validación - revisar datos enviados")
            elif response.status_code == 500:
                print("   Error interno del servidor")
            return False
            
    except Exception as e:
        print(f"❌ Error en la petición: {e}")
        return False

def test_chatbot_endpoint():
    """Prueba el endpoint del chatbot"""
    print("\n🤖 Probando endpoint del chatbot...")
    
    test_message = {
        "text": "Hola, quiero una cita",
        "language": "es"
    }
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/chatbot/chat", 
            json=test_message, 
            timeout=10
        )
        
        print(f"📥 Respuesta del chatbot:")
        print(f"   Status Code: {response.status_code}")
        print(f"   Body: {response.text}")
        
        if response.status_code == 200:
            print("✅ Chatbot responde correctamente")
            return True
        else:
            print("❌ Error en el chatbot")
            return False
            
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        return False

def check_backend_services():
    """Verifica que los servicios del backend estén disponibles"""
    print("\n🔍 Verificando servicios del backend...")
    
    services = [
        ("/health", "Health Check"),
        ("/parametros/contact", "Parámetros de contacto"),
        ("/cases", "Casos"),
        ("/invoices", "Facturas")
    ]
    
    for endpoint, name in services:
        try:
            response = requests.get(f"{BACKEND_URL}{endpoint}", timeout=5)
            if response.status_code in [200, 401, 403]:  # 401/403 son normales para endpoints protegidos
                print(f"✅ {name}: Disponible (Status: {response.status_code})")
            else:
                print(f"⚠️ {name}: Status inesperado ({response.status_code})")
        except Exception as e:
            print(f"❌ {name}: Error - {e}")

def main():
    """Función principal"""
    print("🚀 Iniciando pruebas de conexión con el backend...")
    print(f"📍 URL del backend: {BACKEND_URL}")
    
    # Verificar que el backend esté funcionando
    if not test_backend_health():
        print("\n❌ El backend no está disponible. Asegúrate de que esté ejecutándose.")
        return
    
    # Verificar servicios
    check_backend_services()
    
    # Probar endpoint de citas
    appointment_success = test_visitor_appointment_endpoint()
    
    # Probar chatbot (si está disponible)
    chatbot_success = test_chatbot_endpoint()
    
    # Resumen
    print("\n📊 RESUMEN DE PRUEBAS:")
    print(f"   Backend Health: ✅")
    print(f"   Visitor Appointments: {'✅' if appointment_success else '❌'}")
    print(f"   Chatbot: {'✅' if chatbot_success else '❌'}")
    
    if appointment_success:
        print("\n🎉 ¡El backend está funcionando correctamente!")
        print("   El chatbot debería poder crear citas sin problemas.")
    else:
        print("\n⚠️ Hay problemas con el endpoint de citas.")
        print("   Revisa los logs del backend para más detalles.")

if __name__ == "__main__":
    main() 