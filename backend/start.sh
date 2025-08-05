#!/bin/sh

echo "🚀 Iniciando aplicación..."

# Verificar variables de entorno críticas
echo "🔍 Verificando variables de entorno..."

if [ -z "$JWT_SECRET" ]; then
    echo "❌ ERROR: JWT_SECRET no está configurado"
    echo "💡 Configura JWT_SECRET en las variables de entorno de Railway"
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurado"
    echo "💡 Railway debería configurar esto automáticamente"
    exit 1
fi

echo "✅ Variables de entorno verificadas"
echo "🔐 JWT_SECRET: ${JWT_SECRET:0:10}..."
echo "🗄️ DATABASE_URL: ${DATABASE_URL:0:30}..."

# Esperar un poco para que la base de datos esté lista
echo "⏳ Esperando que la base de datos esté lista..."
sleep 5

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de la base de datos..."
npx prisma migrate deploy

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Iniciar la aplicación
echo "🎯 Iniciando servidor..."
npm run start:prod 