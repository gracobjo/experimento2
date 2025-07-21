Write-Host "Configuring AutoFirma for HTTP service..." -ForegroundColor Green

# AutoFirma configuration
$autofirmaPath = "C:\Program Files\AutoFirma\AutoFirma\AutoFirma.exe"
$configDir = "$env:APPDATA\AutoFirma"
$configFile = "$configDir\autofirma.properties"

# Create config directory if it doesn't exist
if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force
    Write-Host "Created config directory: $configDir" -ForegroundColor Yellow
}

# Create configuration file for HTTP service
$configContent = @"
# AutoFirma HTTP Service Configuration
http.port=8080
http.host=127.0.0.1
http.enabled=true
service.mode=true
"@

# Write configuration
$configContent | Out-File -FilePath $configFile -Encoding UTF8
Write-Host "Configuration file created: $configFile" -ForegroundColor Green

# Try to start AutoFirma with HTTP service
Write-Host "Starting AutoFirma HTTP service..." -ForegroundColor Yellow

try {
    # Start AutoFirma with service configuration
    $process = Start-Process -FilePath $autofirmaPath -ArgumentList "--http-service" -WindowStyle Hidden -PassThru
    
    if ($process) {
        Write-Host "AutoFirma HTTP service started!" -ForegroundColor Green
        Write-Host "Process ID: $($process.Id)" -ForegroundColor Yellow
        
        # Wait for service to start
        Start-Sleep -Seconds 5
        
        # Check if port 8080 is now active
        $port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
        
        if ($port8080) {
            Write-Host "Port 8080 is now active!" -ForegroundColor Green
            Write-Host "AutoFirma HTTP service is working correctly" -ForegroundColor Green
        } else {
            Write-Host "Port 8080 is still not active" -ForegroundColor Red
            Write-Host "AutoFirma may need manual configuration" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Failed to start AutoFirma HTTP service" -ForegroundColor Red
    }
} catch {
    Write-Host "Error starting AutoFirma: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Configuration completed!" -ForegroundColor Green
Write-Host "Try signing invoices now. If it still doesn't work:" -ForegroundColor Yellow
Write-Host "1. Open AutoFirma manually from Start Menu" -ForegroundColor White
Write-Host "2. Go to Settings/Configuration" -ForegroundColor White
Write-Host "3. Enable HTTP service on port 8080" -ForegroundColor White 