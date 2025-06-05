# Image Node.js légère
FROM node:22-alpine

# Répertoire de travail
WORKDIR /app

# Copie des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Génération Prisma
RUN npx prisma generate

# Port
EXPOSE 5000

# Démarrage
CMD ["npm", "start"]