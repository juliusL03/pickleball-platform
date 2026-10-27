import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { PaymentMethod, PaymentType } from '../../payments/dto/payment.dto';

@ObjectType()
export class PaymentPage {
  @Field(() => [PaymentType])
  items!: PaymentType[];

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
export class AdminPaymentFilterInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  status?: string;

  @Field(() => PaymentMethod, { nullable: true })
  @IsOptional()
  @IsEnum(PaymentMethod)
  method?: PaymentMethod;

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
