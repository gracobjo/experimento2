# 🔧 Configuración de Swagger - Sistema de Gestión Legal

## 📋 Resumen de la Configuración

Se ha configurado Swagger para documentar todos los endpoints del sistema de gestión legal, organizándolos de manera clara y profesional.

## 🎯 Características Implementadas

### ✅ Configuración Principal
- **Swagger UI** configurado en `/api/docs`
- **Autenticación JWT** integrada
- **Tags organizados** por funcionalidad
- **Esquemas detallados** para request/response
- **Ejemplos de uso** incluidos
- **Códigos de respuesta** documentados

### 🏷️ Tags Organizados
1. **auth** - Autenticación y gestión de usuarios
2. **users** - Gestión de usuarios y perfiles
3. **cases** - Gestión de casos y expedientes
4. **appointments** - Gestión de citas y agendas
5. **documents** - Gestión de documentos
6. **tasks** - Gestión de tareas y seguimiento
7. **invoices** - Facturación electrónica
8. **provision-fondos** - Gestión de provisiones de fondos
9. **chat** - Chat y mensajería
10. **reports** - Reportes y estadísticas
11. **admin** - Funciones administrativas
12. **parametros** - Configuración de parámetros del sistema

## 📁 Archivos Modificados

### 1. Configuración Principal
- `backend/src/main.ts` - Configuración de Swagger UI
- `backend/src/app.module.ts` - Módulos del sistema

### 2. DTOs con Documentación
- `backend/src/auth/dto/login.dto.ts`
- `backend/src/auth/dto/register.dto.ts`
- `backend/src/auth/dto/forgot-password.dto.ts`
- `backend/src/auth/dto/reset-password.dto.ts`
- `backend/src/cases/dto/create-case.dto.ts`
- `backend/src/cases/dto/update-case.dto.ts`
- `backend/src/appointments/dto/create-appointment.dto.ts`

### 3. Controladores Documentados
- `backend/src/auth/auth.controller.ts`
- `backend/src/cases/cases.controller.ts`
- `backend/src/appointments/appointments.controller.ts`
- `backend/src/tasks/tasks.controller.ts`
- `backend/src/chat/chat.controller.ts`
- `backend/src/parametros/parametros.controller.ts`

### 4. Documentación Creada
- `documentacion/swagger-endpoints.md` - Lista completa de endpoints
- `documentacion/swagger-configuracion.md` - Esta documentación

## 🔐 Autenticación Configurada

### JWT Bearer Token
```yaml
Authorization: Bearer <token>
```

### Roles del Sistema
- **ADMIN**: Acceso completo
- **ABOGADO**: Gestión de casos, clientes, citas
- **CLIENTE**: Acceso limitado a sus datos

## 📊 Estadísticas de Endpoints

### Total de Endpoints: 60+

| Categoría | Endpoints | Métodos Principales |
|-----------|-----------|-------------------|
| Auth | 5 | POST, GET |
| Users | 10 | GET, POST, PATCH, DELETE |
| Cases | 6 | GET, POST, PATCH, DELETE |
| Appointments | 2 | GET, POST |
| Documents | 5 | GET, POST, DELETE |
| Tasks | 8 | GET, POST, PATCH, DELETE |
| Invoices | 6 | GET, POST, PATCH, DELETE |
| Provision Fondos | 4 | GET, POST, PATCH |
| Chat | 5 | GET, POST |
| Reports | 1 | GET |
| Admin | 20 | GET, POST, PUT, DELETE |
| Parámetros | 5 | GET, POST, PUT, DELETE |

## 🎨 Personalización de Swagger UI

### Estilo Personalizado
```css
.swagger-ui .topbar { display: none }
.swagger-ui .info .title { color: #2c3e50; font-size: 2.5em; }
.swagger-ui .info .description { font-size: 1.1em; line-height: 1.6; }
.swagger-ui .scheme-container { background: #f8f9fa; padding: 10px; border-radius: 5px; }
```

### Opciones Configuradas
- ✅ **persistAuthorization**: true
- ✅ **docExpansion**: 'none'
- ✅ **filter**: true
- ✅ **showRequestDuration**: true
- ✅ **syntaxHighlight**: activado
- ✅ **tryItOutEnabled**: true

## 🚀 Cómo Acceder

### URL de Acceso
```
http://localhost:3000/api/docs
```

### Características Disponibles
- 📖 **Documentación Interactiva**
- 🧪 **Pruebas en Tiempo Real**
- 🔍 **Búsqueda de Endpoints**
- 📋 **Filtrado por Tags**
- 🔐 **Autenticación Integrada**
- 📊 **Esquemas Detallados**

## 📝 Ejemplos de Uso

### 1. Iniciar Sesión
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@despacho.com",
    "password": "password123"
  }'
```

### 2. Crear Caso (con autenticación)
```bash
curl -X POST http://localhost:3000/api/cases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Caso de divorcio",
    "description": "Proceso de divorcio por mutuo acuerdo",
    "clientId": "client-uuid",
    "lawyerId": "lawyer-uuid"
  }'
```

### 3. Obtener Casos
```bash
curl -X GET http://localhost:3000/api/cases \
  -H "Authorization: Bearer <token>"
```

## 🔧 Configuración Técnica

### Dependencias Utilizadas
```json
{
  "@nestjs/swagger": "^7.3.0"
}
```

### Decoradores Implementados
- `@ApiTags()` - Organización por categorías
- `@ApiOperation()` - Descripción de operaciones
- `@ApiResponse()` - Documentación de respuestas
- `@ApiBearerAuth()` - Autenticación JWT
- `@ApiBody()` - Esquemas de request
- `@ApiParam()` - Parámetros de URL
- `@ApiQuery()` - Parámetros de query
- `@ApiProperty()` - Propiedades de DTOs

## 📋 Códigos de Respuesta Documentados

| Código | Descripción | Uso |
|--------|-------------|-----|
| 200 | Operación exitosa | GET, PATCH, DELETE |
| 201 | Recurso creado | POST |
| 400 | Datos inválidos | Validación |
| 401 | No autorizado | Token inválido |
| 403 | Prohibido | Rol insuficiente |
| 404 | No encontrado | Recurso inexistente |
| 409 | Conflicto | Recurso duplicado |
| 500 | Error interno | Servidor |

## 🎯 Beneficios de la Configuración

### Para Desarrolladores
- ✅ **Documentación Automática** - Siempre actualizada
- ✅ **Pruebas Interactivas** - Sin herramientas externas
- ✅ **Esquemas Claros** - Estructura de datos definida
- ✅ **Ejemplos de Uso** - Implementación guiada

### Para el Equipo
- ✅ **Comunicación Mejorada** - API clara para todos
- ✅ **Onboarding Rápido** - Nuevos desarrolladores
- ✅ **Testing Simplificado** - Pruebas directas
- ✅ **Documentación Viva** - Siempre sincronizada

### Para el Cliente
- ✅ **Transparencia** - API completamente documentada
- ✅ **Facilidad de Integración** - Ejemplos claros
- ✅ **Soporte Mejorado** - Problemas más fáciles de resolver

## 🔄 Mantenimiento

### Actualizaciones Automáticas
- Los cambios en los controladores se reflejan automáticamente
- Los DTOs actualizados se documentan automáticamente
- Los nuevos endpoints aparecen automáticamente

### Buenas Prácticas
- ✅ Mantener descripciones claras y concisas
- ✅ Usar ejemplos relevantes
- ✅ Documentar todos los códigos de respuesta
- ✅ Organizar endpoints por funcionalidad
- ✅ Mantener consistencia en la nomenclatura

## 📞 Soporte

### Enlaces Útiles
- **Swagger UI**: `http://localhost:3000/api/docs`
- **Documentación Completa**: `documentacion/swagger-endpoints.md`
- **Guía de Uso**: `documentacion/guia-rapida.md`

### Problemas Comunes
1. **Swagger no carga**: Verificar que el servidor esté corriendo
2. **Autenticación falla**: Verificar formato del token JWT
3. **Endpoints no aparecen**: Verificar decoradores en controladores

---

**Configuración completada exitosamente** ✅  
**Total de endpoints documentados**: 60+  
**Fecha de configuración**: Diciembre 2024  
**Versión**: 1.0.0 