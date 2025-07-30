Write-Host "Downloading AutoFirma..." -ForegroundColor Green

$url = "https://estaticos.redsara.es/comunes/autofirma/currentversion/AutoFirma_Windows.zip"
$downloadPath = "$env:USERPROFILE\Downloads\AutoFirma_Windows.zip"
$extractPath = "$env:USERPROFILE\Downloads\AutoFirma"

New-Item -ItemType Directory -Path $extractPath -Force -ErrorAction SilentlyContinue

Write-Host "Downloading..." -ForegroundColor Yellow
Invoke-WebRequest -Uri $url -OutFile $downloadPath -UseBasicParsing

Write-Host "Extracting..." -ForegroundColor Yellow
Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force

$installer = Get-ChildItem -Path $extractPath -Recurse -Filter "*.exe" | Where-Object { $_.Name -like "*AutoFirma*" } | Select-Object -First 1

if ($installer) {
    Write-Host "Installing..." -ForegroundColor Green
    Start-Process -FilePath $installer.FullName -Wait
    Write-Host "Completed!" -ForegroundColor Green
} else {
    Write-Host "Installer not found in: $extractPath" -ForegroundColor Red
}

Remove-Item $downloadPath -Force -ErrorAction SilentlyContinue
Write-Host "Look for 'AutoFirma' in the start menu" -ForegroundColor Green 