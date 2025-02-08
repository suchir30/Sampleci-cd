import jwt from "jsonwebtoken";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { config } from "dotenv";

config();

interface Argv {
  applicationId: number;
  expirationDays: number;
}

async function main(applicationId: number, expirationDays: number) {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not set in the environment");
    }

    if (!applicationId) {
      throw new Error("Application ID must be provided.");
    }

    // Calculate expiration time
    const expirationTime =
      Math.floor(Date.now() / 1000) + expirationDays * 24 * 60 * 60;

    // Create payload
    const payload = {
      applicationId: applicationId,
      exp: expirationTime,
    };

    // Generate token
    const token = jwt.sign(payload, process.env.JWT_SECRET);

    // Print results with colored output
    console.log("\nGenerated JWT Token:");
    console.log(`\u001b[32m${token}\u001b[0m`);
    console.log("\nToken Details:");
    console.log("\u001b[34m", jwt.decode(token), "\u001b[0m");

    return token;
  } catch (error) {
    console.error("\u001b[31mError occurred:", error, "\u001b[0m");
  }
}

// Parse command-line arguments using yargs
const argv = yargs(hideBin(process.argv))
  .option("applicationId", {
    alias: "a",
    type: "number",
    description: "Application ID to be included in the token",
  })
  .option("expirationDays", {
    alias: "e",
    type: "number",
    description: "Token expiration time in days",
    default: 1,
  })
  .check((argv) => {
    if (!argv.applicationId) {
      throw new Error("Application ID must be provided.");
    }
    return true;
  })
  .help().argv as Argv;

// Execute main function with parsed arguments
main(argv.applicationId, argv.expirationDays);

export default main;
