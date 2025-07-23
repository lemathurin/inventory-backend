# Image Node.js légère
FROM node:22-alpine

# Répertoire de travail
WORKDIR /app

# Copie des dépendances
COPY package*.json ./
COPY tsconfig.json ./

# Installer les dépendances
RUN apk add --no-cache openssl libc6-compat
RUN npm install

# Copie du code source
COPY . .

# Génération Prisma
RUN npx prisma generate

# Build de l'application
RUN npm run build

# Port
EXPOSE 5000

# Démarrage
CMD ["npm", "start"]