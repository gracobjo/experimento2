# Diagrama de Casos de Uso - Sistema Legal

## Descripción
Este diagrama muestra los casos de uso principales del sistema de gestión legal, incluyendo las interacciones entre usuarios, abogados, administradores y el chatbot.

## Diagrama

```mermaid
usecaseDiagram
  actor Usuario as User
  actor Abogado as Lawyer
  actor Administrador as Admin
  actor Chatbot as Chatbot

  User --> (Login)
  User --> (Consultar casos)
  User --> (Crear caso)
  User --> (Ver notificaciones)
  User --> (Chatear con chatbot)
  User --> (Enviar documentos)

  Lawyer --> (Login)
  Lawyer --> (Gestionar casos)
  Lawyer --> (Ver notificaciones)
  Lawyer --> (Chatear con chatbot)
  Lawyer --> (Enviar documentos)
  Lawyer --> (Asignar tareas)

  Admin --> (Login)
  Admin --> (Gestionar usuarios)
  Admin --> (Gestionar abogados)
  Admin --> (Gestionar casos)
  Admin --> (Ver notificaciones)
  Admin --> (Configurar sistema)

  Chatbot --> (Responder preguntas)
  Chatbot --> (Enviar notificaciones)

  (Chatear con chatbot) ..> (Responder preguntas) : <<include>>
  (Ver notificaciones) ..> (Enviar notificaciones) : <<include>>
  (Gestionar casos) ..> (Consultar casos) : <<include>>
  (Gestionar casos) ..> (Crear caso) : <<include>>
```

## Actores

### Usuario
- **Descripción**: Cliente que utiliza el sistema para gestionar sus casos legales
- **Casos de uso principales**:
  - Login: Autenticación en el sistema
  - Consultar casos: Ver el estado de sus casos legales
  - Crear caso: Iniciar un nuevo caso legal
  - Ver notificaciones: Revisar actualizaciones y mensajes
  - Chatear con chatbot: Obtener ayuda automatizada
  - Enviar documentos: Subir archivos relacionados con el caso

### Abogado
- **Descripción**: Profesional legal que gestiona casos de clientes
- **Casos de uso principales**:
  - Login: Autenticación en el sistema
  - Gestionar casos: Administrar casos asignados
  - Ver notificaciones: Revisar actualizaciones
  - Chatear con chatbot: Obtener asistencia
  - Enviar documentos: Compartir documentos legales
  - Asignar tareas: Delegar trabajo a otros miembros del equipo

### Administrador
- **Descripción**: Usuario con privilegios de administración del sistema
- **Casos de uso principales**:
  - Login: Autenticación en el sistema
  - Gestionar usuarios: Administrar cuentas de usuarios
  - Gestionar abogados: Administrar cuentas de abogados
  - Gestionar casos: Supervisar todos los casos del sistema
  - Ver notificaciones: Revisar notificaciones del sistema
  - Configurar sistema: Ajustar parámetros del sistema

### Chatbot
- **Descripción**: Sistema de inteligencia artificial para asistencia automatizada
- **Casos de uso principales**:
  - Responder preguntas: Proporcionar respuestas automáticas
  - Enviar notificaciones: Generar notificaciones automáticas

## Relaciones

- **<<include>>**: Indica que un caso de uso incluye la funcionalidad de otro
- **<<extend>>**: Indica que un caso de uso puede extender la funcionalidad de otro (no mostrado en este diagrama)

## Notas

- Todos los actores pueden realizar login en el sistema
- El chatbot actúa como un actor del sistema que proporciona servicios automatizados
- Las relaciones de inclusión muestran la dependencia entre casos de uso
- El administrador tiene acceso a todas las funcionalidades del sistema

---

# Diagrama de Clases UML - Sistema Legal

## Descripción
Este diagrama muestra la estructura de clases del sistema de gestión legal, incluyendo las entidades principales, sus atributos, métodos y relaciones.

## Diagrama

```mermaid
classDiagram
  class User {
    -String id
    -String name
    -String email
    -String password
    -Role role
    -String resetPasswordToken
    -DateTime resetPasswordExpires
    -DateTime createdAt
    -DateTime updatedAt
    +login()
    +logout()
    +resetPassword()
    +updateProfile()
  }

  class Client {
    -String id
    -String userId
    -String dni
    -String phone
    -String address
    -DateTime createdAt
    +getCases()
    +createCase()
    +updateInfo()
  }

  class Lawyer {
    -String id
    -String userId
    -String colegiado
    -String phone
    -String address
    -DateTime createdAt
    +getAssignedCases()
    +assignTask()
    +updateCase()
  }

  class Expediente {
    -String id
    -String title
    -String description
    -Status status
    -String clientId
    -String lawyerId
    -DateTime createdAt
    +updateStatus()
    +addDocument()
    +getDocuments()
    +assignLawyer()
  }

  class Document {
    -String id
    -String expedienteId
    -String filename
    -String fileUrl
    -DateTime uploadedAt
    -String description
    -Int fileSize
    -String mimeType
    -String originalName
    -String uploadedBy
    +upload()
    +download()
    +delete()
    +getInfo()
  }

  class Task {
    -String id
    -String title
    -String description
    -DateTime dueDate
    -String priority
    -String status
    -String expedienteId
    -String clientId
    -String assignedTo
    -String createdBy
    -DateTime createdAt
    -DateTime updatedAt
    +create()
    +assign()
    +updateStatus()
    +complete()
  }

  class ChatMessage {
    -String id
    -String content
    -String senderId
    -String receiverId
    -DateTime createdAt
    +send()
    +receive()
    +getHistory()
  }

  class ChatBotMessage {
    -String id
    -Sender sender
    -String sessionId
    -String message
    -DateTime createdAt
    +processMessage()
    +generateResponse()
  }

  class Notification {
    -String id
    -String userId
    -String title
    -String message
    -String type
    -Boolean read
    -DateTime createdAt
    +send()
    +markAsRead()
    +delete()
  }

  class Appointment {
    -String id
    -String clientId
    -String lawyerId
    -DateTime date
    -String location
    -String notes
    +schedule()
    +reschedule()
    +cancel()
    +getDetails()
  }

  class Invoice {
    -String id
    -String numeroFactura
    -DateTime fechaFactura
    -String tipoFactura
    -String emisorId
    -String receptorId
    -String expedienteId
    -Float importeTotal
    -Float baseImponible
    -Float cuotaIVA
    -Float tipoIVA
    -Float descuento
    -Float retencion
    -Boolean aplicarIVA
    -String regimenIvaEmisor
    -String claveOperacion
    -String metodoPago
    -DateTime fechaOperacion
    -String xml
    -String xmlFirmado
    -String estado
    -String motivoAnulacion
    -DateTime selloTiempo
    -String externalId
    -String sistemaEnvio
    -DateTime fechaEnvio
    -DateTime createdAt
    -DateTime updatedAt
    +create()
    +sign()
    +sendToExternalSystem()
    +validate()
  }

  class InvoiceItem {
    -String id
    -String invoiceId
    -String description
    -Float quantity
    -Float unitPrice
    -Float totalAmount
    +calculateTotal()
  }

  class ProvisionFondos {
    -String id
    -DateTime createdAt
    -DateTime updatedAt
    -String description
    -String clientId
    -String expedienteId
    -DateTime date
    -String invoiceId
    -Float amount
    +create()
    +update()
    +getDetails()
  }

  %% Relaciones
  User ||--o{ Client : "has"
  User ||--o{ Lawyer : "has"
  User ||--o{ Expediente : "manages"
  User ||--o{ Document : "uploads"
  User ||--o{ Task : "creates"
  User ||--o{ Task : "assigned_to"
  User ||--o{ ChatMessage : "sends"
  User ||--o{ ChatMessage : "receives"
  User ||--o{ Notification : "receives"
  User ||--o{ Appointment : "participates"

  Client ||--o{ Expediente : "owns"
  Client ||--o{ Appointment : "schedules"
  Client ||--o{ ProvisionFondos : "requests"

  Lawyer ||--o{ Expediente : "manages"
  Lawyer ||--o{ Appointment : "attends"
  Lawyer ||--o{ Invoice : "emits"

  Expediente ||--o{ Document : "contains"
  Expediente ||--o{ Task : "has"
  Expediente ||--o{ Invoice : "generates"
  Expediente ||--o{ ProvisionFondos : "requires"

  Invoice ||--o{ InvoiceItem : "contains"

  ChatBotMessage ||--o{ ChatMessage : "generates"
```

## Clases Principales

### User
- **Descripción**: Clase base para todos los usuarios del sistema
- **Atributos principales**: id, name, email, password, role
- **Métodos principales**: login(), logout(), resetPassword()

### Client
- **Descripción**: Representa a los clientes del despacho
- **Atributos principales**: dni, phone, address
- **Métodos principales**: getCases(), createCase()

### Lawyer
- **Descripción**: Representa a los abogados del despacho
- **Atributos principales**: colegiado, phone, address
- **Métodos principales**: getAssignedCases(), assignTask()

### Expediente
- **Descripción**: Representa un caso legal
- **Atributos principales**: title, description, status, clientId, lawyerId
- **Métodos principales**: updateStatus(), addDocument()

### Document
- **Descripción**: Representa documentos asociados a casos
- **Atributos principales**: filename, fileUrl, fileSize, mimeType
- **Métodos principales**: upload(), download(), delete()

### Task
- **Descripción**: Representa tareas pendientes
- **Atributos principales**: title, description, dueDate, priority, status
- **Métodos principales**: create(), assign(), updateStatus()

### ChatMessage
- **Descripción**: Mensajes del chat entre usuarios
- **Atributos principales**: content, senderId, receiverId
- **Métodos principales**: send(), receive()

### ChatBotMessage
- **Descripción**: Mensajes generados por el chatbot
- **Atributos principales**: sender, sessionId, message
- **Métodos principales**: processMessage(), generateResponse()

### Notification
- **Descripción**: Notificaciones del sistema
- **Atributos principales**: title, message, type, read
- **Métodos principales**: send(), markAsRead()

### Appointment
- **Descripción**: Citas programadas
- **Atributos principales**: date, location, notes
- **Métodos principales**: schedule(), reschedule(), cancel()

### Invoice
- **Descripción**: Facturas del sistema
- **Atributos principales**: numeroFactura, importeTotal, estado
- **Métodos principales**: create(), sign(), sendToExternalSystem()

## Relaciones

- **||--o{**: Relación uno a muchos
- **||--||**: Relación uno a uno
- **}o--o{**: Relación muchos a muchos

## Notas

- Todas las clases incluyen timestamps (createdAt, updatedAt) para auditoría
- Las relaciones muestran la dependencia entre entidades
- Los métodos principales están representados con sus nombres más comunes
- La clase Invoice incluye funcionalidades de facturación electrónica

---

# Diagrama de Secuencia - Interacción Usuario-Chatbot

## Descripción
Este diagrama muestra el flujo completo de interacción entre un usuario y el chatbot, incluyendo la comunicación entre frontend, backend y el microservicio de IA.

## Diagrama

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as Base de Datos
    participant AI as Microservicio IA
    participant N as Notificaciones

    U->>F: Abrir chat
    F->>B: GET /chat/session
    B->>DB: Buscar sesión existente
    DB-->>B: Sesión encontrada/creada
    B-->>F: Datos de sesión
    F-->>U: Mostrar chat

    U->>F: Escribir mensaje
    F->>F: Validar entrada
    F->>B: POST /chat/message
    Note over F,B: {message: "texto", sessionId: "xxx"}

    B->>B: Autenticar usuario
    B->>DB: Guardar mensaje del usuario
    DB-->>B: Mensaje guardado

    B->>AI: POST /ai/process
    Note over B,AI: {message: "texto", context: "datos_usuario", sessionId: "xxx"}

    AI->>AI: Analizar contexto
    AI->>AI: Generar respuesta
    AI->>AI: Validar respuesta
    AI-->>B: Respuesta generada
    Note over AI,B: {response: "respuesta", confidence: 0.95, suggestions: [...]}

    B->>DB: Guardar respuesta del bot
    DB-->>B: Respuesta guardada

    B->>N: Crear notificación (si es necesario)
    N->>DB: Guardar notificación
    DB-->>N: Notificación guardada

    B-->>F: Respuesta completa
    Note over B,F: {message: "respuesta", timestamp: "2024-01-15T10:30:00Z", suggestions: [...]}

    F->>F: Actualizar UI
    F-->>U: Mostrar respuesta

    alt Respuesta requiere acción
        U->>F: Seleccionar sugerencia
        F->>B: POST /chat/action
        Note over F,B: {action: "crear_caso", data: {...}}
        B->>DB: Ejecutar acción
        DB-->>B: Acción completada
        B-->>F: Confirmación
        F-->>U: Mostrar confirmación
    end

    opt Envío de notificación push
        B->>N: Enviar notificación push
        N->>U: Notificación push
    end
```

## Componentes del Sistema

### Frontend (React/Vue.js)
- **Responsabilidades**:
  - Interfaz de usuario del chat
  - Validación de entrada
  - Gestión de estado de la sesión
  - Renderizado de respuestas y sugerencias

### Backend (NestJS)
- **Responsabilidades**:
  - Autenticación y autorización
  - Gestión de sesiones de chat
  - Comunicación con microservicios
  - Persistencia de datos
  - Gestión de notificaciones

### Base de Datos (PostgreSQL)
- **Responsabilidades**:
  - Almacenamiento de mensajes
  - Gestión de sesiones
  - Historial de conversaciones
  - Datos de usuarios y contexto

### Microservicio IA (Python/FastAPI)
- **Responsabilidades**:
  - Procesamiento de lenguaje natural
  - Generación de respuestas
  - Análisis de contexto
  - Sugerencias de acciones
  - Validación de respuestas

### Servicio de Notificaciones
- **Responsabilidades**:
  - Gestión de notificaciones push
  - Notificaciones por email
  - Notificaciones en tiempo real
  - Cola de notificaciones

## Flujo Detallado

### 1. Inicio de Sesión de Chat
1. Usuario abre la interfaz de chat
2. Frontend solicita sesión al backend
3. Backend busca o crea sesión en la base de datos
4. Se devuelve el contexto de la sesión

### 2. Envío de Mensaje
1. Usuario escribe y envía mensaje
2. Frontend valida la entrada
3. Se envía al backend con autenticación
4. Backend guarda el mensaje en la base de datos

### 3. Procesamiento por IA
1. Backend envía mensaje al microservicio de IA
2. IA analiza el contexto y genera respuesta
3. Se valida la respuesta antes de devolverla
4. Backend guarda la respuesta en la base de datos

### 4. Respuesta al Usuario
1. Backend devuelve respuesta completa al frontend
2. Frontend actualiza la interfaz
3. Se muestran sugerencias si las hay

### 5. Acciones Adicionales
1. Usuario puede seleccionar sugerencias
2. Se ejecutan acciones específicas (crear caso, etc.)
3. Se envían notificaciones si es necesario

## Características Técnicas

### Autenticación
- JWT tokens para autenticación
- Validación de sesiones
- Control de acceso por roles

### Persistencia
- Mensajes almacenados con timestamps
- Historial completo de conversaciones
- Contexto de usuario mantenido

### Escalabilidad
- Microservicios independientes
- Cola de mensajes para alta concurrencia
- Cache para respuestas frecuentes

### Seguridad
- Validación de entrada en frontend y backend
- Sanitización de mensajes
- Rate limiting para prevenir spam

## Casos de Uso Específicos

### Consulta de Caso
1. Usuario pregunta sobre su caso
2. IA accede al contexto del usuario
3. Genera respuesta basada en datos reales
4. Sugiere acciones específicas

### Creación de Caso
1. Usuario solicita crear nuevo caso
2. IA guía el proceso paso a paso
3. Se validan los datos ingresados
4. Se crea el caso automáticamente

### Soporte Técnico
1. Usuario tiene problemas técnicos
2. IA identifica el tipo de problema
3. Proporciona soluciones específicas
4. Escala a humano si es necesario

---

# Diagrama de Componentes UML - Arquitectura de la Aplicación

## Descripción
Este diagrama muestra la arquitectura de componentes de la aplicación web, incluyendo el frontend React, backend NestJS, microservicio de chatbot FastAPI y base de datos PostgreSQL.

## Diagrama

```mermaid
graph TB
    subgraph "Cliente Web"
        subgraph "Frontend React"
            UI[Interfaz de Usuario]
            Router[React Router]
            State[Redux/Zustand]
            Components[Componentes React]
            API[API Client]
        end
    end

    subgraph "Servidor Web"
        subgraph "Backend NestJS"
            Auth[Auth Module]
            Users[Users Module]
            Cases[Cases Module]
            Documents[Documents Module]
            Invoices[Invoices Module]
            Chat[Chat Module]
            Notifications[Notifications Module]
            Facturae[Facturae Module]
            External[External Systems Module]
        end
    end

    subgraph "Microservicios"
        subgraph "Chatbot FastAPI"
            NLP[NLP Processor]
            AI[AI Engine]
            Context[Context Manager]
            Response[Response Generator]
            Training[Training Module]
        end
    end

    subgraph "Base de Datos"
        subgraph "PostgreSQL"
            UsersDB[(Users DB)]
            CasesDB[(Cases DB)]
            DocumentsDB[(Documents DB)]
            InvoicesDB[(Invoices DB)]
            ChatDB[(Chat DB)]
            NotificationsDB[(Notifications DB)]
        end
    end

    subgraph "Servicios Externos"
        Email[Email Service]
        Storage[File Storage]
        TSA[TSA Service]
        OCSP[OCSP Service]
        AEAT[AEAT API]
        FACE[FACE API]
    end

    %% Conexiones Frontend
    UI --> Router
    Router --> Components
    Components --> State
    Components --> API
    API --> Auth

    %% Conexiones Backend
    Auth --> Users
    Users --> Cases
    Cases --> Documents
    Cases --> Invoices
    Invoices --> Facturae
    Chat --> External
    External --> Notifications

    %% Conexiones Microservicio
    Chat --> NLP
    NLP --> AI
    AI --> Context
    Context --> Response
    Response --> Training

    %% Conexiones Base de Datos
    Users --> UsersDB
    Cases --> CasesDB
    Documents --> DocumentsDB
    Invoices --> InvoicesDB
    Chat --> ChatDB
    Notifications --> NotificationsDB

    %% Conexiones Servicios Externos
    Notifications --> Email
    Documents --> Storage
    Facturae --> TSA
    Facturae --> OCSP
    External --> AEAT
    External --> FACE

    %% Estilos
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef microservice fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#880e4f,stroke-width:2px

    class UI,Router,State,Components,API frontend
    class Auth,Users,Cases,Documents,Invoices,Chat,Notifications,Facturae,External backend
    class NLP,AI,Context,Response,Training microservice
    class UsersDB,CasesDB,DocumentsDB,InvoicesDB,ChatDB,NotificationsDB database
    class Email,Storage,TSA,OCSP,AEAT,FACE external
```

## Componentes Principales

### Frontend React
- **Interfaz de Usuario**: Componentes principales de la aplicación
- **React Router**: Navegación y enrutamiento
- **Redux/Zustand**: Gestión de estado global
- **Componentes React**: Componentes reutilizables
- **API Client**: Cliente HTTP para comunicación con backend

### Backend NestJS
- **Auth Module**: Autenticación y autorización
- **Users Module**: Gestión de usuarios
- **Cases Module**: Gestión de casos legales
- **Documents Module**: Gestión de documentos
- **Invoices Module**: Gestión de facturas
- **Chat Module**: Gestión de chat y mensajes
- **Notifications Module**: Sistema de notificaciones
- **Facturae Module**: Facturación electrónica
- **External Systems Module**: Integración con sistemas externos

### Microservicio Chatbot FastAPI
- **NLP Processor**: Procesamiento de lenguaje natural
- **AI Engine**: Motor de inteligencia artificial
- **Context Manager**: Gestión de contexto de conversación
- **Response Generator**: Generación de respuestas
- **Training Module**: Entrenamiento del modelo

### Base de Datos PostgreSQL
- **Users DB**: Datos de usuarios y autenticación
- **Cases DB**: Información de casos legales
- **Documents DB**: Metadatos de documentos
- **Invoices DB**: Datos de facturas
- **Chat DB**: Historial de conversaciones
- **Notifications DB**: Notificaciones del sistema

### Servicios Externos
- **Email Service**: Envío de correos electrónicos
- **File Storage**: Almacenamiento de archivos
- **TSA Service**: Servicio de sellos de tiempo
- **OCSP Service**: Validación de certificados
- **AEAT API**: Integración con Agencia Tributaria
- **FACE API**: Integración con FACE

## Arquitectura de Comunicación

### Frontend ↔ Backend
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticación**: JWT Tokens
- **CORS**: Configurado para comunicación segura

### Backend ↔ Microservicio IA
- **Protocolo**: HTTP/HTTPS
- **Formato**: JSON
- **Autenticación**: API Keys
- **Rate Limiting**: Implementado

### Backend ↔ Base de Datos
- **Protocolo**: TCP/IP
- **ORM**: Prisma/TypeORM
- **Connection Pool**: Configurado
- **Migrations**: Automatizadas

### Backend ↔ Servicios Externos
- **Protocolo**: HTTP/HTTPS
- **Autenticación**: API Keys/OAuth
- **Retry Logic**: Implementado
- **Circuit Breaker**: Para alta disponibilidad

## Características de Escalabilidad

### Horizontal Scaling
- **Frontend**: CDN y múltiples instancias
- **Backend**: Load balancer y contenedores
- **Microservicio IA**: Auto-scaling basado en demanda
- **Base de Datos**: Read replicas y sharding

### Vertical Scaling
- **Recursos**: CPU, RAM y almacenamiento
- **Optimización**: Query optimization y caching
- **Monitoring**: Métricas y alertas

## Seguridad

### Autenticación y Autorización
- **JWT Tokens**: Para sesiones de usuario
- **API Keys**: Para comunicación entre servicios
- **Role-based Access**: Control de acceso por roles
- **OAuth 2.0**: Para servicios externos

### Protección de Datos
- **HTTPS**: Comunicación encriptada
- **Data Encryption**: Encriptación de datos sensibles
- **Input Validation**: Validación de entrada
- **SQL Injection Protection**: ORM con parámetros

### Auditoría
- **Logging**: Logs detallados de todas las operaciones
- **Monitoring**: Monitoreo en tiempo real
- **Backup**: Copias de seguridad automáticas
- **Compliance**: Cumplimiento de regulaciones

## Despliegue

### Contenedores
- **Docker**: Contenedores para todos los servicios
- **Docker Compose**: Orquestación local
- **Kubernetes**: Orquestación en producción

### CI/CD
- **GitHub Actions**: Pipeline de integración continua
- **Automated Testing**: Tests automáticos
- **Deployment**: Despliegue automático
- **Rollback**: Capacidad de rollback automático

## Monitoreo y Observabilidad

### Métricas
- **Performance**: Tiempo de respuesta y throughput
- **Availability**: Disponibilidad de servicios
- **Errors**: Tasa de errores y excepciones
- **Business**: Métricas de negocio

### Logging
- **Structured Logging**: Logs estructurados
- **Centralized Logging**: Agregación de logs
- **Log Levels**: Diferentes niveles de logging
- **Log Retention**: Política de retención

### Alerting
- **Real-time Alerts**: Alertas en tiempo real
- **Escalation**: Escalamiento de alertas
- **Dashboard**: Dashboards de monitoreo
- **Health Checks**: Verificaciones de salud

---

# Diagrama de Despliegue UML - Arquitectura de Despliegue

## Descripción
Este diagrama muestra la arquitectura de despliegue de la aplicación web, incluyendo los nodos de despliegue, puertos específicos y la infraestructura necesaria para cada componente.

## Diagrama

```mermaid
graph TB
    subgraph "Internet"
        Client[Cliente Web]
        Mobile[Móvil/Tablet]
    end

    subgraph "Load Balancer"
        LB[Load Balancer<br/>HAProxy/Nginx<br/>:80/:443]
    end

    subgraph "Servidor Web"
        subgraph "Frontend Container"
            React[React App<br/>:5173<br/>Node.js 18]
            ReactBuild[Build Process<br/>Vite/Webpack]
        end
        
        subgraph "Backend Container"
            NestJS[NestJS API<br/>:3000<br/>Node.js 18]
            PM2[PM2 Process Manager]
        end
        
        subgraph "Microservicio Container"
            FastAPI[FastAPI Chatbot<br/>:8000<br/>Python 3.11]
            Uvicorn[Uvicorn Server<br/>Workers: 4]
        end
    end

    subgraph "Base de Datos"
        subgraph "PostgreSQL Container"
            PostgreSQL[PostgreSQL 15<br/>:5432<br/>Primary]
            PGPool[Connection Pool<br/>pgBouncer]
        end
        
        subgraph "Redis Container"
            Redis[Redis Cache<br/>:6379<br/>Session Store]
        end
    end

    subgraph "Almacenamiento"
        subgraph "File Storage"
            MinIO[MinIO S3<br/>:9000<br/>Document Storage]
            Backup[Backup Storage<br/>Automated]
        end
    end

    subgraph "Servicios Externos"
        Email[Email Service<br/>SMTP:587]
        TSA[TSA Service<br/>HTTPS:443]
        OCSP[OCSP Service<br/>HTTPS:443]
        AEAT[AEAT API<br/>HTTPS:443]
        FACE[FACE API<br/>HTTPS:443]
    end

    subgraph "Monitoreo"
        Prometheus[Prometheus<br/>:9090<br/>Metrics]
        Grafana[Grafana<br/>:3001<br/>Dashboards]
        ELK[ELK Stack<br/>Logs]
    end

    %% Conexiones Cliente
    Client --> LB
    Mobile --> LB
    
    %% Conexiones Load Balancer
    LB --> React
    LB --> NestJS
    
    %% Conexiones Frontend
    React --> ReactBuild
    React --> NestJS
    
    %% Conexiones Backend
    NestJS --> PM2
    NestJS --> FastAPI
    NestJS --> PostgreSQL
    NestJS --> Redis
    NestJS --> MinIO
    
    %% Conexiones Microservicio
    FastAPI --> Uvicorn
    FastAPI --> PostgreSQL
    FastAPI --> Redis
    
    %% Conexiones Base de Datos
    PostgreSQL --> PGPool
    
    %% Conexiones Almacenamiento
    NestJS --> Backup
    
    %% Conexiones Servicios Externos
    NestJS --> Email
    NestJS --> TSA
    NestJS --> OCSP
    NestJS --> AEAT
    NestJS --> FACE
    
    %% Conexiones Monitoreo
    NestJS --> Prometheus
    FastAPI --> Prometheus
    PostgreSQL --> Prometheus
    Prometheus --> Grafana
    NestJS --> ELK
    FastAPI --> ELK

    %% Estilos
    classDef client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef loadbalancer fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef frontend fill:#e8f5e8,stroke:#388e3c,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef microservice fill:#fff8e1,stroke:#fbc02d,stroke-width:2px
    classDef database fill:#ffebee,stroke:#d32f2f,stroke-width:2px
    classDef storage fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    classDef monitoring fill:#f1f8e9,stroke:#689f38,stroke-width:2px

    class Client,Mobile client
    class LB loadbalancer
    class React,ReactBuild frontend
    class NestJS,PM2 backend
    class FastAPI,Uvicorn microservice
    class PostgreSQL,PGPool,Redis database
    class MinIO,Backup storage
    class Email,TSA,OCSP,AEAT,FACE external
    class Prometheus,Grafana,ELK monitoring
```

## Componentes de Despliegue

### Cliente Web
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Dispositivos**: Desktop, móvil, tablet
- **Protocolo**: HTTPS (puerto 443)
- **CORS**: Configurado para comunicación segura

### Load Balancer
- **Software**: HAProxy o Nginx
- **Puertos**: 80 (HTTP) y 443 (HTTPS)
- **Funciones**:
  - Distribución de carga
  - Terminación SSL
  - Rate limiting
  - Health checks

### Frontend Container (Puerto 5173)
- **Tecnología**: React 18 con Vite
- **Runtime**: Node.js 18
- **Proceso**: Build estático para producción
- **Recursos**: 512MB RAM, 1 CPU

### Backend Container (Puerto 3000)
- **Tecnología**: NestJS con TypeScript
- **Runtime**: Node.js 18
- **Process Manager**: PM2
- **Recursos**: 1GB RAM, 2 CPU

### Microservicio Container (Puerto 8000)
- **Tecnología**: FastAPI con Python 3.11
- **Server**: Uvicorn con 4 workers
- **Recursos**: 2GB RAM, 2 CPU
- **Dependencias**: TensorFlow, spaCy

### Base de Datos PostgreSQL (Puerto 5432)
- **Versión**: PostgreSQL 15
- **Connection Pool**: pgBouncer
- **Recursos**: 4GB RAM, 4 CPU, 100GB SSD
- **Backup**: Automático diario

### Redis Cache (Puerto 6379)
- **Versión**: Redis 7
- **Uso**: Session store, cache
- **Recursos**: 1GB RAM, 1 CPU
- **Persistencia**: RDB + AOF

### Almacenamiento MinIO (Puerto 9000)
- **Tecnología**: MinIO S3-compatible
- **Uso**: Document storage
- **Recursos**: 2GB RAM, 2 CPU, 500GB SSD
- **Backup**: Replicación automática

## Configuración de Puertos

### Puertos Principales
- **80/443**: Load Balancer (HTTP/HTTPS)
- **5173**: Frontend React (desarrollo)
- **3000**: Backend NestJS
- **8000**: Microservicio FastAPI
- **5432**: PostgreSQL
- **6379**: Redis
- **9000**: MinIO Storage

### Puertos de Monitoreo
- **9090**: Prometheus (métricas)
- **3001**: Grafana (dashboards)
- **5601**: Kibana (logs)
- **9200**: Elasticsearch (logs)

## Configuración de Contenedores

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    image: legal-app-frontend:latest
    ports:
      - "5173:5173"
    environment:
      - NODE_ENV=production
      - VITE_API_URL=http://localhost:3000
    depends_on:
      - backend

  backend:
    image: legal-app-backend:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/legal_db
      - REDIS_URL=redis://redis:6379
      - AI_SERVICE_URL=http://fastapi:8000
    depends_on:
      - postgres
      - redis

  fastapi:
    image: legal-app-fastapi:latest
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:pass@postgres:5432/legal_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=legal_db
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
    environment:
      - MINIO_ROOT_USER=admin
      - MINIO_ROOT_PASSWORD=password
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

## Configuración de Red

### Red Interna
- **Subnet**: 172.20.0.0/16
- **Frontend**: 172.20.1.10
- **Backend**: 172.20.1.20
- **FastAPI**: 172.20.1.30
- **PostgreSQL**: 172.20.2.10
- **Redis**: 172.20.2.20
- **MinIO**: 172.20.2.30

### Firewall
- **Entrada**: Solo puertos 80, 443, 22
- **Interna**: Comunicación libre entre contenedores
- **Salida**: Acceso a servicios externos

## Escalabilidad

### Horizontal Scaling
- **Frontend**: Múltiples instancias detrás del load balancer
- **Backend**: Auto-scaling basado en CPU/memoria
- **FastAPI**: Auto-scaling basado en cola de mensajes
- **PostgreSQL**: Read replicas para consultas

### Vertical Scaling
- **Recursos**: CPU y RAM según demanda
- **Storage**: SSD para mejor rendimiento
- **Network**: Ancho de banda optimizado

## Seguridad

### Contenedores
- **Non-root**: Usuarios no privilegiados
- **Secrets**: Variables de entorno seguras
- **Updates**: Actualizaciones automáticas de seguridad
- **Scanning**: Escaneo de vulnerabilidades

### Red
- **SSL/TLS**: Certificados válidos
- **VPN**: Acceso seguro a servidores
- **WAF**: Web Application Firewall
- **DDoS**: Protección contra ataques

## Monitoreo

### Métricas
- **Prometheus**: Métricas de aplicación y sistema
- **Grafana**: Dashboards en tiempo real
- **Alerting**: Alertas automáticas
- **Health Checks**: Verificaciones de salud

### Logs
- **ELK Stack**: Centralización de logs
- **Structured Logging**: Logs estructurados
- **Retention**: Política de retención
- **Search**: Búsqueda avanzada

## Backup y Recuperación

### Backup Automático
- **Base de Datos**: Diario con retención de 30 días
- **Archivos**: Replicación en tiempo real
- **Configuración**: Backup de configuraciones
- **Testing**: Pruebas de restauración

### Disaster Recovery
- **RTO**: 4 horas máximo
- **RPO**: 1 hora máximo
- **Replicación**: Datos replicados en múltiples zonas
- **Failover**: Automático en caso de fallo

---

# Diagrama de Actividad - Recuperación de Contraseña

## Descripción
Este diagrama muestra el flujo de actividades para la recuperación de contraseña en una aplicación web, incluyendo la notificación por correo electrónico al usuario.

## Diagrama

```mermaid
stateDiagram-v2
    [*] --> SolicitarRecuperacion : Usuario accede a "¿Olvidaste tu contraseña?"
    SolicitarRecuperacion --> IngresarEmail : Mostrar formulario de email
    IngresarEmail --> ValidarEmail : Usuario ingresa email y envía
    ValidarEmail --> EmailValido : Email existe en el sistema
    ValidarEmail --> EmailInvalido : Email no registrado
    EmailInvalido --> MostrarError : Mostrar mensaje de error
    MostrarError --> IngresarEmail
    EmailValido --> GenerarToken : Generar token de recuperación
    GenerarToken --> GuardarToken : Guardar token y expiración en BD
    GuardarToken --> EnviarCorreo : Enviar email con enlace de recuperación
    EnviarCorreo --> EsperarUsuario : Esperar acción del usuario
    EsperarUsuario --> AccesoEnlace : Usuario accede al enlace del email
    AccesoEnlace --> ValidarToken : Validar token y expiración
    ValidarToken --> TokenValido : Token válido
    ValidarToken --> TokenInvalido : Token inválido o expirado
    TokenInvalido --> MostrarErrorToken : Mostrar error de token
    MostrarErrorToken --> [*]
    TokenValido --> MostrarFormularioNuevaPass : Mostrar formulario de nueva contraseña
    MostrarFormularioNuevaPass --> IngresarNuevaPass : Usuario ingresa nueva contraseña
    IngresarNuevaPass --> ValidarNuevaPass : Validar requisitos de contraseña
    ValidarNuevaPass --> PassValida : Contraseña válida
    ValidarNuevaPass --> PassInvalida : Contraseña inválida
    PassInvalida --> MostrarErrorPass : Mostrar error de validación
    MostrarErrorPass --> IngresarNuevaPass
    PassValida --> ActualizarPassword : Actualizar contraseña en BD
    ActualizarPassword --> ConfirmarCambio : Mostrar confirmación de cambio
    ConfirmarCambio --> [*]
```

## Pasos Principales
1. Usuario solicita recuperación de contraseña.
2. Ingresa su email.
3. El sistema valida el email.
4. Si es válido, genera y guarda un token de recuperación.
5. Se envía un correo electrónico con el enlace de recuperación.
6. El usuario accede al enlace, el sistema valida el token.
7. Si es válido, el usuario puede ingresar una nueva contraseña.
8. El sistema valida y actualiza la contraseña.
9. Se muestra confirmación y finaliza el proceso.

## Notas
- El proceso incluye validaciones de email, token y contraseña.
- Los errores se notifican al usuario en cada paso.
- El enlace de recuperación tiene expiración por seguridad.
- El correo electrónico contiene un enlace único y seguro. 