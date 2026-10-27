import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { WebhookController } from './webhook.controller';
import { PaymongoGateway } from './gateways/paymongo.gateway';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
    ]),
    AuditModule,
  ],
  controllers: [WebhookController],
  providers: [PaymentsService, PaymentsResolver, PaymongoGateway],
  exports: [PaymentsService],
})
export class PaymentsModule {}
