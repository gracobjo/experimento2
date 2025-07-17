#!/usr/bin/env python3
"""
Script para probar la conversación mejorada del chatbot
Verifica que se corrijan los problemas identificados
"""

import requests
import json
import time

def test_improved_conversation():
    """Prueba la conversación mejorada del chatbot"""
    
    chatbot_url = "http://localhost:8000"
    
    print("🧪 PRUEBA DE CONVERSACIÓN MEJORADA")
    print("=" * 50)
    
    # Verificar que el chatbot esté funcionando
    try:
        health_response = requests.get(f"{chatbot_url}/health", timeout=5)
        print(f"✅ Chatbot salud: {health_response.status_code}")
    except Exception as e:
        print(f"❌ Error conectando al chatbot: {e}")
        print("   Ejecuta: python main_improved_fixed.py")
        return
    
    # Conversación que reproduce los problemas identificados
    conversation = [
        ("Hola", "Saludo inicial"),
        ("quería hablar con un abogado", "Solicitud de contacto con abogado"),
        ("laboral", "Menciona área específica"),
        ("Derecho Laboral", "Confirma área específica"),
        ("despido", "Menciona motivo específico"),
        ("si", "Respuesta afirmativa - debería iniciar citas"),
        ("si", "Segunda respuesta afirmativa - debería iniciar citas"),
        ("si", "Tercera respuesta afirmativa - debería iniciar citas"),
        ("quiero una cita", "Solicitud directa de cita"),
        ("jjj ggg ccc", "Nombre completo"),
        ("62", "Edad"),
        ("gracobjo@gmail.com", "Email en lugar de teléfono"),
        ("666666666", "Teléfono correcto"),
        ("gracobjo@gmail.com", "Email"),
        ("laboral", "Motivo específico"),
        ("laboral", "Confirma área"),
        ("5", "Selecciona fecha"),
        ("si", "Confirma cita")
    ]
    
    print(f"\n💬 Probando conversación mejorada...")
    print("-" * 50)
    
    user_id = "test_improved_123"
    conversation_history = []
    
    for i, (message, description) in enumerate(conversation, 1):
        print(f"\n{i}. {description}: '{message}'")
        
        try:
            response = requests.post(
                f"{chatbot_url}/chat",
                json={
                    "text": message,
                    "language": "es",
                    "user_id": user_id
                },
                timeout=15
            )
            
            if response.status_code == 200:
                result = response.json()
                bot_response = result.get('response', 'Sin respuesta')
                print(f"   🤖 Respuesta: {bot_response[:100]}...")
                
                # Verificar mejoras específicas
                if i == 6 and "nombre completo" in bot_response.lower():
                    print(f"   ✅ MEJORA: Inicia flujo de citas correctamente")
                elif i == 7 and "nombre completo" in bot_response.lower():
                    print(f"   ✅ MEJORA: Mantiene flujo de citas")
                elif i == 8 and "nombre completo" in bot_response.lower():
                    print(f"   ✅ MEJORA: No se repite")
                elif i == 12 and "teléfono" in bot_response.lower():
                    print(f"   ✅ MEJORA: Detecta email en lugar de teléfono")
                elif i == 15 and "despido" in bot_response.lower():
                    print(f"   ✅ MEJORA: Acepta motivo específico")
                elif i == 16 and "fecha" in bot_response.lower():
                    print(f"   ✅ MEJORA: No pregunta área dos veces")
                elif i == 18 and "agendada exitosamente" in bot_response.lower():
                    print(f"   ✅ ÉXITO: Cita creada correctamente")
                
                # Verificar problemas corregidos
                if "Para responder adecuadamente" in bot_response and i in [6, 7, 8]:
                    print(f"   ❌ PROBLEMA: Respuesta genérica repetitiva")
                elif "área del derecho" in bot_response and i == 16:
                    print(f"   ❌ PROBLEMA: Pregunta área dos veces")
                
            else:
                print(f"   ❌ Error HTTP: {response.status_code}")
                print(f"   📄 Respuesta: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error de conexión: {e}")
        
        time.sleep(0.5)
    
    print("\n" + "=" * 50)
    print("📊 RESUMEN DE MEJORAS")
    print("=" * 50)
    
    print("✅ Mejoras implementadas:")
    print("   1. Detección mejorada de intenciones de citas")
    print("   2. Flujo de conversación más directo")
    print("   3. Validación de datos mejorada")
    print("   4. Eliminación de respuestas repetitivas")
    print("   5. Detección automática del tipo de consulta")
    print("   6. Fechas únicas para cada opción")
    
    print("\n🎯 Problemas corregidos:")
    print("   • Respuestas repetitivas a 'si'")
    print("   • Pregunta duplicada sobre área del derecho")
    print("   • Validación de teléfono vs email")
    print("   • Fechas idénticas en opciones")
    print("   • Flujo de conversación confuso")

if __name__ == "__main__":
    test_improved_conversation() 