# 🔧 Guía de Solución de Problemas

## 🚨 Problemas Comunes

### 1. Error de Conexión a Base de Datos

#### Síntomas:
```
Error: connect ECONNREFUSED 127.0.0.1:5432
PrismaClientInitializationError: Can't reach database server
```

#### Soluciones:

**A. PostgreSQL no está ejecutándose:**
```bash
# Windows
net start postgresql-x64-15

# macOS
brew services start postgresql

# Linux (Ubuntu/Debian)
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**B. Credenciales incorrectas:**
```bash
# Verificar conexión
psql -U despacho_user -d despacho_abogados -h localhost

# Resetear contraseña
sudo -u postgres psql
ALTER USER despacho_user PASSWORD 'nueva_password';
\q
```

**C. Base de datos no existe:**
```sql
CREATE DATABASE despacho_abogados;
GRANT ALL PRIVILEGES ON DATABASE despacho_abogados TO despacho_user;
```

### 2. Error de Puerto Ocupado

#### Síntomas:
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Soluciones:

**A. Encontrar y matar proceso:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**B. Cambiar puerto:**
```typescript
// En backend/src/main.ts
await app.listen(process.env.PORT || 3001);
```

### 3. Error de Módulos Node.js

#### Síntomas:
```
Error: Cannot find module 'express'
Module not found: Can't resolve 'react'
```

#### Soluciones:

**A. Reinstalar dependencias:**
```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**B. Limpiar caché:**
```bash
npm cache clean --force
```

**C. Verificar versiones:**
```bash
node --version  # Debe ser 18+
npm --version   # Debe ser 8+
```

### 4. Error de Entorno Virtual Python

#### Síntomas:
```
ModuleNotFoundError: No module named 'fastapi'
```

#### Soluciones:

**A. Activar entorno virtual:**
```bash
# Windows
cd chatbot
venv\Scripts\activate

# macOS/Linux
cd chatbot
source venv/bin/activate
```

**B. Recrear entorno virtual:**
```bash
cd chatbot
rm -rf venv
python -m venv venv
source venv/bin/activate  # o venv\Scripts\activate en Windows
pip install -r requirements.txt
```

**C. Verificar Python:**
```bash
python --version  # Debe ser 3.8+
pip --version
```

### 5. Error de Prisma

#### Síntomas:
```
Error: P1001: Can't reach database server
Error: P2002: Unique constraint failed
```

#### Soluciones:

**A. Resetear base de datos:**
```bash
cd backend
npx prisma migrate reset
npx prisma generate
npx prisma migrate dev
```

**B. Verificar schema:**
```bash
npx prisma db push
npx prisma studio  # Para ver la base de datos
```

**C. Limpiar caché de Prisma:**
```bash
npx prisma generate --force
```

### 6. Error de CORS

#### Síntomas:
```
Access to fetch at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:5173' has been blocked by CORS policy
```

#### Soluciones:

**A. Configurar CORS en backend:**
```typescript
// En backend/src/main.ts
app.enableCors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
});
```

**B. Verificar URLs en frontend:**
```typescript
// En frontend/src/api/axios.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

### 7. Error de JWT

#### Síntomas:
```
JsonWebTokenError: invalid signature
TokenExpiredError: jwt expired
```

#### Soluciones:

**A. Verificar JWT_SECRET:**
```env
# En backend/.env
JWT_SECRET="tu_secret_super_seguro_y_largo"
```

**B. Limpiar localStorage:**
```javascript
// En el navegador
localStorage.clear();
sessionStorage.clear();
```

**C. Verificar expiración:**
```typescript
// En backend/src/auth/auth.service.ts
const token = this.jwtService.sign(
  payload,
  { expiresIn: '24h' }  // Aumentar tiempo si es necesario
);
```

## 🔍 Diagnóstico de Problemas

### 1. Verificar Estado de Servicios

```bash
# Verificar puertos en uso
netstat -tulpn | grep -E ':(3000|5173|8000|5432)'

# Verificar procesos
ps aux | grep -E '(node|python|postgres)'

# Verificar logs
tail -f backend/logs/app.log
tail -f frontend/vite.log
```

### 2. Verificar Configuración

```bash
# Verificar variables de entorno
cat backend/.env
cat frontend/.env

# Verificar versiones
node --version
npm --version
python --version
pip --version
psql --version
```

### 3. Verificar Red

```bash
# Verificar conectividad
ping localhost
telnet localhost 3000
telnet localhost 5173
telnet localhost 8000
telnet localhost 5432
```

## 🛠️ Herramientas de Depuración

### 1. Logs Detallados

```typescript
// En backend/src/main.ts
const app = await NestFactory.create(AppModule, {
  logger: ['error', 'warn', 'debug', 'log', 'verbose'],
});
```

### 2. Debug Mode

```bash
# Backend en modo debug
cd backend
npm run start:debug

# Frontend con logs detallados
cd frontend
DEBUG=vite:* npm run dev
```

### 3. Prisma Studio

```bash
cd backend
npx prisma studio
# Abre http://localhost:5555
```

## 📋 Checklist de Verificación

### Antes de Reportar un Problema:

- [ ] ¿Está PostgreSQL ejecutándose?
- [ ] ¿Están todos los puertos disponibles?
- [ ] ¿Están instaladas todas las dependencias?
- [ ] ¿Están configuradas las variables de entorno?
- [ ] ¿Está activado el entorno virtual de Python?
- [ ] ¿Se han ejecutado las migraciones de Prisma?
- [ ] ¿Están actualizadas las versiones de Node.js y Python?

### Información para Reportar:

1. **Sistema operativo y versión**
2. **Versiones de software:**
   - Node.js: `node --version`
   - npm: `npm --version`
   - Python: `python --version`
   - PostgreSQL: `psql --version`
3. **Error completo con stack trace**
4. **Pasos para reproducir el problema**
5. **Logs relevantes**

## 🆘 Contacto y Soporte

### Recursos Adicionales:

- **Documentación oficial:**
  - [NestJS](https://docs.nestjs.com/)
  - [React](https://react.dev/)
  - [FastAPI](https://fastapi.tiangolo.com/)
  - [Prisma](https://www.prisma.io/docs/)

- **Comunidades:**
  - Stack Overflow
  - GitHub Issues
  - Discord de NestJS

### Comandos de Emergencia:

```bash
# Reset completo del sistema
cd backend && npx prisma migrate reset --force
cd ../frontend && rm -rf node_modules && npm install
cd ../chatbot && rm -rf venv && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt

# Reiniciar todos los servicios
pkill -f "node|python"
./start-all.sh  # o start-all.bat en Windows
``` 