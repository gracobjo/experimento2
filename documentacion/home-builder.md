# 🎨 Home Builder - Sistema de Diseño Drag & Drop

## 📋 Descripción

El Home Builder es un sistema completo de diseño drag & drop que permite a los administradores crear y personalizar la página principal del sitio web arrastrando y soltando componentes predefinidos.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Drag & Drop Intuitivo**: Arrastra componentes desde la biblioteca al canvas
- **Editor Visual**: Interfaz WYSIWYG para diseño en tiempo real
- **Panel de Propiedades**: Edita las propiedades de cada componente
- **Vista Previa**: Previsualiza el resultado final
- **Guardado/Carga**: Persiste los diseños en la base de datos
- **Componentes Reutilizables**: Biblioteca extensible de componentes

### 🎯 Componentes Disponibles

#### 📱 Contenido Principal
- **Banner Principal**: Banner destacado con título, subtítulo y CTA
- **Tarjetas de Servicios**: Grid de servicios con iconos
- **Bloque de Texto**: Texto personalizable con diferentes estilos

#### 📧 Contacto
- **Formulario de Contacto**: Formulario funcional para clientes
- **Mapa de Ubicación**: Mapa interactivo con ubicación

#### 📊 Social Proof
- **Testimonios**: Opiniones de clientes satisfechos
- **Estadísticas**: Números y métricas importantes

#### 🖼️ Contenido Visual
- **Galería de Imágenes**: Grid de imágenes con títulos

#### 📐 Layout
- **Separador**: Líneas divisoras personalizables
- **Espaciador**: Espacio vertical configurable

## 🛠️ Instalación y Configuración

### Prerrequisitos
- Node.js 16+
- npm o yarn
- Base de datos PostgreSQL (para el backend)

### 1. Instalar Dependencias Frontend
```bash
cd frontend
npm install
```

### 2. Instalar Dependencias Backend
```bash
cd backend
npm install
```

### 3. Configurar Base de Datos
```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 4. Ejecutar Servidores
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🎮 Cómo Usar el Home Builder

### 1. Acceder al Home Builder
1. Inicia sesión como administrador
2. Ve a **Admin Dashboard** → **Home Builder**
3. O navega directamente a `/admin/home-builder`

### 2. Diseñar la Página
1. **Arrastra Componentes**: Desde la biblioteca izquierda al canvas central
2. **Selecciona Componentes**: Haz clic en un componente para editarlo
3. **Edita Propiedades**: Usa el panel derecho para personalizar
4. **Reordena**: Arrastra componentes dentro del canvas para cambiar el orden

### 3. Personalizar Componentes

#### Banner Principal
- **Título**: Texto principal del banner
- **Subtítulo**: Texto secundario descriptivo
- **Texto del botón**: Texto del botón CTA
- **Enlace del botón**: URL de destino

#### Tarjetas de Servicios
- **Título**: Título de la sección
- **Servicios**: Array de servicios con:
  - Icono (emoji)
  - Título del servicio
  - Descripción

#### Formulario de Contacto
- **Título**: Título del formulario
- **Subtítulo**: Texto descriptivo

#### Testimonios
- **Título**: Título de la sección
- **Testimonios**: Array con:
  - Nombre del cliente
  - Texto del testimonio

### 4. Guardar y Cargar
- **Guardar**: Haz clic en "Guardar" para persistir el diseño
- **Cargar**: Haz clic en "Cargar" para recuperar el último diseño
- **Vista Previa**: Cambia a modo preview para ver el resultado

## 🏗️ Arquitectura del Sistema

### Frontend (React + TypeScript)
```
src/components/HomeBuilder/
├── HomeBuilder.tsx          # Componente principal
├── ComponentLibrary.tsx     # Biblioteca de componentes
├── Canvas.tsx              # Área de diseño
├── PropertiesPanel.tsx     # Editor de propiedades
├── ComponentRenderer.tsx   # Renderizador de componentes
└── types.ts               # Tipos TypeScript
```

### Backend (NestJS + Prisma)
```
src/admin/
├── layouts.controller.ts   # Controlador de layouts
├── layouts.service.ts      # Servicio de layouts
└── dto/
    └── layout.dto.ts      # DTOs para layouts
```

### Base de Datos
```sql
-- Tabla de layouts
CREATE TABLE layouts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  components JSONB NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Tecnologías Utilizadas

### Frontend
- **React 18**: Framework de UI
- **TypeScript**: Tipado estático
- **@dnd-kit**: Biblioteca de drag & drop
- **Tailwind CSS**: Framework de estilos
- **Vite**: Build tool

### Backend
- **NestJS**: Framework de Node.js
- **Prisma**: ORM para base de datos
- **PostgreSQL**: Base de datos
- **JWT**: Autenticación

## 📱 API Endpoints

### Layouts (Admin)
```
POST   /api/admin/layouts           # Crear layout
GET    /api/admin/layouts           # Listar layouts
GET    /api/admin/layouts/:id       # Obtener layout
PUT    /api/admin/layouts/:id       # Actualizar layout
DELETE /api/admin/layouts/:id       # Eliminar layout
POST   /api/admin/layouts/:id/activate  # Activar layout
```

### Layouts (Público)
```
GET    /api/layouts/home/active     # Obtener layout activo de home
```

## 🎨 Personalización

### Agregar Nuevos Componentes

1. **Definir el Componente** en `ComponentLibrary.tsx`:
```typescript
{
  type: 'mi-componente',
  name: 'Mi Componente',
  description: 'Descripción del componente',
  icon: '🎯',
  category: 'Nueva Categoría'
}
```

2. **Crear el Renderizador** en `ComponentRenderer.tsx`:
```typescript
case 'mi-componente':
  return <MiComponente props={component.props} />;
```

3. **Agregar Propiedades** en `PropertiesPanel.tsx`:
```typescript
case 'mi-componente':
  return (
    <div className="space-y-4">
      <PropertyField
        label="Mi Propiedad"
        value={localProps.miPropiedad || ''}
        onChange={(value) => handleChange('miPropiedad', value)}
        type="text"
      />
    </div>
  );
```

4. **Definir Props por Defecto** en `HomeBuilder.tsx`:
```typescript
'mi-componente': {
  miPropiedad: 'Valor por defecto'
}
```

### Estilos Personalizados

Los componentes usan Tailwind CSS. Puedes personalizar:
- Colores en `tailwind.config.js`
- Componentes en `ComponentRenderer.tsx`
- Layout en `HomeBuilder.tsx`

## 🐛 Solución de Problemas

### Componentes No Se Muestran
1. Verifica que @dnd-kit esté instalado: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. Revisa la consola del navegador para errores
3. Verifica que el componente esté definido en `ComponentRenderer.tsx`

### Drag & Drop No Funciona
1. Asegúrate de que el DndContext esté envolviendo los componentes
2. Verifica que los IDs sean únicos
3. Revisa que los listeners estén correctamente configurados

### Errores de Backend
1. Verifica que la base de datos esté configurada
2. Ejecuta las migraciones: `npx prisma migrate dev`
3. Revisa los logs del servidor

## 📈 Próximos Pasos

### Mejoras Planificadas
- [ ] Editor de imágenes integrado
- [ ] Plantillas predefinidas
- [ ] Historial de versiones
- [ ] Exportar/Importar layouts
- [ ] Componentes responsivos avanzados
- [ ] Animaciones y transiciones
- [ ] Integración con CMS

### Optimizaciones
- [ ] Lazy loading de componentes
- [ ] Caché de layouts
- [ ] Compresión de imágenes
- [ ] CDN para assets

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

**¡Disfruta diseñando tu página principal! 🎨✨** 