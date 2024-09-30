import "reflect-metadata"; // To be imported before typegraphql

import { buildSchema } from "type-graphql";
import { ApolloServer } from "@apollo/server";
import { GraphQLContext } from "./context";
import { customAuthChecker } from "./auth";
import { generatedCrudResolvers, generatedRelationResolvers } from "./resolvers";

export async function buildGraphQLServer() {
  const schema = await buildSchema({
    resolvers: [...generatedCrudResolvers, ...generatedRelationResolvers],
    validate: false,
    authChecker: customAuthChecker,
    authMode: "error"
  });

  const server = new ApolloServer<GraphQLContext>({
    schema,
    introspection: true,
  });
  await server.start();

  return server;
}
