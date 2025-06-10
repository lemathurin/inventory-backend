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

export const findUserHomeById = async (homeId: string, userId: string) => {
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

export const findPublicItemsByHomeId = async (
  homeId: string,
  options?: {
    limit?: number;
    orderBy?: "createdAt" | "name" | "price"; // Add more fields as needed
    orderDirection?: "asc" | "desc";
    publicOnly?: boolean;
  }
) => {
  const {
    limit,
    orderBy = "createdAt",
    orderDirection = "desc",
    publicOnly = true,
  } = options || {};

  return prisma.item.findMany({
    where: {
      homeId: homeId,
      public: publicOnly,
    },
    include: {
      rooms: true,
      users: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: {
      [orderBy]: orderDirection,
    },
    take: limit,
  });
};

export const createNewItem = async (
  name: string,
  description: string,
  homeId: string,
  userId: string,
  roomId?: string,
  isPublic?: boolean,
  purchaseDate?: Date | null,
  price?: number | null,
  hasWarranty?: boolean,
  warrantyType?: string | null,
  warrantyLength?: number | null
) => {
  return prisma.item.create({
    data: {
      name,
      description,
      homeId: homeId,
      public: isPublic,
      purchaseDate,
      price,
      hasWarranty,
      warrantyType,
      warrantyLength,
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

export const findItemByIdAndUserId = async (itemId: string, userId: string) => {
  return prisma.item.findFirst({
    where: {
      id: itemId,
      users: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      Home: true,
      rooms: true,
      users: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
};

export const updateItem = async (
  itemId: string,
  data: {
    name?: string;
    description?: string;
    roomId?: string | null;
    public?: boolean;
    purchaseDate?: Date | null;
    price?: number | null;
    hasWarranty?: boolean;
    warrantyType?: string | null;
    warrantyLength?: number | null;
  }
) => {
  return prisma.item.update({
    where: { id: itemId },
    data: {
      name: data.name,
      description: data.description,
      public: data.public,
      purchaseDate: data.purchaseDate,
      price: data.price,
      hasWarranty: data.hasWarranty,
      warrantyType: data.warrantyType,
      warrantyLength: data.warrantyLength,
      rooms: data.roomId
        ? { connect: { id: data.roomId } }
        : data.roomId === null
          ? { set: [] }
          : undefined,
    },
    include: {
      Home: true,
      rooms: true,
      users: true,
    },
  });
};

export const deleteItemById = async (itemId: string) => {
  await prisma.userItem.deleteMany({ where: { itemId } });

  return prisma.item.delete({
    where: { id: itemId },
    include: { Home: true },
  });
};
