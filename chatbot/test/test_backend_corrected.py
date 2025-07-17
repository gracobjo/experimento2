#!/usr/bin/env python3
"""
Script para probar el backend con los endpoints correctos
Incluye el prefijo /api que está configurado globalmente
"""

import requests
import json
import time
from datetime import datetime

def test_endpoint(url, method='GET', data=None, description=""):
    """Prueba un endpoint específico"""
    try:
        if method == 'GET':
            response = requests.get(url, timeout=10)
        elif method == 'POST':
            response = requests.post(url, json=data, timeout=10)
        elif method == 'PUT':
            response = requests.put(url, json=data, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, timeout=10)
        
        status = response.status_code
        if status == 200 or status == 201:
            return f"✅ {status} - {description}"
        else:
            return f"❌ {status} - {description}"
    except requests.exceptions.RequestException as e:
        return f"❌ Error: {e} - {description}"

def main():
    base_url = "http://localhost:3000"
    
    print("🔍 PRUEBA DEL BACKEND CON ENDPOINTS CORREGIDOS")
    print("=" * 60)
    
    # Endpoints principales con prefijo /api
    endpoints = [
        # Endpoints básicos
        (f"{base_url}/api", "GET", None, "API principal"),
        (f"{base_url}/api/docs", "GET", None, "Documentación Swagger"),
        
        # Endpoints de citas de visitantes (los que necesita el chatbot)
        (f"{base_url}/api/appointments/visitor", "GET", None, "Listar citas de visitantes"),
        (f"{base_url}/api/appointments/visitor", "POST", {
            "fullName": "Test User",
            "age": 30,
            "phone": "123456789",
            "email": "test@example.com",
            "consultationReason": "Consulta legal",
            "preferredDate": "2024-01-15T10:00:00Z",
            "consultationType": "PRESENCIAL"
        }, "Crear cita de visitante"),
        
        # Endpoints de citas regulares
        (f"{base_url}/api/appointments", "GET", None, "Listar citas regulares"),
        
        # Endpoints de parámetros
        (f"{base_url}/api/parametros/contact", "GET", None, "Parámetros de contacto"),
        
        # Endpoints de casos
        (f"{base_url}/api/cases", "GET", None, "Listar casos"),
        
        # Endpoints de facturas
        (f"{base_url}/api/invoices", "GET", None, "Listar facturas"),
        
        # Endpoints de autenticación
        (f"{base_url}/api/auth/login", "POST", {
            "email": "test@example.com",
            "password": "password123"
        }, "Login de usuario"),
        
        # Endpoints de usuarios
        (f"{base_url}/api/users", "GET", None, "Listar usuarios"),
    ]
    
    print("🔗 Probando endpoints del backend...")
    print()
    
    working_endpoints = 0
    total_endpoints = len(endpoints)
    
    for url, method, data, description in endpoints:
        result = test_endpoint(url, method, data, description)
        print(f"  {method} {url.split('/api/')[-1]}: {result}")
        
        if "✅" in result:
            working_endpoints += 1
        
        # Pequeña pausa para no sobrecargar el servidor
        time.sleep(0.1)
    
    print()
    print("=" * 60)
    print("📊 RESUMEN")
    print("=" * 60)
    print(f"   Endpoints funcionando: {working_endpoints}/{total_endpoints}")
    
    if working_endpoints > 0:
        print("✅ El backend está funcionando correctamente")
        print()
        print("🎯 Endpoints críticos para el chatbot:")
        print("   - POST /api/appointments/visitor (Crear cita de visitante)")
        print("   - GET /api/appointments/visitor (Listar citas)")
        print()
        print("💡 El chatbot debería poder crear citas ahora")
    else:
        print("❌ El backend no está respondiendo correctamente")
        print("   Verifica que el servidor esté ejecutándose en el puerto 3000")

if __name__ == "__main__":
    main() 