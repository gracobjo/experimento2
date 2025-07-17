#!/usr/bin/env python3
"""
Script para verificar qué servicios están ejecutándose en diferentes puertos
"""

import requests
import socket
import subprocess
import sys
import os

def check_port(host, port):
    """Verifica si un puerto está abierto"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except:
        return False

def check_service_on_port(host, port, service_name):
    """Verifica si hay un servicio HTTP en un puerto"""
    if check_port(host, port):
        try:
            response = requests.get(f"http://{host}:{port}", timeout=3)
            print(f"✅ Puerto {port}: {service_name} - Status: {response.status_code}")
            return True
        except requests.exceptions.RequestException as e:
            print(f"⚠️ Puerto {port}: {service_name} - Puerto abierto pero no responde HTTP")
            return False
    else:
        print(f"❌ Puerto {port}: {service_name} - No disponible")
        return False

def check_backend_common_ports():
    """Verifica puertos comunes donde puede estar el backend"""
    print("🔍 Verificando puertos comunes del backend...")
    
    ports_to_check = [
        (3000, "Backend (puerto por defecto)"),
        (3001, "Backend (puerto alternativo)"),
        (8000, "Chatbot"),
        (8001, "Chatbot (puerto alternativo)"),
        (4000, "Backend (puerto alternativo)"),
        (5000, "Backend (puerto alternativo)"),
        (8080, "Backend (puerto alternativo)"),
        (9000, "Backend (puerto alternativo)")
    ]
    
    found_services = []
    
    for port, service_name in ports_to_check:
        if check_service_on_port("localhost", port, service_name):
            found_services.append((port, service_name))
    
    return found_services

def check_processes():
    """Verifica qué procesos están ejecutándose"""
    print("\n🔍 Verificando procesos ejecutándose...")
    
    try:
        # En Windows
        if os.name == 'nt':
            result = subprocess.run(['tasklist'], capture_output=True, text=True)
            processes = result.stdout.lower()
            
            # Buscar procesos relacionados
            keywords = ['node', 'npm', 'yarn', 'python', 'uvicorn', 'fastapi']
            for keyword in keywords:
                if keyword in processes:
                    print(f"✅ Proceso encontrado: {keyword}")
                else:
                    print(f"❌ Proceso no encontrado: {keyword}")
        else:
            # En Linux/Mac
            result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
            processes = result.stdout.lower()
            
            keywords = ['node', 'npm', 'yarn', 'python', 'uvicorn', 'fastapi']
            for keyword in keywords:
                if keyword in processes:
                    print(f"✅ Proceso encontrado: {keyword}")
                else:
                    print(f"❌ Proceso no encontrado: {keyword}")
                    
    except Exception as e:
        print(f"❌ Error verificando procesos: {e}")

def main():
    """Función principal"""
    print("🚀 VERIFICACIÓN DE SERVICIOS")
    print("=" * 50)
    
    # Verificar puertos
    found_services = check_backend_common_ports()
    
    # Verificar procesos
    check_processes()
    
    # Resumen
    print("\n" + "=" * 50)
    print("📊 RESUMEN")
    print("=" * 50)
    
    if found_services:
        print("✅ Servicios encontrados:")
        for port, service_name in found_services:
            print(f"   - {service_name} en puerto {port}")
    else:
        print("❌ No se encontraron servicios ejecutándose")
    
    print("\n💡 RECOMENDACIONES:")
    print("=" * 50)
    print("1. Si no hay servicios, inicia el backend:")
    print("   cd ../backend")
    print("   npm run start:dev")
    print("   # o")
    print("   yarn start:dev")
    print("\n2. Si el backend está en otro puerto, actualiza la variable BACKEND_URL")
    print("   en el archivo .env del chatbot")
    print("\n3. Verifica que el backend esté configurado correctamente")

if __name__ == "__main__":
    main() 