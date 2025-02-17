const { extractUBOInformation } = require('../services/uboServices');

describe('UBO Service Tests', () => {
  describe('extractUBOInformation', () => {
    test('should handle empty entity', () => {
      const result = extractUBOInformation({});
      expect(result).toEqual({
        directOwners: [],
        beneficialOwners: [],
        ownershipChain: [],
        totalIdentifiedOwnership: 0
      });
    });

    test('should correctly extract direct owners', () => {
      const mockEntity = {
        properties: {
          ownershipStakes: [
            {
              owner: {
                id: 'owner1',
                caption: 'Test Owner'
              },
              percentage: '25.5',
              start_date: '2024-01-01'
            }
          ]
        }
      };

      const result = extractUBOInformation(mockEntity);
      expect(result.directOwners).toHaveLength(1);
      expect(result.directOwners[0].stake).toBe(25.5);
    });

    // Ajoutez d'autres tests selon les besoins
  });
});