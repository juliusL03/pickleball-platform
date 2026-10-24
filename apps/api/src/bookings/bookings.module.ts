import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourtsModule } from '../courts/courts.module';
import { VenueModule } from '../venue/venue.module';
import { AvailabilityService } from './availability.service';
import { BookingsService } from './bookings.service';
import { BookingsResolver } from './bookings.resolver';
import { ChangeRequestsService } from './change-requests.service';
import { PricingService } from './pricing.service';
import { ExpireHoldsTask } from './expire-holds.task';
import { Booking, BookingSchema } from './schemas/booking.schema';
import {
  BookingSlot,
  BookingSlotSchema,
} from './schemas/booking-slot.schema';
import {
  BlockedSlot,
  BlockedSlotSchema,
} from './schemas/blocked-slot.schema';
import {
  ChangeRequest,
  ChangeRequestSchema,
} from './schemas/change-request.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: BookingSlot.name, schema: BookingSlotSchema },
      { name: BlockedSlot.name, schema: BlockedSlotSchema },
      { name: ChangeRequest.name, schema: ChangeRequestSchema },
    ]),
    CourtsModule,
    VenueModule,
  ],
  providers: [
    AvailabilityService,
    PricingService,
    BookingsService,
    ChangeRequestsService,
    BookingsResolver,
    ExpireHoldsTask,
  ],
  exports: [BookingsService, AvailabilityService, ChangeRequestsService],
})
export class BookingsModule {}
