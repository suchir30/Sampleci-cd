import { Request, Response } from 'express';
import { login,generateOTP,verifyOTP,changePassword  } from '../controllers/authController'; 

// Mock Request and Response objects
const req: Request = {} as Request;
const res: Response = {} as Response;

let employeeId = "vroomster1";
let password = "vroomster#1";
let otp="654321";
let newPassword="vroomster#1"

describe('POST /login', () => {
  it('should return a token when provided with valid credentials', async () => {
    req.body = { employeeId: employeeId, password: password };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ token: expect.any(String) }) }));
  });

  it('should return a 400 status code when employeeId or password is missing', async () => {
    req.body = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return a 400 status code when provided with invalid credentials', async () => {
    // Use invalid credentials that don't match any user
    req.body = { employeeId: password, password:employeeId };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await login(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('POST /generateOTP', () => {
  it('should return a PhoneNumber when provided with valid Employee Id', async () => {
    req.body = { employeeId: employeeId };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await generateOTP(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
   });

  it('should return a 400 status code when employeeId is missing', async () => {
    req.body = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await generateOTP(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return a 400 status code when provided with invalid credentials', async () => {
    req.body = { employeeId: password };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await generateOTP(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});


describe('POST /verifyOTP', () => {
  it('should return a OTP Verification Successful when provided with valid OTP', async () => {
    req.body = { otp: otp };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await verifyOTP(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    });

  it('should return a 400 status code when  OTP is missing', async () => {
    req.body = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await verifyOTP(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('should return a 400 status code when provided with invalid credentials', async () => {
    req.body = { otp: password };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();

    await verifyOTP(req, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(400);
  });
});


describe('POST /changePassword', () => {
  it('should return a token when provided with valid credentials', async () => {
    req.body = { userId: employeeId, password: newPassword };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    await changePassword(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(200);
   });

  it('should return a 400 status code when employeeId or password is missing', async () => {
    req.body = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn();
    await changePassword(req, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
