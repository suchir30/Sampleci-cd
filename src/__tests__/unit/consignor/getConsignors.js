const axios = require('axios');

const API_URL = 'http://localhost:3000/api/consignor';

describe('Consignor API Tests (Real API Call)', () => {
  const mockToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoiZW1wbG95ZWUxMjMiLCJpYXQiOjE3MTA4MzA4MTksImV4cCI6MTcxMDgzNDQxOX0.KXsDkAn9qv0isyp6DijdMO5p0a_4E3DCIjKFpFS6ej8'; // Replace with a valid token if needed

  test('getConsignor should fetch consignor data successfully', async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: { Authorization: mockToken },
      });

      //console.log('Response:', response.data); // Debugging output

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('statusCode', 200);
      expect(response.data).toHaveProperty('message', 'Success');
      expect(response.data).toHaveProperty('data');
      expect(Array.isArray(response.data.data)).toBe(true);
      
      if (response.data.data.length > 0) {
        const firstConsignor = response.data.data[0];
        expect(firstConsignor).toHaveProperty('consignorId');
        expect(firstConsignor).toHaveProperty('consignorCode');
        expect(firstConsignor).toHaveProperty('createdOn');
      }
    } catch (error) {
      console.error('API call failed:', error.response?.status, error.response?.data);
      throw error;
    }
  });
});
