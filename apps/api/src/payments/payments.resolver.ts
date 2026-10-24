import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  InitiatePaymentInput,
  mapPayment,
  PaymentType,
  RefundPaymentInput,
  VerifyBankTransferInput,
} from './dto/payment.dto';

@Resolver()
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => PaymentType)
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @CurrentUser() user: any,
    @Args('input') input: InitiatePaymentInput,
  ) {
    const payment = await this.paymentsService.initiatePayment(user.userId, input);
    return mapPayment(payment);
  }

  @Mutation(() => PaymentType)
  @UseGuards(JwtAuthGuard)
  async verifyBankTransfer(
    @CurrentUser() user: any,
    @Args('input') input: VerifyBankTransferInput,
  ) {
    const payment = await this.paymentsService.verifyBankTransfer(user.userId, input);
    return mapPayment(payment);
  }

  @Mutation(() => PaymentType)
  @UseGuards(JwtAuthGuard)
  async requestRefund(
    @CurrentUser() user: any,
    @Args('input') input: RefundPaymentInput,
  ) {
    const payment = await this.paymentsService.refundPayment(user.userId, input);
    return mapPayment(payment);
  }

  @Query(() => [PaymentType])
  @UseGuards(JwtAuthGuard)
  async myPayments(@CurrentUser() user: any) {
    const payments = await this.paymentsService.myPayments(user.userId);
    return payments.map(mapPayment);
  }

  @Query(() => [PaymentType])
  @UseGuards(JwtAuthGuard)
  async payments(@Args('status', { nullable: true }) status?: string) {
    const payments = await this.paymentsService.payments(status);
    return payments.map(mapPayment);
  }

  @Query(() => PaymentType)
  @UseGuards(JwtAuthGuard)
  async payment(@Args('id') id: string) {
    const payment = await this.paymentsService.payment(id);
    return mapPayment(payment);
  }
}
