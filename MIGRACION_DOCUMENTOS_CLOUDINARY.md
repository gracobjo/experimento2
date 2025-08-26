# 🔄 Migración de Documentos a Cloudinary

## 📋 **Resumen del Problema**

Tu aplicación ha migrado de almacenamiento local a **Cloudinary**, pero la base de datos PostgreSQL sigue conteniendo referencias a las URLs antiguas. Esto causa errores 500 al intentar visualizar documentos.

## 🔍 **Estado Actual**

### **Almacenamiento:**
- ✅ **Cloudinary**: `https://res.cloudinary.com/dplymffxp/image/u...`
- ❌ **PostgreSQL**: URLs antiguas que ya no funcionan

### **Documentos Identificados:**
- `Demanda laboral` - ID: `8-33i41c`
- `Documento A` - ID: `8-33i41c`
- `Documento B` - ID: `8-33i41c`
- `prueba pdf` - ID: `expedientes/9c6df72e-969d-4...`
- `Contrato de compraventa` - ID: `8-33i41c`

## 🚀 **Solución: Migración Automática**

### **Scripts Creados:**

1. **`check-document-status.js`** - Verifica estado actual
2. **`migrate-documents-to-cloudinary.js`** - Ejecuta la migración

## 📋 **Pasos para la Migración**

### **Paso 1: Verificar Estado Actual**
```bash
# En Railway
railway run node scripts/check-document-status.js
```

**Resultado Esperado:**
```
📊 RESUMEN POR CATEGORÍA:
  ☁️  Cloudinary: X documentos
  🔗 Almacenamiento antiguo: 5 documentos
  ❌ Sin URL: 0 documentos
  📋 Total: 5 documentos
```

### **Paso 2: Ejecutar Migración**
```bash
# En Railway
railway run node scripts/migrate-documents-to-cloudinary.js
```

**Resultado Esperado:**
```
🔄 Iniciando migración a Cloudinary...
✅ Migrado: Demanda laboral
   Antes: [URL antigua]
   Después: https://res.cloudinary.com/dplymffxp/image/upload/v1/documents/...

🎯 Resumen de migración:
  - Migrados: 5
  - Saltados: 0
  - Total procesados: 5
```

### **Paso 3: Verificar Migración**
```bash
# En Railway
railway run node scripts/check-document-status.js
```

**Resultado Esperado:**
```
📊 RESUMEN POR CATEGORÍA:
  ☁️  Cloudinary: 5 documentos
  🔗 Almacenamiento antiguo: 0 documentos
  ❌ Sin URL: 0 documentos
  📋 Total: 5 documentos

✅ ESTADO ÓPTIMO:
   Todos los documentos están en Cloudinary
```

## 🔧 **Configuración Requerida**

### **Variables de Entorno en Railway:**
```env
# Base de datos
DATABASE_URL=postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway
DATABASE_PUBLIC_URL=postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway

# Cloudinary (si no están configuradas)
CLOUDINARY_CLOUD_NAME=dplymffxp
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

## 📊 **Estructura de URLs Generadas**

### **Formato:**
```
https://res.cloudinary.com/dplymffxp/image/upload/v1/documents/{ID}_{filename}
```

### **Ejemplos:**
- **Antes**: `expedientes/9c6df72e-969d-4...`
- **Después**: `https://res.cloudinary.com/dplymffxp/image/upload/v1/documents/9c6df72e969d4_prueba.pdf`

## 🛡️ **Seguridad y Backup**

### **Backup Automático:**
- Se crea `document-urls-backup.json` antes de la migración
- Contiene todas las URLs originales
- Timestamp de la migración

### **Rollback:**
Si algo sale mal, puedes restaurar desde el backup:
```bash
# Restaurar URLs originales
railway run node scripts/restore-from-backup.js
```

## 🎯 **Beneficios de la Migración**

### **✅ Después de la Migración:**
- Documentos accesibles desde cualquier lugar
- URLs públicas y estables
- Mejor rendimiento de carga
- Escalabilidad automática
- CDN global de Cloudinary

### **❌ Antes de la Migración:**
- URLs que no funcionan
- Errores 500 al visualizar
- Documentos inaccesibles
- Referencias rotas en la base de datos

## 🔍 **Verificación en el Frontend**

### **Antes de la Migración:**
```
❌ Error 500: Error interno del servidor
GET https://experimento2-production-54c0.up.railway.app/api/documents/file/doc-c1-002
```

### **Después de la Migración:**
```
✅ Documento cargado correctamente
📄 Visualizando: documentoB.pdf
```

## 🚨 **Posibles Problemas y Soluciones**

### **Problema 1: "Document not found"**
**Causa:** URL no migrada correctamente
**Solución:** Verificar migración y ejecutar nuevamente

### **Problema 2: "Invalid Cloudinary URL"**
**Causa:** Formato de URL incorrecto
**Solución:** Verificar configuración de Cloudinary

### **Problema 3: "Database connection failed"**
**Causa:** Variables de entorno incorrectas
**Solución:** Verificar `DATABASE_URL` en Railway

## 📱 **Comandos de Railway**

### **Verificar Estado:**
```bash
railway run node scripts/check-document-status.js
```

### **Ejecutar Migración:**
```bash
railway run node scripts/migrate-documents-to-cloudinary.js
```

### **Verificar Logs:**
```bash
railway logs
```

## 🎉 **Resultado Final Esperado**

### **Base de Datos:**
- ✅ Todos los documentos tienen URLs de Cloudinary
- ✅ URLs son accesibles públicamente
- ✅ Referencias consistentes

### **Frontend:**
- ✅ Visualización de documentos funciona
- ✅ Sin errores 500
- ✅ URLs estables y confiables

### **Backend:**
- ✅ Endpoints de documentos funcionan
- ✅ Sin errores de archivo no encontrado
- ✅ Respuestas consistentes

## 💡 **Recomendaciones Post-Migración**

1. **Monitorear** logs de Railway para errores
2. **Verificar** que todos los documentos sean accesibles
3. **Probar** subida de nuevos documentos
4. **Configurar** variables de Cloudinary si no están
5. **Documentar** el nuevo flujo de almacenamiento

---

**⚠️ Importante**: La migración es **irreversible** una vez ejecutada. Asegúrate de que el backup se haya creado correctamente antes de proceder.

**🚀 Próximo Paso**: Ejecutar `check-document-status.js` para verificar el estado actual antes de la migración.


