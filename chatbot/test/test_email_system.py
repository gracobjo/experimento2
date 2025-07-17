#!/usr/bin/env python3
"""
Script de prueba para el sistema de correos de confirmación de citas
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
TEST_EMAIL = os.getenv("TEST_EMAIL", "test@example.com")

def test_appointment_creation():
    """Prueba la creación de una cita y el envío de correos"""
    
    # Datos de prueba para la cita
    appointment_data = {
        "fullName": "Juan Pérez García",
        "age": 35,
        "phone": "+34 612 345 678",
        "email": TEST_EMAIL,
        "consultationReason": "Divorcio y custodia de hijos",
        "preferredDate": (datetime.now() + timedelta(days=7)).isoformat(),
        "alternativeDate": (datetime.now() + timedelta(days=10)).isoformat(),
        "consultationType": "Derecho Familiar",
        "notes": "Cliente nuevo, primera consulta",
        "location": "Oficina principal"
    }
    
    print("🧪 Iniciando prueba del sistema de correos...")
    print(f"📧 Email de prueba: {TEST_EMAIL}")
    print(f"🔗 Backend URL: {BACKEND_URL}")
    print()
    
    try:
        # Crear la cita
        print("1️⃣ Creando cita de visitante...")
        response = requests.post(
            f"{BACKEND_URL}/api/appointments/visitor",
            json=appointment_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 201:
            appointment = response.json()
            print(f"✅ Cita creada exitosamente")
            print(f"   ID: {appointment['id']}")
            print(f"   Estado: {appointment['status']}")
            print(f"   Fecha: {appointment['preferredDate']}")
            print()
            
            # Verificar que la cita existe en la base de datos
            print("2️⃣ Verificando cita en la base de datos...")
            get_response = requests.get(
                f"{BACKEND_URL}/api/appointments/visitor/{appointment['id']}",
                headers={"Authorization": "Bearer admin-token"},  # Token de admin para pruebas
                timeout=10
            )
            
            if get_response.status_code == 200:
                print("✅ Cita encontrada en la base de datos")
            else:
                print(f"⚠️  No se pudo verificar la cita: {get_response.status_code}")
            
            print()
            print("📧 Verificando envío de correos...")
            print("   - Email de confirmación al visitante")
            print("   - Email de notificación a administradores")
            print()
            print("🔍 Revisa tu bandeja de entrada y spam para los correos")
            print(f"   Email: {TEST_EMAIL}")
            print()
            
            return appointment
            
        else:
            print(f"❌ Error creando cita: {response.status_code}")
            print(f"   Respuesta: {response.text}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se puede conectar al backend")
        print("   Asegúrate de que el backend esté ejecutándose en:", BACKEND_URL)
        return None
    except requests.exceptions.Timeout:
        print("❌ Error: Timeout al conectar con el backend")
        return None
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return None

def test_email_configuration():
    """Prueba la configuración del sistema de correos"""
    
    print("🔧 Verificando configuración de correos...")
    
    # Verificar variables de entorno
    email_user = os.getenv("EMAIL_USER")
    email_password = os.getenv("EMAIL_PASSWORD")
    admin_email = os.getenv("ADMIN_EMAIL")
    
    print(f"   EMAIL_USER: {'✅ Configurado' if email_user else '❌ No configurado'}")
    print(f"   EMAIL_PASSWORD: {'✅ Configurado' if email_password else '❌ No configurado'}")
    print(f"   ADMIN_EMAIL: {'✅ Configurado' if admin_email else '❌ No configurado'}")
    
    if not all([email_user, email_password, admin_email]):
        print()
        print("⚠️  Configuración incompleta. Para configurar:")
        print("   1. Copia experimento/backend/env.example a experimento/backend/.env")
        print("   2. Configura EMAIL_USER, EMAIL_PASSWORD y ADMIN_EMAIL")
        print("   3. Para Gmail, usa una contraseña de aplicación")
        return False
    
    print("✅ Configuración de correos completa")
    return True

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

def main():
    """Función principal de pruebas"""
    
    print("=" * 60)
    print("🧪 PRUEBA DEL SISTEMA DE CORREOS DE CONFIRMACIÓN")
    print("=" * 60)
    print()
    
    # Verificar configuración
    if not test_email_configuration():
        print()
        print("❌ Configuración incompleta. No se pueden ejecutar las pruebas.")
        return
    
    print()
    
    # Verificar salud del backend
    if not test_backend_health():
        print()
        print("❌ Backend no disponible. Inicia el backend primero:")
        print("   cd experimento/backend")
        print("   npm run start:dev")
        return
    
    print()
    
    # Probar creación de cita
    appointment = test_appointment_creation()
    
    if appointment:
        print("=" * 60)
        print("✅ PRUEBA COMPLETADA EXITOSAMENTE")
        print("=" * 60)
        print()
        print("📋 Resumen:")
        print(f"   • Cita creada: {appointment['id']}")
        print(f"   • Visitante: {appointment['fullName']}")
        print(f"   • Email: {appointment['email']}")
        print(f"   • Estado: {appointment['status']}")
        print()
        print("📧 Verifica que hayas recibido:")
        print("   1. Email de confirmación al visitante")
        print("   2. Email de notificación a administradores")
        print()
        print("🔍 Si no recibes los correos:")
        print("   • Revisa la carpeta de spam")
        print("   • Verifica la configuración de Gmail")
        print("   • Revisa los logs del backend")
    else:
        print("=" * 60)
        print("❌ PRUEBA FALLIDA")
        print("=" * 60)
        print()
        print("🔧 Solución de problemas:")
        print("   1. Verifica que el backend esté ejecutándose")
        print("   2. Revisa la configuración de correos")
        print("   3. Verifica las variables de entorno")
        print("   4. Revisa los logs del backend")

if __name__ == "__main__":
    main() 