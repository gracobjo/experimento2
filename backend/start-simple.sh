#!/bin/sh

echo "🚀 ===== INICIO DEL SCRIPT start-simple.sh ====="
echo "📁 Directorio actual: $(pwd)"
echo "👤 Usuario actual: $(whoami)"

echo ""
echo "🔍 Variables de entorno:"
echo "  - JWT_SECRET: ${JWT_SECRET:-NO CONFIGURADO}"
echo "  - DATABASE_URL: ${DATABASE_URL:-NO CONFIGURADO}"
echo "  - NODE_ENV: ${NODE_ENV:-development}"
echo "  - PORT: ${PORT:-3000}"

# Verificar si DATABASE_URL está configurado
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurado"
    exit 1
fi

echo ""
echo "✅ DATABASE_URL configurado correctamente"

echo ""
echo "🔍 Verificando archivo dist/main..."
if [ ! -f "dist/main.js" ]; then
    echo "❌ ERROR: dist/main.js no existe"
    echo "📋 Contenido de dist/:"
    ls -la dist/ || echo "Directorio dist/ no existe"
    exit 1
fi

echo "✅ dist/main.js encontrado"

echo ""
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

echo ""
echo "🎯 Iniciando servidor..."
echo "Comando: node dist/main.js"
echo "🚀 ===== EJECUTANDO NODE ====="

# Iniciar el servidor directamente
exec node dist/main.js
