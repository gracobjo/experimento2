Write-Host "Starting AutoFirma and keeping it running..." -ForegroundColor Green

$autofirmaPath = "C:\Program Files\AutoFirma\AutoFirma\AutoFirma.exe"

# Function to start AutoFirma
function Start-AutoFirmaService {
    Write-Host "Starting AutoFirma..." -ForegroundColor Yellow
    
    try {
        # Start AutoFirma
        $process = Start-Process -FilePath $autofirmaPath -WindowStyle Normal -PassThru
        
        if ($process) {
            Write-Host "AutoFirma started! Process ID: $($process.Id)" -ForegroundColor Green
            return $process
        } else {
            Write-Host "Failed to start AutoFirma" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "Error starting AutoFirma: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Start AutoFirma
$autofirmaProcess = Start-AutoFirmaService

if ($autofirmaProcess) {
    Write-Host "AutoFirma is now running!" -ForegroundColor Green
    Write-Host "Please configure the HTTP service in AutoFirma:" -ForegroundColor Yellow
    Write-Host "1. Go to Settings/Configuration" -ForegroundColor White
    Write-Host "2. Enable HTTP service" -ForegroundColor White
    Write-Host "3. Set port to 8080" -ForegroundColor White
    Write-Host "4. Save configuration" -ForegroundColor White
    Write-Host "" -ForegroundColor White
    Write-Host "Then try signing invoices!" -ForegroundColor Green
    
    # Monitor the process
    Write-Host "Monitoring AutoFirma process..." -ForegroundColor Yellow
    $autofirmaProcess.WaitForExit()
    Write-Host "AutoFirma has stopped. Restarting..." -ForegroundColor Red
} else {
    Write-Host "Could not start AutoFirma" -ForegroundColor Red
    Write-Host "Please start it manually from the Start Menu" -ForegroundColor Yellow
}

Write-Host "Script completed." -ForegroundColor Green 