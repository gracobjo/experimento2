#!/usr/bin/env python3
"""
Script detallado para diagnosticar problemas del backend
"""

import requests
import json
import subprocess
import os
import sys

def check_backend_process():
    """Verifica si el proceso del backend está ejecutándose"""
    print("🔍 Verificando proceso del backend...")
    
    try:
        # En Windows
        if os.name == 'nt':
            result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq node.exe'], 
                                  capture_output=True, text=True)
            if 'node.exe' in result.stdout:
                print("✅ Proceso Node.js encontrado")
                return True
            else:
                print("❌ No se encontró proceso Node.js")
                return False
        else:
            # En Linux/Mac
            result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
            if 'node' in result.stdout or 'npm' in result.stdout:
                print("✅ Proceso Node.js encontrado")
                return True
            else:
                print("❌ No se encontró proceso Node.js")
                return False
    except Exception as e:
        print(f"❌ Error verificando procesos: {e}")
        return False

def test_backend_endpoints():
    """Prueba endpoints específicos del backend"""
    print("\n🔗 Probando endpoints del backend...")
    
    base_url = "http://localhost:3000"
    
    # Endpoints a probar con métodos específicos
    endpoints = [
        ("GET", "/", "Página principal"),
        ("GET", "/health", "Health check"),
        ("GET", "/api/health", "API health check"),
        ("GET", "/api", "API docs"),
        ("GET", "/api/docs", "Swagger docs"),
        ("GET", "/appointments/visitor", "Visitor appointments"),
        ("POST", "/appointments/visitor", "Create visitor appointment"),
        ("GET", "/parametros/contact", "Contact parameters"),
        ("GET", "/cases", "Cases"),
        ("GET", "/invoices", "Invoices")
    ]
    
    working_endpoints = []
    
    for method, endpoint, description in endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{base_url}{endpoint}", timeout=5)
            else:
                # Para POST, enviar datos de prueba
                test_data = {
                    "fullName": "Test User",
                    "age": 30,
                    "phone": "612345678",
                    "email": "test@example.com",
                    "consultationReason": "Test",
                    "preferredDate": "2024-12-25T10:00:00.000Z",
                    "consultationType": "Derecho Civil"
                }
                response = requests.post(f"{base_url}{endpoint}", json=test_data, timeout=5)
            
            status = response.status_code
            print(f"  {method} {endpoint}: {status} - {description}")
            
            if status in [200, 201]:
                working_endpoints.append((method, endpoint, description))
                print(f"    ✅ Funcionando")
            elif status in [401, 403]:
                print(f"    ⚠️ Requiere autenticación")
            elif status == 404:
                print(f"    ❌ No encontrado")
            else:
                print(f"    ⚠️ Status inesperado: {status}")
                
        except requests.exceptions.ConnectionError:
            print(f"  {method} {endpoint}: ❌ Conexión rechazada - {description}")
        except Exception as e:
            print(f"  {method} {endpoint}: ❌ Error - {e}")
    
    return working_endpoints

def check_backend_config():
    """Verifica la configuración del backend"""
    print("\n⚙️ Verificando configuración del backend...")
    
    # Verificar archivo .env
    env_path = "../backend/.env"
    if os.path.exists(env_path):
        print("✅ Archivo .env encontrado")
        try:
            with open(env_path, 'r') as f:
                content = f.read()
                if 'DATABASE_URL' in content:
                    print("✅ DATABASE_URL configurado")
                else:
                    print("❌ DATABASE_URL no encontrado")
                if 'JWT_SECRET' in content:
                    print("✅ JWT_SECRET configurado")
                else:
                    print("❌ JWT_SECRET no encontrado")
                if 'PORT=3000' in content:
                    print("✅ Puerto 3000 configurado")
                else:
                    print("⚠️ Puerto no configurado o diferente")
        except Exception as e:
            print(f"❌ Error leyendo .env: {e}")
    else:
        print("❌ Archivo .env no encontrado")
    
    # Verificar package.json
    package_path = "../backend/package.json"
    if os.path.exists(package_path):
        print("✅ package.json encontrado")
        try:
            with open(package_path, 'r') as f:
                data = json.load(f)
                if 'scripts' in data and 'start:dev' in data['scripts']:
                    print("✅ Script start:dev encontrado")
                else:
                    print("❌ Script start:dev no encontrado")
        except Exception as e:
            print(f"❌ Error leyendo package.json: {e}")
    else:
        print("❌ package.json no encontrado")

def suggest_solutions(working_endpoints):
    """Sugiere soluciones basadas en los resultados"""
    print("\n💡 RECOMENDACIONES:")
    print("=" * 50)
    
    if not working_endpoints:
        print("❌ No hay endpoints funcionando")
        print("\n🔧 SOLUCIONES:")
        print("1. Verificar que el backend esté ejecutándose:")
        print("   cd ../backend")
        print("   npm run start:dev")
        print("\n2. Verificar que no haya errores en la consola del backend")
        print("\n3. Verificar que la base de datos esté conectada:")
        print("   cd ../backend")
        print("   npx prisma db push")
        print("\n4. Verificar variables de entorno:")
        print("   - DATABASE_URL configurado")
        print("   - JWT_SECRET configurado")
        print("   - PORT=3000")
    else:
        print(f"✅ {len(working_endpoints)} endpoints funcionando")
        print("\n🎯 Endpoints disponibles:")
        for method, endpoint, description in working_endpoints:
            print(f"   - {method} {endpoint} ({description})")
        
        # Verificar si el endpoint de citas funciona
        visitor_endpoint_works = any(
            endpoint == "/appointments/visitor" for _, endpoint, _ in working_endpoints
        )
        
        if visitor_endpoint_works:
            print("\n✅ El endpoint de citas está funcionando")
            print("   El chatbot debería poder crear citas")
        else:
            print("\n⚠️ El endpoint de citas no está funcionando")
            print("   El chatbot no podrá crear citas")

def main():
    """Función principal"""
    print("🔍 DIAGNÓSTICO DETALLADO DEL BACKEND")
    print("=" * 50)
    
    # Verificar proceso
    process_running = check_backend_process()
    
    # Verificar configuración
    check_backend_config()
    
    # Probar endpoints
    working_endpoints = test_backend_endpoints()
    
    # Sugerir soluciones
    suggest_solutions(working_endpoints)
    
    print("\n" + "=" * 50)
    print("📊 RESUMEN")
    print("=" * 50)
    print(f"   Proceso ejecutándose: {'✅' if process_running else '❌'}")
    print(f"   Endpoints funcionando: {len(working_endpoints)}")
    
    if working_endpoints:
        print("✅ El backend está parcialmente funcionando")
    else:
        print("❌ El backend no está funcionando correctamente")

if __name__ == "__main__":
    main() 