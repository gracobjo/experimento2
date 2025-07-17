# 👤 Endpoints de Usuarios en Swagger - Solución Completa

## 🚀 Problema Resuelto

**Problema Original**: Los endpoints de usuarios no aparecían en Swagger en `http://localhost:3000/api/docs#/users`

**Causa**: El controlador de usuarios (`users.controller.ts`) no tenía los decoradores de Swagger necesarios.

**Solución**: Se agregaron todos los decoradores de Swagger al controlador y DTOs de usuarios.

## ✅ Endpoints de Usuarios Ahora Disponibles

### 🔐 Autenticación Requerida
Todos los endpoints requieren autenticación JWT. Primero obtén un token con:
```
POST /api/auth/login
```

### 📋 Lista Completa de Endpoints

#### 1. **POST /api/users** - Crear Usuario
- **Roles**: ADMIN, ABOGADO
- **Descripción**: Crea un nuevo usuario en el sistema
- **Body**: `CreateUserDto`
- **Respuesta**: Usuario creado con ID

#### 2. **GET /api/users** - Obtener Todos los Usuarios
- **Roles**: ADMIN
- **Descripción**: Devuelve la lista de todos los usuarios
- **Respuesta**: Array de usuarios

#### 3. **GET /api/users/clients** - Obtener Todos los Clientes
- **Roles**: ADMIN, ABOGADO
- **Descripción**: Devuelve la lista de todos los clientes
- **Respuesta**: Array de clientes

#### 4. **GET /api/users/clients/my** - Obtener Mis Clientes
- **Roles**: ABOGADO
- **Descripción**: Devuelve los clientes asignados al abogado autenticado
- **Respuesta**: Array de clientes del abogado

#### 5. **GET /api/users/clients/stats** - Estadísticas de Clientes
- **Roles**: ADMIN, ABOGADO
- **Descripción**: Devuelve estadísticas de clientes
- **Respuesta**: Objeto con estadísticas

#### 6. **GET /api/users/clients/report** - Reporte de Clientes
- **Roles**: ADMIN, ABOGADO
- **Descripción**: Devuelve un reporte detallado de clientes
- **Respuesta**: Objeto con reporte completo

#### 7. **GET /api/users/clients/profile** - Mi Perfil de Cliente
- **Roles**: CLIENTE
- **Descripción**: Devuelve el perfil del cliente autenticado
- **Respuesta**: Perfil del cliente con casos

#### 8. **GET /api/users/lawyers** - Obtener Todos los Abogados
- **Roles**: ADMIN, ABOGADO, CLIENTE
- **Descripción**: Devuelve la lista de todos los abogados
- **Respuesta**: Array de abogados

#### 9. **GET /api/users/:id** - Obtener Usuario por ID
- **Roles**: ADMIN
- **Descripción**: Devuelve un usuario específico por su ID
- **Parámetros**: `id` (string)
- **Respuesta**: Usuario encontrado

#### 10. **PATCH /api/users/:id** - Actualizar Usuario
- **Roles**: ADMIN
- **Descripción**: Actualiza la información de un usuario
- **Parámetros**: `id` (string)
- **Body**: `UpdateUserDto`
- **Respuesta**: Usuario actualizado

#### 11. **DELETE /api/users/:id** - Eliminar Usuario
- **Roles**: ADMIN
- **Descripción**: Elimina un usuario del sistema
- **Parámetros**: `id` (string)
- **Respuesta**: Mensaje de confirmación

## 📝 DTOs Documentados

### CreateUserDto
```typescript
{
  email: string;        // Email del usuario
  password: string;     // Contraseña (mínimo 6 caracteres)
  name: string;         // Nombre completo
  role: Role;          // ADMIN, ABOGADO, CLIENTE
}
```

### UpdateUserDto
```typescript
{
  email?: string;       // Email del usuario (opcional)
  password?: string;    // Contraseña (opcional, mínimo 6 caracteres)
  name?: string;        // Nombre completo (opcional)
  role?: Role;         // ADMIN, ABOGADO, CLIENTE (opcional)
}
```

## 🧪 Ejemplos de Prueba

### Ejemplo 1: Crear un Cliente
```json
POST /api/users
{
  "email": "cliente@ejemplo.com",
  "password": "password123",
  "name": "María García",
  "role": "CLIENTE"
}
```

### Ejemplo 2: Crear un Abogado
```json
POST /api/users
{
  "email": "abogado@despacho.com",
  "password": "password123",
  "name": "Dr. Carlos López",
  "role": "ABOGADO"
}
```

### Ejemplo 3: Actualizar Usuario
```json
PATCH /api/users/123e4567-e89b-12d3-a456-426614174001
{
  "name": "María García López",
  "email": "maria.garcia@ejemplo.com"
}
```

## 🔐 Roles y Permisos

### ADMIN
- ✅ Acceso completo a todos los endpoints
- ✅ Crear, leer, actualizar, eliminar usuarios
- ✅ Ver estadísticas y reportes completos

### ABOGADO
- ✅ Crear usuarios (clientes)
- ✅ Ver todos los clientes
- ✅ Ver sus clientes asignados
- ✅ Ver estadísticas de sus clientes
- ✅ Ver reportes de sus clientes
- ✅ Ver lista de abogados

### CLIENTE
- ✅ Ver su propio perfil
- ✅ Ver lista de abogados

## 📊 Códigos de Respuesta

| Código | Descripción | Endpoints |
|--------|-------------|-----------|
| 200 | Operación exitosa | GET, PATCH, DELETE |
| 201 | Usuario creado | POST |
| 400 | Datos inválidos | POST, PATCH |
| 401 | No autorizado | Todos |
| 403 | Rol insuficiente | Todos |
| 404 | Usuario no encontrado | GET/:id, PATCH/:id, DELETE/:id |
| 409 | Email ya existe | POST |

## 🛠️ Cómo Probar en Swagger

### Paso 1: Autenticación
1. Ve a `http://localhost:3000/api/docs`
2. Expande la sección **auth**
3. Prueba `POST /api/auth/login`
4. Copia el token de la respuesta

### Paso 2: Autorización
1. Haz clic en "Authorize"
2. Ingresa: `Bearer tu_token_jwt_aqui`
3. Haz clic en "Authorize"

### Paso 3: Probar Endpoints
1. Expande la sección **users**
2. Prueba los endpoints según tu rol
3. Usa "Try it out" para probar en tiempo real

## 🔧 Archivos Modificados

### Backend
- `backend/src/users/users.controller.ts` - Agregados decoradores Swagger
- `backend/src/users/dto/create-user.dto.ts` - Agregadas propiedades ApiProperty
- `backend/src/users/dto/update-user.dto.ts` - Agregadas propiedades ApiProperty

### Documentación
- `documentacion/swagger-users-endpoints.md` - Esta documentación

## 🎯 Beneficios Obtenidos

### Para Desarrolladores
- ✅ **Documentación Completa** - Todos los endpoints documentados
- ✅ **Ejemplos de Uso** - Ejemplos prácticos incluidos
- ✅ **Esquemas Detallados** - Estructura de datos clara
- ✅ **Códigos de Respuesta** - Todos los códigos HTTP documentados

### Para el Equipo
- ✅ **Pruebas Interactivas** - Prueba endpoints directamente
- ✅ **Autenticación Integrada** - Sistema JWT funcionando
- ✅ **Roles Claros** - Permisos bien documentados
- ✅ **Validación Visual** - Errores y respuestas claras

## 🚀 Acceso Rápido

**URL de Swagger**: `http://localhost:3000/api/docs`  
**Sección de Usuarios**: `http://localhost:3000/api/docs#/users`  
**Autenticación**: Usar token JWT obtenido de `/api/auth/login`

## 📚 Documentación Relacionada

- **[Acceso a Swagger](acceso-swagger.md)** - Guía completa de uso
- **[Configuración de Swagger](swagger-configuracion.md)** - Detalles técnicos
- **[Endpoints Completos](swagger-endpoints.md)** - Todos los endpoints del sistema

---

**Estado**: ✅ **COMPLETADO**  
**Endpoints de usuarios**: 11 endpoints documentados  
**Fecha de implementación**: Diciembre 2024  
**Versión**: 1.0.0 