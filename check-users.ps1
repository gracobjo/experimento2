# Script para verificar usuarios en la base de datos
Write-Host "Verificando usuarios en la base de datos..."

try {
    # Intentar obtener usuarios (sin autenticación para ver si el endpoint existe)
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET
    Write-Host "Usuarios encontrados:"
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "Error al obtener usuarios: $($_.Exception.Message)"
    
    # Intentar crear un usuario de prueba
    Write-Host "Intentando crear un usuario de prueba..."
    $registerBody = @{
        email = "test@example.com"
        password = "password123"
        name = "Usuario de Prueba"
        role = "ABOGADO"
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
        Write-Host "Usuario creado exitosamente:"
        $registerResponse | ConvertTo-Json
    } catch {
        Write-Host "Error al crear usuario: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody"
        }
    }
} 