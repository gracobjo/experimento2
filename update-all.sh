#!/bin/bash

# 🔄 Script de Actualización Automatizada - Sistema Legal Experimento
# Este script actualiza todos los repositorios de una vez

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

# Función para actualizar un repositorio
update_repo() {
    local repo_name=$1
    local repo_path=$2
    
    print_message "🔄 Actualizando $repo_name..."
    
    if [ ! -d "$repo_path" ]; then
        print_error "Directorio $repo_path no encontrado"
        return 1
    fi
    
    cd "$repo_path"
    
    # Verificar si hay cambios
    if git diff-index --quiet HEAD --; then
        print_warning "No hay cambios en $repo_name"
        cd ..
        return 0
    fi
    
    # Agregar todos los cambios
    git add .
    
    # Hacer commit con timestamp
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    git commit -m "feat: actualización automática - $timestamp" || {
        print_error "Error al hacer commit en $repo_name"
        cd ..
        return 1
    }
    
    # Subir cambios
    git push origin main || {
        print_error "Error al subir cambios de $repo_name"
        cd ..
        return 1
    }
    
    print_success "✅ $repo_name actualizado exitosamente"
    cd ..
}

# Función principal
main() {
    echo "🚀 Sistema Legal Experimento - Actualización de Repositorios"
    echo "=========================================================="
    echo ""
    
    # Verificar que estamos en el directorio correcto
    if [ ! -d "experimento-backend" ] || [ ! -d "experimento-frontend" ] || [ ! -d "experimento-chatbot" ]; then
        print_error "No se encontraron los directorios de los componentes"
        print_error "Asegúrate de ejecutar este script desde el directorio raíz del proyecto"
        exit 1
    fi
    
    # Actualizar cada repositorio
    update_repo "Backend" "experimento-backend"
    update_repo "Frontend" "experimento-frontend"
    update_repo "Chatbot" "experimento-chatbot"
    
    echo ""
    print_success "🎉 Proceso de actualización completado"
    echo ""
    print_message "📊 Próximos pasos:"
    echo "   1. Verificar despliegue automático en Render (Backend/Chatbot)"
    echo "   2. Verificar despliegue automático en Vercel (Frontend)"
    echo "   3. Probar la aplicación en producción"
    echo ""
    print_message "⏱️  Tiempo estimado de despliegue:"
    echo "   - Backend: 2-5 minutos"
    echo "   - Chatbot: 2-5 minutos"
    echo "   - Frontend: 1-3 minutos"
    echo ""
}

# Ejecutar función principal
main "$@" 