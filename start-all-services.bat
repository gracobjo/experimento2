@echo off
chcp 65001 >nul
echo ========================================
echo   ARRANQUE COMPLETO DEL SISTEMA
echo ========================================
echo.

REM --- Chequeo de puertos ---
set BACKEND_PORT=3000
set CHATBOT_PORT=5000
set FRONTEND_PORT=5173

echo [INFO] Verificando puertos...

netstat -an | find ":%BACKEND_PORT% " | find "LISTENING" >nul
if %errorlevel%==0 (
    echo [WARN] Puerto %BACKEND_PORT% ya esta en uso
) else (
    echo [OK] Puerto %BACKEND_PORT% disponible
)

netstat -an | find ":%CHATBOT_PORT% " | find "LISTENING" >nul
if %errorlevel%==0 (
    echo [WARN] Puerto %CHATBOT_PORT% ya esta en uso
) else (
    echo [OK] Puerto %CHATBOT_PORT% disponible
)

netstat -an | find ":%FRONTEND_PORT% " | find "LISTENING" >nul
if %errorlevel%==0 (
    echo [WARN] Puerto %FRONTEND_PORT% ya esta en uso
) else (
    echo [OK] Puerto %FRONTEND_PORT% disponible
)

echo.

REM --- Iniciar servicios ---
echo [1/3] Iniciando Backend (NestJS - Puerto 3000)...
start "Backend - NestJS" cmd /k "cd backend && npm run start:dev"
echo [OK] Backend iniciado en nueva ventana
echo.

echo [INFO] Esperando 10 segundos para que el backend se inicie...
timeout /t 10 /nobreak >nul

echo [2/3] Iniciando Chatbot (Python - Puerto 5000)...
start "Chatbot - Python" cmd /k "cd chatbot && python main_simple_improved.py"
echo [OK] Chatbot iniciado en nueva ventana
echo.

echo [INFO] Esperando 5 segundos para que el chatbot se inicie...
timeout /t 5 /nobreak >nul

echo [3/3] Iniciando Frontend (React - Puerto 5173)...
start "Frontend - React" cmd /k "cd frontend && npm run dev"
echo [OK] Frontend iniciado en nueva ventana
echo.

echo [INFO] Esperando 15 segundos para que todos los servicios se inicien...
timeout /t 15 /nobreak >nul

REM --- Verificación final ---
echo ========================================
echo   SISTEMA LISTO
echo ========================================
echo.
echo [INFO] URLs de acceso:
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3000
echo Chatbot API: http://localhost:5000
echo API Docs: http://localhost:3000/api
echo.
echo [INFO] Para probar el chatbot:
echo   1. Abre http://localhost:5173
echo   2. Haz clic en el widget del chatbot
echo   3. Escribe "quiero una cita" o "necesito una consulta"
echo.
pause