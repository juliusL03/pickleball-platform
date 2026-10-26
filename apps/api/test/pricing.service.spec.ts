import { BadRequestException } from '@nestjs/common';
import { PricingService } from '../src/bookings/pricing.service';

describe('PricingService', () => {
  let service: PricingService;

  beforeEach(() => {
    service = new PricingService();
  });

  it('quotes with matching pricing', () => {
    const court: any = {
      name: 'Court 1',
      pricing: [
        { duration: 60, price: 500, isActive: true },
        { duration: 90, price: 750, isActive: true },
      ],
    };
    const quote = service.quote(court, 60);
    expect(quote.total).toBe(500);
    expect(quote.basePrice).toBe(500);
  });

  it('throws for unsupported duration', () => {
    const court: any = {
      name: 'Court 1',
      pricing: [{ duration: 60, price: 500, isActive: true }],
    };
    expect(() => service.quote(court, 90)).toThrow(BadRequestException);
  });
});
