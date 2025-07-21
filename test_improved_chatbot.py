import requests
import json

def test_improved_chatbot():
    """Prueba el chatbot mejorado con opciones numéricas"""
    base_url = "http://localhost:8000"
    
    # Casos de prueba para el flujo mejorado
    test_cases = [
        {"text": "hola", "user_id": "test_user_improved"},
        {"text": "quiero información", "user_id": "test_user_improved"},
        {"text": "2", "user_id": "test_user_improved"},  # Información general
        {"text": "3", "user_id": "test_user_improved"},  # Contacto
        {"text": "1", "user_id": "test_user_improved"},  # Agendar cita
        {"text": "Juan Pérez López", "user_id": "test_user_improved"},
        {"text": "30", "user_id": "test_user_improved"},
        {"text": "612345678", "user_id": "test_user_improved"},
        {"text": "juan.perez@email.com", "user_id": "test_user_improved"},
        {"text": "problema laboral", "user_id": "test_user_improved"},
        {"text": "1", "user_id": "test_user_improved"},  # Seleccionar primera fecha
        {"text": "sí", "user_id": "test_user_improved"},
    ]
    
    print("🧪 Probando el chatbot mejorado...\n")
    
    for i, test_case in enumerate(test_cases, 1):
        try:
            response = requests.post(
                f"{base_url}/chat",
                json={
                    "text": test_case["text"],
                    "language": "es",
                    "user_id": test_case["user_id"]
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Test {i}: '{test_case['text']}'")
                print(f"   Respuesta: {data['response'][:150]}...")
                print()
            else:
                print(f"❌ Test {i}: '{test_case['text']}' - Error {response.status_code}")
                print()
                
        except Exception as e:
            print(f"❌ Test {i}: '{test_case['text']}' - Error: {e}")
            print()

def test_menu_options():
    """Prueba específicamente las opciones del menú"""
    base_url = "http://localhost:8000"
    
    print("📋 Probando opciones del menú...\n")
    
    # Primero enviar algo para obtener el menú
    try:
        response = requests.post(
            f"{base_url}/chat",
            json={
                "text": "hola",
                "language": "es",
                "user_id": "test_menu"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Menú inicial obtenido")
            print(f"   Respuesta: {data['response'][:200]}...")
            print()
            
            # Probar cada opción
            options = ["1", "2", "3", "4"]
            for option in options:
                try:
                    option_response = requests.post(
                        f"{base_url}/chat",
                        json={
                            "text": option,
                            "language": "es",
                            "user_id": f"test_menu_{option}"
                        },
                        timeout=10
                    )
                    
                    if option_response.status_code == 200:
                        option_data = option_response.json()
                        print(f"✅ Opción {option}: {option_data['response'][:100]}...")
                    else:
                        print(f"❌ Opción {option}: Error {option_response.status_code}")
                        
                except Exception as e:
                    print(f"❌ Opción {option}: Error - {e}")
                    
        else:
            print(f"❌ Error obteniendo menú: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error en test de menú: {e}")

if __name__ == "__main__":
    test_improved_chatbot()
    print("\n" + "="*50 + "\n")
    test_menu_options() 