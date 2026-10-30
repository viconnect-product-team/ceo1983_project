import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import { PaymentService, CreateVNPayUrlDto } from './payment.service';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('vnpay-create-url')
  createVNPayUrl(@Body() dto: CreateVNPayUrlDto, @Req() req: any) {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    return this.paymentService.createPaymentUrl(dto, clientIp);
  }

  @Get('vnpay-return')
  verifyVNPayReturn(@Query() query: Record<string, string>) {
    return this.paymentService.verifyReturnUrl({ vnpParams: query });
  }

  @Post('vnpay-verify')
  verifyVNPayPost(@Body() dto: { vnpParams: Record<string, string>; hashSecret?: string }) {
    return this.paymentService.verifyReturnUrl(dto);
  }
}

