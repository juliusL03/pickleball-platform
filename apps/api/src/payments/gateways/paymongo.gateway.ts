import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import {
  CreatePaymentParams,
  CreatePaymentResult,
  PaymentGateway,
  PaymentMethod,
  RefundParams,
  VerifyWebhookParams,
  VerifyWebhookResult,
} from './payment-gateway.interface';

@Injectable()
export class PaymongoGateway implements PaymentGateway {
  name = 'paymongo';

  constructor(private readonly configService: ConfigService) {}

  private get secretKey(): string {
    return this.configService.get<string>('payments.paymongoSecretKey') || '';
  }

  private get webhookSecret(): string {
    return this.configService.get<string>('payments.paymongoWebhookSecret') || '';
  }

  private get apiBase(): string {
    return (
      this.configService.get<string>('payments.paymongoApiBase') ||
      'https://api.paymongo.com/v1'
    );
  }

  private authHeader(): string {
    const token = Buffer.from(`${this.secretKey}:`).toString('base64');
    return `Basic ${token}`;
  }

  async createPayment(
    params: CreatePaymentParams,
    method: PaymentMethod,
  ): Promise<CreatePaymentResult> {
    if (!this.secretKey) {
      throw new Error('PayMongo secret key not configured');
    }

    const amountInCentavos = Math.round(params.amount * 100);
    const allowedMethods: string[] = [];

    if (method === 'gcash') allowedMethods.push('gcash');
    else if (method === 'maya') allowedMethods.push('paymaya');
    else if (method === 'qrph') allowedMethods.push('qrph');
    else allowedMethods.push('gcash', 'paymaya', 'qrph');

    const body = {
      data: {
        attributes: {
          amount: amountInCentavos,
          currency: params.currency || 'PHP',
          description: params.description,
          payment_method_allowed: allowedMethods,
          metadata: {
            bookingId: params.bookingId,
            ...(params.metadata || {}),
          },
        },
      },
    };

    const response = await fetch(`${this.apiBase}/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await response.json();

    if (!response.ok) {
      const message = json?.errors?.[0]?.detail || 'Failed to create PayMongo payment';
      throw new Error(message);
    }

    const intent = json.data;
    const attributes = intent.attributes || {};
    const nextAction = attributes.next_action;
    const checkoutUrl =
      nextAction?.redirect?.url ||
      nextAction?.web?.url ||
      attributes.checkout_url ||
      undefined;

    return {
      id: intent.id,
      status: attributes.status,
      checkoutUrl,
      clientKey: attributes.client_key,
      referenceNumber: intent.id,
      raw: json,
    };
  }

  verifyWebhook(params: VerifyWebhookParams): VerifyWebhookResult {
    if (!this.webhookSecret) {
      return { valid: false };
    }

    try {
      const signatureHeader = params.signature || '';
      const rawBody =
        typeof params.rawBody === 'string'
          ? params.rawBody
          : params.rawBody.toString('utf8');

      const parts = signatureHeader.split(',');
      let timestamp: string | null = null;
      const signatures: string[] = [];

      for (const part of parts) {
        const [key, value] = part.split('=');
        if (key === 't') timestamp = value;
        if (key === 'te' || key === 'li' || key === 'v1') {
          if (value) signatures.push(value);
        }
      }

      if (!timestamp || signatures.length === 0) {
        return { valid: false };
      }

      const now = Math.floor(Date.now() / 1000);
      const ts = parseInt(timestamp, 10);
      if (isNaN(ts) || Math.abs(now - ts) > 300) {
        return { valid: false };
      }

      const signedPayload = `${timestamp}.${rawBody}`;
      const expected = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(signedPayload)
        .digest('hex');

      const valid = signatures.some((sig) =>
        crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)),
      );

      if (!valid) {
        return { valid: false };
      }

      const event = JSON.parse(rawBody);
      return { valid: true, event };
    } catch {
      return { valid: false };
    }
  }

  async refund(params: RefundParams): Promise<any> {
    if (!this.secretKey) {
      throw new Error('PayMongo secret key not configured');
    }

    const body: any = {
      data: {
        attributes: {
          payment_id: params.paymentId,
          reason: params.reason || 'requested_by_customer',
        },
      },
    };

    if (params.amount) {
      body.data.attributes.amount = Math.round(params.amount * 100);
    }

    const response = await fetch(`${this.apiBase}/refunds`, {
      method: 'POST',
      headers: {
        Authorization: this.authHeader(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const json = await response.json();
    if (!response.ok) {
      const message = json?.errors?.[0]?.detail || 'Failed to refund payment';
      throw new Error(message);
    }
    return json;
  }
}
