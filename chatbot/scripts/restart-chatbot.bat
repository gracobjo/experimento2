@echo off
echo Deteniendo chatbot anterior...
taskkill /f /im python.exe 2>nul
timeout /t 2 /nobreak >nul

echo Iniciando chatbot mejorado...
python main_improved.py
pause 