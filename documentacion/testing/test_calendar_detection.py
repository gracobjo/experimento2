import requests
import json
import time

def test_calendar_detection():
    """Test para verificar que el calendario no se muestre con el menú principal"""
    
    base_url = "http://localhost:8000"
    test_user = "test_calendar_detection_user"
    
    print("🧪 **Test: Detección de calendario vs menú principal**")
    print("=" * 60)
    
    # Limpiar sesión
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
        time.sleep(0.1)
    except:
        pass
    
    # Test 1: Enviar "JJ" y verificar que NO active el calendario
    print("\n📝 **Test 1: Enviar 'JJ' (no debe activar calendario)**")
    
    response = requests.post(f"{base_url}/chat", json={
        "text": "JJ",
        "user_id": test_user
    })
    
    result = response.json()
    response_text = result.get("response", "")
    
    print(f"📤 Enviado: 'JJ'")
    print(f"📥 Respuesta: {response_text[:200]}...")
    
    # Verificar que contenga el menú principal pero NO la solicitud específica de fecha
    if "¿En qué puedo ayudarte?" in response_text and "Opciones disponibles" in response_text:
        if "¿Qué fecha prefieres para tu consulta?" not in response_text:
            print("✅ **CORRECTO: Se mostró el menú principal sin activar calendario**")
        else:
            print("❌ **ERROR: Se activó el calendario incorrectamente**")
            return False
    else:
        print("❌ **ERROR: No se mostró el menú principal**")
        return False
    
    # Test 2: Enviar "1" para iniciar flujo de citas
    print("\n📝 **Test 2: Enviar '1' para iniciar flujo de citas**")
    
    response2 = requests.post(f"{base_url}/chat", json={
        "text": "1",
        "user_id": test_user
    })
    
    result2 = response2.json()
    response_text2 = result2.get("response", "")
    
    print(f"📤 Enviado: '1'")
    print(f"📥 Respuesta: {response_text2[:200]}...")
    
    if "nombre completo" in response_text2.lower():
        print("✅ **CORRECTO: Se inició el flujo de citas**")
    else:
        print("❌ **ERROR: No se inició el flujo de citas**")
        return False
    
    # Test 3: Completar el flujo hasta llegar a la selección de fecha
    print("\n📝 **Test 3: Completar flujo hasta selección de fecha**")
    
    test_data = [
        ("Juan Pérez López", "nombre"),
        ("25", "edad"),
        ("612345678", "teléfono"),
        ("juan@email.com", "email"),
        ("Problema laboral", "motivo")
    ]
    
    for text, step in test_data:
        response_step = requests.post(f"{base_url}/chat", json={
            "text": text,
            "user_id": test_user
        })
        
        result_step = response_step.json()
        response_text_step = result_step.get("response", "")
        
        print(f"📤 Enviado: '{text}' ({step})")
        print(f"📥 Respuesta: {response_text_step[:100]}...")
        
        if "❌" in response_text_step:
            print(f"❌ **ERROR en paso {step}**")
            return False
    
    # Test 4: Verificar que ahora sí se active el calendario
    print("\n📝 **Test 4: Verificar activación de calendario**")
    
    # Obtener la última respuesta que debería ser la solicitud de fecha
    if "¿Qué fecha prefieres para tu consulta?" in response_text_step and "Opciones disponibles:" in response_text_step:
        print("✅ **CORRECTO: Se activó la solicitud específica de fecha**")
        print("   Esto debería activar el calendario en el frontend")
    else:
        print("❌ **ERROR: No se activó la solicitud de fecha**")
        return False
    
    print("\n🎉 **Test completado exitosamente**")
    return True

def test_menu_vs_calendar():
    """Test para comparar menú principal vs solicitud de fecha"""
    
    base_url = "http://localhost:8000"
    
    print("\n🧪 **Test: Comparación menú vs calendario**")
    print("=" * 50)
    
    # Test menú principal
    print("\n📝 **Menú Principal (NO debe activar calendario):**")
    menu_user = "test_menu_user"
    
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": menu_user})
        time.sleep(0.1)
    except:
        pass
    
    menu_response = requests.post(f"{base_url}/chat", json={
        "text": "hola",
        "user_id": menu_user
    })
    
    menu_text = menu_response.json().get("response", "")
    
    print(f"📤 Enviado: 'hola'")
    print(f"📥 Contiene '¿En qué puedo ayudarte?': {'¿En qué puedo ayudarte?' in menu_text}")
    print(f"📥 Contiene 'Opciones disponibles': {'Opciones disponibles' in menu_text}")
    print(f"📥 Contiene '¿Qué fecha prefieres para tu consulta?': {'¿Qué fecha prefieres para tu consulta?' in menu_text}")
    
    if "¿En qué puedo ayudarte?" in menu_text and "Opciones disponibles" in menu_text and "¿Qué fecha prefieres para tu consulta?" not in menu_text:
        print("✅ **CORRECTO: Menú principal no activa calendario**")
    else:
        print("❌ **ERROR: Menú principal activa calendario incorrectamente**")
    
    # Test solicitud específica de fecha
    print("\n📝 **Solicitud Específica de Fecha (SÍ debe activar calendario):**")
    date_user = "test_date_user"
    
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": date_user})
        time.sleep(0.1)
    except:
        pass
    
    # Iniciar flujo de citas
    requests.post(f"{base_url}/chat", json={"text": "1", "user_id": date_user})
    requests.post(f"{base_url}/chat", json={"text": "Juan Pérez López", "user_id": date_user})
    requests.post(f"{base_url}/chat", json={"text": "25", "user_id": date_user})
    requests.post(f"{base_url}/chat", json={"text": "612345678", "user_id": date_user})
    requests.post(f"{base_url}/chat", json={"text": "juan@email.com", "user_id": date_user})
    date_response = requests.post(f"{base_url}/chat", json={"text": "Problema laboral", "user_id": date_user})
    
    date_text = date_response.json().get("response", "")
    
    print(f"📤 Flujo completado hasta solicitud de fecha")
    print(f"📥 Contiene '¿Qué fecha prefieres para tu consulta?': {'¿Qué fecha prefieres para tu consulta?' in date_text}")
    print(f"📥 Contiene 'Opciones disponibles:': {'Opciones disponibles:' in date_text}")
    print(f"📥 Contiene 'Responde con el número de la opción que prefieras': {'Responde con el número de la opción que prefieras' in date_text}")
    
    if all(phrase in date_text for phrase in ["¿Qué fecha prefieres para tu consulta?", "Opciones disponibles:", "Responde con el número de la opción que prefieras"]):
        print("✅ **CORRECTO: Solicitud específica de fecha activa calendario**")
    else:
        print("❌ **ERROR: Solicitud específica de fecha no activa calendario**")

if __name__ == "__main__":
    print("🚀 **Iniciando tests de detección de calendario**")
    print("=" * 60)
    
    try:
        # Verificar que el servidor esté corriendo
        response = requests.get("http://localhost:8000/health")
        if response.status_code == 200:
            print("✅ Servidor está corriendo")
        else:
            print("❌ Servidor no responde correctamente")
            exit(1)
    except Exception as e:
        print(f"❌ No se puede conectar al servidor: {e}")
        print("💡 Asegúrate de que el servidor esté corriendo en http://localhost:8000")
        exit(1)
    
    # Ejecutar tests
    success1 = test_calendar_detection()
    test_menu_vs_calendar()
    
    if success1:
        print("\n🎉 **Todos los tests pasaron exitosamente**")
    else:
        print("\n❌ **Algunos tests fallaron**") 