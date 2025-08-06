FROM python:3.11-slim

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY requirements.txt .
COPY config/ ./config/

# Instalar dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Descargar modelos de spaCy
RUN python -m spacy download es_core_news_sm
RUN python -m spacy download en_core_web_sm

# Descargar recursos de NLTK
RUN python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')"

# Copiar el código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 8000

# Hacer el script ejecutable
RUN chmod +x start.sh

# Comando de inicio
CMD ["./start.sh"] 