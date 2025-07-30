# Mejora de Previsualización de Factura

## Problema Identificado

**URL**: `http://localhost:5173/lawyer/facturacion`

**Problema**: La previsualización de la factura en el modal no tenía el mismo formato que el PDF descargado. La previsualización usaba un CSS muy básico mientras que el PDF usaba una plantilla HTML profesional y detallada.

**Diferencias observadas**:
- **Previsualización**: CSS básico, diseño simple, sin estructura profesional
- **PDF**: Plantilla HTML profesional con diseño corporativo, colores, tipografía y estructura avanzada

## Solución Implementada

### ✅ **1. Actualización del Componente InvoiceView**

**Archivo modificado**: `frontend/src/pages/lawyer/InvoicesPage.tsx`

**Cambios realizados**:

1. **Reemplazo completo del CSS**:
   - **Antes**: CSS básico con estilos simples
   - **Después**: CSS profesional idéntico al de la plantilla PDF

2. **Estructura HTML mejorada**:
   - **Header profesional** con logo y información de empresa
   - **Sección QR** con diseño corporativo
   - **Secciones de datos** con diseño de tarjetas
   - **Tablas profesionales** con colores y sombras
   - **Footer informativo**

### ✅ **2. Características del Nuevo Diseño**

#### **Header Profesional**
```css
.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 3px solid #2563eb;
}
```

- **Logo corporativo**: 🏛️ Despacho Legal
- **Información de empresa**: Servicios Jurídicos Profesionales
- **Datos de factura**: Número, fecha, estado con badges de colores

#### **Sección QR**
```css
.qr-section {
  text-align: center;
  margin: 10px 0;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
}
```

- **Diseño centrado** con fondo gris claro
- **Placeholder para QR** (en previsualización)
- **Texto QR** con información de la factura

#### **Secciones de Datos**
```css
.parties {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  gap: 20px;
}

.party {
  flex: 1;
  min-width: 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #2563eb;
}
```

- **Layout de dos columnas** para emisor y receptor
- **Tarjetas con borde azul** y fondo gris claro
- **Información estructurada** con etiquetas

#### **Tablas Profesionales**
```css
.items-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
  page-break-inside: avoid;
}

.items-table th {
  background: #2563eb;
  color: white;
  padding: 8px 6px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  border: none;
}
```

- **Cabeceras azules** con texto blanco
- **Filas alternadas** con fondo gris claro
- **Sombras sutiles** para profundidad
- **Bordes redondeados** para modernidad

#### **Sección de Totales**
```css
.total-row {
  background: #2563eb;
  color: white;
  font-weight: bold;
  font-size: 14px;
}
```

- **Fila de total** destacada en azul
- **Texto blanco** para contraste
- **Tipografía más grande** para énfasis

#### **Secciones Especiales**
```css
.discount-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 6px;
  font-size: 12px;
}

.provisions-table th {
  background: #059669;
  color: white;
  padding: 8px 6px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  border: none;
}
```

- **Descuentos**: Fondo amarillo con borde naranja
- **Provisiones**: Cabeceras verdes para diferenciar
- **Información adicional**: Fondo gris con grid de dos columnas

### ✅ **3. Paleta de Colores Corporativa**

```css
/* Colores principales */
--primary-blue: #2563eb;      /* Azul corporativo */
--success-green: #059669;     /* Verde para provisiones */
--warning-yellow: #f59e0b;    /* Amarillo para descuentos */
--danger-red: #dc2626;        /* Rojo para cantidades negativas */

/* Estados de factura */
.status-emitida { background: #dcfce7; color: #166534; }
.status-pagada { background: #dbeafe; color: #1e40af; }
.status-anulada { background: #fee2e2; color: #991b1b; }
```

### ✅ **4. Tipografía y Espaciado**

```css
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #2563eb;
  margin-bottom: 10px;
  padding-bottom: 3px;
  border-bottom: 2px solid #e5e7eb;
}
```

- **Fuente moderna**: Segoe UI como principal
- **Jerarquía clara**: Tamaños de fuente diferenciados
- **Espaciado consistente**: Márgenes y padding uniformes

### ✅ **5. Responsive Design**

```css
@media (max-width: 600px) {
  .parties { 
    flex-direction: column; 
    gap: 10px;
  }
  .info-grid { grid-template-columns: 1fr; }
  .header { flex-direction: column; }
  .invoice-info { text-align: left; margin-top: 20px; }
}
```

- **Adaptación móvil**: Layout flexible para pantallas pequeñas
- **Columnas apiladas**: En dispositivos móviles
- **Texto ajustado**: Alineación adaptativa

## Estructura HTML Final

### **Header**
```html
<div class="header">
  <div class="company-info">
    <div class="company-logo">🏛️ Despacho Legal</div>
    <div class="company-details">
      <div>Servicios Jurídicos Profesionales</div>
      <div>Especialistas en Derecho Civil y Mercantil</div>
      <div>Tel: +34 900 123 456 | Email: info@despacholegal.es</div>
    </div>
  </div>
  <div class="invoice-info">
    <div class="invoice-title">FACTURA</div>
    <div class="invoice-number">{{numeroFactura}}</div>
    <div class="invoice-date">{{fechaFactura}}</div>
    <div class="invoice-status status-{{estado}}">{{estado}}</div>
  </div>
</div>
```

### **Secciones de Datos**
```html
<div class="parties">
  <div class="party">
    <div class="party-title">DATOS DEL EMISOR</div>
    <div class="party-info">
      <span class="party-label">Nombre:</span> {{emisor.nombre}}
    </div>
    <!-- Más datos... -->
  </div>
  <div class="party">
    <div class="party-title">DATOS DEL RECEPTOR</div>
    <!-- Datos del receptor... -->
  </div>
</div>
```

### **Tabla de Conceptos**
```html
<div class="items-section">
  <div class="section-title">CONCEPTOS</div>
  <table class="items-table">
    <thead>
      <tr>
        <th>Descripción</th>
        <th class="text-center">Cantidad</th>
        <th class="text-right">Precio Unitario</th>
        <th class="text-right">Total</th>
      </tr>
    </thead>
    <tbody>
      <!-- Items dinámicos... -->
    </tbody>
  </table>
</div>
```

### **Totales**
```html
<div class="totals-section">
  <div class="section-title">TOTALES</div>
  <table class="totals-table">
    <tr>
      <td>Base Imponible:</td>
      <td class="text-right">{{baseImponible}} €</td>
    </tr>
    <tr>
      <td>IVA ({{tipoIVA}}%):</td>
      <td class="text-right">{{cuotaIVA}} €</td>
    </tr>
    <tr class="total-row">
      <td>TOTAL:</td>
      <td class="text-right">{{importeTotal}} €</td>
    </tr>
  </table>
</div>
```

## Beneficios de la Mejora

### ✅ **Consistencia Visual**
- **Previsualización idéntica** al PDF descargado
- **Experiencia unificada** para el usuario
- **Confianza en el resultado** final

### ✅ **Profesionalismo**
- **Diseño corporativo** moderno y atractivo
- **Colores consistentes** con la marca
- **Tipografía profesional** y legible

### ✅ **Funcionalidad Mejorada**
- **Información estructurada** y fácil de leer
- **Jerarquía visual clara** con títulos y secciones
- **Responsive design** para diferentes dispositivos

### ✅ **Accesibilidad**
- **Contraste adecuado** entre texto y fondo
- **Estructura semántica** con encabezados
- **Navegación clara** por secciones

## Verificación

### **Pasos para Verificar la Mejora:**

1. **Acceder a la página de facturación:**
   - `http://localhost:5173/lawyer/facturacion`

2. **Verificar la previsualización:**
   - Hacer clic en "👁️ Ver" en cualquier factura
   - Confirmar que el diseño es profesional y moderno
   - Verificar que coincide con el PDF descargado

3. **Comparar con PDF:**
   - Descargar el PDF de la misma factura
   - Comparar visualmente ambos formatos
   - Confirmar que son idénticos en diseño

4. **Probar funcionalidades:**
   - Verificar que la impresión funciona correctamente
   - Confirmar que el diseño es responsive
   - Probar en diferentes dispositivos

### **Resultado Esperado:**
```
✅ Previsualización profesional idéntica al PDF
✅ Diseño corporativo moderno y atractivo
✅ Estructura clara y fácil de leer
✅ Colores y tipografía consistentes
✅ Responsive design funcional
```

## Contexto Técnico

### **Plantilla PDF Original**
- **Ubicación**: `backend/src/invoices/templates/invoice-template.html`
- **Tecnología**: HTML + CSS con Handlebars
- **Generación**: Puppeteer para conversión a PDF

### **Previsualización Frontend**
- **Ubicación**: `frontend/src/pages/lawyer/InvoicesPage.tsx`
- **Componente**: `InvoiceView`
- **Tecnología**: React + CSS inline

### **Sincronización**
- **CSS compartido**: Ambos usan los mismos estilos
- **Estructura HTML**: Idéntica en ambos formatos
- **Datos dinámicos**: Misma lógica de renderizado

## Estructura Final

```
📄 Factura (Previsualización/PDF)
├── 🏛️ Header Corporativo
│   ├── Logo y datos de empresa
│   └── Información de factura
├── 📱 Sección QR
│   ├── Código QR (placeholder en preview)
│   └── Datos QR
├── 👥 Datos de Partes
│   ├── Emisor (tarjeta azul)
│   └── Receptor (tarjeta azul)
├── 📋 Conceptos
│   └── Tabla profesional con cabeceras azules
├── 💰 Descuentos (si aplica)
│   └── Caja amarilla con borde naranja
├── 🏦 Provisiones (si aplica)
│   └── Tabla con cabeceras verdes
├── 💵 Totales
│   └── Tabla con fila total azul
├── ℹ️ Información Adicional
│   └── Grid de dos columnas
└── 📝 Footer
    └── Texto legal y técnico
```

---

**Estado**: ✅ **COMPLETADO** - Previsualización de factura mejorada
**Fecha**: 18 de Julio, 2025
**Tipo**: Mejora de UX - Consistencia visual entre preview y PDF 