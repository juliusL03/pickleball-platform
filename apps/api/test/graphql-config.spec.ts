import { Test } from '@nestjs/testing';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { printSchema } from 'graphql';
import { graphqlConfig } from '../src/config/graphql.config';
import { AppResolver } from '../src/app.resolver';

describe('GraphQL API configuration', () => {
  it('exposes the code-first schema at /graphql', async () => {
    expect(graphqlConfig.path).toBe('/graphql');
    expect(graphqlConfig.autoSchemaFile).toBe(true);

    const moduleRef = await Test.createTestingModule({
      imports: [GraphQLSchemaBuilderModule],
    }).compile();

    const schemaFactory = moduleRef.get(GraphQLSchemaFactory);
    const schema = await schemaFactory.create([AppResolver]);

    expect(printSchema(schema)).toContain('hello: String!');
  });
});
