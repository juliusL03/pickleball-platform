import { registerAs } from '@nestjs/config';

export default registerAs('payments', () => ({
  paymongoSecretKey: process.env.PAYMONGO_SECRET_KEY || '',
  paymongoPublicKey: process.env.PAYMONGO_PUBLIC_KEY || '',
  paymongoWebhookSecret: process.env.PAYMONGO_WEBHOOK_SECRET || '',
  paymongoApiBase: process.env.PAYMONGO_API_BASE || 'https://api.paymongo.com/v1',
}));
