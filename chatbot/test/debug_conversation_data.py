#!/usr/bin/env python3
"""
Script para debuggear los datos de conversación del chatbot
Simula exactamente el flujo de conversación para ver qué datos se recopilan
"""

from typing import Dict, Union

def simulate_chatbot_conversation():
    """Simula la conversación del chatbot para ver qué datos se recopilan"""
    
    print("🔍 SIMULACIÓN DE CONVERSACIÓN DEL CHATBOT")
    print("=" * 50)
    
    # Simular la estructura de datos del chatbot
    conv_data: Dict[str, Union[str, int, None]] = {
        "fullName": None,
        "age": None,
        "phone": None,
        "email": None,
        "consultationReason": None,
        "preferredDate": None,
        "alternativeDate": None,
        "consultationType": None,
        "notes": None,
        "location": None
    }
    
    # Simular conversación paso a paso
    conversation_steps = [
        ("Hola", "initial"),
        ("Quiero una cita", "initial"),
        ("Juan Pérez López", "collecting_info"),
        ("28", "collecting_info"),
        ("+34 612 345 678", "collecting_info"),
        ("juan.perez@email.com", "collecting_info"),
        ("Problema con contrato de trabajo", "collecting_info"),
        ("Derecho Laboral", "collecting_info"),
        ("1", "collecting_info"),
        ("Sí, está todo correcto", "confirmation")
    ]
    
    print("💬 Simulando conversación...")
    print("-" * 30)
    
    for i, (message, expected_stage) in enumerate(conversation_steps, 1):
        print(f"\n{i}. Mensaje: '{message}'")
        print(f"   Etapa esperada: {expected_stage}")
        
        # Simular el procesamiento del mensaje
        if i == 3:  # Nombre
            conv_data["fullName"] = message
            print(f"   ✅ Nombre guardado: {conv_data['fullName']}")
        elif i == 4:  # Edad
            try:
                conv_data["age"] = int(message)
                print(f"   ✅ Edad guardada: {conv_data['age']}")
            except ValueError:
                print(f"   ❌ Error: Edad debe ser un número")
        elif i == 5:  # Teléfono
            conv_data["phone"] = message
            print(f"   ✅ Teléfono guardado: {conv_data['phone']}")
        elif i == 6:  # Email
            conv_data["email"] = message
            print(f"   ✅ Email guardado: {conv_data['email']}")
        elif i == 7:  # Motivo
            conv_data["consultationReason"] = message
            print(f"   ✅ Motivo guardado: {conv_data['consultationReason']}")
        elif i == 8:  # Tipo de consulta
            conv_data["consultationType"] = message
            print(f"   ✅ Tipo guardado: {conv_data['consultationType']}")
        elif i == 9:  # Fecha preferida
            # Simular selección de fecha
            available_dates = [
                "2024-01-15T10:00:00Z",
                "2024-01-16T14:00:00Z", 
                "2024-01-17T11:00:00Z"
            ]
            try:
                date_index = int(message) - 1
                if 0 <= date_index < len(available_dates):
                    conv_data["preferredDate"] = available_dates[date_index]
                    print(f"   ✅ Fecha guardada: {conv_data['preferredDate']}")
                else:
                    print(f"   ❌ Error: Opción de fecha inválida")
            except ValueError:
                print(f"   ❌ Error: Debe ser un número")
    
    print("\n" + "=" * 50)
    print("📋 DATOS FINALES RECOPILADOS")
    print("=" * 50)
    
    # Mostrar datos finales
    for key, value in conv_data.items():
        status = "✅" if value is not None else "❌"
        print(f"{status} {key}: {value}")
    
    # Verificar campos requeridos
    required_fields = ["fullName", "age", "phone", "email", "consultationReason", "preferredDate", "consultationType"]
    missing_fields = [field for field in required_fields if conv_data[field] is None]
    
    print(f"\n🔍 VERIFICACIÓN DE CAMPOS REQUERIDOS")
    print("-" * 30)
    
    if missing_fields:
        print(f"❌ Campos faltantes: {', '.join(missing_fields)}")
        print("   El chatbot no puede crear la cita sin estos campos")
    else:
        print("✅ Todos los campos requeridos están presentes")
        
        # Crear datos para envío al backend
        appointment_data = {k: v for k, v in conv_data.items() if v is not None}
        print(f"\n📤 Datos que se enviarían al backend:")
        for key, value in appointment_data.items():
            print(f"   • {key}: {value}")
    
    return conv_data

if __name__ == "__main__":
    simulate_chatbot_conversation() 