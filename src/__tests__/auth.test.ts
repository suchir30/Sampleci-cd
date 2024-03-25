import request from 'supertest';
import app from '../app';// Import the Express app

let employeeId="employee123"
let password="password123"
let newpassword="password123"
let otp="654321"


describe('POST /login', () => {
it('should return a token when provided with valid credentials', async () => {
  const response = await request(app)
    .post('/auth/login')
    .send({ employeeId: employeeId, password: password });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('token');
});

  it('should return a 400 status code when employeeId or password is missing', async () => {
    
    const response = await request(app)
      .post('/auth/login')
      .send({});
    expect(response.status).toBe(400);
  });

  it('should return a 400 status code when provided with invalid credentials', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({ employeeId: password, password: employeeId });

    expect(response.status).toBe(400);
  });
});

describe('POST /generateOTP', () => {
    it('should return a PhoneNumber when provided with valid Employee Id', async () => {
      const response = await request(app)
        .post('/auth/generateOTP')
        .send({ employeeId: employeeId});
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('phoneNumber');
    });
    it('should return a 400 status code when OTP is missing', async () => {
    
        const response = await request(app)
          .post('/auth/generateOTP')
          .send({});
        expect(response.status).toBe(400);
      });
    
      it('should return a 400 status code when provided with invalid employeeId', async () => {
        const response = await request(app)
          .post('/auth/generateOTP')
          .send({ employeeId: password});
    
        expect(response.status).toBe(400);
      });
});


describe('POST /verifyOTP', () => {
    it('should return a OTP verified Successfully when provided with valid OTP', async () => {
          const response = await request(app)
            .post('/auth/verifyOTP')
            .send({ otp: otp});
            expect(response.status).toBe(200);
        });
        it('should return a 400 status code when OTP is missing', async () => {
        
            const response = await request(app)
              .post('/auth/verifyOTP')
              .send({});
            expect(response.status).toBe(400);
          });
        
          it('should return a 400 status code when provided with invalid otp', async () => {
            const response = await request(app)
              .post('/auth/verifyOTP')
              .send({ otp: password});
        console.log(response,"%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%5")
            expect(response.status).toBe(400);

          });
});


describe('POST /changePassword', () => {
    it('should return a OTP verified Successfully when provided with valid OTP', async () => {
          const response = await request(app)
            .post('/auth/changePassword')
            .send({ userId: employeeId, password: newpassword});
            expect(response.status).toBe(200);
        });
        it('should return a 400 status code when OTP is missing', async () => {
        
            const response = await request(app)
              .post('/auth/changePassword')
              .send({});
            expect(response.status).toBe(400);
          });
});