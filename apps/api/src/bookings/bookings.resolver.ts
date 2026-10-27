import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { BookingsService } from './bookings.service';
import { ChangeRequestsService } from './change-requests.service';
import {
  BlockedSlotType,
  BookingQuoteType,
  BookingType,
  CreateBlockedSlotInput,
  CreateBookingHoldInput,
  TimeSlotType,
  mapBlockedSlot,
  mapBooking,
} from './dto/booking.dto';
import {
  ChangeRequestType,
  RequestBookingCancellationInput,
  RequestBookingChangeInput,
  ReviewChangeRequestInput,
  mapChangeRequest,
} from './dto/change-request.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuditService } from '../audit/audit.service';
import {
  AdminBookingFilterInput,
  BookingPage,
  UpdateBookingStatusInput,
} from './dto/booking-admin.dto';

interface AuthUser {
  id: string;
  role: string;
}

@Resolver()
export class BookingsResolver {
  constructor(
    private availabilityService: AvailabilityService,
    private bookingsService: BookingsService,
    private changeRequestsService: ChangeRequestsService,
    private auditService: AuditService,
  ) {}

  @Query(() => [TimeSlotType])
  availableSlots(
    @Args('courtId', { type: () => ID }) courtId: string,
    @Args('date') date: string,
  ) {
    return this.availabilityService.getAvailableSlots(courtId, date);
  }

  @Query(() => BookingQuoteType)
  async bookingQuote(
    @Args('courtId', { type: () => ID }) courtId: string,
    @Args('startTime') startTime: string,
    @Args('duration', { type: () => Int }) duration: number,
  ) {
    const quote = await this.availabilityService.getQuote(
      courtId,
      startTime,
      duration,
    );
    return {
      available: quote.available,
      reason: quote.reason,
      startTime: quote.startTime,
      endTime: quote.endTime,
      duration: quote.duration,
      basePrice: quote.pricing?.basePrice,
      fees: quote.pricing?.fees,
      discount: quote.pricing?.discount,
      total: quote.pricing?.total,
      currency: quote.pricing?.currency,
    };
  }

  @Query(() => [BookingType])
  @UseGuards(JwtAuthGuard)
  async myBookings(
    @CurrentUser() user: AuthUser,
    @Args('status', { nullable: true }) status?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    const bookings = await this.bookingsService.getMyBookings(
      user.id,
      status,
      limit,
    );
    return bookings.map(mapBooking);
  }

  @Query(() => BookingType)
  @UseGuards(JwtAuthGuard)
  async booking(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.bookingsService.getBooking(id, user.id, user.role);
    return mapBooking(result);
  }

  @Query(() => [BookingType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async bookings(
    @Args('status', { nullable: true }) status?: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ) {
    const results = await this.bookingsService.getAllBookings(status, limit);
    return results.map(mapBooking);
  }

  @Query(() => BookingPage)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('bookings.read')
  async bookingsPage(
    @Args('filter', { nullable: true }) filter?: AdminBookingFilterInput,
    @Args('limit', { type: () => Int, nullable: true, defaultValue: 50 }) limit?: number,
    @Args('offset', { type: () => Int, nullable: true, defaultValue: 0 }) offset?: number,
  ): Promise<BookingPage> {
    const safeLimit = Math.min(limit || 50, 100);
    const safeOffset = offset || 0;
    const { items, total } = await this.bookingsService.getAllBookingsPaginated(
      filter || {},
      safeLimit,
      safeOffset,
    );
    return {
      items: items.map(mapBooking),
      total,
      limit: safeLimit,
      offset: safeOffset,
      hasMore: safeOffset + items.length < total,
    };
  }

  @Mutation(() => BookingType)
  @UseGuards(JwtAuthGuard)
  async createBookingHold(
    @Args('input') input: CreateBookingHoldInput,
    @CurrentUser() user: AuthUser,
  ) {
    const booking = await this.bookingsService.createHold({
      userId: user.id,
      input,
    });
    return mapBooking(booking);
  }

  @Mutation(() => BookingType)
  @UseGuards(JwtAuthGuard)
  async cancelHold(
    @Args('bookingId', { type: () => ID }) bookingId: string,
    @CurrentUser() user: AuthUser,
  ) {
    const booking = await this.bookingsService.cancelHold(user.id, bookingId);
    return mapBooking(booking);
  }

  @Query(() => [ChangeRequestType])
  @UseGuards(JwtAuthGuard)
  async myChangeRequests(@CurrentUser() user: AuthUser) {
    const requests = await this.changeRequestsService.listMine(user.id);
    return requests.map(mapChangeRequest);
  }

  @Query(() => [ChangeRequestType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async changeRequests(
    @Args('status', { nullable: true }) status?: string,
  ) {
    const requests = await this.changeRequestsService.listAll(status);
    return requests.map(mapChangeRequest);
  }

  @Mutation(() => ChangeRequestType)
  @UseGuards(JwtAuthGuard)
  async requestBookingChange(
    @Args('input') input: RequestBookingChangeInput,
    @CurrentUser() user: AuthUser,
  ) {
    const request = await this.changeRequestsService.requestChange(user.id, input);
    return mapChangeRequest(request);
  }

  @Mutation(() => ChangeRequestType)
  @UseGuards(JwtAuthGuard)
  async requestBookingCancellation(
    @Args('input') input: RequestBookingCancellationInput,
    @CurrentUser() user: AuthUser,
  ) {
    const request = await this.changeRequestsService.requestCancellation(
      user.id,
      input,
    );
    return mapChangeRequest(request);
  }

  @Mutation(() => ChangeRequestType)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async reviewChangeRequest(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: ReviewChangeRequestInput,
    @CurrentUser() user: AuthUser,
  ) {
    const request = await this.changeRequestsService.review(id, user.id, input);
    return mapChangeRequest(request);
  }

  @Mutation(() => BookingType)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('bookings.manage')
  async updateBookingStatus(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateBookingStatusInput,
    @CurrentUser() user: any,
  ): Promise<BookingType> {
    const booking = await this.bookingsService.updateBookingStatus(
      id,
      input.status,
      input.reason,
    );
    await this.auditService.log({
      actorId: user?.id,
      actorRole: user?.role,
      action: 'booking.status_changed',
      resourceType: 'booking',
      resourceId: id,
      metadata: { status: input.status, reason: input.reason },
    });
    return mapBooking(booking);
  }

  @Mutation(() => BlockedSlotType)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('schedule.manage')
  async blockSlot(
    @Args('input') input: CreateBlockedSlotInput,
    @CurrentUser() user: AuthUser,
  ) {
    const block = await this.bookingsService.createBlockedSlot({
      courtId: input.courtId,
      startTime: new Date(input.startTime),
      endTime: new Date(input.endTime),
      reason: input.reason,
      type: input.type,
      createdBy: user.id,
    });
    return mapBlockedSlot(block);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  @Roles('owner', 'staff')
  @RequirePermissions('schedule.manage')
  unblockSlot(@Args('id', { type: () => ID }) id: string) {
    return this.bookingsService.deleteBlockedSlot(id);
  }

  @Query(() => [BlockedSlotType])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'staff')
  async blockedSlots(
    @Args('courtId', { type: () => ID, nullable: true }) courtId?: string,
    @Args('from', { nullable: true }) from?: string,
    @Args('to', { nullable: true }) to?: string,
  ) {
    const blocks = await this.bookingsService.getBlockedSlots(courtId, from, to);
    return blocks.map(mapBlockedSlot);
  }
}
