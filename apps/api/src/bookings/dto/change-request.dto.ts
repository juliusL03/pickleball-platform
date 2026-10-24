import { Field, ID, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

@ObjectType()
export class ChangeRequestChangesType {
  @Field({ nullable: true })
  newStartTime?: string;

  @Field(() => Int, { nullable: true })
  newDuration?: number;

  @Field(() => ID, { nullable: true })
  newCourtId?: string;
}

@ObjectType()
export class ChangeRequestType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  bookingId!: string;

  @Field(() => ID)
  userId!: string;

  @Field()
  type!: string;

  @Field()
  status!: string;

  @Field(() => ChangeRequestChangesType, { nullable: true })
  requestedChanges?: ChangeRequestChangesType;

  @Field()
  reason!: string;

  @Field({ nullable: true })
  staffResponse?: string;

  @Field({ nullable: true })
  reviewedAt?: string;

  @Field({ nullable: true })
  createdAt?: string;
}

@InputType()
export class RequestBookingChangeInput {
  @Field(() => ID)
  @IsString()
  bookingId!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  newStartTime?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(15)
  newDuration?: number;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  newCourtId?: string;

  @Field()
  @IsString()
  @MinLength(5)
  reason!: string;
}

@InputType()
export class RequestBookingCancellationInput {
  @Field(() => ID)
  @IsString()
  @IsNotEmpty()
  bookingId!: string;

  @Field()
  @IsString()
  @MinLength(5)
  reason!: string;
}

@InputType()
export class ReviewChangeRequestInput {
  @Field()
  @IsBoolean()
  approve!: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  staffResponse?: string;
}

export function mapChangeRequest(request: any): ChangeRequestType {
  const changes = request.requestedChanges;
  return {
    id: request._id.toString(),
    bookingId: request.bookingId.toString(),
    userId: request.userId.toString(),
    type: request.type,
    status: request.status,
    requestedChanges: changes
      ? {
          newStartTime: changes.newStartTime
            ? new Date(changes.newStartTime).toISOString()
            : undefined,
          newDuration: changes.newDuration,
          newCourtId: changes.newCourtId,
        }
      : undefined,
    reason: request.reason,
    staffResponse: request.staffResponse,
    reviewedAt: request.reviewedAt
      ? new Date(request.reviewedAt).toISOString()
      : undefined,
    createdAt: request.createdAt
      ? new Date(request.createdAt).toISOString()
      : undefined,
  };
}
