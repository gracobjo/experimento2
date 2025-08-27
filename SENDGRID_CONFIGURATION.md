# 📧 Configuración de SendGrid para Railway

## 🎯 **¿Por qué SendGrid?**

**SendGrid es la mejor opción para Railway** porque:
- ✅ **No tiene problemas de timeout** como Gmail
- ✅ **API REST** en lugar de SMTP (más confiable)
- ✅ **Mejor tasa de entrega** en entornos cloud
- ✅ **Sin restricciones de firewall** de Railway

## 🚀 **Paso 1: Crear Cuenta en SendGrid**

1. **Ir a:** [https://sendgrid.com/](https://sendgrid.com/)
2. **Crear cuenta gratuita** (100 emails/día gratis)
3. **Verificar tu dominio** o usar el dominio de SendGrid

## 🔑 **Paso 2: Obtener API Key**

1. **Dashboard → Settings → API Keys**
2. **Create API Key**
3. **Full Access** o **Restricted Access** (Mail Send)
4. **Copiar la API Key** generada

## ⚙️ **Paso 3: Configurar Variables en Railway**

### **Variables Requeridas:**

```bash
# OBLIGATORIO para SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# OPCIONAL - Email de origen
FROM_EMAIL=noreply@tudominio.com

# OPCIONAL - Email del admin
ADMIN_EMAIL=admin@tudominio.com
```

### **Cómo Configurar en Railway:**

1. **Ir a tu proyecto en Railway**
2. **Variables → New Variable**
3. **Agregar cada variable** con su valor

## 🔄 **Paso 4: Fallback Automático**

**El sistema está configurado para:**
1. **Intentar SendGrid primero** (recomendado)
2. **Si falla, usar Gmail** (fallback)
3. **Si ambos fallan, deshabilitar email**

## 🧪 **Paso 5: Probar la Configuración**

### **Endpoint de Prueba:**
```
GET /api/contact/test-email
```

### **Respuesta Esperada:**
```json
{
  "message": "Prueba de conexión SMTP completada",
  "smtpConnection": "✅ CONECTADO",
  "emailConfigured": true,
  "variables": {
    "hasEmailUser": false,
    "hasEmailPassword": false,
    "hasAdminEmail": true
  }
}
```

## 📊 **Logs que Verás:**

### **Con SendGrid Configurado:**
```
[EMAIL] ✅ Configuración de SendGrid detectada
[EMAIL] 📧 Email de origen configurado: noreply@tudominio.com
[EMAIL] 🔍 Verificando conexión SendGrid...
[EMAIL] ✅ API Key de SendGrid configurada correctamente
[EMAIL] 📧 Enviando email con SendGrid...
[EMAIL] ✅ Email enviado exitosamente con SendGrid
```

### **Sin SendGrid (Fallback a Gmail):**
```
[EMAIL] ⚠️ Variable SENDGRID_API_KEY no configurada
[EMAIL] 🔄 Fallback a Gmail configurado: tu-email@gmail.com
[EMAIL] 🔧 Configurando Gmail con timeouts extendidos para Railway...
```

## 🚨 **Solución de Problemas:**

### **Error: "SENDGRID_API_KEY no configurada"**
- **Verificar** que la variable esté en Railway
- **Reiniciar** el servicio después de agregar variables

### **Error: "API Key inválida"**
- **Regenerar** la API Key en SendGrid
- **Verificar** permisos de la API Key

### **Error: "Dominio no verificado"**
- **Verificar** tu dominio en SendGrid
- **Usar** dominio de SendGrid temporalmente

## 💡 **Ventajas de SendGrid:**

1. **Sin timeouts** - API REST es más rápida
2. **Mejor entrega** - Optimizado para emails transaccionales
3. **Analytics** - Seguimiento de apertura y clics
4. **Escalable** - De 100 a millones de emails/día
5. **Confiable** - 99.9% de uptime garantizado

## 🔗 **Enlaces Útiles:**

- **SendGrid Dashboard:** [https://app.sendgrid.com/](https://app.sendgrid.com/)
- **Documentación API:** [https://sendgrid.com/docs/](https://sendgrid.com/docs/)
- **Verificación de Dominio:** [https://sendgrid.com/docs/ui/account-and-settings/how-to-set-up-domain-authentication/](https://sendgrid.com/docs/ui/account-and-settings/how-to-set-up-domain-authentication/)

---

**¿Necesitas ayuda con algún paso específico?** 🚀
