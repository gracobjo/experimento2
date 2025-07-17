# Despliegue del Frontend

## 📁 Ubicación
**Carpeta:** `experimento/frontend/deployment/`

## 🎯 Archivos de Despliegue

### 📋 Lista de Archivos
- **[Dockerfile](./Dockerfile)** - Configuración de Docker para contenedorización
- **[package.json](./package.json)** - Dependencias y scripts de producción
- **[package-lock.json](./package-lock.json)** - Lock de dependencias exactas

## 🚀 Métodos de Despliegue

### 🐳 Docker (Recomendado)

#### 📋 Prerrequisitos
- Docker instalado
- Docker Compose (opcional)

#### 🔧 Configuración
```bash
# Construir imagen
docker build -t frontend-app .

# Ejecutar contenedor
docker run -p 3000:3000 frontend-app
```

#### 📝 Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - VITE_API_URL=http://backend:3000
      - VITE_CHATBOT_URL=http://chatbot:5000
```

### ☁️ Despliegue en la Nube

#### 🚀 Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

#### 🌊 Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

#### ☁️ AWS S3 + CloudFront
```bash
# Build de producción
npm run build

# Subir a S3
aws s3 sync dist/ s3://tu-bucket

# Invalidar CloudFront
aws cloudfront create-invalidation --distribution-id E123456789 --paths "/*"
```

## 🔧 Configuración de Entornos

### 🏠 Desarrollo Local
```bash
# Variables de entorno
VITE_API_URL=http://localhost:3000
VITE_CHATBOT_URL=http://localhost:5000
VITE_ENV=development

# Ejecutar
npm run dev
```

### 🧪 Staging
```bash
# Variables de entorno
VITE_API_URL=https://staging-api.tudominio.com
VITE_CHATBOT_URL=https://staging-chatbot.tudominio.com
VITE_ENV=staging

# Build
npm run build:staging
```

### 🏭 Producción
```bash
# Variables de entorno
VITE_API_URL=https://api.tudominio.com
VITE_CHATBOT_URL=https://chatbot.tudominio.com
VITE_ENV=production

# Build
npm run build
```

## 📦 Scripts de Despliegue

### 🔨 Build de Producción
```bash
# Build optimizado
npm run build

# Build con análisis
npm run build:analyze

# Build para staging
npm run build:staging
```

### 🧪 Testing de Despliegue
```bash
# Test de build
npm run test:build

# Test de producción
npm run test:prod

# Lighthouse CI
npm run lighthouse
```

### 🔍 Análisis de Bundle
```bash
# Análisis de tamaño
npm run analyze

# Análisis de dependencias
npm run deps:check
```

## 🐳 Configuración Docker

### 📝 Dockerfile Optimizado
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 🔧 Nginx Configuration
```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🔒 Seguridad

### 🛡️ Headers de Seguridad
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'"
    }
  }
});
```

### 🔐 Variables de Entorno
```bash
# .env.production
VITE_API_URL=https://api.tudominio.com
VITE_CHATBOT_URL=https://chatbot.tudominio.com
VITE_ENV=production
VITE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

## 📊 Monitoreo

### 📈 Métricas de Performance
- **Lighthouse Score:** > 90
- **Bundle Size:** < 500KB
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s

### 🔍 Herramientas de Monitoreo
- **Lighthouse CI:** Análisis automático
- **Bundle Analyzer:** Análisis de bundle
- **Web Vitals:** Métricas de Core Web Vitals

## 🚨 Troubleshooting

### 🔧 Problemas Comunes

#### Build Falla
```bash
# Limpiar cache
npm run clean
rm -rf node_modules
npm install

# Verificar dependencias
npm audit
npm outdated
```

#### Docker Build Falla
```bash
# Limpiar imágenes
docker system prune -a

# Reconstruir sin cache
docker build --no-cache -t frontend-app .
```

#### Performance Issues
```bash
# Analizar bundle
npm run analyze

# Optimizar imágenes
npm run optimize:images

# Verificar lazy loading
npm run check:lazy
```

## 🔗 Enlaces Útiles

### 📚 Documentación
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Configuration](https://nginx.org/en/docs/)

### 🛠️ Herramientas
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)
- [Docker Hub](https://hub.docker.com/)

---

**Última actualización:** Diciembre 2024  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo Frontend 