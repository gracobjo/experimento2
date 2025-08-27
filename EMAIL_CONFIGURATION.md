# 📧 Configuración de Email Gmail - Sistema Legal

## 🎯 **Propósito**
Este documento explica cómo configurar el servicio de email Gmail para que funcione tanto en el **backend** como en el **chatbot** de la aplicación.

## 🔧 **Variables de Entorno Necesarias**

### **Backend (Railway)**
```env
# Configuración principal de Email Gmail
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-contraseña-de-aplicacion
ADMIN_EMAIL=admin@tu-dominio.com

# Configuración alternativa (para compatibilidad)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

### **Chatbot (Railway)**
```env
# Configuración de Email para Chatbot
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña-de-aplicacion
```

## 📋 **Pasos para Configurar Gmail**

### **1. Habilitar Verificación en Dos Pasos**
1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. **Seguridad** → **Verificación en dos pasos**
3. **Activa** la verificación en dos pasos si no está activada

### **2. Generar Contraseña de Aplicación**
1. **Seguridad** → **Verificación en dos pasos** → **Contraseñas de aplicación**
2. **Selecciona "Correo"** como aplicación
3. **Genera** una contraseña de 16 caracteres
4. **Copia** esa contraseña (es tu `EMAIL_PASSWORD`)

### **3. Configurar en Railway**

#### **Backend:**
1. Ve a tu proyecto en Railway: https://railway.app/
2. **Selecciona tu servicio backend**
3. **Variables** → **New Variable**
4. Agrega cada variable:

```env
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=abc123def456ghi789
ADMIN_EMAIL=admin@tu-dominio.com
```

#### **Chatbot:**
1. **Selecciona tu servicio chatbot**
2. **Variables** → **New Variable**
3. Agrega cada variable:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=abc123def456ghi789
```

## 📧 **Tipos de Emails que se Envían**

### **Backend:**
- ✅ **Recuperación de contraseña** - Cuando un usuario solicita reset
- ✅ **Notificación de contacto** - Cuando alguien envía un mensaje por el formulario web
- ✅ **Confirmación de contacto** - Email de confirmación al usuario que envió el mensaje

### **Chatbot:**
- ✅ **Notificaciones de chat** - Cuando el chatbot necesita enviar información por email
- ✅ **Resúmenes de conversación** - Si se implementa esta funcionalidad

## 🚨 **Problemas Comunes y Soluciones**

### **Error: "Invalid login"**
- **Causa**: Contraseña de aplicación incorrecta
- **Solución**: Regenera la contraseña de aplicación en Google

### **Error: "Connection timeout"**
- **Causa**: Variables de entorno no configuradas
- **Solución**: Verifica que `EMAIL_USER` y `EMAIL_PASSWORD` estén en Railway

### **Error: "Authentication failed"**
- **Causa**: Verificación en dos pasos no activada
- **Solución**: Activa la verificación en dos pasos en tu cuenta de Google

### **Error: "Rate limit exceeded"**
- **Causa**: Demasiados emails en poco tiempo
- **Solución**: Gmail permite máximo 500 emails por día para cuentas gratuitas

## 🔍 **Verificación de Configuración**

### **Backend:**
1. Ve a Railway y revisa los logs
2. Busca el mensaje: `[EMAIL] ✅ Configuración de email detectada: tu-email@gmail.com`
3. Si ves: `[EMAIL] ⚠️ Variables de email no configuradas`, las variables no están configuradas

### **Chatbot:**
1. Revisa los logs del chatbot en Railway
2. Busca mensajes relacionados con SMTP o email

## 📝 **Ejemplo de Configuración Completa**

```env
# Backend - Railway
EMAIL_USER=despacho.legal@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
ADMIN_EMAIL=admin@despacholegal.com

# Chatbot - Railway  
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=despacho.legal@gmail.com
SMTP_PASS=abcd efgh ijkl mnop
```

## ⚠️ **Notas de Seguridad**

1. **NUNCA** uses tu contraseña principal de Gmail
2. **SÍEMPRE** usa contraseñas de aplicación
3. **NO** compartas las variables de entorno
4. **ROTA** las contraseñas de aplicación periódicamente

## 🆘 **Soporte**

Si tienes problemas con la configuración de email:

1. Verifica que las variables estén en Railway
2. Revisa los logs del backend/chatbot
3. Confirma que la verificación en dos pasos esté activada
4. Regenera la contraseña de aplicación si es necesario

---

**Última actualización**: $(Get-Date -Format "dd/MM/yyyy HH:mm")
**Versión**: 1.0
