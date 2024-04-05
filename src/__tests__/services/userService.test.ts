import bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { validateUser,createUser,updateUserPassword,checkIfUserExists } from '../../services/userService';
import { prismaMock } from '../../singleton';

describe('validateUser', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('should return true for valid password', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "testId",
            hashedPassword: await bcrypt.hash("testPassword", 10),
        };
        const employeeId = "testId";
        const password = "testPassword";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        await expect(validateUser(employeeId, password)).resolves.toBe(true);
    });

    it('should return false for invalid password', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "testId",
            hashedPassword: await bcrypt.hash("testPassword", 10),
        };
        const employeeId = "testId";
        const password = "invalidPassword";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);

        await expect(validateUser(employeeId, password)).resolves.toBe(false);
    });

    it('should return false if user does not exist', async () => {
        // const user: Partial<User> = {
        //     id: 1,
        //     employeeId: "testId",
        //     hashedPassword: await bcrypt.hash("testPassword", 10),
        // };
        const employeeId = "invalidId";
        const password = "testPassword";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(validateUser(employeeId, password)).resolves.toBe(false);
    });
});


describe('updateUserPassword',()=>{
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test('should return true for valid details', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "vroomstertej",
            hashedPassword: await bcrypt.hash("testPassword", 10),
        };
        const userId = "vroomstertej";
        const password = "testPassword123";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        await expect(updateUserPassword(userId, password)).resolves.toBe(true);
    });   
    it('should return false for no password provided', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "vroomstertej",
            hashedPassword: await bcrypt.hash("testPassword", 10),
        };
        const userId = "vroomstertej";
        const password = "";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        await expect(updateUserPassword(userId, password)).resolves.toBe(false);
    });   
    it('should return false for missing mandatory field user', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "vroomstertej",
            hashedPassword: await bcrypt.hash("testPassword", 10),
        };
        const userId = "";
        const password = "testPassword123";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        await expect(updateUserPassword(userId, password)).resolves.toBe(false);
    });   
})



describe('createUser', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });
    test('should return true if new user', async () => {
    
        const employeeId = "vroomster";
        const password = "testPassword123";
        const phoneNumber = "7814044555";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
        await expect(createUser(employeeId, password, phoneNumber)).resolves.toBe(true);
    });  

    it('should return false if user already exists', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "vroomstertej",
            hashedPassword: await bcrypt.hash("testPassword", 10),
            phone1: "7814066666",
        };
        const employeeId = "vroomstertej";
        const password = "testPassword";
        const phoneNumber = "7814066666";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        await expect(createUser(employeeId, password, phoneNumber)).resolves.toBe(false);
    });   
   
    it('should return false if mandatory fields are missed', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "vroomstertej",
            hashedPassword: await bcrypt.hash("testPassword", 10),
            phone1: "7814066666",
        };
        const employeeId = "vroomstertej";
        const password = "testPassword";
        const phoneNumber = "";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        await expect(createUser(employeeId, password, phoneNumber)).resolves.toBe(false);
    });   
});




describe('checkIfUserExists', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    test('should return true if user exists : checkIfUserExists ', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "vroomster",
            hashedPassword: await bcrypt.hash("testPassword", 10),
            phone1: "7814066666",
        };
        const employeeId = "vroomster";
        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        const expectedResponse = {"exists": true, "phoneNumber": "7814066666"};
        await expect(checkIfUserExists(employeeId)).resolves.toStrictEqual(expectedResponse);
     }); 
     it('should return false if user does not exists : checkIfUserExists ', async () => {
        const employeeId = "vroomsterSreeram";
        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
        const expectedResponse = { exists: false };
        await expect(checkIfUserExists(employeeId)).resolves.toStrictEqual(expectedResponse);
     }); 
     it('should return false if employeeId field missing : checkIfUserExists ', async () => {
        const user: Partial<User> = {
            id: 1,
            employeeId: "vroomster",
            hashedPassword: await bcrypt.hash("testPassword", 10),
            phone1: "7814066666",
        };
        const employeeId = "";
        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(user);
        const expectedResponse = { exists: false };
        await expect(checkIfUserExists(employeeId)).resolves.toStrictEqual(expectedResponse);
     }); 
})