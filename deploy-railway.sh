#!/bin/bash

echo "🚀 === DEPLOYMENT RAILWAY - SISTEMA DE GESTIÓN LEGAL ==="
echo "📅 Fecha: $(date)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "railway.json" ]; then
    echo "❌ Error: No se encontró railway.json"
    echo "   Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi

echo "✅ railway.json encontrado"
echo ""

# Verificar que el backend esté compilado
if [ ! -d "backend/dist" ]; then
    echo "🔨 Compilando backend..."
    cd backend
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Error al compilar el backend"
        exit 1
    fi
    cd ..
    echo "✅ Backend compilado correctamente"
else
    echo "✅ Backend ya compilado"
fi

echo ""

# Verificar que el frontend esté compilado
if [ ! -d "frontend/dist" ]; then
    echo "🔨 Compilando frontend..."
    cd frontend
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Error al compilar el frontend"
        exit 1
    fi
    cd ..
    echo "✅ Frontend compilado correctamente"
else
    echo "✅ Frontend ya compilado"
fi

echo ""

# Verificar variables de entorno
echo "🔍 Verificando variables de entorno..."
if [ -z "$RAILWAY_TOKEN" ]; then
    echo "❌ Error: RAILWAY_TOKEN no está configurado"
    echo "   Ejecuta: railway login"
    exit 1
fi

if [ -z "$RAILWAY_PROJECT_ID" ]; then
    echo "❌ Error: RAILWAY_PROJECT_ID no está configurado"
    echo "   Configura la variable de entorno o ejecuta: railway link"
    exit 1
fi

echo "✅ Variables de entorno configuradas"
echo ""

# Verificar conexión a Railway
echo "🔍 Verificando conexión a Railway..."
railway status
if [ $? -ne 0 ]; then
    echo "❌ Error al conectar con Railway"
    echo "   Ejecuta: railway login"
    exit 1
fi

echo "✅ Conexión a Railway establecida"
echo ""

# Deploy
echo "🚀 Iniciando deployment..."
railway up

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ === DEPLOYMENT COMPLETADO EXITOSAMENTE ==="
    echo "🌐 URL del backend: https://experimento2-production-54c0.up.railway.app"
    echo "🌐 URL del frontend: https://experimento2-fenm.vercel.app"
    echo ""
    echo "🔍 Verificando endpoints..."
    echo "   Health: https://experimento2-production-54c0.up.railway.app/health"
    echo "   DB Status: https://experimento2-production-54c0.up.railway.app/db-status"
    echo "   Appointments Test: https://experimento2-production-54c0.up.railway.app/appointments-test"
    echo ""
    echo "📊 Para ver logs: railway logs"
    echo "🔧 Para abrir: railway open"
else
    echo ""
    echo "❌ === ERROR EN EL DEPLOYMENT ==="
    echo "Revisa los logs con: railway logs"
    exit 1
fi

