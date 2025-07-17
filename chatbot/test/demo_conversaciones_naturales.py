#!/usr/bin/env python3
"""
Script de demostración de las nuevas funcionalidades naturales del chatbot
Muestra conversaciones reales que destacan las mejoras implementadas
"""

import requests
import json
import time
import random
from typing import List, Dict, Tuple

# Configuración
CHATBOT_URL = "http://localhost:8000"

class ChatbotDemo:
    def __init__(self):
        self.session_id = f"demo_user_{random.randint(1000, 9999)}"
        self.conversation_log = []
    
    def send_message(self, text: str) -> Dict:
        """Envía un mensaje al chatbot y retorna la respuesta"""
        try:
            response = requests.post(f"{CHATBOT_URL}/chat", json={
                "text": text,
                "language": "es",
                "user_id": self.session_id
            })
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Error {response.status_code}: {response.text}"}
        except Exception as e:
            return {"error": f"Error de conexión: {e}"}
    
    def log_conversation(self, user_msg: str, bot_response: str, feature: str):
        """Registra la conversación con la funcionalidad demostrada"""
        self.conversation_log.append({
            "user": user_msg,
            "bot": bot_response,
            "feature": feature
        })
    
    def print_conversation(self, user_msg: str, bot_response: str, feature: str):
        """Imprime la conversación con formato"""
        print(f"\n🎯 {feature}")
        print("-" * 50)
        print(f"👤 Usuario: {user_msg}")
        print(f"🤖 Chatbot: {bot_response}")
        print("-" * 50)
    
    def demo_personalization(self):
        """Demuestra la personalización con nombres"""
        print("\n🌟 DEMOSTRACIÓN: PERSONALIZACIÓN CON NOMBRES")
        print("=" * 60)
        
        # Extracción de nombre
        user_msg = "Hola, me llamo Ana María Rodríguez"
        response = self.send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        self.print_conversation(user_msg, bot_response, "Extracción de Nombre")
        self.log_conversation(user_msg, bot_response, "Personalización")
        
        # Saludo personalizado
        user_msg = "Hola de nuevo"
        response = self.send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        self.print_conversation(user_msg, bot_response, "Saludo Personalizado")
        self.log_conversation(user_msg, bot_response, "Personalización")
    
    def demo_intent_detection(self):
        """Demuestra la detección de múltiples intenciones"""
        print("\n🎯 DEMOSTRACIÓN: DETECCIÓN DE INTENCIONES")
        print("=" * 60)
        
        intents_demo = [
            ("Saludos", "Buenos días, ¿cómo están?"),
            ("Agradecimientos", "Muchas gracias por la información"),
            ("Despedidas", "Hasta luego, que tengan buen día"),
            ("Emergencias", "Necesito ayuda urgente con un problema legal"),
            ("Quejas", "Estoy muy molesto con mi situación laboral"),
            ("Ayuda", "No sé qué hacer, necesito orientación"),
            ("Preguntas Generales", "¿Qué es el derecho civil?"),
            ("Información", "Cuéntame más sobre sus servicios")
        ]
        
        for intent_name, user_msg in intents_demo:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Intención: {intent_name}")
            self.log_conversation(user_msg, bot_response, f"Detección: {intent_name}")
            time.sleep(1)
    
    def demo_sentiment_analysis(self):
        """Demuestra el análisis de sentimientos"""
        print("\n😊 DEMOSTRACIÓN: ANÁLISIS DE SENTIMIENTOS")
        print("=" * 60)
        
        sentiment_demos = [
            ("Positivo", "¡Excelente! Me encanta cómo me han ayudado"),
            ("Negativo", "Estoy muy frustrado con este problema legal"),
            ("Neutral", "Necesito información sobre honorarios"),
            ("Positivo", "Perfecto, muy agradecido por la atención"),
            ("Negativo", "Es terrible lo que me está pasando"),
            ("Neutral", "¿Cuál es su horario de atención?")
        ]
        
        for sentiment, user_msg in sentiment_demos:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Sentimiento: {sentiment}")
            self.log_conversation(user_msg, bot_response, f"Sentimiento: {sentiment}")
            time.sleep(1)
    
    def demo_context_awareness(self):
        """Demuestra la conciencia de contexto"""
        print("\n🧠 DEMOSTRACIÓN: CONCIENCIA DE CONTEXTO")
        print("=" * 60)
        
        context_conversation = [
            "Hola, me llamo Carlos López",
            "¿Qué servicios ofrecen en derecho laboral?",
            "Me interesa especialmente los casos de despido",
            "¿Cuánto cobran por una consulta sobre esto?",
            "¿Tienen experiencia en casos similares?",
            "Perfecto, entonces quiero agendar una cita",
            "¿Qué documentos necesito llevar?"
        ]
        
        for i, user_msg in enumerate(context_conversation, 1):
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Contexto {i}")
            self.log_conversation(user_msg, bot_response, "Conciencia de Contexto")
            time.sleep(1)
    
    def demo_empathy_and_understanding(self):
        """Demuestra la empatía y comprensión"""
        print("\n💝 DEMOSTRACIÓN: EMPATÍA Y COMPRENSIÓN")
        print("=" * 60)
        
        empathy_demos = [
            ("Frustración", "Estoy muy molesto porque me despidieron sin justificación"),
            ("Preocupación", "Me preocupa mucho mi situación legal"),
            ("Confusión", "No entiendo qué está pasando con mi caso"),
            ("Estrés", "Estoy muy estresado con todo este proceso"),
            ("Esperanza", "Espero que puedan ayudarme con mi problema")
        ]
        
        for emotion, user_msg in empathy_demos:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Emoción: {emotion}")
            self.log_conversation(user_msg, bot_response, f"Empatía: {emotion}")
            time.sleep(1)
    
    def demo_natural_transitions(self):
        """Demuestra transiciones naturales entre temas"""
        print("\n🔄 DEMOSTRACIÓN: TRANSICIONES NATURALES")
        print("=" * 60)
        
        natural_flow = [
            "Hola, me llamo Laura",
            "¿Qué servicios tienen?",
            "Me interesa el derecho familiar",
            "¿Cuánto cobran por una consulta?",
            "¿Tienen experiencia en divorcios?",
            "¿Y en custodia de hijos?",
            "Perfecto, me gustaría agendar una cita",
            "¿Qué día tienen disponible?",
            "Gracias por toda la información",
            "Hasta luego"
        ]
        
        for i, user_msg in enumerate(natural_flow, 1):
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Transición {i}")
            self.log_conversation(user_msg, bot_response, "Transiciones Naturales")
            time.sleep(1)
    
    def demo_expanded_knowledge(self):
        """Demuestra la base de conocimientos expandida"""
        print("\n📚 DEMOSTRACIÓN: BASE DE CONOCIMIENTOS EXPANDIDA")
        print("=" * 60)
        
        knowledge_demos = [
            ("Experiencia", "¿Cuántos años de experiencia tienen?"),
            ("Confidencialidad", "¿Es confidencial la información que comparto?"),
            ("Horarios", "¿Cuál es su horario de atención?"),
            ("Ubicación", "¿Dónde están ubicados?"),
            ("Emergencias", "¿Qué hago si tengo una emergencia legal?"),
            ("Documentos", "¿Qué documentos necesito para mi consulta?"),
            ("Honorarios", "¿Cómo funcionan los honorarios?"),
            ("Especialidades", "¿En qué se especializan más?")
        ]
        
        for topic, user_msg in knowledge_demos:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Tema: {topic}")
            self.log_conversation(user_msg, bot_response, f"Conocimientos: {topic}")
            time.sleep(1)
    
    def demo_reset_functionality(self):
        """Demuestra la funcionalidad de reset"""
        print("\n🔄 DEMOSTRACIÓN: FUNCIONALIDAD DE RESET")
        print("=" * 60)
        
        # Conversación inicial
        user_msg = "Hola, me llamo Roberto"
        response = self.send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        self.print_conversation(user_msg, bot_response, "Conversación Inicial")
        
        # Reset
        user_msg = "reset"
        response = self.send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        self.print_conversation(user_msg, bot_response, "Comando Reset")
        
        # Nueva conversación
        user_msg = "Hola de nuevo"
        response = self.send_message(user_msg)
        bot_response = response.get("response", "Sin respuesta")
        self.print_conversation(user_msg, bot_response, "Nueva Conversación")
    
    def demo_appointment_flow(self):
        """Demuestra el flujo mejorado de agendamiento de citas"""
        print("\n📅 DEMOSTRACIÓN: FLUJO DE AGENDAMIENTO MEJORADO")
        print("=" * 60)
        
        appointment_flow = [
            "Quiero agendar una cita",
            "Me llamo María González",
            "Tengo 28 años",
            "+34 612345678",
            "maria.gonzalez@email.com",
            "Tengo un problema con mi contrato de trabajo",
            "La opción 1",
            "Sí, confirmo todos los datos"
        ]
        
        for i, user_msg in enumerate(appointment_flow, 1):
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Paso {i}")
            self.log_conversation(user_msg, bot_response, "Agendamiento")
            time.sleep(1)
    
    def demo_mixed_conversation(self):
        """Demuestra una conversación mixta que combina múltiples funcionalidades"""
        print("\n🎭 DEMOSTRACIÓN: CONVERSACIÓN MIXTA")
        print("=" * 60)
        
        mixed_conversation = [
            "Hola, me llamo Pedro Martínez",
            "¿Qué servicios tienen?",
            "Me interesa el derecho mercantil",
            "¿Cuánto cobran?",
            "Gracias por la información",
            "¿Tienen experiencia en casos de quiebra?",
            "Es que estoy muy preocupado con mi empresa",
            "¿Podrían ayudarme?",
            "Perfecto, entonces quiero agendar una cita",
            "Muchas gracias por todo",
            "Hasta luego"
        ]
        
        for i, user_msg in enumerate(mixed_conversation, 1):
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(user_msg, bot_response, f"Mixta {i}")
            self.log_conversation(user_msg, bot_response, "Conversación Mixta")
            time.sleep(1)
    
    def generate_report(self):
        """Genera un reporte de la demostración"""
        print("\n📊 REPORTE DE LA DEMOSTRACIÓN")
        print("=" * 60)
        
        # Estadísticas
        total_exchanges = len(self.conversation_log)
        features_demoed = set(item["feature"] for item in self.conversation_log)
        
        print(f"✅ Total de intercambios: {total_exchanges}")
        print(f"✅ Funcionalidades demostradas: {len(features_demoed)}")
        print(f"✅ Usuario de prueba: {self.session_id}")
        
        print("\n🎯 Funcionalidades Demostradas:")
        for feature in sorted(features_demoed):
            count = len([item for item in self.conversation_log if item["feature"] == feature])
            print(f"   • {feature}: {count} intercambios")
        
        print("\n🎉 ¡Demostración Completada!")
        print("El chatbot ha demostrado todas sus nuevas capacidades naturales.")
    
    def run_full_demo(self):
        """Ejecuta la demostración completa"""
        print("🚀 DEMOSTRACIÓN COMPLETA DEL CHATBOT MEJORADO")
        print("=" * 80)
        print("Este script demuestra todas las nuevas funcionalidades implementadas:")
        print("• Personalización con nombres")
        print("• Detección de múltiples intenciones")
        print("• Análisis de sentimientos")
        print("• Conciencia de contexto")
        print("• Empatía y comprensión")
        print("• Transiciones naturales")
        print("• Base de conocimientos expandida")
        print("• Funcionalidad de reset")
        print("• Flujo de agendamiento mejorado")
        print("=" * 80)
        
        try:
            # Verificar que el chatbot esté funcionando
            health_response = requests.get(f"{CHATBOT_URL}/health")
            if health_response.status_code != 200:
                print("❌ El chatbot no está funcionando. Asegúrate de que esté ejecutándose en el puerto 8000.")
                return
            
            print("✅ Chatbot funcionando correctamente")
            print("🎬 Iniciando demostraciones...")
            
            # Ejecutar todas las demostraciones
            self.demo_personalization()
            self.demo_intent_detection()
            self.demo_sentiment_analysis()
            self.demo_context_awareness()
            self.demo_empathy_and_understanding()
            self.demo_natural_transitions()
            self.demo_expanded_knowledge()
            self.demo_reset_functionality()
            self.demo_appointment_flow()
            self.demo_mixed_conversation()
            
            # Generar reporte
            self.generate_report()
            
        except Exception as e:
            print(f"❌ Error durante la demostración: {e}")

def main():
    """Función principal"""
    demo = ChatbotDemo()
    demo.run_full_demo()

if __name__ == "__main__":
    main() 