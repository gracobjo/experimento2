# 🔄 Script de Actualización Automatizada - Sistema Legal Experimento (PowerShell)
# Este script actualiza todos los repositorios de una vez en Windows

param(
    [switch]$Force,
    [string]$Message = ""
)

# Función para imprimir mensajes con colores
function Write-ColorMessage {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    $colors = @{
        "Red" = "Red"
        "Green" = "Green"
        "Yellow" = "Yellow"
        "Blue" = "Cyan"
        "White" = "White"
    }
    
    Write-Host $Message -ForegroundColor $colors[$Color]
}

# Función para actualizar un repositorio
function Update-Repository {
    param(
        [string]$RepoName,
        [string]$RepoPath
    )
    
    Write-ColorMessage "[INFO] 🔄 Actualizando $RepoName..." "Blue"
    
    if (-not (Test-Path $RepoPath)) {
        Write-ColorMessage "[ERROR] Directorio $RepoPath no encontrado" "Red"
        return $false
    }
    
    Push-Location $RepoPath
    
    try {
        # Verificar si hay cambios
        $status = git status --porcelain
        if ([string]::IsNullOrEmpty($status)) {
            Write-ColorMessage "[WARNING] No hay cambios en $RepoName" "Yellow"
            return $true
        }
        
        # Agregar todos los cambios
        git add .
        
        # Crear mensaje de commit
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        if ([string]::IsNullOrEmpty($Message)) {
            $commitMessage = "feat: actualización automática - $timestamp"
        } else {
            $commitMessage = "feat: $Message - $timestamp"
        }
        
        # Hacer commit
        git commit -m $commitMessage
        if ($LASTEXITCODE -ne 0) {
            Write-ColorMessage "[ERROR] Error al hacer commit en $RepoName" "Red"
            return $false
        }
        
        # Subir cambios
        git push origin main
        if ($LASTEXITCODE -ne 0) {
            Write-ColorMessage "[ERROR] Error al subir cambios de $RepoName" "Red"
            return $false
        }
        
        Write-ColorMessage "[SUCCESS] ✅ $RepoName actualizado exitosamente" "Green"
        return $true
        
    } catch {
        Write-ColorMessage "[ERROR] Error en $RepoName : $($_.Exception.Message)" "Red"
        return $false
    } finally {
        Pop-Location
    }
}

# Función principal
function Main {
    Write-Host "🚀 Sistema Legal Experimento - Actualización de Repositorios" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar que estamos en el directorio correcto
    $requiredDirs = @("experimento-backend", "experimento-frontend", "experimento-chatbot")
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            Write-ColorMessage "[ERROR] No se encontró el directorio $dir" "Red"
            Write-ColorMessage "[ERROR] Asegúrate de ejecutar este script desde el directorio raíz del proyecto" "Red"
            exit 1
        }
    }
    
    # Actualizar cada repositorio
    $success = $true
    $success = $success -and (Update-Repository "Backend" "experimento-backend")
    $success = $success -and (Update-Repository "Frontend" "experimento-frontend")
    $success = $success -and (Update-Repository "Chatbot" "experimento-chatbot")
    
    Write-Host ""
    if ($success) {
        Write-ColorMessage "[SUCCESS] 🎉 Proceso de actualización completado" "Green"
    } else {
        Write-ColorMessage "[ERROR] ❌ Algunos repositorios no se pudieron actualizar" "Red"
    }
    
    Write-Host ""
    Write-ColorMessage "[INFO] 📊 Próximos pasos:" "Blue"
    Write-Host "   1. Verificar despliegue automático en Render (Backend/Chatbot)"
    Write-Host "   2. Verificar despliegue automático en Vercel (Frontend)"
    Write-Host "   3. Probar la aplicación en producción"
    Write-Host ""
    Write-ColorMessage "[INFO] ⏱️  Tiempo estimado de despliegue:" "Blue"
    Write-Host "   - Backend: 2-5 minutos"
    Write-Host "   - Chatbot: 2-5 minutos"
    Write-Host "   - Frontend: 1-3 minutos"
    Write-Host ""
}

# Ejecutar función principal
Main 