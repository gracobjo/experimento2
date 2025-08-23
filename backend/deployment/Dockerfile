# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala TODAS las dependencias (incluyendo dev)
RUN npm install

# Copia el código fuente completo
COPY . .

# Genera el cliente de Prisma
RUN npx prisma generate

# Compila la aplicación (sin postbuild scripts problemáticos)
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine

WORKDIR /app

# --- Instala dependencias básicas del sistema ---
RUN apk add --no-cache \
    ca-certificates

# Copia los archivos de dependencias
COPY package*.json ./

# Instala solo dependencias de producción
RUN npm install --only=production

# Copia la app compilada desde el builder
COPY --from=builder /app/dist ./dist

# Copia Prisma desde el builder
COPY --from=builder /app/prisma ./prisma

# Genera el cliente de Prisma en producción
RUN npx prisma generate

# (Opcional) Copia plantillas si las usas en tiempo de ejecución
COPY --from=builder /app/src/invoices/templates ./dist/invoices/templates

# Variable de entorno para el puerto de la aplicación
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 