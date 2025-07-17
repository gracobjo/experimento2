#!/usr/bin/env python3
"""
Script de inicio rápido para probar el sistema de correos de confirmación de citas
"""

import os
import sys
import subprocess
import time
import requests
from pathlib import Path

def check_python_dependencies():
    """Verifica que las dependencias de Python estén instaladas"""
    
    print("🔍 Verificando dependencias de Python...")
    
    required_packages = ['requests', 'python-dotenv']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Faltan dependencias: {', '.join(missing_packages)}")
        print("📦 Instalando dependencias...")
        
        try:
            subprocess.run([sys.executable, '-m', 'pip', 'install'] + missing_packages, check=True)
            print("✅ Dependencias instaladas")
        except subprocess.CalledProcessError:
            print("❌ Error instalando dependencias")
            return False
    else:
        print("✅ Todas las dependencias están instaladas")
    
    return True

def check_backend_status():
    """Verifica si el backend está ejecutándose"""
    
    print("🏥 Verificando estado del backend...")
    
    try:
        response = requests.get("http://localhost:3000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend ejecutándose correctamente")
            return True
        else:
            print(f"⚠️  Backend respondió con código: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Backend no está ejecutándose")
        return False
    except Exception as e:
        print(f"❌ Error verificando backend: {e}")
        return False

def check_chatbot_status():
    """Verifica si el chatbot está ejecutándose"""
    
    print("🤖 Verificando estado del chatbot...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Chatbot ejecutándose correctamente")
            return True
        else:
            print(f"⚠️  Chatbot respondió con código: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Chatbot no está ejecutándose")
        return False
    except Exception as e:
        print(f"❌ Error verificando chatbot: {e}")
        return False

def start_backend():
    """Inicia el backend"""
    
    print("🚀 Iniciando backend...")
    print("   Esto puede tomar unos segundos...")
    
    backend_path = Path("../backend")
    if not backend_path.exists():
        print("❌ Directorio del backend no encontrado")
        return False
    
    try:
        # Cambiar al directorio del backend
        os.chdir(backend_path)
        
        # Verificar si node_modules existe
        if not Path("node_modules").exists():
            print("📦 Instalando dependencias del backend...")
            subprocess.run(["npm", "install"], check=True)
        
        # Iniciar el backend en segundo plano
        print("🔄 Iniciando servidor de desarrollo...")
        process = subprocess.Popen(["npm", "run", "start:dev"], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        
        # Esperar a que el backend esté listo
        print("⏳ Esperando a que el backend esté listo...")
        for i in range(30):  # Esperar máximo 30 segundos
            time.sleep(1)
            if check_backend_status():
                print("✅ Backend iniciado correctamente")
                return True
        
        print("❌ Timeout esperando el backend")
        return False
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error iniciando backend: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False
    finally:
        # Volver al directorio original
        os.chdir(Path("."))

def start_chatbot():
    """Inicia el chatbot"""
    
    print("🤖 Iniciando chatbot...")
    
    try:
        # Verificar si main_improved.py existe
        if not Path("main_improved.py").exists():
            print("❌ main_improved.py no encontrado")
            return False
        
        # Iniciar el chatbot en segundo plano
        process = subprocess.Popen([sys.executable, "main_improved.py"], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        
        # Esperar a que el chatbot esté listo
        print("⏳ Esperando a que el chatbot esté listo...")
        for i in range(15):  # Esperar máximo 15 segundos
            time.sleep(1)
            if check_chatbot_status():
                print("✅ Chatbot iniciado correctamente")
                return True
        
        print("❌ Timeout esperando el chatbot")
        return False
        
    except Exception as e:
        print(f"❌ Error iniciando chatbot: {e}")
        return False

def run_email_tests():
    """Ejecuta las pruebas de correos"""
    
    print("🧪 Ejecutando pruebas de correos...")
    
    # Verificar que existe el script de prueba
    if not Path("test_email_system.py").exists():
        print("❌ test_email_system.py no encontrado")
        return False
    
    try:
        # Ejecutar prueba directa
        print("📧 Ejecutando prueba directa del sistema de correos...")
        result = subprocess.run([sys.executable, "test_email_system.py"], 
                              capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("Errores:", result.stderr)
        
        if result.returncode == 0:
            print("✅ Prueba directa completada")
        else:
            print("❌ Prueba directa falló")
            return False
        
        # Ejecutar prueba del chatbot
        print("🤖 Ejecutando prueba del chatbot...")
        result = subprocess.run([sys.executable, "test_chatbot_email.py"], 
                              capture_output=True, text=True)
        
        print(result.stdout)
        if result.stderr:
            print("Errores:", result.stderr)
        
        if result.returncode == 0:
            print("✅ Prueba del chatbot completada")
            return True
        else:
            print("❌ Prueba del chatbot falló")
            return False
            
    except Exception as e:
        print(f"❌ Error ejecutando pruebas: {e}")
        return False

def main():
    """Función principal"""
    
    print("=" * 70)
    print("🚀 INICIO RÁPIDO - SISTEMA DE CORREOS DE CONFIRMACIÓN")
    print("=" * 70)
    print()
    
    # Verificar dependencias
    if not check_python_dependencies():
        print("❌ No se pudieron instalar las dependencias")
        return
    
    print()
    
    # Verificar estado actual
    backend_running = check_backend_status()
    chatbot_running = check_chatbot_status()
    
    print()
    
    # Iniciar servicios si es necesario
    if not backend_running:
        if not start_backend():
            print("❌ No se pudo iniciar el backend")
            print("💡 Inicia manualmente: cd ../backend && npm run start:dev")
            return
        print()
    
    if not chatbot_running:
        if not start_chatbot():
            print("❌ No se pudo iniciar el chatbot")
            print("💡 Inicia manualmente: python main_improved.py")
            return
        print()
    
    # Ejecutar pruebas
    print("🎯 Todo listo, ejecutando pruebas...")
    print()
    
    if run_email_tests():
        print("=" * 70)
        print("✅ TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE")
        print("=" * 70)
        print()
        print("📧 Verifica que hayas recibido los correos:")
        print("   • Email de confirmación al visitante")
        print("   • Email de notificación a administradores")
        print()
        print("🔍 Si no recibes los correos:")
        print("   • Revisa la carpeta de spam")
        print("   • Verifica la configuración de Gmail")
        print("   • Ejecuta: python setup_email_system.py")
        print()
        print("🎯 Próximos pasos:")
        print("   • Confirma una cita desde el panel de administración")
        print("   • Personaliza las plantillas de email")
        print("   • Configura el sistema para producción")
    else:
        print("=" * 70)
        print("❌ ALGUNAS PRUEBAS FALLARON")
        print("=" * 70)
        print()
        print("🔧 Solución de problemas:")
        print("   1. Verifica la configuración de correos: python setup_email_system.py")
        print("   2. Revisa los logs del backend y chatbot")
        print("   3. Verifica que las variables de entorno estén configuradas")
        print("   4. Consulta la documentación: README_EMAIL_TESTING.md")

if __name__ == "__main__":
    main() 