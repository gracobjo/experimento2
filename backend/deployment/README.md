# Despliegue del Backend

## 📁 Ubicación
**Carpeta:** `experimento/backend/deployment/`

## 🎯 Propósito
Esta carpeta contiene todos los archivos necesarios para el despliegue del backend en diferentes entornos.

## 📋 Archivos de Despliegue

### 🐳 Docker
- **[Dockerfile](./Dockerfile)** - Configuración de contenedor Docker
  - Imagen base de Node.js
  - Instalación de dependencias
  - Configuración del entorno
  - Exposición de puertos
  - Comando de inicio

### 📦 Gestión de Dependencias
- **[package.json](./package.json)** - Configuración del proyecto Node.js
  - Dependencias del proyecto
  - Scripts de automatización
  - Configuración de build
  - Metadatos del proyecto

- **[package-lock.json](./package-lock.json)** - Lock de dependencias
  - Versiones exactas de paquetes
  - Hashes de seguridad
  - Reproducibilidad del entorno

### 🔒 Control de Versiones
- **[.gitignore](./.gitignore)** - Archivos ignorados por Git
  - Archivos temporales
  - Dependencias
  - Logs
  - Archivos de configuración sensibles

## 🚀 Cómo Desplegar

### Usando Docker
```bash
# Construir imagen
docker build -f deployment/Dockerfile -t backend .

# Ejecutar contenedor
docker run -p 3000:3000 backend

# Con variables de entorno
docker run -p 3000:3000 -e DATABASE_URL=your_db_url backend
```

### Usando Node.js Directo
```bash
# Instalar dependencias
npm install

# O usando yarn
yarn install

# Ejecutar en desarrollo
npm run start:dev

# Ejecutar en producción
npm run start:prod
```

### Usando PM2
```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicación
pm2 start deployment/package.json

# Monitorear
pm2 monit
```

## 📝 Detalles de Configuración

### Dockerfile
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

**Características:**
- Imagen base ligera (Alpine)
- Instalación optimizada de dependencias
- Exposición del puerto 3000
- Comando de inicio configurado

### package.json
```json
{
  "name": "legal-management-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main"
  },
  "dependencies": {
    "@nestjs/core": "^10.0.0",
    "@nestjs/common": "^10.0.0"
  }
}
```

**Características:**
- Scripts de automatización
- Dependencias de producción
- Configuración de build
- Metadatos del proyecto

## 🔧 Configuración de Entornos

### Desarrollo
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp ../config/env.example .env

# Ejecutar en modo desarrollo
npm run start:dev
```

### Producción
```bash
# Usar Docker
docker build -f deployment/Dockerfile -t backend-prod .
docker run -d -p 3000:3000 backend-prod

# O usar Node.js directo
npm run build
npm run start:prod
```

### Testing
```bash
# Instalar dependencias de desarrollo
npm install

# Ejecutar tests
npm run test
npm run test:e2e
```

## 📊 Monitoreo y Logs

### Logs de Docker
```bash
# Ver logs del contenedor
docker logs backend-container

# Seguir logs en tiempo real
docker logs -f backend-container
```

### Logs de Node.js
```bash
# Redirigir salida a archivo
npm run start:prod > backend.log 2>&1

# Usar PM2 para logging
pm2 logs backend
```

## 🔍 Verificación de Despliegue

### Verificar Contenedor
```bash
# Verificar que el contenedor está corriendo
docker ps | grep backend

# Verificar logs
docker logs backend-container

# Verificar puerto
netstat -tulpn | grep 3000
```

### Verificar Aplicación
```bash
# Verificar endpoint de salud
curl http://localhost:3000/health

# Verificar API
curl http://localhost:3000/api/v1/users
```

## 🛠️ Mantenimiento

### Actualizar Dependencias
```bash
# Actualizar package.json
npm update

# Actualizar package-lock.json
npm install

# Verificar vulnerabilidades
npm audit
```

### Backup de Configuración
```bash
# Backup de archivos de despliegue
tar -czf deployment-backup-$(date +%Y%m%d).tar.gz deployment/

# Backup de configuración
cp -r config/ config-backup-$(date +%Y%m%d)/
```

## 📋 Checklist de Despliegue

### Antes del Despliegue
- [ ] Verificar que todos los tests pasan
- [ ] Actualizar versiones de dependencias
- [ ] Configurar variables de entorno
- [ ] Hacer backup de configuración actual
- [ ] Verificar compatibilidad de versiones

### Durante el Despliegue
- [ ] Construir imagen Docker (si aplica)
- [ ] Instalar dependencias
- [ ] Configurar entorno
- [ ] Iniciar aplicación
- [ ] Verificar logs de inicio

### Después del Despliegue
- [ ] Verificar que la aplicación responde
- [ ] Ejecutar tests de integración
- [ ] Verificar logs de errores
- [ ] Monitorear rendimiento
- [ ] Documentar cambios

## 🔄 Automatización

### Scripts de Despliegue
```bash
#!/bin/bash
# deploy.sh
echo "Iniciando despliegue del backend..."
docker build -f deployment/Dockerfile -t backend .
docker stop backend-container || true
docker rm backend-container || true
docker run -d --name backend-container -p 3000:3000 backend
echo "Despliegue completado"
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy-backend.yml
name: Deploy Backend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -f deployment/Dockerfile -t backend .
      - name: Deploy to server
        run: ./deploy.sh
```

## 📊 Métricas de Despliegue

### Rendimiento
- **Tiempo de build:** ~2-3 minutos
- **Tamaño de imagen:** ~200MB
- **Tiempo de inicio:** ~30 segundos
- **Uso de memoria:** ~100MB

### Disponibilidad
- **Uptime objetivo:** 99.9%
- **Tiempo de recuperación:** <5 minutos
- **Backup automático:** Diario
- **Monitoreo:** 24/7

---

**Última actualización:** Diciembre 2024  
**Total archivos:** 4 archivos de despliegue  
**Estado:** Organizados y documentados 