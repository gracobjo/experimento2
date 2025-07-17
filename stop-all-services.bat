@echo off
chcp 65001 >nul
echo ========================================
echo   DETENCION DE TODOS LOS SERVICIOS
echo ========================================
echo.

echo [INFO] Deteniendo todos los servicios...
echo.

REM Detener procesos en puerto 3000 (Backend)
echo [1/5] Deteniendo Backend (Puerto 3000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    echo [INFO] Deteniendo proceso PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] Backend detenido
echo.

REM Detener procesos en puerto 5000 (Chatbot)
echo [2/5] Deteniendo Chatbot (Puerto 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    echo [INFO] Deteniendo proceso PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] Chatbot detenido
echo.

REM Detener procesos en puerto 5173 (Frontend)
echo [3/5] Deteniendo Frontend (Puerto 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5173" ^| find "LISTENING"') do (
    echo [INFO] Deteniendo proceso PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo [OK] Frontend detenido
echo.

REM Detener procesos de Node.js relacionados
echo [4/5] Deteniendo procesos Node.js restantes...
taskkill /IM node.exe /F >nul 2>&1
echo [OK] Procesos Node.js detenidos
echo.

REM Detener procesos de Python relacionados con el chatbot
echo [5/5] Deteniendo procesos Python del chatbot...
taskkill /IM python.exe /F >nul 2>&1
echo [OK] Procesos Python detenidos
echo.

echo ========================================
echo   VERIFICACION DE DETENCION
echo ========================================
echo.

echo [INFO] Verificando que los puertos esten libres...
echo.

REM Verificar puerto 3000
netstat -an | find ":3000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [ERROR] Puerto 3000 aun en uso
) else (
    echo [OK] Puerto 3000 libre
)

REM Verificar puerto 5000
netstat -an | find ":5000" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [ERROR] Puerto 5000 aun en uso
) else (
    echo [OK] Puerto 5000 libre
)

REM Verificar puerto 5173
netstat -an | find ":5173" | find "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [ERROR] Puerto 5173 aun en uso
) else (
    echo [OK] Puerto 5173 libre
)

echo.
echo ========================================
echo   TODOS LOS SERVICIOS DETENIDOS
echo ========================================
echo.
echo [OK] Sistema detenido completamente
echo.
echo [INFO] Para reiniciar el sistema:
echo    Ejecuta: .\start-all-services.bat
echo.
echo [INFO] Notas:
echo - Si algun puerto sigue en uso, reinicia tu computadora
echo - Los procesos se han terminado forzosamente
echo - Cualquier ventana de terminal abierta se cerrara automaticamente
echo.
pause 