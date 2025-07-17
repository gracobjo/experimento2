# 📱 API Home Builder - Documentación Técnica

## 🔗 Endpoints Disponibles

### Layouts (Admin)

#### Crear Layout
```http
POST /api/admin/layouts
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Home Page Layout",
  "components": [
    {
      "id": "component-1",
      "type": "hero-banner",
      "props": {
        "title": "Despacho de Abogados",
        "subtitle": "Servicios legales profesionales"
      },
      "order": 0
    }
  ]
}
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Home Page Layout",
  "components": [...],
  "is_active": false,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Listar Layouts
```http
GET /api/admin/layouts
Authorization: Bearer <token>
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "name": "Home Page Layout",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### Obtener Layout por ID
```http
GET /api/admin/layouts/:id
Authorization: Bearer <token>
```

#### Actualizar Layout
```http
PUT /api/admin/layouts/:id
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Layout Name",
  "components": [...]
}
```

#### Eliminar Layout
```http
DELETE /api/admin/layouts/:id
Authorization: Bearer <token>
```

#### Activar Layout
```http
POST /api/admin/layouts/:id/activate
Authorization: Bearer <token>
```

### Layouts (Público)

#### Obtener Layout Activo de Home
```http
GET /api/layouts/home/active
```

**Respuesta:**
```json
{
  "id": 1,
  "name": "Home Page Layout",
  "components": [
    {
      "id": "component-1",
      "type": "hero-banner",
      "props": {
        "title": "Despacho de Abogados",
        "subtitle": "Servicios legales profesionales",
        "ctaText": "Consulta Gratuita",
        "ctaLink": "/contacto"
      },
      "order": 0
    },
    {
      "id": "component-2",
      "type": "service-cards",
      "props": {
        "title": "Nuestros Servicios",
        "services": [
          {
            "icon": "⚖️",
            "title": "Derecho Civil",
            "description": "Asesoría especializada"
          }
        ]
      },
      "order": 1
    }
  ],
  "is_active": true
}
```

## 📊 Tipos de Datos

### LayoutConfig
```typescript
interface LayoutConfig {
  id: string;
  name: string;
  components: ComponentConfig[];
  version: number;
  lastModified: string;
}
```

### ComponentConfig
```typescript
interface ComponentConfig {
  id: string;
  type: string;
  props: any;
  order: number;
}
```

### Tipos de Componentes Disponibles

#### Hero Banner
```typescript
{
  type: 'hero-banner',
  props: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaLink: string;
  }
}
```

#### Service Cards
```typescript
{
  type: 'service-cards',
  props: {
    title: string;
    services: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
  }
}
```

#### Contact Form
```typescript
{
  type: 'contact-form',
  props: {
    title: string;
    subtitle: string;
    submitText: string;
  }
}
```

#### Testimonials
```typescript
{
  type: 'testimonials',
  props: {
    title: string;
    testimonials: Array<{
      name: string;
      text: string;
      rating: number;
    }>;
  }
}
```

#### Stats
```typescript
{
  type: 'stats',
  props: {
    title: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  }
}
```

#### Text Block
```typescript
{
  type: 'text-block',
  props: {
    title: string;
    content: string;
    alignment: 'left' | 'center' | 'right';
    fontSize: 'small' | 'medium' | 'large';
  }
}
```

#### Image Gallery
```typescript
{
  type: 'image-gallery',
  props: {
    title: string;
    columns: number;
    showCaptions: boolean;
    images: string[];
  }
}
```

#### Map
```typescript
{
  type: 'map',
  props: {
    title: string;
    address: string;
    latitude: number;
    longitude: number;
    zoom: number;
  }
}
```

#### Divider
```typescript
{
  type: 'divider',
  props: {
    type: 'solid' | 'dashed' | 'dotted';
    color: string;
    thickness: number;
  }
}
```

#### Spacer
```typescript
{
  type: 'spacer',
  props: {
    height: number;
  }
}
```

## 🔐 Autenticación

### JWT Token
```http
Authorization: Bearer <jwt_token>
```

### Obtener Token
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "password"
}
```

## 📝 Códigos de Estado

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🐛 Manejo de Errores

### Error de Validación
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    }
  ]
}
```

### Error de Autenticación
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Error de Permisos
```json
{
  "statusCode": 403,
  "message": "Access denied. Admin role required."
}
```

## 🔄 Ejemplos de Uso

### Crear Layout Completo
```javascript
const layout = {
  name: "Home Page Layout",
  components: [
    {
      id: "hero-1",
      type: "hero-banner",
      props: {
        title: "Despacho de Abogados García & Asociados",
        subtitle: "Más de 15 años de experiencia en servicios legales",
        ctaText: "Consulta Gratuita",
        ctaLink: "/contacto"
      },
      order: 0
    },
    {
      id: "services-1",
      type: "service-cards",
      props: {
        title: "Nuestros Servicios Legales",
        services: [
          {
            icon: "⚖️",
            title: "Derecho Civil",
            description: "Asesoría especializada en casos civiles"
          },
          {
            icon: "👥",
            title: "Derecho Laboral",
            description: "Protección de derechos laborales"
          }
        ]
      },
      order: 1
    }
  ]
};

fetch('/api/admin/layouts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(layout)
});
```

### Obtener Layout Activo
```javascript
fetch('/api/layouts/home/active')
  .then(response => response.json())
  .then(layout => {
    console.log('Layout activo:', layout);
    // Renderizar componentes
    layout.components.forEach(component => {
      renderComponent(component);
    });
  });
```

## 🚀 Próximas Funcionalidades

### Versionado de Layouts
```http
GET /api/admin/layouts/:id/versions
POST /api/admin/layouts/:id/versions
```

### Plantillas Predefinidas
```http
GET /api/admin/layouts/templates
POST /api/admin/layouts/:id/clone
```

### Exportar/Importar
```http
POST /api/admin/layouts/import
GET /api/admin/layouts/:id/export
```

---

**API Documentation v1.0** 📚 