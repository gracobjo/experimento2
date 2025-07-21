import requests
import json
import time

def test_session_cleanup():
    """Probar la limpieza de sesiones y evitar saltos en el flujo"""
    base_url = "http://localhost:8000"
    
    print("🧹 Probando limpieza de sesiones y flujo correcto...\n")
    
    # Test 1: Verificar que no hay datos de sesiones anteriores
    print("1️⃣ Verificando estado inicial...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            active_sessions = data.get('active_sessions', 0)
            print(f"   📊 Sesiones activas: {active_sessions}")
            if active_sessions == 0:
                print("   ✅ No hay sesiones activas (correcto)")
            else:
                print("   ⚠️  Hay sesiones activas al inicio")
        else:
            print(f"   ❌ Error: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 2: Simular el flujo problemático
    print("\n2️⃣ Probando flujo problemático...")
    user_id = "test_session_user"
    
    problematic_flow = [
        ("hola", "Saludo inicial"),
        ("jj", "Respuesta corta que debería mostrar menú"),
        ("He seleccionado: Miércoles 23 de Julio a las 16:00", "Texto que simula selección de fecha")
    ]
    
    for i, (text, description) in enumerate(problematic_flow, 1):
        print(f"\n   Paso {i}: '{text}' - {description}")
        try:
            response = requests.post(f"{base_url}/chat", json={
                "text": text,
                "language": "es",
                "user_id": user_id
            })
            
            if response.status_code == 200:
                data = response.json()
                bot_response = data['response']
                
                if i == 1:  # Saludo inicial
                    if "📋" in bot_response and "Opciones disponibles" in bot_response:
                        print(f"   ✅ Muestra menú principal")
                    else:
                        print(f"   ❌ No muestra menú principal")
                
                elif i == 2:  # Respuesta corta
                    if "Para ayudarte mejor" in bot_response and "📋" in bot_response:
                        print(f"   ✅ Muestra menú (no inicia flujo de citas)")
                    elif "nombre completo" in bot_response:
                        print(f"   ❌ ERROR: Inició flujo de citas sin validación")
                    else:
                        print(f"   ⚠️  Respuesta inesperada")
                
                elif i == 3:  # Texto de fecha
                    if "Para agendar una cita, primero necesito" in bot_response:
                        print(f"   ✅ Detecta texto de fecha y pide datos primero")
                    elif "nombre completo" in bot_response:
                        print(f"   ❌ ERROR: Saltó al flujo de citas sin validación")
                    else:
                        print(f"   ⚠️  Respuesta inesperada")
                
                print(f"   💬 Respuesta: {bot_response[:100]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
    
    # Test 3: Verificar que no hay conversación activa después del flujo
    print("\n3️⃣ Verificando estado después del flujo...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            active_sessions = data.get('active_sessions', 0)
            print(f"   📊 Sesiones activas después del flujo: {active_sessions}")
        else:
            print(f"   ❌ Error: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")

def test_proper_appointment_flow():
    """Probar el flujo correcto de citas"""
    base_url = "http://localhost:8000"
    
    print("\n" + "="*60)
    print("📅 Probando flujo correcto de citas...\n")
    
    user_id = "test_proper_flow_user"
    
    proper_flow = [
        ("1", "Selección de opción 1 - Agendar cita"),
        ("Juan Pérez López", "Nombre completo válido"),
        ("25", "Edad válida"),
        ("612345678", "Teléfono válido"),
        ("juan@email.com", "Email válido"),
        ("Problema laboral", "Motivo válido"),
        ("4", "Selección de fecha"),
        ("sí", "Confirmación")
    ]
    
    for i, (text, description) in enumerate(proper_flow, 1):
        print(f"{i}️⃣ '{text}' - {description}")
        try:
            response = requests.post(f"{base_url}/chat", json={
                "text": text,
                "language": "es",
                "user_id": user_id
            })
            
            if response.status_code == 200:
                data = response.json()
                bot_response = data['response']
                
                if i == 1:  # Opción 1
                    if "nombre completo" in bot_response:
                        print(f"   ✅ Inicia flujo de citas correctamente")
                    else:
                        print(f"   ❌ No inicia flujo de citas")
                
                elif i == 2:  # Nombre
                    if "edad" in bot_response:
                        print(f"   ✅ Acepta nombre y pide edad")
                    else:
                        print(f"   ❌ No acepta nombre")
                
                elif i == 3:  # Edad
                    if "teléfono" in bot_response:
                        print(f"   ✅ Acepta edad y pide teléfono")
                    else:
                        print(f"   ❌ No acepta edad")
                
                elif i == 4:  # Teléfono
                    if "correo electrónico" in bot_response:
                        print(f"   ✅ Acepta teléfono y pide email")
                    else:
                        print(f"   ❌ No acepta teléfono")
                
                elif i == 5:  # Email
                    if "motivo" in bot_response:
                        print(f"   ✅ Acepta email y pide motivo")
                    else:
                        print(f"   ❌ No acepta email")
                
                elif i == 6:  # Motivo
                    if "fecha" in bot_response and "Opciones disponibles" in bot_response:
                        print(f"   ✅ Acepta motivo y muestra fechas")
                    else:
                        print(f"   ❌ No acepta motivo")
                
                elif i == 7:  # Fecha
                    if "confirmas" in bot_response:
                        print(f"   ✅ Acepta fecha y pide confirmación")
                    else:
                        print(f"   ❌ No acepta fecha")
                
                elif i == 8:  # Confirmación
                    if "confirmada" in bot_response and "Juan Pérez López" in bot_response:
                        print(f"   ✅ Confirma cita correctamente")
                    else:
                        print(f"   ❌ No confirma cita")
                
                print(f"   💬 Respuesta: {bot_response[:100]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")

def test_session_isolation():
    """Probar que las sesiones están aisladas"""
    base_url = "http://localhost:8000"
    
    print("\n" + "="*60)
    print("🔒 Probando aislamiento de sesiones...\n")
    
    # Usuario 1 inicia flujo de citas
    user1 = "test_user_1"
    print("👤 Usuario 1 inicia flujo de citas...")
    
    try:
        response = requests.post(f"{base_url}/chat", json={
            "text": "1",
            "language": "es",
            "user_id": user1
        })
        
        if response.status_code == 200:
            data = response.json()
            bot_response = data['response']
            if "nombre completo" in bot_response:
                print("   ✅ Usuario 1 inició flujo de citas")
            else:
                print("   ❌ Usuario 1 no inició flujo")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Usuario 2 saluda (no debería afectar a usuario 1)
    user2 = "test_user_2"
    print("\n👤 Usuario 2 saluda...")
    
    try:
        response = requests.post(f"{base_url}/chat", json={
            "text": "hola",
            "language": "es",
            "user_id": user2
        })
        
        if response.status_code == 200:
            data = response.json()
            bot_response = data['response']
            if "📋" in bot_response and "Opciones disponibles" in bot_response:
                print("   ✅ Usuario 2 recibe menú principal")
            else:
                print("   ❌ Usuario 2 no recibe menú")
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Usuario 1 continúa su flujo
    print("\n👤 Usuario 1 continúa su flujo...")
    
    try:
        response = requests.post(f"{base_url}/chat", json={
            "text": "María García López",
            "language": "es",
            "user_id": user1
        })
        
        if response.status_code == 200:
            data = response.json()
            bot_response = data['response']
            if "edad" in bot_response:
                print("   ✅ Usuario 1 puede continuar su flujo")
            else:
                print("   ❌ Usuario 1 no puede continuar")
        else:
            print(f"   ❌ Error: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    test_session_cleanup()
    test_proper_appointment_flow()
    test_session_isolation() 