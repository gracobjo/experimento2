# Script para descargar e instalar AutoFirma
Write-Host "🔐 Descargando AutoFirma..." -ForegroundColor Green

# URL de descarga de AutoFirma para Windows
$url = "https://estaticos.redsara.es/comunes/autofirma/currentversion/AutoFirma_Windows.zip"
$downloadPath = "$env:USERPROFILE\Downloads\AutoFirma_Windows.zip"
$extractPath = "$env:USERPROFILE\Downloads\AutoFirma"

# Crear directorio si no existe
if (!(Test-Path $extractPath)) {
    New-Item -ItemType Directory -Path $extractPath -Force
}

# Descargar AutoFirma
Write-Host "📥 Descargando desde: $url" -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $url -OutFile $downloadPath -UseBasicParsing
    Write-Host "✅ Descarga completada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en la descarga: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Extraer el archivo ZIP
Write-Host "📦 Extrayendo archivos..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    Write-Host "✅ Extracción completada" -ForegroundColor Green
} catch {
    Write-Host "❌ Error en la extracción: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Buscar el instalador
$installerPath = Get-ChildItem -Path $extractPath -Recurse -Filter "*.exe" | Where-Object { $_.Name -like "*AutoFirma*" } | Select-Object -First 1

if ($installerPath) {
    Write-Host "🔧 Instalador encontrado: $($installerPath.FullName)" -ForegroundColor Green
    Write-Host "🚀 Iniciando instalación..." -ForegroundColor Yellow
    
    # Ejecutar el instalador
    try {
        Start-Process -FilePath $installerPath.FullName -Wait
        Write-Host "✅ Instalación completada" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error en la instalación: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "💡 Intenta ejecutar el instalador manualmente desde: $($installerPath.FullName)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No se encontró el instalador de AutoFirma" -ForegroundColor Red
    Write-Host "📁 Archivos extraídos en: $extractPath" -ForegroundColor Yellow
}

# Limpiar archivos temporales
Write-Host "🧹 Limpiando archivos temporales..." -ForegroundColor Yellow
if (Test-Path $downloadPath) {
    Remove-Item $downloadPath -Force
}

Write-Host "🎉 Proceso completado!" -ForegroundColor Green
Write-Host "📋 Pasos siguientes:" -ForegroundColor Cyan
Write-Host "1. Busca 'AutoFirma' en el menú de inicio" -ForegroundColor White
Write-Host "2. Ábrelo manualmente" -ForegroundColor White
Write-Host "3. Configura tu certificado digital" -ForegroundColor White
Write-Host "4. Intenta la firma de facturas nuevamente" -ForegroundColor White

Read-Host "Presiona Enter para continuar" 