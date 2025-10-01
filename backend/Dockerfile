# ---------- Build (instala deps, genera Prisma, compila TS) ----------
    FROM node:20-alpine AS builder
    WORKDIR /app
    
    # 1) Instala dependencias (incluye dev para compilar y prisma cli)
    COPY package*.json ./
    RUN npm ci
    
    # 2) Copia el código
    COPY . .
    
    # 3) Genera Prisma (cliente en src/generated/prisma según tu schema.prisma)
    RUN npx prisma generate
    
    # 4) Compila TypeScript a /dist
    RUN npm run build
    
    # 5) Copia el cliente Prisma a la ruta que espera el JS compilado:
    #    Tus imports son '../generated/prisma' desde ficheros en dist/services/*,
    #    así que necesitamos dist/generated/prisma presente en runtime.
    RUN mkdir -p dist/generated && cp -R src/generated/prisma dist/generated/prisma
    
    # 6) Quita deps de dev para imagen final
    RUN npm prune --omit=dev
    
    # ---------- Runtime (ligero) ----------
    FROM node:20-alpine
    WORKDIR /app
    ENV NODE_ENV=production
    
    # Copia build y node_modules ya listos
    COPY --from=builder /app/dist ./dist
    COPY --from=builder /app/node_modules ./node_modules
    COPY package*.json ./
    
    # Cloud Run escucha en $PORT (8080)
    EXPOSE 8080
    CMD ["node", "dist/index.js"]
    