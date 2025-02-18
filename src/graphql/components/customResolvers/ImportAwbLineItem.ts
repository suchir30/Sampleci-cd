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
import { AirWayBill } from "@prisma/client";
import { calculateChargedWeight } from "../../../services/AWBService";

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
  const awbCodes: string[] = [];

  for (const record of data) {
    if (record.AWBCode) {
      awbCodes.push(record.AWBCode);
    }
  }

  const awbIdMap = await getAWBIDsFromCodes(awbCodes, prisma);
  const awbIds = [...new Set([...awbIdMap.values()])];

  for (const [index, originalRecord] of data.entries()) {
    let { LBH, AWBCode, numOfArticles, articleWeight, ...otherFields } =
      originalRecord;
    //console.log(originalRecord);

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

    const volume =
      lengthCms && breadthCms && heightCms
        ? lengthCms * breadthCms * heightCms
        : null;

    const calculatedFields = {
      lineItemWeight: numOfArticles
        ? numOfArticles * articleWeight
        : articleWeight,
      lineItemVolume: volume && numOfArticles ? volume * numOfArticles : volume,
    };

    const transformedRecord = {
      ...otherFields,
      ...calculatedFields,
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

  await processAWBIDs(awbIds);

  return results;
}

async function getAWBIDsFromCodes(
  AWBCodes: string[],
  prisma: any,
): Promise<Map<string, number>> {
  try {
    const uniqueAWBCodes = [...new Set(AWBCodes)];

    const awbRecords: Pick<AirWayBill, "id" | "AWBCode">[] =
      await prisma.airWayBill.findMany({
        where: {
          AWBCode: {
            in: uniqueAWBCodes,
          },
        },
        select: {
          id: true,
          AWBCode: true,
        },
      });

    const awbMap = new Map<string, number>();
    awbRecords.forEach((record) => {
      awbMap.set(record.AWBCode, record.id);
    });

    return awbMap;
  } catch (error) {
    console.error("Error fetching AWBIDs:", error);
    throw new GraphQLError("Failed to fetch AWBIDs from AWBCodes");
  }
}

async function processAWBIDs(awbIds: number[]): Promise<void> {
  try {
    console.log("Processing AWBIDs:", awbIds);

    await Promise.all(
      awbIds.map(async (awbId) => {
        console.log("Processing AWBID:", awbId);
        await calculateChargedWeight(awbId);
      }),
    );

    console.log("All AWBIDs processed successfully.");
  } catch (error) {
    console.error("Error processing AWBIDs:", error);
    throw new Error("Failed to process AWBIDs");
  }
}
