def test_chatbot_menu_format():
    """Test para verificar que el menú en chatbot/main_improved_fixed.py tiene el formato correcto"""
    
    print("🧪 **Test: Formato del Menú en chatbot/main_improved_fixed.py**")
    print("=" * 70)
    
    # Leer el archivo del chatbot
    with open('chatbot/main_improved_fixed.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar el menú en el archivo
    menu_start = content.find('📋 **Opciones disponibles:**')
    if menu_start == -1:
        print("❌ No se encontró el menú en el archivo")
        return False
    
    # Extraer el menú completo
    menu_end = content.find('Responde con el número de la opción que prefieras', menu_start)
    if menu_end == -1:
        print("❌ No se pudo encontrar el final del menú")
        return False
    
    menu_text = content[menu_start:menu_end + 50]  # Incluir el texto final
    
    print("📋 **Menú encontrado en chatbot/main_improved_fixed.py:**")
    print("-" * 50)
    print(menu_text)
    print("-" * 50)
    
    # Verificar que el formato está correcto
    expected_format_elements = [
        "📋 **Opciones disponibles:**",
        "1️⃣ **Agendar una cita**",
        "   Para consulta personalizada con nuestros abogados",
        "2️⃣ **Información general**",
        "   Sobre servicios, honorarios, horarios",
        "3️⃣ **Contacto directo**",
        "   Teléfono, email, ubicación",
        "4️⃣ **Otro asunto**",
        "   Especifica tu consulta"
    ]
    
    missing_elements = []
    for element in expected_format_elements:
        if element not in menu_text:
            missing_elements.append(element)
    
    if missing_elements:
        print(f"❌ Elementos faltantes en el formato:")
        for element in missing_elements:
            print(f"   - {element}")
        return False
    else:
        print("✅ Todos los elementos del formato están presentes")
    
    # Verificar que las opciones están en líneas separadas
    lines = menu_text.split('\n')
    option_lines = []
    description_lines = []
    
    for line in lines:
        if '1️⃣' in line or '2️⃣' in line or '3️⃣' in line or '4️⃣' in line:
            option_lines.append(line.strip())
        elif line.strip().startswith('   ') and any(word in line for word in ['Para consulta', 'Sobre servicios', 'Teléfono', 'Especifica']):
            description_lines.append(line.strip())
    
    print(f"\n📊 **Análisis del formato:**")
    print(f"   Opciones encontradas: {len(option_lines)}")
    print(f"   Descripciones encontradas: {len(description_lines)}")
    
    for i, (option, desc) in enumerate(zip(option_lines, description_lines), 1):
        print(f"   Opción {i}: {option}")
        print(f"   Descripción {i}: {desc}")
        print()
    
    # Verificar que hay espacios entre las opciones
    if "   " in menu_text:
        print("✅ Las descripciones tienen indentación correcta")
    else:
        print("⚠️  No se detectó indentación en las descripciones")
    
    # Verificar que hay líneas en blanco entre opciones
    if "\n\n" in menu_text:
        print("✅ Hay separación entre las opciones")
    else:
        print("⚠️  No se detectó separación entre opciones")
    
    return True

if __name__ == "__main__":
    success = test_chatbot_menu_format()
    
    if success:
        print("\n🎉 **Test exitoso!**")
        print("✅ El formato del menú está correctamente implementado en chatbot/main_improved_fixed.py")
        print("💡 Ahora reinicia el servidor del chatbot para ver los cambios")
    else:
        print("\n❌ **Test falló**")
        print("⚠️  Revisar la implementación del formato del menú") 