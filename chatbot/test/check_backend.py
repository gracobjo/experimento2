#!/usr/bin/env python3
"""
Script para verificar los endpoints disponibles en el backend
"""

import requests
import json

def check_backend_endpoints():
    """Verifica qué endpoints están disponibles en el backend"""
    print("🔍 Verificando endpoints del backend...")
    
    base_url = "http://localhost:3000"
    
    # Lista de endpoints a probar
    endpoints = [
        "/",
        "/health",
        "/api/health",
        "/appointments/visitor",
        "/parametros/contact",
        "/cases",
        "/invoices"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=5)
            print(f"✅ {endpoint}: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   📄 Respuesta: {json.dumps(data, indent=2)[:200]}...")
                except:
                    print(f"   📄 Respuesta: {response.text[:100]}...")
                    
        except Exception as e:
            print(f"❌ {endpoint}: Error - {e}")
    
    # Probar POST al endpoint de citas
    print("\n📅 Probando endpoint de citas...")
    try:
        test_data = {
            "fullName": "Test User",
            "age": 30,
            "phone": "612345678",
            "email": "test@example.com",
            "consultationReason": "Test",
            "preferredDate": "2024-12-25T10:00:00.000Z",
            "consultationType": "Derecho Civil"
        }
        
        response = requests.post(f"{base_url}/appointments/visitor", json=test_data, timeout=10)
        print(f"📤 POST /appointments/visitor: {response.status_code}")
        print(f"   📄 Respuesta: {response.text[:200]}...")
        
    except Exception as e:
        print(f"❌ POST /appointments/visitor: Error - {e}")

def main():
    """Función principal"""
    print("🚀 VERIFICACIÓN DEL BACKEND")
    print("=" * 40)
    
    check_backend_endpoints()
    
    print("\n" + "=" * 40)
    print("💡 RECOMENDACIONES:")
    print("=" * 40)
    print("1. Si no hay endpoints disponibles, verifica que el backend esté ejecutándose")
    print("2. Si el endpoint /health no existe, el backend puede estar en otro puerto")
    print("3. Si hay errores 404, verifica la configuración de rutas del backend")

if __name__ == "__main__":
    main() 