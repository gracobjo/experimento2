@echo off
REM ============================================
REM Script para aplicar migraciones en Railway DB
REM ============================================

REM Configurar la variable de entorno para Prisma
set DATABASE_URL=postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway

REM Ejecutar Prisma migrate deploy
npx prisma migrate deploy --schema=prisma/schema.prisma

pause
