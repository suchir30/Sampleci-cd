import {Resolver, Arg, ObjectType, Field, Query} from "type-graphql";
import * as enums from "@generated/type-graphql/enums";

@ObjectType("EnumResolverOutput")
export class EnumResolverOutput {
    @Field(_type => [String])
    enumValues!: string[];
}

@Resolver()
export class getEnum {
    @Query(() => EnumResolverOutput, {
        nullable: false,
    })
    async getEnum(
        @Arg('name', () => String, { nullable: false }) name: string
    ): Promise<EnumResolverOutput> {
        const enumKey = Object.keys(enums).find((key) =>
            key.toLowerCase().includes(name.toLowerCase())
        );

        if (!enumKey) {
            throw new Error(`Enum type '${name}' not found.`);
        }

        const enumType = enums[enumKey as keyof typeof enums];

        return {
            enumValues: Object.values(enumType),
        };
    }
}
