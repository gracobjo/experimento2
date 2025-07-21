Write-Host "Starting AutoFirma service..." -ForegroundColor Green

# Check if AutoFirma is already running
$autofirmaProcess = Get-Process | Where-Object {$_.ProcessName -like "*AutoFirma*"}

if ($autofirmaProcess) {
    Write-Host "AutoFirma is already running!" -ForegroundColor Green
    Write-Host "Process ID: $($autofirmaProcess.Id)" -ForegroundColor Yellow
} else {
    Write-Host "Starting AutoFirma..." -ForegroundColor Yellow
    
    # Start AutoFirma with service parameters
    try {
        $autofirmaPath = "C:\Program Files\AutoFirma\AutoFirma\AutoFirma.exe"
        
        # Start AutoFirma in background
        Start-Process -FilePath $autofirmaPath -ArgumentList "--service" -WindowStyle Hidden
        
        # Wait a moment for it to start
        Start-Sleep -Seconds 3
        
        # Check if it's running now
        $autofirmaProcess = Get-Process | Where-Object {$_.ProcessName -like "*AutoFirma*"}
        
        if ($autofirmaProcess) {
            Write-Host "AutoFirma started successfully!" -ForegroundColor Green
            Write-Host "Process ID: $($autofirmaProcess.Id)" -ForegroundColor Yellow
        } else {
            Write-Host "AutoFirma failed to start as service" -ForegroundColor Red
            Write-Host "Trying to start in normal mode..." -ForegroundColor Yellow
            
            # Try starting in normal mode
            Start-Process -FilePath $autofirmaPath
            Start-Sleep -Seconds 2
            
            $autofirmaProcess = Get-Process | Where-Object {$_.ProcessName -like "*AutoFirma*"}
            if ($autofirmaProcess) {
                Write-Host "AutoFirma started in normal mode!" -ForegroundColor Green
            } else {
                Write-Host "Failed to start AutoFirma" -ForegroundColor Red
            }
        }
    } catch {
        Write-Host "Error starting AutoFirma: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Check if port 8080 is listening
Write-Host "Checking port 8080..." -ForegroundColor Yellow
$port8080 = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue

if ($port8080) {
    Write-Host "Port 8080 is active!" -ForegroundColor Green
    Write-Host "AutoFirma service should be working" -ForegroundColor Green
} else {
    Write-Host "Port 8080 is not active" -ForegroundColor Red
    Write-Host "AutoFirma may need to be configured as a service" -ForegroundColor Yellow
}

Write-Host "Try signing invoices now!" -ForegroundColor Green 