import bcrypt from 'bcrypt';

import { User } from '@prisma/client';
import { validateUser } from '../../services/userService';
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
        const user: Partial<User> = {
            id: 1,
            employeeId: "testId",
            hashedPassword: await bcrypt.hash("testPassword", 10),
        };
        const employeeId = "invalidId";
        const password = "testPassword";

        (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

        await expect(validateUser(employeeId, password)).resolves.toBe(false);
    });
});


