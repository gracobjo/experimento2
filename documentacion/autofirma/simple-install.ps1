Write-Host "🔐 Descargando AutoFirma..." -ForegroundColor Green

$url = "https://estaticos.redsara.es/comunes/autofirma/currentversion/AutoFirma_Windows.zip"
$downloadPath = "$env:USERPROFILE\Downloads\AutoFirma_Windows.zip"
$extractPath = "$env:USERPROFILE\Downloads\AutoFirma"

New-Item -ItemType Directory -Path $extractPath -Force -ErrorAction SilentlyContinue

Write-Host "📥 Descargando..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $url -OutFile $downloadPath -UseBasicParsing

Write-Host "📦 Extrayendo..." -ForegroundColor Yellow
Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force

$installer = Get-ChildItem -Path $extractPath -Recurse -Filter "*.exe" | Where-Object { $_.Name -like "*AutoFirma*" } | Select-Object -First 1

if ($installer) {
    Write-Host "🚀 Instalando..." -ForegroundColor Green
    Start-Process -FilePath $installer.FullName -Wait
    Write-Host "✅ ¡Completado!" -ForegroundColor Green
} else {
    Write-Host "❌ Instalador no encontrado en: $extractPath" -ForegroundColor Red
}

Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
Write-Host "🎉 Busca 'AutoFirma' en el menú de inicio" -ForegroundColor Green 