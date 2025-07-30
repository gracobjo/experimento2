# 🔐 Integración AutoFirma - Firma Digital de Facturas

## 📋 Resumen

Esta integración permite a los abogados firmar digitalmente las facturas PDF generadas por el sistema usando AutoFirma, el software oficial del Gobierno de España para firma digital.

## 🏗️ Arquitectura

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   AutoFirma     │
│   (React)       │    │   (NestJS)       │    │   HTTP Server   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Botón "Firmar"     │                       │
         │──────────────────────▶│                       │
         │                       │ 2. Generar PDF        │
         │                       │──────────────────────▶│
         │                       │ 3. Enviar a AutoFirma │
         │                       │──────────────────────▶│
         │                       │ 4. PDF firmado        │
         │                       │◀──────────────────────│
         │ 5. Descargar PDF      │                       │
         │◀──────────────────────│                       │
```

## 🚀 Instalación y Configuración

### 1. Requisitos Previos

- **Node.js** (versión 16 o superior)
- **AutoFirma** instalado en el equipo
- **Certificado digital** (FNMT, DNIe, etc.)

### 2. Iniciar el Servidor AutoFirma

```bash
# Opción 1: Usar el script batch (Windows)
start-autofirma.bat

# Opción 2: Comando directo
node autofirma-http-server.js
```

El servidor se iniciará en `http://127.0.0.1:8080`

### 3. Verificar Estado

```bash
# Verificación básica
curl http://127.0.0.1:8080/status

# Verificación completa
node check-autofirma.js
```

Respuesta esperada del servidor:
```json
{
  "status": "running",
  "service": "AutoFirma HTTP Service",
  "version": "2.0.0",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "autofirma": {
    "installed": true,
    "running": true,
    "available": true,
    "installation": {
      "installed": true,
      "message": "AutoFirma está instalado",
      "path": "C:\\Program Files\\AutoFirma",
      "platform": "win32"
    },
    "runningInfo": {
      "running": true,
      "message": "AutoFirma está ejecutándose",
      "platform": "win32",
      "pid": "1234"
    }
  },
  "endpoints": [
    "/afirma-sign-pdf - Firmar PDFs",
    "/afirma-signature-http - Firmar XMLs",
    "/status - Estado del servicio"
  ],
  "message": "AutoFirma está disponible y funcionando"
}
```

## 📱 Uso en el Frontend

### 1. Acceder a la Firma Digital

1. Ir a la página de **Facturas** (rol ABOGADO)
2. Buscar la factura que se desea firmar
3. Hacer clic en el botón **🔐 FIRMAR**

### 2. Proceso de Firma

1. **Verificación de AutoFirma**: El sistema verifica que AutoFirma esté disponible
2. **Selección de Certificado**: Elegir el tipo de certificado (FNMT, DNIe, Otro)
3. **Firma Digital**: El PDF se envía a AutoFirma para ser firmado
4. **Descarga**: El PDF firmado se puede descargar inmediatamente

### 3. Estados del Sistema

- ✅ **AutoFirma disponible**: Se puede proceder con la firma
- ❌ **AutoFirma no instalado**: Mostrar instrucciones de instalación
- 🔄 **AutoFirma no ejecutándose**: Solicitar abrir AutoFirma manualmente
- 🌐 **Servidor HTTP no disponible**: Solicitar ejecutar servidor
- 🔄 **Firmando**: Proceso en curso
- ✅ **Firma completada**: PDF listo para descarga

## 🔧 Endpoints del Backend

### POST `/invoices/:id/sign-pdf`

Firma digitalmente un PDF de factura.

**Parámetros:**
- `id`: ID de la factura
- `certificateType`: Tipo de certificado ('FNMT', 'DNIe', 'Other')

**Respuesta:**
```json
{
  "success": true,
  "signedPdf": "base64_encoded_pdf",
  "signatureInfo": {
    "signer": "Abogado Demo",
    "timestamp": "2024-01-01T12:00:00.000Z",
    "certificate": "Certificado FNMT Demo",
    "signatureAlgorithm": "SHA256withRSA"
  },
  "downloadUrl": "/uploads/signed-invoices/factura_firmada_123_1704110400000.pdf"
}
```

### GET `/invoices/:id/signed-pdf`

Descarga el PDF firmado.

### GET `/invoices/autofirma/status`

Verifica el estado de AutoFirma.

## 🛠️ Servicios del Backend

### DigitalSignatureService

```typescript
// Firmar PDF con AutoFirma
async signPdfWithAutoFirma(request: SignatureRequest): Promise<SignatureResponse>

// Verificar estado de AutoFirma
async checkAutoFirmaStatus(): Promise<boolean>

// Obtener información del certificado
async getCertificateInfo(userId: string): Promise<CertificateInfo | null>

// Validar PDF firmado
async validateSignedPdf(signedPdfBase64: string): Promise<boolean>

// Guardar PDF firmado
async saveSignedPdf(invoiceId: string, signedPdfBase64: string): Promise<string>
```

## 📁 Estructura de Archivos

```
├── autofirma-http-server.js          # Servidor AutoFirma HTTP
├── start-autofirma.bat               # Script de inicio (Windows)
├── check-autofirma.js                # Verificador de estado de AutoFirma
├── test-autofirma-integration.js     # Pruebas de integración
├── backend/src/invoices/
│   ├── digital-signature.service.ts  # Servicio de firma digital
│   ├── invoices.controller.ts        # Controlador con endpoints
│   └── invoices.module.ts            # Módulo con dependencias
└── frontend/src/
    ├── components/
    │   └── DigitalSignatureModal.tsx # Modal de firma digital
    └── pages/lawyer/
        └── InvoicesPage.tsx          # Página con botón de firma
```

## 🔒 Seguridad

### Permisos
- Solo usuarios con rol **ABOGADO** pueden firmar facturas
- Solo el emisor de la factura puede firmarla (excepto ADMIN)
- Los clientes pueden descargar facturas firmadas que les correspondan

### Validaciones
- Verificación de existencia de factura
- Validación de permisos de usuario
- Comprobación de estado de AutoFirma
- Validación de certificados digitales

## 🐛 Solución de Problemas

### AutoFirma no disponible

**Síntomas:**
- Error "AutoFirma no está disponible"
- Estado "stopped" en verificación

**Soluciones:**
1. Verificar que AutoFirma esté instalado
2. Ejecutar `start-autofirma.bat`
3. Verificar puerto 8080 disponible
4. Revisar logs del servidor

### Error de certificado

**Síntomas:**
- Error "Certificado no válido"
- Firma fallida

**Soluciones:**
1. Verificar que el certificado esté instalado
2. Comprobar validez del certificado
3. Insertar tarjeta criptográfica si es necesario
4. Verificar drivers del lector

### Error de conexión

**Síntomas:**
- Error "ECONNREFUSED"
- Timeout en solicitudes

**Soluciones:**
1. Verificar que el servidor esté ejecutándose
2. Comprobar firewall
3. Verificar puerto 8080
4. Reiniciar servidor AutoFirma

## 📊 Auditoría

Todas las firmas digitales se registran en el sistema de auditoría:

- **Acción**: `status_changed`
- **Campo**: `estado`
- **Valor anterior**: `emitida`
- **Valor nuevo**: `firmada`
- **Descripción**: "Factura firmada digitalmente"

## 🔄 Flujo Completo

1. **Abogado** accede a facturas
2. **Selecciona** factura para firmar
3. **Hace clic** en "🔐 FIRMAR"
4. **Sistema verifica** AutoFirma
5. **Abogado selecciona** certificado
6. **Sistema genera** PDF
7. **PDF se envía** a AutoFirma
8. **AutoFirma solicita** PIN/certificado
9. **Abogado firma** con certificado
10. **PDF firmado** se devuelve
11. **Sistema guarda** PDF firmado
12. **Abogado descarga** PDF firmado
13. **Sistema registra** auditoría

## 🎯 Próximas Mejoras

- [ ] Integración con AutoFirma real (no simulado)
- [ ] Soporte para múltiples certificados
- [ ] Validación de firmas en tiempo real
- [ ] Integración con sellos de tiempo
- [ ] Soporte para firmas avanzadas (XAdES)
- [ ] Interfaz para gestión de certificados
- [ ] Notificaciones de estado de firma
- [ ] Historial de firmas por usuario

## 📞 Soporte

Para problemas técnicos:
1. Revisar logs del servidor AutoFirma
2. Verificar estado con `/status`
3. Comprobar permisos de usuario
4. Validar certificados digitales

---

**Nota**: Esta implementación actualmente simula la firma digital. Para uso en producción, se requiere la integración completa con AutoFirma real. 