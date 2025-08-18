# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Copia los archivos de dependencias y Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala TODAS las dependencias (incluyendo dev)
RUN npm install

# Copia el código fuente
COPY . .

# Genera el cliente de Prisma
RUN npx prisma generate

# Compila la aplicación
RUN npm run build

# ---------- Production stage ----------
FROM node:20-alpine

WORKDIR /app

# --- Instala Chromium y dependencias para Puppeteer ---
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Copia los archivos de dependencias y Prisma
COPY package*.json ./
COPY prisma ./prisma/

# Instala solo dependencias de producción
RUN npm install --only=production

# Genera el cliente de Prisma en producción
RUN npx prisma generate

# Copia la app compilada desde el builder
COPY --from=builder /app/dist ./dist

# (Opcional) Copia plantillas si las usas en tiempo de ejecución
COPY --from=builder /app/src/invoices/templates ./dist/invoices/templates

# Copia scripts necesarios
COPY backend/scripts ./scripts

# Variable de entorno para Puppeteer (importante para Alpine)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

EXPOSE 3000

CMD ["npm", "run", "start:prod"] 