const axios = require('axios');

const API_URL = 'http://localhost:3000/api/addConsignorBranch';

describe('Branch API Tests (Real API Call)', () => {
  const mockToken = 'Bearer your-real-token-here'; // Replace with a valid token if needed

  test('addConsignorBranch should add a branch successfully', async () => {
    const payload = {
      consignorId: 1,
      branchId: 12
    };

    try {
      const response = await axios.post(API_URL, payload, {
        headers: { Authorization: mockToken },
      });

      //console.log('Response:', response.data); // Debugging output
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('statusCode', 200);
      expect(response.data).toHaveProperty('message', 'Added Successfully');
    } catch (error) {
      console.error('API call failed:', error.response?.status, error.response?.data);
      throw error;
    }
  });
});
