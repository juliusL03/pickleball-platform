export type PaymentMethod = 'gcash' | 'maya' | 'qrph' | 'gateway' | 'bank_transfer';

export interface CreatePaymentParams {
  amount: number;
  currency: string;
  description: string;
  bookingId: string;
  metadata?: Record<string, string>;
}

export interface CreatePaymentResult {
  id: string;
  status: string;
  checkoutUrl?: string;
  clientKey?: string;
  referenceNumber?: string;
  raw: any;
}

export interface VerifyWebhookParams {
  rawBody: Buffer | string;
  signature: string;
}

export interface VerifyWebhookResult {
  valid: boolean;
  event?: any;
}

export interface RefundParams {
  paymentId: string;
  amount?: number;
  reason?: string;
}

export interface PaymentGateway {
  name: string;
  createPayment(
    params: CreatePaymentParams,
    method: PaymentMethod,
  ): Promise<CreatePaymentResult>;
  verifyWebhook(params: VerifyWebhookParams): VerifyWebhookResult;
  refund?(params: RefundParams): Promise<any>;
}
