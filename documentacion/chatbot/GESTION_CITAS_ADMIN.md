# 📅 Gestión de Citas - Panel de Administración

## 🎯 Funcionalidades Disponibles

El panel de administración te permite controlar completamente todas las citas del sistema, incluyendo:

### ✅ Funcionalidades Principales
- **Ver todas las citas** del sistema
- **Asignar abogados** a citas existentes
- **Reprogramar citas** (cambiar fecha y hora)
- **Cambiar ubicación** de las citas
- **Agregar/modificar notas** de las citas
- **Eliminar citas** del sistema
- **Filtrar y buscar** citas por diferentes criterios

## 🚀 Cómo Acceder

### 1. Iniciar Sesión como Administrador
```
1. Ve a http://localhost:3000
2. Inicia sesión con credenciales de administrador
3. Serás redirigido al dashboard de administración
```

### 2. Navegar a Gestión de Citas
```
1. En el dashboard, busca la sección "Acciones Rápidas"
2. Haz clic en "Gestionar Citas" (ícono de calendario morado)
3. O navega directamente a: /admin/appointments
```

## 📋 Interfaz de Gestión de Citas

### 🔍 Filtros y Búsqueda
- **Buscar**: Busca por nombre de cliente, abogado, ubicación o notas
- **Filtrar por fecha**: Selecciona una fecha específica para ver solo las citas de ese día
- **Limpiar filtros**: Restablece todos los filtros

### 📊 Tabla de Citas
La tabla muestra:
- **Fecha y Hora**: Ordenable (haz clic para cambiar orden)
- **Cliente**: Nombre y email del cliente
- **Abogado**: Nombre y email del abogado asignado
- **Ubicación**: Lugar de la cita
- **Estado**: Próxima (verde) o Pasada (gris)
- **Acciones**: Botones para Editar y Eliminar

## ✏️ Editar una Cita

### 1. Abrir Modal de Edición
```
1. Encuentra la cita que quieres editar
2. Haz clic en el botón "Editar" (azul)
3. Se abrirá un modal con todos los campos editables
```

### 2. Campos Editables
- **Fecha**: Cambia la fecha de la cita
- **Hora**: Cambia la hora de la cita
- **Abogado**: Reasigna la cita a otro abogado
- **Ubicación**: Cambia el lugar de la cita
- **Notas**: Agrega o modifica notas adicionales

### 3. Guardar Cambios
```
1. Modifica los campos que necesites
2. Haz clic en "Guardar Cambios"
3. La cita se actualizará automáticamente
4. El modal se cerrará y verás los cambios en la tabla
```

## 🗑️ Eliminar una Cita

### Proceso de Eliminación
```
1. Encuentra la cita que quieres eliminar
2. Haz clic en el botón "Eliminar" (rojo)
3. Confirma la eliminación en el diálogo
4. La cita se eliminará permanentemente del sistema
```

⚠️ **Advertencia**: La eliminación es permanente y no se puede deshacer.

## 🔄 Casos de Uso Comunes

### 1. Reasignar Cita a Otro Abogado
```
1. El abogado original no puede atender
2. Haz clic en "Editar" en la cita
3. Cambia el campo "Abogado" por otro disponible
4. Guarda los cambios
```

### 2. Reprogramar Cita
```
1. El cliente necesita cambiar la fecha/hora
2. Haz clic en "Editar" en la cita
3. Cambia la fecha y/o hora
4. Opcionalmente actualiza la ubicación
5. Guarda los cambios
```

### 3. Cambiar Ubicación
```
1. La oficina original no está disponible
2. Haz clic en "Editar" en la cita
3. Cambia el campo "Ubicación"
4. Agrega notas explicativas si es necesario
5. Guarda los cambios
```

### 4. Cancelar Cita
```
1. El cliente o abogado no puede asistir
2. Haz clic en "Eliminar" en la cita
3. Confirma la eliminación
4. La cita se elimina del sistema
```

## 📱 Notificaciones Automáticas

### Email de Confirmación
- Cuando se edita una cita, se envía un email automático al cliente
- El email incluye los nuevos detalles de la cita
- También se notifica al abogado asignado

### Contenido del Email
```
Asunto: Tu cita ha sido actualizada

Hola [Nombre del Cliente],

Tu cita ha sido actualizada con los siguientes detalles:

📅 Fecha: [Nueva Fecha]
🕐 Hora: [Nueva Hora]
👨‍💼 Abogado: [Nombre del Abogado]
📍 Ubicación: [Nueva Ubicación]
📝 Notas: [Notas Adicionales]

Si tienes alguna pregunta, no dudes en contactarnos.

Saludos,
[Nombre del Sistema]
```

## 🛠️ Solución de Problemas

### Error: "No se pueden cargar las citas"
```
Posibles causas:
1. El backend no está ejecutándose
2. Problemas de conexión a la base de datos
3. Token de autenticación expirado

Solución:
1. Verifica que el backend esté corriendo en puerto 3001
2. Reinicia sesión como administrador
3. Verifica la conexión a la base de datos
```

### Error: "No tienes permisos"
```
Posibles causas:
1. Tu usuario no tiene rol de ADMIN
2. Token de autenticación inválido

Solución:
1. Verifica que tu usuario tenga rol ADMIN en la base de datos
2. Cierra sesión y vuelve a iniciar
3. Contacta al administrador del sistema
```

### Error: "No se puede actualizar la cita"
```
Posibles causas:
1. La cita ya no existe
2. Datos inválidos en el formulario
3. Problemas de validación

Solución:
1. Recarga la página y verifica que la cita aún existe
2. Verifica que todos los campos sean válidos
3. Asegúrate de que la fecha sea futura
```

## 📊 Estadísticas del Dashboard

### Información Disponible
- **Total de citas**: Número total de citas en el sistema
- **Citas recientes**: Últimas 3 citas programadas
- **Citas por estado**: Próximas vs pasadas
- **Distribución por abogado**: Cuántas citas tiene cada abogado

### Acceso a Estadísticas
```
1. Ve al dashboard principal (/admin/dashboard)
2. Busca la sección "Citas Recientes"
3. Haz clic en "Gestionar Citas" para ver todas
```

## 🔧 Configuración Avanzada

### Horarios de Disponibilidad
- Los abogados pueden configurar sus horarios disponibles
- El sistema respeta estos horarios al programar citas
- Los administradores pueden ver y modificar estos horarios

### Notificaciones
- Configuración de emails automáticos
- Plantillas de mensajes personalizables
- Recordatorios automáticos antes de las citas

### Reportes
- Generación de reportes de citas
- Estadísticas de asistencia
- Análisis de carga de trabajo por abogado

## 📞 Soporte

### Contacto Técnico
Si encuentras problemas técnicos:
1. Revisa los logs del backend
2. Verifica la conectividad de la base de datos
3. Contacta al equipo de desarrollo

### Documentación Adicional
- [API Documentation](http://localhost:3001/api-docs)
- [Guía de Usuario Completa](../documentacion/)
- [Manual de Administración](../documentacion/admin-manual.md)

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0  
**Autor**: Sistema de Gestión Legal 