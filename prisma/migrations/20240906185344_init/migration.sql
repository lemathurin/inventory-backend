-- Création de la table User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL
);

-- Création de la table Home
CREATE TABLE "Home" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- Création de la table Item
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "purchaseDate" DATETIME,
    "price" REAL,
    "warranty" INTEGER,
    "imageUrl" TEXT,
    "homeId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    CONSTRAINT "Item_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Création de la table de jointure User-Home
CREATE TABLE "_UserHomes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_UserHomes_A_fkey" FOREIGN KEY ("A") REFERENCES "Home" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_UserHomes_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Création dun Index pour la table User et vérification de leur unicité dans la table. 
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Création d'un index pour la table UserHome et vérification de l'unicité de leur association dans la table
CREATE UNIQUE INDEX "_UserHomes_AB_unique" ON "_UserHomes"("A", "B");

-- Création d'un index pour les "Homes" dans la table UserHomes.
CREATE INDEX "_UserHomes_B_index" ON "_UserHomes"("B");
