# 🛠️ Guía Práctica: Cómo Cambiar Configuraciones del Sistema

## 🎯 Objetivo

Esta guía proporciona **ejemplos prácticos y paso a paso** sobre cómo modificar las configuraciones del sistema para adaptarlo a diferentes necesidades de negocio, incluyendo la transformación en una plataforma de e-commerce.

## 📋 Índice de Contenidos

1. [Configuración Básica del Sitio](#configuración-básica-del-sitio)
2. [Personalización de Menús](#personalización-de-menús)
3. [Configuración de E-Commerce](#configuración-de-e-commerce)
4. [Ejemplos de Casos de Uso](#ejemplos-de-casos-de-uso)
5. [Troubleshooting](#troubleshooting)

## 🏠 Configuración Básica del Sitio

### **Ejemplo 1: Cambiar Nombre y Logo del Sitio**

#### **Paso 1: Acceder a la Configuración**
```
Dashboard Admin → Acciones Rápidas → Configurar Sitio
```

#### **Paso 2: Modificar Configuraciones de Branding**
1. **Buscar la sección "🎨 Marca"**
2. **Cambiar `site_name`**:
   - Valor actual: "Despacho Legal"
   - Nuevo valor: "Tu Empresa Legal"
3. **Cambiar `logo_url`**:
   - Valor actual: "/images/logo.png"
   - Nuevo valor: "/images/tu-logo.png"
4. **Cambiar `primary_color`**:
   - Valor actual: "#1e40af"
   - Nuevo valor: "#dc2626" (rojo)

#### **Paso 3: Verificar Cambios**
- Los cambios se aplican automáticamente
- Recargar la página para ver el nuevo nombre y logo
- El color primario se aplica al header y elementos principales

### **Ejemplo 2: Configurar Información de Contacto**

#### **Configuraciones a Modificar**:
```json
{
  "contact_email": "tu-email@tudominio.com",
  "contact_phone": "+34 987 654 321",
  "contact_address": "Calle Tu Dirección 123, Tu Ciudad",
  "office_hours": "Lunes a Viernes: 8:00 - 19:00"
}
```

#### **Resultado**:
- La información aparece en el footer del sitio
- Se usa en formularios de contacto
- Aparece en páginas de información

### **Ejemplo 3: Configurar Redes Sociales**

#### **Configuraciones a Modificar**:
```json
{
  "social_facebook": "https://facebook.com/tuempresa",
  "social_twitter": "https://twitter.com/tuempresa",
  "social_linkedin": "https://linkedin.com/company/tuempresa",
  "social_instagram": "https://instagram.com/tuempresa"
}
```

#### **Resultado**:
- Enlaces aparecen en el footer
- Iconos de redes sociales se muestran automáticamente
- Enlaces abren en nueva pestaña

## 🧭 Personalización de Menús

### **Ejemplo 1: Agregar Menú de Tienda para Clientes**

#### **Paso 1: Acceder a Configuración de Menús**
```
Dashboard Admin → Acciones Rápidas → Configurar Menús
```

#### **Paso 2: Editar Menú de Cliente**
1. **Buscar el menú "Cliente"**
2. **Hacer clic en "✏️ Editar"**
3. **Agregar nuevos elementos**:

```json
{
  "label": "🛍️ Tienda",
  "url": "/store",
  "icon": "🛍️",
  "order": 1,
  "isVisible": true,
  "isExternal": false
}
```

```json
{
  "label": "🛒 Mi Carrito",
  "url": "/cart",
  "icon": "🛒",
  "order": 2,
  "isVisible": true,
  "isExternal": false
}
```

```json
{
  "label": "📦 Mis Pedidos",
  "url": "/orders",
  "icon": "📦",
  "order": 3,
  "isVisible": true,
  "isExternal": false
}
```

#### **Paso 3: Guardar Cambios**
- Los cambios se aplican inmediatamente
- Los clientes verán el nuevo menú al recargar la página

### **Ejemplo 2: Crear Submenú de Servicios**

#### **Configuración del Menú Principal**:
```json
{
  "label": "⚖️ Servicios",
  "url": "#",
  "icon": "⚖️",
  "order": 2,
  "isVisible": true,
  "isExternal": false,
  "children": [
    {
      "label": "📋 Consultas Legales",
      "url": "/services/consultations",
      "icon": "📋",
      "order": 1,
      "isVisible": true,
      "isExternal": false
    },
    {
      "label": "📄 Documentos",
      "url": "/services/documents",
      "icon": "📄",
      "order": 2,
      "isVisible": true,
      "isExternal": false
    },
    {
      "label": "🏛️ Representación",
      "url": "/services/representation",
      "icon": "🏛️",
      "order": 3,
      "isVisible": true,
      "isExternal": false
    }
  ]
}
```

### **Ejemplo 3: Menú de Administración Avanzado**

#### **Configuración para Administradores**:
```json
[
  {
    "label": "🏠 Dashboard",
    "url": "/admin/dashboard",
    "icon": "🏠",
    "order": 1
  },
  {
    "label": "🛍️ Gestión Tienda",
    "url": "#",
    "icon": "🛍️",
    "order": 2,
    "children": [
      {
        "label": "📦 Productos",
        "url": "/admin/products",
        "icon": "📦",
        "order": 1
      },
      {
        "label": "📋 Categorías",
        "url": "/admin/categories",
        "icon": "📋",
        "order": 2
      },
      {
        "label": "📊 Inventario",
        "url": "/admin/inventory",
        "icon": "📊",
        "order": 3
      }
    ]
  },
  {
    "label": "💰 Gestión Financiera",
    "url": "#",
    "icon": "💰",
    "order": 3,
    "children": [
      {
        "label": "📈 Ventas",
        "url": "/admin/sales",
        "icon": "📈",
        "order": 1
      },
      {
        "label": "💳 Pagos",
        "url": "/admin/payments",
        "icon": "💳",
        "order": 2
      },
      {
        "label": "🧾 Facturas",
        "url": "/admin/invoices",
        "icon": "🧾",
        "order": 3
      }
    ]
  }
]
```

## 🛒 Configuración de E-Commerce

### **Ejemplo 1: Habilitar Funcionalidades de Tienda**

#### **Configuraciones Necesarias**:
```json
{
  "ecommerce_enabled": "true",
  "paypal_enabled": "true",
  "stripe_enabled": "true",
  "bank_transfer_enabled": "true",
  "currency_default": "EUR",
  "tax_rate": "21",
  "shipping_enabled": "false",
  "free_shipping_threshold": "50"
}
```

#### **Paso a Paso**:
1. **Ir a Configuración del Sitio**
2. **Buscar o crear categoría "E-Commerce"**
3. **Agregar configuraciones una por una**
4. **Guardar cambios**

### **Ejemplo 2: Configurar Métodos de Pago**

#### **PayPal**:
```json
{
  "paypal_client_id": "tu_paypal_client_id",
  "paypal_client_secret": "tu_paypal_client_secret",
  "paypal_mode": "sandbox"
}
```

#### **Stripe**:
```json
{
  "stripe_secret_key": "sk_test_tu_stripe_key",
  "stripe_publishable_key": "pk_test_tu_stripe_key"
}
```

#### **Transferencia Bancaria**:
```json
{
  "bank_account_number": "ES91 2100 0418 4502 0005 1332",
  "bank_account_holder": "Tu Empresa Legal S.L.",
  "bank_swift_code": "CAIXESBBXXX"
}
```

### **Ejemplo 3: Configurar Productos/Servicios**

#### **Servicio de Consulta Legal**:
```json
{
  "name": "Consulta Legal Inicial",
  "description": "Sesión de 30 minutos para evaluar tu caso legal",
  "price": 50.00,
  "currency": "EUR",
  "category": "Servicios Legales",
  "type": "consultation",
  "isActive": true,
  "tags": ["consulta", "legal", "asesoramiento"]
}
```

#### **Producto Físico - Documento Legal**:
```json
{
  "name": "Contrato de Arrendamiento",
  "description": "Plantilla legal de contrato de arrendamiento",
  "price": 25.00,
  "currency": "EUR",
  "category": "Documentos",
  "type": "product",
  "isActive": true,
  "stock": 100,
  "imageUrl": "/images/contract-template.jpg",
  "tags": ["contrato", "arrendamiento", "plantilla"]
}
```

## 📊 Ejemplos de Casos de Uso

### **Caso 1: Transformar en Tienda de Servicios Legales**

#### **Configuración de Menús**:
```json
// Menú para Clientes
[
  {
    "label": "🏠 Inicio",
    "url": "/",
    "icon": "🏠",
    "order": 1
  },
  {
    "label": "🛍️ Servicios",
    "url": "/services",
    "icon": "🛍️",
    "order": 2
  },
  {
    "label": "📄 Documentos",
    "url": "/documents",
    "icon": "📄",
    "order": 3
  },
  {
    "label": "🛒 Carrito",
    "url": "/cart",
    "icon": "🛒",
    "order": 4
  },
  {
    "label": "👤 Mi Cuenta",
    "url": "/profile",
    "icon": "👤",
    "order": 5
  }
]
```

#### **Configuración del Sitio**:
```json
{
  "site_name": "Servicios Legales Online",
  "site_description": "Servicios legales profesionales a tu alcance",
  "primary_color": "#1e40af",
  "secondary_color": "#3b82f6",
  "contact_email": "info@servicioslegales.com",
  "contact_phone": "+34 900 123 456",
  "ecommerce_enabled": "true",
  "paypal_enabled": "true",
  "stripe_enabled": "true"
}
```

### **Caso 2: Configurar para Consultoría Empresarial**

#### **Menú Especializado**:
```json
// Menú para Consultores
[
  {
    "label": "📊 Dashboard",
    "url": "/dashboard",
    "icon": "📊",
    "order": 1
  },
  {
    "label": "🏢 Clientes",
    "url": "/clients",
    "icon": "🏢",
    "order": 2
  },
  {
    "label": "📋 Proyectos",
    "url": "/projects",
    "icon": "📋",
    "order": 3
  },
  {
    "label": "💰 Facturación",
    "url": "/billing",
    "icon": "💰",
    "order": 4
  },
  {
    "label": "📈 Reportes",
    "url": "/reports",
    "icon": "📈",
    "order": 5
  }
]
```

#### **Configuración de Servicios**:
```json
[
  {
    "name": "Auditoría Empresarial",
    "description": "Análisis completo de procesos empresariales",
    "price": 500.00,
    "currency": "EUR",
    "category": "Consultoría",
    "type": "service"
  },
  {
    "name": "Planificación Estratégica",
    "description": "Desarrollo de estrategia empresarial",
    "price": 300.00,
    "currency": "EUR",
    "category": "Consultoría",
    "type": "service"
  },
  {
    "name": "Optimización de Procesos",
    "description": "Mejora de eficiencia operacional",
    "price": 400.00,
    "currency": "EUR",
    "category": "Consultoría",
    "type": "service"
  }
]
```

### **Caso 3: Configurar para Academia Online**

#### **Menú Educativo**:
```json
// Menú para Estudiantes
[
  {
    "label": "📚 Cursos",
    "url": "/courses",
    "icon": "📚",
    "order": 1
  },
  {
    "label": "📖 Mi Biblioteca",
    "url": "/library",
    "icon": "📖",
    "order": 2
  },
  {
    "label": "📝 Mis Cursos",
    "url": "/my-courses",
    "icon": "📝",
    "order": 3
  },
  {
    "label": "👨‍🏫 Profesores",
    "url": "/teachers",
    "icon": "👨‍🏫",
    "order": 4
  },
  {
    "label": "🛒 Tienda",
    "url": "/store",
    "icon": "🛒",
    "order": 5
  }
]
```

#### **Configuración de Productos Educativos**:
```json
[
  {
    "name": "Curso de Derecho Civil",
    "description": "Curso completo de derecho civil básico",
    "price": 199.00,
    "currency": "EUR",
    "category": "Cursos",
    "type": "service"
  },
  {
    "name": "Manual de Procedimientos",
    "description": "Guía práctica de procedimientos legales",
    "price": 49.00,
    "currency": "EUR",
    "category": "Materiales",
    "type": "product"
  },
  {
    "name": "Tutoría Personalizada",
    "description": "Sesión individual con profesor",
    "price": 75.00,
    "currency": "EUR",
    "category": "Servicios",
    "type": "service"
  }
]
```

## 🔧 Troubleshooting

### **Problema 1: Los cambios no se aplican**

#### **Solución**:
1. **Verificar que se guardaron los cambios**
2. **Limpiar cache del navegador**
3. **Recargar la página (Ctrl+F5)**
4. **Verificar que el usuario tiene permisos de ADMIN**

#### **Comandos de Debug**:
```bash
# Verificar configuraciones en base de datos
npx prisma studio

# Reiniciar el servidor backend
npm run start:dev

# Limpiar cache del frontend
npm run build
```

### **Problema 2: Menús no aparecen**

#### **Solución**:
1. **Verificar que el menú está activo**
2. **Comprobar que el rol del usuario coincide**
3. **Verificar que los elementos están visibles**
4. **Revisar la consola del navegador para errores**

#### **Verificación**:
```typescript
// En el navegador, abrir consola y ejecutar:
console.log('Configuraciones cargadas:', window.appConfig);
console.log('Menús disponibles:', window.menuConfig);
```

### **Problema 3: Configuraciones no se cargan**

#### **Solución**:
1. **Verificar conexión a la base de datos**
2. **Comprobar que el script de inicialización se ejecutó**
3. **Revisar logs del servidor backend**
4. **Verificar variables de entorno**

#### **Comandos de Verificación**:
```bash
# Verificar estado de la base de datos
npx prisma db push

# Ejecutar script de inicialización
npx ts-node scripts/initialize-configs.ts

# Verificar logs del servidor
npm run start:dev
```

## 📝 Comandos Útiles

### **Inicialización del Sistema**:
```bash
# Aplicar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Inicializar configuraciones por defecto
npx ts-node scripts/initialize-configs.ts

# Reiniciar servidor
npm run start:dev
```

### **Backup de Configuraciones**:
```bash
# Exportar configuraciones
npx prisma db pull --schema=./prisma/schema.prisma

# Backup de base de datos
pg_dump -h localhost -U postgres -d experimento > backup.sql
```

### **Verificación del Sistema**:
```bash
# Verificar estado de la aplicación
curl http://localhost:3000/api/health

# Verificar configuraciones públicas
curl http://localhost:3000/api/site-config/public

# Verificar menús disponibles
curl http://localhost:3000/api/menu-config/role/ADMIN
```

## 🎯 Resumen de Mejores Prácticas

### **Para Configuraciones del Sitio**:
1. **Hacer cambios incrementales** - Modificar una configuración a la vez
2. **Probar cambios inmediatamente** - Verificar que funcionan antes de continuar
3. **Documentar cambios** - Mantener registro de modificaciones
4. **Hacer backup** - Antes de cambios importantes

### **Para Configuración de Menús**:
1. **Planificar estructura** - Diseñar menús antes de implementar
2. **Usar iconos consistentes** - Mantener coherencia visual
3. **Ordenar lógicamente** - Agrupar elementos relacionados
4. **Probar en diferentes roles** - Verificar que funciona para todos los usuarios

### **Para E-Commerce**:
1. **Configurar pagos primero** - Asegurar que los pagos funcionan
2. **Probar con montos pequeños** - Usar modo sandbox inicialmente
3. **Configurar impuestos correctamente** - Verificar cálculos
4. **Documentar procesos** - Guías para clientes y administradores

## ✅ Checklist de Verificación

### **Antes de Cambios**:
- [ ] Backup de configuración actual
- [ ] Verificar permisos de administrador
- [ ] Tener plan de rollback
- [ ] Probar en entorno de desarrollo

### **Durante Cambios**:
- [ ] Hacer cambios uno por uno
- [ ] Verificar cada cambio inmediatamente
- [ ] Documentar modificaciones
- [ ] Probar en diferentes navegadores

### **Después de Cambios**:
- [ ] Verificar funcionalidad completa
- [ ] Probar con diferentes usuarios/roles
- [ ] Verificar rendimiento
- [ ] Actualizar documentación

---

**¡Con esta guía práctica puedes transformar completamente el sistema según tus necesidades específicas!** 🚀 