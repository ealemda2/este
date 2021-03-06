import { ApolloServer } from 'apollo-server-micro';
import { makeSchema } from 'nexus';
import path from 'path';
import { prisma } from '../../prisma/generated/prisma-client';
import * as schemaTypes from './schema';
import { Context } from './types';
import { getUser } from './getUser';
import { createModels } from './models';
import { createServerlessHandler } from './createServerlessHandler';

const { PRISMA_ENDPOINT, PRISMA_SECRET, API_SECRET } = process.env;
if (!PRISMA_ENDPOINT || !PRISMA_SECRET || !API_SECRET)
  throw Error(`Did you run 'yarn env dev'?`);

const schema = makeSchema({
  types: schemaTypes,
  outputs: {
    schema: path.join(__dirname, './schema.graphql'),
    typegen: path.join(__dirname, './typegen.ts'),
  },
  typegenAutoConfig: {
    // debug: true,
    sources: [{ source: path.join(__dirname, './types.ts'), alias: 'types' }],
    contextType: 'types.Context',
  },
});

const server = new ApolloServer({
  schema,
  context: async ({ req }): Promise<Context> => {
    const user = await getUser(API_SECRET, prisma, req);
    const models = createModels(prisma, user);
    return { models };
  },
  // Enforce introspection and playground for production.
  introspection: true,
  playground: true,
});

const handler = createServerlessHandler(
  4000,
  server.createHandler({ path: process.env.IS_NOW ? `/_api` : '/' }),
);

// eslint-disable-next-line import/no-default-export
export default handler;
