# 📧 Pruebas del Sistema de Correos de Confirmación de Citas

## 🎯 Objetivo

Este directorio contiene scripts y herramientas para probar el sistema de correos de confirmación de citas que se envía automáticamente cuando los visitantes programan citas a través del chatbot.

## 📋 Funcionalidades Implementadas

### ✅ Sistema Completo de Correos

1. **Email de Confirmación al Visitante**
   - Se envía automáticamente cuando se crea una cita
   - Contiene detalles de la cita y próximos pasos
   - Diseño profesional con HTML responsive

2. **Email de Notificación a Administradores**
   - Se envía a los administradores del despacho
   - Contiene información completa del visitante
   - Incluye enlaces para contactar al visitante

3. **Email de Cita Confirmada**
   - Se envía cuando un admin confirma la cita
   - Contiene fecha y hora confirmada
   - Instrucciones específicas para la cita

4. **Email de Cita Cancelada**
   - Se envía cuando se cancela una cita
   - Incluye motivo y opciones para reprogramar

## 🛠️ Scripts de Prueba

### 1. `setup_email_system.py`
**Configuración rápida del sistema de correos**

```bash
python setup_email_system.py
```

**Funciones:**
- Verifica la configuración actual
- Guía en la configuración de Gmail
- Crea archivos de configuración necesarios
- Genera script de prueba personalizado

### 2. `test_email_system.py`
**Prueba directa del sistema de correos**

```bash
python test_email_system.py
```

**Funciones:**
- Crea una cita directamente en el backend
- Verifica el envío automático de correos
- Comprueba que la cita se guarda en la base de datos
- Proporciona feedback detallado

### 3. `test_chatbot_email.py`
**Prueba completa del chatbot con correos**

```bash
python test_chatbot_email.py
```

**Funciones:**
- Simula una conversación completa del chatbot
- Prueba el flujo completo de agendamiento
- Verifica el envío de correos automático
- Comprueba la integración chatbot-backend

## 🔧 Configuración Requerida

### 1. Variables de Entorno

Crea un archivo `.env` en el directorio del chatbot:

```env
# Configuración de prueba para el sistema de correos
BACKEND_URL=http://localhost:3000
CHATBOT_URL=http://localhost:8000
TEST_EMAIL=tu-email@ejemplo.com
```

### 2. Configuración del Backend

En `experimento/backend/.env`:

```env
# Configuración de Email (Gmail)
EMAIL_USER="tu-email@gmail.com"
EMAIL_PASSWORD="tu-password-de-aplicacion-gmail"
ADMIN_EMAIL="admin@despachoabogados.com"
```

### 3. Configuración de Gmail

1. **Habilitar autenticación de 2 factores**
   - Ve a tu cuenta de Google
   - Activa la verificación en 2 pasos

2. **Generar contraseña de aplicación**
   - Ve a "Contraseñas de aplicación"
   - Selecciona "Otra" en el tipo de aplicación
   - Dale un nombre como "Sistema Legal"
   - Copia la contraseña generada (16 caracteres)

## 🚀 Flujo de Pruebas

### Paso 1: Configuración
```bash
# Configurar sistema de correos
python setup_email_system.py

# Crear archivo .env con tu email de prueba
echo "TEST_EMAIL=tu-email@ejemplo.com" > .env
```

### Paso 2: Iniciar Servicios
```bash
# Terminal 1: Backend
cd ../backend
npm run start:dev

# Terminal 2: Chatbot
cd ../chatbot
python main_improved.py
```

### Paso 3: Ejecutar Pruebas
```bash
# Prueba directa del sistema de correos
python test_email_system.py

# Prueba completa del chatbot
python test_chatbot_email.py
```

## 📧 Verificación de Correos

### Emails que Deberías Recibir

1. **Email de Confirmación al Visitante**
   - **Asunto:** "Confirmación de Cita - Despacho de Abogados"
   - **Contenido:** Detalles de la cita, próximos pasos, información de contacto

2. **Email de Notificación a Administradores**
   - **Asunto:** "Nueva Cita de Visitante: [Nombre]"
   - **Contenido:** Información completa del visitante y la consulta

### Verificación en Gmail

1. **Revisa la bandeja de entrada**
2. **Revisa la carpeta de spam**
3. **Verifica que los emails lleguen correctamente**
4. **Comprueba que los enlaces funcionen**

## 🔍 Solución de Problemas

### Error: "No se puede conectar al backend"
```bash
# Verificar que el backend esté ejecutándose
curl http://localhost:3000/health

# Iniciar el backend si no está ejecutándose
cd ../backend
npm run start:dev
```

### Error: "No se puede conectar al chatbot"
```bash
# Verificar que el chatbot esté ejecutándose
curl http://localhost:8000/health

# Iniciar el chatbot si no está ejecutándose
python main_improved.py
```

### Error: "Invalid login" en Gmail
1. Verifica que `EMAIL_USER` y `EMAIL_PASSWORD` estén correctos
2. Asegúrate de usar una contraseña de aplicación, no tu contraseña normal
3. Verifica que la autenticación de 2 factores esté habilitada

### No llegan los correos
1. **Revisa la carpeta de spam**
2. **Verifica la configuración de Gmail**
3. **Revisa los logs del backend:**
   ```bash
   cd ../backend
   npm run start:dev
   # Busca errores de email en la consola
   ```

### Error: "Authentication failed"
1. Regenera la contraseña de aplicación en Gmail
2. Verifica que la autenticación de 2 factores esté habilitada
3. Actualiza `EMAIL_PASSWORD` en el archivo `.env`

## 📊 Logs y Monitoreo

### Logs del Backend
```bash
cd ../backend
npm run start:dev
# Los errores de email aparecerán en la consola
```

### Logs del Chatbot
```bash
python main_improved.py
# Los errores de conexión aparecerán en la consola
```

### Verificar Base de Datos
```sql
-- Verificar citas creadas
SELECT * FROM "VisitorAppointment" ORDER BY "createdAt" DESC LIMIT 5;

-- Verificar estado de las citas
SELECT "fullName", "email", "status", "createdAt" 
FROM "VisitorAppointment" 
WHERE "email" = 'tu-email@ejemplo.com';
```

## 🎯 Próximos Pasos

### Después de las Pruebas Exitosas

1. **Confirmar Cita desde el Panel de Administración**
   - Accede al panel de administración
   - Busca la cita creada
   - Confirma la fecha y hora
   - Verifica que llegue el email de confirmación final

2. **Probar Diferentes Escenarios**
   - Cancelar una cita
   - Reprogramar una cita
   - Probar con diferentes tipos de consulta

3. **Personalizar Plantillas de Email**
   - Editar `experimento/backend/src/auth/email.service.ts`
   - Modificar colores, logos, información de contacto
   - Adaptar al branding del despacho

## 📚 Documentación Relacionada

- `experimento/EMAIL_CONFIGURATION.md` - Configuración detallada
- `experimento/EMAIL_IMPLEMENTATION_SUMMARY.md` - Resumen de implementación
- `experimento/backend/src/auth/email.service.ts` - Servicio de correos
- `experimento/backend/src/appointments/visitor-appointments.service.ts` - Servicio de citas

## 🤝 Soporte

Si encuentras problemas:

1. Revisa los logs del backend y chatbot
2. Verifica la configuración de Gmail
3. Comprueba las variables de entorno
4. Consulta la documentación relacionada
5. Revisa los ejemplos de configuración en `experimento/documentacion/ejemplos-env.md` 