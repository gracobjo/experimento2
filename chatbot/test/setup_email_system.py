#!/usr/bin/env python3
"""
Script de configuración rápida para el sistema de correos
"""

import os
import shutil
from pathlib import Path

def setup_email_configuration():
    """Configura el sistema de correos"""
    
    print("🔧 CONFIGURACIÓN DEL SISTEMA DE CORREOS")
    print("=" * 50)
    print()
    
    # Verificar si existe el archivo .env
    backend_env_path = Path("../backend/.env")
    env_example_path = Path("../backend/env.example")
    
    if not backend_env_path.exists():
        if env_example_path.exists():
            print("📋 Creando archivo .env desde env.example...")
            shutil.copy(env_example_path, backend_env_path)
            print("✅ Archivo .env creado")
        else:
            print("❌ No se encontró env.example")
            return False
    else:
        print("✅ Archivo .env ya existe")
    
    print()
    print("📧 CONFIGURACIÓN DE GMAIL")
    print("-" * 30)
    print()
    print("Para configurar Gmail, sigue estos pasos:")
    print()
    print("1️⃣ Habilitar autenticación de 2 factores:")
    print("   • Ve a tu cuenta de Google")
    print("   • Activa la verificación en 2 pasos")
    print()
    print("2️⃣ Generar contraseña de aplicación:")
    print("   • Ve a 'Contraseñas de aplicación'")
    print("   • Selecciona 'Otra' en el tipo de aplicación")
    print("   • Dale un nombre como 'Sistema Legal'")
    print("   • Copia la contraseña generada (16 caracteres)")
    print()
    print("3️⃣ Configurar variables en .env:")
    print("   • Abre experimento/backend/.env")
    print("   • Configura las siguientes variables:")
    print()
    print("   EMAIL_USER=\"tu-email@gmail.com\"")
    print("   EMAIL_PASSWORD=\"abcd efgh ijkl mnop\"  # Contraseña de aplicación")
    print("   ADMIN_EMAIL=\"admin@despachoabogados.com\"")
    print()
    
    # Verificar configuración actual
    print("🔍 CONFIGURACIÓN ACTUAL")
    print("-" * 30)
    
    if backend_env_path.exists():
        with open(backend_env_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        email_user = None
        email_password = None
        admin_email = None
        
        for line in content.split('\n'):
            if line.startswith('EMAIL_USER='):
                email_user = line.split('=')[1].strip('"')
            elif line.startswith('EMAIL_PASSWORD='):
                email_password = line.split('=')[1].strip('"')
            elif line.startswith('ADMIN_EMAIL='):
                admin_email = line.split('=')[1].strip('"')
        
        print(f"   EMAIL_USER: {'✅ ' + email_user if email_user and email_user != 'tu-email@gmail.com' else '❌ No configurado'}")
        print(f"   EMAIL_PASSWORD: {'✅ Configurado' if email_password and email_password != 'tu-password-de-aplicacion-gmail' else '❌ No configurado'}")
        print(f"   ADMIN_EMAIL: {'✅ ' + admin_email if admin_email and admin_email != 'admin@despachoabogados.com' else '❌ No configurado'}")
        
        if all([email_user, email_password, admin_email]) and \
           email_user != 'tu-email@gmail.com' and \
           email_password != 'tu-password-de-aplicacion-gmail' and \
           admin_email != 'admin@despachoabogados.com':
            print()
            print("✅ Configuración completa")
            return True
        else:
            print()
            print("⚠️  Configuración incompleta")
            return False
    else:
        print("❌ Archivo .env no encontrado")
        return False

def create_test_script():
    """Crea un script de prueba personalizado"""
    
    print()
    print("🧪 CREANDO SCRIPT DE PRUEBA")
    print("-" * 30)
    
    test_email = input("Ingresa tu email para las pruebas: ").strip()
    
    if not test_email or '@' not in test_email:
        print("❌ Email inválido")
        return
    
    # Crear archivo .env para el chatbot con la configuración de prueba
    chatbot_env_path = Path(".env")
    
    env_content = f"""# Configuración de prueba para el sistema de correos
BACKEND_URL=http://localhost:3000
TEST_EMAIL={test_email}
"""
    
    with open(chatbot_env_path, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    print(f"✅ Archivo .env creado con email de prueba: {test_email}")
    print()
    print("🚀 Para ejecutar las pruebas:")
    print("   python test_email_system.py")

def main():
    """Función principal"""
    
    print("=" * 60)
    print("📧 CONFIGURACIÓN DEL SISTEMA DE CORREOS")
    print("=" * 60)
    print()
    
    # Configurar sistema de correos
    if setup_email_configuration():
        print()
        print("✅ Sistema de correos configurado correctamente")
        print()
        
        # Preguntar si quiere crear script de prueba
        response = input("¿Quieres crear un script de prueba? (s/n): ").strip().lower()
        if response in ['s', 'si', 'sí', 'y', 'yes']:
            create_test_script()
        
        print()
        print("🎯 PRÓXIMOS PASOS:")
        print("   1. Inicia el backend: cd ../backend && npm run start:dev")
        print("   2. Ejecuta las pruebas: python test_email_system.py")
        print("   3. Verifica que lleguen los correos")
        print()
        print("📚 Documentación:")
        print("   • experimento/EMAIL_CONFIGURATION.md")
        print("   • experimento/EMAIL_IMPLEMENTATION_SUMMARY.md")
        
    else:
        print()
        print("❌ Configuración incompleta")
        print()
        print("🔧 Para completar la configuración:")
        print("   1. Sigue los pasos de configuración de Gmail")
        print("   2. Edita experimento/backend/.env")
        print("   3. Ejecuta este script nuevamente")
        print()
        print("📚 Más información:")
        print("   • experimento/EMAIL_CONFIGURATION.md")

if __name__ == "__main__":
    main() 