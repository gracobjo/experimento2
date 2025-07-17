# 📊 Diagramas Mermaid para Notion

## Diagrama de Casos de Uso

```mermaid
graph TD
    A[Usuario] --> B[Iniciar Sesión]
    B --> C{Verificar Rol}
    
    C -->|ADMIN| D[Panel Administración]
    C -->|ABOGADO| E[Panel Abogado]
    C -->|CLIENTE| F[Panel Cliente]
    
    D --> D1[Gestionar Usuarios]
    D --> D2[Configurar Parámetros]
    D --> D3[Ver Reportes]
    D --> D4[Gestionar Menús]
    
    E --> E1[Gestionar Casos]
    E --> E2[Emitir Facturas]
    E --> E3[Chat con Clientes]
    E --> E4[Teleasistencia]
    E --> E5[Gestionar Documentos]
    E --> E6[Ver Citas]
    
    F --> F1[Consultar Mis Casos]
    F --> F2[Chat con Abogado]
    F --> F3[Solicitar Teleasistencia]
    F --> F4[Ver Documentos]
    F --> F5[Ver Facturas]
    
    E1 --> G[Crear Caso]
    E1 --> H[Editar Caso]
    E1 --> I[Cerrar Caso]
    
    E2 --> J[Generar Factura XML]
    E2 --> K[Descargar PDF]
    
    E3 --> L[Enviar Mensaje]
    E3 --> M[Recibir Mensaje]
    
    E4 --> N[Iniciar Sesión Remota]
    E4 --> O[Registrar Notas]
    
    F2 --> P[Seleccionar Abogado]
    F2 --> Q[Enviar Mensaje]
    
    F3 --> R[Crear Solicitud]
    F3 --> S[Esperar Aceptación]
```

## Modelo de Datos (ERD)

```mermaid
erDiagram
    User {
        string id PK
        string name
        string email UK
        string password
        enum role
        string resetPasswordToken
        datetime resetPasswordExpires
        datetime createdAt
        datetime updatedAt
    }
    
    Client {
        string id PK
        string userId FK
        string dni UK
        string phone
        string address
        datetime createdAt
    }
    
    Lawyer {
        string id PK
        string userId FK
        string colegiado UK
        string phone
        string address
        datetime createdAt
    }
    
    Expediente {
        string id PK
        string title
        string description
        enum status
        string clientId FK
        string lawyerId FK
        datetime createdAt
    }
    
    Document {
        string id PK
        string expedienteId FK
        string filename
        string fileUrl
        datetime uploadedAt
        string description
        int fileSize
        string mimeType
        string originalName
        string uploadedBy FK
    }
    
    Invoice {
        string id PK
        string numeroFactura UK
        datetime fechaFactura
        string tipoFactura
        string emisorId FK
        string receptorId FK
        string expedienteId FK
        float importeTotal
        float baseImponible
        float cuotaIVA
        float tipoIVA
        float descuento
        float retencion
        boolean aplicarIVA
        string regimenIvaEmisor
        string claveOperacion
        string metodoPago
        datetime fechaOperacion
        string xml
        string xmlFirmado
        string estado
        string motivoAnulacion
        datetime selloTiempo
        datetime createdAt
        datetime updatedAt
    }
    
    InvoiceItem {
        string id PK
        string invoiceId FK
        string description
        int quantity
        float unitPrice
        float total
    }
    
    ProvisionFondos {
        string id PK
        string clientId FK
        string expedienteId FK
        string invoiceId FK
        float amount
        datetime date
        string description
        datetime createdAt
        datetime updatedAt
    }
    
    Appointment {
        string id PK
        string clientId FK
        string lawyerId FK
        datetime date
        string location
        string notes
    }
    
    ChatMessage {
        string id PK
        string content
        string senderId FK
        string receiverId FK
        datetime createdAt
    }
    
    Task {
        string id PK
        string title
        string description
        datetime dueDate
        string priority
        string status
        string expedienteId FK
        string clientId FK
        string assignedTo FK
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    
    Parametro {
        string id PK
        string clave UK
        string valor
        string etiqueta
        string tipo
        datetime updatedAt
    }
    
    Contact {
        string id PK
        string nombre
        string email
        string telefono
        string asunto
        string mensaje
        string ip
        string userAgent
        datetime createdAt
        datetime updatedAt
    }
    
    TeleassistanceSession {
        string id PK
        string userId FK
        string assistantId FK
        string issueType
        string description
        string remoteTool
        string status
        string sessionCode UK
        string resolution
        string notes
        datetime startedAt
        datetime completedAt
        int duration
        datetime createdAt
        datetime updatedAt
    }
    
    TeleassistanceMessage {
        string id PK
        string sessionId FK
        string senderId FK
        string content
        string messageType
        datetime createdAt
    }
    
    MenuConfig {
        string id PK
        string name
        enum role
        string orientation
        boolean isActive
        datetime createdAt
        datetime updatedAt
    }
    
    MenuItem {
        string id PK
        string menuConfigId FK
        string label
        string url
        string icon
        int order
        boolean isVisible
        boolean isExternal
        string parentId FK
        datetime createdAt
        datetime updatedAt
    }
    
    SiteConfig {
        string id PK
        string key UK
        string value
        string type
        string category
        string description
        boolean isPublic
        datetime createdAt
        datetime updatedAt
    }
    
    Layout {
        string id PK
        string name
        string slug UK
        json components
        int version
        boolean isActive
        string createdBy FK
        datetime createdAt
        datetime updatedAt
    }
    
    User ||--o{ Client : "has"
    User ||--o{ Lawyer : "has"
    User ||--o{ Expediente : "manages"
    User ||--o{ Document : "uploads"
    User ||--o{ Invoice : "issues"
    User ||--o{ Invoice : "receives"
    User ||--o{ Appointment : "books"
    User ||--o{ ChatMessage : "sends"
    User ||--o{ ChatMessage : "receives"
    User ||--o{ Task : "assigned"
    User ||--o{ Task : "creates"
    User ||--o{ TeleassistanceSession : "participates"
    User ||--o{ TeleassistanceSession : "assists"
    User ||--o{ TeleassistanceMessage : "sends"
    User ||--o{ Layout : "creates"
    
    Client ||--o{ Expediente : "has"
    Client ||--o{ ProvisionFondos : "has"
    Client ||--o{ Appointment : "books"
    Client ||--o{ Task : "related"
    
    Lawyer ||--o{ Expediente : "manages"
    
    Expediente ||--o{ Document : "contains"
    Expediente ||--o{ Invoice : "related"
    Expediente ||--o{ Task : "related"
    Expediente ||--o{ ProvisionFondos : "related"
    
    Invoice ||--o{ InvoiceItem : "includes"
    Invoice ||--o{ ProvisionFondos : "related"
    
    TeleassistanceSession ||--o{ TeleassistanceMessage : "has"
    
    MenuConfig ||--o{ MenuItem : "contains"
    MenuItem ||--o{ MenuItem : "parent-child"
```

## Diagrama de Arquitectura del Sistema

```mermaid
graph TB
    subgraph "Frontend (React + Vite)"
        A[App.tsx]
        B[Components]
        C[Pages]
        D[Hooks]
        E[Context]
    end
    
    subgraph "Backend (NestJS)"
        F[Controllers]
        G[Services]
        H[Guards]
        I[DTOs]
        J[WebSocket Gateway]
    end
    
    subgraph "Base de Datos"
        K[PostgreSQL]
        L[Prisma ORM]
    end
    
    subgraph "Servicios Externos"
        M[Email Service]
        N[File Storage]
        O[Payment Gateway]
    end
    
    A --> F
    B --> F
    C --> F
    D --> F
    E --> F
    
    F --> G
    G --> L
    L --> K
    
    J --> G
    A --> J
    
    G --> M
    G --> N
    G --> O
    
    style A fill:#61dafb
    style F fill:#e0234e
    style K fill:#336791
    style J fill:#ff6b35
```

## Diagrama de Flujo de Autenticación

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as Base de Datos
    
    U->>F: Iniciar Sesión
    F->>B: POST /auth/login
    B->>DB: Verificar credenciales
    DB-->>B: Usuario válido
    B-->>F: JWT Token
    F->>F: Guardar token en localStorage
    F-->>U: Redirigir al dashboard
    
    Note over U,F: Navegación protegida
    U->>F: Acceder a ruta protegida
    F->>B: GET /protected-route (con JWT)
    B->>B: Verificar JWT
    B-->>F: Datos de la ruta
    F-->>U: Mostrar contenido
```

## Diagrama de Flujo de Chat en Tiempo Real

```mermaid
sequenceDiagram
    participant U1 as Usuario 1
    participant F1 as Frontend 1
    participant WS as WebSocket Server
    participant F2 as Frontend 2
    participant U2 as Usuario 2
    
    U1->>F1: Abrir chat
    F1->>WS: Conectar WebSocket
    WS-->>F1: Conexión establecida
    
    U2->>F2: Abrir chat
    F2->>WS: Conectar WebSocket
    WS-->>F2: Conexión establecida
    
    U1->>F1: Enviar mensaje
    F1->>WS: emit('send_message')
    WS->>WS: Procesar mensaje
    WS->>F2: emit('new_message')
    F2-->>U2: Mostrar mensaje
    
    U2->>F2: Enviar respuesta
    F2->>WS: emit('send_message')
    WS->>WS: Procesar mensaje
    WS->>F1: emit('new_message')
    F1-->>U1: Mostrar mensaje
```

---

## Instrucciones para usar en Notion:

1. **Copia el bloque de código** que empieza con ```mermaid
2. **En Notion**, escribe `/code` y selecciona el bloque Code
3. **Pega el código** y cambia el lenguaje a `mermaid`
4. **Instala una extensión** como "Notion Enhancer" para ver los diagramas renderizados

---

**¡Listo! Ahora tienes todos los diagramas principales listos para copiar y pegar en Notion.** 