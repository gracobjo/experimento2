# Guía de Pruebas - Provisiones y Facturas

## 🎯 Objetivo
Verificar que todas las funcionalidades de provisiones y facturas rectificativas funcionan correctamente.

## 📋 Checklist de Pruebas

### ✅ Prueba 1: CRUD Completo de Provisiones

#### **1.1 Crear Provisión**
- [ ] Ir a `/lawyer/provisiones`
- [ ] Hacer clic en "Nueva Provisión"
- [ ] Completar formulario:
  - Cliente: Seleccionar cliente existente
  - Expediente: Seleccionar expediente (opcional)
  - Importe: 1000€
  - Descripción: "Depósito inicial"
  - Fecha: Fecha actual
- [ ] Hacer clic en "Crear"
- [ ] **Verificar**: Aparece mensaje de éxito y la provisión en la lista

#### **1.2 Leer Provisiones**
- [ ] Verificar que la provisión aparece en la tabla
- [ ] Verificar que muestra: Cliente, Expediente, Importe, Descripción, Estado
- [ ] **Verificar**: Estado debe ser "Disponible"

#### **1.3 Actualizar Provisión**
- [ ] Hacer clic en "Editar" en la provisión creada
- [ ] Cambiar importe a 1200€
- [ ] Cambiar descripción a "Depósito actualizado"
- [ ] Hacer clic en "Actualizar"
- [ ] **Verificar**: Aparece mensaje de éxito y los cambios se reflejan

#### **1.4 Eliminar Provisión**
- [ ] Hacer clic en "Eliminar" en la provisión
- [ ] Confirmar eliminación
- [ ] **Verificar**: Aparece mensaje de éxito y la provisión desaparece de la lista

---

### ✅ Prueba 2: Integración de Provisiones en Facturas

#### **2.1 Crear Factura con Provisiones**
- [ ] Ir a `/lawyer/facturas`
- [ ] Hacer clic en "Nueva Factura"
- [ ] Seleccionar cliente (el mismo de la provisión)
- [ ] **Verificar**: Aparecen provisiones disponibles en la sección "Provisiones de Fondos"
- [ ] Seleccionar la provisión de 1200€
- [ ] Completar factura:
  - Concepto: "Servicios legales"
  - Cantidad: 1
  - Precio: 1000€
- [ ] **Verificar**: El total de provisiones seleccionadas es 1200€
- [ ] Hacer clic en "Crear"
- [ ] **Verificar**: Aparece mensaje de éxito

#### **2.2 Verificar Factura Creada**
- [ ] En la lista de facturas, buscar la factura creada
- [ ] **Verificar**: En la columna "Provisiones" aparece "1 provisión"
- [ ] Hacer clic en "Ver" para abrir la factura
- [ ] **Verificar**: En la factura aparece:
  - Sección "Provisiones de Fondos Aplicadas"
  - Descripción de la provisión
  - Importe de la provisión
  - Descuento por provisiones: -1200€
  - Total final: 0€ (con concepto "Devolución de Provisión")

#### **2.3 Verificar Estado de Provisión**
- [ ] Ir a `/lawyer/provisiones`
- [ ] **Verificar**: La provisión ahora aparece como "Utilizada"
- [ ] **Verificar**: No aparece en la lista de provisiones disponibles

---

### ✅ Prueba 3: Facturas Rectificativas

#### **3.1 Crear Factura Rectificativa R1 (Anulación)**
- [ ] Ir a `/lawyer/facturas`
- [ ] Hacer clic en "Factura Rectificativa"
- [ ] **Verificar**: Aparece modal con facturas rectificables
- [ ] Seleccionar la factura creada anteriormente
- [ ] **Verificar**: Se copian automáticamente:
  - Cliente y expediente
  - Items de la factura original
  - Provisiones de la factura original
- [ ] Completar:
  - Tipo de rectificación: R1
  - Motivo: "Anulación por error en datos"
- [ ] **Verificar**: Los checkboxes de provisiones están deshabilitados
- [ ] **Verificar**: Aparece mensaje "Provisiones copiadas automáticamente"
- [ ] Hacer clic en "Crear"
- [ ] **Verificar**: Aparece mensaje de éxito

#### **3.2 Verificar Devolución de Provisiones**
- [ ] Ir a `/lawyer/provisiones`
- [ ] **Verificar**: Aparece nueva provisión:
  - Descripción: "Devolución por rectificativa R1 - Depósito actualizado"
  - Importe: 1200€
  - Estado: "Disponible"
- [ ] **Verificar**: La nueva provisión puede ser utilizada en nuevas facturas

#### **3.3 Crear Factura Rectificativa R3 (Descuento)**
- [ ] Crear nueva factura con provisión de 1000€
- [ ] Ir a `/lawyer/facturas`
- [ ] Hacer clic en "Factura Rectificativa"
- [ ] Seleccionar la nueva factura
- [ ] Completar:
  - Tipo de rectificación: R3
  - Motivo: "Descuento por acuerdo"
  - Modificar importe del concepto a 600€
- [ ] Hacer clic en "Crear"
- [ ] **Verificar**: Se crea nueva provisión con importe proporcional

---

### ✅ Prueba 4: Casos Especiales

#### **4.1 Provisión Mayor que Base Imponible**
- [ ] Crear provisión de 2000€
- [ ] Crear factura con concepto de 1000€
- [ ] Aplicar provisión de 2000€
- [ ] **Verificar**: Aparece advertencia de exceso
- [ ] **Verificar**: Se agrega concepto "Devolución de Provisión" -1000€
- [ ] **Verificar**: Total final es 0€

#### **4.2 Múltiples Provisiones**
- [ ] Crear 3 provisiones: 500€, 300€, 200€
- [ ] Crear factura de 1500€
- [ ] Seleccionar las 3 provisiones
- [ ] **Verificar**: Total de provisiones es 1000€
- [ ] **Verificar**: Descuento aplicado es -1000€
- [ ] **Verificar**: Total final es 500€

#### **4.3 Rectificativa R2 (Corrección)**
- [ ] Crear factura con provisión
- [ ] Crear rectificativa R2
- [ ] **Verificar**: No se crean nuevas provisiones (solo corrección de datos)

---

### ✅ Prueba 5: Validaciones y Errores

#### **5.1 Validaciones de Formulario**
- [ ] Intentar crear provisión sin cliente
- [ ] **Verificar**: Aparece error de validación
- [ ] Intentar crear factura sin items
- [ ] **Verificar**: Aparece error de validación
- [ ] Intentar crear rectificativa sin motivo
- [ ] **Verificar**: Aparece error de validación

#### **5.2 Errores de Negocio**
- [ ] Intentar seleccionar provisión ya utilizada
- [ ] **Verificar**: No aparece en la lista de disponibles
- [ ] Intentar crear rectificativa de factura ya rectificada
- [ ] **Verificar**: No aparece en la lista de rectificables

---

## 🔍 Verificación de Logs

### Backend Logs
```bash
# Verificar logs de creación de provisiones
grep "PROVISION" backend/logs/app.log

# Verificar logs de facturas
grep "INVOICE" backend/logs/app.log

# Verificar logs de rectificativas
grep "RECTIFICATIVA" backend/logs/app.log
```

### Frontend Console
```javascript
// En consola del navegador
console.log('Provisiones:', provisiones);
console.log('Factura:', factura);
console.log('Rectificativa:', rectificativa);
```

---

## 📊 Métricas a Verificar

### Provisiones
- [ ] Total de provisiones creadas
- [ ] Provisiones disponibles vs utilizadas
- [ ] Devoluciones por rectificativas

### Facturas
- [ ] Facturas con provisiones aplicadas
- [ ] Total de descuentos por provisiones
- [ ] Rectificativas por tipo (R1, R2, R3, R4)

---

## 🐛 Problemas Comunes y Soluciones

### ❌ "No aparecen provisiones en factura"
**Causa**: Cliente no seleccionado o provisiones no disponibles
**Solución**: 
1. Verificar que se seleccionó un cliente
2. Verificar que hay provisiones disponibles para ese cliente
3. Verificar que las provisiones no están ya utilizadas

### ❌ "Error al crear factura"
**Causa**: Datos inválidos o provisiones no encontradas
**Solución**:
1. Verificar que todos los campos obligatorios están completos
2. Verificar que las provisiones seleccionadas existen
3. Verificar que las provisiones están disponibles

### ❌ "No se crean provisiones devueltas"
**Causa**: Error en la lógica de devolución
**Solución**:
1. Verificar logs del backend
2. Verificar que la factura original tiene provisiones
3. Verificar que el tipo de rectificación es correcto

---

## ✅ Criterios de Aceptación

### Funcionalidades Básicas
- [ ] CRUD completo de provisiones funciona
- [ ] Integración de provisiones en facturas funciona
- [ ] Cálculo automático de descuentos funciona
- [ ] Manejo de exceso de provisiones funciona

### Facturas Rectificativas
- [ ] Creación de rectificativas funciona
- [ ] Devolución automática de provisiones funciona
- [ ] Cálculo proporcional funciona
- [ ] Validaciones funcionan

### UX/UI
- [ ] Mensajes de éxito/error aparecen
- [ ] Advertencias de exceso aparecen
- [ ] Estados visuales son correctos
- [ ] Navegación es intuitiva

---

## 📝 Notas de Prueba

### Fecha de Prueba: _______________
### Tester: _______________
### Versión: _______________

### Observaciones:
- [ ] Todas las funcionalidades funcionan correctamente
- [ ] Se encontraron errores (especificar)
- [ ] Se requieren mejoras (especificar)

### Errores Encontrados:
1. _______________
2. _______________
3. _______________

### Mejoras Sugeridas:
1. _______________
2. _______________
3. _______________

---

*Documento de prueba creado: Agosto 2025*
*Versión: 1.0* 