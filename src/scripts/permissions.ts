import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Fetch all CRMObjects
    const crmObjects = await prisma.cRMObject.findMany();

    for (const object of crmObjects) {
      // Check if record already exists
      const existingPermission = await prisma.cRMObjectPermission.findFirst({
        where: { CRMObjectId: object.id },
      });

      if (!existingPermission) {
        // Insert into CRMObjectPermissions
        const isCRMObject = object.name
          .toLowerCase()
          .includes("crm".toLowerCase());
        await prisma.cRMObjectPermission.create({
          data: {
            roleId: 1,
            CRMObjectId: object.id,
            can_add: isCRMObject,
            can_edit: isCRMObject,
            can_read: isCRMObject,
            can_delete: isCRMObject,
          },
        });
      }
    }

    // Fetch all CRMFields and their related CRMObjects
    const crmFields = await prisma.cRMField.findMany({
      include: { CRMObject: true }, // Assuming a relation named CRMObject
    });

    for (const field of crmFields) {
      // Check if record already exists
      const existingPermission = await prisma.cRMFieldPermission.findFirst({
        where: { CRMFieldId: field.id },
      });

      if (!existingPermission) {
        // Determine permissions based on related CRMObject name
        const isRelatedToCRMObject = field.CRMObject.name
          .toLowerCase()
          .includes("crm".toLowerCase());
        await prisma.cRMFieldPermission.create({
          data: {
            roleId: 1,
            CRMFieldId: field.id,
            can_edit: isRelatedToCRMObject,
            can_read: isRelatedToCRMObject,
          },
        });
      }
    }

    console.log(
      "Data inserted/updated into CRMObjectPermissions and CRMFieldPermissions successfully!",
    );
  } catch (error) {
    console.error("Error processing permissions:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();