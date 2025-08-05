# Script de PowerShell para probar la generación de facturas

Write-Host "🚀 Probando generación de factura..." -ForegroundColor Green

# Datos de la factura de prueba
$invoiceData = @{
    numeroFactura = "FAC-TEST-001"
    fechaFactura = "2025-08-02"
    fechaOperacion = "2025-08-02"
    tipoFactura = "F"
    receptorId = "1"
    importeTotal = 1500.00
    baseImponible = 1239.67
    cuotaIVA = 260.33
    tipoIVA = 21
    regimenIvaEmisor = "General"
    claveOperacion = "01"
    metodoPago = "TRANSFERENCIA"
    estado = "emitida"
    items = @(
        @{
            description = "Servicios de asesoría legal"
            quantity = 10
            unitPrice = 123.97
            total = 1239.67
        }
    )
    aplicarIVA = $true
    retencion = ""
    descuento = 0
    tipoImpuesto = "iva"
} | ConvertTo-Json -Depth 10

Write-Host "📝 Creando factura de prueba..." -ForegroundColor Yellow

try {
    # Crear la factura
    $createResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices" -Method POST -Body $invoiceData -ContentType "application/json" -Headers @{"Authorization" = "Bearer test-token"}
    
    if ($createResponse.id) {
        Write-Host "✅ Factura creada con ID: $($createResponse.id)" -ForegroundColor Green
        
        # Descargar el PDF
        Write-Host "📄 Descargando PDF..." -ForegroundColor Yellow
        $pdfResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/invoices/$($createResponse.id)/pdf-qr" -Method GET -Headers @{"Authorization" = "Bearer test-token"} -OutFile "factura-test-nueva.pdf"
        
        Write-Host "✅ PDF guardado como: factura-test-nueva.pdf" -ForegroundColor Green
    } else {
        Write-Host "❌ No se pudo crear la factura" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
} 