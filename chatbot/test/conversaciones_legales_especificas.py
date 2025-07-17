#!/usr/bin/env python3
"""
Script con conversaciones específicas para diferentes áreas legales
Demuestra cómo el chatbot maneja consultas especializadas de manera natural
"""

import requests
import json
import time
from typing import Dict

# Configuración
CHATBOT_URL = "http://localhost:8000"

class ConversacionesLegales:
    def __init__(self):
        self.session_id = "legal_demo_user"
    
    def send_message(self, text: str) -> Dict:
        """Envía un mensaje al chatbot"""
        try:
            response = requests.post(f"{CHATBOT_URL}/chat", json={
                "text": text,
                "language": "es",
                "user_id": self.session_id
            })
            if response.status_code == 200:
                return response.json()
            else:
                return {"error": f"Error {response.status_code}"}
        except Exception as e:
            return {"error": f"Error de conexión: {e}"}
    
    def print_conversation(self, title: str, user_msg: str, bot_response: str):
        """Imprime la conversación con formato"""
        print(f"\n🏛️ {title}")
        print("=" * 60)
        print(f"👤 Usuario: {user_msg}")
        print(f"🤖 Chatbot: {bot_response}")
        print("=" * 60)
    
    def demo_derecho_laboral(self):
        """Demuestra conversaciones sobre derecho laboral"""
        print("\n💼 CONVERSACIONES: DERECHO LABORAL")
        print("=" * 60)
        
        conversaciones = [
            ("Consulta sobre Despido", "Me despidieron sin previo aviso, ¿qué puedo hacer?"),
            ("Horarios de Trabajo", "Mi jefe me hace trabajar más horas de las que dice mi contrato"),
            ("Salarios", "No me han pagado mi salario completo este mes"),
            ("Acoso Laboral", "Mi supervisor me está acosando en el trabajo"),
            ("Accidentes Laborales", "Tuve un accidente en el trabajo, ¿qué derechos tengo?"),
            ("Negociación Colectiva", "¿Pueden ayudarme con la negociación de un convenio colectivo?")
        ]
        
        for title, user_msg in conversaciones:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_derecho_familiar(self):
        """Demuestra conversaciones sobre derecho familiar"""
        print("\n👨‍👩‍👧‍👦 CONVERSACIONES: DERECHO FAMILIAR")
        print("=" * 60)
        
        conversaciones = [
            ("Divorcio", "Quiero divorciarme, ¿cómo debo proceder?"),
            ("Custodia de Hijos", "¿Cómo se determina la custodia de los hijos en un divorcio?"),
            ("Pensión Alimenticia", "Necesito ayuda con la pensión alimenticia de mis hijos"),
            ("Herencia", "Mi padre falleció sin testamento, ¿qué debo hacer?"),
            ("Adopción", "Estamos interesados en adoptar un niño"),
            ("Violencia Doméstica", "Sufro violencia doméstica, necesito ayuda legal")
        ]
        
        for title, user_msg in conversaciones:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_derecho_civil(self):
        """Demuestra conversaciones sobre derecho civil"""
        print("\n⚖️ CONVERSACIONES: DERECHO CIVIL")
        print("=" * 60)
        
        conversaciones = [
            ("Contratos", "Firmé un contrato que no entiendo, ¿pueden revisarlo?"),
            ("Daños y Perjuicios", "Mi vecino me causó daños en mi propiedad"),
            ("Responsabilidad Civil", "Tuve un accidente de tráfico, ¿quién es responsable?"),
            ("Propiedad Intelectual", "Alguien está usando mi marca sin permiso"),
            ("Arrendamiento", "Mi casero quiere echarme sin previo aviso"),
            ("Sucesiones", "Necesito ayuda para tramitar una herencia")
        ]
        
        for title, user_msg in conversaciones:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_derecho_mercantil(self):
        """Demuestra conversaciones sobre derecho mercantil"""
        print("\n🏢 CONVERSACIONES: DERECHO MERCANTIL")
        print("=" * 60)
        
        conversaciones = [
            ("Constitución de Empresa", "Quiero crear una empresa, ¿qué tipo me recomiendan?"),
            ("Contratos Comerciales", "Necesito revisar un contrato con un proveedor"),
            ("Quiebra", "Mi empresa está en problemas financieros"),
            ("Sociedades", "Tengo conflictos con mis socios"),
            ("Propiedad Industrial", "Quiero registrar una patente"),
            ("Fusión de Empresas", "Estamos considerando fusionar nuestra empresa")
        ]
        
        for title, user_msg in conversaciones:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_derecho_penal(self):
        """Demuestra conversaciones sobre derecho penal"""
        print("\n🚨 CONVERSACIONES: DERECHO PENAL")
        print("=" * 60)
        
        conversaciones = [
            ("Defensa Penal", "Me han acusado de un delito que no cometí"),
            ("Detención", "Me detuvieron anoche, ¿qué debo hacer?"),
            ("Multas", "Recibí una multa muy alta, ¿puedo recurrirla?"),
            ("Delitos Económicos", "Me acusan de fraude fiscal"),
            ("Delitos Informáticos", "Me han hackeado mi cuenta bancaria"),
            ("Libertad Condicional", "¿Puedo solicitar la libertad condicional?")
        ]
        
        for title, user_msg in conversaciones:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_derecho_administrativo(self):
        """Demuestra conversaciones sobre derecho administrativo"""
        print("\n🏛️ CONVERSACIONES: DERECHO ADMINISTRATIVO")
        print("=" * 60)
        
        conversaciones = [
            ("Sanciones Administrativas", "Me han puesto una sanción muy alta"),
            ("Licencias", "Me denegaron una licencia comercial"),
            ("Expropiación", "El ayuntamiento quiere expropiar mi terreno"),
            ("Contratación Pública", "Quiero participar en una licitación pública"),
            ("Recursos Administrativos", "¿Cómo puedo recurrir una decisión administrativa?"),
            ("Responsabilidad Patrimonial", "La administración me causó daños")
        ]
        
        for title, user_msg in conversaciones:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_emergencias_legales(self):
        """Demuestra el manejo de emergencias legales"""
        print("\n🚨 CONVERSACIONES: EMERGENCIAS LEGALES")
        print("=" * 60)
        
        emergencias = [
            ("Detención Inmediata", "Me están deteniendo ahora mismo"),
            ("Desahucio Inminente", "Me van a echar de mi casa mañana"),
            ("Accidente Grave", "Tuve un accidente grave y necesito ayuda"),
            ("Violencia Urgente", "Estoy sufriendo violencia y necesito protección"),
            ("Problema Empresarial Crítico", "Mi empresa está al borde de la quiebra"),
            ("Conflicto Familiar Grave", "Tengo un conflicto familiar muy serio")
        ]
        
        for title, user_msg in emergencias:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_consultas_generales(self):
        """Demuestra consultas generales sobre servicios legales"""
        print("\n❓ CONVERSACIONES: CONSULTAS GENERALES")
        print("=" * 60)
        
        consultas = [
            ("Primera Consulta", "¿Cómo funciona la primera consulta?"),
            ("Honorarios", "¿Cómo se calculan los honorarios?"),
            ("Confidencialidad", "¿Es confidencial todo lo que les cuente?"),
            ("Experiencia", "¿Cuántos años de experiencia tienen?"),
            ("Especialidades", "¿En qué se especializan más?"),
            ("Proceso Legal", "¿Cómo funciona el proceso legal típico?"),
            ("Tiempo de Resolución", "¿Cuánto tiempo suele tardar un caso?"),
            ("Documentación", "¿Qué documentos necesito para mi consulta?")
        ]
        
        for title, user_msg in consultas:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_conversaciones_emocionales(self):
        """Demuestra el manejo de conversaciones emocionales"""
        print("\n💝 CONVERSACIONES: MANEJO EMOCIONAL")
        print("=" * 60)
        
        emociones = [
            ("Frustración", "Estoy muy frustrado porque llevo meses con este problema"),
            ("Miedo", "Tengo miedo de perder mi trabajo y mi casa"),
            ("Confusión", "No entiendo nada de lo que está pasando"),
            ("Estrés", "Estoy muy estresado con toda esta situación"),
            ("Esperanza", "Espero que puedan ayudarme a resolver esto"),
            ("Gratitud", "Muchas gracias por escucharme y ayudarme"),
            ("Alivio", "Me siento aliviado de haber encontrado ayuda profesional")
        ]
        
        for title, user_msg in emociones:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def demo_conversaciones_complejas(self):
        """Demuestra conversaciones complejas que combinan múltiples temas"""
        print("\n🎭 CONVERSACIONES: CASOS COMPLEJOS")
        print("=" * 60)
        
        casos_complejos = [
            ("Caso Laboral Complejo", "Me despidieron, tengo deudas, y mi familia depende de mí"),
            ("Caso Familiar Difícil", "Mi divorcio es complicado, hay hijos menores y propiedades"),
            ("Caso Empresarial", "Mi empresa está en crisis, tengo socios conflictivos y deudas"),
            ("Caso Penal Sensible", "Me acusan de algo que no hice, mi reputación está en juego"),
            ("Caso Administrativo", "La administración me está persiguiendo con multas injustas")
        ]
        
        for title, user_msg in casos_complejos:
            response = self.send_message(user_msg)
            bot_response = response.get("response", "Sin respuesta")
            self.print_conversation(title, user_msg, bot_response)
            time.sleep(1)
    
    def run_all_conversations(self):
        """Ejecuta todas las conversaciones legales específicas"""
        print("🏛️ CONVERSACIONES LEGALES ESPECÍFICAS")
        print("=" * 80)
        print("Este script demuestra cómo el chatbot maneja consultas especializadas:")
        print("• Derecho Laboral")
        print("• Derecho Familiar")
        print("• Derecho Civil")
        print("• Derecho Mercantil")
        print("• Derecho Penal")
        print("• Derecho Administrativo")
        print("• Emergencias Legales")
        print("• Consultas Generales")
        print("• Manejo Emocional")
        print("• Casos Complejos")
        print("=" * 80)
        
        try:
            # Verificar que el chatbot esté funcionando
            health_response = requests.get(f"{CHATBOT_URL}/health")
            if health_response.status_code != 200:
                print("❌ El chatbot no está funcionando. Asegúrate de que esté ejecutándose en el puerto 8000.")
                return
            
            print("✅ Chatbot funcionando correctamente")
            print("🎬 Iniciando conversaciones legales específicas...")
            
            # Ejecutar todas las conversaciones
            self.demo_derecho_laboral()
            self.demo_derecho_familiar()
            self.demo_derecho_civil()
            self.demo_derecho_mercantil()
            self.demo_derecho_penal()
            self.demo_derecho_administrativo()
            self.demo_emergencias_legales()
            self.demo_consultas_generales()
            self.demo_conversaciones_emocionales()
            self.demo_conversaciones_complejas()
            
            print("\n🎉 ¡Todas las conversaciones legales completadas!")
            print("El chatbot ha demostrado su capacidad para manejar consultas especializadas de manera natural y profesional.")
            
        except Exception as e:
            print(f"❌ Error durante las conversaciones: {e}")

def main():
    """Función principal"""
    conversaciones = ConversacionesLegales()
    conversaciones.run_all_conversations()

if __name__ == "__main__":
    main() 