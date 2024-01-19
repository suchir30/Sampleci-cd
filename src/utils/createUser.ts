import { createUser } from '../services/userService';

const main = async () => {
  const employeeId = process.argv[2];
  const password = process.argv[3];

  if (!employeeId || !password) {
    console.log("Please provide an employee ID and a password.");
    process.exit(1);
  }

  try {
    await createUser(employeeId, password);
    console.log(`User with employee ID ${employeeId} created successfully.`);
  } catch (error) {
    console.error("Error creating user:", error);
  }
};

main();
