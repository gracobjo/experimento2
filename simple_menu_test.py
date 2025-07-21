def show_main_menu() -> str:
    """Mostrar menú principal"""
    return """📋 **¿En qué puedo ayudarte?**

🎯 **Opciones disponibles:**

1️⃣ **Agendar una cita**
   Para consulta personalizada con nuestros abogados

2️⃣ **Información general**
   Sobre servicios, honorarios, horarios

3️⃣ **Contacto directo**
   Teléfono, email, ubicación

4️⃣ **Otro asunto**
   Especifica tu consulta

Responde con el número de la opción que prefieras o escribe tu consulta directamente."""

def test_menu_format():
    """Test simple del formato del menú"""
    menu = show_main_menu()
    
    print("🧪 **Test Simple: Formato del Menú**")
    print("=" * 50)
    
    print("📋 **Menú generado:**")
    print("-" * 30)
    print(menu)
    print("-" * 30)
    
    # Verificar elementos clave
    checks = [
        ("Título principal", "📋 **¿En qué puedo ayudarte?**" in menu),
        ("Opciones disponibles", "🎯 **Opciones disponibles:**" in menu),
        ("Opción 1", "1️⃣ **Agendar una cita**" in menu),
        ("Descripción 1", "   Para consulta personalizada" in menu),
        ("Opción 2", "2️⃣ **Información general**" in menu),
        ("Descripción 2", "   Sobre servicios, honorarios" in menu),
        ("Opción 3", "3️⃣ **Contacto directo**" in menu),
        ("Descripción 3", "   Teléfono, email, ubicación" in menu),
        ("Opción 4", "4️⃣ **Otro asunto**" in menu),
        ("Descripción 4", "   Especifica tu consulta" in menu),
        ("Líneas en blanco", "\n\n" in menu),
        ("Indentación", "   " in menu)
    ]
    
    print("\n📊 **Verificaciones:**")
    all_passed = True
    for check_name, passed in checks:
        status = "✅" if passed else "❌"
        print(f"   {status} {check_name}")
        if not passed:
            all_passed = False
    
    if all_passed:
        print("\n🎉 **¡Formato correcto!**")
        print("✅ El menú tiene el formato deseado con opciones en líneas separadas")
    else:
        print("\n❌ **Formato incorrecto**")
        print("⚠️  Revisar la implementación del menú")
    
    return all_passed

if __name__ == "__main__":
    test_menu_format() 