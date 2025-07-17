# Script para obtener clientes con facturas
# Requiere token de ADMIN o ABOGADO

$adminEmail = "admin@test.com"
$adminPassword = "admin123"

# Login y obtención del token
$login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -Body (@{ email = $adminEmail; password = $adminPassword } | ConvertTo-Json) -ContentType 'application/json'
$token = $login.token

# Obtener clientes con facturas
$response = Invoke-RestMethod -Uri 'http://localhost:3000/api/invoices/clients-with-invoices' -Headers @{ Authorization = "Bearer $token" }

$response | Format-Table clientId, name, email, facturaCount 