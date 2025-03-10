const axios = require('axios');

describe('Branch API Tests (Real API Call)', () => {
  const API_URL = 'http://localhost:3000/api/getConsignorBranches';
  const mockToken = 'Bearer dummy-token'; // Replace with a valid token if needed

  test('Should fetch branch data successfully', async () => {
    const payload = { consignorId: 1 };

    const response = await axios.post(API_URL, payload, {
      headers: { Authorization: mockToken },
    });

    //console.log(response.data); // Debugging (optional)

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('statusCode', 200);
    expect(response.data).toHaveProperty('data');
    expect(Array.isArray(response.data.data)).toBe(true);
  });

  test('Should handle API errors', async () => {
    const invalidPayload = { consignorId: 'invalid' }; // Expected to fail

    await expect(
      axios.post(API_URL, invalidPayload, {
        headers: { Authorization: mockToken },
      })
    ).rejects.toThrow();
  });
});
