# 📊 Diagramas UML - Sistema de Gestión Legal

## 🎯 Descripción

Esta carpeta contiene todos los diagramas UML del sistema de gestión legal, incluyendo la arquitectura de despliegue, diagramas de clases, secuencias, casos de uso, componentes y actividades.

## 📋 Diagramas Disponibles

### 1. 🏗️ **Diagrama de Despliegue** (`deployment-architecture.mmd`)

**Propósito:** Muestra la arquitectura física del sistema y dónde está desplegado cada componente.

**Componentes Principales:**
- **Frontend (Vercel):** React App con componentes y páginas
- **Backend (Railway):** NestJS API con módulos específicos
- **Chatbot (Railway):** Python FastAPI con servicios NLP
- **Database (Railway):** PostgreSQL con Prisma ORM
- **Servicios Externos:** Vercel, Railway, AutoFirma, Email

**URLs del Sistema:**
- Frontend: `https://experimento2-fenm.vercel.app`
- Backend: `https://experimento2-production.up.railway.app`
- Chatbot: `https://chatbot-legal-production-b91c.up.railway.app`

### 2. 🏛️ **Diagrama de Clases** (`class-diagram.mmd`)

**Propósito:** Representa la estructura de datos y relaciones entre entidades del sistema.

**Entidades Principales:**
- **User:** Gestión de usuarios y autenticación
- **Invoice:** Facturación electrónica con QR y firma
- **Case:** Gestión de casos legales
- **Appointment:** Sistema de citas
- **Parameter:** Configuración dinámica del sistema
- **Layout:** Gestión de layouts de páginas
- **ChatMessage:** Mensajes del chatbot

**Enums:**
- Role (ADMIN, ABOGADO, CLIENTE)
- InvoiceType (F, R)
- InvoiceStatus (draft, emitted, signed, cancelled)
- CaseStatus (active, closed, pending)
- AppointmentStatus (scheduled, confirmed, cancelled, completed)

### 3. ⏱️ **Diagrama de Secuencia** (`sequence-diagram.mmd`)

**Propósito:** Ilustra el flujo de interacción entre componentes durante la facturación.

**Flujo Principal:**
1. **Crear Factura:** Usuario → Frontend → Backend → Database
2. **Generar PDF:** Backend genera HTML con QR y convierte a PDF
3. **Firmar Factura:** Integración con AutoFirma para firma digital
4. **Chatbot:** Asistencia contextual con NLP
5. **Eliminar Factura:** Gestión de eliminación segura

### 4. 🎯 **Diagrama de Casos de Uso** (`use-case-diagram.mmd`)

**Propósito:** Define las funcionalidades del sistema desde la perspectiva del usuario.

**Actores:**
- **Administrador:** Gestión completa del sistema
- **Abogado:** Gestión de casos, facturación, citas
- **Cliente:** Acceso limitado a casos y citas
- **Sistema:** Procesos automáticos

**Casos de Uso Principales:**
- **Gestión de Usuarios:** Autenticación, perfiles, recuperación
- **Gestión de Casos:** CRUD completo con estadísticas
- **Facturación:** Creación, PDF, firma, eliminación
- **Citas:** Agendamiento, confirmación, cancelación
- **Chatbot:** Asistencia virtual con NLP
- **Configuración:** Parámetros, layouts, usuarios
- **Reportes:** Estadísticas, exportación, actividad

### 5. 🔧 **Diagrama de Componentes** (`component-diagram.mmd`)

**Propósito:** Muestra la arquitectura de componentes y sus interacciones.

**Frontend Components:**
- **Pages:** Login, Dashboard, Cases, Invoices, Reports, Admin, Home
- **Components:** Layout, Navbar, Sidebar, Footer, ChatbotWidget, ChatbotButton
- **Services:** ApiService, AuthService, ChatbotService, StorageService

**Backend Components:**
- **Controllers:** Auth, Invoices, Cases, Reports, Parametros, Layouts, Chat
- **Services:** Servicios de negocio con Prisma ORM
- **Guards:** JWT, Roles, Autenticación

**Chatbot Components:**
- **Core:** MainApp, Router, Middleware
- **Services:** NLP, Intent, Entity, Response, Backend
- **Models:** ChatRequest, ChatResponse, Intent, Entity

### 6. 🔄 **Diagrama de Actividad** (`activity-diagram.mmd`)

**Propósito:** Representa el flujo de trabajo completo del sistema legal.

**Flujos Principales:**
- **Autenticación:** Login → Dashboard
- **Gestión de Casos:** Crear → Validar → Guardar
- **Facturación:** Crear → Generar PDF → Firmar
- **Citas:** Agendar → Confirmar → Enviar Email
- **Chatbot:** Abrir → Procesar NLP → Responder
- **Reportes:** Seleccionar → Generar → Exportar
- **Configuración:** Gestionar parámetros y layouts

## 🎨 Estilos y Colores

### **Paleta de Colores:**
- **🔵 Frontend:** Azul claro (#e1f5fe)
- **🟣 Backend:** Púrpura claro (#f3e5f5)
- **🟢 Chatbot:** Verde claro (#e8f5e8)
- **🟠 Database:** Naranja claro (#fff3e0)
- **🔴 External:** Rosa claro (#fce4ec)
- **🟡 Users:** Verde muy claro (#f1f8e9)

### **Iconos Utilizados:**
- 👤 Usuarios y actores
- 🌐 Frontend y web
- ⚙️ Backend y servicios
- 🤖 Chatbot e IA
- 🗄️ Base de datos
- 📄 Documentos y facturas
- 📁 Casos y archivos
- 📊 Reportes y estadísticas
- 🔐 Autenticación y seguridad
- 💬 Chat y comunicación

## 🚀 Cómo Visualizar los Diagramas

### **Opción 1: Mermaid Live Editor**
1. Ir a [Mermaid Live Editor](https://mermaid.live/)
2. Copiar el contenido del archivo `.mmd`
3. Ver el diagrama renderizado

### **Opción 2: VS Code con Extensión**
1. Instalar extensión "Mermaid Preview"
2. Abrir archivo `.mmd`
3. Ver preview automático

### **Opción 3: GitHub**
- Los archivos `.mmd` se renderizan automáticamente en GitHub

## 📊 Tecnologías Representadas

### **Frontend:**
- React (TypeScript)
- Vite (Build tool)
- Tailwind CSS (Styling)
- Axios (HTTP client)

### **Backend:**
- NestJS (Node.js)
- TypeScript
- Prisma (ORM)
- JWT (Autenticación)

### **Chatbot:**
- FastAPI (Python)
- spaCy (NLP)
- NLTK (Procesamiento)
- WebSockets (Tiempo real)

### **Infraestructura:**
- Vercel (Frontend hosting)
- Railway (Backend & Chatbot hosting)
- PostgreSQL (Database)
- Docker (Containerización)

## 🎯 Beneficios de Esta Arquitectura

### **✅ Escalabilidad:**
- Microservicios independientes
- Despliegues separados
- Escalado individual por servicio

### **✅ Mantenibilidad:**
- Separación clara de responsabilidades
- Tecnologías específicas por dominio
- Código modular y reutilizable

### **✅ Seguridad:**
- Autenticación JWT
- Roles y permisos
- Validación en múltiples capas

### **✅ Experiencia de Usuario:**
- Interfaz moderna y responsive
- Chatbot inteligente 24/7
- Procesos automatizados

---

**Documentación creada:** 6 de Agosto, 2025  
**Versión:** 1.0.0  
**Estado:** Completa y actualizada 