# Configuración de Almacenamiento Persistente

## 🚀 Implementación de AWS S3 + PostgreSQL

### Arquitectura Recomendada:
```
Frontend → Backend → AWS S3 (archivos) + PostgreSQL (metadatos)
```

### Ventajas:
- ✅ **Archivos persistentes** entre deploys de Railway
- ✅ **Escalable** y económico
- ✅ **Metadatos en PostgreSQL** (rápido)
- ✅ **CDN global** para descargas rápidas
- ✅ **Fallback automático** a almacenamiento local

## 🔧 Variables de Entorno Requeridas

Agrega estas variables a tu archivo `.env` o configuración de Railway:

```bash
# Storage Configuration
STORAGE_TYPE="hybrid" # Options: 'local', 's3', 'hybrid'

# AWS S3 Configuration
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="tu-access-key-id"
AWS_SECRET_ACCESS_KEY="tu-secret-access-key"
AWS_S3_BUCKET_NAME="experimento2-documents"

# Local Storage Configuration (fallback)
UPLOAD_DIR="uploads"
MAX_FILE_SIZE="5242880" # 5MB en bytes
```

## 🏗️ Pasos de Implementación

### 1. Crear Bucket S3 en AWS
```bash
# Usar AWS CLI o consola web
aws s3 mb s3://experimento2-documents
aws s3api put-bucket-policy --bucket experimento2-documents --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::experimento2-documents/*"
    }
  ]
}'
```

### 2. Configurar Usuario IAM
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::experimento2-documents",
        "arn:aws:s3:::experimento2-documents/*"
      ]
    }
  ]
}
```

### 3. Instalar Dependencias
```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 📊 Tipos de Almacenamiento

### **Local (Actual)**
- ❌ **Archivos se pierden** en cada deploy
- ✅ **Rápido** para desarrollo
- ❌ **No escalable**

### **S3 (Recomendado)**
- ✅ **Archivos persistentes** entre deploys
- ✅ **Escalable** y económico
- ✅ **CDN global** disponible
- ❌ **Requiere configuración** inicial

### **Híbrido (Mejor opción)**
- ✅ **S3 como principal**, local como fallback
- ✅ **Transición suave** sin interrupciones
- ✅ **Resiliente** a fallos de S3

## 🔄 Migración de Datos

### Opción 1: Re-subir archivos
- Los usuarios suben nuevamente sus documentos
- Funciona inmediatamente
- Requiere acción del usuario

### Opción 2: Migración automática
- Script que migra archivos existentes a S3
- Transparente para el usuario
- Requiere desarrollo adicional

## 💰 Costos Estimados

### AWS S3 (us-east-1):
- **Almacenamiento**: $0.023 por GB/mes
- **Transferencia**: $0.09 por GB (salida)
- **Peticiones**: $0.0004 por 1,000 peticiones GET

### Ejemplo para 100GB de documentos:
- **Almacenamiento**: $2.30/mes
- **Transferencia (100GB)**: $9.00/mes
- **Total estimado**: $11.30/mes

## 🚀 Próximos Pasos

1. **Crear cuenta AWS** y bucket S3
2. **Configurar variables** de entorno
3. **Probar upload/download** con S3
4. **Migrar archivos** existentes
5. **Configurar CDN** para mejor rendimiento

## 🔍 Monitoreo y Mantenimiento

### Métricas a monitorear:
- Uso de almacenamiento S3
- Costos mensuales
- Tiempo de respuesta de descargas
- Errores de acceso a archivos

### Alertas recomendadas:
- Costos excedan $50/mes
- Errores de S3 > 1%
- Tiempo de respuesta > 5s












