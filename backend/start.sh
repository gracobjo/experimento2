#!/bin/sh

echo "🚀 Iniciando aplicación..."

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