import {MiddlewareFn} from "type-graphql";
import {incrementAlphanumericCode} from "../../../services/AWBService";
import {getPrismaFromContext} from "@generated/type-graphql/helpers";

export const TripDetailsInterceptor: MiddlewareFn = async ({args, context}, next) => {
    const prisma = getPrismaFromContext(context);
    const latestTrip = await prisma.tripDetails.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true, tripCode: true }
    });
    console.log(latestTrip,"latestTripResponse")


    // Set initial alphanumeric and numeric parts
    let alphanumericPart = 'AAA';
    let numericPart = 1;

    if (latestTrip) {
        const lastAlphaCode = latestTrip.tripCode.slice(-6, -3); // Get the 'AAA' part
        const lastNumCode = parseInt(latestTrip.tripCode.slice(-3)); // Get the '000' part
        console.log(lastAlphaCode,"lastAlphaCode",lastNumCode,"lastAlphaCode")
        alphanumericPart = lastAlphaCode;
        numericPart = lastNumCode + 1;

        // If numeric part reaches 1000, reset it and increment alphanumeric part
        if (numericPart >= 1000) {
            alphanumericPart = incrementAlphanumericCode(alphanumericPart);
            numericPart = 1;
        }
    }
    args.data.tripCode = `TRIP${alphanumericPart}${String(numericPart).padStart(3, '0')}`;
    console.log(args);
    await next();
};
