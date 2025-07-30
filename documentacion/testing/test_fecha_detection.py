import requests
import json
import time

def test_short_input_detection():
    """Test para verificar que entradas cortas como 'JJ' no sean detectadas como fechas"""
    
    base_url = "http://localhost:8000"
    test_user = "test_short_input_user"
    
    print("🧪 **Test: Detección de entrada corta 'JJ'**")
    print("=" * 50)
    
    # Limpiar sesión
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
        time.sleep(0.1)
    except:
        pass
    
    # Test 1: Enviar "JJ" y verificar que no sea detectado como fecha
    print("\n📝 **Test 1: Enviar 'JJ'**")
    
    response = requests.post(f"{base_url}/chat", json={
        "text": "JJ",
        "user_id": test_user
    })
    
    result = response.json()
    response_text = result.get("response", "")
    
    print(f"📤 Enviado: 'JJ'")
    print(f"📥 Respuesta: {response_text}")
    
    # Verificar que NO contenga el calendario
    if "Opciones disponibles" in response_text and "Lunes 21 de Julio" in response_text:
        print("❌ **ERROR: 'JJ' fue detectado incorrectamente como fecha**")
        print("   Se mostró el calendario cuando debería mostrar el menú principal")
        return False
    else:
        print("✅ **CORRECTO: 'JJ' no fue detectado como fecha**")
        print("   Se mostró el menú principal como debe ser")
    
    # Test 2: Verificar que el menú principal se muestre correctamente
    print("\n📝 **Test 2: Verificar menú principal**")
    
    if "¿En qué puedo ayudarte?" in response_text and "Agendar una cita" in response_text:
        print("✅ **CORRECTO: Se mostró el menú principal**")
    else:
        print("❌ **ERROR: No se mostró el menú principal correctamente**")
        return False
    
    # Test 3: Verificar que no haya sesión activa
    print("\n📝 **Test 3: Verificar que no hay sesión activa**")
    
    response2 = requests.post(f"{base_url}/chat", json={
        "text": "hola",
        "user_id": test_user
    })
    
    result2 = response2.json()
    response_text2 = result2.get("response", "")
    
    if "nombre completo" in response_text2.lower():
        print("❌ **ERROR: Se inició una sesión de citas incorrectamente**")
        return False
    else:
        print("✅ **CORRECTO: No se inició sesión de citas**")
    
    print("\n🎉 **Test completado exitosamente**")
    return True

def test_various_short_inputs():
    """Test para verificar varios tipos de entradas cortas"""
    
    base_url = "http://localhost:8000"
    short_inputs = ["JJ", "A", "X", "123", "abc", "xyz"]
    
    print("\n🧪 **Test: Varias entradas cortas**")
    print("=" * 50)
    
    for i, short_input in enumerate(short_inputs, 1):
        test_user = f"test_short_{i}"
        
        # Limpiar sesión
        try:
            requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
            time.sleep(0.1)
        except:
            pass
        
        print(f"\n📝 **Test {i}: Enviar '{short_input}'**")
        
        response = requests.post(f"{base_url}/chat", json={
            "text": short_input,
            "user_id": test_user
        })
        
        result = response.json()
        response_text = result.get("response", "")
        
        # Verificar que NO contenga el calendario
        if "Opciones disponibles" in response_text and "Lunes 21 de Julio" in response_text:
            print(f"❌ **ERROR: '{short_input}' fue detectado incorrectamente como fecha**")
        else:
            print(f"✅ **CORRECTO: '{short_input}' no fue detectado como fecha**")
    
    print("\n🎉 **Test de entradas cortas completado**")

if __name__ == "__main__":
    print("🚀 **Iniciando tests de detección de entradas cortas**")
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
    success1 = test_short_input_detection()
    test_various_short_inputs()
    
    if success1:
        print("\n🎉 **Todos los tests pasaron exitosamente**")
    else:
        print("\n❌ **Algunos tests fallaron**") 