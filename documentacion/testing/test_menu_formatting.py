import requests
import json
import time

def test_menu_formatting():
    """Test para verificar que el menú se formatea correctamente"""
    
    base_url = "http://localhost:8000"
    test_user = "test_menu_formatting_user"
    
    print("🧪 **Test: Formato del Menú Principal**")
    print("=" * 50)
    
    # Limpiar sesión
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
        time.sleep(0.1)
    except:
        pass
    
    # Test 1: Enviar entrada imprecisa y verificar formato del menú
    print("\n📝 **Test 1: Verificar formato del menú con entrada imprecisa**")
    
    response = requests.post(f"{base_url}/chat", json={
        "text": "JJ",
        "user_id": test_user
    })
    
    result = response.json()
    response_text = result.get("response", "")
    
    print(f"✅ Respuesta recibida:")
    print(f"📄 Longitud: {len(response_text)} caracteres")
    
    # Verificar que el menú tiene el formato correcto
    expected_elements = [
        "📋 **¿En qué puedo ayudarte?**",
        "🎯 **Opciones disponibles:**",
        "1️⃣ **Agendar una cita**",
        "Para consulta personalizada con nuestros abogados",
        "2️⃣ **Información general**",
        "Sobre servicios, honorarios, horarios",
        "3️⃣ **Contacto directo**",
        "Teléfono, email, ubicación",
        "4️⃣ **Otro asunto**",
        "Especifica tu consulta"
    ]
    
    missing_elements = []
    for element in expected_elements:
        if element not in response_text:
            missing_elements.append(element)
    
    if missing_elements:
        print(f"❌ Elementos faltantes: {missing_elements}")
        return False
    else:
        print("✅ Todos los elementos del menú están presentes")
    
    # Verificar que las opciones están en líneas separadas
    lines = response_text.split('\n')
    option_lines = [line for line in lines if '1️⃣' in line or '2️⃣' in line or '3️⃣' in line or '4️⃣' in line]
    
    print(f"📊 Líneas de opciones encontradas: {len(option_lines)}")
    for i, line in enumerate(option_lines, 1):
        print(f"   Opción {i}: {line.strip()}")
    
    # Verificar que hay espacios entre las opciones
    if "   " in response_text:  # Verificar indentación
        print("✅ Las opciones tienen formato con indentación")
    else:
        print("⚠️  No se detectó indentación en las opciones")
    
    print("\n📋 **Menú completo:**")
    print("-" * 50)
    print(response_text)
    print("-" * 50)
    
    return True

def test_menu_with_different_inputs():
    """Test con diferentes entradas imprecisas"""
    
    base_url = "http://localhost:8000"
    test_inputs = ["A", "X", "123", "ABC", "SI", "OK"]
    
    print("\n📝 **Test 2: Verificar formato con diferentes entradas imprecisas**")
    
    for i, test_input in enumerate(test_inputs, 1):
        test_user = f"test_menu_format_{i}"
        
        # Limpiar sesión
        try:
            requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
            time.sleep(0.1)
        except:
            pass
        
        print(f"\n🔍 Probando entrada: '{test_input}'")
        
        response = requests.post(f"{base_url}/chat", json={
            "text": test_input,
            "user_id": test_user
        })
        
        result = response.json()
        response_text = result.get("response", "")
        
        # Verificar que contiene el menú formateado
        if "1️⃣ **Agendar una cita**" in response_text and "   Para consulta personalizada" in response_text:
            print(f"✅ Formato correcto para '{test_input}'")
        else:
            print(f"❌ Formato incorrecto para '{test_input}'")
            return False
    
    return True

if __name__ == "__main__":
    print("🚀 Iniciando tests de formato del menú...")
    
    success1 = test_menu_formatting()
    success2 = test_menu_with_different_inputs()
    
    if success1 and success2:
        print("\n🎉 **Todos los tests pasaron exitosamente!**")
        print("✅ El menú se formatea correctamente con opciones en líneas separadas")
    else:
        print("\n❌ **Algunos tests fallaron**")
        print("⚠️  Revisar el formato del menú") 