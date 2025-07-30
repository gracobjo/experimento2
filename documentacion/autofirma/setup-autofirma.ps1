Write-Host "Configurando AutoFirma..." -ForegroundColor Green

# Verificar AutoFirma
$autofirmaPath = "C:\Program Files\AutoFirma\AutoFirma\AutoFirma.exe"
$autofirmaPath32 = "C:\Program Files (x86)\AutoFirma\AutoFirma\AutoFirma.exe"

if (Test-Path $autofirmaPath) {
    Write-Host "AutoFirma encontrado en: $autofirmaPath" -ForegroundColor Green
    $actualPath = $autofirmaPath
} elseif (Test-Path $autofirmaPath32) {
    Write-Host "AutoFirma encontrado en: $autofirmaPath32" -ForegroundColor Green
    $actualPath = $autofirmaPath32
} else {
    Write-Host "AutoFirma no está instalado" -ForegroundColor Red
    Write-Host "Ejecuta: .\install-autofirma.ps1" -ForegroundColor Yellow
    exit 1
}

# Registrar protocolo afirma://
Write-Host "Registrando protocolo afirma://..." -ForegroundColor Yellow

try {
    $protocolKey = "HKCU:\Software\Classes\afirma"
    New-Item -Path $protocolKey -Force | Out-Null
    Set-ItemProperty -Path $protocolKey -Name "(Default)" -Value "URL:AutoFirma Protocol"
    Set-ItemProperty -Path $protocolKey -Name "URL Protocol" -Value ""
    
    $commandKey = "$protocolKey\shell\open\command"
    New-Item -Path $commandKey -Force | Out-Null
    Set-ItemProperty -Path $commandKey -Name "(Default)" -Value "`"$actualPath`" `"%1`""
    
    Write-Host "Protocolo afirma:// registrado" -ForegroundColor Green
} catch {
    Write-Host "Error registrando protocolo: $($_.Exception.Message)" -ForegroundColor Red
}

# Iniciar servidor HTTP
Write-Host "Iniciando servidor HTTP..." -ForegroundColor Yellow

# Detener proceso en puerto 8080 si existe
$portInUse = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($portInUse) {
    $process = Get-Process -Id $portInUse.OwningProcess -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.Id -Force
        Start-Sleep -Seconds 2
    }
}

# Iniciar servidor
$nodePath = Get-Command node -ErrorAction SilentlyContinue
if ($nodePath) {
    Start-Process -FilePath "node" -ArgumentList "autofirma-http-server.js" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    
    try {
        Invoke-RestMethod -Uri "http://127.0.0.1:8080/status" -Method GET -TimeoutSec 5
        Write-Host "Servidor HTTP funcionando" -ForegroundColor Green
    } catch {
        Write-Host "Servidor HTTP iniciando..." -ForegroundColor Yellow
    }
} else {
    Write-Host "Node.js no está instalado" -ForegroundColor Red
}

Write-Host "Configuración completada!" -ForegroundColor Green
Write-Host "Reinicia tu navegador y prueba la firma digital" -ForegroundColor Yellow 