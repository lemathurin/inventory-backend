import { PrismaClient } from "@prisma/client";
import { generateInviteCode } from "../utils/inviteCodes";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const createNewHome = async (
  name: string,
  address: string,
  userId: string
) => {
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
    include: { users: true, rooms: true, items: true },
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

export const findRoomsByHomeId = async (homeId: string) => {
  return prisma.room.findMany({
    where: { homeId: String(homeId) },
    include: {
      items: true,
      users: true,
    },
  });
};

export const updateHomeById = async (
  id: string,
  data: { name?: string; address?: string }
) => {
  return prisma.home.update({
    where: { id: String(id) },
    data: {
      name: data.name,
      address: data.address,
    },
    include: {
      users: true,
      items: true,
    },
  });
};

export const deleteHomeById = async (id: string) => {
  await prisma.userHome.deleteMany({
    where: { homeId: id },
  });

  return prisma.home.delete({
    where: { id: String(id) },
  });
};

export const createHomeInvite = async (
  homeId: string,
  userId: string,
  expiresAt?: Date
) => {
  let code: string;
  let attempts = 0;

  do {
    code = generateInviteCode();
    attempts++;
    if (attempts > 5) throw new Error("Failed to generate unique invite code");
  } while (await prisma.homeInvite.findUnique({ where: { code } }));

  return prisma.homeInvite.create({
    data: {
      code,
      homeId,
      userId,
      expiresAt,
    },
  });
};

export const findHomeInvites = async (homeId: string) => {
  return prisma.homeInvite.findMany({
    where: { homeId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const deleteHomeInvite = async (inviteId: string) => {
  return prisma.homeInvite.delete({
    where: { id: inviteId },
  });
};

export const findInviteByCode = async (code: string) => {
  return prisma.homeInvite.findUnique({
    where: { code },
    include: { home: true },
  });
};

export const addUserToHome = async (
  homeId: string,
  userId: string,
  admin: boolean = false
) => {
  return prisma.userHome.create({
    data: {
      homeId,
      userId,
      admin,
    },
  });
};

export const findUserHomeMembership = async (
  userId: string,
  homeId: string
) => {
  return prisma.userHome.findFirst({
    where: { userId, homeId },
  });
};

export const findUsersByHomeId = async (homeId: string) => {
  return prisma.userHome.findMany({
    where: { homeId },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });
};

export const removeUserFromHome = async (homeId: string, userId: string) => {
  return prisma.userHome.delete({
    where: {
      userId_homeId: {
        userId,
        homeId,
      },
    },
  });
};
