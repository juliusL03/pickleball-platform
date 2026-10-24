export type UserRole = 'customer' | 'staff' | 'owner';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface Venue {
  id: string;
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode?: string;
    country: string;
  };
  contact: {
    phone?: string;
    email?: string;
  };
  logoUrl?: string;
}

export interface CourtPricing {
  duration: number;
  price: number;
  isActive: boolean;
}

export interface Court {
  id: string;
  venueId: string;
  name: string;
  slug: string;
  description?: string;
  amenities: string[];
  images: string[];
  pricing?: CourtPricing[];
  isActive: boolean;
  sortOrder?: number;
}

export type BookingStatus =
  | 'hold'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export interface BookingPricing {
  basePrice: number;
  fees: number;
  discount: number;
  total: number;
  currency: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  courtId: string;
  court?: Court;
  startTime: string;
  endTime: string;
  duration: number;
  status: BookingStatus;
  pricing: BookingPricing;
  holdExpiresAt?: string;
  cancellationReason?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  price: number;
}

export type ChangeRequestType = 'change' | 'cancel';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ChangeRequest {
  id: string;
  bookingId: string;
  userId: string;
  type: ChangeRequestType;
  status: ChangeRequestStatus;
  requestedChanges?: {
    newStartTime?: string;
    newDuration?: number;
    newCourtId?: string;
  };
  reason: string;
  staffResponse?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface BlockedSlot {
  id: string;
  courtId?: string;
  startTime: string;
  endTime: string;
  reason: string;
  type: 'holiday' | 'maintenance' | 'private_event' | 'other';
}

export type PaymentMethod = 'gcash' | 'maya' | 'qrph' | 'gateway' | 'bank_transfer';
export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'cancelled';

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
}

export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface BookingQuote {
  available: boolean;
  reason?: string;
  startTime: string;
  endTime: string;
  duration: number;
  basePrice?: number;
  fees?: number;
  discount?: number;
  total?: number;
  currency?: string;
}
