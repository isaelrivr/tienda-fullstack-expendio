# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar manifiestos primero (aprovecha la caché de capas de Docker)
COPY package*.json ./

# Instalar sólo dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código
COPY . .

# Puerto que expone la app
EXPOSE 3000

# Comando de arranque
CMD ["node", "server.js"]