# Etapa de build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx prisma generate

# Etapa final
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app ./
EXPOSE 8080
CMD ["npm", "run", "dev"]
