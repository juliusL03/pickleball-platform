import { Controller, Headers, Post, Req } from '@nestjs/common';

import { PaymentsService } from './payments.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('paymongo')
  async handlePaymongo(
    @Req() req: any,
    @Headers('paymongo-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;
    await this.paymentsService.handleWebhook(rawBody, signature || '');
    return { received: true };
  }
}
