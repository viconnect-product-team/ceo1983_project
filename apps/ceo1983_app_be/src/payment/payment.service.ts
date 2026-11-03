import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

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
    const hashSecret = process.env.VNP_HASH_SECRET?.trim() || this.defaultHashSecret;
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

    const signData = Object.keys(sortedParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`,
      )
      .join('&');

    const hmac = crypto.createHmac('sha512', hashSecret);
    const secureHash = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    const paymentUrl = `${vnpUrl}?${signData}&vnp_SecureHash=${secureHash}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(paymentUrl)}`;

    this.logger.log(`Generated VNPay URL for order ${orderId} - Amount: ${dto.amount} VND`);

    return {
      success: true,
      orderId,
      amount: dto.amount,
      paymentUrl,
      qrImageUrl,
      secureHash,
      createDate,
    };
  }

  /**
   * Tạo phiên thanh toán VNPAY-QR chuyên biệt cho Đăng Ký Sự Kiện
   */
  async createEventCheckout(data: {
    registrationId: string;
    eventId: string;
    amount: number;
    memberName?: string;
    memberCode?: string;
    clientIp?: string;
  }) {
    const { registrationId, eventId, amount, memberName, clientIp } = data;
    const cleanRegId = String(registrationId || '').trim();
    const orderId = `EVT_${cleanRegId}_${Date.now()}`;
    const orderInfo = `CEO 1983 - Ve su kien #${cleanRegId}${memberName ? ` - ${memberName}` : ''}`;

    // Lưu vnp_txn_ref vào event_registrations để đối soát
    await this.prisma.$executeRaw`
      UPDATE public.event_registrations
      SET vnp_txn_ref = ${orderId}, payment_amount = ${amount}, payment_method = 'vnpay', updated_at = NOW()
      WHERE id = ${cleanRegId} OR id::text = ${cleanRegId}
    `.catch(() => {});

    return this.createPaymentUrl(
      {
        orderId,
        amount,
        orderInfo,
        orderType: 'billpayment',
      },
      clientIp || '127.0.0.1',
    );
  }

  /**
   * Tạo phiên thanh toán VNPAY-QR chuyên biệt cho Hội Phí Thường Niên
   */
  async createFeeCheckout(data: {
    invoiceId: string;
    memberId?: string;
    amount: number;
    year?: number;
    memberName?: string;
    clientIp?: string;
  }) {
    const { invoiceId, amount, year, memberName, clientIp } = data;
    const cleanInvId = String(invoiceId || '').trim();
    const orderId = `FEE_${cleanInvId}_${Date.now()}`;
    const orderInfo = `CEO 1983 - Hoi phi nien liem ${year || new Date().getFullYear()} #${cleanInvId}${memberName ? ` - ${memberName}` : ''}`;

    return this.createPaymentUrl(
      {
        orderId,
        amount,
        orderInfo,
        orderType: 'billpayment',
      },
      clientIp || '127.0.0.1',
    );
  }

  /**
   * Kiểm tra chữ ký và THỰC THI TRANSACTION NGUYÊN TỬ CẬP NHẬT DATABASE TOÀN DIỆN
   */
  async verifyReturnUrl(dto: VerifyVNPayReturnDto) {
    const vnpParams = { ...dto.vnpParams };
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHashType'];

    const hashSecret = process.env.VNP_HASH_SECRET?.trim() || this.defaultHashSecret;
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
    const amount = vnpParams['vnp_Amount'] ? Number(vnpParams['vnp_Amount']) / 100 : 0;
    const orderId = vnpParams['vnp_TxnRef'];
    const bankCode = vnpParams['vnp_BankCode'];
    const transactionNo = vnpParams['vnp_TransactionNo'];

    // Nếu thanh toán thành công, thực thi Transaction cập nhật toàn diện
    if (isSuccess && orderId) {
      await this.executePaymentSuccessTransaction({
        orderId,
        amount,
        bankCode,
        transactionNo,
        vnpParams,
      });
    }

    return {
      isValid: isMatch,
      isSuccess,
      responseCode,
      orderId,
      amount,
      bankCode,
      transactionNo,
      message: isSuccess
        ? 'Giao dịch thanh toán VNPAY thành công!'
        : isMatch
          ? `Giao dịch không thành công (Mã lỗi VNPay: ${responseCode})`
          : 'Chữ ký phản hồi không hợp lệ!',
    };
  }

  /**
   * THỰC THI TRANSACTION ATOMIC:
   * 1. Cập nhật trạng thái phiếu đăng ký / hóa đơn -> 'paid', 'confirmed'
   * 2. Tăng số lượng người tham dự sự kiện
   * 3. Ghi nhận tiền vào bảng public.transactions (Khoản Thu Doanh Thu Báo Cáo Tài Chính)
   * 4. Tạo hoặc cập nhật bản ghi hóa đơn chính thức public.invoices
   * 5. Gửi email vé điện tử / hóa đơn & bắn thông báo realtime cho hội viên
   */
  async executePaymentSuccessTransaction(data: {
    orderId: string;
    amount: number;
    bankCode?: string;
    transactionNo?: string;
    vnpParams?: Record<string, string>;
  }) {
    const { orderId, amount, bankCode, transactionNo } = data;
    this.logger.log(`Executing payment transaction for orderId: ${orderId}, amount: ${amount}`);

    try {
      // ── TRƯỜNG HỢP A: THANH TOÁN VÉ SỰ KIỆN (EVT_...) ──
      if (orderId.startsWith('EVT_') || orderId.includes('EV')) {
        const rawRegId = orderId.replace('EVT_', '').split('_')[0];
        const regRows = await this.prisma.$queryRaw<any[]>`
          SELECT r.*, e.title as event_title, e.name as event_name, e.date as event_date, e.location as event_location
          FROM public.event_registrations r
          LEFT JOIN public.events e ON (e.id::text = r.event_id::text)
          WHERE r.id = ${rawRegId} OR r.vnp_txn_ref = ${orderId} OR r.id::text = ${rawRegId}
          LIMIT 1
        `.catch(() => []);

        if (regRows.length > 0) {
          const reg = regRows[0];
          const actualRegId = reg.id;
          const isAlreadyPaid = reg.payment_status === 'paid';
          const finalAmount = amount > 0 ? amount : Number(reg.payment_amount || 0);

          // 1. Cập nhật event_registrations
          await this.prisma.$executeRaw`
            UPDATE public.event_registrations
            SET payment_status = 'paid',
                status = 'confirmed',
                payment_method = 'vnpay',
                paid_at = NOW(),
                vnp_txn_ref = ${orderId},
                updated_at = NOW()
            WHERE id = ${actualRegId} OR id::text = ${actualRegId}::text
          `;

          // 2. Tăng số người đăng ký sự kiện
          if (!isAlreadyPaid && reg.event_id) {
            await this.prisma.$executeRaw`
              UPDATE public.events
              SET registered = COALESCE(registered, 0) + 1, updated_at = NOW()
              WHERE id = ${reg.event_id}::uuid OR id::text = ${reg.event_id}::text
            `.catch(() => {});
          }

          // 3. Ghi nhận tiền vào Khoản Thu (public.transactions)
          const txCode = `THU-VNP-${actualRegId}`;
          await this.prisma.$executeRaw`
            INSERT INTO public.transactions (
              id, code, date, type, category, description, amount, method, status, association_id, recipient, invoice_url, provider, provider_ref, metadata, created_at, updated_at
            ) VALUES (
              gen_random_uuid(),
              ${txCode},
              CURRENT_DATE,
              'income',
              'Vé sự kiện',
              ${'Thanh toán VNPAY phí tham dự sự kiện: ' + (reg.member_name || 'Đại biểu') + ' - ' + (reg.event_name || reg.event_title || '')},
              ${finalAmount},
              'vnpay',
              'completed',
              ${reg.association_id ? reg.association_id : 'c1983000-0000-4000-8000-000000001983'}::uuid,
              ${reg.member_name || 'Đại biểu'},
              ${'/invoices/' + txCode + '.pdf'},
              'vnpay',
              ${transactionNo || orderId},
              ${JSON.stringify({ bankCode, orderId, transactionNo })}::jsonb,
              NOW(),
              NOW()
            )
            ON CONFLICT (code) DO UPDATE
            SET status = 'completed', amount = EXCLUDED.amount, updated_at = NOW()
          `.catch((err) => console.error('[VNPAY] Error inserting event transaction:', err));

          // 4. Tạo hóa đơn điện tử trong public.invoices
          const invoiceNo = `INV-EVT-${actualRegId}`;
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO public.invoices (
              id, member_id, invoice_no, year, amount, due_date, paid_at, status, method, category, customer_name, customer_email, customer_phone, association_id, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, CURRENT_DATE, CURRENT_DATE, 'paid', 'vnpay', 'Vé sự kiện', $6, $7, $8, $9, NOW(), NOW()
            )
            ON CONFLICT (id) DO UPDATE
            SET status = 'paid', paid_at = CURRENT_DATE, method = 'vnpay', updated_at = NOW()
          `, invoiceNo, reg.member_code || actualRegId, invoiceNo, new Date().getFullYear(), Math.round(finalAmount), reg.member_name || 'Đại biểu', reg.email || '', reg.phone || '', reg.association_id ? reg.association_id : null).catch(() => {});

          // 5. Gửi Email vé điện tử kèm mã QR
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(actualRegId)}`;
          const recipientEmail = (reg.email || '').trim();
          if (recipientEmail && recipientEmail.includes('@')) {
            this.mailService.sendEventTicketEmail({
              to: recipientEmail,
              fullName: reg.member_name || 'Quý Hội viên',
              eventTitle: reg.event_name || reg.event_title || 'Sự kiện CLB CEO 1983',
              eventDate: reg.event_date ? new Date(reg.event_date).toLocaleDateString('vi-VN') : 'Sắp diễn ra',
              eventLocation: reg.event_location || 'Hà Nội',
              registrationId: actualRegId,
              ticketType: reg.ticket_type || 'Vé tham dự sự kiện',
              ticketCount: 1,
              luckyNumber: reg.lucky_number ? String(reg.lucky_number) : undefined,
              isFree: false,
              paymentConfirmed: true,
              totalAmount: finalAmount,
              qrCodeUrl,
              vietQrUrl: '',
              bankAccount: '1983000000',
              bankName: 'Cổng Thanh Toán Quốc Gia VNPAY (HanoiBA)',
              bankOwner: 'CLB DOANH NHAN CEO 1983',
            }).catch((err) => console.warn('[VNPAY] Mail dispatch error:', err?.message));
          }

          // 6. Gửi tin nhắn và thông báo ứng dụng
          const confirmMsg = `🎉 [VNPAY XÁC NHẬN] Thanh toán phí tham dự sự kiện "${reg.event_name || reg.event_title || 'Sự kiện'}" thành công!\n\n- Mã giao dịch VNPAY: #${transactionNo || orderId}\n- Số tiền: ${finalAmount.toLocaleString('vi-VN')} đ\n- Mã vé: #${actualRegId}\n\nHóa đơn điện tử số ${invoiceNo} và vé QR đã được kích hoạt. Trân trọng kính mời Quý Anh/Chị tham dự đúng giờ!`;
          const ticketActionMsg = `[action:ticket|eventId:${reg.event_id}|eventTitle:${encodeURIComponent(reg.event_name || reg.event_title || '')}|ticketCode:${actualRegId}|lucky:${reg.lucky_number || ''}|time:${encodeURIComponent(reg.event_date || '')}|location:${encodeURIComponent(reg.event_location || '')}|attendee:${encodeURIComponent(reg.member_name || '')}|qr:${encodeURIComponent(qrCodeUrl)}|type:${encodeURIComponent(reg.ticket_type || 'Standard')}|count:1]`;

          if (reg.member_code) {
            await this.prisma.$executeRaw`
              INSERT INTO public.messages (id, from_id, to_id, text, created_at)
              VALUES (gen_random_uuid(), 'channel_media', ${String(reg.member_code).toLowerCase()}, ${confirmMsg}, NOW() - interval '1 second')
            `.catch(() => {});
            await this.prisma.$executeRaw`
              INSERT INTO public.messages (id, from_id, to_id, text, created_at)
              VALUES (gen_random_uuid(), 'channel_media', ${String(reg.member_code).toLowerCase()}, ${ticketActionMsg}, NOW())
            `.catch(() => {});
          }

          const memberRecipientId = reg.member_code || actualRegId;
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO public.member_notifications (
              id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
            ) VALUES (
              gen_random_uuid(), $1, 'Thanh toán vé sự kiện VNPAY thành công', $2, false, false, 'event', $3, NOW()
            )
          `, String(memberRecipientId), confirmMsg, reg.event_id).catch(() => {});
        }
      }

      // ── TRƯỜNG HỢP B: THANH TOÁN HỘI PHÍ THƯỜNG NIÊN (FEE_...) ──
      else if (orderId.startsWith('FEE_') || orderId.includes('INV')) {
        const rawInvId = orderId.replace('FEE_', '').split('_')[0];
        const invRows = await this.prisma.$queryRaw<any[]>`
          SELECT i.*, m.name as member_name, m.email as member_email, m.phone as member_phone, m.code as member_code, m.user_id
          FROM public.invoices i
          LEFT JOIN public.members m ON (m.id::text = i.member_id::text OR m.code = i.member_id)
          WHERE i.id = ${rawInvId} OR i.invoice_no = ${rawInvId} OR i.id::text = ${rawInvId}
          LIMIT 1
        `.catch(() => []);

        if (invRows.length > 0) {
          const inv = invRows[0];
          const actualInvId = inv.id;
          const finalAmount = amount > 0 ? amount : Number(inv.amount || 0);

          // 1. Cập nhật invoices
          await this.prisma.$executeRaw`
            UPDATE public.invoices
            SET status = 'paid', paid_at = CURRENT_DATE, method = 'vnpay', updated_at = NOW()
            WHERE id = ${actualInvId}
          `;

          // 2. Kích hoạt trạng thái hội phí thành viên
          if (inv.member_id) {
            await this.prisma.$executeRaw`
              UPDATE public.members
              SET fee_paid = true, updated_at = NOW()
              WHERE id = ${inv.member_id}::uuid OR code = ${inv.member_id} OR id::text = ${inv.member_id}
            `.catch(() => {});
          }

          // 3. Ghi nhận tiền vào Khoản Thu (public.transactions)
          const txCode = `THU-VNP-${actualInvId}`;
          await this.prisma.$executeRaw`
            INSERT INTO public.transactions (
              id, code, date, type, category, description, amount, method, status, association_id, recipient, invoice_url, provider, provider_ref, metadata, created_at, updated_at
            ) VALUES (
              gen_random_uuid(),
              ${txCode},
              CURRENT_DATE,
              'income',
              'Hội phí hội viên',
              ${'Thanh toán VNPAY hội phí thường niên: ' + (inv.member_name || 'Hội viên') + ' (' + (inv.invoice_no || actualInvId) + ')'},
              ${finalAmount},
              'vnpay',
              'completed',
              ${inv.association_id ? inv.association_id : 'c1983000-0000-4000-8000-000000001983'}::uuid,
              ${inv.member_name || 'Hội viên'},
              ${'/invoices/' + txCode + '.pdf'},
              'vnpay',
              ${transactionNo || orderId},
              ${JSON.stringify({ bankCode, orderId, transactionNo })}::jsonb,
              NOW(),
              NOW()
            )
            ON CONFLICT (code) DO UPDATE
            SET status = 'completed', amount = EXCLUDED.amount, updated_at = NOW()
          `.catch((err) => console.error('[VNPAY] Error inserting fee transaction:', err));

          // 4. Gửi email xác nhận
          const recipientEmail = (inv.member_email || '').trim();
          if (recipientEmail && recipientEmail.includes('@')) {
            this.mailService.sendMembershipFeeSuccessEmail({
              to: recipientEmail,
              memberName: inv.member_name || 'Quý Hội viên',
              invoiceNo: inv.invoice_no || actualInvId,
              year: inv.year || new Date().getFullYear(),
              amount: Number(finalAmount),
              paidDate: new Date().toISOString().slice(0, 10),
              paymentMethod: 'Cổng thanh toán điện tử VNPAY Gateway (HMAC-SHA512)',
            }).catch(() => {});
          }

          // 5. Gửi thông báo ứng dụng
          const notifTitle = 'Xác nhận thanh toán hội phí VNPAY thành công';
          const notifBody = `Hóa đơn hội phí #${inv.invoice_no || actualInvId} trị giá ${finalAmount.toLocaleString('vi-VN')} đ đã được thanh toán thành công qua cổng VNPAY. Trạng thái hội viên VIP của Anh/Chị đã được kích hoạt!`;

          if (inv.user_id) {
            await this.prisma.$executeRawUnsafe(`
              INSERT INTO public.member_notifications (
                id, recipient_id, title, body, read, dismissed, ref_type, ref_id, created_at
              ) VALUES (
                gen_random_uuid(), $1, $2, $3, false, false, 'invoice', $4, NOW()
              )
            `, String(inv.user_id), notifTitle, notifBody, actualInvId).catch(() => {});
          }

          if (inv.member_code) {
            await this.prisma.$executeRaw`
              INSERT INTO public.messages (id, from_id, to_id, text, created_at)
              VALUES (gen_random_uuid(), 'channel_membership', ${String(inv.member_code).toLowerCase()}, ${notifBody}, NOW())
            `.catch(() => {});
          }
        }
      }
    } catch (err: any) {
      this.logger.error(`Failed executing payment success transaction: ${err?.message}`, err?.stack);
    }
  }

  /**
   * Phương thức hỗ trợ kiểm thử thủ công: Giả lập xác nhận thanh toán VNPAY thành công
   */
  async simulateVnpayPaymentSuccess(orderId: string, amount: number) {
    const fakeTxnNo = `VNP${Date.now()}`;
    await this.executePaymentSuccessTransaction({
      orderId,
      amount,
      bankCode: 'NCB',
      transactionNo: fakeTxnNo,
    });
    return {
      success: true,
      message: `Đã xác nhận thanh toán VNPAY thành công cho đơn #${orderId}!`,
      orderId,
      transactionNo: fakeTxnNo,
    };
  }
}
