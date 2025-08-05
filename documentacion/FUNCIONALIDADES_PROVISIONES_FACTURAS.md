# Funcionalidades de Provisiones y Facturas

## 📋 Índice

1. [Gestión Completa de Provisiones (CRUD)](#gestión-completa-de-provisiones-crud)
2. [Integración de Provisiones en Facturas](#integración-de-provisiones-en-facturas)
3. [Facturas Rectificativas con Devolución de Provisiones](#facturas-rectificativas-con-devolución-de-provisiones)
4. [Casos de Uso y Ejemplos](#casos-de-uso-y-ejemplos)
5. [API Endpoints](#api-endpoints)
6. [Configuración y Uso](#configuración-y-uso)

---

## 🏦 Gestión Completa de Provisiones (CRUD)

### ✅ Funcionalidades Implementadas

#### **1. Crear Provisión**
- **Endpoint**: `POST /provision-fondos`
- **Descripción**: Crear una nueva provisión de fondos para un cliente
- **Campos requeridos**:
  - `clientId`: ID del cliente
  - `expedienteId`: ID del expediente (opcional)
  - `amount`: Importe de la provisión
  - `description`: Descripción de la provisión
  - `date`: Fecha de la provisión

#### **2. Leer Provisiones**
- **Endpoint**: `GET /provision-fondos`
- **Filtros disponibles**:
  - `clientId`: Filtrar por cliente
  - `expedienteId`: Filtrar por expediente
  - `soloPendientes`: Solo provisiones disponibles (no utilizadas)

#### **3. Actualizar Provisión**
- **Endpoint**: `PATCH /provision-fondos/:id`
- **Descripción**: Modificar una provisión existente
- **Restricciones**: Solo ADMIN y ABOGADO

#### **4. Eliminar Provisión**
- **Endpoint**: `DELETE /provision-fondos/:id`
- **Descripción**: Eliminar una provisión
- **Restricciones**: Solo ADMIN y ABOGADO

### 🎯 Estados de las Provisiones

#### **Disponible**
- `invoiceId: null`
- Puede ser utilizada en nuevas facturas
- Aparece en la lista de provisiones disponibles

#### **Utilizada**
- `invoiceId: [ID_FACTURA]`
- Ya no puede ser utilizada en nuevas facturas
- Aparece en el historial de provisiones

---

## 💰 Integración de Provisiones en Facturas

### ✅ Funcionalidades Implementadas

#### **1. Selección de Provisiones en Factura**
- **Ubicación**: Modal de creación/edición de facturas
- **Funcionalidad**: Checkboxes para seleccionar provisiones disponibles
- **Cálculo automático**: Total de provisiones seleccionadas
- **Validación**: No permite seleccionar provisiones ya utilizadas

#### **2. Cálculo Automático de Descuentos**
```typescript
// Ejemplo de cálculo
Base Imponible: 1000€
Provisiones seleccionadas: 300€
Descuento aplicado: -300€
Base final: 700€
IVA (21%): 147€
Total: 847€
```

#### **3. Manejo de Exceso de Provisiones**
- **Escenario**: Provisiones > Base Imponible
- **Solución**: Agregar concepto "Devolución de Provisión"
- **Ejemplo**:
  ```
  Base Imponible: 500€
  Provisiones: 1000€
  Exceso: 500€
  → Se agrega concepto: "Devolución de Provisión" -500€
  → Total final: 0€
  ```

#### **4. Visualización en Factura**
- **Sección**: "Provisiones de Fondos Aplicadas"
- **Información mostrada**:
  - Descripción de cada provisión
  - Fecha de la provisión
  - Importe de cada provisión
  - Total de provisiones aplicadas

### 🎨 Mejoras de UX

#### **1. Mensajes Informativos**
- ✅ Mensajes de éxito/error para todas las operaciones CRUD
- ✅ Advertencias cuando las provisiones exceden la base imponible
- ✅ Indicadores visuales de provisiones ya utilizadas

#### **2. Filtros Inteligentes**
- ✅ Carga automática de provisiones al seleccionar cliente
- ✅ Filtrado por expediente específico
- ✅ Solo muestra provisiones disponibles

---

## 🔄 Facturas Rectificativas con Devolución de Provisiones

### ✅ Funcionalidades Implementadas

#### **1. Tipos de Facturas Rectificativas**

##### **R1 - Anulación Completa**
- **Descripción**: Anula completamente la factura original
- **Devolución de provisiones**: 100%
- **Ejemplo**:
  ```
  Factura original: 1000€ (con provisión de 500€)
  Rectificativa R1: 0€
  → Devolución: 500€ (100%)
  ```

##### **R2 - Corrección de Datos**
- **Descripción**: Solo corrige datos, no afecta importes
- **Devolución de provisiones**: 0%
- **Ejemplo**:
  ```
  Corregir NIF del cliente
  → No se devuelven provisiones
  ```

##### **R3 - Descuento**
- **Descripción**: Reduce el importe de la factura
- **Devolución de provisiones**: Proporcional
- **Ejemplo**:
  ```
  Factura original: 1000€ (con provisión de 500€)
  Rectificativa R3: 600€
  → Diferencia: 400€ (40%)
  → Devolución: 200€ (40% de 500€)
  ```

##### **R4 - Devolución**
- **Descripción**: Similar a R3, para devoluciones
- **Devolución de provisiones**: Proporcional
- **Ejemplo**: Igual que R3

#### **2. Proceso de Creación de Rectificativas**

##### **Paso 1: Selección de Factura Original**
- Modal para seleccionar factura a rectificar
- Filtros: Solo facturas no anuladas, no rectificativas, no borradores
- Información mostrada: Número, cliente, importe, estado

##### **Paso 2: Copia Automática de Datos**
- Cliente y expediente de la factura original
- Items de la factura original
- Provisiones utilizadas en la factura original
- Configuración fiscal (IVA, método de pago)

##### **Paso 3: Configuración de Rectificación**
- **Tipo de rectificación**: R1, R2, R3, R4
- **Motivo de rectificación**: Texto obligatorio
- **Modificación de importes**: Según tipo de rectificación

#### **3. Lógica de Devolución Automática**

##### **Cálculo del Factor de Devolución**
```typescript
switch (tipoRectificacion) {
  case 'R1': factorDevolucion = 1.0; // 100%
  case 'R2': factorDevolucion = 0.0; // 0%
  case 'R3':
  case 'R4': 
    diferencia = facturaOriginal.importeTotal - importeRectificativa;
    factorDevolucion = diferencia / facturaOriginal.importeTotal;
}
```

##### **Creación de Nuevas Provisiones**
```typescript
// Para cada provisión de la factura original
importeDevolver = provision.amount * factorDevolucion;

// Crear nueva provisión
{
  clientId: provision.clientId,
  expedienteId: provision.expedienteId,
  amount: importeDevolver,
  description: `Devolución por rectificativa ${tipoRectificacion} - ${provision.description}`,
  date: new Date(),
  invoiceId: null // Disponible para uso futuro
}
```

### 🎯 Beneficios de la Implementación

#### **Para el Cliente**
- ✅ **Recupera provisiones** según el tipo de rectificación
- ✅ **Puede reutilizar** las provisiones devueltas
- ✅ **Transparencia total** en el proceso

#### **Para el Despacho**
- ✅ **Gestión automática** de devoluciones
- ✅ **Trazabilidad completa** de provisiones
- ✅ **Cumplimiento fiscal** correcto

---

## 📊 Casos de Uso y Ejemplos

### 🎯 Caso 1: Provisión Normal

#### **Escenario**
1. Cliente deposita 1000€ como provisión
2. Se crea factura de 800€
3. Se aplica la provisión de 1000€
4. Factura final: 0€ (con concepto de devolución de 200€)

#### **Resultado**
- Factura: 0€ total
- Provisión: Utilizada (1000€)
- Cliente: No debe nada

### 🎯 Caso 2: Rectificativa R1 (Anulación)

#### **Escenario**
1. Factura original: 1000€ (con provisión de 500€)
2. Se crea rectificativa R1: 0€
3. Sistema calcula: factor = 1.0 (100%)

#### **Resultado**
- Rectificativa: 0€ total
- Nueva provisión creada: 500€ (disponible)
- Cliente: Puede usar la nueva provisión de 500€

### 🎯 Caso 3: Rectificativa R3 (Descuento)

#### **Escenario**
1. Factura original: 1000€ (con provisión de 500€)
2. Se crea rectificativa R3: 600€
3. Sistema calcula: diferencia = 400€, factor = 0.4 (40%)

#### **Resultado**
- Rectificativa: 600€ total
- Nueva provisión creada: 200€ (40% de 500€)
- Cliente: Puede usar la nueva provisión de 200€

---

## 🔌 API Endpoints

### 📋 Provisiones

#### **Crear Provisión**
```http
POST /provision-fondos
Content-Type: application/json
Authorization: Bearer {token}

{
  "clientId": "client-id",
  "expedienteId": "expediente-id",
  "amount": 1000,
  "description": "Depósito inicial",
  "date": "2024-12-25"
}
```

#### **Obtener Provisiones**
```http
GET /provision-fondos?clientId={clientId}&soloPendientes=true
Authorization: Bearer {token}
```

#### **Actualizar Provisión**
```http
PATCH /provision-fondos/{id}
Content-Type: application/json
Authorization: Bearer {token}

{
  "amount": 1200,
  "description": "Depósito actualizado"
}
```

#### **Eliminar Provisión**
```http
DELETE /provision-fondos/{id}
Authorization: Bearer {token}
```

### 📄 Facturas

#### **Crear Factura con Provisiones**
```http
POST /invoices
Content-Type: application/json
Authorization: Bearer {token}

{
  "receptorId": "client-id",
  "expedienteId": "expediente-id",
  "provisionIds": ["provision-id-1", "provision-id-2"],
  "items": [
    {
      "description": "Servicios legales",
      "quantity": 1,
      "unitPrice": 1000,
      "total": 1000
    }
  ],
  "tipoIVA": 21,
  "regimenIvaEmisor": "01",
  "claveOperacion": "01",
  "metodoPago": "01",
  "fechaOperacion": "2024-12-25",
  "estado": "emitida"
}
```

#### **Crear Factura Rectificativa**
```http
POST /invoices
Content-Type: application/json
Authorization: Bearer {token}

{
  "receptorId": "client-id",
  "expedienteId": "expediente-id",
  "tipoFactura": "R",
  "facturaOriginalId": "original-invoice-id",
  "tipoRectificacion": "R1",
  "motivoRectificacion": "Anulación por error en datos",
  "items": [
    {
      "description": "Servicios legales",
      "quantity": 1,
      "unitPrice": 0,
      "total": 0
    }
  ],
  "tipoIVA": 21,
  "regimenIvaEmisor": "01",
  "claveOperacion": "01",
  "metodoPago": "01",
  "fechaOperacion": "2024-12-25",
  "estado": "emitida"
}
```

---

## ⚙️ Configuración y Uso

### 🚀 Iniciar el Sistema

#### **Backend**
```bash
cd backend
npm install
npm run start:dev
```

#### **Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 🔧 Configuración de Base de Datos

#### **Variables de Entorno**
```env
# backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/database"
JWT_SECRET="your-secret-key"
FACTURAE_AUTO_SIGN="true"
FACTURAE_XADES_LEVEL="BES"
```

### 📱 Uso del Sistema

#### **1. Crear Provisión**
1. Ir a `/lawyer/provisiones`
2. Hacer clic en "Nueva Provisión"
3. Completar formulario
4. Hacer clic en "Crear"

#### **2. Crear Factura con Provisiones**
1. Ir a `/lawyer/facturas`
2. Hacer clic en "Nueva Factura"
3. Seleccionar cliente y expediente
4. Seleccionar provisiones disponibles
5. Completar items de factura
6. Hacer clic en "Crear"

#### **3. Crear Factura Rectificativa**
1. Ir a `/lawyer/facturas`
2. Hacer clic en "Factura Rectificativa"
3. Seleccionar factura original
4. Completar tipo y motivo de rectificación
5. Modificar importes según necesidad
6. Hacer clic en "Crear"

### 🔍 Verificación de Funcionalidad

#### **Verificar Devolución de Provisiones**
1. Crear factura con provisiones
2. Crear rectificativa R1
3. Verificar en `/lawyer/provisiones` que aparece nueva provisión
4. Confirmar que la nueva provisión está disponible

#### **Verificar Cálculos**
1. Crear factura con provisiones que excedan base imponible
2. Verificar que se agrega concepto "Devolución de Provisión"
3. Confirmar que el total final es correcto

---

## 🐛 Solución de Problemas

### ❌ Errores Comunes

#### **1. "No se pueden seleccionar provisiones"**
- **Causa**: Provisiones ya utilizadas
- **Solución**: Verificar estado de provisiones en `/lawyer/provisiones`

#### **2. "Error al crear factura"**
- **Causa**: Datos inválidos o provisiones no encontradas
- **Solución**: Verificar datos del formulario y existencia de provisiones

#### **3. "No aparecen provisiones en factura"**
- **Causa**: Cliente no seleccionado o provisiones no disponibles
- **Solución**: Seleccionar cliente y verificar provisiones pendientes

### 🔧 Logs de Debug

#### **Backend**
```bash
# Ver logs de provisiones
grep "PROVISION" backend/logs/app.log

# Ver logs de facturas
grep "INVOICE" backend/logs/app.log

# Ver logs de rectificativas
grep "RECTIFICATIVA" backend/logs/app.log
```

#### **Frontend**
```javascript
// En consola del navegador
console.log('Provisiones:', provisiones);
console.log('Factura:', factura);
```

---

## 📈 Métricas y Reportes

### 📊 Métricas Disponibles

#### **Provisiones**
- Total de provisiones por cliente
- Provisiones utilizadas vs disponibles
- Historial de devoluciones por rectificativas

#### **Facturas**
- Facturas con provisiones aplicadas
- Total de descuentos por provisiones
- Rectificativas creadas por tipo

### 📋 Reportes Sugeridos

#### **1. Reporte de Provisiones por Cliente**
- Provisiones totales
- Provisiones utilizadas
- Provisiones disponibles
- Devoluciones por rectificativas

#### **2. Reporte de Facturas Rectificativas**
- Número de rectificativas por tipo
- Total de provisiones devueltas
- Impacto financiero de devoluciones

---

## 🔮 Futuras Mejoras

### 🎯 Funcionalidades Planificadas

#### **1. Notificaciones Automáticas**
- Email al cliente cuando se devuelven provisiones
- Notificaciones en tiempo real de cambios de estado

#### **2. Reportes Avanzados**
- Dashboard de provisiones y facturas
- Gráficos de tendencias de uso
- Análisis de rentabilidad por cliente

#### **3. Integración con Contabilidad**
- Exportación a sistemas contables
- Sincronización con bancos
- Conciliación automática

### 🛠️ Mejoras Técnicas

#### **1. Optimización de Rendimiento**
- Caché de consultas frecuentes
- Paginación de listas grandes
- Compresión de respuestas API

#### **2. Seguridad**
- Auditoría completa de cambios
- Encriptación de datos sensibles
- Validación avanzada de permisos

---

## 📞 Soporte

### 🆘 Contacto
- **Desarrollador**: [Tu nombre]
- **Email**: [tu-email@ejemplo.com]
- **Documentación**: Este archivo

### 📚 Recursos Adicionales
- [Guía de API](API_GUIDE.md)
- [Manual de Usuario](USER_MANUAL.md)
- [Troubleshooting](TROUBLESHOOTING.md)

---

*Última actualización: Agosto 2025*
*Versión: 1.0* 