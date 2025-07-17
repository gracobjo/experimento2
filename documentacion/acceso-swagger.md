# 📚 Guía de Acceso a Swagger - Sistema de Gestión Legal

## 🚀 Acceso Rápido

### URL Principal
```
http://localhost:3000/api/docs
```

### Requisitos Previos
- ✅ Servidor backend corriendo en puerto 3000
- ✅ Base de datos PostgreSQL configurada
- ✅ Variables de entorno configuradas

## 🔧 Configuración Inicial

### 1. Iniciar el Servidor Backend
```bash
cd backend
npm run start:dev
```

### 2. Verificar que el Servidor Esté Funcionando
Deberías ver en la consola:
```
🚀 Servidor corriendo en http://localhost:3000
📁 Archivos estáticos disponibles en http://localhost:3000/uploads
📚 Documentación Swagger disponible en http://localhost:3000/api/docs
```

### 3. Acceder a Swagger
Abre tu navegador y ve a: `http://localhost:3000/api/docs`

## 🎯 Características de Swagger

### ✅ Funcionalidades Disponibles
- **Documentación Interactiva** - Todos los endpoints documentados
- **Pruebas en Tiempo Real** - Prueba las APIs directamente desde el navegador
- **Autenticación JWT Integrada** - Sistema de autenticación completo
- **Filtrado por Tags** - Organización por funcionalidad
- **Esquemas Detallados** - Estructura de datos completa
- **Códigos de Respuesta** - Documentación de todos los códigos HTTP
- **Ejemplos de Uso** - Ejemplos prácticos para cada endpoint

### 🎨 Interfaz Personalizada
- **Diseño Adaptado** - Interfaz personalizada para el sistema legal
- **Sintaxis Resaltada** - Código con colores para mejor legibilidad
- **Persistencia de Autorización** - El token se mantiene entre sesiones
- **Filtrado Inteligente** - Búsqueda rápida de endpoints
- **Duración de Requests** - Muestra el tiempo de respuesta

## 🔐 Autenticación en Swagger

### Paso 1: Obtener Token
1. Expande la sección **auth** en Swagger
2. Busca el endpoint `POST /api/auth/login`
3. Haz clic en "Try it out"
4. Ingresa las credenciales:
   ```json
   {
     "email": "admin@despacho.com",
     "password": "password123"
   }
   ```
5. Ejecuta la petición
6. Copia el token de la respuesta

### Paso 2: Configurar Autorización
1. Haz clic en el botón **"Authorize"** en la parte superior
2. En el campo de autorización, ingresa:
   ```
   Bearer tu_token_jwt_aqui
   ```
3. Haz clic en "Authorize"
4. Cierra el modal

### Paso 3: Probar Endpoints Protegidos
Ahora puedes probar todos los endpoints que requieren autenticación.

## 📋 Organización de Endpoints

### 🔐 Autenticación (auth)
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `POST /api/auth/reset-password` - Restablecer contraseña
- `GET /api/auth/profile` - Obtener perfil del usuario

### 👤 Usuarios (users)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Obtener usuario específico
- `POST /api/users` - Crear usuario
- `PATCH /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario
- `GET /api/users/clients` - Obtener todos los clientes
- `GET /api/users/clients/my` - Mis clientes (abogado)
- `GET /api/users/clients/stats` - Estadísticas de clientes
- `GET /api/users/clients/report` - Reporte de clientes
- `GET /api/users/clients/profile` - Mi perfil de cliente
- `GET /api/users/lawyers` - Obtener todos los abogados

### 📋 Casos (cases)
- `GET /api/cases` - Listar casos
- `GET /api/cases/:id` - Obtener caso específico
- `POST /api/cases` - Crear caso
- `PATCH /api/cases/:id` - Actualizar caso
- `DELETE /api/cases/:id` - Eliminar caso
- `GET /api/cases/recent-activities` - Actividad reciente (abogados)
- `GET /api/cases/recent` - Casos recientes
- `GET /api/cases/by-client/{clientId}` - Casos por cliente
- `POST /api/cases/by-client/{clientId}` - Crear caso para cliente
- `PUT /api/cases/by-client/{clientId}/{caseId}` - Actualizar caso de cliente
- `PATCH /api/cases/by-client/{clientId}/{caseId}` - Actualizar parcialmente caso de cliente
- `DELETE /api/cases/by-client/{clientId}/{caseId}` - Eliminar caso de cliente

### 📅 Citas (appointments)
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `DELETE /api/appointments/:id` - Eliminar cita
- `PUT /api/appointments/:id` - Actualizar cita

### 📄 Documentos (documents)
- `GET /api/documents` - Listar documentos
- `POST /api/documents` - Subir documento
- `GET /api/documents/:id` - Obtener documento
- `DELETE /api/documents/:id` - Eliminar documento

### ✅ Tareas (tasks)
- `GET /api/tasks` - Listar tareas
- `POST /api/tasks` - Crear tarea
- `GET /api/tasks/:id` - Obtener tarea
- `PATCH /api/tasks/:id` - Actualizar tarea
- `DELETE /api/tasks/:id` - Eliminar tarea

### 💰 Facturación (invoices)
- `GET /api/invoices` - Listar facturas
- `POST /api/invoices` - Crear factura
- `GET /api/invoices/:id` - Obtener factura
- `PATCH /api/invoices/:id` - Actualizar factura
- `DELETE /api/invoices/:id` - Eliminar factura
- `POST /api/invoices/:id/generate-pdf` - Generar PDF
- `GET /api/invoices/by-client/{clientId}` - Facturas por cliente
- `POST /api/invoices/by-client/{clientId}` - Crear factura para cliente
- `PUT /api/invoices/by-client/{clientId}/{invoiceId}` - Actualizar factura de cliente
- `PATCH /api/invoices/by-client/{clientId}/{invoiceId}` - Actualizar parcialmente factura de cliente
- `DELETE /api/invoices/by-client/{clientId}/{invoiceId}` - Eliminar factura de cliente

### 🔐 Facturación Electrónica (Facturae)
- `POST /api/facturae/:id/generate-and-sign` - Generar y firmar factura electrónica
- `GET /api/facturae/:id/validate` - Validar factura electrónica
- `GET /api/facturae/:id/download` - Descargar XML firmado
- `GET /api/facturae/:id/validation-report` - Reporte de validación
- `GET /api/facturae/certificate/info` - Información del certificado
- `GET /api/facturae/certificate/status` - Estado del certificado
- `POST /api/facturae/validate-xml` - Validar XML directamente
- `GET /api/facturae/config` - Configuración del servicio
- `GET /api/facturae/test-connectivity` - Prueba de conectividad

### 🌐 Sistemas Externos (External Systems)
- `POST /api/external-systems/:invoiceId/send/:system` - Enviar factura a sistema externo
- `GET /api/external-systems/:invoiceId/validate/:system` - Validar factura para sistema externo
- `GET /api/external-systems/:invoiceId/status/:system` - Consultar estado en sistema externo
- `GET /api/external-systems/test-connectivity/:system` - Probar conectividad con sistema externo
- `GET /api/external-systems/available` - Sistemas externos disponibles
- `GET /api/external-systems/config/:system` - Configuración del sistema externo
- `POST /api/external-systems/batch-send/:system` - Envío masivo a sistema externo

### 💳 Provisiones de Fondos (provision-fondos)
- `GET /api/provision-fondos` - Listar provisiones
- `POST /api/provision-fondos` - Crear provisión
- `PATCH /api/provision-fondos/:id` - Actualizar provisión

### 💬 Chat (chat)
- `GET /api/chat/messages` - Obtener mensajes
- `POST /api/chat/messages` - Enviar mensaje
- `GET /api/chat/conversations` - Obtener conversaciones

### 📊 Reportes (reports)
- `GET /api/reports` - Obtener reportes
- `GET /api/reports/cases` - Reporte de expedientes
- `GET /api/reports/invoices` - Reporte de facturación
- `GET /api/reports/teleassistance` - Reporte de teleasistencia

### 🖥️ Teleasistencia (Teleassistance)
- `POST /api/teleassistance/sessions` - Crear sesión de teleasistencia
- `GET /api/teleassistance/sessions/:id` - Obtener sesión por ID
- `GET /api/teleassistance/sessions/user/:userId` - Sesiones de usuario
- `GET /api/teleassistance/sessions/assistant/:assistantId` - Sesiones de asistente
- `GET /api/teleassistance/sessions/pending` - Sesiones pendientes
- `PUT /api/teleassistance/sessions/:id` - Actualizar sesión
- `POST /api/teleassistance/sessions/:id/start` - Iniciar sesión
- `POST /api/teleassistance/sessions/:id/end` - Finalizar sesión
- `POST /api/teleassistance/sessions/:id/messages` - Agregar mensaje
- `GET /api/teleassistance/sessions/:id/messages` - Obtener mensajes
- `GET /api/teleassistance/remote-tools` - Herramientas de control remoto
- `GET /api/teleassistance/common-issues` - Problemas comunes
- `GET /api/teleassistance/stats` - Estadísticas de teleasistencia
- `GET /api/teleassistance/my-sessions` - Mis sesiones
- `GET /api/teleassistance/available-assistants` - Asistentes disponibles

### ⚙️ Administración (admin)
- `GET /api/admin/dashboard` - Dashboard administrativo
- `GET /api/admin/users` - Gestión de usuarios
- `GET /api/admin/cases` - Gestión de casos
- `GET /api/admin/appointments` - Gestión de citas
- `GET /api/admin/documents` - Gestión de documentos
- `GET /api/admin/tasks` - Gestión de tareas
- `GET /api/admin/reports` - Gestión de reportes
- `GET /api/admin/layouts` - Gestión de layouts
- `POST /api/admin/layouts` - Crear layout
- `PUT /api/admin/layouts/:id` - Actualizar layout
- `DELETE /api/admin/layouts/:id` - Eliminar layout

### 🔧 Parámetros (parametros)
- `GET /api/parametros` - Obtener parámetros
- `POST /api/parametros` - Crear parámetro
- `PUT /api/parametros/:id` - Actualizar parámetro
- `DELETE /api/parametros/:id` - Eliminar parámetro
- `GET /api/parametros/contact` - Parámetros de contacto (público)
- `GET /api/parametros/legal` - Contenido legal (público)

### 🏗️ Configuración de Menús (Menu Config)
- `GET /api/menu-config` - Obtener configuraciones de menús
- `POST /api/menu-config` - Crear configuración de menú
- `PUT /api/menu-config/:id` - Actualizar configuración de menú
- `DELETE /api/menu-config/:id` - Eliminar configuración de menú

### 🏢 Configuración del Sitio (Site Config)
- `GET /api/site-config` - Obtener configuraciones del sitio
- `POST /api/site-config` - Crear configuración del sitio
- `PUT /api/site-config/:id` - Actualizar configuración del sitio
- `DELETE /api/site-config/:id` - Eliminar configuración del sitio
- `GET /api/site-config/public` - Configuraciones públicas del sitio

### 📞 Contacto (contact)
- `POST /api/contact` - Enviar mensaje de contacto

## 🧪 Ejemplos de Prueba

### Ejemplo 1: Crear un Caso
1. Ve a la sección **cases**
2. Expande `POST /api/cases`
3. Haz clic en "Try it out"
4. Ingresa los datos:
   ```json
   {
     "title": "Caso de divorcio",
     "description": "Proceso de divorcio por mutuo acuerdo",
     "clientId": "client-uuid",
     "lawyerId": "lawyer-uuid"
   }
   ```
5. Ejecuta la petición

### Ejemplo 2: Generar y Firmar Factura Electrónica
1. Ve a la sección **Facturae**
2. Expande `POST /api/facturae/:id/generate-and-sign`
3. Haz clic en "Try it out"
4. Ingresa el ID de la factura y las opciones:
   ```json
   {
     "level": "T",
     "tsaUrl": "https://tsa.example.com/timestamp",
     "ocspUrl": "https://ocsp.example.com"
   }
   ```
5. Ejecuta la petición

### Ejemplo 3: Crear Sesión de Teleasistencia
1. Ve a la sección **Teleassistance**
2. Expande `POST /api/teleassistance/sessions`
3. Haz clic en "Try it out"
4. Ingresa los datos:
   ```json
   {
     "userId": "client-uuid",
     "assistantId": "lawyer-uuid",
     "issueType": "AUTOFIRMA",
     "description": "No puedo instalar Autofirma",
     "remoteTool": "REMOTELY_ANYWHERE"
   }
   ```
5. Ejecuta la petición

### Ejemplo 4: Enviar Factura a Sistema Externo
1. Ve a la sección **External Systems**
2. Expande `POST /api/external-systems/:invoiceId/send/:system`
3. Haz clic en "Try it out"
4. Ingresa el ID de la factura y el sistema (AEAT, FACE, GENERAL)
5. Ejecuta la petición

### Ejemplo 5: Obtener Casos Recientes
1. Ve a la sección **cases**
2. Expande `GET /api/cases/recent`
3. Haz clic en "Try it out"
4. Ejecuta la petición

### Ejemplo 6: Crear una Tarea
1. Ve a la sección **tasks**
2. Expande `POST /api/tasks`
3. Haz clic en "Try it out"
4. Ingresa los datos:
   ```json
   {
     "title": "Revisar documentación",
     "description": "Revisar documentos del caso de divorcio",
     "caseId": "case-uuid",
     "assignedTo": "lawyer-uuid",
     "priority": "MEDIA",
     "status": "PENDIENTE"
   }
   ```
5. Ejecuta la petición

## 🔍 Búsqueda y Filtrado

### Búsqueda de Endpoints
- Usa el campo de búsqueda en la parte superior
- Filtra por método HTTP (GET, POST, PUT, DELETE)
- Filtra por tags (auth, users, cases, etc.)

### Filtrado por Tags
- Haz clic en un tag específico para ver solo esos endpoints
- Usa múltiples tags para filtrar más específicamente

## 📊 Códigos de Respuesta

### Códigos Comunes
- **200** - Operación exitosa
- **201** - Recurso creado exitosamente
- **400** - Datos inválidos
- **401** - No autorizado (token inválido)
- **403** - Prohibido (rol insuficiente)
- **404** - Recurso no encontrado
- **409** - Conflicto (recurso duplicado)
- **500** - Error interno del servidor

## 🛠️ Solución de Problemas

### Problema: Swagger no carga
**Solución:**
1. Verificar que el servidor backend esté corriendo
2. Verificar que el puerto 3000 esté disponible
3. Revisar los logs del servidor

### Problema: Autenticación falla
**Solución:**
1. Verificar que el token esté en formato correcto: `Bearer token`
2. Verificar que el token no haya expirado
3. Obtener un nuevo token con login

### Problema: Endpoints no aparecen
**Solución:**
1. Verificar que el servidor esté corriendo con la configuración correcta
2. Verificar que todos los módulos estén importados en `app.module.ts`
3. Revisar los logs del servidor para errores de compilación

### Problema: Errores de CORS
**Solución:**
1. Verificar la configuración de CORS en `main.ts`
2. Asegurar que el frontend esté en el origen permitido
3. Verificar que las credenciales estén configuradas correctamente

## 📈 Estadísticas de la API

### Total de Endpoints: 100+
- **Autenticación**: 5 endpoints
- **Usuarios**: 11 endpoints
- **Casos**: 12 endpoints
- **Citas**: 4 endpoints
- **Documentos**: 4 endpoints
- **Tareas**: 5 endpoints
- **Facturación**: 12 endpoints
- **Facturación Electrónica**: 9 endpoints
- **Sistemas Externos**: 7 endpoints
- **Provisiones de Fondos**: 3 endpoints
- **Teleasistencia**: 15 endpoints
- **Reportes**: 4 endpoints
- **Administración**: 11 endpoints
- **Parámetros**: 6 endpoints
- **Configuración de Menús**: 4 endpoints
- **Configuración del Sitio**: 5 endpoints
- **Contacto**: 1 endpoint

### Cobertura por Roles
- **ADMIN**: Acceso completo a todos los endpoints
- **ABOGADO**: Acceso a gestión de casos, clientes, facturación y teleasistencia
- **CLIENTE**: Acceso limitado a sus propios datos y teleasistencia
- **Público**: Acceso a parámetros de contacto y configuración pública

---

**URL de Acceso**: `http://localhost:3000/api/docs`  
**Total de endpoints documentados**: 100+  
**Fecha de última actualización**: Diciembre 2024  
**Versión**: 2.0.0 