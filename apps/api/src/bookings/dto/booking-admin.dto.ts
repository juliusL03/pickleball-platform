import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { BookingType } from './booking.dto';

@ObjectType()
export class BookingPage {
  @Field(() => [BookingType])
  items!: BookingType[];

  @Field(() => Int)
  total!: number;

  @Field(() => Int)
  limit!: number;

  @Field(() => Int)
  offset!: number;

  @Field()
  hasMore!: boolean;
}

@InputType()
export class AdminBookingFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  courtId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  from?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  to?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  search?: string;
}

@InputType()
export class UpdateBookingStatusInput {
  @Field()
  @IsString()
  status!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;
}
