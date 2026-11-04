import * as crypto from 'crypto';

/**
 * 46 — Design Pattern Pragmatism: ADAPTER PATTERN
 * Phục vụ Kịch bản 2: Tích hợp hệ thống ngoài (Cấm gọi thư viện thẳng từ Service nghiệp vụ).
 * Tạo Interface rồi viết lớp Adapter bọc lại.
 */

export interface CreateGatewayUrlParams {
  amount: number;
  orderInfo: string;
  orderId: string;
  clientIp: string;
  returnUrl?: string;
  orderType?: string;
}

export interface IPaymentGatewayAdapter {
  readonly gatewayName: string;
  createCheckoutUrl(params: CreateGatewayUrlParams): string;
  verifyReturn(params: Record<string, string>): { isValid: boolean; orderId: string; amount: number; transactionNo: string };
}

export class VNPayAdapter implements IPaymentGatewayAdapter {
  readonly gatewayName = 'VNPAY';

  private readonly tmnCode: string;
  private readonly hashSecret: string;
  private readonly gatewayUrl: string;
  private readonly returnUrl: string;

  constructor(config?: { tmnCode?: string; hashSecret?: string; gatewayUrl?: string; returnUrl?: string }) {
    this.tmnCode = config?.tmnCode || process.env.VNPAY_TMN_CODE || 'CEO1983V';
    this.hashSecret = config?.hashSecret || process.env.VNPAY_HASH_SECRET || 'A89F43BC9201EFA3B872190A812C4590';
    this.gatewayUrl = config?.gatewayUrl || process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.returnUrl = config?.returnUrl || process.env.VNPAY_RETURN_URL || 'https://ceo1983.vn/payment/vnpay-return';
  }

  private formatVNPayDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    const vnTime = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return (
      vnTime.getUTCFullYear() +
      pad(vnTime.getUTCMonth() + 1) +
      pad(vnTime.getUTCDate()) +
      pad(vnTime.getUTCHours()) +
      pad(vnTime.getUTCMinutes()) +
      pad(vnTime.getUTCSeconds())
    );
  }

  private sortObject(obj: Record<string, any>): Record<string, string> {
    const sorted: Record<string, string> = {};
    const keys = Object.keys(obj).sort();
    for (const key of keys) {
      if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
        sorted[key] = String(obj[key]);
      }
    }
    return sorted;
  }

  createCheckoutUrl(params: CreateGatewayUrlParams): string {
    const createDate = this.formatVNPayDate(new Date());
    const vnpParams: Record<string, any> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: this.tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: params.orderId,
      vnp_OrderInfo: params.orderInfo,
      vnp_OrderType: params.orderType || 'billpayment',
      vnp_Amount: params.amount * 100, // VNPay tính bằng đơn vị xu (nhân 100)
      vnp_ReturnUrl: params.returnUrl || this.returnUrl,
      vnp_IpAddr: params.clientIp || '127.0.0.1',
      vnp_CreateDate: createDate,
    };

    const sortedParams = this.sortObject(vnpParams);
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    sortedParams['vnp_SecureHash'] = signed;
    return `${this.gatewayUrl}?${new URLSearchParams(sortedParams).toString()}`;
  }

  verifyReturn(params: Record<string, string>): { isValid: boolean; orderId: string; amount: number; transactionNo: string } {
    const secureHash = params['vnp_SecureHash'];
    const copy = { ...params };
    delete copy['vnp_SecureHash'];
    delete copy['vnp_SecureHashType'];

    const sortedParams = this.sortObject(copy);
    const signData = new URLSearchParams(sortedParams).toString();
    const hmac = crypto.createHmac('sha512', this.hashSecret);
    const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isValid = Boolean(
      secureHash &&
      checkHash &&
      crypto.timingSafeEqual(Buffer.from(secureHash, 'hex'), Buffer.from(checkHash, 'hex'))
    );

    return {
      isValid,
      orderId: params['vnp_TxnRef'] || '',
      amount: params['vnp_Amount'] ? parseInt(params['vnp_Amount'], 10) / 100 : 0,
      transactionNo: params['vnp_TransactionNo'] || '',
    };
  }
}

