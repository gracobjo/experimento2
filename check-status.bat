@echo off
chcp 65001 >nul
echo ========================================
echo   VERIFICACION DE ESTADO DEL SISTEMA
echo ========================================
echo.

echo [INFO] Verificando servicios...
echo.

REM Verificar backend
echo 1. Backend (NestJS - Puerto 3000):
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3000/health 2>nul
if %errorlevel% equ 0 (
    echo [OK] Backend esta ejecutandose correctamente
) else (
    echo [ERROR] Backend no esta respondiendo
    echo    Verifica que este ejecutandose con: cd backend ^&^& npm run start:dev
)
echo.

REM Verificar chatbot
echo 2. Chatbot (Python - Puerto 5000):
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:5000/health 2>nul
if %errorlevel% equ 0 (
    echo [OK] Chatbot esta ejecutandose correctamente
) else (
    echo [ERROR] Chatbot no esta respondiendo
    echo    Verifica que este ejecutandose con: cd chatbot ^&^& python main_simple_improved.py
)
echo.

REM Verificar frontend
echo 3. Frontend (React - Puerto 5173):
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:5173 2>nul
if %errorlevel% equ 0 (
    echo [OK] Frontend esta ejecutandose correctamente
) else (
    echo [ERROR] Frontend no esta respondiendo
    echo    Verifica que este ejecutandose con: cd frontend ^&^& npm run dev
)
echo.

REM Verificar base de datos
echo 4. Base de datos (PostgreSQL):
cd backend
npx prisma db execute --stdin <<< "SELECT 1;" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Base de datos esta conectada
) else (
    echo [ERROR] Error conectando a la base de datos
    echo    Verifica que PostgreSQL este ejecutandose
)
cd ..
echo.

REM Verificar parámetros del sistema
echo 5. Parámetros del sistema:
curl -s http://localhost:3000/parametros/contact 2>nul | findstr "email" >nul
if %errorlevel% equ 0 (
    echo [OK] Parametros de contacto configurados
) else (
    echo [WARN] Parametros de contacto no encontrados
    echo    Ejecuta: cd backend ^&^& npx ts-node scripts/initializeParams.ts
)
echo.

REM Verificar documentación Swagger
echo 6. Documentación API (Swagger):
curl -s -o nul -w "HTTP Status: %%{http_code}\n" http://localhost:3000/api 2>nul
if %errorlevel% equ 0 (
    echo [OK] Documentacion Swagger disponible en http://localhost:3000/api
) else (
    echo [ERROR] Documentacion Swagger no disponible
)
echo.

echo ========================================
echo   RESUMEN DE ESTADO
echo ========================================
echo.
echo [INFO] URLs de acceso:
echo.
echo Frontend: http://localhost:5173
echo Backend: http://localhost:3000
echo Chatbot: http://localhost:5000
echo API Docs: http://localhost:3000/api
echo Health Check: http://localhost:3000/health
echo.
echo [INFO] Comandos de reinicio:
echo.
echo Backend: cd backend ^&^& npm run start:dev
echo Chatbot: cd chatbot ^&^& python main_simple_improved.py
echo Frontend: cd frontend ^&^& npm run dev
echo.
echo [INFO] Logs utiles:
echo.
echo Para ver logs del backend: cd backend ^&^& npm run start:dev
echo Para ver logs del chatbot: cd chatbot ^&^& python main_simple_improved.py
echo Para ver logs del frontend: cd frontend ^&^& npm run dev
echo Para abrir Prisma Studio: cd backend ^&^& npx prisma studio
echo.
pause 