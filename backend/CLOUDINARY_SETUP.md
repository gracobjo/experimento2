# 🚀 Configuración de Cloudinary para experimento2

## ✅ **Credenciales de tu cuenta:**

Basándome en tu consola de Cloudinary, estas son tus credenciales:

```bash
CLOUDINARY_CLOUD_NAME="dplymffxp"
CLOUDINARY_API_KEY="421573481652154"
CLOUDINARY_API_SECRET="TU_API_SECRET_AQUI"  # Obtener de 'View API Keys'
```

## 🔧 **Paso 1: Obtener tu API Secret**

1. En tu consola de Cloudinary, haz clic en **"View API Keys"**
2. Copia tu **API Secret** (es la clave más larga)
3. Reemplaza `TU_API_SECRET_AQUI` con tu clave real

## 🔧 **Paso 2: Configurar Variables en Railway**

Ve a tu proyecto en Railway y agrega estas variables de entorno:

```bash
CLOUDINARY_CLOUD_NAME=dplymffxp
CLOUDINARY_API_KEY=421573481652154
CLOUDINARY_API_SECRET=tu_api_secret_real_aqui
STORAGE_TYPE=cloudinary
```

## 🔧 **Paso 3: Verificar Instalación**

Cloudinary ya está instalado en tu backend. Verifica que aparezca en `package.json`.

## 🎯 **Próximos Pasos:**

1. **Obtener API Secret** de tu consola
2. **Configurar variables** en Railway
3. **Probar upload** de archivos
4. **Verificar descargas** funcionando

## 📱 **Tu Dashboard de Cloudinary:**

- **URL**: https://console.cloudinary.com/app/c-81389ccecdf259653ba4355f60f30b/image/getting-started
- **Cloud Name**: dplymffxp
- **API Key**: 421573481652154
- **API Secret**: [Obtener de 'View API Keys']

## 🚀 **Beneficios Inmediatos:**

- ✅ **25GB almacenamiento GRATIS**
- ✅ **CDN global** para descargas rápidas
- ✅ **Archivos persistentes** entre deploys
- ✅ **No más errores 404** por archivos perdidos




