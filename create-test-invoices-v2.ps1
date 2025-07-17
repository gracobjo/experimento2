# Script para crear facturas de prueba y verificar que los clientes pueden verlas
Write-Host "Creando facturas de prueba..."

# Primero hacer login como abogado para poder crear facturas
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
    
    # Crear facturas de prueba directamente
    Write-Host "Creando facturas de prueba..."
    
    # Factura 1: Abogado test -> Cliente cliente1
    $invoice1Body = @{
        numeroFactura = "FAC-2024-001"
        fechaFactura = (Get-Date).ToString("yyyy-MM-dd")
        emisorId = $loginResponse.user.id  # ID del abogado logueado
        receptorId = "cliente1-id"  # Usaremos un ID de ejemplo
        importeTotal = 450
        estado = "PENDIENTE"
        concepto = "Servicios legales - Consulta inicial"
        items = @(
            @{
                descripcion = "Consulta legal"
                cantidad = 1
                precioUnitario = 200
                importe = 200
            },
            @{
                descripcion = "Documentación"
                cantidad = 1
                precioUnitario = 250
                importe = 250
            }
        )
    } | ConvertTo-Json -Depth 3
    
    try {
        $invoiceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method POST -Headers $headers -Body $invoice1Body
        Write-Host "✅ Factura 1 creada: $($invoiceResponse.numeroFactura)"
    } catch {
        Write-Host "❌ Error creando factura 1: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody"
        }
    }
    
    # Crear más usuarios de prueba si no existen
    Write-Host "Creando usuarios de prueba adicionales..."
    
    # Crear cliente de prueba
    $clientRegisterBody = @{
        email = "cliente1@test.com"
        password = "password123"
        name = "Cliente de Prueba"
        role = "CLIENTE"
    } | ConvertTo-Json
    
    try {
        $clientResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -ContentType "application/json" -Body $clientRegisterBody
        Write-Host "✅ Cliente creado: $($clientResponse.user.email)"
        $clienteId = $clientResponse.user.id
    } catch {
        Write-Host "❌ Error creando cliente: $($_.Exception.Message)"
        # Intentar login si ya existe
        try {
            $clientLoginBody = @{
                email = "cliente1@test.com"
                password = "password123"
            } | ConvertTo-Json
            $clientLoginResponse = Invoke-RestMethod -Uri $loginUri -Method POST -ContentType "application/json" -Body $clientLoginBody
            $clienteId = $clientLoginResponse.user.id
            Write-Host "✅ Cliente existente, ID: $clienteId"
        } catch {
            Write-Host "❌ No se pudo obtener cliente"
            return
        }
    }
    
    # Crear factura para el cliente real
    $invoice2Body = @{
        numeroFactura = "FAC-2024-002"
        fechaFactura = (Get-Date).ToString("yyyy-MM-dd")
        emisorId = $loginResponse.user.id
        receptorId = $clienteId
        importeTotal = 750
        estado = "PENDIENTE"
        concepto = "Servicios legales - Contrato de compraventa"
        items = @(
            @{
                descripcion = "Revisión de contrato"
                cantidad = 2
                precioUnitario = 300
                importe = 600
            },
            @{
                descripcion = "Gestión documental"
                cantidad = 1
                precioUnitario = 150
                importe = 150
            }
        )
    } | ConvertTo-Json -Depth 3
    
    try {
        $invoiceResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method POST -Headers $headers -Body $invoice2Body
        Write-Host "✅ Factura 2 creada: $($invoiceResponse.numeroFactura)"
    } catch {
        Write-Host "❌ Error creando factura 2: $($_.Exception.Message)"
    }
    
    # Ahora probar que el CLIENTE puede ver sus facturas
    Write-Host "`nProbando que el CLIENTE puede ver sus facturas..."
    
    # Login como cliente
    $clientLoginBody = @{
        email = "cliente1@test.com"
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $clientLoginResponse = Invoke-RestMethod -Uri $loginUri -Method POST -ContentType "application/json" -Body $clientLoginBody
        $clientToken = $clientLoginResponse.token
        Write-Host "✅ Login como cliente exitoso"
        
        $clientHeaders = @{
            "Authorization" = "Bearer $clientToken"
        }
        
        # Probar endpoint /api/invoices/my
        $clientInvoices = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/my" -Method GET -Headers $clientHeaders
        Write-Host "✅ CLIENTE puede ver sus facturas!"
        Write-Host "Facturas encontradas: $($clientInvoices.Count)"
        
        if ($clientInvoices.Count -gt 0) {
            Write-Host "Detalles de las facturas:"
            foreach ($invoice in $clientInvoices) {
                Write-Host "  - $($invoice.number): $($invoice.amount)€ - $($invoice.status)"
            }
        }
        
    } catch {
        Write-Host "❌ Error obteniendo facturas del cliente: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response body: $responseBody"
        }
    }
    
    # También probar que el ABOGADO puede ver todas las facturas
    Write-Host "`nProbando que el ABOGADO puede ver todas las facturas..."
    try {
        $allInvoices = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method GET -Headers $headers
        Write-Host "✅ ABOGADO puede ver todas las facturas!"
        Write-Host "Total de facturas: $($allInvoices.Count)"
    } catch {
        Write-Host "❌ Error obteniendo todas las facturas: $($_.Exception.Message)"
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
} 