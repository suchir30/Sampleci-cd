import { Ctx, Resolver, Query } from "type-graphql";
import { getPrismaFromContext } from "@generated/type-graphql/helpers";
import { generateApplicationToken } from "../../../services/authenticationService";
export class generatePodUrl {
  @Query(() => String, {
    nullable: false,
  })
  async generatePodUrl(@Ctx() ctx: any): Promise<string> {
    const prisma = getPrismaFromContext(ctx);
    const results = await prisma.authApplication.findUnique({
      where: {
        applicationId: "podUpload",
      },
      select: {
        id: true,
      },
    });

    if (!results) {
      throw new Error(
        "POD Application not registered for Authentication\n please Contact Admin",
      );
    }

    const token = generateApplicationToken(results.id, 5);

    return `${process.env.POD_BASE_URL}/verify?token=${token}`;
  }
}
