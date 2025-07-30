# Script para crear archivos Mermaid con sintaxis correcta y codificación UTF-8 sin BOM

Write-Host "Creando archivos Mermaid con sintaxis corregida..."

# Crear el contenido línea por línea para evitar problemas de escape
$lines = @(
    "classDiagram",
    "class User {",
    "  -String id",
    "  +login()",
    "}",
    "",
    "class Client {",
    "  -String id", 
    "  +getCases()",
    "}",
    "",
    "User ||--o{ Client : has"
)

# Unir las líneas con saltos de línea LF
$classDiagram = $lines -join "`n"

# Escribir el archivo con codificación UTF-8 sin BOM
[System.IO.File]::WriteAllText("documentacion/imagenes-diagramas/diagrama-clases-correct.mmd", $classDiagram, [System.Text.UTF8Encoding]::new($false))

Write-Host "Archivo diagrama-clases-correct.mmd creado exitosamente"
Write-Host "Contenido del archivo:"
Get-Content "documentacion/imagenes-diagramas/diagrama-clases-correct.mmd" | ForEach-Object { Write-Host "  $_" }

Write-Host "`nProbando generación de imagen..."

# Intentar generar la imagen
try {
    $result = npx @mermaid-js/mermaid-cli -i "documentacion/imagenes-diagramas/diagrama-clases-correct.mmd" -o "documentacion/imagenes-diagramas/diagrama-clases.png" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "¡Éxito! Imagen generada correctamente."
    } else {
        Write-Host "Error en la generación: $result"
        Write-Host "Intentando con sintaxis más simple..."
        
        # Sintaxis más simple
        $simpleDiagram = @"
classDiagram
    class User
    class Client
    User ||--o{ Client
"@
        [System.IO.File]::WriteAllText("documentacion/imagenes-diagramas/diagrama-clases-simple.mmd", $simpleDiagram, [System.Text.UTF8Encoding]::new($false))
        
        $result2 = npx @mermaid-js/mermaid-cli -i "documentacion/imagenes-diagramas/diagrama-clases-simple.mmd" -o "documentacion/imagenes-diagramas/diagrama-clases.png" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "¡Éxito con sintaxis simple! Imagen generada correctamente."
        } else {
            Write-Host "Error incluso con sintaxis simple: $result2"
        }
    }
} catch {
    Write-Host "Error: $_"
} 