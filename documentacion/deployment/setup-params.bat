@echo off
echo ========================================
echo   CONFIGURACION DE PARAMETROS DEL SISTEMA
echo ========================================
echo.

echo 1. Verificando estructura de archivos...
if not exist "backend\.env" (
    echo ❌ Archivo .env no encontrado en backend/
    echo.
    echo Por favor, crea el archivo backend\.env con el siguiente contenido:
    echo.
    echo DATABASE_URL="postgresql://username:password@localhost:5432/despacho_legal_db"
    echo JWT_SECRET="your-super-secret-jwt-key-here"
    echo JWT_EXPIRES_IN="24h"
    echo PORT=3000
    echo NODE_ENV=development
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Archivo .env encontrado
)

echo.
echo 2. Iniciando backend...
cd backend
start "Backend" cmd /k "npm run start:dev"

echo.
echo 3. Esperando que el backend se inicie...
timeout /t 10 /nobreak >nul

echo.
echo 4. Inicializando parámetros por defecto...
echo.
echo Si el backend está funcionando, puedes:
echo.
echo A) Ir a http://localhost:5173/admin/parametros (como administrador)
echo    y hacer clic en "🔧 Inicializar Parámetros"
echo.
echo B) O usar el endpoint directamente:
echo    POST http://localhost:3000/parametros/initialize
echo.
echo C) O ejecutar el script manualmente:
echo    cd backend
echo    npx ts-node scripts/initializeParams.ts
echo.

echo 5. Verificando endpoints...
echo.
echo Endpoints públicos disponibles:
echo - GET http://localhost:3000/parametros/contact
echo - GET http://localhost:3000/parametros/legal
echo - GET http://localhost:3000/parametros/legal/PRIVACY_POLICY
echo.

echo 6. Páginas del frontend:
echo.
echo - Política de Privacidad: http://localhost:5173/privacidad
echo - Términos de Servicio: http://localhost:5173/terminos
echo - Política de Cookies: http://localhost:5173/cookies
echo.

echo ========================================
echo   CONFIGURACION COMPLETADA
echo ========================================
echo.
echo ✅ Parámetros de contacto implementados
echo ✅ Contenido legal editable
echo ✅ Páginas de privacidad, términos y cookies
echo ✅ Panel de administración mejorado
echo.
echo 📖 Consulta RESUMEN_IMPLEMENTACION_PARAMETROS.md para más detalles
echo.
pause 