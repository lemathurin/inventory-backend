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

export const getRoomDetails = async (roomId: string) => {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      home: true,
      items: true,
      users: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
};

export const updateRoomName = async (roomId: string, name: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { name },
    include: {
      home: true,
      users: true,
    },
  });
};

export const deleteRoomById = async (roomId: string) => {
  await prisma.userRoom.deleteMany({ where: { roomId } });

  return prisma.room.delete({ where: { id: roomId } });
};

export const getRoomUsers = async (roomId: string) => {
  return prisma.room.findUnique({
    where: { id: roomId },
    include: {
      users: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });
};
