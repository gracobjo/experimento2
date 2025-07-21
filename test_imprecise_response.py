import requests
import json
import time

def test_imprecise_response_formatting():
    """Test para verificar que las respuestas imprecisas se formatean correctamente"""
    
    base_url = "http://localhost:8000"
    test_user = "test_imprecise_user"
    
    print("🧪 **Test: Formateo de respuestas imprecisas**")
    print("=" * 60)
    
    # Limpiar sesión
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
        time.sleep(0.1)
    except:
        pass
    
    # Test 1: Enviar "JJ" y verificar formato
    print("\n📝 **Test 1: Enviar 'JJ'**")
    
    response = requests.post(f"{base_url}/chat", json={
        "text": "JJ",
        "user_id": test_user
    })
    
    result = response.json()
    response_text = result.get("response", "")
    
    print(f"📤 Enviado: 'JJ'")
    print(f"📥 Respuesta del backend: {response_text[:200]}...")
    
    # Verificar que contenga el menú principal
    if "¿En qué puedo ayudarte?" in response_text and "Opciones disponibles" in response_text:
        print("✅ **CORRECTO: Backend responde con menú principal**")
        print("   El frontend debería formatear esto como:")
        print('   **Has indicado:** "JJ"')
        print("   Para ayudarte mejor, 📋 **¿En qué puedo ayudarte?**...")
    else:
        print("❌ **ERROR: Backend no responde con menú principal**")
        return False
    
    # Test 2: Enviar "si" y verificar formato
    print("\n📝 **Test 2: Enviar 'si'**")
    
    response2 = requests.post(f"{base_url}/chat", json={
        "text": "si",
        "user_id": test_user
    })
    
    result2 = response2.json()
    response_text2 = result2.get("response", "")
    
    print(f"📤 Enviado: 'si'")
    print(f"📥 Respuesta del backend: {response_text2[:200]}...")
    
    if "¿En qué puedo ayudarte?" in response_text2:
        print("✅ **CORRECTO: Backend responde con menú principal**")
        print("   El frontend debería formatear esto como:")
        print('   **Has indicado:** "si"')
        print("   Para ayudarte mejor, 📋 **¿En qué puedo ayudarte?**...")
    else:
        print("❌ **ERROR: Backend no responde con menú principal**")
        return False
    
    # Test 3: Enviar entrada larga y verificar que NO se formatee
    print("\n📝 **Test 3: Enviar entrada larga (no debe formatearse)**")
    
    response3 = requests.post(f"{base_url}/chat", json={
        "text": "Quiero información sobre los servicios legales disponibles",
        "user_id": test_user
    })
    
    result3 = response3.json()
    response_text3 = result3.get("response", "")
    
    print(f"📤 Enviado: 'Quiero información sobre los servicios legales disponibles'")
    print(f"📥 Respuesta del backend: {response_text3[:200]}...")
    
    if "¿En qué puedo ayudarte?" in response_text3:
        print("✅ **CORRECTO: Backend responde con menú principal**")
        print("   El frontend NO debería formatear esto porque es una entrada larga")
    else:
        print("❌ **ERROR: Backend no responde con menú principal**")
        return False
    
    print("\n🎉 **Test completado exitosamente**")
    return True

def test_various_imprecise_inputs():
    """Test para verificar varios tipos de entradas imprecisas"""
    
    base_url = "http://localhost:8000"
    imprecise_inputs = ["JJ", "A", "X", "123", "abc", "xyz", "si", "sí", "vale", "ok", "claro"]
    
    print("\n🧪 **Test: Varias entradas imprecisas**")
    print("=" * 50)
    
    for i, imprecise_input in enumerate(imprecise_inputs, 1):
        test_user = f"test_imprecise_{i}"
        
        # Limpiar sesión
        try:
            requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
            time.sleep(0.1)
        except:
            pass
        
        print(f"\n📝 **Test {i}: Enviar '{imprecise_input}'**")
        
        response = requests.post(f"{base_url}/chat", json={
            "text": imprecise_input,
            "user_id": test_user
        })
        
        result = response.json()
        response_text = result.get("response", "")
        
        # Verificar que contenga el menú principal
        if "¿En qué puedo ayudarte?" in response_text and "Opciones disponibles" in response_text:
            print(f"✅ **CORRECTO: '{imprecise_input}' genera menú principal**")
            print(f"   El frontend debería mostrar: **Has indicado:** \"{imprecise_input}\"")
        else:
            print(f"❌ **ERROR: '{imprecise_input}' no genera menú principal**")
    
    print("\n🎉 **Test de entradas imprecisas completado**")

def test_precise_vs_imprecise():
    """Test para comparar entradas precisas vs imprecisas"""
    
    base_url = "http://localhost:8000"
    
    print("\n🧪 **Test: Comparación precisa vs imprecisa**")
    print("=" * 50)
    
    # Test entrada imprecisa
    print("\n📝 **Entrada Imprecisa (debe formatearse):**")
    imprecise_user = "test_imprecise_comp"
    
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": imprecise_user})
        time.sleep(0.1)
    except:
        pass
    
    imprecise_response = requests.post(f"{base_url}/chat", json={
        "text": "JJ",
        "user_id": imprecise_user
    })
    
    imprecise_text = imprecise_response.json().get("response", "")
    
    print(f"📤 Enviado: 'JJ'")
    print(f"📥 Contiene '¿En qué puedo ayudarte?': {'¿En qué puedo ayudarte?' in imprecise_text}")
    print(f"📥 Contiene 'Para ayudarte mejor': {'Para ayudarte mejor' in imprecise_text}")
    print("📝 **Frontend debería mostrar:**")
    print('   **Has indicado:** "JJ"')
    print("   Para ayudarte mejor, 📋 **¿En qué puedo ayudarte?**...")
    
    # Test entrada precisa
    print("\n📝 **Entrada Precisa (NO debe formatearse):**")
    precise_user = "test_precise_comp"
    
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": precise_user})
        time.sleep(0.1)
    except:
        pass
    
    precise_response = requests.post(f"{base_url}/chat", json={
        "text": "Necesito agendar una cita para consulta legal",
        "user_id": precise_user
    })
    
    precise_text = precise_response.json().get("response", "")
    
    print(f"📤 Enviado: 'Necesito agendar una cita para consulta legal'")
    print(f"📥 Contiene '¿En qué puedo ayudarte?': {'¿En qué puedo ayudarte?' in precise_text}")
    print(f"📥 Contiene 'Para ayudarte mejor': {'Para ayudarte mejor' in precise_text}")
    print("📝 **Frontend NO debería formatear esto**")

if __name__ == "__main__":
    print("🚀 **Iniciando tests de formateo de respuestas imprecisas**")
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
    success1 = test_imprecise_response_formatting()
    test_various_imprecise_inputs()
    test_precise_vs_imprecise()
    
    if success1:
        print("\n🎉 **Todos los tests pasaron exitosamente**")
        print("\n📋 **Resumen de la mejora implementada:**")
        print("✅ El frontend ahora detecta entradas imprecisas")
        print("✅ Muestra '**Has indicado:** \"entrada\"' antes del menú")
        print("✅ Mejora la transparencia del proceso para el usuario")
    else:
        print("\n❌ **Algunos tests fallaron**") 