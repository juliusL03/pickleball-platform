import { Field, InputType, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CourtType {
  @Field()
  id!: string;
  @Field()
  name!: string;
  @Field()
  slug!: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => [String])
  amenities!: string[];
  @Field(() => [String])
  images!: string[];
  @Field()
  isActive!: boolean;
  @Field()
  sortOrder!: number;
}

@InputType()
export class CreateCourtInput {
  @Field()
  venueId!: string;
  @Field()
  name!: string;
  @Field()
  slug!: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => [String], { nullable: true })
  amenities?: string[];
  @Field(() => [String], { nullable: true })
  images?: string[];
}

@InputType()
export class UpdateCourtInput {
  @Field({ nullable: true })
  name?: string;
  @Field({ nullable: true })
  description?: string;
  @Field(() => [String], { nullable: true })
  amenities?: string[];
  @Field(() => [String], { nullable: true })
  images?: string[];
  @Field({ nullable: true })
  isActive?: boolean;
  @Field({ nullable: true })
  sortOrder?: number;
}
