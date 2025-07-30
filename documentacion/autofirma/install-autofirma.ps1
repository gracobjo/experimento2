Write-Host "🔐 Instalando AutoFirma..." -ForegroundColor Green

# URL de descarga
$url = "https://estaticos.redsara.es/comunes/autofirma/currentversion/AutoFirma_Windows.zip"
$downloadPath = "$env:USERPROFILE\Downloads\AutoFirma_Windows.zip"
$extractPath = "$env:USERPROFILE\Downloads\AutoFirma"

# Crear directorio
New-Item -ItemType Directory -Path $extractPath -Force -ErrorAction SilentlyContinue

# Descargar
Write-Host "📥 Descargando AutoFirma..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $url -OutFile $downloadPath -UseBasicParsing

# Extraer
Write-Host "📦 Extrayendo archivos..." -ForegroundColor Yellow
Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force

# Buscar instalador
$installer = Get-ChildItem -Path $extractPath -Recurse -Filter "*.exe" | Where-Object { $_.Name -like "*AutoFirma*" } | Select-Object -First 1

if ($installer) {
    Write-Host "🚀 Ejecutando instalador..." -ForegroundColor Green
    Start-Process -FilePath $installer.FullName -Wait
    Write-Host "✅ Instalación completada" -ForegroundColor Green
} else {
    Write-Host "❌ No se encontró el instalador" -ForegroundColor Red
    Write-Host "📁 Busca manualmente en: $extractPath" -ForegroundColor Yellow
}

# Limpiar
Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue

Write-Host "🎉 ¡Listo! Busca 'AutoFirma' en el menú de inicio" -ForegroundColor Green 