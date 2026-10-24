import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class ContentType {
  @Field()
  id!: string;
  @Field()
  key!: string;
  @Field()
  type!: string;
  @Field({ nullable: true })
  title?: string;
  @Field(() => GraphQLJSON)
  content!: any;
  @Field()
  isPublished!: boolean;
}

@InputType()
export class UpsertContentInput {
  @Field()
  key!: string;
  @Field()
  type!: string;
  @Field({ nullable: true })
  title?: string;
  @Field(() => GraphQLJSON)
  content!: any;
  @Field({ nullable: true })
  isPublished?: boolean;
}
