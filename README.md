# 🏛️ Sistema de Gestión Legal - Experimento

## Descripción
Plataforma integral para la gestión de despachos legales: casos, documentos, facturación electrónica, chat, teleasistencia y cumplimiento legal. **Primera plataforma legal con accesibilidad universal WCAG 2.1 AA**. Basada en NestJS, Prisma, React y PostgreSQL.

---

## 🌟 Características Principales

### 🔐 Gestión de Usuarios y Seguridad
- Gestión de usuarios y roles (ADMIN, ABOGADO, CLIENTE)
- Autenticación JWT segura
- Control de acceso basado en roles
- Validación de entrada y sanitización de datos

### 📋 Gestión de Casos y Documentos
- Gestión completa de casos legales
- Sistema de documentos con versionado
- Búsqueda y filtros avanzados
- Categorización y etiquetado

### 💰 Facturación y Finanzas
- Facturación electrónica (Facturae XML, PDF)
- Provisión de fondos y control de anticipos
- Gestión de pagos y cobros
- Reportes financieros

### 📅 Gestión de Citas Avanzada
- **Sistema de citas unificado** con filtros avanzados
- **Vista de calendario y lista** intercambiables
- **Citas de visitantes** con asignación de abogados
- **Filtros por cliente, fecha, estado, tipo de consulta**
- **Reprogramación de citas** con modales accesibles
- **Búsqueda inteligente** con múltiples criterios

### 💬 Comunicación en Tiempo Real
- Chat en tiempo real (WebSocket)
- Teleasistencia integrada
- **Chatbot inteligente** para atención 24/7
- Notificaciones automáticas

### ♿ Accesibilidad Universal
- **Cumplimiento completo WCAG 2.1 AA**
- **Navegación por teclado** 100% funcional
- **Soporte para lectores de pantalla** (NVDA, VoiceOver)
- **Contraste de colores** adecuado
- **Estructura semántica** correcta
- **Tester de accesibilidad integrado** (botón ♿)
- **Atributos ARIA** completos
- **Modales accesibles** con manejo de focus

### ⚙️ Administración y Configuración
- Panel de administración completo
- Parámetros y contenido legal editable
- **Gestión de servicios** parametrizable
- **Configuración de menús** dinámica
- **Layouts personalizables** para la página de inicio
- API REST documentada con Swagger

---

## 🛠️ Tecnologías

### Frontend
- **React 18** + TypeScript
- **Vite** para desarrollo rápido
- **Tailwind CSS** para estilos
- **React Big Calendar** para gestión de citas
- **Socket.io Client** para comunicación en tiempo real

### Backend
- **NestJS** framework Node.js
- **Prisma ORM** para base de datos
- **PostgreSQL** base de datos
- **JWT** para autenticación
- **Socket.io** para WebSockets
- **Multer** para gestión de archivos

### Infraestructura
- **Scripts de setup** automatizados
- **Migraciones Prisma** para control de esquema
- **Docker** para containerización
- **Despliegue cloud** gratuito

---

## 🚀 Instalación Rápida

### 1. Clona el repositorio
```bash
git clone <URL_DEL_REPO>
cd experimento
```

### 2. Configura variables de entorno
```bash
# Backend
cd backend
cp .env.example .env
# Edita .env con tus credenciales de BD y JWT

# Frontend
cd ../frontend
cp .env.example .env
```

### 3. Instala dependencias y ejecuta migraciones
```bash
# Backend
cd backend
npm install
npx prisma migrate deploy
npx prisma generate
npx prisma db seed

# Frontend
cd ../frontend
npm install
```

### 4. Inicia los servicios
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🌐 Endpoints y URLs

### Desarrollo
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Swagger Docs:** http://localhost:3000/api

### Páginas Principales
- **Dashboard:** http://localhost:5173/dashboard
- **Panel Admin:** http://localhost:5173/admin
- **Gestión de Citas:** http://localhost:5173/lawyer/appointments
- **Admin Citas:** http://localhost:5173/admin/appointments

### Páginas Legales
- **Privacidad:** `/privacidad`
- **Términos:** `/terminos`
- **Cookies:** `/cookies`

---

## 🔧 Scripts Útiles

### Automatización
- `setup-completo.bat`: Configuración y despliegue rápido
- `check-status.bat`: Verificación de estado de servicios
- `setup-params.bat`: Inicialización de parámetros legales/contacto

### Desarrollo
- `deploy-all.sh`: Despliegue completo automatizado
- `create-test-invoices.ps1`: Generación de facturas de prueba
- `check-users.ps1`: Verificación de usuarios en BD

---

## ♿ Accesibilidad

### Características Implementadas
- ✅ **Navegación por teclado** completa
- ✅ **Atributos ARIA** en todos los elementos interactivos
- ✅ **Etiquetas asociadas** en formularios
- ✅ **Roles semánticos** apropiados
- ✅ **Contraste WCAG AA** (4.5:1 mínimo)
- ✅ **Estructura de encabezados** correcta
- ✅ **Modales accesibles** con manejo de focus
- ✅ **Descripciones para lectores de pantalla**

### Tester de Accesibilidad
- **Acceso:** Botón ♿ en la barra de navegación
- **Funcionalidades:**
  - Pruebas automatizadas de accesibilidad
  - Verificación de navegación por teclado
  - Validación de atributos ARIA
  - Generación de reportes en Markdown
  - Pruebas específicas por categoría

### Navegación por Teclado
- **Tab:** Navegar entre elementos
- **Enter/Espacio:** Activar elementos
- **Flechas:** Navegar en listas y calendarios
- **Escape:** Cerrar modales
- **Ctrl+F:** Búsqueda en página

---

## 📊 Filtros Avanzados

### Gestión de Citas
- **Búsqueda general:** Múltiples términos separados por `;`
- **Filtros específicos:**
  - Cliente (nombre, email)
  - Abogado asignado
  - Rango de fechas
  - Estado (Confirmada, Pendiente, Cancelada, Completada)
  - Tipo de consulta
  - Tipo de cita (Regular, Visitante)
- **Vista dual:** Calendario y lista intercambiables
- **Limpieza:** Botón para resetear todos los filtros

### Gestión de Casos
- **Búsqueda inteligente** por múltiples criterios
- **Filtros por estado** y categoría
- **Ordenación** por fecha, cliente, estado
- **Paginación** optimizada

---

## 🤖 Chatbot Inteligente

### Funcionalidades
- **Atención 24/7** para visitantes
- **Gestión automática de citas**
- **Información legal básica**
- **Integración con sistema de citas**
- **Respuestas contextuales**

### Configuración
- Mensajes de bienvenida personalizables
- Respuestas automáticas configurables
- Horarios de atención
- Integración con gestión de citas

---

## 📚 Documentación

### Para Desarrolladores
- `documentacion/DESARROLLADORES.md`: Arquitectura y modelo de datos
- `documentacion/proyecto/DOCUMENTACION_A_ENTREGAR.md`: Documentación completa del proyecto
- `ACCESIBILIDAD_IMPLEMENTADA.md`: Detalles de implementación de accesibilidad
- `RESUMEN_ACCESIBILIDAD.md`: Resumen ejecutivo de accesibilidad

### Guías de Usuario
- `DEPLOYMENT_GUIDE.md`: Guía de despliegue
- `EMAIL_CONFIGURATION.md`: Configuración de email
- `CHATBOT_WELCOME_PAGE.md`: Configuración del chatbot

---

## ☁️ Despliegue en Producción

### Opciones Gratuitas
- **Railway:** Despliegue automático con PostgreSQL incluido
- **Render:** Plataforma gratuita con soporte PostgreSQL
- **Heroku:** Opción gratuita limitada
- **Vercel + Supabase:** Frontend + Backend separados

### Requisitos Mínimos
- **Node.js:** 18+
- **PostgreSQL:** 14+
- **RAM:** 512MB
- **Almacenamiento:** 1GB

### Pasos de Despliegue
1. Configurar variables de entorno
2. Ejecutar migraciones de base de datos
3. Configurar dominio y SSL
4. Verificar accesibilidad con tester integrado

---

## 🧪 Pruebas

### Pruebas de Accesibilidad
- **Automáticas:** axe-core, Lighthouse, WAVE
- **Manuales:** NVDA, VoiceOver, navegación por teclado
- **Integradas:** AccessibilityTester del sistema

### Pruebas Funcionales
- **Gestión de citas:** Creación, asignación, filtros, reprogramación
- **Filtros avanzados:** Búsqueda, combinación, limpieza
- **Accesibilidad:** Navegación, ARIA, formularios, modales

### Pruebas de Rendimiento
- **Tiempo de carga:** < 3 segundos
- **Tiempo de respuesta API:** < 500ms
- **Uso de memoria:** < 100MB por instancia
- **Concurrencia:** 50 usuarios simultáneos

---

## 🤝 Contribuir

### Proceso de Contribución
1. Haz un fork del repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Haz tus cambios y commitea (`git commit -am 'feat: nueva funcionalidad'`)
4. Haz push a tu rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Estándares de Código
- **Accesibilidad:** Cumplir WCAG 2.1 AA
- **TypeScript:** Tipado estricto
- **Testing:** Pruebas unitarias y de accesibilidad
- **Documentación:** Comentarios y README actualizados

---

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] **Navegación con flechas** en listas
- [ ] **Atajos de teclado** para acciones frecuentes
- [ ] **Soporte VoiceOver** completo (iOS/macOS)
- [ ] **Compatibilidad NVDA** avanzada (Windows)
- [ ] **Validación en tiempo real** con anuncios
- [ ] **Subtítulos para videos** (si se implementan)
- [ ] **Transcripciones para audio**

### Mejoras de Accesibilidad
- [ ] **Navegación por gestos** para dispositivos táctiles
- [ ] **Modo alto contraste** configurable
- [ ] **Tamaño de fuente** ajustable
- [ ] **Reducción de movimiento** para usuarios sensibles

---

## 📄 Licencia
MIT

---

## 🆘 Soporte

### ¿Dudas o Sugerencias?
- Abre un issue en GitHub
- Contacta al equipo de desarrollo
- Consulta la documentación técnica

### Reportes de Accesibilidad
- Usa el tester integrado (botón ♿)
- Reporta problemas específicos de accesibilidad
- Incluye detalles del lector de pantalla usado

---

**Versión:** 2.0.0  
**Cumplimiento WCAG:** 2.1 AA  
**Última actualización:** [Fecha actual]  
**Estado:** ✅ Producción lista
