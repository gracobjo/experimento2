#!/bin/sh

echo "🚀 Iniciando aplicación..."

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

# Esperar un poco para que la base de datos esté lista
echo "⏳ Esperando que la base de datos esté lista..."
sleep 10

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
npx prisma db push --accept-data-loss

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de la base de datos..."
npx prisma migrate deploy

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Verificar que las tablas se crearon
echo "📋 Verificando tablas creadas..."
npx prisma db pull

# Verificar base de datos
echo "🔍 Verificando estado de la base de datos..."
node scripts/check-database.js

# Iniciar la aplicación
echo "🎯 Iniciando servidor..."
node dist/main 