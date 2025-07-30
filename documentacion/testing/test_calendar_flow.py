import requests
import json

def test_calendar_flow():
    """Prueba el flujo completo del calendario"""
    base_url = "http://localhost:8000"
    
    print("🧪 Probando flujo completo del calendario...\n")
    
    # Flujo completo: desde saludo hasta selección de fecha
    test_cases = [
        {"text": "hola", "user_id": "test_calendar"},
        {"text": "quiero cita", "user_id": "test_calendar"},
        {"text": "Juan Pérez López", "user_id": "test_calendar"},
        {"text": "30", "user_id": "test_calendar"},
        {"text": "612345678", "user_id": "test_calendar"},
        {"text": "juan.perez@email.com", "user_id": "test_calendar"},
        {"text": "problema laboral", "user_id": "test_calendar"},
        {"text": "1", "user_id": "test_calendar"},  # Seleccionar primera fecha
        {"text": "Lunes 21 de Julio a las 9:00", "user_id": "test_calendar"},  # Simular selección del calendario
        {"text": "sí", "user_id": "test_calendar"},
    ]
    
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
                
                # Verificar si hay errores en la respuesta
                if "undefined" in data['response'] or "NaN" in data['response']:
                    print(f"   ⚠️  ADVERTENCIA: Respuesta contiene errores!")
                
                print()
            else:
                print(f"❌ Test {i}: '{test_case['text']}' - Error {response.status_code}")
                print()
                
        except Exception as e:
            print(f"❌ Test {i}: '{test_case['text']}' - Error: {e}")
            print()

def test_date_formatting():
    """Prueba el formateo de fechas específicamente"""
    base_url = "http://localhost:8000"
    
    print("📅 Probando formateo de fechas...\n")
    
    # Probar diferentes formatos de fecha
    date_tests = [
        "Lunes 21 de Julio a las 9:00",
        "Martes 22 de Julio a las 10:00",
        "Miércoles 23 de Julio a las 11:00",
        "Jueves 24 de Julio a las 16:00",
        "Viernes 25 de Julio a las 17:00",
    ]
    
    for i, date_test in enumerate(date_tests, 1):
        try:
            response = requests.post(
                f"{base_url}/chat",
                json={
                    "text": date_test,
                    "language": "es",
                    "user_id": f"test_date_{i}"
                },
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Test {i}: '{date_test}'")
                print(f"   Respuesta: {data['response'][:100]}...")
                
                # Verificar si hay errores
                if "undefined" in data['response'] or "NaN" in data['response']:
                    print(f"   ❌ ERROR: Respuesta contiene 'undefined' o 'NaN'!")
                else:
                    print(f"   ✅ Respuesta válida")
                
                print()
            else:
                print(f"❌ Test {i}: '{date_test}' - Error {response.status_code}")
                print()
                
        except Exception as e:
            print(f"❌ Test {i}: '{date_test}' - Error: {e}")
            print()

if __name__ == "__main__":
    test_calendar_flow()
    print("\n" + "="*50 + "\n")
    test_date_formatting() 