import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { Connection, connect } from 'mongoose';
import { AvailabilityService } from '../src/bookings/availability.service';
import { BookingsService } from '../src/bookings/bookings.service';
import { ChangeRequestsService } from '../src/bookings/change-requests.service';
import { PricingService } from '../src/bookings/pricing.service';
import { CourtsService } from '../src/courts/courts.service';
import { VenueService } from '../src/venue/venue.service';
import { Court, CourtSchema } from '../src/courts/schemas/court.schema';
import { Venue, VenueSchema } from '../src/venue/schemas/venue.schema';
import { Booking, BookingSchema } from '../src/bookings/schemas/booking.schema';
import { BookingSlot, BookingSlotSchema } from '../src/bookings/schemas/booking-slot.schema';
import { BlockedSlot, BlockedSlotSchema } from '../src/bookings/schemas/blocked-slot.schema';
import { ChangeRequest, ChangeRequestSchema } from '../src/bookings/schemas/change-request.schema';
import { getModelToken } from '@nestjs/mongoose';
import configuration from '../src/config/configuration';

export interface TestContext {
  module: TestingModule;
  connection: Connection;
  mongod: MongoMemoryServer;
  availabilityService: AvailabilityService;
  bookingsService: BookingsService;
  changeRequestsService: ChangeRequestsService;
  pricingService: PricingService;
  courtsService: CourtsService;
  venueService: VenueService;
  courtId: string;
  dateStr: string;
  at: (time: string) => string;
  teardown: () => Promise<void>;
}

export async function createTestContext(): Promise<TestContext> {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [configuration],
      }),
      MongooseModule.forRoot(uri),
      MongooseModule.forFeature([
        { name: Court.name, schema: CourtSchema },
        { name: Venue.name, schema: VenueSchema },
        { name: Booking.name, schema: BookingSchema },
        { name: BookingSlot.name, schema: BookingSlotSchema },
        { name: BlockedSlot.name, schema: BlockedSlotSchema },
        { name: ChangeRequest.name, schema: ChangeRequestSchema },
      ]),
    ],
    providers: [
      AvailabilityService,
      BookingsService,
      ChangeRequestsService,
      PricingService,
      CourtsService,
      VenueService,
    ],
  }).compile();

  const mongoose = (await import('mongoose')).default;
  const conn = await mongoose.createConnection(uri).asPromise();
  // Register schemas on the connection so tests can access models directly
  conn.model(Booking.name, BookingSchema);
  conn.model(BookingSlot.name, BookingSlotSchema);
  conn.model(BlockedSlot.name, BlockedSlotSchema);
  conn.model(ChangeRequest.name, ChangeRequestSchema);
  conn.model(Court.name, CourtSchema);
  conn.model(Venue.name, VenueSchema);
  const availabilityService = module.get<AvailabilityService>(AvailabilityService);
  const bookingsService = module.get<BookingsService>(BookingsService);
  const changeRequestsService = module.get<ChangeRequestsService>(ChangeRequestsService);
  const pricingService = module.get<PricingService>(PricingService);
  const courtsService = module.get<CourtsService>(CourtsService);
  const venueService = module.get<VenueService>(VenueService);

  // Create venue and court
  const venueModel = conn.model(Venue.name, VenueSchema);
  const venue = await venueModel.create({
    name: 'Test Venue',
    timezone: 'Asia/Manila',
    operatingHours: [],
    isActive: true,
    settings: {
      defaultOpenTime: '10:00',
      defaultCloseTime: '22:00',
      slotMinutes: 30,
      granularityMinutes: 15,
      minDuration: 60,
      maxDuration: 180,
      holdMinutes: 10,
      advanceDays: 30,
      currency: 'PHP',
    },
  });

  const courtModel = conn.model(Court.name, CourtSchema);
  const court = await courtModel.create({
    name: 'Court 1',
    slug: 'court-1',
    venueId: venue._id,
    amenities: [],
    images: [],
    pricing: [
      { duration: 60, price: 500, isActive: true },
      { duration: 90, price: 750, isActive: true },
    ],
    isActive: true,
    sortOrder: 0,
  });

  const dateStr = '2026-11-01';
  const at = (time: string) => {
    // Return ISO string for Manila time
    const [hours, minutes] = time.split(':').map(Number);
    // Create date in UTC that represents the time
    const d = new Date(`${dateStr}T${time}:00+08:00`);
    return d.toISOString();
  };

  const teardown = async () => {
    await conn.dropDatabase();
    await conn.close();
    await mongoose.disconnect();
    await module.close();
    await mongod.stop();
  };

  return {
    module,
    connection: conn,
    mongod,
    availabilityService,
    bookingsService,
    changeRequestsService,
    pricingService,
    courtsService,
    venueService,
    courtId: court._id.toString(),
    dateStr,
    at,
    teardown,
  };
}
