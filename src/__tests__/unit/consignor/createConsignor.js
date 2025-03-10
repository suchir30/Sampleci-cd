const axios = require('axios');

const API_URL = 'http://localhost:3000/api/consignor';

describe('Consignor API Tests (POST Request)', () => {
  const mockToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoiZW1wbG95ZWUxMjMiLCJpYXQiOjE3MTA4MzA4MTksImV4cCI6MTcxMDgzNDQxOX0.KXsDkAn9qv0isyp6DijdMO5p0a_4E3DCIjKFpFS6ej8'; // Use a valid token

  const payload = {
    consignorsData: [
      {
        consignorCode: 'INDUS181',
        publicName: 'null',
        legalName: 'null',
        industryTypeId: 1,
        commodityId: 1,
        address1: '23 gokul Street',
        address2: 'macherla',
        cityId: 1,
        gstNumber: 'GST123456',
        stateId: 1,
        panNumber: 'PAN123456',
        tanNumber: 'TAN123456',
        cinNumber: 'CIN123456',
        taxCategory: 'Category A',
        parentConsignorId: null,
        branchId: 1,
        keyContactName: 'John Doe',
        keyContactDesignation: 'Manager',
        keyContactAddress: '456 Example Road',
        distanceFromBranchKms: 10,
      },
    ],
  };

  test('should add new consignor successfully', async () => {
    try {
      const response = await axios.post(API_URL, payload, {
        headers: {
          Authorization: mockToken,
          'Content-Type': 'application/json',
        },
      });

      //console.log('Response:', response.data); // Debugging output

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('statusCode', 200);
      expect(response.data).toHaveProperty('message', 'Success');
    } catch (error) {
      console.error('API call failed:', error.response?.status, error.response?.data);
      throw error;
    }
  });
});
