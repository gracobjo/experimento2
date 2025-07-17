# Sistema de Parametrización Completa - Menús y Configuración del Sitio

## 🎯 Descripción General

Se ha implementado un sistema completo de **parametrización dinámica** que permite al administrador personalizar completamente la navegación y apariencia del sistema legal, similar al HomeBuilder existente. Este sistema incluye:

- **Configuración de Menús**: Gestión completa de navegación por roles
- **Configuración del Sitio**: Personalización de marca, layout y contenido
- **Hooks Dinámicos**: Carga automática de configuraciones
- **Interfaz Administrativa**: Paneles de gestión intuitivos

## 🗄️ Estructura de Base de Datos

### **Tabla: MenuConfig**
```sql
- id: UUID (PK)
- name: String (Nombre del menú)
- role: Role (ADMIN, ABOGADO, CLIENTE)
- orientation: String (horizontal, vertical)
- isActive: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### **Tabla: MenuItem**
```sql
- id: UUID (PK)
- menuConfigId: UUID (FK a MenuConfig)
- label: String (Texto visible)
- url: String (URL de destino)
- icon: String (Icono emoji o CSS)
- order: Int (Orden de aparición)
- isVisible: Boolean
- isExternal: Boolean
- parentId: UUID (Para submenús)
- createdAt: DateTime
- updatedAt: DateTime
```

### **Tabla: SiteConfig**
```sql
- id: UUID (PK)
- key: String (Clave única)
- value: String (Valor de configuración)
- type: String (string, image, color, boolean, json)
- category: String (branding, layout, contact, social, general)
- description: String
- isPublic: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

## 🔧 Backend - Endpoints Implementados

### **Configuración de Menús**

#### `GET /api/menu-config`
- **Descripción**: Obtener todas las configuraciones de menús
- **Roles**: Solo ADMIN
- **Respuesta**: Lista de configuraciones con elementos

#### `GET /api/menu-config/role/:role`
- **Descripción**: Obtener menú activo para un rol específico
- **Roles**: Público (sin autenticación)
- **Respuesta**: Configuración de menú con elementos visibles

#### `POST /api/menu-config`
- **Descripción**: Crear nueva configuración de menú
- **Roles**: Solo ADMIN
- **Body**: `CreateMenuConfigDto`

#### `PATCH /api/menu-config/:id`
- **Descripción**: Actualizar configuración de menú
- **Roles**: Solo ADMIN
- **Body**: `UpdateMenuConfigDto`

#### `DELETE /api/menu-config/:id`
- **Descripción**: Eliminar configuración de menú
- **Roles**: Solo ADMIN

### **Configuración del Sitio**

#### `GET /api/site-config`
- **Descripción**: Obtener todas las configuraciones
- **Roles**: Solo ADMIN

#### `GET /api/site-config/public`
- **Descripción**: Obtener configuraciones públicas
- **Roles**: Público (sin autenticación)

#### `GET /api/site-config/categories`
- **Descripción**: Obtener configuraciones agrupadas por categoría
- **Roles**: Solo ADMIN

#### `GET /api/site-config/key/:key`
- **Descripción**: Obtener configuración específica por clave
- **Roles**: Público (sin autenticación)

#### `POST /api/site-config`
- **Descripción**: Crear nueva configuración
- **Roles**: Solo ADMIN

#### `PATCH /api/site-config/:id`
- **Descripción**: Actualizar configuración
- **Roles**: Solo ADMIN

#### `PATCH /api/site-config/key/:key`
- **Descripción**: Actualizar configuración por clave
- **Roles**: Solo ADMIN

#### `DELETE /api/site-config/:id`
- **Descripción**: Eliminar configuración
- **Roles**: Solo ADMIN

#### `POST /api/site-config/initialize`
- **Descripción**: Inicializar configuraciones por defecto
- **Roles**: Solo ADMIN

## 🎨 Frontend - Componentes Creados

### **1. Página de Configuración de Menús**
**Archivo**: `frontend/src/pages/admin/MenuConfigPage.tsx`

**Funcionalidades**:
- ✅ Crear/editar/eliminar menús por rol
- ✅ Configurar orientación (horizontal/vertical)
- ✅ Gestionar elementos de menú (etiquetas, URLs, iconos)
- ✅ Ordenar elementos por prioridad
- ✅ Mostrar/ocultar elementos
- ✅ Enlaces externos/internos
- ✅ Submenús (estructura jerárquica)

**Características**:
- Interfaz drag-and-drop para reordenar
- Editor visual de elementos
- Vista previa en tiempo real
- Validación de datos
- Confirmaciones de eliminación

### **2. Página de Configuración del Sitio**
**Archivo**: `frontend/src/pages/admin/SiteConfigPage.tsx`

**Funcionalidades**:
- ✅ Gestión por categorías (Branding, Layout, Contact, Social, General)
- ✅ Diferentes tipos de datos (texto, imagen, color, booleano, JSON)
- ✅ Actualización rápida inline
- ✅ Configuraciones públicas/privadas
- ✅ Inicialización de configuraciones por defecto

**Categorías Disponibles**:
- **🎨 Branding**: Nombre, logo, favicon, colores
- **📐 Layout**: Posición sidebar, ancho, header fijo
- **📞 Contact**: Email, teléfono, dirección, horarios
- **🌐 Social**: Redes sociales
- **⚙️ General**: Idioma, zona horaria, formato fecha

### **3. Hook de Configuración Dinámica**
**Archivo**: `frontend/src/hooks/useSiteConfig.ts`

**Hooks Disponibles**:
- `useSiteConfig()`: Configuraciones del sitio
- `useMenuConfig(role)`: Configuración de menús por rol
- `useAppConfig(role)`: Hook combinado

**Funcionalidades**:
- Carga automática de configuraciones
- Cache local de datos
- Actualización en tiempo real
- Manejo de errores
- Valores por defecto

## 🚀 Cómo Usar el Sistema

### **Para Administradores**

#### **1. Acceder a la Configuración**
```
Dashboard Admin → Acciones Rápidas → Configurar Menús
Dashboard Admin → Acciones Rápidas → Configurar Sitio
```

#### **2. Configurar Menús**
1. **Crear Nuevo Menú**:
   - Nombre del menú
   - Rol destinatario (ADMIN, ABOGADO, CLIENTE)
   - Orientación (horizontal/vertical)
   - Estado activo

2. **Gestionar Elementos**:
   - Agregar elementos con etiqueta, URL, icono
   - Ordenar por prioridad
   - Configurar visibilidad
   - Enlaces externos/internos

3. **Editar Existente**:
   - Modificar elementos inline
   - Reordenar arrastrando
   - Eliminar elementos no deseados

#### **3. Configurar Sitio**
1. **Branding**:
   - Cambiar nombre del sitio
   - Actualizar logo y favicon
   - Modificar colores principales

2. **Layout**:
   - Posición del sidebar (izquierda/derecha)
   - Ancho del sidebar
   - Header fijo/no fijo
   - Footer visible/oculto

3. **Contacto**:
   - Email de contacto
   - Teléfono
   - Dirección
   - Horarios de oficina

4. **Social**:
   - URLs de redes sociales
   - Enlaces a perfiles

### **Para Desarrolladores**

#### **1. Usar Hooks en Componentes**
```typescript
import { useAppConfig } from '../hooks/useSiteConfig';

const MyComponent = () => {
  const { 
    siteName, 
    logoUrl, 
    menuItems, 
    menuOrientation,
    loading 
  } = useAppConfig('ADMIN');

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <h1>{siteName}</h1>
      <img src={logoUrl} alt="Logo" />
      {/* Renderizar menú dinámicamente */}
    </div>
  );
};
```

#### **2. Actualizar Configuraciones**
```typescript
const { updateSiteConfig } = useAppConfig('ADMIN');

const handleUpdateLogo = async () => {
  const success = await updateSiteConfig('logo_url', '/new-logo.png');
  if (success) {
    console.log('Logo actualizado');
  }
};
```

#### **3. Acceder a Configuraciones Específicas**
```typescript
const { getConfig, getBooleanConfig } = useSiteConfig();

const siteName = getConfig('site_name', 'Despacho Legal');
const maintenanceMode = getBooleanConfig('maintenance_mode', false);
```

## 📊 Configuraciones Iniciales

### **Menús por Defecto**

#### **Admin**
- Dashboard, Usuarios, Expedientes, Citas, Tareas, Documentos, Reportes, Configuración

#### **Abogado**
- Dashboard, Mis Expedientes, Citas, Tareas, Chat, Reportes, Facturación (con submenú)

#### **Cliente**
- Dashboard, Mis Expedientes, Provisiones, Mis Citas, Chat

### **Configuraciones del Sitio por Defecto**

#### **Branding**
- `site_name`: "Despacho Legal"
- `logo_url`: "/images/logo.png"
- `favicon_url`: "/images/favicon.ico"
- `primary_color`: "#1e40af"
- `secondary_color`: "#3b82f6"

#### **Layout**
- `sidebar_position`: "left"
- `sidebar_width`: "250px"
- `header_fixed`: true
- `footer_visible`: true

#### **Contact**
- `contact_email`: "info@despacholegal.com"
- `contact_phone`: "+34 123 456 789"
- `contact_address`: "Calle Principal 123, Madrid"
- `office_hours`: "Lunes a Viernes: 9:00 - 18:00"

## 🔄 Flujo de Datos

### **1. Carga Inicial**
```
Frontend → useAppConfig() → API → Base de Datos
```

### **2. Actualización**
```
Admin → Interfaz → API → Base de Datos → Frontend (automático)
```

### **3. Cache Local**
```
useSiteConfig → Cache en memoria → Actualización automática
```

## 🛠️ Mantenimiento

### **Scripts de Inicialización**
```bash
# Inicializar configuraciones por defecto
npx ts-node scripts/initialize-configs.ts
```

### **Migraciones de Base de Datos**
```bash
# Aplicar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate
```

### **Backup de Configuraciones**
```sql
-- Exportar configuraciones
SELECT * FROM "MenuConfig";
SELECT * FROM "MenuItem";
SELECT * FROM "SiteConfig";
```

## 🎯 Beneficios Obtenidos

### **Para Administradores**
1. **Flexibilidad Total**: Personalizar navegación y apariencia sin código
2. **Interfaz Intuitiva**: Paneles visuales fáciles de usar
3. **Cambios en Tiempo Real**: Modificaciones inmediatas
4. **Gestión por Roles**: Menús específicos para cada tipo de usuario

### **Para Desarrolladores**
1. **Escalabilidad**: Fácil agregar nuevas configuraciones
2. **Reutilización**: Hooks compartidos entre componentes
3. **Tipado**: TypeScript completo para prevenir errores
4. **Performance**: Cache local y actualizaciones optimizadas

### **Para Usuarios**
1. **Experiencia Personalizada**: Interfaz adaptada al rol
2. **Navegación Intuitiva**: Menús organizados y claros
3. **Consistencia**: Mismo patrón en toda la aplicación
4. **Accesibilidad**: Enlaces directos a funciones relevantes

## 🔮 Futuras Mejoras

### **Funcionalidades Adicionales**
1. **Temas Visuales**: Múltiples temas predefinidos
2. **Configuraciones Avanzadas**: CSS personalizado
3. **Importación/Exportación**: Backup de configuraciones
4. **Historial de Cambios**: Auditoría de modificaciones
5. **Configuraciones Condicionales**: Reglas basadas en contexto

### **Mejoras de UX**
1. **Drag & Drop**: Reordenar elementos visualmente
2. **Vista Previa**: Simulador de cambios
3. **Templates**: Configuraciones predefinidas
4. **Validación Avanzada**: Reglas de negocio
5. **Notificaciones**: Alertas de cambios importantes

## ✅ Estado Final

El sistema de parametrización está **completamente implementado y funcional** con:

- ✅ Backend con endpoints documentados
- ✅ Frontend con interfaces administrativas
- ✅ Hooks para carga dinámica
- ✅ Base de datos optimizada
- ✅ Configuraciones iniciales
- ✅ Documentación completa
- ✅ Integración con sistema existente

La aplicación ahora es **completamente personalizable** desde el panel de administración, permitiendo adaptar la experiencia de usuario sin necesidad de modificar código. 