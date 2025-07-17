# Script para crear facturas de prueba para cada cliente y abogado
Write-Host "Creando facturas de prueba..."

# Primero hacer login como admin para poder crear facturas
$loginUri = "http://localhost:3000/api/auth/login"
$loginBody = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    Write-Host "Haciendo login como abogado..."
    $loginResponse = Invoke-RestMethod -Uri $loginUri -Method POST -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.token
    Write-Host "Login exitoso!"
    
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # Obtener todos los usuarios
    Write-Host "Obteniendo usuarios..."
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -Headers $headers
    $users = $usersResponse
    
    # Separar abogados y clientes
    $lawyers = $users | Where-Object { $_.role -eq "ABOGADO" }
    $clients = $users | Where-Object { $_.role -eq "CLIENTE" }
    
    Write-Host "Abogados encontrados: $($lawyers.Count)"
    Write-Host "Clientes encontrados: $($clients.Count)"
    
    # Crear facturas de prueba
    $invoiceCounter = 1
    
    foreach ($lawyer in $lawyers) {
        foreach ($client in $clients) {
            Write-Host "Creando factura $invoiceCounter - Abogado $($lawyer.name) - Cliente $($client.name)"
            
            $invoiceBody = @{
                numeroFactura = "FAC-2024-$($invoiceCounter.ToString('000'))"
                fechaFactura = (Get-Date).ToString("yyyy-MM-dd")
                emisorId = $lawyer.id
                receptorId = $client.id
                importeTotal = (Get-Random -Minimum 100 -Maximum 1000)
                estado = "PENDIENTE"
                concepto = "Servicios legales - Factura de prueba $invoiceCounter"
                items = @(
                    @{
                        descripcion = "Consulta legal"
                        cantidad = 1
                        precioUnitario = (Get-Random -Minimum 50 -Maximum 200)
                        importe = (Get-Random -Minimum 50 -Maximum 200)
                    },
                    @{
                        descripcion = "Documentación"
                        cantidad = 1
                        precioUnitario = (Get-Random -Minimum 30 -Maximum 100)
                        importe = (Get-Random -Minimum 30 -Maximum 100)
                    }
                )
            } | ConvertTo-Json -Depth 3
            
            try {
                $invoiceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method POST -Headers $headers -Body $invoiceBody
                Write-Host "  ✅ Factura creada: $($invoiceResponse.numeroFactura)"
            } catch {
                Write-Host "  ❌ Error creando factura: $($_.Exception.Message)"
                if ($_.Exception.Response) {
                    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $responseBody = $reader.ReadToEnd()
                    Write-Host "  Response body: $responseBody"
                }
            }
            
            $invoiceCounter++
        }
    }
    
    Write-Host "Proceso completado. Probando endpoint /api/invoices/my para cada cliente..."
    
    # Probar el endpoint /api/invoices/my para cada cliente
    foreach ($client in $clients) {
        Write-Host "Probando facturas para cliente: $($client.name)"
        
        # Hacer login como cliente
        $clientLoginBody = @{
            email = $client.email
            password = "password123"
        } | ConvertTo-Json
        
        try {
            $clientLoginResponse = Invoke-RestMethod -Uri $loginUri -Method POST -ContentType "application/json" -Body $clientLoginBody
            $clientToken = $clientLoginResponse.token
            
            $clientHeaders = @{
                "Authorization" = "Bearer $clientToken"
            }
            
            $clientInvoices = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/my" -Method GET -Headers $clientHeaders
            Write-Host "  Facturas encontradas: $($clientInvoices.Count)"
            if ($clientInvoices.Count -gt 0) {
                Write-Host "  Primera factura: $($clientInvoices[0].number) - $($clientInvoices[0].amount)€"
            }
        } catch {
            Write-Host "  ❌ Error obteniendo facturas del cliente: $($_.Exception.Message)"
        }
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
} 