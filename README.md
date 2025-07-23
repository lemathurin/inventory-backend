# Home Inventory App – Backend

<img width="1136" height="745" alt="A screenshot of the app's dashboard, on the left showing a sidebar with the home's name, a list of rooms, and the user's name. On the right, a list of items with their name, owner, price, and location visible." src="https://github.com/user-attachments/assets/13573f7d-44d2-4778-9913-a0ae1be59a9e" />

Users can sign up, create homes and rooms, add items with details like warranty and price, and invite others to collaborate on shared homes. The backend has full CRUD support for each user, home, room, and item. Middlewares ensure that the user is authentified and authorized to permorm every CRUD operation.

The app complies as much as possible with GDPR guidelines by storing only essential data (email, name, and hashed password) and providing endpoints to access, update, or delete personal information, while ensuring security through bcrypt password hashing, JWT authentication, SQL injection protection via Prisma, input validation, CSRF/XSS prevention, secure environment variables, and isolated Docker containers.

## Table of Contents

- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [Tests](#tests)
- [Credits](#credits)

## Tech Stack

- **Node.js**: JavaScript ecosystem
- **Express.js**: Simple and powerful framework
- **TypeScript**: Strong typing for safer code
- **Prisma ORM**: Typed and simple to understand syntax
- **PostgreSQL**: Powerful ACID database
- **Jest**: Unit and integration testing

## Installation

### Prerequisits

- Node.js (version 16 or higher)
- PostgreSQL (version 13 or higher)

### Getting Started

```bash
# Clone the repo
git clone https://github.com/lemathurin/inventory-backend.git
cd inventory-backend

# Install dependencies
npm install

# Configure environment variables
cp .env

# Initialiser database
npx prisma migrate dev
```

Add this to the `.env`:

```
DATABASE_URL= # PostgreSQL
JWT_SECRET= # Add secret
PORT=4000 # Default port
```

### Development

```bash
# Start in development mode
npm run dev
```

### Production

```bash
# Build and start the production server
npm run build
npm start
```

## Docker

It is recommeneded to create a Docker Compose file to manage everything at once.

```
inventory/
├── inventory-frontend/
│   ├── Dockerfile
│   └── [Next.js code]
├── inventory-backend/
│   ├── Dockerfile
│   └── [Express code]
├── docker-compose.yml
└── .env
```

### Docker Compose

```yaml
services:
  # PostgreSQL database
  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data
  # Backend Express.js
  backend:
    build:
      context: # Path to backend folder
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL= ${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    ports:
      - "5001:5000"
    depends_on:
      - database
  # Frontend Next.js
  frontend:
    build:
      context: # Path to frontend folder
      dockerfile: Dockerfile
      args:
        DISABLE_ESLINT_PLUGIN: "true"
    environment:
      - NEXT_PUBLIC_API_URL= ${NEXT_PUBLIC_API_URL}
    ports:
      - "3001:3000"
    depends_on:
      - backend
volumes:
  db_data:
```

### Docker Compose .env

```
DATABASE_URL= # Database URL
POSTGRES_DB=inventory_db
POSTGRES_USER=inventory_user
POSTGRES_PASSWORD=password123
JWT_SECRET=super-secure-secret
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Docker Compose Commands

```bash
# Start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Check status
docker-compose ps
```

## Project Structure

```
inventory-backend/
├── prisma/                     # Prisma ORM setup
│   ├── schema.prisma           # Data model definitions
│   ├── migrations/             # Database schema migration history
│   └── migration_lock.toml     # Prisma migration lock file
├── src/                        # Main source code
│   ├── index.ts                # App entry point
│   ├── config/                 # Configuration (e.g., JWT settings)
│   ├── controllers/            # Request handlers (route logic)
│   ├── models/                 # Data access logic (calls Prisma)
│   ├── routes/                 # Express routes and route grouping
│   ├── middleware/             # Express middleware (auth, permissions, etc.)
│   ├── lib/                    # Library setup (e.g., Prisma client)
│   ├── utils/                  # Utility functions (e.g., invite code generation)
│   ├── types/                  # TypeScript type extensions (Express, Jest)
│   └── __tests__/              # Unit tests
├── Dockerfile                  # Docker config for backend service
├── jest.config.js              # Jest test configuration
├── eslint.config.mjs           # ESLint configuration
├── tsconfig.json               # TypeScript config for app
├── ts.config.test.json         # TypeScript config for tests
├── package.json                # Dependencies and scripts
├── package-lock.json           # Lockfile for reproducible installs
└── README.md                   # Project documentation
```

## Tests

```bash
# Execute all tests
npm run test

# Tests with Docker
docker-compose exec backend npm run test
```

## Credits

This project was carried out to validate the RNCP Application Designer and Developer diploma (Titre RNCP Concepteur Développeur d'Applications de niveau VI). It was developped by [Pierre](https://github.com/PierrePedrono) and [Mathurin](https://mathurinsekine.fr).
