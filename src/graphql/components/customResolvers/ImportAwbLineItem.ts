import { GraphQLResolveInfo } from "graphql";
import {
  getPrismaFromContext,
  transformInfoIntoPrismaArgs,
} from "@generated/type-graphql/helpers";
import { Ctx, Info, Mutation, Resolver, Arg } from "type-graphql";
import GraphQLJSON from "graphql-type-json";
import { authorizeTableMutation, authorizeTableMutationData } from "../../auth";
import { GraphQLError } from "graphql";
import { CreateManyGeneralOutput } from "./CreateManyGeneral";

@Resolver()
export class ImportAwbLineItem {
  @Mutation((_returns) => CreateManyGeneralOutput, {
    nullable: false,
  })
  async ImportAwbLineItem(
    @Ctx() ctx: any,
    @Info() info: GraphQLResolveInfo,
    @Arg("data", () => GraphQLJSON, { nullable: false }) data: any[],
  ): Promise<CreateManyGeneralOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    const prisma = getPrismaFromContext(ctx);
    const model = "AwbLineItem";

    if (process.env.USE_TOKEN_AUTH !== "0") {
      if (
        authorizeTableMutation(model, "create", ctx.permissions) &&
        authorizeTableMutationData(model, Object.keys(data[0]), ctx.permissions)
      ) {
        const results = await createRecordsInModel(model, data, prisma);
        return results;
      } else {
        throw new GraphQLError("Unauthorized"); // Handle unauthorized access
      }
    } else {
      const results = await createRecordsInModel(model, data, prisma);
      return results;
    }
  }
}

async function createRecordsInModel(
  modelName: string,
  data: any[],
  prisma: any,
): Promise<CreateManyGeneralOutput> {
  const model = prisma[modelName];
  if (!model) {
    throw new GraphQLError(`Model ${modelName} does not exist.`);
  }

  const results: CreateManyGeneralOutput = {
    count: 0,
    errorCount: 0,
    records: [],
  };

  let lastAWBCode: string | null = null;

  for (const [index, originalRecord] of data.entries()) {
    let { LBH, AWBCode, numOfArticles, ...otherFields } = originalRecord;
    console.log(originalRecord);

    if (AWBCode) {
      lastAWBCode = AWBCode; // Update the last seen AWBCode
    } else if (lastAWBCode) {
      AWBCode = lastAWBCode; // Use the last seen AWBCode
    } else {
      results.records.push({
        index,
        data: {
          ...originalRecord,
          message: "ERROR: AWBCode is missing and cannot be inferred",
        },
      });
      results.errorCount++;
      continue; // Skip this record
    }

    // Transform data for insertion
    const [lengthCms, breadthCms, heightCms] =
      LBH && typeof LBH === "string" && LBH.includes("*")
        ? LBH.split("*").map(Number)
        : [null, null, null];
    const transformedRecord = {
      ...otherFields,
      lengthCms,
      breadthCms,
      heightCms,
      numOfArticles: numOfArticles || 1, // Default to 1 if not provided
      AWB: {
        connect: { AWBCode }, // Connect through AWBCode
      },
    };

    try {
      if (!originalRecord.id) {
        // Create new record
        const createdRecord = await model.create({
          data: transformedRecord,
        });
        results.records.push({
          index,
          data: { ...originalRecord, AWBCode, message: `SUCCESS - Created` },
        });
        results.count++;
      } else {
        // Upsert existing record
        const upsertedRecord = await model.upsert({
          where: { id: originalRecord.id },
          update: transformedRecord,
          create: transformedRecord,
        });
        const message = upsertedRecord.createdOn
          ? "SUCCESS - Created"
          : "SUCCESS - Updated";
        results.records.push({
          index,
          data: { ...originalRecord, AWBCode, message },
        });
        results.count++;
      }
    } catch (error: any) {
      const errorMessage =
        error.message.split("\n").pop()?.trim() || "An unknown error occurred";
      results.records.push({
        index,
        data: { ...originalRecord, AWBCode, message: `ERROR: ${errorMessage}` },
      });
      results.errorCount++;
    }
  }

  return results;
}
