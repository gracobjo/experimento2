# 🔧 Guía de Solución de Problemas - Sistema de Citas

## 🚨 **Problemas Reportados y Soluciones**

### **1. Problemas del Calendario Visual**

#### **❌ Problema: Calendario demasiado grande y cubre la pantalla**
**Síntomas:**
- El calendario ocupa toda la pantalla
- No se puede ver el contenido detrás
- Interfiere con la navegación

**✅ Solución Implementada:**
```css
/* Reducir tamaño máximo */
max-w-3xl w-full max-h-[85vh] flex flex-col

/* Agregar padding para evitar que toque los bordes */
p-4

/* Usar flexbox para mejor control del layout */
flex flex-col
```

**Cambios realizados:**
- Reducido de `max-w-4xl` a `max-w-3xl`
- Cambiado de `max-h-[90vh]` a `max-h-[85vh]`
- Agregado padding exterior `p-4`
- Implementado layout flexbox para mejor control

#### **❌ Problema: No admite scroll**
**Síntomas:**
- No se puede hacer scroll en el calendario
- Las fechas no son accesibles si hay muchas
- El contenido se corta

**✅ Solución Implementada:**
```css
/* Contenido principal con scroll */
<div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
  {/* Calendario con scroll vertical */}
  <div className="lg:w-1/2 p-4 border-r border-gray-200 overflow-y-auto">
  {/* Horarios con scroll vertical */}
  <div className="lg:w-1/2 p-4 overflow-y-auto">
```

**Cambios realizados:**
- Agregado `overflow-y-auto` a ambas secciones
- Implementado `flex-1 overflow-hidden` en contenedor principal
- Asegurado que el header y footer sean `flex-shrink-0`

#### **❌ Problema: Botón de aceptar no se ve**
**Síntomas:**
- El botón "Confirmar Cita" no es visible
- No se puede completar la selección de fecha
- El footer está oculto

**✅ Solución Implementada:**
```css
/* Footer siempre visible */
<div className="bg-gray-50 p-3 border-t border-gray-200 flex-shrink-0">
  <button
    onClick={handleConfirm}
    disabled={!selectedDate || !selectedTime}
    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
      selectedDate && selectedTime
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    Confirmar Cita
  </button>
</div>
```

**Cambios realizados:**
- Agregado `flex-shrink-0` al footer para que siempre sea visible
- Reducido padding de `p-4` a `p-3` para optimizar espacio
- Mejorado el diseño del botón con estados disabled/enabled

### **2. Problemas de Sincronización**

#### **❌ Problema: No se refresca la cita en el frontend**
**Síntomas:**
- Las citas creadas por el chatbot no aparecen en la gestión
- La página no se actualiza automáticamente
- El contador de citas no cambia

**✅ Solución Implementada:**

**1. Verificar configuración de actualización automática:**
```javascript
useEffect(() => {
  fetchAppointments();
  fetchLawyers();
  
  // Actualizar automáticamente cada 30 segundos
  const interval = setInterval(() => {
    fetchAppointments();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

**2. Verificar token de autenticación:**
```javascript
const fetchAppointments = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/admin/appointments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setAppointments(response.data);
    setLastUpdated(new Date());
    setError(null);
  } catch (err: any) {
    console.error('Error fetching appointments:', err);
    setError(err.response?.data?.message || 'Error al cargar citas');
  } finally {
    setLoading(false);
  }
};
```

**3. Script de prueba de sincronización:**
```bash
# Ejecutar prueba de sincronización en tiempo real
node test_realtime_sync.js
```

## 🧪 **Scripts de Prueba Disponibles**

### **1. Verificación de Servicios**
```bash
node check_services.js
```
**Propósito:** Verificar que todos los servicios estén funcionando
**Resultado esperado:** ✅ Backend, Chatbot y Frontend funcionando

### **2. Prueba de Sincronización Completa**
```bash
node test_appointment_sync.js
```
**Propósito:** Probar el flujo completo del chatbot
**Resultado esperado:** ✅ Cita creada exitosamente

### **3. Prueba de Sincronización en Tiempo Real**
```bash
node test_realtime_sync.js
```
**Propósito:** Verificar sincronización inmediata y automática
**Resultado esperado:** ✅ Cambios detectados en tiempo real

## 🔍 **Diagnóstico de Problemas**

### **Paso 1: Verificar Estado de Servicios**
```bash
node check_services.js
```

### **Paso 2: Verificar Token de Administrador**
1. Iniciar sesión como admin en `http://localhost:5173`
2. Abrir herramientas de desarrollador (F12)
3. Ir a Application > Local Storage
4. Copiar valor de "token"
5. Verificar que no esté expirado

### **Paso 3: Verificar Logs del Backend**
```bash
# En la terminal del backend
npm run start:dev
```
Buscar errores en la consola del backend.

### **Paso 4: Verificar Logs del Chatbot**
```bash
# En la terminal del chatbot
python main_improved.py
```
Buscar errores en la consola del chatbot.

### **Paso 5: Verificar Consola del Navegador**
1. Abrir herramientas de desarrollador (F12)
2. Ir a la pestaña Console
3. Buscar errores de red o JavaScript

## 🛠️ **Soluciones Rápidas**

### **Problema: Calendario no se muestra**
```javascript
// Verificar que el estado showCalendar sea true
console.log('showCalendar:', showCalendar);

// Verificar que el componente esté montado
console.log('isVisible:', isVisible);
```

### **Problema: Sincronización no funciona**
```javascript
// Verificar token en localStorage
console.log('Token:', localStorage.getItem('token'));

// Verificar respuesta del backend
const response = await axios.get('/api/admin/appointments', {
  headers: { Authorization: `Bearer ${token}` }
});
console.log('Appointments:', response.data);
```

### **Problema: Actualización automática no funciona**
```javascript
// Verificar que el intervalo esté activo
useEffect(() => {
  console.log('Iniciando actualización automática');
  const interval = setInterval(() => {
    console.log('Actualizando citas...');
    fetchAppointments();
  }, 30000);
  
  return () => {
    console.log('Limpiando intervalo');
    clearInterval(interval);
  };
}, []);
```

## 📋 **Checklist de Verificación**

### **Calendario Visual**
- [ ] Tamaño reducido y no cubre toda la pantalla
- [ ] Scroll funciona en ambas secciones
- [ ] Botón "Confirmar Cita" es visible
- [ ] Responsive en dispositivos móviles
- [ ] Se cierra correctamente con el botón X

### **Sincronización**
- [ ] Token de administrador válido
- [ ] Backend responde en puerto 3000
- [ ] Chatbot responde en puerto 8000
- [ ] Actualización automática cada 30 segundos
- [ ] Botón de refrescar manual funciona
- [ ] Indicador de última actualización se actualiza

### **Funcionalidad Completa**
- [ ] Chatbot crea citas exitosamente
- [ ] Citas aparecen en gestión inmediatamente
- [ ] Email de confirmación se envía
- [ ] Datos de cita son correctos
- [ ] No hay errores en consola

## 🚀 **Comandos de Inicio Rápido**

### **Iniciar Todos los Servicios**
```bash
# Terminal 1: Backend
cd backend && npm run start:dev

# Terminal 2: Chatbot
cd chatbot && python main_improved.py

# Terminal 3: Frontend
cd frontend && npm run dev
```

### **Verificar Estado**
```bash
node check_services.js
```

### **Probar Sincronización**
```bash
node test_realtime_sync.js
```

## 📞 **Soporte Técnico**

### **Errores Comunes y Soluciones**

1. **Error 401 Unauthorized**
   - Solución: Renovar token de administrador

2. **Error 404 Not Found**
   - Solución: Verificar que el backend esté en puerto 3000

3. **Error 405 Method Not Allowed**
   - Solución: Normal, el endpoint /chat solo acepta POST

4. **PowerShell Execution Policy**
   - Solución: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

### **Contacto**
- **Documentación:** `SINCRONIZACION_CITAS.md`
- **Resumen de Pruebas:** `RESUMEN_PRUEBAS_SINCRONIZACION.md`
- **Scripts de Prueba:** `test_*.js`

---

**✅ Estado del Sistema:** Verificado y Funcional  
**📅 Última Actualización:** 15 de Enero, 2025  
**👤 Responsable:** Equipo de Desarrollo 