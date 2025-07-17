# Configuración del Sistema de Email

## Descripción

El sistema de email está configurado para enviar confirmaciones automáticas cuando los visitantes programan citas a través del chatbot. El sistema utiliza **Gmail** como proveedor de email.

## Configuración Requerida

### 1. Crear archivo .env

Copia el archivo `experimento/backend/env.example` a `experimento/backend/.env` y configura las siguientes variables:

```bash
# Configuración de Email (Gmail)
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-password-de-aplicacion-gmail"
ADMIN_EMAIL="admin@despachoabogados.com"
```

### 2. Configurar Gmail

#### Paso 1: Habilitar autenticación de 2 factores
1. Ve a tu cuenta de Google
2. Activa la verificación en 2 pasos
3. Ve a "Contraseñas de aplicación"

#### Paso 2: Generar contraseña de aplicación
1. Selecciona "Otra" en el tipo de aplicación
2. Dale un nombre como "Sistema Legal"
3. Copia la contraseña generada (16 caracteres)
4. Usa esta contraseña en `EMAIL_PASSWORD`

### 3. Configurar variables de entorno

```bash
# En experimento/backend/.env
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="abcd efgh ijkl mnop"  # Contraseña de aplicación de Gmail
ADMIN_EMAIL="admin@despachoabogados.com"
```

## Tipos de Emails Enviados

### 1. Email de Confirmación al Visitante
- **Cuándo se envía**: Cuando se crea una cita de visitante
- **Contenido**: Detalles de la cita, próximos pasos, información de contacto
- **Destinatario**: El email del visitante

### 2. Email de Notificación a Administradores
- **Cuándo se envía**: Cuando se crea una cita de visitante
- **Contenido**: Información completa del visitante y la consulta
- **Destinatario**: Email configurado en `ADMIN_EMAIL`

### 3. Email de Cita Confirmada
- **Cuándo se envía**: Cuando un admin/abogado confirma la cita
- **Contenido**: Fecha y hora confirmada, instrucciones
- **Destinatario**: El email del visitante

### 4. Email de Cita Cancelada
- **Cuándo se envía**: Cuando se cancela una cita
- **Contenido**: Motivo de cancelación, opciones para reprogramar
- **Destinatario**: El email del visitante

## Funcionalidades Implementadas

### En el Chatbot (`main_improved.py`)
- Cuando se programa una cita, el chatbot dice: "Te hemos enviado un email de confirmación"
- Los datos se envían al backend para crear la cita
- Se envían automáticamente los emails de confirmación

### En el Backend (`EmailService`)
- `sendVisitorAppointmentConfirmationEmail()`: Email al visitante
- `sendVisitorAppointmentNotificationEmail()`: Email a administradores
- `sendVisitorAppointmentConfirmedEmail()`: Email de confirmación final
- `sendVisitorAppointmentCancelledEmail()`: Email de cancelación

### En el Servicio de Citas (`VisitorAppointmentsService`)
- Automáticamente envía emails cuando se crean, confirman o cancelan citas
- Manejo de errores para que los emails no interrumpan el flujo principal

## Pruebas

### 1. Probar configuración de email
```bash
# En el backend
npm run start:dev
```

### 2. Probar desde el chatbot
1. Inicia el chatbot: `python main_improved.py`
2. Programa una cita a través del chatbot
3. Verifica que lleguen los emails

### 3. Verificar en la base de datos
```sql
SELECT * FROM "VisitorAppointment" ORDER BY "createdAt" DESC LIMIT 5;
```

## Solución de Problemas

### Error: "Invalid login"
- Verifica que `EMAIL_USER` y `EMAIL_PASSWORD` estén correctos
- Asegúrate de usar una contraseña de aplicación, no tu contraseña normal

### Error: "Authentication failed"
- Verifica que la autenticación de 2 factores esté habilitada
- Regenera la contraseña de aplicación

### No llegan los emails
- Verifica la carpeta de spam
- Revisa los logs del backend para errores de email
- Verifica que las variables de entorno estén cargadas

## Seguridad

- Las contraseñas de aplicación son más seguras que las contraseñas normales
- Los emails no contienen información sensible
- Los errores de email no interrumpen el funcionamiento del sistema
- Los logs de errores ayudan a diagnosticar problemas

## Personalización

### Cambiar proveedor de email
En `EmailService`, modifica la configuración del transporter:

```typescript
// Para Outlook
this.transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Para SMTP personalizado
this.transporter = nodemailer.createTransporter({
  host: 'smtp.tuproveedor.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Personalizar plantillas de email
Los templates HTML están en cada método del `EmailService`. Puedes modificar:
- Colores y estilos
- Información de contacto
- Logo y branding
- Contenido específico del despacho 