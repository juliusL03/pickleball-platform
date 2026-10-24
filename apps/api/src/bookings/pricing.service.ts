import { BadRequestException, Injectable } from '@nestjs/common';
import { Court } from '../courts/schemas/court.schema';

export interface PriceQuote {
  basePrice: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;
}

@Injectable()
export class PricingService {
  quote(
    court: Pick<Court, 'pricing' | 'name'>,
    duration: number,
    currency = 'PHP',
  ): PriceQuote {
    const entries = (court.pricing ?? []).filter(
      (entry) => entry.isActive !== false,
    );
    const match = entries.find((entry) => entry.duration === duration);
    if (!match) {
      const supported = entries.map((entry) => entry.duration).sort((a, b) => a - b);
      throw new BadRequestException(
        supported.length > 0
          ? `Unsupported duration ${duration} minutes. Available durations: ${supported.join(', ')}`
          : `Pricing is not configured for court ${court.name}`,
      );
    }
    return {
      basePrice: match.price,
      fees: 0,
      discount: 0,
      total: match.price,
      currency,
    };
  }

  fromPrice(
    court: Pick<Court, 'pricing'>,
    preferredDuration: number,
    currency = 'PHP',
  ): { price: number; currency: string } {
    const entries = (court.pricing ?? []).filter(
      (entry) => entry.isActive !== false,
    );
    if (entries.length === 0) {
      return { price: 0, currency };
    }
    const match =
      entries.find((entry) => entry.duration === preferredDuration) ??
      entries.slice().sort((a, b) => a.price - b.price)[0];
    return { price: match.price, currency };
  }
}
