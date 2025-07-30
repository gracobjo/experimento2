# Script para probar login y obtener token JWT
$uri = "http://localhost:3000/api/auth/login"
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "Intentando login..."
    $response = Invoke-RestMethod -Uri $uri -Method POST -ContentType "application/json" -Body $body
    Write-Host "Login exitoso!"
    Write-Host "Token: $($response.token)"
    
    # Probar el endpoint /api/invoices/my con el token
    $headers = @{
        "Authorization" = "Bearer $($response.token)"
    }
    
    Write-Host "Probando endpoint /api/invoices/my..."
    $invoicesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/my" -Method GET -Headers $headers
    Write-Host "Respuesta de facturas:"
    $invoicesResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
} 