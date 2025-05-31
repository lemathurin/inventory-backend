import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createRoom = async (
  homeId: string,
  name: string,
  userId: string
) => {
  return prisma.room.create({
    data: {
      name,
      home: {
        connect: { id: homeId },
      },
      users: {
        create: {
          userId: userId,
          admin: true,
        },
      },
    },
    include: {
      home: true,
      users: true,
    },
  });
};
