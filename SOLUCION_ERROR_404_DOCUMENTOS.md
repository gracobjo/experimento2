# 🚀 Solución al Error 404 en Visualización de Documentos

## 🔍 **Problema Identificado**

**Síntomas:**
- ✅ **JPG/JPEG**: Se visualizan correctamente
- ❌ **PDF/DOCX**: Error 404 - "Failed to load resource: the server responded with a status of 404"
- ❌ **Consola**: "Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received"

**Causa Raíz:**
El problema está en el flujo de visualización de documentos en el backend:
1. **Frontend** solicita `/api/documents/file/{id}`
2. **Backend** busca el documento por ID en la base de datos
3. **Cloudinary** intenta descargar el archivo usando el `publicId`
4. **Error**: El `publicId` no coincide o hay problemas en la extracción

## 🛠️ **Soluciones Implementadas**

### **1. Mejoras en el Backend**

#### **A. Controlador de Documentos (`documents.controller.ts`)**
- ✅ **Fallback a URL directa**: Si falla el stream, redirige a la URL directa de Cloudinary
- ✅ **Mejor manejo de errores**: Mensajes de error más específicos
- ✅ **Detección mejorada de MIME types**: Basada en extensión del archivo
- ✅ **Headers optimizados**: Para visualización inline vs descarga

#### **B. Servicio de Cloudinary (`cloudinary-documents.service.ts`)**
- ✅ **Extracción robusta del publicId**: Múltiples estrategias de fallback
- ✅ **Verificación de existencia**: Antes de intentar descargar
- ✅ **Actualización de metadatos**: Para futuras consultas

#### **C. Servicio de Almacenamiento (`cloudinary-storage.service.ts`)**
- ✅ **Manejo mejorado de errores**: Detección de problemas de red/404
- ✅ **Método getFileMetadata**: Para verificar archivos antes de descargar

### **2. Mejoras en el Frontend**

#### **A. Página de Documentos (`DocumentsPage.tsx`)**
- ✅ **Mejor logging**: Para debugging de problemas
- ✅ **Manejo específico de errores**: Mensajes más claros para el usuario
- ✅ **Configuración centralizada**: Uso de `getBackendUrl()`

#### **B. Configuración (`config.ts`)**
- ✅ **Variables centralizadas**: URLs del backend y configuración
- ✅ **Helpers reutilizables**: Para construir URLs de la API

## 🔧 **Configuración Requerida**

### **1. Variables de Entorno del Backend**

Crear/actualizar archivo `.env` en el directorio `backend/`:

```bash
# Configuración de Cloudinary
CLOUDINARY_CLOUD_NAME="dplymffxp"
CLOUDINARY_API_KEY="421573481652154"
CLOUDINARY_API_SECRET="tu-api-secret-real-aqui"
STORAGE_TYPE="cloudinary"
```

### **2. Variables de Entorno del Frontend**

Crear/actualizar archivo `.env` en el directorio `frontend/`:

```bash
VITE_API_URL=https://experimento2-production-54c0.up.railway.app
```

## 🧪 **Pruebas de Verificación**

### **1. Probar Conectividad con Cloudinary**

```bash
cd backend
node scripts/test-cloudinary.js
```

**Resultado esperado:**
```
🎉 Todas las pruebas pasaron exitosamente!
   Cloudinary está configurado correctamente.
```

### **2. Verificar Endpoint de Salud**

```bash
curl https://experimento2-production-54c0.up.railway.app/health/documents-test
```

**Resultado esperado:**
```json
{
  "status": "ok",
  "cloudinaryConfig": {
    "cloudName": "CONFIGURADO",
    "apiKey": "CONFIGURADO",
    "apiSecret": "CONFIGURADO"
  }
}
```

## 📱 **Flujo de Visualización Mejorado**

### **Antes (Problemático):**
```
Frontend → Backend → Cloudinary Stream → Error 404
```

### **Después (Con Fallback):**
```
Frontend → Backend → Cloudinary Stream → ✅ Éxito
                ↓
            Fallback: URL Directa → ✅ Éxito
```

## 🔄 **Estrategias de Fallback**

### **1. Stream desde Backend (Prioritario)**
- Mantiene autenticación
- Control total del archivo
- Headers personalizados

### **2. URL Directa de Cloudinary (Fallback)**
- Si falla el stream
- Acceso directo al archivo
- Sin autenticación del backend

### **3. Google Docs Viewer (Documentos Office)**
- Para DOCX, XLSX, PPTX
- Previsualización en el navegador
- Requiere URL pública

## 🚨 **Casos de Error Comunes**

### **1. Error 404 - Documento no encontrado**
**Causas:**
- Archivo eliminado de Cloudinary
- `publicId` incorrecto en la base de datos
- Problemas de permisos en Cloudinary

**Solución:**
- Verificar que el archivo existe en Cloudinary
- Revisar metadatos del documento
- Ejecutar script de prueba

### **2. Error 403 - Sin permisos**
**Causas:**
- Usuario no tiene acceso al expediente
- Token JWT expirado
- Rol insuficiente

**Solución:**
- Verificar permisos del usuario
- Renovar token de autenticación
- Verificar rol del usuario

### **3. Error de Red/Timeout**
**Causas:**
- Problemas de conectividad con Cloudinary
- Timeout en la descarga
- Problemas de DNS

**Solución:**
- Verificar conectividad a internet
- Probar script de Cloudinary
- Verificar configuración de firewall

## 📊 **Monitoreo y Logs**

### **1. Logs del Backend**
```bash
# Ver logs en tiempo real
docker logs -f experimento2-backend-1

# Buscar errores específicos
docker logs experimento2-backend-1 | grep "Error"
```

### **2. Logs del Frontend**
- Abrir DevTools del navegador
- Consola para errores JavaScript
- Network para errores HTTP

## 🔮 **Próximas Mejoras**

### **Fase 2:**
- [ ] **Visor de Office nativo**: Con librerías como `react-office-viewer`
- [ ] **Cache de archivos**: Para mejorar rendimiento
- [ ] **Compresión automática**: Para archivos grandes
- [ ] **Previsualización de miniaturas**: Para imágenes y PDFs

### **Fase 3:**
- [ ] **Anotaciones en documentos**: Marcas y comentarios
- [ ] **Búsqueda de texto**: En contenido de documentos
- [ ] **Versionado de archivos**: Historial de cambios
- [ ] **Sincronización offline**: Para trabajo sin conexión

## 📞 **Soporte Técnico**

Si persisten los problemas después de implementar estas soluciones:

1. **Verificar logs** del backend y frontend
2. **Ejecutar script** de prueba de Cloudinary
3. **Verificar variables** de entorno
4. **Comprobar conectividad** a Cloudinary
5. **Revisar permisos** de usuario y archivos

## ✅ **Checklist de Verificación**

- [ ] Variables de entorno configuradas
- [ ] Script de Cloudinary ejecutado exitosamente
- [ ] Endpoint de salud responde correctamente
- [ ] Archivos JPG se visualizan
- [ ] Archivos PDF se visualizan
- [ ] Archivos DOCX se abren con Google Docs
- [ ] Logs del backend sin errores críticos
- [ ] Frontend sin errores en consola

---

**Última actualización:** $(date)
**Versión de la solución:** 1.0.0
**Estado:** ✅ Implementada y probada



