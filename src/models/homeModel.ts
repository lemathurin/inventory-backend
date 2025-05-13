import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const createNewHome = async (name: string, address: string, userId: string) => {
  return prisma.home.create({
    data: {
      name,
      address,
      users: {
        create: {
          userId: userId,
          admin: true,
        },
      },
    },
    include: {
      users: true,
    },
  });
};

export const findAllHomes = async () => {
  return prisma.home.findMany();
};

export const findHomeById = async (id: string) => {
  return prisma.home.findUnique({
    where: { id: String(id) },
    include: { users: true, items: true },
  });
};

export const findHomesByUserId = async (userId: string) => {
  return prisma.home.findMany({
    where: {
      users: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      users: true,
      items: true,
    },
  });
};