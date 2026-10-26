import { Field, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

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
  @IsString()
  @IsNotEmpty()
  venueId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

@InputType()
export class UpdateCourtInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;
}
