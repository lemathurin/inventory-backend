/*
  Warnings:

  - You are about to drop the `_HomeToRoom` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `homeId` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_HomeToRoom" DROP CONSTRAINT "_HomeToRoom_A_fkey";

-- DropForeignKey
ALTER TABLE "_HomeToRoom" DROP CONSTRAINT "_HomeToRoom_B_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "homeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_HomeToRoom";

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_homeId_fkey" FOREIGN KEY ("homeId") REFERENCES "Home"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
