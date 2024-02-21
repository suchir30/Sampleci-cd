import { createUser } from '../services/userService';

const main = async () => {

  const employeeId = process.argv[2];
  const password = process.argv[3];
  const phoneNumber = process.argv[4];

  if (!employeeId || !password || !phoneNumber) {
    console.log("Please provide an employee ID, a password, and a phone number.");
    process.exit(1);
  }

  try {
    await createUser(employeeId, password, phoneNumber);
    console.log(`User with employee ID ${employeeId} created successfully.`);
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

main();
