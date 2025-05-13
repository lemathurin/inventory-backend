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

export const findItemsByHomeAndUserId = async (homeId: string, userId: string) => {
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
  userId: string
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
    },
  });
};

export const findItemByIdAndHomeIdAndUserId = async (
  itemId: string, 
  homeId: string, 
  userId: string
) => {
  return prisma.item.findFirst({
    where: {
      id: itemId,
      homeId: homeId,
      users: {
        some: {
          userId: userId,
        },
      },
    },
  });
};

export const updateItemById = async (
  itemId: string, 
  data: {
    name?: string;
    description?: string;
    purchaseDate?: Date | null;
    price?: number | null;
  }
) => {
  return prisma.item.update({
    where: { id: itemId },
    data,
  });
};

export const deleteItemById = async (itemId: string) => {
  // Use a transaction to ensure both operations succeed or fail together
  return prisma.$transaction(async (prisma) => {
    // First delete related user-item relationships
    await prisma.userItem.deleteMany({
      where: {
        itemId: itemId,
      },
    });

    // Then delete the item itself
    return prisma.item.delete({
      where: { id: itemId },
    });
  });
};