import requests
import json
import time

def test_validations():
    """Probar todas las validaciones del chatbot"""
    base_url = "http://localhost:8000"
    
    print("🧪 Probando validaciones del chatbot...\n")
    
    # Test 1: Validación de nombre
    print("1️⃣ Probando validación de nombre...")
    test_cases_name = [
        ("j", "Nombre muy corto"),
        ("Juan", "Sin apellido"),
        ("123", "Números"),
        ("Juan@Perez", "Caracteres especiales"),
        ("Juan Pérez López", "Nombre válido"),
        ("María José García", "Nombre con acentos"),
    ]
    
    for test_input, description in test_cases_name:
        print(f"\n   Prueba: {description} - '{test_input}'")
        response = requests.post(f"{base_url}/chat", json={
            "text": "cita",
            "language": "es",
            "user_id": f"test_name_{hash(test_input)}"
        })
        
        # Enviar el nombre a probar
        response = requests.post(f"{base_url}/chat", json={
            "text": test_input,
            "language": "es",
            "user_id": f"test_name_{hash(test_input)}"
        })
        
        response_text = response.json()['response']
        print(f"   Respuesta: {response_text[:100]}...")
        
        if "❌" in response_text:
            print(f"   ✅ Validación funcionando (rechazó entrada inválida)")
        else:
            print(f"   ⚠️  Posible problema (aceptó entrada que debería ser inválida)")
    
    # Test 2: Validación de edad
    print("\n\n2️⃣ Probando validación de edad...")
    test_cases_age = [
        ("15", "Menor de edad"),
        ("abc", "No es número"),
        ("0", "Edad cero"),
        ("150", "Edad muy alta"),
        ("25", "Edad válida"),
        ("18", "Edad mínima"),
    ]
    
    for test_input, description in test_cases_age:
        print(f"\n   Prueba: {description} - '{test_input}'")
        
        # Iniciar conversación
        user_id = f"test_age_{hash(test_input)}"
        requests.post(f"{base_url}/chat", json={
            "text": "cita",
            "language": "es",
            "user_id": user_id
        })
        
        # Pasar nombre válido
        requests.post(f"{base_url}/chat", json={
            "text": "Juan Pérez López",
            "language": "es",
            "user_id": user_id
        })
        
        # Probar edad
        response = requests.post(f"{base_url}/chat", json={
            "text": test_input,
            "language": "es",
            "user_id": user_id
        })
        
        response_text = response.json()['response']
        print(f"   Respuesta: {response_text[:100]}...")
        
        if "❌" in response_text:
            print(f"   ✅ Validación funcionando (rechazó edad inválida)")
        else:
            print(f"   ⚠️  Posible problema (aceptó edad que debería ser inválida)")
    
    # Test 3: Validación de teléfono
    print("\n\n3️⃣ Probando validación de teléfono...")
    test_cases_phone = [
        ("123", "Muy corto"),
        ("abcdef", "Letras"),
        ("1234567890123456", "Muy largo"),
        ("612345678", "Válido"),
        ("612-345-678", "Con guiones"),
        ("(612) 345-678", "Con paréntesis"),
    ]
    
    for test_input, description in test_cases_phone:
        print(f"\n   Prueba: {description} - '{test_input}'")
        
        # Iniciar conversación y pasar datos válidos
        user_id = f"test_phone_{hash(test_input)}"
        requests.post(f"{base_url}/chat", json={
            "text": "cita",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "Juan Pérez López",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "25",
            "language": "es",
            "user_id": user_id
        })
        
        # Probar teléfono
        response = requests.post(f"{base_url}/chat", json={
            "text": test_input,
            "language": "es",
            "user_id": user_id
        })
        
        response_text = response.json()['response']
        print(f"   Respuesta: {response_text[:100]}...")
        
        if "❌" in response_text:
            print(f"   ✅ Validación funcionando (rechazó teléfono inválido)")
        else:
            print(f"   ⚠️  Posible problema (aceptó teléfono que debería ser inválido)")
    
    # Test 4: Validación de email
    print("\n\n4️⃣ Probando validación de email...")
    test_cases_email = [
        ("abc", "Muy corto"),
        ("usuario", "Sin @"),
        ("usuario@", "Sin dominio"),
        ("@dominio.com", "Sin usuario"),
        ("usuario@dominio", "Sin extensión"),
        ("usuario@dominio.com", "Válido"),
        ("usuario.test@dominio.co.uk", "Válido complejo"),
    ]
    
    for test_input, description in test_cases_email:
        print(f"\n   Prueba: {description} - '{test_input}'")
        
        # Iniciar conversación y pasar datos válidos
        user_id = f"test_email_{hash(test_input)}"
        requests.post(f"{base_url}/chat", json={
            "text": "cita",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "Juan Pérez López",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "25",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "612345678",
            "language": "es",
            "user_id": user_id
        })
        
        # Probar email
        response = requests.post(f"{base_url}/chat", json={
            "text": test_input,
            "language": "es",
            "user_id": user_id
        })
        
        response_text = response.json()['response']
        print(f"   Respuesta: {response_text[:100]}...")
        
        if "❌" in response_text:
            print(f"   ✅ Validación funcionando (rechazó email inválido)")
        else:
            print(f"   ⚠️  Posible problema (aceptó email que debería ser inválido)")
    
    # Test 5: Validación de motivo
    print("\n\n5️⃣ Probando validación de motivo...")
    test_cases_reason = [
        ("abc", "Muy corto"),
        ("aaa", "Caracteres repetidos"),
        ("123", "Solo números"),
        ("problema laboral", "Válido"),
        ("despido injustificado", "Válido largo"),
    ]
    
    for test_input, description in test_cases_reason:
        print(f"\n   Prueba: {description} - '{test_input}'")
        
        # Iniciar conversación y pasar datos válidos
        user_id = f"test_reason_{hash(test_input)}"
        requests.post(f"{base_url}/chat", json={
            "text": "cita",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "Juan Pérez López",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "25",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "612345678",
            "language": "es",
            "user_id": user_id
        })
        requests.post(f"{base_url}/chat", json={
            "text": "usuario@email.com",
            "language": "es",
            "user_id": user_id
        })
        
        # Probar motivo
        response = requests.post(f"{base_url}/chat", json={
            "text": test_input,
            "language": "es",
            "user_id": user_id
        })
        
        response_text = response.json()['response']
        print(f"   Respuesta: {response_text[:100]}...")
        
        if "❌" in response_text:
            print(f"   ✅ Validación funcionando (rechazó motivo inválido)")
        else:
            print(f"   ⚠️  Posible problema (aceptó motivo que debería ser inválido)")

def test_complete_valid_flow():
    """Probar un flujo completo con datos válidos"""
    base_url = "http://localhost:8000"
    
    print("\n\n" + "="*60)
    print("🎯 Probando flujo completo con datos válidos...\n")
    
    user_id = "test_valid_flow"
    
    # Flujo completo con datos válidos
    valid_data = [
        ("cita", "Solicitar cita"),
        ("Juan Pérez López", "Nombre válido"),
        ("25", "Edad válida"),
        ("612345678", "Teléfono válido"),
        ("juan.perez@email.com", "Email válido"),
        ("problema laboral con despido injustificado", "Motivo válido"),
        ("1", "Seleccionar fecha"),
        ("sí", "Confirmar cita"),
    ]
    
    for i, (data, description) in enumerate(valid_data, 1):
        print(f"{i}️⃣ {description}: '{data}'")
        response = requests.post(f"{base_url}/chat", json={
            "text": data,
            "language": "es",
            "user_id": user_id
        })
        
        response_text = response.json()['response']
        print(f"   Respuesta: {response_text[:150]}...")
        
        if "❌" in response_text:
            print(f"   ❌ ERROR: Validación rechazó datos válidos!")
        elif "🎉" in response_text:
            print(f"   ✅ ÉXITO: Cita confirmada correctamente!")
        else:
            print(f"   ✅ Continuando...")
        
        time.sleep(0.5)

if __name__ == "__main__":
    test_validations()
    test_complete_valid_flow() 