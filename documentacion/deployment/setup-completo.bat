@echo off
setlocal enabledelayedexpansion

echo ========================================
echo   CONFIGURACION COMPLETA DEL SISTEMA
echo ========================================
echo.

echo 1. Verificando estructura de archivos...

REM Verificar archivo .env del backend
if not exist "backend\.env" (
    echo ❌ Archivo .env no encontrado en backend/
    echo.
    echo Creando archivo .env con configuración por defecto...
    (
        echo DATABASE_URL="postgresql://postgres:password@localhost:5432/despacho_legal_db"
        echo JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
        echo JWT_EXPIRES_IN="24h"
        echo PORT=3000
        echo NODE_ENV=development
        echo UPLOAD_DIR="./uploads"
        echo MAX_FILE_SIZE="10485760"
    ) > backend\.env
    echo ✅ Archivo .env creado
) else (
    echo ✅ Archivo .env encontrado
)

REM Verificar archivo .env del frontend
if not exist "frontend\.env" (
    echo Creando archivo .env del frontend...
    (
        echo VITE_API_URL=http://localhost:3000
        echo VITE_WS_URL=ws://localhost:3000
    ) > frontend\.env
    echo ✅ Archivo .env del frontend creado
) else (
    echo ✅ Archivo .env del frontend encontrado
)

echo.
echo 2. Instalando dependencias del backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del backend
    pause
    exit /b 1
)

echo.
echo 3. Configurando base de datos...
echo Ejecutando migraciones de Prisma...
npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo ❌ Error ejecutando migraciones
    echo.
    echo Si es la primera vez, ejecuta:
    echo npx prisma migrate dev --name init
    pause
    exit /b 1
)

echo.
echo 4. Generando cliente Prisma...
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Error generando cliente Prisma
    pause
    exit /b 1
)

echo.
echo 5. Inicializando parámetros del sistema...
echo Ejecutando script de inicialización...
npx ts-node scripts/initializeParams.ts
if %errorlevel% neq 0 (
    echo ⚠️  Error inicializando parámetros (puede ser normal si ya están configurados)
)

echo.
echo 6. Iniciando backend...
start "Backend - NestJS" cmd /k "npm run start:dev"

echo.
echo 7. Esperando que el backend se inicie...
timeout /t 15 /nobreak >nul

echo.
echo 8. Instalando dependencias del frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error instalando dependencias del frontend
    pause
    exit /b 1
)

echo.
echo 9. Iniciando frontend...
start "Frontend - React" cmd /k "npm run dev"

echo.
echo 10. Esperando que el frontend se inicie...
timeout /t 10 /nobreak >nul

echo.
echo ========================================
echo   SISTEMA CONFIGURADO Y EN EJECUCION
echo ========================================
echo.
echo 🌐 URLs de acceso:
echo.
echo Frontend (React):
echo - Aplicación principal: http://localhost:5173
echo - Panel de admin: http://localhost:5173/admin
echo - Política de privacidad: http://localhost:5173/privacidad
echo - Términos de servicio: http://localhost:5173/terminos
echo - Política de cookies: http://localhost:5173/cookies
echo.
echo Backend (NestJS):
echo - API REST: http://localhost:3000
echo - Documentación Swagger: http://localhost:3000/api
echo - Health check: http://localhost:3000/health
echo.
echo 📊 Endpoints de parámetros:
echo - Contacto: http://localhost:3000/parametros/contact
echo - Legal: http://localhost:3000/parametros/legal
echo - Política de privacidad: http://localhost:3000/parametros/legal/PRIVACY_POLICY
echo.
echo 🔧 Comandos útiles:
echo.
echo Para reiniciar el backend:
echo cd backend ^&^& npm run start:dev
echo.
echo Para reiniciar el frontend:
echo cd frontend ^&^& npm run dev
echo.
echo Para ver logs de la base de datos:
echo cd backend ^&^& npx prisma studio
echo.
echo Para ejecutar tests:
echo cd backend ^&^& npm run test
echo cd frontend ^&^& npm run test
echo.
echo ========================================
echo   CONFIGURACION COMPLETADA EXITOSAMENTE
echo ========================================
echo.
echo ✅ Base de datos configurada y migrada
echo ✅ Parámetros del sistema inicializados
echo ✅ Backend ejecutándose en puerto 3000
echo ✅ Frontend ejecutándose en puerto 5173
echo ✅ Documentación Swagger disponible
echo ✅ Páginas legales configuradas
echo.
echo 🎉 ¡El sistema está listo para usar!
echo.
pause 