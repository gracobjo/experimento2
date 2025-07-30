# Test directo de la función show_main_menu
import sys
import os

# Agregar el directorio actual al path para importar el módulo
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importar la función directamente del archivo
def test_direct_menu_format():
    """Test directo de la función show_main_menu"""
    
    print("🧪 **Test Directo: Formato del Menú Principal**")
    print("=" * 60)
    
    # Leer el archivo y extraer la función show_main_menu
    with open('test_simple_chatbot.py', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Buscar la función show_main_menu
    start_marker = 'def show_main_menu() -> str:'
    end_marker = 'def show_information_menu()'
    
    start_idx = content.find(start_marker)
    end_idx = content.find(end_marker)
    
    if start_idx == -1 or end_idx == -1:
        print("❌ No se pudo encontrar la función show_main_menu")
        return False
    
    # Extraer la función completa
    function_text = content[start_idx:end_idx]
    
    print("📋 **Función encontrada:**")
    print("-" * 40)
    print(function_text)
    print("-" * 40)
    
    # Verificar que el formato está correcto
    expected_format_elements = [
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
        if element not in function_text:
            missing_elements.append(element)
    
    if missing_elements:
        print(f"❌ Elementos faltantes en el formato:")
        for element in missing_elements:
            print(f"   - {element}")
        return False
    else:
        print("✅ Todos los elementos del formato están presentes")
    
    # Verificar que las opciones están en líneas separadas
    lines = function_text.split('\n')
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
    if "   " in function_text:
        print("✅ Las descripciones tienen indentación correcta")
    else:
        print("⚠️  No se detectó indentación en las descripciones")
    
    # Verificar que hay líneas en blanco entre opciones
    if "\n\n" in function_text:
        print("✅ Hay separación entre las opciones")
    else:
        print("⚠️  No se detectó separación entre opciones")
    
    return True

if __name__ == "__main__":
    success = test_direct_menu_format()
    
    if success:
        print("\n🎉 **Test exitoso!**")
        print("✅ El formato del menú está correctamente implementado")
        print("💡 Para ver los cambios, reinicia el servidor del chatbot")
    else:
        print("\n❌ **Test falló**")
        print("⚠️  Revisar la implementación del formato del menú") 