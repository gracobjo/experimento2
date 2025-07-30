# Uniformidad de Modales por Roles - QuickActions

## Objetivo
Proporcionar una experiencia uniforme y consistente para abogados y administradores, permitiendo que ambos roles tengan acceso a las mismas funcionalidades con lógica adaptativa según el contexto.

## Cambios Implementados

### ✅ **Botones por Rol**

#### Antes
```typescript
// Solo clientes podían programar citas
{user?.role === 'CLIENTE' && (
  <button onClick={() => setModal('cita')}>Programar Cita</button>
)}

// Solo abogados podían agregar notas
{user?.role === 'ABOGADO' && (
  <button onClick={() => setModal('nota')}>Agregar Nota</button>
)}

// Mensajes para todos
<button onClick={() => setModal('mensaje')}>Enviar Mensaje</button>
```

#### Después
```typescript
// Botones para Clientes
{user?.role === 'CLIENTE' && (
  <>
    <button onClick={() => setModal('cita')}>Programar Cita</button>
    <button onClick={() => setModal('mensaje')}>Enviar Mensaje</button>
  </>
)}

// Botones para Abogados y Administradores
{(user?.role === 'ABOGADO' || user?.role === 'ADMIN') && (
  <>
    <button onClick={() => setModal('nota')}>Agregar Nota</button>
    <button onClick={() => setModal('mensaje')}>Enviar Mensaje</button>
    <button onClick={() => setModal('cita')}>Programar Cita</button>
  </>
)}
```

### ✅ **Lógica Adaptativa por Rol**

#### Modal "Programar Cita"

##### Para Clientes
- **Descripción**: "Programe una cita con [Nombre del Abogado] para este expediente"
- **Información mostrada**: Datos del abogado asignado
- **Lógica**: Cliente crea cita con su abogado
- **Payload**: `{ lawyerId, date, location, notes }`

##### Para Abogados/Administradores
- **Descripción**: "Programe una cita con [Nombre del Cliente] para este expediente"
- **Información mostrada**: Datos del cliente del expediente
- **Lógica**: Abogado/Admin crea cita para el cliente
- **Payload**: `{ clientId, lawyerId: user.id, date, location, notes }`

#### Modal "Enviar Mensaje"

##### Para Clientes
- **Descripción**: "Envíe un mensaje a [Nombre del Abogado] relacionado con este expediente"
- **Información mostrada**: Datos del abogado (caja azul)
- **Placeholder**: "Escriba su mensaje aquí. Este mensaje será enviado a su abogado..."

##### Para Abogados/Administradores
- **Descripción**: "Envíe un mensaje a [Nombre del Cliente] relacionado con este expediente"
- **Información mostrada**: Datos del cliente (caja púrpura)
- **Placeholder**: "Escriba su mensaje aquí. Este mensaje será enviado al cliente..."

#### Modal "Agregar Nota"
- **Accesible para**: Abogados y Administradores
- **Descripción**: "Agregue una nota interna al expediente para su seguimiento"
- **Información mostrada**: Datos del expediente y cliente
- **Contexto**: Nota interna para el equipo legal

## Estructura de Funcionalidades por Rol

### 👤 **Cliente**
```
┌─ Programar Cita (con su abogado)
└─ Enviar Mensaje (a su abogado)
```

### 👨‍💼 **Abogado**
```
┌─ Agregar Nota (al expediente)
├─ Enviar Mensaje (al cliente)
└─ Programar Cita (para el cliente)
```

### 👑 **Administrador**
```
┌─ Agregar Nota (al expediente)
├─ Enviar Mensaje (al cliente)
└─ Programar Cita (para el cliente)
```

## Códigos de Color por Contexto

### 🟢 **Verde - Citas**
- **Clientes**: Información del abogado
- **Abogados/Admin**: Información del cliente

### 🔵 **Azul - Mensajes (Clientes)**
- Información del destinatario (abogado)

### 🟣 **Púrpura - Mensajes (Abogados/Admin)**
- Información del destinatario (cliente)

### 🟢 **Verde - Notas**
- Información del expediente y cliente

## Beneficios Obtenidos

### 🎯 **Uniformidad de UX**
- **Experiencia consistente**: Abogados y administradores tienen las mismas opciones
- **Flujo de trabajo unificado**: Mismos modales con lógica adaptativa
- **Menos confusión**: Roles similares tienen funcionalidades similares

### 🔄 **Flexibilidad Operativa**
- **Abogados**: Pueden programar citas y enviar mensajes a clientes
- **Administradores**: Acceso completo a todas las funcionalidades
- **Contexto claro**: Cada modal muestra información relevante según el rol

### 📱 **Mejor Accesibilidad**
- **Información contextual**: Cada modal muestra datos relevantes
- **Descripciones específicas**: Textos adaptados al rol del usuario
- **Navegación intuitiva**: Flujo lógico según las responsabilidades

## Lógica de Negocio

### 📅 **Programación de Citas**
```typescript
if (user?.role === 'CLIENTE') {
  // Cliente programa cita con su abogado
  payload = { lawyerId, date, location, notes };
} else {
  // Abogado/Admin programa cita para el cliente
  payload = { clientId, lawyerId: user.id, date, location, notes };
}
```

### 💬 **Envío de Mensajes**
```typescript
if (user?.role === 'CLIENTE') {
  // Cliente envía mensaje a su abogado
  destinatario = expedienteData.lawyer;
} else {
  // Abogado/Admin envía mensaje al cliente
  destinatario = expedienteData.client;
}
```

### 📝 **Agregar Notas**
```typescript
// Solo abogados y administradores
// Nota interna para seguimiento del expediente
contexto = { expediente: expedienteData.title, cliente: expedienteData.client.name };
```

## Archivos Modificados

- `frontend/src/components/QuickActions.tsx`

## Resultado

La interfaz ahora proporciona:
- ✅ **Uniformidad completa** entre abogados y administradores
- ✅ **Lógica adaptativa** según el rol del usuario
- ✅ **Contexto claro** en cada modal
- ✅ **Flujo de trabajo unificado** para roles similares
- ✅ **Mejor experiencia de usuario** con información relevante

Los usuarios ahora pueden:
1. **Abogados**: Acceder a todas las funcionalidades con contexto de cliente
2. **Administradores**: Mismas funcionalidades que los abogados
3. **Clientes**: Funcionalidades específicas con contexto de abogado
4. **Todos**: Información clara sobre destinatarios y contexto 