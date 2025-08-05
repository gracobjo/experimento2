#!/bin/sh

echo "🚀 Iniciando aplicación..."
echo "📁 Directorio actual: $(pwd)"
echo "📋 Contenido del directorio:"
ls -la

echo "🔍 Verificando archivo dist/main..."
if [ ! -f "dist/main.js" ]; then
    echo "❌ ERROR: dist/main.js no existe"
    echo "📋 Contenido de dist/:"
    ls -la dist/ || echo "Directorio dist/ no existe"
    exit 1
fi

echo "✅ dist/main.js encontrado"

echo "🔍 Variables de entorno:"
echo "  - JWT_SECRET: ${JWT_SECRET:-NO CONFIGURADO}"
echo "  - DATABASE_URL: ${DATABASE_URL:-NO CONFIGURADO}"
echo "  - NODE_ENV: ${NODE_ENV:-development}"
echo "  - PORT: ${PORT:-3000}"

# Configurar valores por defecto si no están configurados
export JWT_SECRET=${JWT_SECRET:-"default-jwt-secret-change-in-production"}

echo "🎯 Iniciando servidor directamente..."
exec node dist/main.js 