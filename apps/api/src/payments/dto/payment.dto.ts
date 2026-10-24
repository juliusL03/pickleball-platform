import { Field, ID, InputType, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum PaymentMethod {
  GCASH = 'gcash',
  MAYA = 'maya',
  QRPH = 'qrph',
  GATEWAY = 'gateway',
  BANK_TRANSFER = 'bank_transfer',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

registerEnumType(PaymentMethod, { name: 'PaymentMethod' });
registerEnumType(PaymentStatus, { name: 'PaymentStatus' });

@ObjectType()
export class PaymentGatewayType {
  @Field({ nullable: true })
  provider?: string;

  @Field({ nullable: true })
  transactionId?: string;

  @Field({ nullable: true })
  referenceNumber?: string;

  @Field(() => Int, { nullable: true })
  fee?: number;
}

@ObjectType()
export class PaymentBankTransferType {
  @Field({ nullable: true })
  bankName?: string;

  @Field({ nullable: true })
  accountName?: string;

  @Field({ nullable: true })
  referenceNumber?: string;

  @Field({ nullable: true })
  proofImageUrl?: string;

  @Field(() => ID, { nullable: true })
  verifiedBy?: string;

  @Field({ nullable: true })
  verifiedAt?: string;

  @Field({ nullable: true })
  notes?: string;
}

@ObjectType()
export class PaymentType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  bookingId!: string;

  @Field(() => ID)
  userId!: string;

  @Field(() => Int)
  amount!: number;

  @Field()
  currency!: string;

  @Field(() => PaymentMethod)
  method!: PaymentMethod;

  @Field(() => PaymentStatus)
  status!: PaymentStatus;

  @Field(() => PaymentGatewayType, { nullable: true })
  gateway?: PaymentGatewayType;

  @Field(() => PaymentBankTransferType, { nullable: true })
  bankTransfer?: PaymentBankTransferType;

  @Field({ nullable: true })
  paidAt?: string;

  @Field({ nullable: true })
  refundedAt?: string;

  @Field(() => Int, { nullable: true })
  refundAmount?: number;

  @Field({ nullable: true })
  refundReason?: string;

  @Field({ nullable: true })
  checkoutUrl?: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}

@InputType()
export class InitiatePaymentInput {
  @Field(() => ID)
  @IsNotEmpty()
  bookingId!: string;

  @Field(() => PaymentMethod)
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  proofImageUrl?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  referenceNumber?: string;
}

@InputType()
export class VerifyBankTransferInput {
  @Field(() => ID)
  @IsNotEmpty()
  paymentId!: string;

  @Field()
  @IsBoolean()
  approved!: boolean;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  notes?: string;
}

@InputType()
export class RefundPaymentInput {
  @Field(() => ID)
  @IsNotEmpty()
  paymentId!: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  amount?: number;

  @Field()
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export function mapPayment(payment: any): PaymentType {
  const doc = payment?.toObject ? payment.toObject() : payment;
  return {
    id: doc._id?.toString() || doc.id,
    bookingId: doc.bookingId?.toString?.() || doc.bookingId,
    userId: doc.userId?.toString?.() || doc.userId,
    amount: doc.amount,
    currency: doc.currency,
    method: doc.method,
    status: doc.status,
    gateway: doc.gateway || undefined,
    bankTransfer: doc.bankTransfer
      ? {
          ...doc.bankTransfer,
          verifiedBy: doc.bankTransfer.verifiedBy?.toString?.(),
          verifiedAt: doc.bankTransfer.verifiedAt?.toISOString?.(),
        }
      : undefined,
    paidAt: doc.paidAt?.toISOString?.(),
    refundedAt: doc.refundedAt?.toISOString?.(),
    refundAmount: doc.refundAmount,
    refundReason: doc.refundReason,
    checkoutUrl: doc.checkoutUrl,
    createdAt: doc.createdAt?.toISOString?.() || new Date().toISOString(),
    updatedAt: doc.updatedAt?.toISOString?.() || new Date().toISOString(),
  };
}
