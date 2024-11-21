import { Resolver, Arg, Query, ObjectType, Field } from "type-graphql";
import * as enums from "@generated/type-graphql/enums";

// Define a class for the return type
@ObjectType()
class EnumValuesResponse {
    @Field(() => String)
    name!: string;

    @Field(() => [String])
    enumValues!: string[];
}

@Resolver()
export class ENUMS {
    @Query(() => [EnumValuesResponse], {
        nullable: false,
    })
    async ENUMS(
        @Arg("names", () => [String], { nullable: false }) names: string[]
    ): Promise<EnumValuesResponse[]> {
        const result: EnumValuesResponse[] = [];

        names.forEach((name) => {
            const enumType = enums[name as keyof typeof enums];
            if (!enumType) {
                throw new Error(`Enum type '${name}' not found.`);
            }
            result.push({
                name,
                enumValues: Object.values(enumType),
            });
        });

        return result;
    }
}
