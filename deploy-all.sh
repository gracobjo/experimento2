#!/bin/bash

# 🚀 Script de Despliegue Automatizado - Sistema Legal Experimento
# Este script te guía a través del proceso de despliegue de todos los componentes

set -e  # Salir si hay algún error

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Función para verificar dependencias
check_dependencies() {
    print_message "Verificando dependencias..."
    
    # Verificar Git
    if ! command -v git &> /dev/null; then
        print_error "Git no está instalado. Por favor instala Git primero."
        exit 1
    fi
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+ primero."
        exit 1
    fi
    
    # Verificar Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 no está instalado. Por favor instala Python 3.8+ primero."
        exit 1
    fi
    
    print_success "Todas las dependencias están instaladas"
}

# Función para verificar estructura de directorios
check_structure() {
    print_message "Verificando estructura de directorios..."
    
    if [ ! -d "experimento-backend" ]; then
        print_error "Directorio experimento-backend no encontrado"
        exit 1
    fi
    
    if [ ! -d "experimento-frontend" ]; then
        print_error "Directorio experimento-frontend no encontrado"
        exit 1
    fi
    
    if [ ! -d "experimento-chatbot" ]; then
        print_error "Directorio experimento-chatbot no encontrado"
        exit 1
    fi
    
    print_success "Estructura de directorios correcta"
}

# Función para generar JWT secret
generate_jwt_secret() {
    print_message "Generando JWT secret..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    echo "JWT_SECRET=$JWT_SECRET" > .env.backend
    print_success "JWT secret generado y guardado en .env.backend"
}

# Función para verificar archivos de configuración
check_config_files() {
    print_message "Verificando archivos de configuración..."
    
    # Backend
    if [ ! -f "experimento-backend/package.json" ]; then
        print_error "package.json no encontrado en experimento-backend"
        exit 1
    fi
    
    if [ ! -f "experimento-backend/Dockerfile" ]; then
        print_error "Dockerfile no encontrado en experimento-backend"
        exit 1
    fi
    
    # Frontend
    if [ ! -f "experimento-frontend/package.json" ]; then
        print_error "package.json no encontrado en experimento-frontend"
        exit 1
    fi
    
    if [ ! -f "experimento-frontend/Dockerfile" ]; then
        print_error "Dockerfile no encontrado en experimento-frontend"
        exit 1
    fi
    
    # Chatbot
    if [ ! -f "experimento-chatbot/requirements.txt" ]; then
        print_error "requirements.txt no encontrado en experimento-chatbot"
        exit 1
    fi
    
    if [ ! -f "experimento-chatbot/Dockerfile" ]; then
        print_error "Dockerfile no encontrado en experimento-chatbot"
        exit 1
    fi
    
    print_success "Todos los archivos de configuración están presentes"
}

# Función para mostrar instrucciones de despliegue
show_deployment_instructions() {
    echo ""
    print_message "=== INSTRUCCIONES DE DESPLIEGUE ==="
    echo ""
    echo "1. 🗄️  BACKEND (Render):"
    echo "   - Ve a https://render.com"
    echo "   - Conecta tu repositorio experimento-backend"
    echo "   - Crea una base de datos PostgreSQL"
    echo "   - Crea un Web Service con:"
    echo "     * Build Command: npm ci && npx prisma generate && npm run build"
    echo "     * Start Command: npm run start:prod"
    echo "   - Configura las variables de entorno del archivo .env.backend"
    echo ""
    echo "2. 🤖 CHATBOT (Render):"
    echo "   - Conecta tu repositorio experimento-chatbot"
    echo "   - Crea un Web Service con:"
    echo "     * Build Command: pip install -r requirements.txt && python -m spacy download es_core_news_sm && python -m spacy download en_core_web_sm && python -c \"import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('averaged_perceptron_tagger')\""
    echo "     * Start Command: uvicorn main_improved:app --host 0.0.0.0 --port \$PORT"
    echo ""
    echo "3. 🌐 FRONTEND (Vercel):"
    echo "   - Ve a https://vercel.com"
    echo "   - Conecta tu repositorio experimento-frontend"
    echo "   - Configura las variables de entorno:"
    echo "     * VITE_API_URL: URL del backend de Render"
    echo "     * VITE_CHATBOT_URL: URL del chatbot de Render"
    echo ""
    echo "4. 🔗 ACTUALIZAR URLs:"
    echo "   - Una vez desplegados todos, actualiza las URLs en cada servicio"
    echo ""
}

# Función para verificar despliegue
check_deployment() {
    echo ""
    print_message "=== VERIFICACIÓN DE DESPLIEGUE ==="
    echo ""
    echo "Para verificar que todo funciona correctamente:"
    echo ""
    echo "1. Backend Health Check:"
    echo "   curl https://tu-backend.onrender.com/health"
    echo ""
    echo "2. Chatbot Health Check:"
    echo "   curl https://tu-chatbot.onrender.com/health"
    echo ""
    echo "3. Frontend:"
    echo "   Visita https://tu-frontend.vercel.app"
    echo ""
}

# Función principal
main() {
    echo "🚀 Sistema Legal Experimento - Script de Despliegue"
    echo "=================================================="
    echo ""
    
    # Verificar dependencias
    check_dependencies
    
    # Verificar estructura
    check_structure
    
    # Verificar archivos de configuración
    check_config_files
    
    # Generar JWT secret
    generate_jwt_secret
    
    # Mostrar instrucciones
    show_deployment_instructions
    
    # Verificación
    check_deployment
    
    print_success "¡Preparación completada! Sigue las instrucciones arriba para desplegar."
    echo ""
    print_warning "Recuerda: Despliega en el orden Backend → Chatbot → Frontend"
    echo ""
}

# Ejecutar función principal
main "$@" 