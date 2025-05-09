import { createItem } from '../itemController'; // Ajuste ce chemin
import { prisma } from 'src/lib/prisma';
import { Response } from 'express';

jest.mock('src/lib/prisma'); // active le mock automatiquement

// Mock de la réponse Express
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

describe('createItem', () => {
  const mockItem = {
    id: 'item-id',
    name: 'Item 1',
    description: 'An example item',
    public: false,
    purchaseDate: null,
    price: null,
    hasWarranty: null,
    warrantyType: null,
    warrantyLength: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    homeId: 'home-id',
    users: [],
    rooms: [],
    medias: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an item and return 201 with the item data', async () => {
    // Arrange
    (prisma.item.create as jest.Mock).mockResolvedValue(mockItem);

    const req = {
      body: {
        name: 'Item 1',
        description: 'An example item',
      },
      params: {
        homeId: 'home-id',
      },
      user: {
        userId: 'user-id',
      },
    } as any;

    const res = mockResponse();

    // Act
    await createItem(req, res);

    // Assert
    expect(prisma.item.create).toHaveBeenCalledWith({
      data: {
        name: 'Item 1',
        description: 'An example item',
        homeId: 'home-id',
        users: {
          create: {
            userId: 'user-id',
            admin: true,
          },
        },
      },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockItem);
  });

  it('should handle errors and return 500 with error message', async () => {
    // Arrange
    const error = new Error('Database error');
    (prisma.item.create as jest.Mock).mockRejectedValue(error);

    const req = {
      body: {
        name: 'Item 2',
        description: 'Another item',
      },
      params: {
        homeId: 'home-id',
      },
      user: {
        userId: 'user-id',
      },
    } as any;

    const res = mockResponse();

    // Act
    await createItem(req, res);

    // Assert
    expect(prisma.item.create).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Could not create item',
      details: 'Database error',
    });
  });
});
