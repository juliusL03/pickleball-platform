import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import {
  InitiatePaymentInput,
  mapPayment,
  PaymentType,
  RefundPaymentInput,
  VerifyBankTransferInput,
} from './dto/payment.dto';
import { AdminPaymentFilterInput, PaymentPage } from './dto/payment-admin.dto';

@Resolver()
export class PaymentsResolver {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly auditService: AuditService,
  ) {}

  @Mutation(() => PaymentType)
  @UseGuards(JwtAuthGuard)
  async initiatePayment(
    @CurrentUser() user: any,
    @Args('input') input: InitiatePaymentInput,
  ) {
    const userId = user?.id || user?.userId;
    const payment = await this.paymentsService.initiatePayment(userId, input);
    return mapPayment(payment);
  }

  @Mutation(() => PaymentType)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('payments.verify')
  async verifyBankTransfer(
    @CurrentUser() user: any,
    @Args('input') input: VerifyBankTransferInput,
  ) {
    const userId = user?.id || user?.userId;
    const payment = await this.paymentsService.verifyBankTransfer(userId, input);
    await this.auditService.log({
      actorId: user?.id,
      actorRole: user?.role,
      action: 'payment.bank_transfer_verified',
      resourceType: 'payment',
      resourceId: payment?._id?.toString() || (payment as any)?.id,
      metadata: { approved: input.approved },
    });
    return mapPayment(payment);
  }

  @Mutation(() => PaymentType)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner')
  @RequirePermissions('payments.refund')
  async requestRefund(
    @CurrentUser() user: any,
    @Args('input') input: RefundPaymentInput,
  ) {
    const userId = user?.id || user?.userId;
    const payment = await this.paymentsService.refundPayment(userId, input);
    await this.auditService.log({
      actorId: user?.id,
      actorRole: user?.role,
      action: 'payment.refunded',
      resourceType: 'payment',
      resourceId: payment?._id?.toString() || (payment as any)?.id,
      metadata: { amount: input.amount },
    });
    return mapPayment(payment);
  }

  @Query(() => [PaymentType])
  @UseGuards(JwtAuthGuard)
  async myPayments(@CurrentUser() user: any) {
    const userId = user?.id || user?.userId;
    const payments = await this.paymentsService.myPayments(userId);
    return payments.map(mapPayment);
  }

  @Query(() => [PaymentType])
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('payments.read')
  async payments(@Args('status', { nullable: true }) status?: string) {
    const payments = await this.paymentsService.payments(status);
    return payments.map(mapPayment);
  }

  @Query(() => PaymentPage)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('payments.read')
  async paymentsPage(
    @Args('filter', { nullable: true }) filter?: AdminPaymentFilterInput,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<PaymentPage> {
    const safeLimit = Math.min(limit || 50, 100);
    const safeOffset = offset || 0;
    const { items, total } = await this.paymentsService.paymentsPaginated(
      filter || {},
      safeLimit,
      safeOffset,
    );
    return {
      items: items.map(mapPayment),
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: safeOffset + items.length < total,
    };
  }

  @Query(() => PaymentType)
  @UseGuards(JwtAuthGuard)
  async payment(@Args('id') id: string) {
    const payment = await this.paymentsService.payment(id);
    return mapPayment(payment);
  }
}
