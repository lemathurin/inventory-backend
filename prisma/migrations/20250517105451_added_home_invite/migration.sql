-- CreateTable
CREATE TABLE "HomeInvite" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "userId" TEXT NOT NULL,
    "homeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "HomeInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeInvite_code_key" ON "HomeInvite"("code");

-- CreateIndex
CREATE UNIQUE INDEX "HomeInvite_userId_homeId_key" ON "HomeInvite"("userId", "homeId");

-- AddForeignKey
ALTER TABLE "HomeInvite" ADD CONSTRAINT "HomeInvite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeInvite" ADD CONSTRAINT "HomeInvite_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
