import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { BookingsService } from './bookings.service';

@Injectable()
export class ExpireHoldsTask {
  private readonly logger = new Logger(ExpireHoldsTask.name);

  constructor(private bookingsService: BookingsService) {}

  @Interval(60_000)
  async handleExpiredHolds(): Promise<void> {
    try {
      const expired = await this.bookingsService.expireStaleHolds();
      if (expired > 0) {
        this.logger.log(`Expired ${expired} stale booking hold(s)`);
      }
    } catch (error) {
      this.logger.error('Failed to expire booking holds', error as Error);
    }
  }
}
