@echo off
REM =====================================================
REM Script para aplicar migraciones en Railway con baseline
REM =====================================================

REM Configurar la conexión a Railway
set DATABASE_URL=postgresql://postgres:sVFESlvkfdFbiCcJgLVhqPhfLNmEnSrf@shortline.proxy.rlwy.net:31832/railway

REM 1. Decirle a Prisma que todas las migraciones hasta antes de fileData están aplicadas
npx prisma migrate resolve --applied 20250824212806_add_file_data_to_documents

REM 2. Aplicar las migraciones pendientes (esto debería crear la columna fileData)
npx prisma migrate deploy --schema=prisma/schema.prisma

pause
