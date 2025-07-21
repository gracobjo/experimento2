import requests
import json
import time

def test_frontend_calendar_integration():
    """Prueba la integración del frontend con el calendario"""
    base_url = "http://localhost:8000"
    
    print("🎯 Probando integración frontend-calendario...\n")
    
    # Simular el flujo completo desde el frontend
    user_id = "frontend_test_user"
    
    # Paso 1: Iniciar conversación
    print("1️⃣ Iniciando conversación...")
    response = requests.post(f"{base_url}/chat", json={
        "text": "hola",
        "language": "es",
        "user_id": user_id
    })
    print(f"   Respuesta: {response.json()['response'][:100]}...")
    
    # Paso 2: Solicitar cita
    print("\n2️⃣ Solicitando cita...")
    response = requests.post(f"{base_url}/chat", json={
        "text": "quiero cita",
        "language": "es",
        "user_id": user_id
    })
    print(f"   Respuesta: {response.json()['response'][:100]}...")
    
    # Paso 3-7: Completar datos del usuario
    user_data = [
        ("Juan Pérez López", "nombre"),
        ("30", "edad"),
        ("612345678", "teléfono"),
        ("juan.perez@email.com", "email"),
        ("problema laboral", "motivo")
    ]
    
    for i, (data, field) in enumerate(user_data, 3):
        print(f"\n{i}️⃣ Proporcionando {field}...")
        response = requests.post(f"{base_url}/chat", json={
            "text": data,
            "language": "es",
            "user_id": user_id
        })
        print(f"   Respuesta: {response.json()['response'][:100]}...")
        time.sleep(0.5)
    
    # Paso 8: Simular selección de fecha desde el calendario del frontend
    print("\n8️⃣ Simulando selección desde calendario frontend...")
    
    # Simular diferentes formatos que el frontend podría enviar
    calendar_selections = [
        "Lunes 21 de Julio a las 9:00",
        "Martes 22 de Julio a las 10:00",
        "Miércoles 23 de Julio a las 11:00",
        "Jueves 24 de Julio a las 16:00",
        "Viernes 25 de Julio a las 17:00"
    ]
    
    for i, date_selection in enumerate(calendar_selections, 1):
        print(f"\n   Prueba {i}: '{date_selection}'")
        response = requests.post(f"{base_url}/chat", json={
            "text": date_selection,
            "language": "es",
            "user_id": f"{user_id}_calendar_{i}"
        })
        
        response_text = response.json()['response']
        print(f"   Respuesta: {response_text[:150]}...")
        
        # Verificar si hay errores de formateo
        if "undefined" in response_text or "NaN" in response_text:
            print(f"   ❌ ERROR: Respuesta contiene errores de formateo!")
        else:
            print(f"   ✅ Respuesta válida")
    
    # Paso 9: Simular confirmación
    print("\n9️⃣ Simulando confirmación...")
    response = requests.post(f"{base_url}/chat", json={
        "text": "sí",
        "language": "es",
        "user_id": user_id
    })
    print(f"   Respuesta: {response.json()['response'][:200]}...")

def test_calendar_error_handling():
    """Prueba el manejo de errores en el calendario"""
    base_url = "http://localhost:8000"
    
    print("\n" + "="*60)
    print("🔧 Probando manejo de errores del calendario...\n")
    
    # Probar casos edge que podrían causar errores
    edge_cases = [
        ("", "texto vacío"),
        ("undefined", "undefined literal"),
        ("null", "null literal"),
        ("2024-07-21", "formato ISO"),
        ("21/07/2024", "formato DD/MM/YYYY"),
        ("July 21, 2024", "formato inglés"),
        ("9:00", "solo hora"),
        ("21 de Julio", "sin hora"),
        ("Lunes 21", "incompleto"),
    ]
    
    for i, (test_input, description) in enumerate(edge_cases, 1):
        print(f"Prueba {i}: {description} - '{test_input}'")
        
        try:
            response = requests.post(f"{base_url}/chat", json={
                "text": test_input,
                "language": "es",
                "user_id": f"error_test_{i}"
            })
            
            response_text = response.json()['response']
            print(f"   Respuesta: {response_text[:100]}...")
            
            # Verificar si hay errores
            if "undefined" in response_text or "NaN" in response_text:
                print(f"   ❌ ERROR: Respuesta contiene errores!")
            else:
                print(f"   ✅ Respuesta válida")
                
        except Exception as e:
            print(f"   ❌ Error en la petición: {e}")
        
        print()

if __name__ == "__main__":
    test_frontend_calendar_integration()
    test_calendar_error_handling() 