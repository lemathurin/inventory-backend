import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const findItemsByUserId = async (userId: string) => {
  return prisma.item.findMany({
    where: {
      users: {
        some: {
          userId: userId,
        },
      },
    },
  });
};

export const findHomeByIdAndUserId = async (homeId: string, userId: string) => {
  return prisma.home.findFirst({
    where: {
      id: homeId,
      users: {
        some: {
          userId: userId,
        },
      },
    },
  });
};

export const findItemsByHomeAndUserId = async (
  homeId: string,
  userId: string
) => {
  return prisma.item.findMany({
    where: {
      homeId: homeId,
      users: {
        some: {
          userId: userId,
        },
      },
    },
  });
};

export const createNewItem = async (
  name: string,
  description: string,
  homeId: string,
  userId: string,
  roomId?: string
) => {
  return prisma.item.create({
    data: {
      name,
      description,
      homeId: homeId,
      users: {
        create: {
          userId: userId,
          admin: true,
        },
      },
      ...(roomId && {
        rooms: {
          connect: {
            id: roomId,
          },
        },
      }),
    },
  });
};
