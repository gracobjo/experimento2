# 🚀 Guía de Despliegue en Producción

## 📋 Requisitos del Servidor

### Especificaciones Mínimas Recomendadas:
- **CPU**: 2 cores
- **RAM**: 4GB
- **Almacenamiento**: 20GB SSD
- **Sistema Operativo**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### Software Requerido:
- **Node.js**: 18.x LTS
- **Python**: 3.8+
- **PostgreSQL**: 12+
- **Nginx**: 1.18+
- **PM2**: Para gestión de procesos Node.js
- **Supervisor**: Para gestión de procesos Python
- **Certbot**: Para certificados SSL

## 🏗️ Preparación del Servidor

### 1. Actualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git build-essential
```

### 2. Instalar Node.js
```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar instalación
node --version
npm --version
```

### 3. Instalar Python
```bash
sudo apt install -y python3 python3-pip python3-venv
sudo apt install -y python3-dev libpq-dev

# Verificar instalación
python3 --version
pip3 --version
```

### 4. Instalar PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib

# Iniciar y habilitar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar contraseña para postgres
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'tu_password_seguro';"
```

### 5. Instalar Nginx
```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 6. Instalar PM2 y Supervisor
```bash
# PM2 para Node.js
sudo npm install -g pm2

# Supervisor para Python
sudo apt install -y supervisor
```

## 🗄️ Configuración de Base de Datos

### 1. Crear Base de Datos
```sql
sudo -u postgres psql

CREATE DATABASE despacho_abogados_prod;
CREATE USER despacho_user WITH PASSWORD 'password_super_seguro';
GRANT ALL PRIVILEGES ON DATABASE despacho_abogados_prod TO despacho_user;
GRANT ALL ON SCHEMA public TO despacho_user;
\q
```

### 2. Configurar PostgreSQL para Producción
```bash
sudo nano /etc/postgresql/*/main/postgresql.conf
```

Añadir/modificar:
```conf
# Configuración de rendimiento
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Configuración de seguridad
listen_addresses = 'localhost'
max_connections = 100
```

```bash
sudo nano /etc/postgresql/*/main/pg_hba.conf
```

Añadir:
```conf
# Configuración de autenticación
local   all             postgres                                peer
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

```bash
sudo systemctl restart postgresql
```

## 📦 Despliegue de la Aplicación

### 1. Clonar Repositorio
```bash
cd /var/www
sudo git clone <URL_REPOSITORIO> despacho-legal
sudo chown -R $USER:$USER despacho-legal
cd despacho-legal
```

### 2. Configurar Backend
```bash
cd backend

# Instalar dependencias
npm install --production

# Configurar variables de entorno
cp .env.example .env
nano .env
```

Configurar `.env`:
```env
# Base de datos
DATABASE_URL="postgresql://despacho_user:password_super_seguro@localhost:5432/despacho_abogados_prod"

# JWT
JWT_SECRET="tu_jwt_secret_super_seguro_y_largo_para_produccion"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="tu-email@gmail.com"
SMTP_PASS="tu-app-password"

# Servidor
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN="https://tu-dominio.com"
```

```bash
# Configurar Prisma
npx prisma generate
npx prisma migrate deploy

# Construir aplicación
npm run build
```

### 3. Configurar Frontend
```bash
cd ../frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
nano .env
```

Configurar `.env`:
```env
VITE_API_URL=https://api.tu-dominio.com
VITE_CHATBOT_URL=https://chatbot.tu-dominio.com
VITE_APP_NAME="Despacho Legal"
```

```bash
# Construir para producción
npm run build
```

### 4. Configurar Chatbot
```bash
cd ../chatbot

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
nano .env
```

Configurar `.env`:
```env
DATABASE_URL="postgresql://despacho_user:password_super_seguro@localhost:5432/despacho_abogados_prod"
API_KEY="tu_api_key_segura"
CORS_ORIGINS="https://tu-dominio.com"
```

## ⚙️ Configuración de Procesos

### 1. Configurar PM2 para Backend
```bash
cd /var/www/despacho-legal/backend

# Crear archivo de configuración PM2
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'despacho-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/backend-error.log',
    out_file: '/var/log/pm2/backend-out.log',
    log_file: '/var/log/pm2/backend-combined.log',
    time: true
  }]
};
```

```bash
# Crear directorio de logs
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Configurar Supervisor para Chatbot
```bash
sudo nano /etc/supervisor/conf.d/despacho-chatbot.conf
```

```ini
[program:despacho-chatbot]
command=/var/www/despacho-legal/chatbot/venv/bin/python /var/www/despacho-legal/chatbot/main_improved.py
directory=/var/www/despacho-legal/chatbot
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/supervisor/chatbot-error.log
stdout_logfile=/var/log/supervisor/chatbot-out.log
environment=PYTHONPATH="/var/www/despacho-legal/chatbot"
```

```bash
sudo mkdir -p /var/log/supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start despacho-chatbot
```

## 🌐 Configuración de Nginx

### 1. Configurar Backend API
```bash
sudo nano /etc/nginx/sites-available/despacho-api
```

```nginx
server {
    listen 80;
    server_name api.tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Configuración para WebSockets
    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Configurar Frontend
```bash
sudo nano /etc/nginx/sites-available/despacho-frontend
```

```nginx
server {
    listen 80;
    server_name tu-dominio.com www.tu-dominio.com;
    root /var/www/despacho-legal/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para archivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Configuración de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 3. Configurar Chatbot
```bash
sudo nano /etc/nginx/sites-available/despacho-chatbot
```

```nginx
server {
    listen 80;
    server_name chatbot.tu-dominio.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. Habilitar Sitios
```bash
sudo ln -s /etc/nginx/sites-available/despacho-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/despacho-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/despacho-chatbot /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Configuración SSL con Let's Encrypt

### 1. Instalar Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obtener Certificados SSL
```bash
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com
sudo certbot --nginx -d api.tu-dominio.com
sudo certbot --nginx -d chatbot.tu-dominio.com
```

### 3. Configurar Renovación Automática
```bash
sudo crontab -e
```

Añadir:
```bash
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔧 Configuración de Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 5432/tcp  # PostgreSQL (solo si es necesario acceso externo)
sudo ufw enable
```

## 📊 Monitoreo y Logs

### 1. Configurar Logs Centralizados
```bash
sudo mkdir -p /var/log/despacho
sudo chown -R www-data:www-data /var/log/despacho
```

### 2. Configurar Logrotate
```bash
sudo nano /etc/logrotate.d/despacho
```

```
/var/log/despacho/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### 3. Monitoreo con PM2
```bash
# Ver estado de procesos
pm2 status
pm2 monit

# Ver logs
pm2 logs despacho-backend
```

## 🚀 Comandos de Despliegue

### Script de Despliegue Automático
```bash
nano deploy.sh
```

```bash
#!/bin/bash

echo "🚀 Iniciando despliegue..."

# Pull de cambios
git pull origin main

# Backend
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 restart despacho-backend

# Frontend
cd ../frontend
npm install
npm run build

# Chatbot
cd ../chatbot
source venv/bin/activate
pip install -r requirements.txt
sudo supervisorctl restart despacho-chatbot

# Recargar Nginx
sudo systemctl reload nginx

echo "✅ Despliegue completado!"
```

```bash
chmod +x deploy.sh
```

## 🔍 Verificación del Despliegue

### 1. Verificar Servicios
```bash
# Verificar PM2
pm2 status

# Verificar Supervisor
sudo supervisorctl status

# Verificar Nginx
sudo systemctl status nginx

# Verificar PostgreSQL
sudo systemctl status postgresql
```

### 2. Verificar URLs
```bash
# Frontend
curl -I https://tu-dominio.com

# API
curl -I https://api.tu-dominio.com/health

# Chatbot
curl -I https://chatbot.tu-dominio.com/docs
```

### 3. Verificar SSL
```bash
# Verificar certificados
sudo certbot certificates

# Verificar renovación
sudo certbot renew --dry-run
```

## 🛡️ Seguridad en Producción

### 1. Configurar Fail2ban
```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Configurar Backups Automáticos
```bash
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup de base de datos
pg_dump -U despacho_user -d despacho_abogados_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/despacho-legal

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete
```

```bash
chmod +x backup.sh
crontab -e
# Añadir: 0 2 * * * /path/to/backup.sh
```

## 📈 Optimización de Rendimiento

### 1. Configurar Redis para Caché
```bash
sudo apt install -y redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 2. Configurar CDN
- Configurar Cloudflare o similar
- Configurar subdominios para assets estáticos

### 3. Optimizar Base de Datos
```sql
-- Crear índices para mejorar rendimiento
CREATE INDEX idx_expedientes_status ON expedientes(status);
CREATE INDEX idx_appointments_date ON appointments(date);
CREATE INDEX idx_documents_expediente ON documents(expediente_id);
```

## 🔄 Actualizaciones y Mantenimiento

### 1. Actualización de Dependencias
```bash
# Backend
cd backend
npm audit fix
npm update

# Frontend
cd frontend
npm audit fix
npm update

# Chatbot
cd chatbot
source venv/bin/activate
pip list --outdated
pip install -r requirements.txt --upgrade
```

### 2. Actualización del Sistema
```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl daemon-reload
```

### 3. Reinicio de Servicios
```bash
# Reinicio completo
sudo systemctl restart postgresql
pm2 restart all
sudo supervisorctl restart all
sudo systemctl reload nginx
``` 