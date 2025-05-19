// __mocks__/prisma.ts

// Import PrismaClient from @prisma/client
import { PrismaClient, Item } from '@prisma/client';

// Mock the PrismaClient with proper types
const mockPrisma = {
  item: {
    // Mock the 'create' method for the 'item' model.
    // We're directly using `jest.Mock` with the return type of `Item`, which matches the model
    create: jest.fn() as jest.Mock<Promise<Item>, [any]>, // `any` can be replaced by the correct type if needed
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
} as unknown as jest.Mocked<PrismaClient>;

// Export the mocked version of the PrismaClient
export const prisma = mockPrisma;
