"""
🤖 Alternativas NLP Más Naturales para el Chatbot
==================================================

Este archivo contiene las mejores alternativas de procesamiento de lenguaje natural
que pueden incorporarse al proyecto para hacer el chatbot más inteligente y natural.
"""

import os
from typing import Optional, Dict, Any, List
from dataclasses import dataclass
import json

@dataclass
class NLPAlternative:
    name: str
    description: str
    pros: List[str]
    cons: List[str]
    installation: str
    usage_example: str
    complexity: str  # "low", "medium", "high"
    cost: str  # "free", "low", "medium", "high"

# ============================================================================
# 1. MODELOS LOCALES AVANZADOS
# ============================================================================

LOCAL_MODELS = {
    "llama-cpp-python": NLPAlternative(
        name="llama-cpp-python",
        description="Modelos Llama 2/3 locales con optimización C++",
        pros=[
            "✅ Completamente local - sin dependencias externas",
            "✅ Excelente rendimiento en español",
            "✅ Modelos desde 7B hasta 70B parámetros",
            "✅ Bajo consumo de memoria",
            "✅ Respuestas más coherentes y contextuales"
        ],
        cons=[
            "❌ Requiere más RAM (8GB+ para modelos grandes)",
            "❌ Descarga inicial grande (3-40GB)",
            "❌ Configuración inicial compleja"
        ],
        installation="""
# Instalar llama-cpp-python
pip install llama-cpp-python

# Para GPU (opcional, más rápido)
pip install llama-cpp-python[cuBLAS]

# Descargar modelo (ejemplo: Llama-2-7b-chat-gguf)
wget https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf
""",
        usage_example="""
from llama_cpp import Llama

# Cargar modelo
llm = Llama(
    model_path="./llama-2-7b-chat.Q4_K_M.gguf",
    n_ctx=2048,
    n_threads=4
)

# Generar respuesta
response = llm.create_chat_completion([
    {"role": "system", "content": "Eres un asistente legal profesional..."},
    {"role": "user", "content": "¿Cómo puedo agendar una cita?"}
])

print(response['choices'][0]['message']['content'])
""",
        complexity="medium",
        cost="free"
    ),

    "transformers-local": NLPAlternative(
        name="transformers-local",
        description="Modelos Hugging Face ejecutados localmente",
        pros=[
            "✅ Gran variedad de modelos disponibles",
            "✅ Excelente para español (BETO, mBERT)",
            "✅ Fácil integración con el código existente",
            "✅ Modelos especializados en diferentes tareas"
        ],
        cons=[
            "❌ Consumo de memoria alto",
            "❌ Requiere GPU para rendimiento óptimo",
            "❌ Configuración compleja para optimización"
        ],
        installation="""
# Instalar transformers
pip install transformers torch accelerate

# Para GPU (recomendado)
pip install transformers[torch] torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
""",
        usage_example="""
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Cargar modelo español
tokenizer = AutoTokenizer.from_pretrained("PlanTL-GOB-ES/roberta-base-bne")
model = AutoModelForCausalLM.from_pretrained("PlanTL-GOB-ES/roberta-base-bne")

# Generar respuesta
inputs = tokenizer("¿Cómo puedo agendar una cita?", return_tensors="pt")
outputs = model.generate(**inputs, max_length=100)
response = tokenizer.decode(outputs[0], skip_special_tokens=True)
""",
        complexity="high",
        cost="free"
    )
}

# ============================================================================
# 2. SERVICIOS DE IA AVANZADOS
# ============================================================================

CLOUD_SERVICES = {
    "openai-gpt4": NLPAlternative(
        name="OpenAI GPT-4",
        description="Modelo más avanzado de OpenAI con excelente comprensión",
        pros=[
            "✅ Calidad de respuesta excepcional",
            "✅ Excelente comprensión del contexto",
            "✅ Respuestas muy naturales y coherentes",
            "✅ Fácil integración con API"
        ],
        cons=[
            "❌ Costo alto por token",
            "❌ Dependencia de servicio externo",
            "❌ Posibles limitaciones de rate limit"
        ],
        installation="""
# Instalar OpenAI
pip install openai

# Configurar API key
export OPENAI_API_KEY="tu-api-key"
""",
        usage_example="""
import openai

client = openai.OpenAI(api_key="tu-api-key")

response = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": "Eres un asistente legal profesional..."},
        {"role": "user", "content": "¿Cómo puedo agendar una cita?"}
    ],
    max_tokens=150,
    temperature=0.7
)

print(response.choices[0].message.content)
""",
        complexity="low",
        cost="high"
    ),

    "anthropic-claude": NLPAlternative(
        name="Anthropic Claude",
        description="Modelo de Anthropic con excelente razonamiento",
        pros=[
            "✅ Razonamiento lógico superior",
            "✅ Respuestas más seguras y éticas",
            "✅ Excelente para consultas complejas",
            "✅ Contexto muy largo (200k tokens)"
        ],
        cons=[
            "❌ Costo alto",
            "❌ API menos madura que OpenAI",
            "❌ Menos documentación disponible"
        ],
        installation="""
# Instalar Anthropic
pip install anthropic

# Configurar API key
export ANTHROPIC_API_KEY="tu-api-key"
""",
        usage_example="""
import anthropic

client = anthropic.Anthropic(api_key="tu-api-key")

response = client.messages.create(
    model="claude-3-sonnet-20240229",
    max_tokens=150,
    messages=[
        {"role": "user", "content": "¿Cómo puedo agendar una cita legal?"}
    ]
)

print(response.content[0].text)
""",
        complexity="low",
        cost="high"
    ),

    "cohere-command": NLPAlternative(
        name="Cohere Command",
        description="Modelo especializado en conversaciones",
        pros=[
            "✅ Excelente para conversaciones",
            "✅ Respuestas más naturales",
            "✅ Precios competitivos",
            "✅ API muy estable"
        ],
        cons=[
            "❌ Menos conocido que OpenAI",
            "❌ Modelo más pequeño",
            "❌ Menos capacidades avanzadas"
        ],
        installation="""
# Instalar Cohere
pip install cohere

# Configurar API key
export COHERE_API_KEY="tu-api-key"
""",
        usage_example="""
import cohere

co = cohere.Client("tu-api-key")

response = co.generate(
    model="command",
    prompt="Eres un asistente legal. Usuario: ¿Cómo puedo agendar una cita?",
    max_tokens=150,
    temperature=0.7
)

print(response.generations[0].text)
""",
        complexity="low",
        cost="medium"
    )
}

# ============================================================================
# 3. PROCESAMIENTO DE LENGUAJE ESPECIALIZADO
# ============================================================================

SPECIALIZED_NLP = {
    "spacy-transformers": NLPAlternative(
        name="spaCy Transformers",
        description="Pipeline de spaCy con modelos transformers",
        pros=[
            "✅ Mejor comprensión semántica",
            "✅ Entidades nombradas más precisas",
            "✅ Análisis de sentimientos",
            "✅ Integración perfecta con spaCy existente"
        ],
        cons=[
            "❌ Modelos más pesados",
            "❌ Requiere más recursos",
            "❌ Configuración más compleja"
        ],
        installation="""
# Instalar spaCy transformers
pip install spacy-transformers

# Descargar modelo con transformers
python -m spacy download es_core_news_lg
python -m spacy download en_core_web_trf
""",
        usage_example="""
import spacy

# Cargar modelo con transformers
nlp = spacy.load("es_core_news_lg")

# Procesar texto
doc = nlp("Necesito agendar una cita para consulta sobre divorcio")

# Extraer entidades
for ent in doc.ents:
    print(f"{ent.text}: {ent.label_}")

# Análisis de sentimientos (requiere configuración adicional)
# sentiment = doc.sentiment
""",
        complexity="medium",
        cost="free"
    ),

    "flair": NLPAlternative(
        name="Flair",
        description="Framework de NLP con modelos pre-entrenados",
        pros=[
            "✅ Modelos especializados en español",
            "✅ Excelente para análisis de sentimientos",
            "✅ Detección de entidades nombradas",
            "✅ Fácil de usar"
        ],
        cons=[
            "❌ Menos popular que spaCy",
            "❌ Documentación limitada",
            "❌ Comunidad más pequeña"
        ],
        installation="""
# Instalar Flair
pip install flair

# Descargar modelos
python -c "from flair.models import SequenceTagger; SequenceTagger.load('ner')"
""",
        usage_example="""
from flair.models import TextClassifier
from flair.data import Sentence

# Cargar clasificador de sentimientos
classifier = TextClassifier.load('sentiment')

# Analizar sentimiento
sentence = Sentence("Necesito ayuda legal urgente")
classifier.predict(sentence)

print(sentence.labels)
""",
        complexity="low",
        cost="free"
    ),

    "sentence-transformers": NLPAlternative(
        name="Sentence Transformers",
        description="Modelos para embeddings semánticos",
        pros=[
            "✅ Excelente para similitud semántica",
            "✅ Respuestas más contextuales",
            "✅ Fácil integración",
            "✅ Modelos multilingües"
        ],
        cons=[
            "❌ No genera texto directamente",
            "❌ Requiere base de conocimientos",
            "❌ Configuración adicional necesaria"
        ],
        installation="""
# Instalar sentence-transformers
pip install sentence-transformers
""",
        usage_example="""
from sentence_transformers import SentenceTransformer, util

# Cargar modelo multilingüe
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

# Calcular similitud
query = "¿Cómo agendo una cita?"
responses = [
    "Para agendar una cita, necesito algunos datos...",
    "Las citas se programan de lunes a viernes...",
    "Nuestro horario es de 9:00 a 18:00..."
]

# Calcular embeddings
query_embedding = model.encode(query)
response_embeddings = model.encode(responses)

# Encontrar respuesta más similar
cosine_scores = util.pytorch_cos_sim(query_embedding, response_embeddings)
best_response = responses[cosine_scores.argmax()]
""",
        complexity="medium",
        cost="free"
    )
}

# ============================================================================
# 4. FRAMEWORKS DE CONVERSACIÓN AVANZADOS
# ============================================================================

CONVERSATION_FRAMEWORKS = {
    "rasa": NLPAlternative(
        name="Rasa",
        description="Framework completo para chatbots conversacionales",
        pros=[
            "✅ Gestión de conversaciones complejas",
            "✅ Entrenamiento personalizado",
            "✅ Integración con múltiples canales",
            "✅ Gestión de intenciones y entidades"
        ],
        cons=[
            "❌ Curva de aprendizaje alta",
            "❌ Configuración compleja",
            "❌ Requiere datos de entrenamiento",
            "❌ Overkill para casos simples"
        ],
        installation="""
# Instalar Rasa
pip install rasa

# Inicializar proyecto
rasa init
""",
        usage_example="""
# config.yml
language: es
pipeline:
  - name: WhitespaceTokenizer
  - name: RegexFeaturizer
  - name: LexicalSyntacticFeaturizer
  - name: CountVectorsFeaturizer
  - name: CountVectorsFeaturizer
    analyzer: char_wb
    min_ngram: 1
    max_ngram: 4
  - name: DIETClassifier
    epochs: 100
  - name: EntitySynonymMapper
  - name: ResponseSelector
    epochs: 100

# domain.yml
intents:
  - greet
  - goodbye
  - appointment

responses:
  utter_greet:
    - text: "¡Hola! ¿En qué puedo ayudarte?"
  utter_appointment:
    - text: "Te ayudo a agendar una cita. ¿Cuál es tu nombre?"
""",
        complexity="high",
        cost="free"
    ),

    "botpress": NLPAlternative(
        name="Botpress",
        description="Plataforma de chatbots con NLP integrado",
        pros=[
            "✅ Interfaz visual para configuración",
            "✅ NLP integrado y optimizado",
            "✅ Múltiples integraciones",
            "✅ Análisis y métricas"
        ],
        cons=[
            "❌ Plataforma propietaria",
            "❌ Costo para uso avanzado",
            "❌ Menos control sobre el código"
        ],
        installation="""
# Botpress es una plataforma web
# No requiere instalación local
# Acceder a: https://botpress.com
""",
        usage_example="""
# Configuración vía interfaz web
# 1. Crear cuenta en Botpress
# 2. Crear nuevo bot
# 3. Configurar intenciones y respuestas
# 4. Integrar via webhook

import requests

def send_message(message):
    response = requests.post(
        "https://api.botpress.cloud/v1/chat",
        json={
            "message": message,
            "botId": "tu-bot-id"
        }
    )
    return response.json()
""",
        complexity="low",
        cost="medium"
    )
}

# ============================================================================
# 5. RECOMENDACIONES POR ESCENARIO
# ============================================================================

RECOMMENDATIONS = {
    "desarrollo_local": {
        "description": "Para desarrollo y pruebas locales",
        "primary": "llama-cpp-python",
        "secondary": "spacy-transformers",
        "reasoning": "Modelos locales sin dependencias externas, excelente rendimiento"
    },
    
    "produccion_costo_bajo": {
        "description": "Para producción con presupuesto limitado",
        "primary": "cohere-command",
        "secondary": "sentence-transformers",
        "reasoning": "Buena relación calidad-precio, API estable"
    },
    
    "produccion_alta_calidad": {
        "description": "Para producción con máxima calidad",
        "primary": "openai-gpt4",
        "secondary": "anthropic-claude",
        "reasoning": "Mejor calidad de respuesta, aunque con mayor costo"
    },
    
    "especializacion_legal": {
        "description": "Para especialización en dominio legal",
        "primary": "rasa",
        "secondary": "spacy-transformers",
        "reasoning": "Permite entrenamiento específico para casos legales"
    }
}

# ============================================================================
# 6. FUNCIÓN DE IMPLEMENTACIÓN
# ============================================================================

def get_nlp_recommendation(scenario: str, budget: str = "low", complexity: str = "medium") -> Dict[str, Any]:
    """
    Obtiene recomendaciones de NLP basadas en el escenario y restricciones.
    
    Args:
        scenario: Escenario de uso ("desarrollo_local", "produccion_costo_bajo", etc.)
        budget: Presupuesto ("low", "medium", "high")
        complexity: Complejidad deseada ("low", "medium", "high")
    
    Returns:
        Dict con recomendaciones y configuración
    """
    
    if scenario not in RECOMMENDATIONS:
        raise ValueError(f"Escenario no válido: {scenario}")
    
    recommendation = RECOMMENDATIONS[scenario]
    
    # Obtener alternativas recomendadas
    primary = LOCAL_MODELS.get(recommendation["primary"]) or CLOUD_SERVICES.get(recommendation["primary"]) or SPECIALIZED_NLP.get(recommendation["primary"])
    secondary = LOCAL_MODELS.get(recommendation["secondary"]) or CLOUD_SERVICES.get(recommendation["secondary"]) or SPECIALIZED_NLP.get(recommendation["secondary"])
    
    # Verificar que las alternativas existan
    if primary is None:
        raise ValueError(f"Alternativa primaria '{recommendation['primary']}' no encontrada")
    if secondary is None:
        raise ValueError(f"Alternativa secundaria '{recommendation['secondary']}' no encontrada")
    
    return {
        "scenario": scenario,
        "description": recommendation["description"],
        "primary_choice": {
            "name": primary.name,
            "description": primary.description,
            "installation": primary.installation,
            "usage_example": primary.usage_example,
            "complexity": primary.complexity,
            "cost": primary.cost
        },
        "secondary_choice": {
            "name": secondary.name,
            "description": secondary.description,
            "installation": secondary.installation,
            "usage_example": secondary.usage_example,
            "complexity": secondary.complexity,
            "cost": secondary.cost
        },
        "reasoning": recommendation["reasoning"],
        "implementation_steps": [
            "1. Instalar dependencias del modelo primario",
            "2. Configurar variables de entorno",
            "3. Integrar en main_improved.py",
            "4. Probar con casos de uso reales",
            "5. Optimizar parámetros según resultados"
        ]
    }

def print_nlp_alternatives():
    """Imprime todas las alternativas disponibles de forma organizada."""
    
    print("🤖 ALTERNATIVAS NLP DISPONIBLES")
    print("=" * 50)
    
    print("\n📦 1. MODELOS LOCALES AVANZADOS")
    print("-" * 30)
    for name, alt in LOCAL_MODELS.items():
        print(f"\n🔹 {alt.name}")
        print(f"   {alt.description}")
        print(f"   Complejidad: {alt.complexity} | Costo: {alt.cost}")
    
    print("\n☁️ 2. SERVICIOS DE IA EN LA NUBE")
    print("-" * 30)
    for name, alt in CLOUD_SERVICES.items():
        print(f"\n🔹 {alt.name}")
        print(f"   {alt.description}")
        print(f"   Complejidad: {alt.complexity} | Costo: {alt.cost}")
    
    print("\n🔧 3. PROCESAMIENTO ESPECIALIZADO")
    print("-" * 30)
    for name, alt in SPECIALIZED_NLP.items():
        print(f"\n🔹 {alt.name}")
        print(f"   {alt.description}")
        print(f"   Complejidad: {alt.complexity} | Costo: {alt.cost}")
    
    print("\n🎯 4. FRAMEWORKS DE CONVERSACIÓN")
    print("-" * 30)
    for name, alt in CONVERSATION_FRAMEWORKS.items():
        print(f"\n🔹 {alt.name}")
        print(f"   {alt.description}")
        print(f"   Complejidad: {alt.complexity} | Costo: {alt.cost}")

if __name__ == "__main__":
    print_nlp_alternatives()
    
    print("\n" + "=" * 50)
    print("🎯 RECOMENDACIONES POR ESCENARIO")
    print("=" * 50)
    
    for scenario, rec in RECOMMENDATIONS.items():
        print(f"\n📋 {scenario.upper()}")
        print(f"   {rec['description']}")
        print(f"   Primario: {rec['primary']}")
        print(f"   Secundario: {rec['secondary']}")
        print(f"   Razón: {rec['reasoning']}") 