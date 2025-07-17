# Guía de Integración - Facturación Electrónica Avanzada

## 🚀 Resumen de Implementación

Se ha implementado un sistema completo de facturación electrónica que incluye:

### ✅ **Funcionalidades Implementadas**

1. **Generación XML Facturae 3.2.2** - XML completo conforme al estándar oficial
2. **Firma Digital XAdES** - Soporte para niveles BES, T, C, X, XL
3. **Validación Avanzada** - Validación de esquema, reglas de negocio y firma
4. **Integración con Sistemas Externos** - AEAT, FACE, sistemas generales
5. **API REST Completa** - Endpoints documentados con Swagger
6. **Firma Automática** - Opcional tras la creación de facturas
7. **Descarga de XML** - Endpoint para descargar facturas firmadas

---

## 📋 Configuración Requerida

### Variables de Entorno

```bash
# Facturación Electrónica
FACTURAE_CERT_PATH=./certs/certificate.pem
FACTURAE_KEY_PATH=./certs/private_key.pem
FACTURAE_TSA_URL=https://tsa.example.com/timestamp
FACTURAE_OCSP_URL=https://ocsp.example.com
FACTURAE_XADES_LEVEL=BES
FACTURAE_OUTPUT_PATH=./output
FACTURAE_STRICT_VALIDATION=false
FACTURAE_ENABLE_LOGS=true
FACTURAE_AUTO_SIGN=false

# Sistemas Externos
AEAT_URL=https://www2.agenciatributaria.gob.es/wlpl/BUGTR/ws/fe/
AEAT_API_KEY=your-aeat-api-key
FACE_URL=https://face.gob.es/webservices/
FACE_API_KEY=your-face-api-key
GENERAL_SYSTEM_URL=https://your-system.com/api
GENERAL_SYSTEM_API_KEY=your-general-api-key
```

### Certificados Digitales

1. **Crear directorio de certificados:**
   ```bash
   mkdir -p certs
   ```

2. **Copiar certificado y clave privada:**
   ```bash
   cp tu_certificado.pem certs/certificate.pem
   cp tu_clave_privada.pem certs/private_key.pem
   ```

---

## 🔗 Endpoints Disponibles

### Facturación Electrónica (`/facturae`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/:id/generate-and-sign` | Generar y firmar factura |
| `GET` | `/:id/validate` | Validar factura |
| `GET` | `/:id/download` | Descargar XML firmado |
| `GET` | `/:id/validation-report` | Reporte de validación |
| `GET` | `certificate/info` | Info del certificado |
| `GET` | `certificate/status` | Estado del certificado |
| `POST` | `validate-xml` | Validar XML directamente |
| `GET` | `config` | Configuración del servicio |
| `GET` | `test-connectivity` | Prueba de conectividad |

### Sistemas Externos (`/external-systems`)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/:invoiceId/send/:system` | Enviar a sistema externo |
| `GET` | `/:invoiceId/validate/:system` | Validar para sistema |
| `GET` | `/:invoiceId/status/:system` | Estado en sistema externo |
| `GET` | `test-connectivity/:system` | Probar conectividad |
| `GET` | `available` | Sistemas disponibles |
| `GET` | `config/:system` | Configuración del sistema |
| `POST` | `batch-send/:system` | Envío masivo |

---

## 🛠️ Uso Práctico

### 1. Crear y Firmar Factura

```bash
# Crear factura (se genera XML automáticamente)
POST /invoices
{
  "numeroFactura": "FAC-2024-0001",
  "fechaFactura": "2024-01-15",
  "emisorId": "emisor-id",
  "receptorId": "receptor-id",
  "items": [
    {
      "description": "Servicios legales",
      "quantity": 1,
      "unitPrice": 100.00
    }
  ]
}

# Firmar factura con XAdES-T
POST /facturae/{invoiceId}/generate-and-sign
{
  "level": "T",
  "tsaUrl": "https://tsa.example.com/timestamp"
}
```

### 2. Validar Factura

```bash
# Validar estructura y firma
GET /facturae/{invoiceId}/validate?signature=true

# Validar solo estructura
GET /facturae/{invoiceId}/validate?signature=false
```

### 3. Enviar a Sistema Externo

```bash
# Validar para AEAT
GET /external-systems/{invoiceId}/validate/AEAT

# Enviar a AEAT
POST /external-systems/{invoiceId}/send/AEAT

# Consultar estado
GET /external-systems/{invoiceId}/status/AEAT
```

### 4. Descargar XML Firmado

```bash
GET /facturae/{invoiceId}/download
```

---

## 🔍 Validaciones Implementadas

### Validación de Esquema
- ✅ Estructura XML correcta
- ✅ Namespaces válidos
- ✅ Elementos obligatorios
- ✅ Tipos de datos correctos

### Validación de Negocio
- ✅ NIF/CIF válido
- ✅ Totales coherentes
- ✅ Fechas válidas
- ✅ Al menos un item

### Validación de Firma
- ✅ Estructura de firma
- ✅ Certificado presente
- ✅ Elementos XAdES válidos

### Validación para Sistemas Externos

#### AEAT
- ✅ Certificado digital válido
- ✅ Firma XAdES-BES o superior
- ✅ NIF/CIF válido emisor/receptor
- ✅ Totales > 0
- ✅ Fecha no futura

#### FACE
- ✅ Certificado digital válido
- ✅ Firma XAdES-T con sello de tiempo
- ✅ NIF/CIF válido emisor/receptor
- ✅ Totales > 0
- ✅ Fecha no futura
- ✅ Sello de tiempo TSA

---

## 📊 Niveles XAdES Soportados

| Nivel | Descripción | Requisitos |
|-------|-------------|------------|
| **BES** | Basic Electronic Signature | Certificado + Clave privada |
| **T** | Timestamp | BES + Servidor TSA |
| **C** | Certificate Validation | T + Servidor OCSP |
| **X** | Extended Validation | C + Sellos adicionales |
| **XL** | Long-term Validation | X + Archivo de largo plazo |

---

## 🚨 Manejo de Errores

### Respuestas de Error

```json
{
  "success": false,
  "errors": [
    "NIF inválido: 12345678A",
    "Los totales de la factura no coinciden"
  ],
  "warnings": [
    "El documento no contiene firma digital"
  ]
}
```

### Validación de Sistemas Externos

```json
{
  "system": "AEAT",
  "isValid": false,
  "errors": [
    "AEAT requiere certificado digital válido",
    "NIF del emisor no válido para AEAT"
  ],
  "requirements": [
    "Certificado digital válido",
    "Firma XAdES-BES o superior",
    "NIF/CIF válido del emisor"
  ]
}
```

---

## 🔧 Configuración Avanzada

### Firma Automática

Para habilitar la firma automática tras crear facturas:

```bash
FACTURAE_AUTO_SIGN=true
FACTURAE_XADES_LEVEL=T
```

### Validación Estricta

Para validación más estricta:

```bash
FACTURAE_STRICT_VALIDATION=true
```

### Logs Detallados

Para logs completos:

```bash
FACTURAE_ENABLE_LOGS=true
```

---

## 📈 Flujo de Trabajo Recomendado

### 1. **Configuración Inicial**
   - Configurar certificados digitales
   - Establecer variables de entorno
   - Probar conectividad con servicios externos

### 2. **Creación de Facturas**
   - Crear factura con datos completos
   - El sistema genera XML automáticamente
   - Opcional: firma automática

### 3. **Validación**
   - Validar estructura y firma
   - Validar para sistema externo específico
   - Revisar reporte de validación

### 4. **Firma Digital**
   - Firmar con nivel XAdES apropiado
   - Verificar certificado y estado
   - Descargar XML firmado

### 5. **Envío a Sistemas Externos**
   - Validar requisitos del sistema
   - Enviar factura firmada
   - Consultar estado de envío

---

## 🧪 Testing

### Ejecutar Tests Específicos

```bash
# Tests de facturación electrónica
npm run test -- --testPathPattern=facturae

# Tests de validación
npm run test -- --testPathPattern=validator

# Tests de sistemas externos
npm run test -- --testPathPattern=external-systems
```

### Probar Endpoints

```bash
# Probar conectividad
curl -X GET "http://localhost:3000/facturae/test-connectivity" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Validar certificado
curl -X GET "http://localhost:3000/facturae/certificate/status" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📚 Referencias

- [Facturae 3.2.2 - Ministerio de Industria](https://www.facturae.gob.es/)
- [XAdES - ETSI](https://www.etsi.org/standards)
- [XML-DSig - W3C](https://www.w3.org/TR/xmldsig-core/)
- [AEAT - Factura Electrónica](https://www.agenciatributaria.es/AEAT.internet/Inicio/Ayuda/Manuales__Folletos_y_Videos/Manuales_practicos/Manual_practico_de_la_factura_electronica.html)

---

## 🆘 Soporte

Para problemas o consultas:

1. **Revisar logs del sistema**
2. **Verificar configuración de certificados**
3. **Consultar documentación oficial de Facturae**
4. **Contactar al equipo de desarrollo**

### Logs Importantes

```bash
# Logs de facturación
tail -f logs/facturae.log

# Logs de sistemas externos
tail -f logs/external-systems.log

# Logs de validación
tail -f logs/validation.log
``` 