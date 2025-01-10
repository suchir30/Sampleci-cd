import { GraphQLResolveInfo, __Type } from "graphql";
import {
  getPrismaFromContext,
  transformInfoIntoPrismaArgs,
} from "@generated/type-graphql/helpers";
import {
  Ctx,
  Info,
  Mutation,
  Resolver,
  Arg,
  ObjectType,
  Field,
  Int,
  InputType,
} from "type-graphql";
import { GraphQLError } from "graphql";

@ObjectType("RoleWizardOutput", {})
export class RoleWizardOutput {
  @Field((_type) => Int, {
    nullable: false,
  })
  status!: number;
  @Field((_type) => String, {
    nullable: false,
  })
  message!: string;
}

@InputType()
class FieldPermissionInput {
  @Field((_type) => Int, { nullable: true })
  id?: number;

  @Field((_type) => Boolean)
  can_read!: boolean;

  @Field((_type) => Boolean)
  can_edit!: boolean;

  @Field((_type) => Int)
  crmFieldId!: number;

  @Field((_type) => Int)
  roleId!: number;
}

@InputType()
class ObjectPermissionInput {
  @Field((_type) => Int, { nullable: true })
  id?: number;

  @Field((_type) => Boolean)
  can_read!: boolean;

  @Field((_type) => Boolean)
  can_add!: boolean;

  @Field((_type) => Boolean)
  can_edit!: boolean;

  @Field((_type) => Boolean)
  can_delete!: boolean;

  @Field((_type) => Int)
  crmObjectId!: number;

  @Field((_type) => Int)
  roleId!: number;
}

@InputType()
class RoleWizardInput {
  @Field((_type) => ObjectPermissionInput)
  objectPermissionsData!: ObjectPermissionInput;

  @Field((_type) => [FieldPermissionInput])
  fields!: FieldPermissionInput[];
}

@Resolver()
export class RoleWizard {
  @Mutation((_returns) => RoleWizardOutput, {
    nullable: true,
  })
  async roleWizard(
    @Ctx() ctx: any,
    @Arg("data", (_type) => [RoleWizardInput]) data: RoleWizardInput[],
  ): Promise<RoleWizardOutput> {
    const prisma = getPrismaFromContext(ctx);
    try {
      // Process each object permission with its field permissions
      for (const item of data) {
        const { objectPermissionsData, fields } = item;

        // Upsert object permission
        await prisma.cRMObjectPermission.upsert({
          where: objectPermissionsData.id
            ? { id: objectPermissionsData.id }
            : {
                roleId_CRMObjectId: {
                  roleId: objectPermissionsData.roleId,
                  CRMObjectId: objectPermissionsData.crmObjectId,
                },
              },
          create: {
            can_read: objectPermissionsData.can_read,
            can_add: objectPermissionsData.can_add,
            can_edit: objectPermissionsData.can_edit,
            can_delete: objectPermissionsData.can_delete,
            CRMObject: { connect: { id: objectPermissionsData.crmObjectId } },
            role: { connect: { id: objectPermissionsData.roleId } },
          },
          update: {
            can_read: objectPermissionsData.can_read,
            can_add: objectPermissionsData.can_add,
            can_edit: objectPermissionsData.can_edit,
            can_delete: objectPermissionsData.can_delete,
          },
        });

        if (fields && fields.length > 0) {
          for (const fieldData of fields) {
            await prisma.cRMFieldPermission.upsert({
              where: fieldData.id
                ? { id: fieldData.id }
                : {
                    roleId_CRMFieldId: {
                      roleId: fieldData.roleId,
                      CRMFieldId: fieldData.crmFieldId,
                    },
                  },
              create: {
                can_read: fieldData.can_read,
                can_edit: fieldData.can_edit,
                CRMField: { connect: { id: fieldData.crmFieldId } },
                role: { connect: { id: objectPermissionsData.roleId } },
              },
              update: {
                can_read: fieldData.can_read,
                can_edit: fieldData.can_edit,
              },
            });
          }
        }
      }

      return {
        status: 200,
        message: "Successfully updated permissions",
      };
    } catch (error) {
      console.error(error);
      throw new GraphQLError(
        error instanceof Error ? error.message : "Failed to update permissions",
      );
    }
  }
}
