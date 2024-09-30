import { AuthChecker } from "type-graphql";
import { GraphQLContext } from "./context";
import { RolePermissions } from "../services/userService";
import { table } from "console";

type MutationType = "create" | "delete" | "update" | "upsert";

function authorizeTableMutation(tableName: string, mutationType: MutationType, permissions: RolePermissions | null) {
  if (!permissions) {
    throw Error("Permissions have not been initialized.");
  }
  const tablePermission = permissions.CRMTablePermissions.find(
    tablePermission => tablePermission.CRMTable.name === tableName);
  if (!tablePermission) {
    throw Error(`No permissions are registered for table: ${tableName}`);
  }
  switch (mutationType) {
    case "create":
    case "upsert":
      return !!tablePermission.can_add;
    case "delete":
      return !!tablePermission.can_delete;
    case "update":
      return !!tablePermission.can_edit;
    default:
      throw new Error(`Invalid mutation type: ${mutationType}`);
  }
}

function authorizeTableMutationData(tableName: string, data: any[], permissions: RolePermissions | null) {
  if (!permissions) {
    throw Error("Permissions have not been initialized.");
  }
  const columnFields = new Set();
  for (let item of data) {
    for (const key of Object.keys(item)) {
      columnFields.add(key);
    }
  }
  console.log({data});
  console.log(columnFields);
  for (let columnName of columnFields) {
    const columnPermission = permissions.CRMColumnPermissions.find(
      columnPermission => columnPermission.CRMColumn.name === columnName &&
        columnPermission.CRMColumn.CRMTable.name === tableName);
    if (!columnPermission) {
      throw Error(`No permissions are registered for column ${columnName} of table: ${tableName} `);
    }
    if (!columnPermission.can_edit) {
      return false;
    }
  }
  return true;
}

function authorizeColumnQuery(tableName: string, columnName: string, permissions: RolePermissions | null) {
  if (!permissions) {
    throw Error("Permissions have not been initialized.");
  }
  const columnPermission = permissions.CRMColumnPermissions.find(
    columnPermission => columnPermission.CRMColumn.name === columnName &&
      columnPermission.CRMColumn.CRMTable.name === tableName);
  if (!columnPermission) {
    throw Error(`No permissions are registered for column ${columnName} of table: ${tableName} `);
  }
  return !!columnPermission.can_read;
}

export const customAuthChecker: AuthChecker<GraphQLContext> = (
  { root, args, context, info },
  roles,
) => {
  if (process.env.USE_TOKEN_AUTH === '0') {
    return true;
  }
  if (info.parentType.name === 'Query') { // Resolver level check
    // No check at resolver level for
    console.log("Query auth check");
    return true;
  } else if (info.parentType.name === 'Mutation') { // Resolver level check
    console.log("Mutation auth check");
    const resolverName = info.fieldName;
    let data = args.data || null;
    let mutationName = null;
    let mutationType: MutationType;
    if (resolverName.startsWith('createOne')) {
      data = [data];
      mutationName = 'createOne';
      mutationType = 'create';
    } else if (resolverName.startsWith('createMany')) {
      mutationName = 'createMany';
      mutationType = 'create';
    } else if (resolverName.startsWith('deleteOne')) {
      mutationName = 'deleteOne';
      mutationType = 'delete';
    } else if (resolverName.startsWith('deleteMany')) {
      mutationName = 'deleteMany';
      mutationType = 'delete';
    } else if (resolverName.startsWith('updateOne')) {
      data = [data];
      mutationName = 'updateOne';
      mutationType = 'update';
    } else if (resolverName.startsWith('updateMany')) {
      mutationName = 'updateMany';
      mutationType = 'update';
    } else if (resolverName.startsWith('upsertOne')) {
      data = [data]
      mutationName = 'upsertOne';
      mutationType = 'upsert';
    } else {
      throw new Error(`Unsupported mutation type for resolver: ${resolverName}`);
    }
    const tableName = resolverName.replace(mutationName, '');
    console.log("Debug:", mutationName, mutationType, tableName);
    const tableAuthorized = authorizeTableMutation(tableName, mutationType, context.permissions);
    console.log("tableAuthorized");
    let tableDataAuthorized = true;
    if (data) {
      tableDataAuthorized = authorizeTableMutationData(tableName, data, context.permissions)
      console.log("tableDataAuthorized", tableDataAuthorized)
    }
    return tableAuthorized && tableDataAuthorized;
  }

  // Field level checks
  const tableName = info.parentType.name;
  const columnName = info.fieldName;
  const columnQuryAuthorized =  authorizeColumnQuery(tableName, columnName, context.permissions);
  console.log("Column query auth:", tableName, columnName, columnQuryAuthorized);
  return columnQuryAuthorized;
};