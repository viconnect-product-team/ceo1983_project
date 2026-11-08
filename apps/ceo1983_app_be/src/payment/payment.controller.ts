import { Controller, Post, Body, Req, Get, Query } from '@nestjs/common';
import {
  PaymentService,
  CreateVNPayUrlDto,
  VerifyVNPayReturnDto,
} from './payment.service';

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

  @Post('create-event-checkout')
  createEventCheckout(
    @Body()
    dto: {
      registrationId: string;
      eventId: string;
      amount: number;
      memberName?: string;
      memberCode?: string;
    },
    @Req() req: any,
  ) {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    return this.paymentService.createEventCheckout({
      ...dto,
      clientIp,
    });
  }

  @Post('create-fee-checkout')
  createFeeCheckout(
    @Body()
    dto: {
      invoiceId: string;
      memberId?: string;
      amount: number;
      year?: number;
      memberName?: string;
    },
    @Req() req: any,
  ) {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    return this.paymentService.createFeeCheckout({
      ...dto,
      clientIp,
    });
  }

  @Get('vnpay-return')
  verifyVNPayReturn(@Query() query: Record<string, string>) {
    return this.paymentService.verifyReturnUrl({ vnpParams: query });
  }

  @Post('vnpay-verify')
  verifyVNPayPost(@Body() dto: { vnpParams: Record<string, string> }) {
    return this.paymentService.verifyReturnUrl(dto);
  }

  @Post('simulate-success')
  simulateSuccess(@Body() dto: { orderId: string; amount: number }) {
    return this.paymentService.simulateVnpayPaymentSuccess(
      dto.orderId,
      dto.amount,
    );
  }

  @Post('momo-create-url')
  createMoMoUrl(@Body() dto: any, @Req() req: any) {
    const clientIp =
      req.headers['x-forwarded-for']?.toString().split(',')[0].trim() ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      '127.0.0.1';

    return this.paymentService.createMoMoPaymentUrl(dto, clientIp);
  }

  @Post('momo-ipn')
  handleMoMoIpn(@Body() body: any) {
    return this.paymentService.verifyMoMoIpn(body);
  }

  @Get('momo-return')
  handleMoMoReturn(@Query() query: any) {
    return {
      success: Number(query.resultCode) === 0,
      orderId: query.orderId,
      amount: query.amount,
      transId: query.transId,
      message:
        Number(query.resultCode) === 0
          ? 'Thanh toán MoMo thành công!'
          : query.message || 'Giao dịch không thành công',
    };
  }

  @Post('simulate-momo-success')
  simulateMomoSuccess(@Body() dto: { orderId: string; amount: number }) {
    return this.paymentService.simulateMomoPaymentSuccess(
      dto.orderId,
      dto.amount,
    );
  }
}
