#!/bin/bash

echo "🚀 ===== INICIO DEL SCRIPT start.sh DEL CHATBOT ===== "
echo "📅 Fecha: $(date)"
echo "🔧 Variables de entorno:"
echo "   - BACKEND_URL: ${BACKEND_URL:-'NO CONFIGURADO'}"
echo "   - FRONTEND_URL: ${FRONTEND_URL:-'NO CONFIGURADO'}"
echo "   - PORT: ${PORT:-8000}"
echo ""

# Esperar un poco para que el sistema esté listo
echo "⏳ Esperando 10 segundos para que el sistema esté listo..."
sleep 10

# Verificar que las dependencias estén instaladas
echo "🔍 Verificando dependencias..."
python -c "import fastapi, uvicorn, spacy, nltk; print('✅ Dependencias básicas OK')"

# Verificar modelos de spaCy
echo "🔍 Verificando modelos de spaCy..."
python -c "
import spacy
try:
    nlp_es = spacy.load('es_core_news_sm')
    nlp_en = spacy.load('en_core_web_sm')
    print('✅ Modelos de spaCy cargados correctamente')
except OSError as e:
    print(f'❌ Error cargando modelos de spaCy: {e}')
    print('📥 Descargando modelos...')
    import subprocess
    subprocess.run(['python', '-m', 'spacy', 'download', 'es_core_news_sm'])
    subprocess.run(['python', '-m', 'spacy', 'download', 'en_core_web_sm'])
    print('✅ Modelos descargados')
"

# Verificar recursos de NLTK
echo "🔍 Verificando recursos de NLTK..."
python -c "
import nltk
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('taggers/averaged_perceptron_tagger')
    print('✅ Recursos de NLTK disponibles')
except LookupError:
    print('📥 Descargando recursos de NLTK...')
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    print('✅ Recursos de NLTK descargados')
"

# Verificar conexión con el backend
echo "🔍 Verificando conexión con el backend..."
python -c "
import requests
import os
backend_url = os.getenv('BACKEND_URL', 'https://experimento2-production.up.railway.app')
try:
    response = requests.get(f'{backend_url}/health', timeout=10)
    if response.status_code == 200:
        print('✅ Conexión con backend exitosa')
    else:
        print(f'⚠️ Backend responde con código: {response.status_code}')
except Exception as e:
    print(f'❌ Error conectando con backend: {e}')
"

echo ""
echo "🎯 Iniciando servidor del chatbot..."
echo "Comando: uvicorn main_improved_fixed:app --host 0.0.0.0 --port ${PORT:-8000}"

# Iniciar el servidor
exec uvicorn main_improved_fixed:app --host 0.0.0.0 --port ${PORT:-8000} 