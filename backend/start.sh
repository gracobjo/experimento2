#!/bin/sh

echo "🚀 ===== INICIO DEL SCRIPT start.sh ====="
echo "📁 Directorio actual: $(pwd)"
echo "👤 Usuario actual: $(whoami)"
echo "📋 Contenido del directorio:"
ls -la

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

# Configurar valores por defecto
export JWT_SECRET=${JWT_SECRET:-"default-jwt-secret-change-in-production"}

echo ""
echo "✅ DATABASE_URL configurado correctamente"
echo "🔍 Valor de DATABASE_URL: $DATABASE_URL"

echo ""
echo "⏳ Esperando que la base de datos esté lista..."
sleep 15

echo ""
echo "🔍 Verificando conexión a la base de datos..."
echo "Comando: npx prisma db push --force-reset (solo si es necesario)"
# Solo ejecutar db push si es la primera vez o si hay cambios críticos
if [ ! -f ".db-initialized" ]; then
    echo "🆕 Primera ejecución - inicializando base de datos..."
    npx prisma db push
    touch .db-initialized
    echo "✅ Base de datos inicializada"
else
    echo "✅ Base de datos ya inicializada - saltando db push"
fi

echo ""
echo "📊 Verificando migraciones..."
echo "Comando: npx prisma migrate status"
npx prisma migrate status

echo ""
echo "📊 Aplicando migraciones pendientes..."
echo "Comando: npx prisma migrate deploy"
npx prisma migrate deploy

echo ""
echo "🔧 Generando cliente de Prisma..."
echo "Comando: npx prisma generate"
npx prisma generate

echo ""
echo "📋 Verificando tablas creadas..."
echo "Comando: npx prisma db pull"
npx prisma db pull

echo ""
echo "🌱 Verificando si se necesitan datos de prueba..."
if [ ! -f ".seed-executed" ]; then
    echo "🆕 Primera ejecución - ejecutando seed..."
    echo "Comando: node scripts/seed.js"
    node scripts/seed.js
    touch .seed-executed
    echo "✅ Seed ejecutado"
else
    echo "✅ Seed ya ejecutado - saltando creación de datos de prueba"
fi

echo ""
echo "🔍 Verificando estado de la base de datos..."
echo "Comando: node scripts/check-database.js"
node scripts/check-database.js

echo ""
echo "🎯 Iniciando servidor..."
echo "Comando: node dist/main.js"
echo "🔍 Variables de entorno para node:"
env | grep -E "(JWT_SECRET|DATABASE_URL|NODE_ENV|PORT)" || echo "No se encontraron variables de entorno relevantes"

echo ""
echo "🚀 ===== EJECUTANDO NODE ====="
node --trace-warnings dist/main.js 