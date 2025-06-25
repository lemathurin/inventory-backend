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

export const findItemsByHomeIdForUserAndPublic = async (
  homeId: string,
  userId: string,
  options?: {
    limit?: number;
    orderBy?: "createdAt" | "name" | "price";
    orderDirection?: "asc" | "desc";
  }
) => {
  const {
    limit,
    orderBy = "createdAt",
    orderDirection = "desc",
  } = options || {};

  return prisma.item.findMany({
    where: {
      homeId: homeId,
      OR: [
        {
          users: {
            some: {
              userId: userId,
            },
          },
        },
        {
          public: true,
        },
      ],
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

export const findUserRoomById = async (roomId: string, userId: string) => {
  return prisma.room.findFirst({
    where: {
      id: roomId,
      users: {
        some: {
          userId,
        },
      },
    },
  });
};

export const findItemsByRoomIdForUserAndPublic = async (
  roomId: string,
  userId: string,
  options?: {
    limit?: number;
    orderBy?: "createdAt" | "name" | "price";
    orderDirection?: "asc" | "desc";
  }
) => {
  const {
    limit,
    orderBy = "createdAt",
    orderDirection = "desc",
  } = options || {};

  return prisma.item.findMany({
    where: {
      rooms: {
        some: {
          id: roomId,
        },
      },
      OR: [
        {
          users: {
            some: {
              userId: userId,
            },
          },
        },
        {
          public: true,
        },
      ],
    },
    include: {
      rooms: true,
      users: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
      OR: [
        {
          users: {
            some: {
              userId: userId,
            },
          },
        },
        {
          public: true,
        },
      ],
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

export const findUserItemMembership = async (
  userId: string,
  itemId: string
) => {
  return prisma.userItem.findFirst({
    where: { userId, itemId },
  });
};
