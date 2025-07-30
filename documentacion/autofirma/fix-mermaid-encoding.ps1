# Script para corregir codificación y saltos de línea de archivos Mermaid
# Convierte archivos a UTF-8 sin BOM y saltos de línea LF

param(
    [string]$InputFile = "documentacion/imagenes-diagramas/diagrama-clases.mmd",
    [string]$OutputFile = "documentacion/imagenes-diagramas/diagrama-clases-fixed.mmd"
)

Write-Host "Corrigiendo codificación y saltos de línea para: $InputFile"

# Leer el contenido del archivo
$content = Get-Content -Path $InputFile -Raw -Encoding UTF8

# Convertir saltos de línea CRLF a LF
$content = $content -replace "`r`n", "`n"

# Eliminar cualquier BOM si existe
$content = $content.TrimStart([char]0xFEFF)

# Escribir el archivo con codificación UTF-8 sin BOM y saltos de línea LF
[System.IO.File]::WriteAllText($OutputFile, $content, [System.Text.UTF8Encoding]::new($false))

Write-Host "Archivo corregido guardado como: $OutputFile"
Write-Host "Ahora puedes usar: npx @mermaid-js/mermaid-cli -i $OutputFile -o documentacion/imagenes-diagramas/diagrama-clases.png" 