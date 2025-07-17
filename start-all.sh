#!/bin/bash

echo "========================================"
echo "    SISTEMA DE GESTION LEGAL"
echo "========================================"
echo
echo "Iniciando todos los servicios..."
echo

# Verificar si Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 no está instalado"
    exit 1
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está instalado"
    exit 1
fi

echo "✓ Python3 encontrado"
echo "✓ Node.js encontrado"
echo "✓ npm encontrado"
echo

echo "Iniciando servicios en terminales separadas..."
echo

# Función para detectar el terminal disponible
get_terminal() {
    if command -v gnome-terminal &> /dev/null; then
        echo "gnome-terminal"
    elif command -v konsole &> /dev/null; then
        echo "konsole"
    elif command -v xterm &> /dev/null; then
        echo "xterm"
    elif command -v terminal &> /dev/null; then
        echo "terminal"
    else
        echo "xterm"  # fallback
    fi
}

TERMINAL=$(get_terminal)

# Iniciar Chatbot
echo "[1/3] Iniciando Chatbot (Puerto 8000)..."
case $TERMINAL in
    "gnome-terminal")
        gnome-terminal --title="Chatbot - Puerto 8000" -- bash -c "cd chatbot && echo 'Iniciando Chatbot...' && python3 main.py; exec bash"
        ;;
    "konsole")
        konsole --title "Chatbot - Puerto 8000" -e bash -c "cd chatbot && echo 'Iniciando Chatbot...' && python3 main.py; exec bash"
        ;;
    "xterm")
        xterm -title "Chatbot - Puerto 8000" -e bash -c "cd chatbot && echo 'Iniciando Chatbot...' && python3 main.py; exec bash" &
        ;;
    *)
        xterm -title "Chatbot - Puerto 8000" -e bash -c "cd chatbot && echo 'Iniciando Chatbot...' && python3 main.py; exec bash" &
        ;;
esac

sleep 2

# Iniciar Backend
echo "[2/3] Iniciando Backend (Puerto 3000)..."
case $TERMINAL in
    "gnome-terminal")
        gnome-terminal --title="Backend - Puerto 3000" -- bash -c "cd backend && echo 'Iniciando Backend...' && npm run start:dev; exec bash"
        ;;
    "konsole")
        konsole --title "Backend - Puerto 3000" -e bash -c "cd backend && echo 'Iniciando Backend...' && npm run start:dev; exec bash"
        ;;
    "xterm")
        xterm -title "Backend - Puerto 3000" -e bash -c "cd backend && echo 'Iniciando Backend...' && npm run start:dev; exec bash" &
        ;;
    *)
        xterm -title "Backend - Puerto 3000" -e bash -c "cd backend && echo 'Iniciando Backend...' && npm run start:dev; exec bash" &
        ;;
esac

sleep 2

# Iniciar Frontend
echo "[3/3] Iniciando Frontend (Puerto 5173)..."
case $TERMINAL in
    "gnome-terminal")
        gnome-terminal --title="Frontend - Puerto 5173" -- bash -c "cd frontend && echo 'Iniciando Frontend...' && npm run dev; exec bash"
        ;;
    "konsole")
        konsole --title "Frontend - Puerto 5173" -e bash -c "cd frontend && echo 'Iniciando Frontend...' && npm run dev; exec bash"
        ;;
    "xterm")
        xterm -title "Frontend - Puerto 5173" -e bash -c "cd frontend && echo 'Iniciando Frontend...' && npm run dev; exec bash" &
        ;;
    *)
        xterm -title "Frontend - Puerto 5173" -e bash -c "cd frontend && echo 'Iniciando Frontend...' && npm run dev; exec bash" &
        ;;
esac

echo
echo "========================================"
echo "    SERVICIOS INICIADOS"
echo "========================================"
echo
echo "✓ Chatbot: http://localhost:8000"
echo "✓ Backend:  http://localhost:3000"
echo "✓ Frontend: http://localhost:5173"
echo
echo "Presiona Ctrl+C para cerrar esta ventana..."
echo

# Mantener el script corriendo
while true; do
    sleep 1
done 