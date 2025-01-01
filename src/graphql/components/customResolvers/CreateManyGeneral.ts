import { GraphQLResolveInfo } from "graphql";
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
} from "type-graphql";
import GraphQLJSON from "graphql-type-json";
import { authorizeTableMutation, authorizeTableMutationData } from "../../auth";
import { GraphQLError } from "graphql";

@ObjectType("CreateManyGeneralOutput", {})
export class CreateManyGeneralOutput {
  @Field((_type) => Int, {
    nullable: false,
  })
  count!: number;

  @Field((_type) => Int, {
    nullable: false,
  })
  errorCount!: number;

  @Field((_type) => [RecordResultOutput], {
    nullable: true,
  })
  records!: RecordResultOutput[];

  //errors?: ErrorOutput[];
}

@ObjectType("ErrorOutput")
class ErrorOutput {
  @Field((_type) => Int)
  index!: number;

  @Field((_type) => String)
  error!: string; // Or adjust type based on how you want to structure the error
}

@ObjectType("RecordResultOutput")
class RecordResultOutput {
  @Field((_type) => Int)
  index!: number;

  @Field((_type) => GraphQLJSON)
  data!: any;
}

@Resolver()
export class CreateManyGeneral {
  @Mutation((_returns) => CreateManyGeneralOutput, {
    nullable: false,
  })
  async CreateManyGeneral(
    @Ctx() ctx: any,
    @Info() info: GraphQLResolveInfo,
    @Arg("model", () => String, { nullable: false }) model: string,
    @Arg("data", () => GraphQLJSON, { nullable: false }) data: any[],
  ): Promise<CreateManyGeneralOutput> {
    const { _count } = transformInfoIntoPrismaArgs(info);
    const prisma = getPrismaFromContext(ctx);

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

const primaryKeyMapping: { [key: string]: string } = {
  Consignee: "consigneeId",
  Consignor: "consignorId",
};

async function createRecordsInModel(
  modelName: string,
  data: any[],
  prisma: any,
): Promise<CreateManyGeneralOutput> {
  const model = prisma[modelName];
  if (!model) {
    throw new GraphQLError(`Model ${modelName} does not exist.`);
  }

  // Use the mapping to find the primary key or default to 'id'
  const primaryKeyField = primaryKeyMapping[modelName] || "id";

  const results: CreateManyGeneralOutput = {
    count: 0,
    errorCount: 0,
    records: [],
  };

  const createData = data.filter((record) => !record[primaryKeyField]);
  const upsertData = data.filter((record) => record[primaryKeyField]);

  if (createData.length > 0) {
    try {
      await prisma.$transaction(async (prismaTransaction: any) => {
        await prismaTransaction[modelName].createMany({
          data: createData,
        });

        const largestIdAfterInsert = await prismaTransaction[
          modelName
        ].findFirst({
          orderBy: { [primaryKeyField]: "desc" },
          select: { [primaryKeyField]: true },
        });
        const largestId = largestIdAfterInsert
          ? largestIdAfterInsert[primaryKeyField]
          : 0;
        let currentId = largestId - createData.length + 1;

        createData.forEach((record, index) => {
          results.records.push({
            index,
            data: {
              ...record,
              message: `A SUCCESS - Created`,
              [primaryKeyField]: `${currentId++}`,
            },
          });
        });
        results.count += createData.length; // Count all created records
      });
    } catch (error: any) {
      console.error(`Batch createMany failed:`, error.message);
      console.error(`Initiating Row level creation 3 2 1...`);
      await processCreateRowByRow(createData, model, primaryKeyField, results);
    }
  }

  const upsertPromises = upsertData.map(async (record, index) => {
    try {
      const upsertedRecord = await model.upsert({
        where: { [primaryKeyField]: record[primaryKeyField] },
        update: record,
        create: record,
      });

      const now = new Date();
      const createdAt = upsertedRecord.createdOn;
      const createdToday = createdAt.toDateString() === now.toDateString();
      const timeDiff = Math.abs(now.getTime() - createdAt.getTime()) < 120000;
      const message =
        createdToday && timeDiff ? `SUCCESS - Created` : `SUCCESS - Updated`;

      results.records.push({
        index,
        data: {
          ...record,
          message: message,
        },
      });

      results.count++;
    } catch (error: any) {
      const errorLines = error.message.split("\n");
      const lastLine = errorLines[errorLines.length - 1].trim();

      results.records.push({
        index,
        data: {
          ...record,
          message: `ERROR: ${lastLine || "An unknown error occurred"}`,
        },
      });
      results.errorCount++;
    }
  });

  await Promise.all(upsertPromises);

  return results;
}

async function processCreateRowByRow(
  data: any[],
  model: any,
  primaryKeyField: string,
  results: CreateManyGeneralOutput,
) {
  const createPromises = data.map(async (record, index) => {
    try {
      const createdRecord = await model.create({ data: record });
      results.records.push({
        index,
        data: {
          ...record,
          message: `SUCCESS - Created`,
          [primaryKeyField]: `${createdRecord[primaryKeyField]}`,
        },
      });
      results.count++;
    } catch (error: any) {
      const errorLines = error.message.split("\n");
      const lastLine = errorLines[errorLines.length - 1].trim();

      results.records.push({
        index,
        data: {
          ...record,
          message: `ERROR: ${lastLine || "An unknown error occurred"}`,
          [primaryKeyField]: ` `,
        },
      });
      results.errorCount++;
    }
  });

  await Promise.all(createPromises);
}
