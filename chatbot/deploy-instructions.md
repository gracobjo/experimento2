# 🚀 Instrucciones de Despliegue del Chatbot

## 📋 **Configuración CORS Actualizada**

El chatbot ahora lee la variable de entorno `CORS_ORIGIN` para configurar CORS dinámicamente.

## 🔧 **Variables de Entorno Requeridas en Railway:**

```bash
CORS_ORIGIN=https://experimento2-fenm.vercel.app,experimento2-production-54c0.up.railway.app,https://experimento2-production-54c0.up.railway.app,http://localhost:5173,http://localhost:3000
BACKEND_URL=https://experimento2-production-54c0.up.railway.app
FRONTEND_URL=https://experimento2-fenm.vercel.app
```

## 🚀 **Pasos para Desplegar:**

### 1. **Commit y Push de los Cambios:**
```bash
git add .
git commit -m "Fix CORS configuration - dynamic CORS_ORIGIN support"
git push origin main
```

### 2. **Verificar Variables en Railway:**
- Ir a tu proyecto del chatbot en Railway
- En la pestaña "Variables"
- Asegurarte de que `CORS_ORIGIN` tenga el valor correcto
- Agregar `BACKEND_URL` si no existe

### 3. **Reiniciar el Servicio:**
- En Railway, ir a la pestaña "Deployments"
- Hacer click en "Deploy" para forzar un nuevo despliegue

## 🧪 **Verificar Funcionamiento:**

### **Endpoint de Prueba CORS:**
```bash
GET https://tu-chatbot.up.railway.app/test-cors
```

**Respuesta esperada:**
```json
{
  "message": "CORS test successful",
  "timestamp": "2025-01-27T...",
  "cors_origins": "https://experimento2-fenm.vercel.app,experimento2-production-54c0.up.railway.app,...",
  "allowed_origins": ["https://experimento2-fenm.vercel.app", "experimento2-production-54c0.up.railway.app", ...]
}
```

### **Endpoint de Chat:**
```bash
POST https://tu-chatbot.up.railway.app/chat
Content-Type: application/json

{
  "text": "Hola",
  "language": "es"
}
```

## 🔍 **Solución de Problemas:**

### **Si CORS sigue fallando:**
1. Verificar que `CORS_ORIGIN` esté configurado en Railway
2. Verificar que el dominio del frontend esté incluido en `CORS_ORIGIN`
3. Reiniciar el servicio después de cambiar variables
4. Verificar logs en Railway para errores

### **Logs esperados al iniciar:**
```
[CORS] Configurando con dominios: ['https://experimento2-fenm.vercel.app', 'experimento2-production-54c0.up.railway.app', ...]
```

## ✅ **Verificación Final:**

1. ✅ **Backend principal** funcionando
2. ✅ **Frontend** conectándose sin errores CORS
3. ✅ **Chatbot** con CORS configurado dinámicamente
4. ✅ **Sistema completo** operativo

## 🎯 **Próximo Paso:**

Después del despliegue, el chatbot debería funcionar sin errores CORS desde el frontend de Vercel.
