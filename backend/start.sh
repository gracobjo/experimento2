#!/bin/sh

echo "🚀 Iniciando aplicación..."
echo "📁 Directorio actual: $(pwd)"
echo "📋 Contenido del directorio:"
ls -la

# Verificar variables de entorno críticas
echo "🔍 Verificando variables de entorno..."

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️ ADVERTENCIA: JWT_SECRET no está configurado, usando valor por defecto"
    export JWT_SECRET="default-jwt-secret-change-in-production"
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurado"
    echo "💡 Railway debería configurar esto automáticamente"
    echo "💡 Ve a Railway → New Service → Database → PostgreSQL"
    exit 1
fi

echo "✅ Variables de entorno verificadas"
echo "🔐 JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "🗄️ DATABASE_URL: ${DATABASE_URL:0:30}..."

# Verificar que el archivo dist/main existe
echo "🔍 Verificando archivo dist/main..."
if [ ! -f "dist/main.js" ]; then
    echo "❌ ERROR: dist/main.js no existe"
    echo "📋 Contenido de dist/:"
    ls -la dist/ || echo "Directorio dist/ no existe"
    exit 1
fi

echo "✅ dist/main.js encontrado"

# Esperar un poco para que la base de datos esté lista
echo "⏳ Esperando que la base de datos esté lista..."
sleep 5

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
npx prisma db push --accept-data-loss || echo "⚠️ ADVERTENCIA: Error en db push"

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de la base de datos..."
npx prisma migrate deploy || echo "⚠️ ADVERTENCIA: Error en migrate deploy"

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Verificar base de datos
echo "🔍 Verificando estado de la base de datos..."
node scripts/check-database.js || echo "⚠️ ADVERTENCIA: Error verificando base de datos"

# Iniciar la aplicación
echo "🎯 Iniciando servidor..."
echo "🔍 Variables de entorno para la aplicación:"
echo "  - JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "  - DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "  - NODE_ENV: ${NODE_ENV:-development}"
echo "  - PORT: ${PORT:-3000}"

# Ejecutar la aplicación directamente
exec node dist/main.js 