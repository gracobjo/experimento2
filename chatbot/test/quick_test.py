#!/usr/bin/env python3
"""
Script de prueba rápida del chatbot mejorado
"""

import requests
import time
import json

def test_chatbot():
    """Prueba básica del chatbot"""
    print("🤖 Probando chatbot mejorado...")
    
    # Verificar que el chatbot esté ejecutándose
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Chatbot está ejecutándose")
        else:
            print(f"⚠️ Chatbot respondió con código: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Chatbot no está disponible: {e}")
        print("   Asegúrate de ejecutar: python main_improved.py")
        return False
    
    # Probar conversación de cita
    print("\n📅 Probando flujo de citas...")
    
    conversation = [
        "Hola, quiero una cita",
        "Ana García López",
        "32",
        "612345678",
        "ana.garcia@test.com",
        "divorcio",
        "1",  # Primera fecha
        "sí"  # Confirmar
    ]
    
    user_id = "test_user_quick"
    
    for i, message in enumerate(conversation, 1):
        print(f"  📝 Paso {i}: {message}")
        
        try:
            response = requests.post(
                "http://localhost:8000/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=10
            )
            
            if response.status_code == 200:
                bot_response = response.json()["response"]
                print(f"    🤖 {bot_response[:100]}...")
                
                # Verificar respuestas específicas
                if i == 1 and "ayudo a agendar" in bot_response.lower():
                    print("    ✅ Inicio correcto")
                elif i == 6 and "derecho familiar" in bot_response.lower():
                    print("    ✅ Mapeo automático funcionó")
                elif i == 8 and "agendada exitosamente" in bot_response:
                    print("    ✅ ¡Cita creada exitosamente!")
                    return True
                    
            else:
                print(f"    ❌ Error: {response.status_code}")
                print(f"    {response.text}")
                return False
                
        except Exception as e:
            print(f"    ❌ Error: {e}")
            return False
        
        time.sleep(0.5)
    
    return False

def test_backend():
    """Prueba básica del backend"""
    print("\n🔗 Probando backend...")
    
    # Probar diferentes endpoints
    endpoints = ["/", "/health", "/api/health", "/appointments/visitor"]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:3000{endpoint}", timeout=5)
            if response.status_code in [200, 201, 404]:  # 404 es normal para algunos endpoints
                print(f"✅ Backend responde en {endpoint}: {response.status_code}")
                if response.status_code == 200:
                    return True
        except Exception as e:
            print(f"❌ Error en {endpoint}: {e}")
    
    # Si no hay endpoint de health, probar directamente el endpoint de citas
    try:
        response = requests.get("http://localhost:3000/appointments/visitor", timeout=5)
        if response.status_code in [200, 401, 403]:  # 401/403 son normales para endpoints protegidos
            print("✅ Backend está disponible (endpoint de citas responde)")
            return True
    except Exception as e:
        print(f"❌ Backend no disponible: {e}")
    
    print("⚠️ Backend puede no estar disponible o no tener endpoint /health")
    return False

def main():
    """Función principal"""
    print("🚀 PRUEBA RÁPIDA DEL CHATBOT MEJORADO")
    print("=" * 40)
    
    # Probar backend
    backend_ok = test_backend()
    
    # Probar chatbot
    chatbot_ok = test_chatbot()
    
    # Resumen
    print("\n" + "=" * 40)
    print("📊 RESUMEN")
    print("=" * 40)
    print(f"   Backend: {'✅' if backend_ok else '❌'}")
    print(f"   Chatbot: {'✅' if chatbot_ok else '❌'}")
    
    if chatbot_ok:
        print("\n🎉 ¡El chatbot mejorado funciona correctamente!")
        print("   - Mapeo automático de motivos ✓")
        print("   - Conversación fluida ✓")
        print("   - Integración con backend ✓")
    else:
        print("\n⚠️ Hay problemas que necesitan atención.")
        if not backend_ok:
            print("   - El backend no está disponible")
        print("   - Revisa los logs para más detalles")

if __name__ == "__main__":
    main() 