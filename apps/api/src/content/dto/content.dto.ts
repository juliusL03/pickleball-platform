import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Allow, IsBoolean, IsDefined, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
  @IsString()
  @IsNotEmpty()
  key!: string;

  @Field()
  @IsString()
  @IsIn(['page', 'announcement', 'promotion', 'setting'])
  type!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field(() => GraphQLJSON)
  @IsDefined()
  @Allow()
  content!: any;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
