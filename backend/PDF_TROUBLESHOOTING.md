# 🔧 Solución de Problemas con PDFs

## 📋 Problema Descrito
Cuando se ejecuta `npm run build`, se borra la carpeta `dist` y su contenido. Al copiar manualmente, reiniciar el servidor y descargar un PDF, el archivo aparece corrupto.

## 🔍 Causas Identificadas

### 1. **Script de Build Optimization**
El script `frontend/scripts/build-optimization.js` elimina completamente la carpeta `dist` antes de hacer el build, incluyendo los templates necesarios para generar PDFs.

### 2. **Ruta Incorrecta del Template**
El servicio `PdfGeneratorService` busca el template HTML en una ruta que no coincide con la estructura después del build.

### 3. **Script Postbuild Fallido**
El script `copy-templates.js` puede fallar si no existe la estructura de directorios correcta.

## 🛠️ Soluciones Implementadas

### 1. **Servicio de PDF Mejorado**
- ✅ Búsqueda automática del template en múltiples ubicaciones
- ✅ Logging detallado para debugging
- ✅ Manejo robusto de errores

### 2. **Scripts de Verificación y Reparación**
- ✅ `verify-templates.js` - Verifica la estructura de templates
- ✅ `diagnose-pdf-issue.js` - Diagnóstico completo del sistema
- ✅ `fix-pdf-issue.js` - Reparación automática de problemas

### 3. **Script de Build Optimization Mejorado**
- ✅ Preserva archivos importantes en `dist`
- ✅ Elimina solo archivos de build, no la estructura completa

### 4. **Script Postbuild Robusto**
- ✅ Verificación de directorios antes de copiar
- ✅ Manejo de errores mejorado
- ✅ Logging detallado

## 🚀 Comandos de Solución

### Diagnóstico
```bash
# Verificar el estado actual del sistema
npm run diagnose-pdf
```

### Reparación Automática
```bash
# Reparar automáticamente todos los problemas
npm run fix-pdf
```

### Verificación Manual
```bash
# Verificar solo los templates
npm run verify-templates

# Build con verificación
npm run build:with-verify
```

### Rebuild Completo
```bash
# Limpiar y reconstruir todo
npm run prebuild
npm run build
npm run postbuild
npm run verify-templates
```

## 📁 Estructura de Archivos Esperada

```
backend/
├── src/
│   └── invoices/
│       └── templates/
│           └── invoice-template.html  ✅
├── dist/
│   ├── main.js                        ✅
│   └── invoices/
│       └── templates/
│           └── invoice-template.html  ✅
└── scripts/
    ├── copy-templates.js              ✅
    ├── verify-templates.js            ✅
    ├── diagnose-pdf-issue.js          ✅
    └── fix-pdf-issue.js               ✅
```

## 🔧 Verificación Manual

### 1. Verificar Template en src
```bash
ls -la src/invoices/templates/invoice-template.html
```

### 2. Verificar Template en dist
```bash
ls -la dist/invoices/templates/invoice-template.html
```

### 3. Verificar Dependencias
```bash
ls -la node_modules/puppeteer
ls -la node_modules/qrcode
```

### 4. Verificar Build
```bash
ls -la dist/main.js
```

## 🐛 Problemas Comunes

### Template no encontrado
**Síntoma:** Error "Template HTML no encontrado"
**Solución:** `npm run fix-pdf`

### PDF corrupto
**Síntoma:** Archivo descargado no se abre
**Causas posibles:**
- Template HTML malformado
- Puppeteer no puede generar PDF
- Error en la generación del QR

### Dependencias faltantes
**Síntoma:** Error de módulo no encontrado
**Solución:** `npm install`

## 📊 Logs de Debugging

### Habilitar Logs Detallados
El servicio de PDF ahora incluye logging detallado. Busca en los logs:
- `[PDF-TEMPLATE]` - Información sobre la búsqueda del template
- `Template encontrado en:` - Ruta donde se encontró el template
- `Error generando PDF:` - Errores específicos de generación

### Verificar Logs del Servidor
```bash
# En desarrollo
npm run start:dev

# En producción
npm run start:prod
```

## 🔄 Flujo de Trabajo Recomendado

### Para Desarrollo
1. `npm run start:dev` - Inicia servidor en modo desarrollo
2. Los templates se cargan desde `src/`
3. No hay problemas de build

### Para Producción
1. `npm run build:with-verify` - Build con verificación
2. `npm run start:prod` - Inicia servidor en producción
3. Los templates se cargan desde `dist/`

### Si Hay Problemas
1. `npm run diagnose-pdf` - Diagnóstico completo
2. `npm run fix-pdf` - Reparación automática
3. Reiniciar servidor
4. Probar generación de PDF

## 🎯 Verificación Final

Después de aplicar las soluciones:

1. **Generar un PDF de prueba**
2. **Verificar que el archivo se descarga correctamente**
3. **Abrir el PDF y verificar que el contenido es correcto**
4. **Verificar que el QR se genera y es escaneable**

## 📞 Soporte

Si los problemas persisten:

1. Ejecutar `npm run diagnose-pdf` y compartir la salida
2. Verificar logs del servidor durante la generación
3. Comprobar permisos de escritura en el sistema
4. Verificar que Puppeteer puede ejecutarse en el entorno

## 🔄 Actualizaciones

Este documento se actualiza automáticamente cuando se implementan nuevas soluciones. Última actualización: $(date) 