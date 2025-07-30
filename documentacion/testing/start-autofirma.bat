@echo off
echo ========================================
echo    Iniciando Servidor AutoFirma HTTP
echo ========================================
echo.

echo Verificando si Node.js esta instalado...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado o no esta en el PATH
    echo Por favor, instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js encontrado: 
node --version

echo.
echo Verificando si el puerto 8080 esta disponible...
netstat -an | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo ADVERTENCIA: El puerto 8080 ya esta en uso
    echo Intentando detener procesos en el puerto 8080...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
        taskkill /f /pid %%a >nul 2>&1
    )
    timeout /t 2 >nul
)

echo.
echo Iniciando servidor AutoFirma HTTP...
echo Puerto: 8080
echo URL: http://127.0.0.1:8080
echo.
echo Para detener el servidor, presiona Ctrl+C
echo.

node autofirma-http-server.js

echo.
echo Servidor AutoFirma detenido.
pause 