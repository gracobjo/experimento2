import requests
import json
import time

def test_current_menu_format():
    """Test para verificar el formato actual del menú en el servidor"""
    
    base_url = "http://localhost:8000"
    test_user = "test_current_menu_user"
    
    print("🧪 **Test: Formato Actual del Menú en Servidor**")
    print("=" * 60)
    
    # Limpiar sesión
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
        time.sleep(0.1)
    except:
        pass
    
    # Test 1: Enviar entrada imprecisa y verificar formato del menú
    print("\n📝 **Test 1: Verificar formato del menú con entrada imprecisa**")
    
    response = requests.post(f"{base_url}/chat", json={
        "text": "jj",
        "user_id": test_user
    })
    
    result = response.json()
    response_text = result.get("response", "")
    
    print(f"✅ Respuesta recibida:")
    print(f"📄 Longitud: {len(response_text)} caracteres")
    
    # Verificar que el menú tiene el formato correcto
    expected_elements = [
        "📋 **Opciones disponibles:**",
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
    else:
        print("✅ Todos los elementos del menú están presentes")
    
    # Verificar formato específico
    lines = response_text.split('\n')
    print(f"\n📊 **Análisis de líneas:**")
    print(f"   Total de líneas: {len(lines)}")
    
    # Buscar líneas específicas
    option_lines = []
    description_lines = []
    
    for i, line in enumerate(lines):
        line = line.strip()
        if '1️⃣' in line or '2️⃣' in line or '3️⃣' in line or '4️⃣' in line:
            option_lines.append(f"Línea {i+1}: {line}")
        elif any(word in line for word in ['Para consulta', 'Sobre servicios', 'Teléfono', 'Especifica']):
            description_lines.append(f"Línea {i+1}: {line}")
    
    print(f"\n📋 **Líneas de opciones encontradas:**")
    for line in option_lines:
        print(f"   {line}")
    
    print(f"\n📝 **Líneas de descripciones encontradas:**")
    for line in description_lines:
        print(f"   {line}")
    
    # Verificar si hay saltos de línea
    if "\n\n" in response_text:
        print("\n✅ Hay saltos de línea entre opciones")
    else:
        print("\n❌ No hay saltos de línea entre opciones")
    
    # Verificar si hay indentación
    if "   " in response_text:
        print("✅ Hay indentación en las descripciones")
    else:
        print("❌ No hay indentación en las descripciones")
    
    print("\n📋 **Menú completo recibido:**")
    print("-" * 50)
    print(response_text)
    print("-" * 50)
    
    return response_text

def test_user_input_display():
    """Test para verificar si se muestra la entrada del usuario"""
    
    base_url = "http://localhost:8000"
    test_user = "test_user_input_user"
    
    print("\n📝 **Test 2: Verificar si se muestra la entrada del usuario**")
    
    # Limpiar sesión
    try:
        requests.post(f"{base_url}/end_chat", json={"user_id": test_user})
        time.sleep(0.1)
    except:
        pass
    
    # Enviar entrada imprecisa
    response = requests.post(f"{base_url}/chat", json={
        "text": "abc123",
        "user_id": test_user
    })
    
    result = response.json()
    response_text = result.get("response", "")
    
    # Verificar si se menciona la entrada del usuario
    if "abc123" in response_text:
        print("✅ La entrada del usuario se muestra en la respuesta")
    else:
        print("❌ La entrada del usuario NO se muestra en la respuesta")
    
    if "Has indicado" in response_text:
        print("✅ Se usa el formato 'Has indicado'")
    else:
        print("❌ No se usa el formato 'Has indicado'")
    
    print(f"\n📋 **Respuesta completa:**")
    print("-" * 30)
    print(response_text)
    print("-" * 30)
    
    return response_text

if __name__ == "__main__":
    print("🚀 Iniciando tests del formato actual...")
    
    menu_response = test_current_menu_format()
    user_input_response = test_user_input_display()
    
    print("\n🎯 **Resumen:**")
    print("=" * 30)
    
    # Análisis del menú
    if "\n\n" in menu_response and "   " in menu_response:
        print("✅ Formato del menú: CORRECTO (con saltos de línea e indentación)")
    else:
        print("❌ Formato del menú: INCORRECTO (sin saltos de línea o indentación)")
    
    # Análisis de entrada del usuario
    if "Has indicado" in user_input_response:
        print("✅ Entrada del usuario: SE MUESTRA correctamente")
    else:
        print("❌ Entrada del usuario: NO SE MUESTRA")
    
    print("\n💡 **Recomendaciones:**")
    if "\n\n" not in menu_response:
        print("   - Reiniciar el servidor del chatbot")
    if "Has indicado" not in user_input_response:
        print("   - Implementar la funcionalidad de mostrar entrada del usuario") 