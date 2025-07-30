import requests
import json
import time

def test_menu_improvements():
    """Probar las mejoras del menú para evitar bucles"""
    base_url = "http://localhost:8000"
    
    print("🎯 Probando mejoras del menú...\n")
    
    # Test 1: Saludo inicial con menú
    print("1️⃣ Probando saludo inicial...")
    user_id = "test_menu_user"
    
    try:
        response = requests.post(f"{base_url}/chat", json={
            "text": "hola",
            "language": "es",
            "user_id": user_id
        })
        
        if response.status_code == 200:
            data = response.json()
            response_text = data['response']
            print(f"   ✅ Respuesta recibida")
            print(f"   📝 Contiene menú: {'📋' in response_text}")
            print(f"   📝 Contiene opciones: {'1️⃣' in response_text or '1.' in response_text}")
            print(f"   💬 Respuesta: {response_text[:150]}...")
        else:
            print(f"   ❌ Error: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Error de conexión: {e}")
    
    # Test 2: Respuestas cortas y ambiguas
    print("\n2️⃣ Probando respuestas cortas y ambiguas...")
    
    ambiguous_responses = [
        "hi",
        "quiero información",
        "si",
        "sí",
        "vale",
        "ok",
        "claro",
        "que sí"
    ]
    
    for i, response_text in enumerate(ambiguous_responses, 1):
        print(f"\n   Prueba {i}: '{response_text}'")
        try:
            response = requests.post(f"{base_url}/chat", json={
                "text": response_text,
                "language": "es",
                "user_id": f"test_ambiguous_{i}"
            })
            
            if response.status_code == 200:
                data = response.json()
                bot_response = data['response']
                
                # Verificar si muestra menú en lugar de repreguntar
                if "📋" in bot_response or "1️⃣" in bot_response or "Opciones disponibles" in bot_response:
                    print(f"   ✅ Muestra menú (correcto)")
                elif "Entiendo tu consulta" in bot_response and ("📋" in bot_response or "1️⃣" in bot_response):
                    print(f"   ✅ Muestra menú después de entender")
                else:
                    print(f"   ⚠️  No muestra menú claro")
                
                print(f"   💬 Respuesta: {bot_response[:100]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
    
    # Test 3: Opciones numéricas del menú
    print("\n3️⃣ Probando opciones numéricas del menú...")
    
    menu_options = [
        ("1", "Agendar cita"),
        ("2", "Información general"),
        ("3", "Contacto directo"),
        ("4", "Otro asunto")
    ]
    
    for option, description in menu_options:
        print(f"\n   Prueba: Opción {option} - {description}")
        try:
            response = requests.post(f"{base_url}/chat", json={
                "text": option,
                "language": "es",
                "user_id": f"test_option_{option}"
            })
            
            if response.status_code == 200:
                data = response.json()
                bot_response = data['response']
                
                if option == "1":
                    if "agendar" in bot_response.lower() or "nombre completo" in bot_response:
                        print(f"   ✅ Inicia flujo de citas")
                    else:
                        print(f"   ❌ No inicia flujo de citas")
                elif option == "2":
                    if "servicios" in bot_response or "honorarios" in bot_response:
                        print(f"   ✅ Muestra información general")
                    else:
                        print(f"   ❌ No muestra información")
                elif option == "3":
                    if "teléfono" in bot_response or "contacto" in bot_response:
                        print(f"   ✅ Muestra información de contacto")
                    else:
                        print(f"   ❌ No muestra contacto")
                elif option == "4":
                    if "cuéntame más" in bot_response or "específica" in bot_response:
                        print(f"   ✅ Solicita más detalles")
                    else:
                        print(f"   ❌ No solicita detalles")
                
                print(f"   💬 Respuesta: {bot_response[:100]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
    
    # Test 4: Detección de intenciones específicas
    print("\n4️⃣ Probando detección de intenciones específicas...")
    
    specific_intents = [
        ("cita", "Solicitud de cita"),
        ("información", "Solicitud de información"),
        ("contacto", "Solicitud de contacto"),
        ("menú", "Solicitud de menú")
    ]
    
    for intent_text, description in specific_intents:
        print(f"\n   Prueba: '{intent_text}' - {description}")
        try:
            response = requests.post(f"{base_url}/chat", json={
                "text": intent_text,
                "language": "es",
                "user_id": f"test_intent_{intent_text}"
            })
            
            if response.status_code == 200:
                data = response.json()
                bot_response = data['response']
                
                if "cita" in intent_text:
                    if "agendar" in bot_response.lower() or "nombre completo" in bot_response:
                        print(f"   ✅ Detecta intención de cita")
                    else:
                        print(f"   ❌ No detecta intención de cita")
                elif "información" in intent_text:
                    if "servicios" in bot_response or "honorarios" in bot_response:
                        print(f"   ✅ Detecta intención de información")
                    else:
                        print(f"   ❌ No detecta intención de información")
                elif "contacto" in intent_text:
                    if "teléfono" in bot_response or "contacto" in bot_response:
                        print(f"   ✅ Detecta intención de contacto")
                    else:
                        print(f"   ❌ No detecta intención de contacto")
                elif "menú" in intent_text:
                    if "📋" in bot_response or "Opciones disponibles" in bot_response:
                        print(f"   ✅ Detecta solicitud de menú")
                    else:
                        print(f"   ❌ No detecta solicitud de menú")
                
                print(f"   💬 Respuesta: {bot_response[:100]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")

def test_no_loops():
    """Probar que no hay bucles de repreguntar"""
    base_url = "http://localhost:8000"
    
    print("\n" + "="*60)
    print("🔄 Probando ausencia de bucles de repreguntar...\n")
    
    # Simular el flujo problemático del usuario
    user_id = "test_no_loops_user"
    
    problematic_flow = [
        ("hola", "Saludo inicial"),
        ("hi", "Respuesta corta"),
        ("quiero información", "Solicitud vaga"),
        ("si", "Respuesta afirmativa corta"),
        ("sí", "Respuesta afirmativa"),
        ("vale", "Respuesta ambigua"),
        ("que sí", "Respuesta afirmativa larga")
    ]
    
    for i, (text, description) in enumerate(problematic_flow, 1):
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
                
                # Verificar que no repregunta lo mismo
                if "¿Te gustaría agendar una cita?" in bot_response and i > 1:
                    print(f"   ❌ REPREGUNTA (bucle detectado)")
                elif "📋" in bot_response or "1️⃣" in bot_response or "Opciones disponibles" in bot_response:
                    print(f"   ✅ Muestra menú (correcto)")
                elif "Entiendo tu consulta" in bot_response:
                    print(f"   ✅ Entiende y responde apropiadamente")
                else:
                    print(f"   ⚠️  Respuesta diferente")
                
                print(f"   💬 Respuesta: {bot_response[:100]}...")
            else:
                print(f"   ❌ Error: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")

if __name__ == "__main__":
    test_menu_improvements()
    test_no_loops() 