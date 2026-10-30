import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';

export class CreateVNPayUrlDto {
  amount!: number; // Số tiền VNĐ
  orderInfo!: string; // Nội dung đơn hàng
  orderType?: string; // Loại đơn hàng (billpayment, topup, other)
  returnUrl?: string; // URL quay về sau thanh toán
  tmnCode?: string; // Dynamic TMN Code (nếu client gửi lên)
  hashSecret?: string; // Dynamic Secret (nếu client gửi lên)
  vnpUrl?: string; // Gateway URL (sandbox hoặc production)
  ipAddr?: string; // IP người dùng
  orderId?: string; // Mã đơn hàng tùy chỉnh
}

export class VerifyVNPayReturnDto {
  vnpParams!: Record<string, string>;
  hashSecret?: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  // Mặc định Sandbox VNPay
  private readonly defaultTmnCode = process.env.VNPAY_TMN_CODE || 'CEO1983V';
  private readonly defaultHashSecret = process.env.VNPAY_HASH_SECRET || 'A89F43BC9201EFA3B872190A812C4590';
  private readonly defaultVnpUrl =
    process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  private readonly defaultReturnUrl =
    process.env.VNPAY_RETURN_URL || 'https://ceo1983.vn/payment/vnpay-return';

  /**
   * Định dạng thời gian theo chuẩn VNPay: YYYYMMDDHHmmss (Múi giờ GMT+7)
   */
  private formatVNPayDate(date: Date): string {
    const pad = (n: number) => (n < 10 ? '0' + n : String(n));
    // Cộng 7 tiếng cho múi giờ Việt Nam
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

  /**
   * Sắp xếp object tham số theo chuẩn VNPay (A-Z)
   */
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

  /**
   * Tạo URL thanh toán VNPay chuẩn v2.1.0 kèm mã hóa HMAC-SHA512
   */
  createPaymentUrl(dto: CreateVNPayUrlDto, clientIp = '127.0.0.1') {
    if (!dto.amount || dto.amount <= 0) {
      throw new HttpException('Số tiền thanh toán không hợp lệ', HttpStatus.BAD_REQUEST);
    }

    const tmnCode = dto.tmnCode?.trim() || this.defaultTmnCode;
    const hashSecret = dto.hashSecret?.trim() || this.defaultHashSecret;
    const vnpUrl = dto.vnpUrl?.trim() || this.defaultVnpUrl;
    const returnUrl = dto.returnUrl?.trim() || this.defaultReturnUrl;

    const date = new Date();
    const createDate = this.formatVNPayDate(date);
    const expireDate = this.formatVNPayDate(new Date(date.getTime() + 15 * 60 * 1000)); // Hết hạn sau 15 phút
    const orderId = dto.orderId?.trim() || `CEO1983_${Date.now()}`;

    const vnpParams: Record<string, string> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: dto.orderInfo?.trim() || 'CLB CEO 1983 - Thanh toan hoi phi / ve su kien',
      vnp_OrderType: dto.orderType?.trim() || 'billpayment',
      vnp_Amount: String(Math.round(dto.amount * 100)), // VNPay tính bằng đơn vị xu (nhân 100)
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: dto.ipAddr || clientIp || '127.0.0.1',
      vnp_CreateDate: createDate,
      vnp_ExpireDate: expireDate,
    };

    const sortedParams = this.sortObject(vnpParams);

    // Chuỗi dữ liệu để băm chữ ký (URL-encode value theo chuẩn RFC 3986 với khoảng trắng thành '+')
    const signData = Object.keys(sortedParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`,
      )
      .join('&');

    const hmac = crypto.createHmac('sha512', hashSecret);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;

    this.logger.log(`Generated VNPay URL for order ${orderId} - Amount: ${dto.amount} VND`);

    return {
      success: true,
      orderId,
      amount: dto.amount,
      paymentUrl,
      secureHash,
      createDate,
    };
  }

  /**
   * Kiểm tra tính toàn vẹn chữ ký HMAC-SHA512 khi VNPay redirect về Return URL
   */
  verifyReturnUrl(dto: VerifyVNPayReturnDto) {
    const vnpParams = { ...dto.vnpParams };
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const hashSecret = dto.hashSecret?.trim() || this.defaultHashSecret;
    const sortedParams = this.sortObject(vnpParams);

    const signData = Object.keys(sortedParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`,
      )
      .join('&');

    const hmac = crypto.createHmac('sha512', hashSecret);
    const checkHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const isMatch = secureHash?.toLowerCase() === checkHash?.toLowerCase();
    const responseCode = vnpParams['vnp_ResponseCode'];
    const isSuccess = isMatch && responseCode === '00';

    return {
      isValid: isMatch,
      isSuccess,
      responseCode,
      orderId: vnpParams['vnp_TxnRef'],
      amount: vnpParams['vnp_Amount'] ? Number(vnpParams['vnp_Amount']) / 100 : 0,
      bankCode: vnpParams['vnp_BankCode'],
      transactionNo: vnpParams['vnp_TransactionNo'],
      message: isSuccess
        ? 'Giao dịch thanh toán thành công!'
        : isMatch
          ? `Giao dịch không thành công (Mã lỗi VNPay: ${responseCode})`
          : 'Chữ ký phản hồi không hợp lệ!',
    };
  }
}

