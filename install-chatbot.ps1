# 🤖 Script de Instalación Automática del Chatbot
# Sistema de Gestión Legal - Chatbot Python

param(
    [switch]$SkipPython,
    [switch]$SkipDependencies,
    [switch]$SkipModels,
    [switch]$SkipDatabase,
    [switch]$StartChatbot
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN AUTOMÁTICA DEL CHATBOT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Función para verificar si un comando existe
function Test-Command($cmdname) {
    return [bool](Get-Command -Name $cmdname -ErrorAction SilentlyContinue)
}

# Función para verificar Python
function Test-Python {
    if (Test-Command "python") {
        $version = python --version 2>&1
        Write-Host "✅ Python encontrado: $version" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Python no encontrado" -ForegroundColor Red
        return $false
    }
}

# Función para instalar Python
function Install-Python {
    Write-Host "🐍 Instalando Python 3.11.9..." -ForegroundColor Yellow
    
    try {
        # Intentar instalar con winget
        winget install Python.Python.3.11 --accept-source-agreements --accept-package-agreements
        Write-Host "✅ Python instalado con winget" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Error con winget, intentando descarga manual..." -ForegroundColor Yellow
        Write-Host "Por favor, descarga Python 3.11.9 desde: https://www.python.org/downloads/release/python-3119/" -ForegroundColor Cyan
        Write-Host "Asegúrate de marcar 'Add Python to PATH' durante la instalación" -ForegroundColor Cyan
        Read-Host "Presiona Enter cuando hayas instalado Python"
    }
    
    # Verificar instalación
    if (Test-Python) {
        Write-Host "✅ Python instalado correctamente" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: Python no se pudo instalar" -ForegroundColor Red
        exit 1
    }
}

# Función para verificar pip
function Test-Pip {
    if (Test-Command "pip") {
        $version = pip --version
        Write-Host "✅ pip encontrado: $version" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ pip no encontrado" -ForegroundColor Red
        return $false
    }
}

# Función para instalar pip
function Install-Pip {
    Write-Host "📦 Instalando pip..." -ForegroundColor Yellow
    
    try {
        python -m ensurepip --upgrade
        Write-Host "✅ pip instalado" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando pip" -ForegroundColor Red
        exit 1
    }
}

# Función para navegar al directorio del chatbot
function Navigate-ToChatbot {
    $chatbotPath = "experimento/chatbot"
    
    if (Test-Path $chatbotPath) {
        Set-Location $chatbotPath
        Write-Host "✅ Navegado a: $chatbotPath" -ForegroundColor Green
    } else {
        Write-Host "❌ Error: Directorio del chatbot no encontrado" -ForegroundColor Red
        Write-Host "Asegúrate de estar en el directorio raíz del proyecto" -ForegroundColor Cyan
        exit 1
    }
}

# Función para crear archivo .env
function Create-EnvFile {
    Write-Host "⚙️  Creando archivo .env..." -ForegroundColor Yellow
    
    $envContent = @"
# ========================================
# BASE DE DATOS
# ========================================
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/despacho_legal"

# ========================================
# API
# ========================================
API_KEY="tu_api_key_segura_para_chatbot"
API_HOST="0.0.0.0"
API_PORT=5000

# ========================================
# CORS
# ========================================
CORS_ORIGINS="http://localhost:5173,https://tu-dominio.com"
CORS_METHODS="GET,POST,PUT,DELETE,OPTIONS"
CORS_HEADERS="Content-Type,Authorization"

# ========================================
# MODELO DE IA
# ========================================
MODEL_PATH="./models/legal_model"
SPACY_MODEL="es_core_news_sm"
NLTK_DATA_PATH="./nltk_data"

# ========================================
# CONFIGURACIÓN DE CHAT
# ========================================
MAX_MESSAGE_LENGTH=1000
SESSION_TIMEOUT=3600
MAX_CONVERSATION_HISTORY=50

# ========================================
# LOGS
# ========================================
LOG_LEVEL="INFO"
LOG_FILE="./logs/chatbot.log"

# ========================================
# BACKEND INTEGRATION
# ========================================
BACKEND_URL="http://localhost:3000"
BACKEND_API_KEY="tu_backend_api_key"
"@

    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Archivo .env creado" -ForegroundColor Green
}

# Función para instalar dependencias
function Install-Dependencies {
    Write-Host "📚 Instalando dependencias..." -ForegroundColor Yellow
    
    if (Test-Path "requirements.txt") {
        try {
            python -m pip install -r requirements.txt
            Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
        } catch {
            Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "❌ Error: requirements.txt no encontrado" -ForegroundColor Red
        exit 1
    }
}

# Función para descargar modelos de IA
function Download-AIModels {
    Write-Host "🤖 Descargando modelos de IA..." -ForegroundColor Yellow
    
    try {
        # Descargar modelo spaCy
        Write-Host "📥 Descargando modelo spaCy..." -ForegroundColor Cyan
        python -m spacy download es_core_news_sm
        
        # Descargar datos NLTK
        Write-Host "📥 Descargando datos NLTK..." -ForegroundColor Cyan
        python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
        
        Write-Host "✅ Modelos de IA descargados" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error descargando modelos de IA" -ForegroundColor Red
        exit 1
    }
}

# Función para verificar base de datos
function Test-Database {
    Write-Host "🗄️  Verificando conexión a base de datos..." -ForegroundColor Yellow
    
    try {
        python -c "
import psycopg2
try:
    conn = psycopg2.connect('postgresql://postgres:postgres@localhost:5432/despacho_legal')
    print('✅ Conexión a base de datos exitosa')
    conn.close()
except Exception as e:
    print(f'❌ Error de conexión: {e}')
    exit(1)
"
        Write-Host "✅ Base de datos verificada" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error verificando base de datos" -ForegroundColor Red
        Write-Host "Asegúrate de que PostgreSQL esté ejecutándose y la base de datos esté creada" -ForegroundColor Cyan
    }
}

# Función para iniciar chatbot
function Start-Chatbot {
    Write-Host "🚀 Iniciando chatbot..." -ForegroundColor Yellow
    
    if (Test-Path "main.py") {
        Write-Host "✅ Chatbot iniciado en http://localhost:5000" -ForegroundColor Green
        Write-Host "📖 Documentación: http://localhost:5000/docs" -ForegroundColor Cyan
        Write-Host "🏥 Health Check: http://localhost:5000/health" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Presiona Ctrl+C para detener el chatbot" -ForegroundColor Yellow
        
        python main.py
    } else {
        Write-Host "❌ Error: main.py no encontrado" -ForegroundColor Red
        exit 1
    }
}

# Función para verificar instalación
function Test-Installation {
    Write-Host "🔍 Verificando instalación..." -ForegroundColor Yellow
    
    $checks = @(
        @{ Name = "Python"; Test = { Test-Command "python" } },
        @{ Name = "pip"; Test = { Test-Command "pip" } },
        @{ Name = "FastAPI"; Test = { python -c "import fastapi; print('OK')" 2>$null } },
        @{ Name = "spaCy"; Test = { python -c "import spacy; print('OK')" 2>$null } },
        @{ Name = "NLTK"; Test = { python -c "import nltk; print('OK')" 2>$null } },
        @{ Name = ".env"; Test = { Test-Path ".env" } },
        @{ Name = "requirements.txt"; Test = { Test-Path "requirements.txt" } }
    )
    
    $allPassed = $true
    
    foreach ($check in $checks) {
        try {
            & $check.Test
            Write-Host "✅ $($check.Name)" -ForegroundColor Green
        } catch {
            Write-Host "❌ $($check.Name)" -ForegroundColor Red
            $allPassed = $false
        }
    }
    
    if ($allPassed) {
        Write-Host "✅ Todas las verificaciones pasaron" -ForegroundColor Green
    } else {
        Write-Host "❌ Algunas verificaciones fallaron" -ForegroundColor Red
    }
    
    return $allPassed
}

# ========================================
# SCRIPT PRINCIPAL
# ========================================

Write-Host "Iniciando instalación del chatbot..." -ForegroundColor Cyan

# 1. Verificar/Instalar Python
if (-not $SkipPython) {
    if (-not (Test-Python)) {
        Install-Python
    }
    
    if (-not (Test-Pip)) {
        Install-Pip
    }
} else {
    Write-Host "⏭️  Saltando instalación de Python" -ForegroundColor Yellow
}

# 2. Navegar al directorio del chatbot
Navigate-ToChatbot

# 3. Crear archivo .env
Create-EnvFile

# 4. Instalar dependencias
if (-not $SkipDependencies) {
    Install-Dependencies
} else {
    Write-Host "⏭️  Saltando instalación de dependencias" -ForegroundColor Yellow
}

# 5. Descargar modelos de IA
if (-not $SkipModels) {
    Download-AIModels
} else {
    Write-Host "⏭️  Saltando descarga de modelos" -ForegroundColor Yellow
}

# 6. Verificar base de datos
if (-not $SkipDatabase) {
    Test-Database
} else {
    Write-Host "⏭️  Saltando verificación de base de datos" -ForegroundColor Yellow
}

# 7. Verificar instalación
Test-Installation

# 8. Iniciar chatbot si se solicita
if ($StartChatbot) {
    Start-Chatbot
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  INSTALACIÓN COMPLETADA" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Para iniciar el chatbot, ejecuta:" -ForegroundColor Yellow
    Write-Host "python main.py" -ForegroundColor Green
    Write-Host ""
    Write-Host "URLs disponibles:" -ForegroundColor Cyan
    Write-Host "- API: http://localhost:5000" -ForegroundColor White
    Write-Host "- Docs: http://localhost:5000/docs" -ForegroundColor White
    Write-Host "- Health: http://localhost:5000/health" -ForegroundColor White
    Write-Host ""
    Write-Host "Para iniciar automáticamente, ejecuta:" -ForegroundColor Yellow
    Write-Host ".\install-chatbot.ps1 -StartChatbot" -ForegroundColor Green
} 