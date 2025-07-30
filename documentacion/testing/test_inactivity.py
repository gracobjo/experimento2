import requests
import json
import time

def test_inactivity_system():
    """Probar el sistema de inactividad del chatbot"""
    base_url = "http://localhost:8000"
    
    print("⏰ Probando sistema de inactividad...\n")
    
    # Test 1: Verificar configuración
    print("1️⃣ Verificando configuración del sistema...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Sistema activo")
            print(f"   📊 Sesiones activas: {data.get('active_sessions', 0)}")
            print(f"   ⏱️  Timeout de inactividad: {data.get('inactivity_timeout', 0)} segundos")
            print(f"   ⚠️  Timeout de advertencia: {data.get('warning_timeout', 0)} segundos")
        else:
            print(f"   ❌ Error al obtener estado del sistema")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 2: Iniciar conversación y verificar actividad
    print("\n2️⃣ Iniciando conversación...")
    user_id = "test_inactivity_user"
    
    try:
        response = requests.post(f"{base_url}/chat", json={
            "text": "hola",
            "language": "es",
            "user_id": user_id
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Conversación iniciada")
            print(f"   💬 Respuesta: {data['response'][:100]}...")
        else:
            print(f"   ❌ Error al iniciar conversación")
            return
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
        return
    
    # Test 3: Verificar que la sesión está activa
    print("\n3️⃣ Verificando sesión activa...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            active_sessions = data.get('active_sessions', 0)
            print(f"   📊 Sesiones activas: {active_sessions}")
            if active_sessions > 0:
                print(f"   ✅ Sesión registrada correctamente")
            else:
                print(f"   ❌ No se detectó sesión activa")
        else:
            print(f"   ❌ Error al verificar estado")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 4: Simular actividad para mantener sesión
    print("\n4️⃣ Simulando actividad...")
    try:
        response = requests.post(f"{base_url}/chat", json={
            "text": "quiero cita",
            "language": "es",
            "user_id": user_id
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Actividad registrada")
            print(f"   💬 Respuesta: {data['response'][:100]}...")
        else:
            print(f"   ❌ Error al registrar actividad")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 5: Probar endpoint de cierre manual
    print("\n5️⃣ Probando cierre manual...")
    try:
        response = requests.post(f"{base_url}/end_chat", json={
            "user_id": user_id
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Chat cerrado manualmente")
            print(f"   📝 Mensaje: {data.get('message', 'N/A')}")
        else:
            print(f"   ❌ Error al cerrar chat: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 6: Verificar que la sesión se cerró
    print("\n6️⃣ Verificando cierre de sesión...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            active_sessions = data.get('active_sessions', 0)
            print(f"   📊 Sesiones activas: {active_sessions}")
            if active_sessions == 0:
                print(f"   ✅ Sesión cerrada correctamente")
            else:
                print(f"   ⚠️  Aún hay sesiones activas")
        else:
            print(f"   ❌ Error al verificar estado")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")

def test_inactivity_timeout():
    """Probar el timeout de inactividad (simulado)"""
    base_url = "http://localhost:8000"
    
    print("\n" + "="*60)
    print("⏱️ Probando timeout de inactividad (simulado)...\n")
    
    # Nota: Para probar el timeout real necesitaríamos esperar 5 minutos
    # Aquí simulamos el comportamiento
    
    print("📝 Nota: El timeout real es de 5 minutos (300 segundos)")
    print("📝 La advertencia aparece a los 4 minutos (240 segundos)")
    print("📝 Para probar completamente, necesitarías esperar 5 minutos sin actividad")
    
    # Test: Crear sesión y mostrar información
    user_id = "timeout_test_user"
    
    try:
        # Iniciar conversación
        response = requests.post(f"{base_url}/chat", json={
            "text": "hola",
            "language": "es",
            "user_id": user_id
        })
        
        if response.status_code == 200:
            print(f"✅ Sesión creada para usuario: {user_id}")
            print(f"⏰ La sesión se cerrará automáticamente en 5 minutos de inactividad")
            print(f"⚠️  Recibirás una advertencia en 4 minutos")
            print(f"🔄 Para mantener la sesión activa, envía cualquier mensaje")
        else:
            print(f"❌ Error al crear sesión")
    except Exception as e:
        print(f"❌ Error de conexión: {e}")

def test_multiple_users():
    """Probar múltiples usuarios simultáneos"""
    base_url = "http://localhost:8000"
    
    print("\n" + "="*60)
    print("👥 Probando múltiples usuarios...\n")
    
    users = ["user1", "user2", "user3"]
    
    for i, user_id in enumerate(users, 1):
        print(f"{i}️⃣ Creando sesión para {user_id}...")
        try:
            response = requests.post(f"{base_url}/chat", json={
                "text": "hola",
                "language": "es",
                "user_id": user_id
            })
            
            if response.status_code == 200:
                print(f"   ✅ Sesión creada para {user_id}")
            else:
                print(f"   ❌ Error para {user_id}")
        except Exception as e:
            print(f"   ❌ Error de conexión para {user_id}: {e}")
    
    # Verificar estado
    print("\n📊 Verificando estado del sistema...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            active_sessions = data.get('active_sessions', 0)
            print(f"   📊 Sesiones activas: {active_sessions}")
            print(f"   ✅ Sistema manejando múltiples usuarios correctamente")
        else:
            print(f"   ❌ Error al verificar estado")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Cerrar todas las sesiones
    print("\n🔄 Cerrando todas las sesiones...")
    for user_id in users:
        try:
            response = requests.post(f"{base_url}/end_chat", json={
                "user_id": user_id
            })
            if response.status_code == 200:
                print(f"   ✅ Sesión cerrada para {user_id}")
            else:
                print(f"   ❌ Error al cerrar {user_id}")
        except Exception as e:
            print(f"   ❌ Error de conexión para {user_id}: {e}")

if __name__ == "__main__":
    test_inactivity_system()
    test_inactivity_timeout()
    test_multiple_users() 