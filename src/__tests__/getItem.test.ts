import { Request, Response } from 'express';
import { getItem } from '../controllers/itemController';
import * as itemModel from '../models/itemModel';
import { AuthenticatedRequest } from '../middleware/auth';

// Mock the item model
jest.mock('../models/itemModel');
const mockedItemModel = itemModel as jest.Mocked<typeof itemModel>;

describe('getItem Controller', () => {
  let mockRequest: Partial<AuthenticatedRequest>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
   
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
   
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
  });

  describe('Success case - Authorized user', () => {
    it('should return item details when user has permissions', async () => {
      // Arrange
      const mockItemData: any = {
        // Item model properties
        id: 'item-123',
        public: false,
        name: 'Watch',
        description: 'Black watch',
        purchaseDate: new Date('2023-01-15'),
        price: 2500.00,
        hasWarranty: true,
        warrantyType: 'Manufacturer',
        warrantyLength: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
        homeId: 'home-123',

        // Include: Home (optional relation)
        Home: {
          id: 'home-123',
          name: 'House',
          address: '1, Inventory Street',
          createdAt: new Date(),
          updatedAt: new Date()
        },

        // Include: rooms (many-to-many relation)
        rooms: [
          {
            id: 'room-789',
            name: 'Bedroom',
            createdAt: new Date(),
            updatedAt: new Date(),
            homeId: 'home-123'
          }
        ],

        // Include: users with nested user (many-to-many relation via UserItem)
        users: [
          {
            userId: 'user-456',
            itemId: 'item-123',
            admin: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            user: {
              id: 'user-456',
              name: 'Ma Ma',
              email: 'ma.ma@ma.com'
            }
          }
        ],

        // Include: medias (many-to-many relation)
        medias: []
      };

      mockRequest = {
        params: { itemId: 'item-123' },
        user: { userId: 'user-456' }
      };

      // Mock the model function to return the item
      mockedItemModel.findItemByIdAndUserId.mockResolvedValue(mockItemData);

      // Act
      await getItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockedItemModel.findItemByIdAndUserId).toHaveBeenCalledWith('item-123', 'user-456');
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        ...mockItemData,
        users: [{
          id: 'user-456',
          name: 'Ma Ma',
          email: 'ma.ma@ma.com',
          isAdmin: true
        }]
      });
    });
  });

  describe('Failure case - Unauthorized user', () => {
    it('should return 404 error when user does not have permissions', async () => {
      // Arrange
      mockRequest = {
        params: { itemId: 'item-123' },
        user: { userId: 'user-unauthorized' }
      };

      // Mock the model function to return null (no authorization)
      mockedItemModel.findItemByIdAndUserId.mockResolvedValue(null);

      // Act
      await getItem(mockRequest as AuthenticatedRequest, mockResponse as Response);

      // Assert
      expect(mockedItemModel.findItemByIdAndUserId).toHaveBeenCalledWith('item-123', 'user-unauthorized');
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Item not found or you do not have permission to access it"
      });
    });
  });
});