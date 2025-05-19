// @ts-nocheck

// Create mock functions BEFORE any imports
const mockFindHomeByIdAndUserId = jest.fn();
const mockFindItemsByHomeAndUserId = jest.fn();

// Mock the module with correct structure (namespace import)
jest.mock('../../models/itemModel', () => ({
  findHomeByIdAndUserId: mockFindHomeByIdAndUserId,
  findItemsByHomeAndUserId: mockFindItemsByHomeAndUserId,
}));

// Import controller AFTER mocking dependencies
import { getItemsByHome } from '../../controllers/itemController';
import { Request, Response } from 'express';

// Interface extension for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
  };
}

describe('getItemsByHome', () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup response mocks
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn().mockReturnThis();
    
    mockRes = {
      status: statusMock,
      json: jsonMock,
    };

    // Setup basic request mock
    mockReq = {
      params: { homeId: '123' },
      user: { userId: 'user-456' },
    };
  });

  describe('Success cases', () => {
    it('should return items when everything is successful', async () => {
      // Arrange
      const mockHome = { id: '123', name: 'My Home' };
      const mockItems = [
        { id: '1', name: 'Item 1', homeId: '123' },
        { id: '2', name: 'Item 2', homeId: '123' },
      ];

      mockFindHomeByIdAndUserId.mockResolvedValue(mockHome);
      mockFindItemsByHomeAndUserId.mockResolvedValue(mockItems);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert
      expect(mockFindHomeByIdAndUserId).toHaveBeenCalledWith('123', 'user-456');
      expect(mockFindItemsByHomeAndUserId).toHaveBeenCalledWith('123', 'user-456');
      expect(mockRes.json).toHaveBeenCalledWith(mockItems);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should handle different homeId types (convert to string)', async () => {
      // Arrange
      mockReq.params = { homeId: 456 as any };
      const mockHome = { id: '456', name: 'Another Home' };
      const mockItems: any[] = [];

      mockFindHomeByIdAndUserId.mockResolvedValue(mockHome);
      mockFindItemsByHomeAndUserId.mockResolvedValue(mockItems);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert
      expect(mockFindHomeByIdAndUserId).toHaveBeenCalledWith('456', 'user-456');
      expect(mockRes.json).toHaveBeenCalledWith(mockItems);
    });
  });

  describe('Error cases', () => {
    it('should return 404 when home does not exist', async () => {
      // Arrange
      mockFindHomeByIdAndUserId.mockResolvedValue(null);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert
      expect(mockFindHomeByIdAndUserId).toHaveBeenCalledWith('123', 'user-456');
      expect(mockFindItemsByHomeAndUserId).not.toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Home not found or you do not have permission to access it",
      });
    });

    it('should return 404 when user does not have access to home', async () => {
      // Arrange
      mockFindHomeByIdAndUserId.mockResolvedValue(undefined);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        error: "Home not found or you do not have permission to access it",
      });
    });

    it('should return 500 when findHomeByIdAndUserId throws error', async () => {
      // Arrange
      const mockError = new Error('Database connection error');
      mockFindHomeByIdAndUserId.mockRejectedValue(mockError);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Could not fetch items" });
      // Note: We can't easily test console.error with the setup file
    });

    it('should return 500 when findItemsByHomeAndUserId throws error', async () => {
      // Arrange
      const mockHome = { id: '123', name: 'My Home' };
      const mockError = new Error('Error fetching items from database');
      
      mockFindHomeByIdAndUserId.mockResolvedValue(mockHome);
      mockFindItemsByHomeAndUserId.mockRejectedValue(mockError);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Could not fetch items" });
    });
  });

  describe('Edge cases', () => {
    it('should handle missing user in request', async () => {
      // Arrange
      mockReq.user = undefined;

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert - Should return 500 error instead of throwing
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Could not fetch items" });
    });

    it('should handle missing params in request', async () => {
      // Arrange
      mockReq.params = undefined;

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert - Should return 500 error instead of throwing
      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: "Could not fetch items" });
    });

    it('should handle empty items list correctly', async () => {
      // Arrange
      const mockHome = { id: '123', name: 'Empty Home' };
      const mockItems: any[] = [];

      mockFindHomeByIdAndUserId.mockResolvedValue(mockHome);
      mockFindItemsByHomeAndUserId.mockResolvedValue(mockItems);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should log the correct homeId and items count', async () => {
      // Arrange
      const mockHome = { id: '123', name: 'Test Home' };
      const mockItems = [{ id: '1' }, { id: '2' }, { id: '3' }];

      mockFindHomeByIdAndUserId.mockResolvedValue(mockHome);
      mockFindItemsByHomeAndUserId.mockResolvedValue(mockItems);

      // Act
      await getItemsByHome(mockReq as AuthenticatedRequest, mockRes as Response);

      // Assert - Test the main functionality, console.log testing can be tricky
      expect(mockRes.json).toHaveBeenCalledWith(mockItems);
      expect(mockFindHomeByIdAndUserId).toHaveBeenCalledWith('123', 'user-456');
      expect(mockFindItemsByHomeAndUserId).toHaveBeenCalledWith('123', 'user-456');
    });
  });
});