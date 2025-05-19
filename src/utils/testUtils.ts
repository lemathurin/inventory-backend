import { Item } from '@prisma/client';

export const createMockItem = (overrides: Partial<Item> = {}): Item => {
   const defaultItem: Item = {
    id: 'default-item-id',
    public: false,
    name: 'Default Item',
    description: null,
    purchaseDate: null,
    price: null,
    hasWarranty: null,
    warrantyType: null,
    warrantyLength: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    homeId: null,
  };

  return {
    ...defaultItem,
    ...overrides,
  };
};
  