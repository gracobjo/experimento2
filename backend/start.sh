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

# Verificar si DATABASE_URL está configurado
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurado"
    echo ""
    echo "🔧 SOLUCIÓN:"
    echo "1. Ve a Railway Dashboard"
    echo "2. Selecciona tu proyecto"
    echo "3. Ve a la pestaña 'Variables'"
    echo "4. Agrega la variable DATABASE_URL con el valor de tu base de datos PostgreSQL"
    echo "5. El formato debe ser: postgresql://usuario:contraseña@host:puerto/nombre_db"
    echo ""
    echo "💡 ALTERNATIVA:"
    echo "Si ya tienes un servicio PostgreSQL en Railway, asegúrate de que esté conectado a tu aplicación."
    echo ""
    exit 1
fi

# Verificar que DATABASE_URL no sea localhost
if echo "$DATABASE_URL" | grep -q "localhost"; then
    echo "❌ ERROR: DATABASE_URL contiene localhost, debe usar la URL de Railway"
    echo "🔍 Valor actual: $DATABASE_URL"
    echo ""
    echo "🔧 SOLUCIÓN:"
    echo "Usa la URL correcta de Railway:"
    echo "postgresql://postgres:exOUcHSIbHGMeCqTlkaXEzHswlhYbwKZ@nozomi.proxy.rlwy.net:59148/railway"
    echo ""
    exit 1
fi

# Configurar valores por defecto si no están configurados
export JWT_SECRET=${JWT_SECRET:-"default-jwt-secret-change-in-production"}

echo "✅ DATABASE_URL configurado correctamente"
echo "🔍 Valor de DATABASE_URL: $DATABASE_URL"

# Esperar un poco para que la base de datos esté lista
echo "⏳ Esperando que la base de datos esté lista..."
sleep 10

# Verificar conexión a la base de datos
echo "🔍 Verificando conexión a la base de datos..."
npx prisma db push --accept-data-loss || echo "⚠️ ADVERTENCIA: Error en db push"

# Ejecutar migraciones
echo "📊 Ejecutando migraciones de la base de datos..."
npx prisma migrate deploy || echo "⚠️ ADVERTENCIA: Error en migrate deploy"

# Generar cliente de Prisma
echo "🔧 Generando cliente de Prisma..."
npx prisma generate

# Verificar que las tablas se crearon
echo "📋 Verificando tablas creadas..."
npx prisma db pull || echo "⚠️ ADVERTENCIA: Error en db pull"

# Verificar base de datos
echo "🔍 Verificando estado de la base de datos..."
node scripts/check-database.js || echo "⚠️ ADVERTENCIA: Error verificando base de datos"

echo "🎯 Iniciando servidor directamente..."
echo "🔍 Comando: node dist/main.js"
echo "🔍 Variables de entorno para node:"
env | grep -E "(JWT_SECRET|DATABASE_URL|NODE_ENV|PORT)" || echo "No se encontraron variables de entorno relevantes"

# Ejecutar con más logging
node --trace-warnings dist/main.js 