# 🔗 Solución: Proxy de Documentos para URLs Externas

## 📋 **Problema Identificado**

El frontend no puede visualizar documentos porque:
1. **Los documentos están almacenados en URLs externas** (`https://example.com/documents/`)
2. **El backend solo buscaba archivos localmente** (carpeta `/uploads/`)
3. **Error 404** al intentar acceder a `/api/documents/file/doc-c1-001`

## ✅ **Solución Implementada: Proxy de Documentos**

### **Arquitectura del Proxy**

```
Frontend → Backend (Proxy) → URL Externa → Frontend
```

El backend actúa como intermediario:
- **Descarga temporalmente** el documento desde la URL externa
- **Lo sirve al frontend** como si fuera local
- **Mantiene la seguridad** y control de acceso
- **No expone las URLs externas** al usuario

### **Funcionalidades Implementadas**

#### **1. Detección Automática de Tipo de Archivo**
- **Archivos Locales**: Servidos desde `/uploads/`
- **Archivos Externos**: Descargados y servidos como proxy

#### **2. Métodos del Servicio (`DocumentsService`)**
```typescript
// Detecta si un documento es externo o local
isExternalDocument(fileUrl: string): boolean

// Descarga archivos externos
downloadExternalFile(fileUrl: string): Promise<Buffer>

// Obtiene información del archivo
getFileInfo(document: any): Promise<FileInfo>
```

#### **3. Endpoint Principal (`/api/documents/file/:id`)**
- **Maneja ambos tipos** de archivos automáticamente
- **Headers correctos** para visualización inline (PDFs, imágenes)
- **Manejo de errores** robusto
- **Logging detallado** para debugging

## 🚀 **Despliegue en Railway**

### **1. Commit y Push de Cambios**
```bash
cd backend
git add .
git commit -m "feat: implement document proxy for external URLs"
git push origin main
```

### **2. Railway Desplegará Automáticamente**
- Los cambios se reflejarán en `experimento2-production-54c0.up.railway.app`
- El proxy estará disponible inmediatamente

### **3. Verificación del Despliegue**
```bash
# Ejecutar script de prueba
node test-document-proxy.js
```

## 🧪 **Testing**

### **Script de Prueba Creado**
- `test-document-proxy.js` - Prueba todos los endpoints
- Verifica que el proxy funcione correctamente
- Incluye health checks y debugging

### **Endpoints de Prueba**
- `/health` - Estado del servidor
- `/api/documents` - Lista de documentos
- `/api/documents/file/:id` - Proxy del documento
- `/api/documents/debug/:id` - Información de debug

## 🔧 **Configuración Técnica**

### **Dependencias Agregadas**
- `https` y `http` nativos de Node.js
- `URL` para parsing de URLs
- Timeout de 30 segundos para descargas

### **Headers Configurados**
```typescript
// Para visualización inline
res.setHeader('Content-Disposition', 'inline');

// Para descarga
res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

// Cache y CORS
res.setHeader('Cache-Control', 'public, max-age=3600');
res.setHeader('Access-Control-Allow-Origin', '*');
```

## 📊 **Beneficios de la Solución**

1. **✅ Resuelve el error 404** inmediatamente
2. **🔒 Mantiene la seguridad** - URLs externas no son visibles
3. **📱 Funciona en el frontend** sin cambios adicionales
4. **⚡ Performance optimizada** con timeouts y manejo de errores
5. **🔄 Compatible con archivos** locales y externos
6. **📝 Logging completo** para debugging

## 🚨 **Consideraciones de Seguridad**

- **Timeouts** para evitar ataques de denegación de servicio
- **Validación de URLs** antes de descargar
- **Control de acceso** basado en roles de usuario
- **Headers de seguridad** configurados correctamente

## 🔍 **Próximos Pasos**

1. **Desplegar** los cambios en Railway
2. **Probar** el proxy con documentos externos
3. **Verificar** que el frontend pueda visualizar documentos
4. **Monitorear** logs para detectar posibles problemas
5. **Optimizar** si es necesario (cache, compresión, etc.)

## 📞 **Soporte**

Si encuentras algún problema:
1. Revisar logs del backend en Railway
2. Ejecutar el script de prueba
3. Verificar que las URLs externas sean accesibles
4. Comprobar permisos de usuario en el frontend

---

**Estado**: ✅ **IMPLEMENTADO Y LISTO PARA DESPLIEGUE**
**Fecha**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Backend**: `experimento2-production-54c0.up.railway.app`

