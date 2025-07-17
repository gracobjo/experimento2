# 📚 Documentación Completa de Endpoints API - Swagger

## 🎯 Información General

- **URL Base**: `http://localhost:3000`
- **Documentación Swagger**: `http://localhost:3000/api`
- **Autenticación**: JWT Bearer Token
- **Formato**: JSON

## 🔐 Autenticación

### **Headers Requeridos**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 👥 Usuarios (Users)

### **GET /api/users**
**Descripción**: Obtener lista de usuarios
**Roles**: ADMIN
**Respuesta**: Lista de usuarios con información básica

### **GET /api/users/:id**
**Descripción**: Obtener usuario por ID
**Roles**: ADMIN, ABOGADO (solo su propio perfil)
**Parámetros**: `id` (string) - ID del usuario

### **POST /api/users**
**Descripción**: Crear nuevo usuario
**Roles**: ADMIN
**Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "ADMIN | ABOGADO | CLIENTE"
}
```

### **PUT /api/users/:id**
**Descripción**: Actualizar usuario
**Roles**: ADMIN, ABOGADO (solo su propio perfil)
**Body**: Campos a actualizar

### **DELETE /api/users/:id**
**Descripción**: Eliminar usuario
**Roles**: ADMIN

### **GET /api/users/clients**
**Descripción**: Obtener todos los clientes
**Roles**: ADMIN, ABOGADO
**Respuesta**: Lista de clientes

### **GET /api/users/clients/my**
**Descripción**: Obtener mis clientes (abogado autenticado)
**Roles**: ABOGADO
**Respuesta**: Lista de clientes del abogado

### **GET /api/users/clients/stats**
**Descripción**: Estadísticas de clientes
**Roles**: ADMIN, ABOGADO
**Respuesta**: Estadísticas de clientes

### **GET /api/users/clients/report**
**Descripción**: Reporte detallado de clientes
**Roles**: ADMIN, ABOGADO
**Respuesta**: Reporte completo de clientes

### **GET /api/users/clients/profile**
**Descripción**: Mi perfil de cliente
**Roles**: CLIENTE
**Respuesta**: Perfil del cliente con casos

### **GET /api/users/lawyers**
**Descripción**: Obtener todos los abogados
**Roles**: ADMIN, ABOGADO, CLIENTE
**Respuesta**: Lista de abogados

---

## 🔐 Autenticación (Auth)

### **POST /api/auth/login**
**Descripción**: Iniciar sesión
**Body**:
```json
{
  "email": "string",
  "password": "string"
}
```

### **POST /api/auth/register**
**Descripción**: Registrar nuevo usuario
**Body**:
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "CLIENTE"
}
```

### **POST /api/auth/forgot-password**
**Descripción**: Solicitar restablecimiento de contraseña
**Body**:
```json
{
  "email": "string"
}
```

### **POST /api/auth/reset-password**
**Descripción**: Restablecer contraseña
**Body**:
```json
{
  "token": "string",
  "password": "string"
}
```

---

## 📋 Expedientes (Cases)

### **GET /api/cases**
**Descripción**: Obtener lista de expedientes
**Roles**: ADMIN, ABOGADO, CLIENTE
**Query Params**: `page`, `limit`, `status`, `search`

### **GET /api/cases/:id**
**Descripción**: Obtener expediente por ID
**Roles**: ADMIN, ABOGADO, CLIENTE (solo sus propios casos)

### **POST /api/cases**
**Descripción**: Crear nuevo expediente
**Roles**: ABOGADO
**Body**:
```json
{
  "title": "string",
  "description": "string",
  "clientId": "string",
  "status": "ACTIVE | CLOSED | PENDING"
}
```

### **PUT /api/cases/:id**
**Descripción**: Actualizar expediente
**Roles**: ABOGADO (solo sus propios casos)

### **DELETE /api/cases/:id**
**Descripción**: Eliminar expediente
**Roles**: ABOGADO (solo sus propios casos)

### **GET /api/cases/recent**
**Descripción**: Obtener expedientes recientes
**Roles**: ADMIN, ABOGADO, CLIENTE
**Query Params**: `limit` (default: 5)

### **GET /api/cases/recent-activities**
**Descripción**: Obtener actividad reciente completa (abogados)
**Roles**: ABOGADO
**Respuesta**: Expedientes, tareas, citas y provisiones recientes

### **GET /api/cases/by-client/{clientId}**
**Descripción**: Lista todos los casos de un cliente específico
**Roles**: ADMIN, ABOGADO
**Query Params**: `clientId`

### **POST /api/cases/by-client/{clientId}**
**Descripción**: Crea un nuevo caso para un cliente
**Roles**: ADMIN, ABOGADO
**Body**: CreateCaseDto

### **PUT /api/cases/by-client/{clientId}/{caseId}**
**Descripción**: Actualiza un caso de un cliente
**Roles**: ADMIN, ABOGADO
**Body**: UpdateCaseDto

### **PATCH /api/cases/by-client/{clientId}/{caseId}**
**Descripción**: Actualiza parcialmente un caso de un cliente
**Roles**: ADMIN, ABOGADO
**Body**: UpdateCaseDto

### **DELETE /api/cases/by-client/{clientId}/{caseId}**
**Descripción**: Elimina un caso de un cliente
**Roles**: ADMIN, ABOGADO

---

## 📄 Documentos (Documents)

### **GET /api/documents**
**Descripción**: Obtener lista de documentos
**Roles**: ADMIN, ABOGADO, CLIENTE
**Query Params**: `caseId`, `type`, `page`, `limit`

### **POST /api/documents/upload**
**Descripción**: Subir documento
**Roles**: ADMIN, ABOGADO, CLIENTE
**Content-Type**: `multipart/form-data`
**Body**:
```form-data
file: File
caseId: string
type: string
description: string
```

### **GET /api/documents/:id**
**Descripción**: Obtener documento por ID
**Roles**: ADMIN, ABOGADO, CLIENTE (solo documentos relacionados)

### **DELETE /api/documents/:id**
**Descripción**: Eliminar documento
**Roles**: ADMIN, ABOGADO (solo documentos propios)

---

## 📅 Citas (Appointments)

### **GET /api/appointments**
**Descripción**: Obtener lista de citas
**Roles**: ADMIN, ABOGADO, CLIENTE
**Query Params**: `date`, `status`, `userId`

### **POST /api/appointments**
**Descripción**: Crear nueva cita
**Roles**: ABOGADO
**Body**:
```json
{
  "title": "string",
  "description": "string",
  "date": "2024-01-15T10:00:00Z",
  "clientId": "string",
  "duration": 60
}
```

### **PUT /api/appointments/:id**
**Descripción**: Actualizar cita
**Roles**: ABOGADO

### **DELETE /api/appointments/:id**
**Descripción**: Eliminar cita
**Roles**: ABOGADO

---

## ✅ Tareas (Tasks)

### **GET /api/tasks**
**Descripción**: Obtener lista de tareas
**Roles**: ADMIN, ABOGADO
**Query Params**: `status`, `priority`, `assignedTo`

### **POST /api/tasks**
**Descripción**: Crear nueva tarea
**Roles**: ABOGADO
**Body**:
```json
{
  "title": "string",
  "description": "string",
  "priority": "LOW | MEDIUM | HIGH",
  "dueDate": "2024-01-15T10:00:00Z",
  "assignedTo": "string"
}
```

### **PUT /api/tasks/:id**
**Descripción**: Actualizar tarea
**Roles**: ABOGADO

### **DELETE /api/tasks/:id**
**Descripción**: Eliminar tarea
**Roles**: ABOGADO

---

## 💰 Facturación (Invoices)

### **GET /api/invoices**
**Descripción**: Obtener lista de facturas
**Roles**: ADMIN, ABOGADO
**Query Params**: `status`, `clientId`, `dateFrom`, `dateTo`

### **POST /api/invoices**
**Descripción**: Crear nueva factura
**Roles**: ABOGADO
**Body**:
```json
{
  "clientId": "string",
  "items": [
    {
      "description": "string",
      "quantity": 1,
      "unitPrice": 100.00
    }
  ],
  "paymentMethod": "TRANSFER | CASH | CARD"
}
```

### **GET /api/invoices/:id**
**Descripción**: Obtener factura por ID
**Roles**: ADMIN, ABOGADO

### **PUT /api/invoices/:id**
**Descripción**: Actualizar factura
**Roles**: ABOGADO

### **POST /api/invoices/:id/generate-pdf**
**Descripción**: Generar PDF de factura
**Roles**: ABOGADO

### **GET /api/invoices/by-client/{clientId}**
**Descripción**: Lista todas las facturas de un cliente específico
**Roles**: ADMIN, ABOGADO
**Query Params**: `clientId`

### **POST /api/invoices/by-client/{clientId}**
**Descripción**: Crea una nueva factura para un cliente
**Roles**: ADMIN, ABOGADO
**Body**: CreateInvoiceDto

### **PUT /api/invoices/by-client/{clientId}/{invoiceId}**
**Descripción**: Actualiza una factura de un cliente
**Roles**: ADMIN, ABOGADO
**Body**: UpdateInvoiceDto

### **PATCH /api/invoices/by-client/{clientId}/{invoiceId}**
**Descripción**: Actualiza parcialmente una factura de un cliente
**Roles**: ADMIN, ABOGADO
**Body**: UpdateInvoiceDto

### **DELETE /api/invoices/by-client/{clientId}/{invoiceId}**
**Descripción**: Elimina una factura de un cliente
**Roles**: ADMIN, ABOGADO

### **GET /api/invoices/by-client/{clientId}/recent**
**Descripción**: Obtener facturas recientes de un cliente
**Roles**: ADMIN, ABOGADO
**Query Params**: `clientId`

### **GET /api/invoices/by-client/{clientId}/stats**
**Descripción**: Estadísticas de facturación de un cliente
**Roles**: ADMIN, ABOGADO
**Query Params**: `clientId`

### **GET /api/invoices/by-client/{clientId}/report**
**Descripción**: Reporte detallado de facturación de un cliente
**Roles**: ADMIN, ABOGADO
**Query Params**: `clientId`

---

## 🔐 Facturación Electrónica (Facturae)

### **POST /api/facturae/:id/generate-and-sign**
**Descripción**: Generar y firmar factura electrónica
**Roles**: ADMIN, ABOGADO
**Body**:
```json
{
  "level": "BES | T | C | X | XL",
  "tsaUrl": "string",
  "ocspUrl": "string",
  "policy": "string",
  "signerRole": "string"
}
```

### **GET /api/facturae/:id/validate**
**Descripción**: Validar factura electrónica
**Roles**: ADMIN, ABOGADO
**Query Params**: `signature` (boolean)

### **GET /api/facturae/:id/download**
**Descripción**: Descargar XML firmado
**Roles**: ADMIN, ABOGADO
**Respuesta**: Archivo XML

### **GET /api/facturae/:id/validation-report**
**Descripción**: Reporte de validación
**Roles**: ADMIN, ABOGADO

### **GET /api/facturae/certificate/info**
**Descripción**: Información del certificado
**Roles**: ADMIN, ABOGADO

### **GET /api/facturae/certificate/status**
**Descripción**: Estado del certificado
**Roles**: ADMIN, ABOGADO

### **POST /api/facturae/validate-xml**
**Descripción**: Validar XML directamente
**Roles**: ADMIN, ABOGADO
**Body**:
```json
{
  "xml": "string",
  "checkSignature": true
}
```

### **GET /api/facturae/config**
**Descripción**: Configuración del servicio
**Roles**: ADMIN, ABOGADO

### **GET /api/facturae/test-connectivity**
**Descripción**: Prueba de conectividad
**Roles**: ADMIN, ABOGADO

---

## 🌐 Sistemas Externos (External Systems)

### **POST /api/external-systems/:invoiceId/send/:system**
**Descripción**: Enviar factura a sistema externo
**Roles**: ADMIN, ABOGADO
**Parámetros**: `invoiceId` (string), `system` (AEAT | FACE | GENERAL)

### **GET /api/external-systems/:invoiceId/validate/:system**
**Descripción**: Validar factura para sistema externo
**Roles**: ADMIN, ABOGADO
**Parámetros**: `invoiceId` (string), `system` (AEAT | FACE | GENERAL)

### **GET /api/external-systems/:invoiceId/status/:system**
**Descripción**: Consultar estado en sistema externo
**Roles**: ADMIN, ABOGADO
**Parámetros**: `invoiceId` (string), `system` (string)

### **GET /api/external-systems/test-connectivity/:system**
**Descripción**: Probar conectividad con sistema externo
**Roles**: ADMIN, ABOGADO
**Parámetros**: `system` (string)

### **GET /api/external-systems/available**
**Descripción**: Sistemas externos disponibles
**Roles**: ADMIN, ABOGADO

### **GET /api/external-systems/config/:system**
**Descripción**: Configuración del sistema externo
**Roles**: ADMIN, ABOGADO
**Parámetros**: `system` (string)

### **POST /api/external-systems/batch-send/:system**
**Descripción**: Envío masivo a sistema externo
**Roles**: ADMIN, ABOGADO
**Parámetros**: `system` (AEAT | FACE | GENERAL)
**Body**:
```json
{
  "invoiceIds": ["string"]
}
```

---

## 💳 Provisiones de Fondos

### **GET /api/provision-fondos**
**Descripción**: Obtener lista de provisiones
**Roles**: ADMIN, ABOGADO, CLIENTE
**Query Params**: `status`, `clientId`

### **POST /api/provision-fondos**
**Descripción**: Crear nueva provisión
**Roles**: ABOGADO
**Body**:
```json
{
  "clientId": "string",
  "amount": 1000.00,
  "description": "string",
  "dueDate": "2024-01-15T10:00:00Z"
}
```

### **PUT /api/provision-fondos/:id**
**Descripción**: Actualizar provisión
**Roles**: ABOGADO

---

## ⚙️ Parámetros (Parametros)

### **GET /api/parametros**
**Descripción**: Obtener parámetros del sistema
**Roles**: ADMIN
**Query Params**: `category`, `key`

### **POST /api/parametros**
**Descripción**: Crear nuevo parámetro
**Roles**: ADMIN
**Body**:
```json
{
  "key": "string",
  "value": "string",
  "type": "string",
  "category": "string",
  "isPublic": true
}
```

### **PUT /api/parametros/:id**
**Descripción**: Actualizar parámetro
**Roles**: ADMIN

### **DELETE /api/parametros/:id**
**Descripción**: Eliminar parámetro
**Roles**: ADMIN

### **GET /api/parametros/contact**
**Descripción**: Obtener parámetros de contacto (público)
**Roles**: Público
**Respuesta**: Parámetros de contacto para el frontend

### **GET /api/parametros/legal**
**Descripción**: Obtener contenido legal (público)
**Roles**: Público
**Respuesta**: Contenido legal (privacidad, términos, etc.)

---

## 🏗️ Configuración de Menús (Menu Config)

### **GET /api/menu-config**
**Descripción**: Obtener configuraciones de menús
**Roles**: ADMIN
**Query Params**: `role`, `isActive`

### **POST /api/menu-config**
**Descripción**: Crear nueva configuración de menú
**Roles**: ADMIN
**Body**:
```json
{
  "name": "string",
  "role": "ADMIN | ABOGADO | CLIENTE",
  "orientation": "horizontal | vertical",
  "isActive": true,
  "items": [
    {
      "label": "string",
      "url": "string",
      "icon": "string",
      "order": 1,
      "isVisible": true,
      "isExternal": false
    }
  ]
}
```

### **PUT /api/menu-config/:id**
**Descripción**: Actualizar configuración de menú
**Roles**: ADMIN

### **DELETE /api/menu-config/:id**
**Descripción**: Eliminar configuración de menú
**Roles**: ADMIN

---

## 🏢 Configuración del Sitio (Site Config)

### **GET /api/site-config**
**Descripción**: Obtener configuraciones del sitio
**Roles**: ADMIN
**Query Params**: `category`, `isPublic`

### **POST /api/site-config**
**Descripción**: Crear nueva configuración del sitio
**Roles**: ADMIN
**Body**:
```json
{
  "key": "string",
  "value": "string",
  "type": "string",
  "category": "string",
  "isPublic": true
}
```

### **PUT /api/site-config/:id**
**Descripción**: Actualizar configuración del sitio
**Roles**: ADMIN

### **DELETE /api/site-config/:id**
**Descripción**: Eliminar configuración del sitio
**Roles**: ADMIN

### **GET /api/site-config/public**
**Descripción**: Obtener configuraciones públicas del sitio
**Roles**: Público
**Respuesta**: Configuraciones públicas

---

## 🖥️ Teleasistencia (Teleassistance)

### **POST /api/teleassistance/sessions**
**Descripción**: Crear nueva sesión de teleasistencia
**Roles**: ADMIN, ABOGADO, CLIENTE
**Body**:
```json
{
  "userId": "string",
  "assistantId": "string",
  "issueType": "AUTOFIRMA | CERTIFICADO_DIGITAL | SEDES | CLAVE_PIN | NAVEGADOR | SISTEMA_OPERATIVO | OTRO",
  "description": "string",
  "remoteTool": "REMOTELY_ANYWHERE | TEAMVIEWER_QUICKSUPPORT | ANYDESK | CHROME_REMOTE_DESKTOP | OTRO"
}
```

### **GET /api/teleassistance/sessions/:id**
**Descripción**: Obtener sesión de teleasistencia por ID
**Roles**: ADMIN, ABOGADO, CLIENTE (solo sesiones relacionadas)

### **GET /api/teleassistance/sessions/user/:userId**
**Descripción**: Obtener sesiones de teleasistencia de un usuario
**Roles**: ADMIN, ABOGADO, CLIENTE (solo sus propias sesiones)

### **GET /api/teleassistance/sessions/assistant/:assistantId**
**Descripción**: Obtener sesiones de teleasistencia de un asistente
**Roles**: ADMIN, ABOGADO

### **GET /api/teleassistance/sessions/pending**
**Descripción**: Obtener sesiones pendientes de teleasistencia
**Roles**: ADMIN, ABOGADO

### **PUT /api/teleassistance/sessions/:id**
**Descripción**: Actualizar sesión de teleasistencia
**Roles**: ADMIN, ABOGADO
**Body**:
```json
{
  "status": "PENDING | ACTIVE | COMPLETED | CANCELLED",
  "resolution": "string",
  "notes": "string"
}
```

### **POST /api/teleassistance/sessions/:id/start**
**Descripción**: Iniciar una sesión de teleasistencia
**Roles**: ADMIN, ABOGADO

### **POST /api/teleassistance/sessions/:id/end**
**Descripción**: Finalizar una sesión de teleasistencia
**Roles**: ADMIN, ABOGADO
**Body**:
```json
{
  "resolution": "string"
}
```

### **POST /api/teleassistance/sessions/:id/messages**
**Descripción**: Agregar un mensaje a una sesión de teleasistencia
**Roles**: ADMIN, ABOGADO, CLIENTE (solo en sus sesiones)
**Body**:
```json
{
  "content": "string",
  "messageType": "TEXT | INSTRUCTION | SYSTEM"
}
```

### **GET /api/teleassistance/sessions/:id/messages**
**Descripción**: Obtener mensajes de una sesión de teleasistencia
**Roles**: ADMIN, ABOGADO, CLIENTE (solo en sus sesiones)

### **GET /api/teleassistance/remote-tools**
**Descripción**: Obtener herramientas de control remoto disponibles
**Roles**: ADMIN, ABOGADO, CLIENTE

### **GET /api/teleassistance/common-issues**
**Descripción**: Obtener problemas comunes y sus soluciones
**Roles**: ADMIN, ABOGADO, CLIENTE

### **GET /api/teleassistance/stats**
**Descripción**: Obtener estadísticas de teleasistencia
**Roles**: ADMIN

### **GET /api/teleassistance/my-sessions**
**Descripción**: Obtener sesiones del usuario autenticado
**Roles**: ADMIN, ABOGADO, CLIENTE

### **GET /api/teleassistance/available-assistants**
**Descripción**: Obtener asistentes disponibles para teleasistencia
**Roles**: ADMIN, ABOGADO, CLIENTE

---

## 📊 Reportes (Reports)

### **GET /api/reports/cases**
**Descripción**: Generar reporte de expedientes
**Roles**: ADMIN, ABOGADO
**Query Params**: `dateFrom`, `dateTo`, `status`, `clientId`

### **GET /api/reports/invoices**
**Descripción**: Generar reporte de facturación
**Roles**: ADMIN, ABOGADO
**Query Params**: `dateFrom`, `dateTo`, `status`

### **GET /api/reports/teleassistance**
**Descripción**: Generar reporte de teleasistencia
**Roles**: ADMIN
**Query Params**: `dateFrom`, `dateTo`, `issueType`, `assistantId`

---

## 💬 Chat

### **WebSocket: /chat**
**Descripción**: Conexión WebSocket para chat en tiempo real
**Eventos**:
- `join`: Unirse a una sala
- `message`: Enviar mensaje
- `leave`: Salir de una sala

---

## 📞 Contacto

### **POST /api/contact**
**Descripción**: Enviar mensaje de contacto
**Body**:
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```

---

## 🔧 Administración (Admin)

### **GET /api/admin/dashboard**
**Descripción**: Dashboard administrativo
**Roles**: ADMIN

### **GET /api/admin/users**
**Descripción**: Gestión de usuarios
**Roles**: ADMIN

### **GET /api/admin/cases**
**Descripción**: Gestión de casos
**Roles**: ADMIN

### **GET /api/admin/appointments**
**Descripción**: Gestión de citas
**Roles**: ADMIN

### **GET /api/admin/documents**
**Descripción**: Gestión de documentos
**Roles**: ADMIN

### **GET /api/admin/tasks**
**Descripción**: Gestión de tareas
**Roles**: ADMIN

### **GET /api/admin/reports**
**Descripción**: Gestión de reportes
**Roles**: ADMIN

### **GET /api/admin/layouts**
**Descripción**: Obtener layouts del sistema
**Roles**: ADMIN

### **POST /api/admin/layouts**
**Descripción**: Crear nuevo layout
**Roles**: ADMIN

### **PUT /api/admin/layouts/:id**
**Descripción**: Actualizar layout
**Roles**: ADMIN

### **DELETE /api/admin/layouts/:id**
**Descripción**: Eliminar layout
**Roles**: ADMIN

### **GET /api/admin/menu-config**
**Descripción**: Obtener configuración de menús
**Roles**: ADMIN

### **POST /api/admin/menu-config**
**Descripción**: Crear configuración de menú
**Roles**: ADMIN

### **GET /api/admin/site-config**
**Descripción**: Obtener configuración del sitio
**Roles**: ADMIN

### **POST /api/admin/site-config**
**Descripción**: Crear configuración del sitio
**Roles**: ADMIN

---

## 📝 Códigos de Estado HTTP

- **200**: OK - Operación exitosa
- **201**: Created - Recurso creado exitosamente
- **400**: Bad Request - Datos inválidos
- **401**: Unauthorized - No autenticado
- **403**: Forbidden - No autorizado
- **404**: Not Found - Recurso no encontrado
- **500**: Internal Server Error - Error del servidor

---

## 🔒 Roles y Permisos

### **ADMIN**
- Acceso completo a todas las funcionalidades
- Gestión de usuarios y configuraciones del sistema
- Estadísticas y reportes completos

### **ABOGADO**
- Gestión de expedientes, citas, tareas y facturas
- Acceso a documentos relacionados
- Teleasistencia como asistente
- Reportes limitados

### **CLIENTE**
- Acceso a sus propios expedientes y documentos
- Solicitud de citas
- Teleasistencia como usuario
- Acceso limitado a funcionalidades

---

## 📚 Ejemplos de Uso

### **Crear Sesión de Teleasistencia**
```bash
curl -X POST http://localhost:3000/api/teleassistance/sessions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "client_id",
    "assistantId": "lawyer_id",
    "issueType": "AUTOFIRMA",
    "description": "No puedo instalar Autofirma",
    "remoteTool": "REMOTELY_ANYWHERE"
  }'
```

### **Generar y Firmar Factura Electrónica**
```bash
curl -X POST http://localhost:3000/api/facturae/invoice_id/generate-and-sign \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "T",
    "tsaUrl": "https://tsa.example.com/timestamp",
    "ocspUrl": "https://ocsp.example.com"
  }'
```

### **Enviar Factura a Sistema Externo**
```bash
curl -X POST http://localhost:3000/api/external-systems/invoice_id/send/AEAT \
  -H "Authorization: Bearer <token>"
```

### **Obtener Sesiones Pendientes**
```bash
curl -X GET http://localhost:3000/api/teleassistance/sessions/pending \
  -H "Authorization: Bearer <token>"
```

### **Enviar Mensaje en Sesión**
```bash
curl -X POST http://localhost:3000/api/teleassistance/sessions/session_id/messages \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Hola, ¿cómo puedo ayudarte?",
    "messageType": "TEXT"
  }'
```

---

**📖 Para más información, consulta la documentación completa en Swagger UI: `http://localhost:3000/api`** 