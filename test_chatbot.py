import requests
import json

def test_chatbot():
    """Prueba el chatbot con diferentes entradas"""
    base_url = "http://localhost:8000"
    
    # Casos de prueba - usando el mismo user_id para mantener contexto
    test_cases = [
        {"text": "hola", "user_id": "test_user"},
        {"text": "quiero cita", "user_id": "test_user"},
        {"text": "Juan Pérez López", "user_id": "test_user"},
        {"text": "30", "user_id": "test_user"},
        {"text": "612345678", "user_id": "test_user"},
        {"text": "juan.perez@email.com", "user_id": "test_user"},
        {"text": "problema laboral", "user_id": "test_user"},
        {"text": "1", "user_id": "test_user"},
        {"text": "sí", "user_id": "test_user"},
    ]
    
    print("🧪 Probando el chatbot con contexto...\n")
    
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
                print(f"   Respuesta: {data['response']}")
                print()
            else:
                print(f"❌ Test {i}: '{test_case['text']}' - Error {response.status_code}")
                print()
                
        except Exception as e:
            print(f"❌ Test {i}: '{test_case['text']}' - Error: {e}")
            print()

if __name__ == "__main__":
    test_chatbot() 