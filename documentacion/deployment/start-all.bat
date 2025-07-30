@echo off
echo Iniciando el sistema completo...
echo.

echo 1. Iniciando Backend (NestJS)...
cd backend
start "Backend" cmd /k "npm run start:dev"
cd ..

echo 2. Iniciando Frontend (React)...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo 3. Iniciando Chatbot (Python FastAPI)...
cd chatbot
start "Chatbot" cmd /k "python main_improved.py"
cd ..

echo.
echo Sistema iniciado correctamente!
echo - Backend: http://localhost:3000
echo - Frontend: http://localhost:5173
echo - Chatbot: http://localhost:8000
echo.
pause 