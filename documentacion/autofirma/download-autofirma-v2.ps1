Write-Host "Downloading AutoFirma..." -ForegroundColor Green

# Try multiple URLs
$urls = @(
    "https://estaticos.redsara.es/comunes/autofirma/currentversion/AutoFirma_Windows.zip",
    "https://estaticos.redsara.es/comunes/autofirma/1.8.5/AutoFirma_Windows.zip",
    "https://estaticos.redsara.es/comunes/autofirma/1.8.4/AutoFirma_Windows.zip"
)

$downloadPath = "$env:USERPROFILE\Downloads\AutoFirma_Windows.zip"
$extractPath = "$env:USERPROFILE\Downloads\AutoFirma"

# Create directory
New-Item -ItemType Directory -Path $extractPath -Force -ErrorAction SilentlyContinue

$success = $false

foreach ($url in $urls) {
    Write-Host "Trying URL: $url" -ForegroundColor Yellow
    
    try {
        Invoke-WebRequest -Uri $url -OutFile $downloadPath -UseBasicParsing -TimeoutSec 30
        Write-Host "Download successful!" -ForegroundColor Green
        $success = $true
        break
    } catch {
        Write-Host "Failed: $($_.Exception.Message)" -ForegroundColor Red
        continue
    }
}

if (-not $success) {
    Write-Host "All download attempts failed." -ForegroundColor Red
    Write-Host "Please download manually from: https://firmaelectronica.gob.es/Home/Descargas.html" -ForegroundColor Yellow
    exit 1
}

# Extract
Write-Host "Extracting files..." -ForegroundColor Yellow
Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force

# Find installer
$installer = Get-ChildItem -Path $extractPath -Recurse -Filter "*.exe" | Where-Object { $_.Name -like "*AutoFirma*" } | Select-Object -First 1

if ($installer) {
    Write-Host "Installer found: $($installer.FullName)" -ForegroundColor Green
    Write-Host "Starting installation..." -ForegroundColor Yellow
    Start-Process -FilePath $installer.FullName -Wait
    Write-Host "Installation completed!" -ForegroundColor Green
} else {
    Write-Host "Installer not found in: $extractPath" -ForegroundColor Red
    Write-Host "Please check the extracted files manually." -ForegroundColor Yellow
}

# Clean up
Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue

Write-Host "Look for 'AutoFirma' in the start menu" -ForegroundColor Green
Write-Host "Then try signing invoices again!" -ForegroundColor Green 