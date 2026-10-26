import { YogaDriver, YogaDriverConfig } from '@graphql-yoga/nestjs';

export const graphqlConfig: YogaDriverConfig = {
  driver: YogaDriver,
  path: '/graphql',
  autoSchemaFile: true,
  graphiql: process.env.NODE_ENV !== 'production',
  context: (initialContext) => ({
    ...initialContext,
    req: initialContext.req,
  }),
};
