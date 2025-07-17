#!/usr/bin/env python3
"""
Script para probar la creación de citas directamente
Simula exactamente los datos que enviaría el chatbot
"""

import requests
import json
from datetime import datetime, timedelta

def test_appointment_creation():
    """Prueba la creación de citas con datos simulados del chatbot"""
    
    backend_url = "http://localhost:3000"
    
    print("🔍 PRUEBA DIRECTA DE CREACIÓN DE CITAS")
    print("=" * 50)
    
    # Datos simulados que enviaría el chatbot
    test_data = {
        "fullName": "Juan Pérez López",
        "age": 28,
        "phone": "+34 612 345 678",
        "email": "juan.perez@email.com",
        "consultationReason": "Problema con contrato de trabajo",
        "preferredDate": "2024-01-15T10:00:00Z",
        "consultationType": "Derecho Laboral"
    }
    
    print("📋 Datos que se enviarán:")
    for key, value in test_data.items():
        print(f"   • {key}: {value}")
    
    print(f"\n🔗 Enviando a: {backend_url}/api/appointments/visitor")
    print("-" * 50)
    
    try:
        response = requests.post(
            f"{backend_url}/api/appointments/visitor",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        print(f"📊 Respuesta del backend:")
        print(f"   • Status Code: {response.status_code}")
        print(f"   • Headers: {dict(response.headers)}")
        print(f"   • Response: {response.text}")
        
        if response.status_code == 201:
            print("\n✅ ¡Cita creada exitosamente!")
            appointment = response.json()
            print(f"   • ID: {appointment.get('id')}")
            print(f"   • Estado: {appointment.get('status')}")
            print(f"   • Creada: {appointment.get('createdAt')}")
        else:
            print(f"\n❌ Error al crear cita")
            print(f"   • Código: {response.status_code}")
            print(f"   • Mensaje: {response.text}")
            
            # Intentar parsear el error si es JSON
            try:
                error_data = response.json()
                if 'message' in error_data:
                    print(f"   • Error específico: {error_data['message']}")
            except:
                pass
                
    except requests.exceptions.ConnectionError:
        print("❌ Error de conexión: No se puede conectar al backend")
        print("   Verifica que el backend esté ejecutándose en el puerto 3000")
    except requests.exceptions.Timeout:
        print("❌ Error de timeout: El backend no respondió en tiempo")
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
    
    print("\n" + "=" * 50)
    print("🔍 Verificando esquema de datos requeridos...")
    
    # Verificar qué campos requiere el backend
    try:
        # Intentar obtener la documentación de Swagger
        swagger_response = requests.get(f"{backend_url}/api/docs", timeout=5)
        if swagger_response.status_code == 200:
            print("✅ Documentación Swagger disponible")
            print("   Revisa http://localhost:3000/api/docs para ver el esquema exacto")
        else:
            print("❌ No se puede acceder a la documentación")
    except Exception as e:
        print(f"❌ Error accediendo a documentación: {e}")

if __name__ == "__main__":
    test_appointment_creation() 