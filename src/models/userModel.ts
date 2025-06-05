import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const createUser = async (
  email: string,
  password: string,
  name: string
) => {
  return prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      name,
    },
  });
};

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
    include: {
      homes: {
        select: {
          homeId: true,
          home: {
            select: { id: true },
          },
        },
      },
    },
  });
};

export const findUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      homes: {
        select: {
          homeId: true,
          home: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      },
      items: {
        select: {
          item: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    },
  });
};

export const updateUserName = async (userId: string, name: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { name: name },
    select: { id: true, name: true, email: true },
  });
};

export const updateUserEmail = async (userId: string, email: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { email: email },
    select: { id: true, name: true, email: true },
  });
};

export const updateUserPassword = async (
  userId: string,
  newPassword: string
) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: { id: true, name: true, email: true },
  });
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const deleteUser = async (userId: string) => {
  return prisma.$transaction(async (prisma) => {
    // Delete associated items
    await prisma.userItem.deleteMany({ where: { userId } });
    await prisma.item.deleteMany({ where: { users: { some: { userId } } } });

    // Delete associated homes
    await prisma.userHome.deleteMany({ where: { userId } });
    await prisma.home.deleteMany({ where: { users: { some: { userId } } } });

    // Finally, delete the user
    return prisma.user.delete({
      where: { id: userId },
    });
  });
};

export const getAllUsersWithDetails = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      homes: true,
      items: true,
    },
  });
};

// Helper function to validate email format
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
