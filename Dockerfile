# ---- Etapa 1: Dependencias de Producción ----
# Usamos una imagen ligera de Node.js v20
FROM node:20-alpine AS deps
WORKDIR /app

# Copiamos solo los 'package.json' para instalar dependencias
COPY package.json package-lock.json* ./

# Instalamos SOLAMENTE las dependencias de producción
RUN npm ci --omit=dev

# ---- Etapa 2: Build ----
# Usamos la misma imagen para construir la app
FROM node:20-alpine AS builder
WORKDIR /app

# Copiamos los 'package.json' de nuevo
COPY package.json package-lock.json* ./

# Instalamos TODAS las dependencias (incluyendo devDependencies)
RUN npm ci

# Copiamos el resto del código fuente
COPY . .

# --- Variables de Entorno para el Build ---
# Estas variables (NEXT_PUBLIC_...) son necesarias DURANTE el build
# para que Next.js las incluya en el código JavaScript del cliente.
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID

ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
# --- Fin de Variables de Entorno ---

# Ejecutamos el script de build
RUN npm run build

# ---- Etapa 3: Runner (Producción Final) ----
# Esta es la imagen final que se ejecutará
FROM node:20-alpine AS runner
WORKDIR /app

# Establecemos el entorno a producción
ENV NODE_ENV=production

# Copiamos las dependencias de PRODUCCIÓN de la etapa 'deps'
COPY --from=deps /app/node_modules ./node_modules
# Copiamos el package.json (necesario para 'npm start')
COPY --from=deps /app/package.json ./package.json

# Copiamos los artefactos de build de la etapa 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next

# Exponemos el puerto 3000 (el puerto por defecto de 'npm start' de Next.js)
EXPOSE 3000

# El comando para iniciar la aplicación
CMD ["npm", "start"]