# 🏡 Application d'inventaire domestique - Frontend (inventory-frontend)

Interface utilisateur pour l'application d'inventaire domestique permettant aux utilisateurs de gérer leurs biens matériels par maison, pièce et article. Conçue dans un souci d'accessibilité, d'éco-conception et d'expérience utilisateur optimale.

## 🚀 Fonctionnalités principales

### 👤 Gestion des utilisateurs
- **Inscription / Connexion** via email et mot de passe
- **Tableau de bord personnalisé** : affichage des maisons, pièces et articles liés à l'utilisateur
- **Profil utilisateur** : gestion des informations personnelles et préférences

### 🏠 Gestion des maisons et des pièces
- Interface intuitive pour ajouter, modifier et supprimer des **maisons** (nom, adresse)
- Gestion visuelle des **pièces**, associées à une maison
- Navigation fluide entre maisons et pièces

### 📦 Gestion des articles
- Formulaires complets pour créer et gérer des articles : nom, description, date d'achat, prix, garantie, etc.
- Association d'articles à des pièces/maisons
- Contrôle de visibilité (mode **public/privé**) avec indicateurs visuels

### ✉️ Invitations
- Interface **HomeInvite** pour inviter d'autres utilisateurs à collaborer sur une maison
- Gestion des invitations reçues et envoyées

## 🛠️ Stack technique

- **Next.js** : framework React avec SSR, SSG, CSR pour des performances optimales
- **TypeScript** : typage frontend sécurisé
- **Tailwind CSS** : design rapide avec configuration centralisée
- **ShadCN/UI** : composants modernes et personnalisables
- **Axios** : gestion simple des appels API
- **Cypress** : tests end-to-end simulant le parcours utilisateur

## 🗂️ Structure du projet

```
frontend/
├── public/             # Fichiers statiques
├── src/
│   ├── app/            # Structure des pages (Next.js App Router)
│   ├── components/     # Composants réutilisables
│   ├── hooks/          # Hooks personnalisés
│   ├── lib/            # Utilitaires et configuration
│   ├── stores/         # Gestion d'état (Zustand/Redux)
│   ├── types/          # Définitions de types TypeScript
│   └── services/       # Services d'API et intégrations
├── cypress/            # Tests end-to-end
├── tailwind.config.js  # Configuration Tailwind CSS
├── next.config.js      # Configuration Next.js
├── tsconfig.json       # Configuration TypeScript
└── package.json        # Dépendances et scripts
```

## 🚀 Installation et démarrage

### Prérequis
- Node.js (v16+)

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/lemathurin/inventory-frontend.git
cd inventory-frontend

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Modifier le fichier .env.local avec vos valeurs
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
    └── README.md
```

### Configuration Docker

**Dockerfile Frontend :**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build 
EXPOSE 3000
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

  backend:
    build: ../inventory-backend
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-inventory_user}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB:-inventory_db}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres

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

# Voir les logs
docker-compose logs -f

# Arrêter les services
docker-compose down

# Redémarrer
docker-compose restart

# Voir le statut
docker-compose ps
```

### Accès aux services
- **Frontend** : http://localhost:3000
- **Backend** : http://localhost:5000  
- **Database** : localhost:5432

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests end-to-end avec Cypress
npm run cypress:open   # Interface interactive
npm run cypress:run    # Exécution en ligne de commande
```

## ♻️ Éco-conception

- Architecture optimisée avec Next.js
- Police Geist : faible poids et bonne lisibilité
- Code-splitting automatique avec Next.js
- Images Docker Alpine Linux légères

## 🌍 Accessibilité

- Contrastes vérifiés (mode clair/sombre)
- Navigation clavier avec indicateurs de focus
- Compatible lecteurs d'écran (ARIA, labels accessibles)

## 🎨 Design System

- Système de couleurs cohérent avec mode clair/sombre
- Typographie standardisée (Geist)
- Composants réutilisables (ShadCN/UI)
- Spacing et layout uniformes

## 🔄 Roadmap

- 🌐 **Internationalisation (i18next)** : rendre l'application multilingue
- 📱 **PWA complète** : expérience native sur mobile avec installation
- 📁 **Gestion des médias** : upload et prévisualisation de fichiers associés aux articles



## 📄 Licence

Ce projet est sous licence MIT.

Vous pouvez l'utiliser, le modifier et le redistribuer librement, à condition d'en mentionner l'auteur original.

## 🙌 Remerciements

Ce projet a été réalisé dans le cadre du titre professionnel RNCP de Concepteur/Développeur d'Applications.

Merci :
- À l'équipe pédagogique pour son accompagnement
- À tous les testeurs pour leurs retours précieux
