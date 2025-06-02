# 🏡 Application d'inventaire domestique - Backend

API backend pour l'application d'inventaire domestique permettant aux utilisateurs de gérer leurs biens matériels par maison, pièce et article. Développée avec un focus sur la performance, la sécurité et le respect des données personnelles (RGPD).

## 🚀 Fonctionnalités principales

### 👤 Gestion des utilisateurs
- **API d'authentification** : inscription et connexion via email/mot de passe avec JWT
- **Gestion des profils** : stockage et récupération des informations utilisateur

### 🏠 Gestion des maisons et des pièces
- **Endpoints CRUD** pour les maisons (nom, adresse)
- **Endpoints CRUD** pour les pièces, avec association à une maison

### 📦 Gestion des articles
- **API complète** pour créer et gérer des articles avec leurs attributs (nom, description, date d'achat, prix, garantie, etc.)
- **Système d'association** d'articles à des pièces/maisons
- **Contrôle de visibilité** (public/privé) des articles

### ✉️ Invitations
- **API HomeInvite** pour inviter d'autres utilisateurs à collaborer sur une maison

## 🛠️ Stack technique

- **Node.js** + **Express** : serveur performant et API REST structurée
- **Prisma ORM** : gestion typée et fiable de la base de données
- **PostgreSQL** : stockage robuste, compatible multi-formats
- **TypeScript** : typage strict pour la robustesse
- **Jest** : tests unitaires et d'intégration

## 🗂️ Structure du projet

```
backend/
├── src/
│   ├── controllers/    # Contrôleurs des routes API
│   ├── models/         # Modèles de données (Prisma)
│   ├── routes/         # Définition des routes API
│   ├── services/       # Logique métier
│   ├── utils/          # Utilitaires
│   ├── middleware/     # Middleware (auth, validation, etc.)
│   └── app.ts          # Point d'entrée de l'application
├── prisma/
│   └── schema.prisma   # Schéma de base de données
├── tests/              # Tests unitaires et d'intégration
├── .env.example        # Variables d'environnement (exemple)
├── tsconfig.json       # Configuration TypeScript
├── package.json        # Dépendances et scripts
└── jest.config.js      # Configuration des tests
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16+)
- PostgreSQL (v13+)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/lemathurin/inventory-backend.git
cd inventory-backend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifier le fichier .env avec vos valeurs

# Initialiser la base de données
npx prisma migrate dev
```

### Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm run build
npm start
```

## 🐳 Docker - Déploiement local

### Structure Docker complète

```
mes-projets/
├── inventory-frontend/
│   ├── Dockerfile
│   └── [votre code Next.js]
├── inventory-backend/
│   ├── Dockerfile
│   └── [votre code Express]
└── inventory-docker/
    ├── docker-compose.yml
    ├── .env
    └── README.md
```

### Configuration Docker

**Dockerfile Backend :**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["npm", "start"]
```

**Docker Compose (inventory-docker/docker-compose.yml) :**
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-inventory_db}
      POSTGRES_USER: ${POSTGRES_USER:-inventory_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-inventory_user}"]
      interval: 30s
      timeout: 10s
      retries: 3

  backend:
    build: ../inventory-backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-inventory_user}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-inventory_db}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: ${NODE_ENV:-development}
      PORT: 5000
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ../inventory-backend:/app
      - /app/node_modules

  frontend:
    build: ../inventory-frontend
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-http://localhost:5000}
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Fichier .env (inventory-docker/.env) :**
```bash
# Base de données
POSTGRES_DB=inventory_db
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=votre_mot_de_passe_securise

# Backend
JWT_SECRET=votre_jwt_secret_tres_long_et_securise
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
```

⚠️ **Important** : Ajoutez `.env` à votre `.gitignore` pour ne pas versionner les secrets !

### Commandes Docker

```bash
# Configuration initiale
cp .env.example .env
# Modifier le fichier .env avec vos valeurs sécurisées

# Démarrage complet
docker-compose up --build -d

# Initialiser la base de données (première fois)
docker-compose exec backend npx prisma migrate deploy

# Voir les logs
docker-compose logs -f backend

# Arrêter les services
docker-compose down

# Redémarrer le backend
docker-compose restart backend

# Voir le statut
docker-compose ps
```

### Accès aux services
- **Backend API** : http://localhost:5000
- **Frontend** : http://localhost:3000  
- **Database** : localhost:5432

### Développement avec Docker

```bash
# Logs en temps réel du backend
docker-compose logs -f backend

# Accéder au container backend
docker-compose exec backend sh

# Exécuter les migrations
docker-compose exec backend npx prisma migrate dev

# Réinitialiser la base de données
docker-compose exec backend npx prisma migrate reset
```

## 🧪 Tests

```bash
# Exécuter tous les tests
npm run test

# Exécuter les tests en mode watch
npm run test:watch

# Tests avec Docker
docker-compose exec backend npm run test
```

## ♻️ Éco-conception

- Architecture légère et optimisée avec le modèle MVC
- Gestion efficace des connexions à la base de données
- Mise en cache prévue (Redis / Node-Cache) pour réduire la charge serveur
- Images Docker Alpine Linux légères


## 🔐 RGPD et sécurité

- **Données stockées** : email, nom, mot de passe (haché), logs d'activité
- **Droits RGPD** : endpoints pour l'accès, la modification et la suppression des données
- **Sécurité** :
  - Hachage des mots de passe (bcrypt)
  - Authentification JWT 
  - Protection contre les injections SQL via Prisma
  - Validation des entrées utilisateur
  - Prévention CSRF/XSS
  - Variables d'environnement sécurisées
  - Containers isolés avec Docker

## 🔄 Roadmap

- 📁 **Gestion des médias** : API de téléversement et d'association de fichiers aux articles
- 🐳 **Optimisation Docker** : Multi-stage builds et orchestration Kubernetes
- 📊 **Monitoring** : Intégration de métriques et logs centralisés
- 🔄 **CI/CD** : Pipeline automatisé de déploiement

## 📄 Licence

Ce projet est sous licence MIT.

Vous pouvez l'utiliser, le modifier et le redistribuer librement, à condition d'en mentionner l'auteur original.

## 🙌 Remerciements

Ce projet a été réalisé dans le cadre du titre professionnel RNCP de Concepteur/Développeur d'Applications.

Merci :
- À l'équipe pédagogique pour son accompagnement
- À tous les testeurs pour leurs retours précieux
