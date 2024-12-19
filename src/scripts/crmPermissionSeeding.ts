import { PrismaClient } from "@prisma/client";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

interface Argv {
  roleId?: number; // Optional role ID
  roleName: string; // Required role name
  mode: boolean; // Mode flag
}

const prisma = new PrismaClient();

async function main(roleId?: number, roleName?: string, mode?: boolean) {
  try {
    if (!roleId && !roleName) {
      throw new Error("Either roleId or roleName must be provided.");
    }
    let role = null;

    if (roleId) {
      role = await prisma.role.findUnique({
        where: { id: roleId },
      });
    }
    if (!role && !roleName) {
      throw new Error(
        "Role not found for roleId, please provide roleName to create a new role.",
      );
    }

    if (!role && !roleId && roleName) {
      role = await prisma.role.findFirst({
        where: { name: roleName },
      });
    }

    if (!role && roleId && roleName) {
      role = await prisma.role.findFirst({
        where: { name: roleName },
      });
    }

    // Create the role if it doesn't exist
    if (!role && roleName) {
      role = await prisma.role.create({
        data: {
          id: roleId || undefined, // Only include id if provided
          name: roleName,
        },
      });
    }

    if (!role) {
      throw new Error("Role could not be determined or created.");
    }

    // Fetch all CRMObjects
    const crmObjects = await prisma.cRMObject.findMany();

    for (const object of crmObjects) {
      // Check if record exists for the role and object combination
      const existingPermission = await prisma.cRMObjectPermission.findFirst({
        where: {
          roleId: role.id,
          CRMObjectId: object.id,
        },
      });

      if (!existingPermission) {
        // Insert into CRMObjectPermissions
        await prisma.cRMObjectPermission.create({
          data: {
            roleId: role.id,
            CRMObjectId: object.id,
            can_add: mode || false,
            can_edit: mode || false,
            can_read: mode || false,
            can_delete: mode || false,
          },
        });
      }
    }

    // Fetch all CRMFields and their related CRMObjects
    const crmFields = await prisma.cRMField.findMany();

    for (const field of crmFields) {
      // Check if record exists for the role and field combination
      const existingFieldPermission = await prisma.cRMFieldPermission.findFirst(
        {
          where: {
            roleId: role.id,
            CRMFieldId: field.id,
          },
        },
      );

      if (!existingFieldPermission) {
        // Insert into CRMFieldPermissions
        await prisma.cRMFieldPermission.create({
          data: {
            roleId: role.id,
            CRMFieldId: field.id,
            can_edit: mode || false,
            can_read: mode || false,
          },
        });
      }
    }

    console.log(
      `For Role: \u001b[34m${role.name}\u001b[0m with ID: \u001b[32m${role.id}\u001b[0m Permissions seeded successfully. 🌱`,
    );
  } catch (error) {
    console.error("Error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command-line arguments using yargs
const argv = yargs(hideBin(process.argv))
  .option("roleId", {
    type: "number",
    description: "The ID of the role",
  })
  .option("roleName", {
    type: "string",
    description: "The name of the role",
  })
  .option("mode", {
    type: "boolean",
    description: "Enable all permissions",
    default: false,
  })
  .check((argv) => {
    if (!argv.roleId && !argv.roleName) {
      throw new Error("Either roleId or roleName must be provided.");
    }
    return true;
  })
  .help().argv as Argv;

// Execute main function with parsed arguments
main(argv.roleId, argv.roleName, argv.mode);

//.demandOption(["roleName"], "At least roleName must be provided.")
