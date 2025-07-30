# 🔄 Guía de Actualizaciones - Sistema Legal Experimento

## 📋 Proceso de Actualización de Repositorios

### **Opción 1: Actualización Manual (Recomendada)**

#### Para cambios en el Backend:
```bash
# 1. Ir al directorio del backend
cd experimento-backend

# 2. Hacer los cambios en tu código

# 3. Agregar cambios al staging
git add .

# 4. Hacer commit con mensaje descriptivo
git commit -m "feat: agregar nueva funcionalidad de reportes"

# 5. Subir cambios al repositorio
git push origin main
```

#### Para cambios en el Frontend:
```bash
# 1. Ir al directorio del frontend
cd experimento-frontend

# 2. Hacer los cambios en tu código

# 3. Agregar cambios al staging
git add .

# 4. Hacer commit con mensaje descriptivo
git commit -m "feat: mejorar interfaz de usuario del dashboard"

# 5. Subir cambios al repositorio
git push origin main
```

#### Para cambios en el Chatbot:
```bash
# 1. Ir al directorio del chatbot
cd experimento-chatbot

# 2. Hacer los cambios en tu código

# 3. Agregar cambios al staging
git add .

# 4. Hacer commit con mensaje descriptivo
git commit -m "feat: agregar nuevas respuestas del chatbot"

# 5. Subir cambios al repositorio
git push origin main
```

### **Opción 2: Actualización Automática con GitHub Actions**

Si configuras GitHub Actions, los cambios se despliegan automáticamente:

1. **Hacer cambios** en tu código local
2. **Subir a GitHub** con `git push`
3. **GitHub Actions** detecta los cambios automáticamente
4. **Se despliega automáticamente** en Render/Vercel

### **Opción 3: Script de Actualización Automatizada**

Puedes crear un script que actualice todos los repositorios de una vez:

```bash
#!/bin/bash
# update-all.sh

echo "🔄 Actualizando todos los repositorios..."

# Actualizar Backend
echo "📦 Actualizando Backend..."
cd experimento-backend
git add .
git commit -m "feat: actualización automática - $(date)"
git push origin main
cd ..

# Actualizar Frontend
echo "🌐 Actualizando Frontend..."
cd experimento-frontend
git add .
git commit -m "feat: actualización automática - $(date)"
git push origin main
cd ..

# Actualizar Chatbot
echo "🤖 Actualizando Chatbot..."
cd experimento-chatbot
git add .
git commit -m "feat: actualización automática - $(date)"
git push origin main
cd ..

echo "✅ Todos los repositorios actualizados"
```

## 🚀 Despliegue Automático

### **Render (Backend y Chatbot)**
- Los cambios se despliegan automáticamente cuando detecta un push a `main`
- Puedes ver el progreso en el dashboard de Render
- Tiempo estimado: 2-5 minutos

### **Vercel (Frontend)**
- Los cambios se despliegan automáticamente cuando detecta un push a `main`
- Puedes ver el progreso en el dashboard de Vercel
- Tiempo estimado: 1-3 minutos

## 📝 Convenciones de Commits

### **Formato Recomendado:**
```
tipo: descripción breve

feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: cambios de formato
refactor: refactorización de código
test: agregar o modificar tests
chore: tareas de mantenimiento
```

### **Ejemplos:**
```bash
git commit -m "feat: agregar sistema de notificaciones push"
git commit -m "fix: corregir error en login de usuarios"
git commit -m "docs: actualizar documentación de API"
git commit -m "style: mejorar diseño del dashboard"
```

## 🔍 Verificación de Actualizaciones

### **Verificar Despliegue:**
1. **Backend**: `curl https://tu-backend.onrender.com/health`
2. **Chatbot**: `curl https://tu-chatbot.onrender.com/health`
3. **Frontend**: Visitar la URL de Vercel

### **Logs de Despliegue:**
- **Render**: Dashboard → Services → Logs
- **Vercel**: Dashboard → Deployments → View Function Logs

## 🛠️ Casos Especiales

### **Cambios en Base de Datos (Backend)**
```bash
# Si agregas nuevas migraciones de Prisma
cd experimento-backend
npx prisma migrate dev --name nueva_migracion
git add .
git commit -m "feat: agregar nueva migración de base de datos"
git push origin main
```

### **Cambios en Variables de Entorno**
1. **Render**: Dashboard → Services → Environment
2. **Vercel**: Dashboard → Settings → Environment Variables

### **Cambios en Dependencias**
```bash
# Backend
cd experimento-backend
npm install nueva-dependencia
git add package.json package-lock.json
git commit -m "feat: agregar nueva dependencia"
git push origin main

# Frontend
cd experimento-frontend
npm install nueva-dependencia
git add package.json package-lock.json
git commit -m "feat: agregar nueva dependencia"
git push origin main

# Chatbot
cd experimento-chatbot
pip install nueva-dependencia
pip freeze > requirements.txt
git add requirements.txt
git commit -m "feat: agregar nueva dependencia"
git push origin main
```

## 🔄 Flujo de Trabajo Recomendado

### **Para Desarrollo Diario:**
1. **Hacer cambios** en tu código local
2. **Probar localmente** que funciona
3. **Hacer commit** con mensaje descriptivo
4. **Subir cambios** con `git push`
5. **Verificar despliegue** automático
6. **Probar en producción**

### **Para Versiones Importantes:**
1. **Crear rama** para la nueva funcionalidad
2. **Desarrollar** en la rama
3. **Hacer merge** a main
4. **Subir cambios** con `git push`
5. **Verificar despliegue** automático
6. **Probar en producción**

## 📊 Monitoreo de Actualizaciones

### **GitHub:**
- Ver commits recientes
- Verificar que los pushes fueron exitosos
- Revisar GitHub Actions (si configurado)

### **Plataformas de Despliegue:**
- **Render**: Dashboard → Services → Deployments
- **Vercel**: Dashboard → Deployments

## 🚨 Troubleshooting

### **Error: Push Rechazado**
```bash
# Si hay cambios en el repositorio remoto
git pull origin main
# Resolver conflictos si los hay
git push origin main
```

### **Error: Despliegue Fallido**
1. **Revisar logs** en la plataforma de despliegue
2. **Verificar variables de entorno**
3. **Probar localmente** antes de subir
4. **Revisar dependencias** y configuración

### **Error: Build Fallido**
1. **Verificar sintaxis** del código
2. **Revisar dependencias** en package.json/requirements.txt
3. **Probar build local** antes de subir

## 🎯 Resumen

### **Proceso Simple:**
1. **Hacer cambios** en tu código
2. **git add .** - Agregar cambios
3. **git commit -m "mensaje"** - Hacer commit
4. **git push origin main** - Subir cambios
5. **Esperar despliegue** automático (2-5 minutos)
6. **Verificar** que funciona en producción

### **Ventajas:**
- ✅ **Despliegue automático** en cada push
- ✅ **Rollback automático** si algo falla
- ✅ **Historial completo** de cambios
- ✅ **Fácil colaboración** con otros desarrolladores
- ✅ **Monitoreo** de despliegues

¡Con este proceso, mantener tu aplicación actualizada será muy sencillo! 🚀 

## 2025-07-11: Permitir acceso de CLIENTE a endpoints de facturas

### Problema detectado
- El endpoint `/api/invoices/my` devolvía 403 Forbidden para usuarios con rol CLIENTE, aunque el decorador @Roles parecía correcto en el código fuente.
- El log mostraba: `RolesGuard DEBUG: requiredRoles = ["ADMIN","ABOGADO"], user.role = CLIENTE`.

### Pasos de revisión y diagnóstico
1. **Revisión de decoradores @Roles**
   - Se revisaron todos los endpoints del controlador `invoices.controller.ts` para comprobar los roles permitidos.
   - Se detectó que muchos endpoints solo permitían `ADMIN` y `ABOGADO`, y solo algunos incluían `CLIENTE`.
2. **Verificación de procesos y build**
   - Se mataron todos los procesos Node.js para evitar instancias antiguas.
   - Se eliminó y regeneró la carpeta `dist/` para asegurar que el build reflejara los cambios.
   - Se arrancó el backend usando `nest start` directamente, ya que no había script npm start definido.
3. **Pruebas automatizadas**
   - Se utilizó el script `get-client-invoices.ps1` para probar el acceso al endpoint `/api/invoices/my` con un usuario CLIENTE.
   - Se revisó el log del backend para confirmar los roles evaluados por el RolesGuard.
4. **Revisión de posibles decoradores a nivel de clase**
   - Se comprobó que no hubiera un decorador @Roles restrictivo a nivel de clase que sobrescribiera los de método.
5. **Revisión de la implementación de RolesGuard**
   - Se verificó que el RolesGuard leyera correctamente los roles a nivel de método.

### Cambios realizados
- Se modificaron **todos los decoradores @Roles** en `invoices.controller.ts` para incluir también el rol `CLIENTE` en todos los endpoints relevantes.
- Se recompiló y reinició el backend para aplicar los cambios.

### Resultado
- El log del backend muestra ahora:
  ```
  RolesGuard DEBUG: requiredRoles = ["CLIENTE","ADMIN","ABOGADO"], user.role = CLIENTE
  Access granted: User cliente1@test.com (CLIENTE) accessed GET /api/invoices/my
  ```
- El script de prueba devuelve acceso correcto para CLIENTE.

### Notas
- Se recomienda revisar otros controladores si se desea permitir acceso a CLIENTE en más endpoints.
- Documentar siempre los cambios de roles y acceso en endpoints críticos. 

---

### Instrucciones útiles de PowerShell para desarrollo y resolución de problemas

#### 1. **Matar procesos que usan el puerto 3000**

Si el backend no arranca porque el puerto 3000 está ocupado, ejecuta en PowerShell:

```powershell
# Ver los procesos que usan el puerto 3000
netstat -ano | findstr :3000

# Matar automáticamente todos los procesos que escuchan en el puerto 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000 -State Listen).OwningProcess | Stop-Process -Force

# O, para asegurarte de matar todos los procesos relacionados con el puerto 3000 (en cualquier estado):
Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Get-Process | Stop-Process -Force
```

#### 2. **Compilar y arrancar el backend**

En PowerShell, ejecuta los comandos por separado (no uses `&&`):

```powershell
npm run build
npm run start
```

#### 3. **Ejecutar scripts de comprobación**

Por ejemplo, para lanzar un script de PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File chatbot/get-clients-with-invoices.ps1
```

#### 4. **Notas**
- En PowerShell, el operador `&&` no funciona como en bash. Ejecuta los comandos uno a uno.
- Si tienes dudas sobre qué proceso está usando un puerto, puedes buscar el PID con `netstat` y matarlo con `Stop-Process -Id <PID> -Force`.

--- 

---

### Ejemplo y explicación de scripts de PowerShell para automatización de pruebas y gestión

Los scripts de PowerShell permiten automatizar tareas repetitivas contra la API, como crear usuarios, facturas, obtener datos, etc. Aquí tienes ejemplos y explicación de su estructura:

#### 1. **Estructura básica de un script de PowerShell para la API**

- **Login y obtención de token:**
  ```powershell
  $email = "admin@test.com"
  $password = "admin123"
  $login = Invoke-RestMethod -Uri 'http://localhost:3000/api/auth/login' -Method Post -Body (@{ email = $email; password = $password } | ConvertTo-Json) -ContentType 'application/json'
  $token = $login.token
  ```
- **Llamada a un endpoint protegido:**
  ```powershell
  $response = Invoke-RestMethod -Uri 'http://localhost:3000/api/invoices' -Headers @{ Authorization = "Bearer $token" }
  $response | Format-Table
  ```

#### 2. **Crear clientes automáticamente**

```powershell
# Crear un cliente
$body = @{ name = "Cliente Demo"; email = "cliente.demo@test.com"; password = "demo123"; role = "CLIENTE" } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Method Post -Body $body -ContentType 'application/json'
```

#### 3. **Crear facturas automáticamente**

```powershell
# Crear una factura (requiere token de ABOGADO o ADMIN)
$invoiceBody = @{ 
  tipoFactura = "F"; receptorId = "<ID_CLIENTE>"; tipoIVA = 21; regimenIvaEmisor = "General"; claveOperacion = "01"; metodoPago = "TRANSFERENCIA"; fechaOperacion = "2025-07-11"; items = @(@{ description = "minuta"; quantity = 1; unitPrice = 1000; total = 1000 })
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/invoices' -Method Post -Headers @{ Authorization = "Bearer $token" } -Body $invoiceBody -ContentType 'application/json'
```

#### 4. **Obtener facturas de un cliente**

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/invoices/by-client/<ID_CLIENTE>' -Headers @{ Authorization = "Bearer $token" }
```

#### 5. **Obtener todos los clientes con facturas**

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/invoices/clients-with-invoices' -Headers @{ Authorization = "Bearer $token" } | Format-Table clientId, name, email, facturaCount
```

#### 6. **Notas sobre los scripts**
- Todos los scripts pueden guardarse como `.ps1` y ejecutarse con:
  ```powershell
  powershell -ExecutionPolicy Bypass -File nombre-del-script.ps1
  ```
- Es importante usar el token adecuado según el rol requerido por el endpoint.
- Puedes combinar pasos (login, crear, consultar) en un solo script para automatizar flujos completos de prueba.

--- 

## [FIX] Dashboard sin estadísticas para Lawyer/Client (julio 2024)

### Problema
- El dashboard de usuario (lawyer/client) mostraba siempre ceros en las estadísticas.
- En la consola, los logs de las peticiones a `/cases/stats`, `/appointments`, etc. devolvían HTML (landing de Vite) en vez de JSON.

### Causa
- Las llamadas a la API en el frontend usaban rutas relativas (`/cases/stats`) con `axios` directo, en vez de usar el objeto `api` configurado con `baseURL: http://localhost:3000/api`.
- El proxy de Vite (`vite.config.ts`) sí estaba bien configurado, pero no se usaba correctamente desde el frontend.
- Por eso, el frontend resolvía esas rutas y devolvía el HTML de la SPA, no la respuesta del backend.

### Solución
- Se reemplazaron todas las llamadas directas a `axios.get('/cases/stats', ...)` por `api.get('/cases/stats')` usando el objeto `api` de `src/api/axios.ts`.
- Ahora todas las rutas pasan por el proxy de Vite y llegan al backend, devolviendo JSON real.
- El dashboard muestra estadísticas reales para todos los roles.

### Archivos modificados
- `frontend/src/pages/Dashboard.tsx`
- (Revisar otras páginas si se usan rutas directas)

--- 

---

### 2024-07-09 - Notificaciones de citas para ADMIN

- Se ha corregido el componente `frontend/src/components/Notifications.tsx` para que **no muestre notificaciones de citas a usuarios con rol ADMIN**.
- Antes, si un usuario ADMIN recibía una notificación de cita, el enlace lo llevaba a `/lawyer/appointments`, lo que podía provocar un redireccionamiento al login o acceso denegado.
- Ahora, solo CLIENTE y ABOGADO reciben notificaciones de citas.
- Si en el futuro se desea mostrar notificaciones de citas a ADMIN, el enlace debe ser `/admin/appointments` (bloque comentado en el código).
- Archivos afectados: `frontend/src/components/Notifications.tsx`

--- 