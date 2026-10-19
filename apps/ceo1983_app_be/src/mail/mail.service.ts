import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';

export interface SendAccountEmailOptions {
  to: string;
  fullName: string;
  username: string;
  passwordRaw: string;
  companyName?: string;
  memberCode?: string;
  portalUrl?: string;
}

export interface SendEventTicketEmailOptions {
  to: string;
  fullName: string;
  phone?: string;
  company?: string;
  position?: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  registrationId: string;
  ticketType?: string;
  ticketCount?: number;
  luckyNumber?: string;
  isFree?: boolean;
  paymentConfirmed?: boolean;
  totalAmount?: number;
  qrCodeUrl?: string;
  vietQrUrl?: string;
  bankAccount?: string;
  bankName?: string;
  bankOwner?: string;
}

export interface SendEventSoldOutEmailOptions {
  to: string;
  fullName: string;
  phone?: string;
  company?: string;
  position?: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
}

export interface SendAppWelcomeEmailOptions {
  to: string;
  fullName: string;
  username: string;
  passwordRaw?: string;
  phone?: string;
  companyName?: string;
  portalUrl?: string;
  activateUrl?: string;
}
export interface SendAppAccountActivatedEmailOptions {
  to: string;
  fullName: string;
  username: string;
  newPassword?: string;
  phone?: string;
  companyName?: string;
  memberCode?: string;
  portalUrl?: string;
  isEmailUpdated?: boolean;
}

export interface SendMemberApprovedEmailOptions {
  to: string;
  fullName: string;
  memberCode?: string;
  associationName?: string;
  companyName?: string;
  portalUrl?: string;
  username?: string;
  passwordRaw?: string;
}

export interface SendRegistrationReceivedEmailOptions {
  to: string;
  fullName: string;
  phone?: string;
  companyName: string;
  position?: string;
  boardWish?: string;
  industry?: string;
  needs?: string;
  offers?: string;
  memberId?: string;
}

export interface SendMeetingInvitationEmailOptions {
  to: string;
  recipientName: string;
  meetingTitle: string;
  meetingCode?: string;
  meetingType?: 'online' | 'offline' | 'hybrid' | string;
  date: string;
  time: string;
  venueOrLink: string;
  hostName: string;
  hostCompany?: string;
  department?: string;
  notes?: string;
  portalUrl?: string;
}

export interface SendConnectionAppointmentEmailOptions {
  to: string;
  recipientName: string;
  partnerName: string;
  partnerCompany?: string;
  partnerPhone?: string;
  status?: 'requested' | 'confirmed' | 'declined' | string;
  date: string;
  time: string;
  venueOrLink: string;
  venueType?: 'online' | 'offline' | string;
  purpose?: string;
  notes?: string;
  portalUrl?: string;
}

export interface SendEventPaymentSuccessEmailOptions {
  to: string;
  fullName: string;
  phone?: string;
  company?: string;
  eventTitle: string;
  eventDate?: string;
  eventTime?: string;
  eventLocation?: string;
  registrationId: string;
  ticketType?: string;
  ticketCount?: number;
  luckyNumber?: string;
  amountPaid: number;
  paymentMethod?: string;
  qrCodeUrl?: string;
  portalUrl?: string;
}

export interface SendMembershipFeeNotificationEmailOptions {
  to: string;
  memberName: string;
  memberCode?: string;
  companyName?: string;
  invoiceNo: string;
  year: number;
  amount: number;
  dueDate: string;
  bankAccount?: string;
  bankName?: string;
  bankOwner?: string;
  vietQrUrl?: string;
  portalUrl?: string;
  reminderCount?: number;
}

export interface SendMembershipFeeSuccessEmailOptions {
  to: string;
  memberName: string;
  memberCode?: string;
  companyName?: string;
  invoiceNo: string;
  year: number;
  amount: number;
  paidDate?: string;
  newTermEnd?: string;
  paymentMethod?: string;
  portalUrl?: string;
}

export interface SendTaskAssignmentEmailOptions {
  to: string;
  assigneeName: string;
  taskCode: string;
  taskTitle: string;
  department: string;
  assignedBy: string;
  assignedByRole?: string;
  priority: string;
  startDate?: string;
  dueDate: string;
  description?: string;
  deliverables?: string;
  portalUrl?: string;
}

export interface SendTaskReminderEmailOptions {
  to: string;
  assigneeName: string;
  taskCode: string;
  taskTitle: string;
  department: string;
  reminderCount: number;
  remindedBy: string;
  dueDate: string;
  currentProgress?: number;
  status?: string;
  evaluationFeedback?: string;
  portalUrl?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  private readonly failedRecipients = new Set<string>();
  private readonly suppressionFile = path.resolve(process.cwd(), 'uploads', 'mail_suppression_list.json');

  constructor() {
    this.initTransporter();
    this.loadSuppressionList();
  }

  private loadSuppressionList() {
    try {
      if (fs.existsSync(this.suppressionFile)) {
        const raw = fs.readFileSync(this.suppressionFile, 'utf8');
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          list.forEach((email: string) => this.failedRecipients.add(String(email).toLowerCase().trim()));
        }
        this.logger.log(`Loaded ${this.failedRecipients.size} suppressed email addresses from disk.`);
      }
    } catch (err: any) {
      this.logger.warn(`Could not load mail suppression list: ${err.message}`);
    }
  }

  private persistSuppressionList() {
    try {
      const dir = path.dirname(this.suppressionFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.suppressionFile, JSON.stringify(Array.from(this.failedRecipients), null, 2), 'utf8');
    } catch (err: any) {
      this.logger.warn(`Could not persist mail suppression list: ${err.message}`);
    }
  }

  /**
   * Nhận diện các địa chỉ email kiểm thử / mock / fake để không bắn SMTP thật,
   * tránh việc Google Mailer-Daemon giữ trong hàng đợi 47 giờ và gửi thư cảnh báo lỗi.
   */
  public isTestOrDummyEmail(email: string): boolean {
    if (!email) return false;
    const lower = email.toLowerCase().trim();
    if (
      lower.includes('.test') ||
      lower.includes('test.') ||
      lower.includes('test_') ||
      lower.includes('test5137') ||
      lower.includes('test-') ||
      lower.startsWith('test') ||
      lower.includes('dummy') ||
      lower.includes('fake') ||
      lower.includes('@example.com') ||
      lower.includes('@test.com') ||
      lower.endsWith('@example.org') ||
      lower.endsWith('@localhost')
    ) {
      return true;
    }
    return false;
  }

  /**
   * Bộ điều phối gửi email tập trung:
   * 1. Kiểm tra chính sách: Nếu đã từng thất bại (fail 1 lần) thì chặn gửi lại (Suppression).
   * 2. Tự động bỏ qua SMTP đối với các email test/mock để tránh Google Mailer-Daemon retry 47h.
   * 3. Gửi qua SMTP và nếu lỗi lập tức ghi nhận vào danh sách chặn vĩnh viễn, không gửi lại.
   */
  public async dispatchSmtpEmail(options: {
    to: string;
    subject: string;
    html: string;
    fromName?: string;
    auditContext?: string;
    attachments?: Array<{
      filename: string;
      content?: Buffer | string;
      path?: string;
      cid?: string;
      contentType?: string;
    }>;
  }): Promise<{ ok: boolean; message: string; messageId?: string; isSuppressed?: boolean }> {
    const cleanTo = (options.to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const lowerTo = cleanTo.toLowerCase();

    // 1. Kiểm tra chính sách chặn gửi lại nếu đã fail 1 lần (1-Fail Suppression Policy)
    if (this.failedRecipients.has(lowerTo)) {
      this.logger.warn(
        `[SUPPRESSION_BLOCKED] Destination "${cleanTo}" previously failed delivery. Skipping SMTP to prevent bounce / repeated delivery attempts.`,
      );
      return {
        ok: false,
        message: 'Email address previously failed to receive mail. Delivery cancelled without retry.',
        isSuppressed: true,
      };
    }

    // 2. Chặn các địa chỉ email test / dummy / mock không thể nhận thư
    if (this.isTestOrDummyEmail(cleanTo)) {
      this.logger.log(
        `[MOCK_EMAIL_SKIPPED_SMTP] Destination "${cleanTo}" is a test/mock address. Recorded to audit log without sending via Gmail SMTP. Context: ${options.auditContext || options.subject}`,
      );
      return { ok: true, message: 'Test email logged to audit stream (SMTP skipped to prevent bounce)' };
    }

    // 3. Nếu cấu hình SMTP Transporter: Gửi thật qua Gmail/SMTP
    if (this.transporter) {
      try {
        const fromAddr = this.getCleanFromEmail();
        const fromHeader = `"${options.fromName || 'CLB Doanh Nhân CEO 1983'}" <${fromAddr}>`;
        const info = await this.transporter.sendMail({
          from: fromHeader,
          to: cleanTo,
          subject: options.subject,
          html: options.html,
          attachments: options.attachments,
        });
        this.logger.log(`Email dispatched successfully to ${cleanTo}. Id: ${info.messageId}`);
        return { ok: true, message: 'Email sent successfully via SMTP', messageId: info.messageId };
      } catch (err: any) {
        // Ghi nhận ngay vào danh sách thất bại - Nếu fail 1 lần thì thôi không bắn thêm nữa
        this.failedRecipients.add(lowerTo);
        this.persistSuppressionList();
        this.logger.error(
          `[SMTP_FAILURE_SUPPRESSED] Failed to send email to ${cleanTo} via SMTP: ${err.message}. Address added to suppression list (no further retries).`,
          err.stack,
        );
        return { ok: false, message: `SMTP delivery failed: ${err.message}. Address added to suppression list (no retry).` };
      }
    }

    // 4. Fallback Audit Log khi chưa cấu hình SMTP
    this.logger.log(`[AUDIT_EMAIL_DISPATCH] To: ${cleanTo} | Subject: ${options.subject} | Context: ${options.auditContext || ''}`);
    return { ok: true, message: 'Email logged to audit stream (SMTP fallback mode)' };
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.SMTP_PORT) || 465;
    const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
    const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
      });
      this.logger.log(`SMTP Mailer initialized with user: ${user}`);
    } else {
      this.logger.warn(
        'SMTP credentials not fully configured (SMTP_USER/SMTP_PASS). Email sending will operate in mock/audit log mode.',
      );
    }
  }

  private getCleanFromEmail(): string {
    const raw = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@ceo1983.com';
    const match = raw.match(/<([^>]+)>/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return raw.replace(/["']/g, '').trim();
  }

  /**
   * Gửi email thông tin tài khoản đăng nhập (Email + Mật khẩu ngẫu nhiên) cho hội viên mới
   */
  async sendRegistrationAccountEmail(options: SendAccountEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const { to, fullName, username, passwordRaw, companyName, memberCode, portalUrl } = options;
    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send account email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/login';
    const crmUrl = 'https://14.225.217.232:5443/auth';

    const subject = `[CLB CEO 1983] Chào mừng Gia nhập — Thông tin Tài khoản Đăng nhập của Anh/Chị ${fullName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 36px 28px; text-align: center; color: #ffffff; position: relative; }
    .gold-badge { display: inline-block; background: rgba(255, 215, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.5); color: #FFD700; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 24px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 16px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 22px; margin-bottom: 24px; border-left: 4px solid #003B95; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #003B95; margin-bottom: 14px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; word-break: break-all; }
    .cred-highlight { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 15px; font-weight: 800; border: 1px dashed #7dd3fc; }
    .btn-wrap { text-align: center; margin: 30px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); transition: transform 0.2s; }
    .btn-secondary { display: inline-block; background: #003B95; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 10px 22px; border-radius: 9999px; margin-left: 10px; }
    .note { font-size: 12px; color: #94a3b8; line-height: 1.5; background: #f1f5f9; padding: 12px 16px; border-radius: 10px; margin-top: 20px; }
    .footer { background: #0b1329; padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 13px; margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ Chào Mừng Hội Viên Mới ✦</div>
      <h1 class="title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="subtitle">Kết nối bền vững — Kiến tạo thịnh vượng — Vươn tầm doanh nhân</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo hồ sơ đăng ký gia nhập của Anh/Chị ${companyName ? `(đại diện cho <strong>${companyName}</strong>)` : ''} đã được tiếp nhận thành công vào hệ thống.
        <br><br>
        Dưới đây là thông tin tài khoản hội viên chính thức của Anh/Chị để đăng nhập vào <strong>App Hiệp Hội CEO 1983</strong>:
      </div>

      <div class="card-box">
        <div class="card-title">🔐 Thông Tin Đăng Nhập Hệ Thống</div>
        <div class="info-row">
          <span class="info-label">Tên đăng nhập (Email):</span>
          <span class="info-value cred-highlight">${username}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Mật khẩu khởi tạo:</span>
          <span class="info-value cred-highlight">${passwordRaw}</span>
        </div>
        ${memberCode ? `
        <div class="info-row" style="margin-top: 8px;">
          <span class="info-label">Mã số Hội viên dự kiến:</span>
          <span class="info-value" style="color: #d97706;">${memberCode}</span>
        </div>
        ` : ''}
      </div>

      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">📲 Đăng Nhập App Hiệp Hội</a>
      </div>

      <div class="note">
        <strong>* Lưu ý bảo mật:</strong> Để đảm bảo an toàn tuyệt đối, Anh/Chị vui lòng đăng nhập vào ứng dụng và thay đổi mật khẩu ngay ở lần truy cập đầu tiên tại mục <em>Tài khoản &gt; Cài đặt mật khẩu</em>.
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 6px;">Cổng thông tin chính thức: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[MEMBER_ACCOUNT_CREATED] User: ${username} | Password: ${passwordRaw} | Name: ${fullName}`,
    });
  }

  /**
   * Helper tải hoặc tự sinh buffer ảnh VietQR để đính kèm inline CID trong Email MIME
   * Đảm bảo Gmail, Outlook không bị lỗi vỡ ảnh do Google Image Proxy chặn URL bên ngoài.
   */
  private async getVietQrAttachment(
    qrUrlOrText: string,
    cid: string,
    filename: string,
  ): Promise<{ filename: string; content: Buffer; cid: string; contentType: string } | null> {
    try {
      if (qrUrlOrText.startsWith('http://') || qrUrlOrText.startsWith('https://')) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(qrUrlOrText, { signal: controller.signal }).catch(() => null);
        clearTimeout(timeout);
        if (res && res.ok) {
          const ab = await res.arrayBuffer();
          return {
            filename,
            content: Buffer.from(ab),
            cid,
            contentType: 'image/png',
          };
        }
      }
    } catch {}

    // Fallback: Tự sinh buffer mã QR nội bộ qua thư viện qrcode
    try {
      const qrBuf = await QRCode.toBuffer(qrUrlOrText, {
        width: 320,
        margin: 1,
        color: { dark: '#003B95', light: '#FFFFFF' },
      });
      return {
        filename,
        content: qrBuf,
        cid,
        contentType: 'image/png',
      };
    } catch {
      return null;
    }
  }

  /**
   * Gửi email xác nhận vé sự kiện điện tử (E-Ticket) kèm thông tin người đăng ký và mã QR check-in
   */
  async sendEventTicketEmail(options: SendEventTicketEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      fullName,
      phone,
      company,
      position,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      registrationId,
      ticketType = 'Standard',
      ticketCount = 1,
      luckyNumber,
      isFree = true,
      paymentConfirmed = false,
      totalAmount = 0,
      qrCodeUrl,
      vietQrUrl,
      bankAccount = '1983000000',
      bankName = 'MB Bank (Quân Đội)',
      bankOwner = 'CLB DOANH NHAN CEO 1983',
    } = options;

    const isConfirmedTicket = isFree || paymentConfirmed;

    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send event ticket email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    let qrAttachment: { filename: string; content: Buffer; cid: string; contentType: string } | null = null;
    let qrDataUrl = '';
    if (isConfirmedTicket) {
      try {
        const qrBuffer = await QRCode.toBuffer(String(registrationId), {
          width: 300,
          margin: 1,
          color: {
            dark: '#003B95',
            light: '#FFFFFF',
          },
        });
        qrAttachment = {
          filename: `ticket-${registrationId}-qr.png`,
          content: qrBuffer,
          cid: 'event_ticket_qr',
          contentType: 'image/png',
        };
        qrDataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;
      } catch (qrErr) {
        this.logger.warn(`Could not generate QR code buffer for ticket #${registrationId}: ${(qrErr as any)?.message}`);
      }
    }

    const vietQrUrlStr = vietQrUrl || `https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent('EV' + registrationId)}&accountName=${encodeURIComponent('CLB DOANH NHAN CEO 1983')}`;
    let vietQrAttachment: { filename: string; content: Buffer; cid: string; contentType: string } | null = null;
    if (!isConfirmedTicket) {
      vietQrAttachment = await this.getVietQrAttachment(vietQrUrlStr, 'vietqr_payment_qr', `vietqr-${registrationId}.png`);
    }

    const appEventsUrl = 'https://14.225.217.232:5444/association/events';
    const qrSrc = qrAttachment
      ? 'cid:event_ticket_qr'
      : (qrCodeUrl || qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationId)}`);
    const vietQrSrc = vietQrAttachment ? 'cid:vietqr_payment_qr' : vietQrUrlStr;

    const subject = paymentConfirmed
      ? `[CLB CEO 1983] Xác Nhận Đã Thanh Toán & Vé Điện Tử Check-in: ${eventTitle} — ${fullName} (#${registrationId})`
      : isFree
      ? `[CLB CEO 1983] Vé Điện Tử & Mã QR Check-in: ${eventTitle} — ${fullName} (#${registrationId})`
      : `[CLB CEO 1983] Hướng Dẫn Thanh Toán VietQR & Đăng Ký: ${eventTitle} — ${fullName} (#${registrationId})`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 55%, #0B192C 100%); padding: 34px 28px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #FCD34D; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; line-height: 1.3; }
    .subtitle { font-size: 12.5px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .content { padding: 30px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 22px; }
    
    .ticket-card { background: #f8fafc; border: 2px dashed #003B95; border-radius: 16px; padding: 22px; margin-bottom: 24px; position: relative; }
    .ticket-header { border-bottom: 1px solid #cbd5e1; padding-bottom: 14px; margin-bottom: 14px; }
    .event-name { font-size: 17px; font-weight: 900; color: #003B95; margin-bottom: 4px; }
    .event-meta { font-size: 13px; color: #64748b; }
    
    .qr-container { text-align: center; margin: 24px 0 16px 0; padding: 18px; background: #ffffff; border-radius: 14px; border: 1px solid #e2e8f0; }
    .qr-img { width: 220px; height: 220px; border-radius: 10px; border: 3px solid #003B95; padding: 6px; background: #ffffff; object-fit: contain; }
    .qr-caption { font-size: 13px; font-weight: 800; color: #003B95; margin-top: 10px; font-family: monospace; letter-spacing: 1px; }
    .qr-hint { font-size: 12px; color: #64748b; margin-top: 4px; }

    .price-tag { font-size: 24px; font-weight: 900; color: #D97706; margin: 6px 0; }
    .bank-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px; margin-top: 12px; text-align: left; font-size: 13px; }
    .bank-card p { margin: 4px 0; }

    .info-grid { display: table; width: 100%; font-size: 13.5px; margin-top: 12px; }
    .info-row { display: table-row; }
    .info-cell-label { display: table-cell; padding: 6px 0; color: #64748b; font-weight: 500; width: 40%; }
    .info-cell-value { display: table-cell; padding: 6px 0; color: #0f172a; font-weight: 700; text-align: right; }
    
    .badge-status { display: inline-block; background: #dcfce7; color: #15803d; padding: 3px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 800; border: 1px solid #86efac; }
    .badge-status-pending { display: inline-block; background: #fef3c7; color: #b45309; padding: 3px 10px; border-radius: 9999px; font-size: 11.5px; font-weight: 800; border: 1px solid #fde68a; }
    .badge-lucky { display: inline-block; background: #fef3c7; color: #b45309; padding: 3px 10px; border-radius: 9999px; font-size: 12px; font-weight: 900; border: 1px solid #fde68a; font-family: monospace; }
    
    .btn-wrap { text-align: center; margin: 28px 0 10px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #003B95 0%, #001A4D 100%); color: #ffffff !important; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0, 59, 149, 0.35); }
    
    .checkin-guide { background: #eff6ff; border-left: 4px solid #003B95; padding: 14px 18px; border-radius: 0 12px 12px 0; margin-top: 22px; font-size: 12.5px; line-height: 1.6; color: #1e3a8a; }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.55); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #F59E0B; font-weight: 800; font-size: 13px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">${paymentConfirmed ? '✦ VÉ ĐIỆN TỬ - ĐÃ XÁC NHẬN THANH TOÁN ✦' : (isFree ? '✦ VÉ THAM DỰ SỰ KIỆN ĐIỆN TỬ (E-TICKET) ✦' : '✦ HƯỚNG DẪN THANH TOÁN PHÍ THAM DỰ ✦')}</div>
      <h1 class="title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="subtitle">Hệ Sinh Thái Kết Nối & Giao Thương Doanh Nhân Đẳng Cấp</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        ${paymentConfirmed
          ? `Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo: Giao dịch thanh toán phí tham dự sự kiện của Anh/Chị đã được <strong>xác nhận thành công</strong>! Dưới đây là <strong>Vé Điện Tử và Mã QR Check-in</strong> chính thức của Anh/Chị tại sự kiện:`
          : isFree 
          ? `Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo: Anh/Chị đã <strong>đăng ký thành công</strong> vé tham dự sự kiện. Dưới đây là thông tin vé điện tử và <strong>Mã QR Check-in</strong> chính thức của Anh/Chị:`
          : `Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng cảm ơn Anh/Chị đã gửi phiếu đăng ký tham gia sự kiện. Dưới đây là <strong>Mã VietQR thanh toán phí tham dự</strong>. Vui lòng chuyển khoản để hệ thống kích hoạt vé QR check-in cho Anh/Chị:`
        }
      </div>

      <div class="ticket-card">
        <div class="ticket-header">
          <div class="event-name">${eventTitle}</div>
          <div class="event-meta">📍 Địa điểm: <strong>${eventLocation || 'Hà Nội'}</strong></div>
          <div class="event-meta">🗓️ Thời gian: <strong>${eventDate || ''} ${eventTime ? '· ' + eventTime : ''}</strong></div>
        </div>

        ${!isConfirmedTicket ? `
        <!-- TEMPLATE MÃ VIETQR THANH TOÁN DÀNH CHO SỰ KIỆN CÓ PHÍ CHỜ THANH TOÁN -->
        <div class="qr-container">
          <div style="font-weight: 800; color: #003B95; font-size: 14px; text-transform: uppercase;">MÃ VIETQR THANH TOÁN PHÍ THAM DỰ</div>
          <div class="price-tag">${new Intl.NumberFormat('vi-VN').format(totalAmount)} đ</div>
          <img src="${vietQrSrc}" alt="Mã VietQR Thanh Toán" class="qr-img" />
          <div class="qr-caption">NỘI DUNG CK: EV${registrationId}</div>
          <div class="qr-hint">Mở ứng dụng Ngân hàng bất kỳ (MB, Vietcombank, Techcombank...) để quét mã chuyển khoản</div>

          <div class="bank-card">
            <p><strong>Ngân hàng thụ hưởng:</strong> Ngân hàng Quân Đội (MB Bank)</p>
            <p><strong>Số tài khoản:</strong> <span style="font-family: monospace; font-size: 15px; font-weight: 800; color: #003B95;">1983000000</span></p>
            <p><strong>Chủ tài khoản:</strong> CLB DOANH NHÂN CEO 1983</p>
            <p><strong>Số tiền:</strong> <strong style="color: #D97706;">${new Intl.NumberFormat('vi-VN').format(totalAmount)} đ</strong></p>
            <p><strong>Cú pháp chuyển khoản:</strong> <strong style="color: #003B95; font-family: monospace;">EV${registrationId} ${phone || ''}</strong></p>
          </div>
        </div>
        ` : `
        <!-- TEMPLATE MÃ QR CHECK-IN DÀNH CHO VÉ ĐÃ XÁC NHẬN / ĐÃ THANH TOÁN -->
        <div class="qr-container">
          <img src="${qrSrc}" alt="Mã QR Check-in" class="qr-img" />
          <div class="qr-caption">MÃ VÉ: ${registrationId}</div>
          <div class="qr-hint">Xuất trình mã QR này tại bàn tiếp đón để Ban Tổ Chức quét check-in vào cửa</div>
        </div>
        `}

        <div class="info-grid">
          <div class="info-row">
            <div class="info-cell-label">Người tham dự:</div>
            <div class="info-cell-value">${fullName}</div>
          </div>
          ${position || company ? `
          <div class="info-row">
            <div class="info-cell-label">Chức vụ & Doanh nghiệp:</div>
            <div class="info-cell-value">${position ? position + ' · ' : ''}${company || ''}</div>
          </div>
          ` : ''}
          ${phone ? `
          <div class="info-row">
            <div class="info-cell-label">Số điện thoại:</div>
            <div class="info-cell-value">${phone}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-cell-label">Loại vé & Số lượng:</div>
            <div class="info-cell-value">${ticketCount} vé (${ticketType})</div>
          </div>
          ${isConfirmedTicket && luckyNumber ? `
          <div class="info-row">
            <div class="info-cell-label">Số may mắn quay thưởng:</div>
            <div class="info-cell-value"><span class="badge-lucky">Lucky #${luckyNumber}</span></div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-cell-label">Trạng thái vé:</div>
            <div class="info-cell-value">
              ${paymentConfirmed
                ? '<span class="badge-status">✓ ĐÃ THANH TOÁN (HỢP LỆ)</span>'
                : (isFree 
                  ? '<span class="badge-status">✓ ĐÃ XÁC NHẬN (Miễn phí 0 đ)</span>' 
                  : '<span class="badge-status-pending">⏳ CHỜ THANH TOÁN VIETQR</span>'
                )
              }
            </div>
          </div>
        </div>
      </div>

      <div class="checkin-guide">
        ${isConfirmedTicket ? `
        <strong>📌 Hướng dẫn Check-in tại sự kiện:</strong>
        <br>1. Khi đến địa điểm tổ chức, Anh/Chị vui lòng mở email này xuất trình <strong>Mã QR vé</strong> trên cho Ban Thư Ký tại bàn đón tiếp.
        <br>2. Ban Tổ Chức sẽ quét mã check-in trong 1 giây và trao thẻ đại biểu, tài liệu cùng quà tặng tham gia sự kiện.
        ` : `
        <strong>📌 Hướng dẫn sau khi chuyển khoản:</strong>
        <br>1. Sau khi Anh/Chị chuyển khoản thành công, hệ thống đối soát Napas 24/7 hoặc Ban Truyền Thông xác nhận sẽ tự động kích hoạt vé chính thức.
        <br>2. Ban Thư Ký sẽ gửi email thông báo vé đã kích hoạt kèm mã QR check-in vào cửa chính thức cho Anh/Chị.
        `}
      </div>

      <div class="btn-wrap">
        <a href="${appEventsUrl}" class="btn-primary" target="_blank">📲 Mở Thẻ Vé Trên Cổng Sự Kiện</a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div>Website chính thức: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    const attachments: Array<{ filename: string; content: Buffer; cid: string; contentType: string }> = [];
    if (qrAttachment) attachments.push(qrAttachment);
    if (vietQrAttachment) attachments.push(vietQrAttachment);

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'Ban Tổ Chức Sự Kiện CEO 1983',
      auditContext: `[EVENT_TICKET_EMAIL] RegId: ${registrationId} | Event: ${eventTitle} | Name: ${fullName}`,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  }

  /**
   * Gửi email cảm ơn và thông báo sự kiện đã đủ số lượng đại biểu (hết chỗ/sold-out)
   */
  async sendEventSoldOutEmail(options: SendEventSoldOutEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      fullName,
      phone,
      company,
      position,
      eventTitle,
      eventDate = 'Sắp diễn ra',
      eventTime = '08:30 - 12:00',
      eventLocation = 'Hà Nội',
    } = options;

    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send event sold-out email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const subject = `[CLB CEO 1983] Thư Cảm Ơn Sự Quan Tâm & Thông Báo Kín Chỗ: ${eventTitle} — ${fullName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 55%, #0B192C 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #FCD34D; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 21px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; line-height: 1.35; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.65; color: #475569; margin-bottom: 22px; }
    .notice-card { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1.5px solid #fde68a; border-radius: 16px; padding: 20px; margin-bottom: 24px; }
    .notice-title { font-size: 14px; font-weight: 800; color: #92400e; margin: 0 0 8px 0; display: flex; items-center: center; }
    .notice-desc { font-size: 13px; line-height: 1.6; color: #78350f; margin: 0; }
    .details-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .details-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    .details-table td.label { width: 36%; color: #64748b; font-weight: 600; }
    .details-table td.val { font-weight: 700; color: #0f172a; }
    .support-card { background: #f8fafc; border-radius: 14px; padding: 18px; border: 1px dashed #cbd5e1; margin-bottom: 24px; font-size: 13px; color: #475569; line-height: 1.6; }
    .footer { background: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6; }
    .footer a { color: #f59e0b; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">CLB DOANH NHÂN CEO 1983 • HANOIBA</div>
      <h1 class="title">THƯ CẢM ƠN SỰ QUAN TÂM</h1>
      <p class="subtitle">${eventTitle}</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Quý Anh/Chị: <span style="color: #003B95;">${fullName}</span>,</div>
      
      <p class="intro">
        Ban Tổ Chức <strong>CLB Doanh Nhân CEO 1983</strong> xin trân trọng cảm ơn Quý Anh/Chị${company ? ` cùng <strong>${company}</strong>` : ''} đã dành sự quan tâm và đăng ký tham gia sự kiện <strong>${eventTitle}</strong>.
      </p>

      <div class="notice-card">
        <div class="notice-title">⚠️ THÔNG BÁO VỀ SỐ LƯỢNG ĐẠI BIỂU</div>
        <p class="notice-desc">
          Do quy mô khán phòng có giới hạn và số lượng đại biểu đăng ký đã đạt <strong>100% sức chứa tối đa</strong>, Ban Tổ Chức rất tiếc chưa thể cấp vé tham dự chính thức cho Quý Anh/Chị tại sự kiện lần này.
        </p>
      </div>

      <table class="details-table">
        <tr>
          <td class="label">Sự kiện:</td>
          <td class="val">${eventTitle}</td>
        </tr>
        <tr>
          <td class="label">Thời gian:</td>
          <td class="val">${eventTime} • Ngày ${eventDate}</td>
        </tr>
        <tr>
          <td class="label">Địa điểm:</td>
          <td class="val">${eventLocation}</td>
        </tr>
        <tr>
          <td class="label">Người đăng ký:</td>
          <td class="val">${fullName}${phone ? ` (${phone})` : ''}</td>
        </tr>
        ${company ? `<tr><td class="label">Doanh nghiệp:</td><td class="val">${company}${position ? ` • ${position}` : ''}</td></tr>` : ''}
        <tr>
          <td class="label">Trạng thái:</td>
          <td class="val" style="color: #d97706;">Đã ghi nhận danh sách chờ (Waitlist)</td>
        </tr>
      </table>

      <div class="support-card">
        <strong style="color: #003B95;">✦ ĐẶC QUYỀN DÀNH CHO QUÝ KHÁCH:</strong><br>
        Thông tin của Quý Anh/Chị đã được lưu trữ trang trọng trong hệ thống mạng lưới kết nối doanh nhân của CLB CEO 1983. Chúng tôi sẽ ưu tiên gửi thư mời danh dự sớm nhất tại các chương trình diễn đàn xúc tiến thương mại B2B, tọa đàm kinh tế và dạ tiệc kết nối tiếp theo.
      </div>

      <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0;">
        Nếu Quý Anh/Chị cần hỗ trợ thêm thông tin hoặc muốn tìm hiểu thủ tục gia nhập chính thức Hiệp hội CEO 1983, vui lòng liên hệ Ban Thư Ký CLB qua Hotline: <strong style="color: #0f172a;">0988 198 300</strong> hoặc Email: <strong style="color: #0f172a;">bientap@ceo1983.vn</strong>.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #f8fafc;">CLB DOANH NHÂN CEO 1983 (HANOIBA)</p>
      <p style="margin: 0 0 10px 0;">Tầng 6, Tòa nhà VIONE, Số 83 Vũ Trọng Phụng, Thanh Xuân, Hà Nội</p>
      <p style="margin: 0;">Hotline: 0988 198 300 • Website: <a href="https://ceo1983.vn">ceo1983.vn</a></p>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'Ban Tổ Chức Sự Kiện CEO 1983',
      auditContext: `[EVENT_SOLDOUT_EMAIL] Event: ${eventTitle} | Name: ${fullName} | Email: ${cleanTo}`,
    });
  }

  /**
   * Gửi email chào mừng hội viên mới đăng ký tài khoản vào App Doanh Nhân CEO 1983
   */
  async sendAppWelcomeRegistrationEmail(options: SendAppWelcomeEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const { to, fullName, username, passwordRaw, phone, companyName, portalUrl } = options;
    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send app welcome email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const appLoginUrl = portalUrl || 'https://14.225.217.232:5444/association/login';
    const subject = `[CLB CEO 1983] Chào Mừng Anh/Chị ${fullName} Gia Nhập Ứng Dụng Doanh Nhân CEO 1983`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 55%, #0B192C 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #FCD34D; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; line-height: 1.3; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    
    .account-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 22px; margin-bottom: 24px; border-left: 4px solid #003B95; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #003B95; margin-bottom: 14px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; word-break: break-all; }
    .cred-box { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 14.5px; font-weight: 800; border: 1px dashed #7dd3fc; }
    
    .steps-card { background: #eff6ff; border-radius: 14px; padding: 20px; margin-bottom: 26px; border: 1px solid #bfdbfe; }
    .steps-title { font-size: 13px; font-weight: 800; color: #1e3a8a; margin-bottom: 10px; text-transform: uppercase; }
    .step-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; font-size: 13px; color: #1e293b; line-height: 1.5; }
    .step-num { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: #003B95; color: #ffffff; border-radius: 50%; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

    .btn-wrap { text-align: center; margin: 30px 0 14px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    
    .note { font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; padding: 12px 16px; border-radius: 10px; margin-top: 20px; border: 1px solid #e2e8f0; }
    .footer { background: #0b1329; padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.55); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #F59E0B; font-weight: 800; font-size: 13px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ ĐĂNG KÝ TÀI KHOẢN THÀNH CÔNG ✦</div>
      <h1 class="title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="subtitle">Hệ Sinh Thái Kết Nối & Giao Thương Doanh Nhân Toàn Diện</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Thư Ký CLB Doanh Nhân CEO 1983 xin chúc mừng Anh/Chị ${companyName ? `(Doanh nghiệp: <strong>${companyName}</strong>)` : ''} đã đăng ký tài khoản thành công trên nền tảng <strong>App Hiệp Hội CEO 1983</strong>.
        <br><br>
        Tài khoản của Anh/Chị đã được kích hoạt trên hệ thống với các thông tin như sau:
      </div>

      <div class="account-card">
        <div class="card-title">🔐 Thông Tin Tài Khoản Đăng Nhập</div>
        <div class="info-row">
          <span class="info-label">Tài khoản (Email):</span>
          <span class="info-value cred-box">${username}</span>
        </div>
        ${passwordRaw ? `
        <div class="info-row">
          <span class="info-label">Mật khẩu khởi tạo:</span>
          <span class="info-value cred-box">${passwordRaw}</span>
        </div>
        ` : ''}
        ${phone ? `
        <div class="info-row">
          <span class="info-label">Số điện thoại liên kết:</span>
          <span class="info-value">${phone}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Trạng thái tài khoản:</span>
          <span class="info-value" style="color: #16a34a;">✓ Đã sẵn sàng truy cập</span>
        </div>
      </div>

      <div class="steps-card">
        <div class="steps-title">🚀 Các bước tiếp theo để tận dụng tối đa hệ sinh thái:</div>
        <div class="step-item">
          <span class="step-num">1</span>
          <span><strong>Hoàn thiện Danh thiếp điện tử VIP:</strong> Cập nhật ảnh đại diện, chức vụ, logo doanh nghiệp để kết nối chạm NFC 1-giây.</span>
        </div>
        <div class="step-item">
          <span class="step-num">2</span>
          <span><strong>Đăng Gian hàng & Cơ hội giao thương:</strong> Giới thiệu sản phẩm, dịch vụ và tìm kiếm đối tác B2B trong CLB.</span>
        </div>
        <div class="step-item">
          <span class="step-num">3</span>
          <span><strong>Đăng ký Vé Sự kiện & Hội thảo:</strong> Nhận vé điện tử có mã QR check-in ngay trên điện thoại.</span>
        </div>
      </div>

      <div class="btn-wrap">
        <a href="${appLoginUrl}" class="btn-primary" target="_blank">📲 Mở App & Đăng Nhập Ngay</a>
      </div>

      <div class="note">
        <strong>* Hỗ trợ kỹ thuật:</strong> Nếu cần trợ giúp kích hoạt tài khoản hoặc cài đặt ứng dụng lên màn hình chính điện thoại (PWA), Anh/Chị vui lòng liên hệ Ban Thư Ký CLB qua Hotline: <strong>0983 1983 83</strong> hoặc gửi phản hồi trực tiếp qua email này.
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin & Ứng dụng: <a href="https://14.225.217.232:5444" style="color: #93c5fd; text-decoration: none;">14.225.217.232:5444</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[APP_WELCOME_EMAIL] User: ${username} | Name: ${fullName}`,
    });
  }

  /**
   * Gửi email thông báo kích hoạt tài khoản thành công và cập nhật mật khẩu/email mới
   */
  async sendAppAccountActivatedEmail(options: SendAppAccountActivatedEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const { to, fullName, username, newPassword, phone, companyName, memberCode, portalUrl, isEmailUpdated } = options;
    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send app account activated email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const appLoginUrl = portalUrl || 'https://14.225.217.232:5444/association/login';
    const subject = isEmailUpdated
      ? `[CLB CEO 1983] Cập Nhật Email & Kích Hoạt Tài Khoản Thành Công — Anh/Chị ${fullName}`
      : `[CLB CEO 1983] Kích Hoạt Tài Khoản Thành Công — Anh/Chị ${fullName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 55%, #0B192C 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.25); border: 1px solid #F59E0B; color: #FCD34D; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; line-height: 1.3; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    
    .account-card { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 22px; margin-bottom: 24px; border-left: 4px solid #16a34a; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #16a34a; margin-bottom: 14px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; word-break: break-all; }
    .cred-box { background: #dcfce7; color: #15803d; padding: 4px 10px; border-radius: 8px; font-family: monospace; font-size: 14.5px; font-weight: 800; border: 1px dashed #86efac; }
    
    .steps-card { background: #eff6ff; border-radius: 14px; padding: 20px; margin-bottom: 26px; border: 1px solid #bfdbfe; }
    .steps-title { font-size: 13px; font-weight: 800; color: #1e3a8a; margin-bottom: 10px; text-transform: uppercase; }
    .step-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 8px; font-size: 13px; color: #1e293b; line-height: 1.5; }
    .step-num { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: #003B95; color: #ffffff; border-radius: 50%; font-size: 11px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }

    .btn-wrap { text-align: center; margin: 30px 0 14px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    
    .note { font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; padding: 12px 16px; border-radius: 10px; margin-top: 20px; border: 1px solid #e2e8f0; }
    .footer { background: #0b1329; padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.55); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #F59E0B; font-weight: 800; font-size: 13px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ KÍCH HOẠT TÀI KHOẢN THÀNH CÔNG ✦</div>
      <h1 class="title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="subtitle">Hệ Sinh Thái Kết Nối & Giao Thương Doanh Nhân Toàn Diện</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Thư Ký CLB Doanh Nhân CEO 1983 xin thông báo: Quý Anh/Chị ${companyName ? `(Đại diện: <strong>${companyName}</strong>)` : ''} đã <strong>kích hoạt tài khoản và thiết lập mật khẩu cá nhân thành công</strong> trên ứng dụng Hiệp hội Doanh nhân CEO 1983.
        <br><br>
        Tài khoản của Anh/Chị hiện đã ở trạng thái chính thức với đầy đủ các quyền lợi thành viên và thẻ doanh nhân số.
      </div>

      <div class="account-card">
        <div class="card-title">🔐 Thông Tin Tài Khoản Mới Đã Xác Nhận</div>
        <div class="info-row">
          <span class="info-label">Tên đăng nhập (Email):</span>
          <span class="info-value cred-box">${cleanTo}</span>
        </div>
        ${phone ? `
        <div class="info-row">
          <span class="info-label">Số điện thoại liên kết:</span>
          <span class="info-value cred-box" style="background: #f1f5f9; color: #0f172a; border-color: #cbd5e1;">${phone}</span>
        </div>
        ` : ''}
        ${newPassword ? `
        <div class="info-row">
          <span class="info-label">Mật khẩu mới đã đặt:</span>
          <span class="info-value cred-box">${newPassword}</span>
        </div>
        ` : ''}
        ${memberCode ? `
        <div class="info-row">
          <span class="info-label">Mã hội viên:</span>
          <span class="info-value" style="color: #003B95; font-weight: 800;">${memberCode}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="info-value" style="color: #16a34a; font-weight: 800;">✓ Đã kích hoạt hoàn tất</span>
        </div>
      </div>

      <div class="steps-card">
        <div class="steps-title">💡 Hướng Dẫn Đăng Nhập Sau Kích Hoạt:</div>
        <div class="step-item">
          <span class="step-num">1</span>
          <span>Anh/Chị có thể đăng nhập bằng <strong>Email (${cleanTo})</strong> ${phone ? `hoặc <strong>Số điện thoại (${phone})</strong>` : ''}.</span>
        </div>
        <div class="step-item">
          <span class="step-num">2</span>
          <span>Sử dụng <strong>Mật khẩu mới</strong> vừa thiết lập để truy cập.</span>
        </div>
        <div class="step-item">
          <span class="step-num">3</span>
          <span>Trải nghiệm ngay Danh thiếp điện tử VIP và khám phá các cơ hội giao thương B2B trong Hiệp hội.</span>
        </div>
      </div>

      <div class="btn-wrap">
        <a href="${appLoginUrl}" class="btn-primary" target="_blank">📲 Đăng Nhập Vào Ứng Dụng Ngay</a>
      </div>

      <div class="note">
        <strong>* Lưu ý bảo mật:</strong> Vui lòng lưu trữ thông tin đăng nhập cẩn thận và không chia sẻ mật khẩu cho người khác. Nếu không phải bạn thực hiện thao tác này, vui lòng liên hệ ngay Ban Thư Ký CLB qua Hotline: <strong>0983 1983 83</strong> để được hỗ trợ.
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin & Ứng dụng: <a href="https://14.225.217.232:5444" style="color: #93c5fd; text-decoration: none;">14.225.217.232:5444</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[APP_ACCOUNT_ACTIVATED_EMAIL] User: ${username} | Email: ${cleanTo} | Name: ${fullName}`,
    });
  }

  /**
   * Gửi email chúc mừng khi hồ sơ hội viên được Ban điều hành / Quản trị viên duyệt chính thức
   */
  async sendMemberApprovedEmail(options: SendMemberApprovedEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const { to, fullName, memberCode, associationName, companyName, portalUrl, username, passwordRaw } = options;
    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send member approval email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/login';
    const assocTitle = associationName || 'CLB Doanh Nhân CEO 1983';
    const subject = `[${assocTitle}] Chúc Mừng Hồ Sơ Hội Viên Của Anh/Chị ${fullName} Đã Được Phê Duyệt Chính Thức`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 55%, #0B192C 100%); padding: 36px 28px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #FCD34D; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .content { padding: 32px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .card-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 22px; margin-bottom: 24px; border-left: 4px solid #16a34a; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; }
    .cred-badge { font-family: monospace; font-weight: 700; color: #0284c7; background: #e0f2fe; padding: 2px 8px; border-radius: 6px; border: 1px dashed #7dd3fc; }
    .btn-wrap { text-align: center; margin: 30px 0 14px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: #ffffff !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 34px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(22, 163, 74, 0.35); }
    .footer { background: #0b1329; padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.55); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #F59E0B; font-weight: 800; font-size: 13px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ PHÊ DUYỆT HỘI VIÊN CHÍNH THỨC ✦</div>
      <h1 class="title">${assocTitle}</h1>
      <p class="subtitle">Chúc mừng Anh/Chị đã chính thức trở thành Hội viên CLB</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Chủ Nhiệm & Ban Thư Ký ${assocTitle} xin trân trọng thông báo: Hồ sơ đăng ký gia nhập của Anh/Chị ${companyName ? `(đại diện cho <strong>${companyName}</strong>)` : ''} đã được <strong>phê duyệt chính thức</strong>.
        <br><br>
        Toàn bộ đặc quyền của Hội viên chính thức (Thẻ Doanh Nhân Số VIP, kết nối giao thương nội bộ, ưu đãi hội viên) đã được kích hoạt trên hệ thống.
      </div>

      <div class="card-box">
        <div class="info-row">
          <span class="info-label">Hội viên:</span>
          <span class="info-value">${fullName}</span>
        </div>
        ${memberCode ? `
        <div class="info-row">
          <span class="info-label">Mã số Hội viên:</span>
          <span class="info-value" style="color: #003B95; font-weight: 800;">${memberCode}</span>
        </div>
        ` : ''}
        ${companyName ? `
        <div class="info-row">
          <span class="info-label">Doanh nghiệp:</span>
          <span class="info-value">${companyName}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Tài khoản đăng nhập (Email):</span>
          <span class="info-value" style="font-family: monospace; font-weight: 700; color: #003B95;">${username || cleanTo}</span>
        </div>
        ${passwordRaw ? `
        <div class="info-row">
          <span class="info-label">Mật khẩu khởi tạo:</span>
          <span class="info-value cred-badge">${passwordRaw}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Trạng thái:</span>
          <span class="info-value" style="color: #16a34a; font-weight: 800;">✓ Đã phê duyệt chính thức</span>
        </div>
      </div>

      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">📲 Mở App Hội Viên & Đăng Nhập Ngay</a>
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">${assocTitle}</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: assocTitle,
      auditContext: `[MEMBER_APPROVED_EMAIL] Name: ${fullName} | Code: ${memberCode}`,
    });
  }

  /**
   * Gửi email xác nhận tiếp nhận hồ sơ đăng ký gia nhập cho ứng viên (Landing page / Public Register)
   */
  async sendRegistrationReceivedEmail(options: SendRegistrationReceivedEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const { to, fullName, phone, companyName, position, boardWish, industry, needs, offers, memberId } = options;
    const cleanTo = (to || '').trim();
    if (!cleanTo || !cleanTo.includes('@')) {
      this.logger.warn(`Cannot send registration received email: invalid destination email "${cleanTo}"`);
      return { ok: false, message: 'Invalid recipient email' };
    }

    const subject = `[CLB CEO 1983] Xác Nhận Tiếp Nhận Hồ Sơ Đăng Ký Gia Nhập — Anh/Chị ${fullName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 12px 36px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 55%, #0B192C 100%); padding: 34px 28px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(245, 158, 11, 0.2); border: 1px solid #F59E0B; color: #FCD34D; padding: 5px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 6px 0; color: #ffffff; line-height: 1.3; }
    .subtitle { font-size: 12.5px; color: rgba(255, 255, 255, 0.85); margin: 0; }
    .content { padding: 30px 28px; }
    .greeting { font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 22px; }
    
    .card-box { background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 16px; padding: 22px; margin-bottom: 24px; border-left: 4px solid #003B95; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #003B95; margin-bottom: 14px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    
    .status-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 16px; margin: 20px 0; font-size: 13px; line-height: 1.6; color: #1e3a8a; }
    .step-list { margin-top: 10px; padding-left: 18px; }
    .step-list li { margin-bottom: 6px; }

    .note { font-size: 12px; color: #64748b; line-height: 1.5; background: #f8fafc; padding: 12px 16px; border-radius: 10px; margin-top: 20px; border: 1px solid #e2e8f0; }
    .footer { background: #0b1329; padding: 24px; text-align: center; color: rgba(255, 255, 255, 0.55); font-size: 11.5px; line-height: 1.6; }
    .footer-brand { color: #F59E0B; font-weight: 800; font-size: 13px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ TIẾP NHẬN ĐĂNG KÝ HỘI VIÊN MỚI ✦</div>
      <h1 class="title">CLB DOANH NHÂN CEO 1983</h1>
      <p class="subtitle">Hội Doanh Nhân Trẻ Hà Nội (HanoiBA) — Kết Nối & Giao Thương</p>
    </div>

    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo: Hệ thống đã <strong>tiếp nhận thành công hồ sơ đăng ký gia nhập</strong> của Anh/Chị đại diện cho doanh nghiệp <strong>${companyName}</strong>.
      </div>

      <div class="card-box">
        <div class="card-title">📋 Thông Tin Hồ Sơ Đăng Ký</div>
        <div class="info-row">
          <span class="info-label">Người đại diện:</span>
          <span class="info-value">${fullName} ${position ? `(${position})` : ''}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Doanh nghiệp:</span>
          <span class="info-value" style="color: #003B95;">${companyName}</span>
        </div>
        ${phone ? `
        <div class="info-row">
          <span class="info-label">Số điện thoại liên hệ:</span>
          <span class="info-value">${phone}</span>
        </div>
        ` : ''}
        <div class="info-row">
          <span class="info-label">Email tiếp nhận:</span>
          <span class="info-value" style="font-family: monospace;">${cleanTo}</span>
        </div>
        ${(() => {
          const INDUSTRY_LABELS: Record<string, string> = {
            'ind.trade': 'Thương mại & Bán lẻ',
            'ind.it': 'Công nghệ thông tin & Viễn thông',
            'ind.manufacturing': 'Sản xuất & Chế tạo',
            'ind.realestate': 'Bất động sản & Xây dựng',
            'ind.finance': 'Tài chính & Đầu tư',
            'ind.fnb': 'Ẩm thực & Dịch vụ F&B',
            'ind.logistics': 'Vận tải & Logistics',
            'ind.health': 'Y tế, Dược phẩm & Chăm sóc sức khỏe',
            'ind.education': 'Giáo dục & Đào tạo',
            'ind.service': 'Thương mại - Dịch vụ',
            'ind.other': 'Ngành nghề khác',
          };
          const resolvedIndustry = (industry && INDUSTRY_LABELS[industry]) ? INDUSTRY_LABELS[industry] : (industry || 'Thương mại - Dịch vụ');
          return `
          <div class="info-row">
            <span class="info-label">Lĩnh vực hoạt động:</span>
            <span class="info-value" style="font-weight: 700; color: #0f172a;">${resolvedIndustry}</span>
          </div>
          `;
        })()}
        ${memberId ? `
        <div class="info-row">
          <span class="info-label">Mã tham chiếu hồ sơ:</span>
          <span class="info-value" style="font-family: monospace; color: #64748b;">${memberId}</span>
        </div>
        ` : ''}
      </div>

      <div class="status-box">
        <strong>📌 Quy trình xét duyệt tiếp theo:</strong>
        <ol class="step-list">
          <li><strong>Thẩm định hồ sơ:</strong> Ban Thành Viên & Ban Kiểm Soát CLB sẽ xem xét thông tin doanh nghiệp theo tiêu chí hội viên trong 24 giờ làm việc.</li>
          <li><strong>Liên hệ xác nhận:</strong> Ban Thư Ký có thể liên hệ qua điện thoại/Zalo để trao đổi thêm về quyền lợi và cơ chế kết nối.</li>
          <li><strong>Cấp tài khoản & Thẻ Doanh Nhân Số:</strong> Khi hồ sơ được phê duyệt chính thức, hệ thống sẽ tự động gửi email thông báo kèm tài khoản đăng nhập App Doanh Nhân CEO 1983 cho Anh/Chị.</li>
        </ol>
      </div>

      <div class="note">
        <strong>* Hỗ trợ hồ sơ:</strong> Nếu cần bổ sung thông tin hoặc hỗ trợ khẩn cấp, Anh/Chị vui lòng liên hệ Văn phòng Ban Thư Ký CLB qua Hotline: <strong>0983 1983 83</strong> hoặc phản hồi trực tiếp email này.
      </div>
    </div>

    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Website chính thức: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[REGISTRATION_RECEIVED] Name: ${fullName} | Company: ${companyName}`,
    });
  }

  // ── DYNAMIC MAIL TEMPLATES MANAGEMENT & DISPATCH (RESTFUL API) ─────────────

  private templatesStore: Map<string, any> = new Map([
    [
      'tmpl-fee-notice',
      {
        id: 'tmpl-fee-notice',
        code: 'FEE_NOTICE_ANNUAL',
        category: 'fee',
        name: 'Thông Báo Nộp Hội Phí Niên Liễm Định Kỳ',
        description: 'Tự động gửi thông báo nộp phí hội viên định kỳ hàng năm kèm mã VietQR và hướng dẫn thanh toán.',
        channels: ['email', 'in_app', 'push'],
        subject: '[CLB CEO 1983] Thông Báo Nộp Hội Phí Thường Niên Năm {{fee_year}} — Anh/Chị {{full_name}}',
        inAppTitle: 'Thông báo nộp hội phí thường niên {{fee_year}}',
        inAppBody: 'Kính gửi Anh/Chị {{full_name}}, hệ thống gửi thông báo hội phí năm {{fee_year}} của đơn vị {{company_name}}.',
        variables: [
          { key: 'full_name', label: 'Tên hội viên', example: 'Nguyễn Văn Hùng' },
          { key: 'member_code', label: 'Mã hội viên', example: 'M1983-001' },
          { key: 'company_name', label: 'Tên doanh nghiệp', example: 'Tập Đoàn Công Nghệ ViConnect' },
          { key: 'fee_year', label: 'Năm hội phí', example: '2026' },
          { key: 'fee_amount', label: 'Số tiền hội phí', example: '15,000,000' },
          { key: 'due_date', label: 'Hạn chót thanh toán', example: '31/10/2026' },
          { key: 'vietqr_url', label: 'Đường dẫn ảnh VietQR', example: 'https://api.vietqr.io/image/970422-198388889999-compact2.jpg' },
        ],
        updatedAt: '2026-10-01',
        isCustom: false,
        htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #001A4D 0%, #003B95 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">THÔNG BÁO THU HỘI PHÍ NIÊN LIỄM {{fee_year}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #cbd5e1;">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Kính gửi: <strong>Anh/Chị {{full_name}}</strong>,<br/>
      Đại diện Doanh nghiệp: <strong>{{company_name}}</strong> (Mã HV: {{member_code}}),
    </p>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Ban Thư ký CLB Doanh Nhân CEO 1983 trân trọng thông báo đến Quý Anh/Chị kỳ nộp hội phí thường niên năm <strong>{{fee_year}}</strong> nhằm duy trì quyền lợi thành viên và tham gia các hoạt động kết nối xúc tiến thương mại.
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px;">
      <table style="width: 100%; font-size: 13.5px; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #64748b; width: 140px;">Mã hội viên:</td><td style="padding: 6px 0; font-weight: 700; color: #003B95;">{{member_code}}</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Mức hội phí:</td><td style="padding: 6px 0; font-weight: 800; color: #dc2626; font-size: 15px;">{{fee_amount}} VNĐ</td></tr>
        <tr><td style="padding: 6px 0; color: #64748b;">Hạn chót thanh toán:</td><td style="padding: 6px 0; font-weight: 700; color: #d97706;">{{due_date}}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; color: #003B95;">QUÉT MÃ VIETQR THANH TOÁN TỰ ĐỘNG CHUẨN NAPAS247</p>
      <img src="{{vietqr_url}}" alt="VietQR" style="max-width: 200px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.08); display: block; margin: 0 auto;" />
    </div>
  </div>
</div>
`,
      },
    ],
    [
      'tmpl-welcome-new-member',
      {
        id: 'tmpl-welcome-new-member',
        code: 'WELCOME_NEW_MEMBER',
        category: 'welcome',
        name: 'Thư Chào Mừng & Cảm Ơn Hội Viên Mới Gia Nhập',
        description: 'Tự động gửi ngay sau khi tài khoản hội viên được Ban Quản Trị phê duyệt chính thức.',
        channels: ['email', 'in_app', 'push'],
        subject: 'CHÀO MỪNG ANH/CHỊ {{full_name}} CHÍNH THỨC GIA NHẬP CLB DOANH NHÂN CEO 1983',
        inAppTitle: 'Chúc mừng gia nhập CLB CEO 1983',
        inAppBody: 'Hồ sơ của Anh/Chị đã được Ban Thường Trực duyệt. Chào mừng Anh/Chị đến với cộng đồng Doanh nhân CEO 1983!',
        variables: [
          { key: 'full_name', label: 'Tên hội viên', example: 'Trần Thị Mai' },
          { key: 'member_code', label: 'Mã hội viên', example: 'M1983-088' },
          { key: 'company_name', label: 'Tên công ty', example: 'Công ty TNHH Thời Trang Luxury' },
          { key: 'joined_date', label: 'Ngày gia nhập', example: '02/10/2026' },
          { key: 'executive_role', label: 'Vai trò hiệp hội', example: 'Hội Viên Chính Thức' },
          { key: 'department', label: 'Ban chuyên môn', example: 'Ban Xúc Tiến Thương Mại' },
          { key: 'app_download_link', label: 'Link tải app', example: 'https://ceo1983.com/association' },
        ],
        updatedAt: '2026-10-01',
        isCustom: false,
        htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #003B95 50%, #d97706 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 23px; font-weight: 800; color: #ffffff;">CHÀO MỪNG HỘI VIÊN MỚI GIA NHẬP</h1>
    <p style="margin: 8px 0 0; font-size: 13.5px; color: #fef08a;">CLB DOANH NHÂN CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Kính gửi: <strong>Anh/Chị {{full_name}}</strong>,<br/>
      Chủ tịch / Tổng Giám đốc: <strong>{{company_name}}</strong>,
    </p>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Thay mặt Ban Chấp Hành CLB Doanh Nhân CEO 1983, tôi trân trọng gửi lời chúc mừng nồng nhiệt nhất tới Anh/Chị và Quý Công ty đã chính thức trở thành thành viên của ngôi nhà chung CEO 1983.
    </p>
  </div>
</div>
`,
      },
    ],
  ]);

  async listTemplates(category?: string) {
    const all = Array.from(this.templatesStore.values());
    if (category && category !== 'all') {
      return all.filter((t) => t.category === category);
    }
    return all;
  }

  async getTemplate(idOrCode: string) {
    if (this.templatesStore.has(idOrCode)) {
      return this.templatesStore.get(idOrCode);
    }
    for (const t of this.templatesStore.values()) {
      if (t.code === idOrCode) return t;
    }
    return null;
  }

  async createTemplate(data: any) {
    const id = `tmpl-custom-${Date.now()}`;
    const newTemplate = {
      ...data,
      id,
      updatedAt: new Date().toISOString().slice(0, 10),
      isCustom: true,
    };
    this.templatesStore.set(id, newTemplate);
    return newTemplate;
  }

  async updateTemplate(id: string, data: any) {
    const existing = await this.getTemplate(id);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...data,
      id: existing.id,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    this.templatesStore.set(existing.id, updated);
    return updated;
  }

  async deleteTemplate(id: string) {
    const existing = await this.getTemplate(id);
    if (!existing) return false;
    return this.templatesStore.delete(existing.id);
  }

  /**
   * 1. Gửi email thư mời tham dự cuộc họp (Cả Trực tiếp Offline và Trực tuyến Online)
   */
  async sendMeetingInvitationEmail(options: SendMeetingInvitationEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      recipientName,
      meetingTitle,
      meetingCode,
      meetingType = 'offline',
      date,
      time,
      venueOrLink,
      hostName,
      hostCompany,
      department,
      notes,
      portalUrl,
    } = options;

    const cleanTo = (to || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
    const isOnline = meetingType === 'online' || (venueOrLink && venueOrLink.toLowerCase().startsWith('http'));
    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/meetings';
    const subject = `[CLB CEO 1983] Thư Mời Tham Dự ${isOnline ? 'Cuộc Họp Online' : 'Cuộc Họp Trực Tiếp'}: ${meetingTitle} - ${date}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(255, 215, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.5); color: #FFD700; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 22px; border-left: 4px solid #003B95; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #003B95; margin-bottom: 12px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn-wrap { text-align: center; margin: 26px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ ${isOnline ? 'Cuộc Họp Trực Tuyến Online' : 'Lịch Họp Trực Tiếp Offline'} ✦</div>
      <h1 class="title">THƯ MỜI THAM DỰ CUỘC HỌP</h1>
      <p class="subtitle">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
    </div>
    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${recipientName}</strong>,</div>
      <div class="intro">
        Ban Tổ chức trân trọng kính mời Anh/Chị tham dự cuộc họp sau đây của Hiệp hội CEO 1983:
      </div>
      <div class="card-box">
        <div class="card-title">📌 Thông Tin Chi Tiết Cuộc Họp</div>
        <div class="info-row"><span class="info-label">Tên cuộc họp:</span><span class="info-value" style="color: #003B95;">${meetingTitle}</span></div>
        ${meetingCode ? `<div class="info-row"><span class="info-label">Mã cuộc họp:</span><span class="info-value">${meetingCode}</span></div>` : ''}
        <div class="info-row"><span class="info-label">Thời gian:</span><span class="info-value" style="color: #d97706;">${time} ngày ${date}</span></div>
        <div class="info-row"><span class="info-label">Hình thức:</span><span class="info-value">${isOnline ? '💻 Trực tuyến (Online Meeting)' : '🏢 Gặp mặt trực tiếp (Offline)'}</span></div>
        <div class="info-row"><span class="info-label">${isOnline ? 'Đường link họp:' : 'Địa điểm:'}</span><span class="info-value">${isOnline ? `<a href="${venueOrLink}" target="_blank" style="color:#0284c7;word-break:break-all;">${venueOrLink}</a>` : venueOrLink}</span></div>
        <div class="info-row"><span class="info-label">Chủ trì / Tổ chức:</span><span class="info-value">${hostName}${hostCompany ? ` (${hostCompany})` : ''}</span></div>
        ${department ? `<div class="info-row"><span class="info-label">Ban / Khối:</span><span class="info-value">${department}</span></div>` : ''}
        ${notes ? `<div class="info-row"><span class="info-label">Ghi chú:</span><span class="info-value" style="font-weight: 500; font-style: italic;">${notes}</span></div>` : ''}
      </div>
      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">${isOnline ? '💻 Vào Phòng Họp Trực Tuyến' : '📅 Xem Chi Tiết Trên App Hiệp Hội'}</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[MEETING_INVITATION] ${meetingTitle} to ${recipientName} (${cleanTo})`,
    });
  }

  /**
   * 2. Gửi email cuộc gặp kết nối giao thương 1-on-1 (Lời mời hẹn gặp & Xác nhận lịch hẹn)
   */
  async sendConnectionAppointmentEmail(options: SendConnectionAppointmentEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      recipientName,
      partnerName,
      partnerCompany,
      partnerPhone,
      status = 'requested',
      date,
      time,
      venueOrLink,
      venueType = 'online',
      purpose,
      notes,
      portalUrl,
    } = options;

    const cleanTo = (to || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
    const isConfirmed = status === 'confirmed' || status === 'accepted';
    const isOnline = venueType === 'online' || (venueOrLink && venueOrLink.toLowerCase().startsWith('http'));
    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/business-connect';

    const subject = isConfirmed
      ? `[CLB CEO 1983] Xác Nhận Lịch Hẹn Kết Nối 1-1 Thành Công với ${partnerName} - ${date}`
      : `[CLB CEO 1983] Lời Mời Hẹn Gặp Kết Nối Giao Thương 1-1 từ Doanh Nhân ${partnerName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(255, 215, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.5); color: #FFD700; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 22px; border-left: 4px solid #d97706; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #d97706; margin-bottom: 12px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn-wrap { text-align: center; margin: 26px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ ${isConfirmed ? 'Lịch Hẹn Kết Nối Đã Xác Nhận' : 'Lời Mời Hẹn Gặp Kết Nối 1-1'} ✦</div>
      <h1 class="title">KẾT NỐI GIAO THƯƠNG B2B</h1>
      <p class="subtitle">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
    </div>
    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${recipientName}</strong>,</div>
      <div class="intro">
        ${isConfirmed
          ? `Lịch hẹn kết nối giao thương 1-1 giữa Anh/Chị và <strong>${partnerName}</strong> đã được xác nhận thành công trên hệ thống Hiệp Hội CEO 1983.`
          : `Doanh nhân <strong>${partnerName}</strong> ${partnerCompany ? `(đại diện <strong>${partnerCompany}</strong>)` : ''} vừa gửi lời mời hẹn gặp kết nối giao thương 1-1 tới Anh/Chị.`
        }
      </div>
      <div class="card-box">
        <div class="card-title">🤝 Chi Tiết Lịch Hẹn Kết Nối</div>
        <div class="info-row"><span class="info-label">Đối tác:</span><span class="info-value" style="color: #003B95;">${partnerName}</span></div>
        ${partnerCompany ? `<div class="info-row"><span class="info-label">Doanh nghiệp:</span><span class="info-value">${partnerCompany}</span></div>` : ''}
        ${partnerPhone ? `<div class="info-row"><span class="info-label">Điện thoại liên hệ:</span><span class="info-value">${partnerPhone}</span></div>` : ''}
        <div class="info-row"><span class="info-label">Thời gian:</span><span class="info-value" style="color: #d97706;">${time} ngày ${date}</span></div>
        <div class="info-row"><span class="info-label">Hình thức:</span><span class="info-value">${isOnline ? '💻 Trực tuyến (Online Room)' : '🏢 Gặp mặt trực tiếp (Offline)'}</span></div>
        <div class="info-row"><span class="info-label">${isOnline ? 'Đường link phòng họp:' : 'Địa điểm:'}</span><span class="info-value">${isOnline ? `<a href="${venueOrLink}" target="_blank" style="color:#0284c7;word-break:break-all;">${venueOrLink}</a>` : venueOrLink}</span></div>
        <div class="info-row"><span class="info-label">Mục đích kết nối:</span><span class="info-value" style="font-weight: 500;">${purpose || notes || 'Gặp gỡ giao thương và xúc tiến hợp tác'}</span></div>
      </div>
      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">📲 Mở App Để Xem & Phản Hồi</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[CONNECTION_APPOINTMENT] ${partnerName} -> ${recipientName} (${cleanTo})`,
    });
  }

  /**
   * 3. Gửi email xác nhận thanh toán vé sự kiện thành công (Vé điện tử & Mã QR Check-in)
   */
  async sendEventPaymentSuccessEmail(options: SendEventPaymentSuccessEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      fullName,
      phone,
      company,
      eventTitle,
      eventDate,
      eventTime,
      eventLocation,
      registrationId,
      ticketType = 'Vé chính thức',
      ticketCount = 1,
      luckyNumber,
      amountPaid,
      paymentMethod = 'VietQR / Chuyển khoản',
      qrCodeUrl,
      portalUrl,
    } = options;

    const cleanTo = (to || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/events';
    const subject = `[CLB CEO 1983] Xác Nhận Thanh Toán Vé Sự Kiện Thành Công — ${eventTitle} (Mã vé: #${registrationId})`;

    let qrAttachment: { filename: string; content: Buffer; cid: string; contentType: string } | null = null;
    let qrDataUrl = '';
    try {
      const qrBuffer = await QRCode.toBuffer(String(registrationId), {
        width: 300,
        margin: 1,
        color: {
          dark: '#003B95',
          light: '#FFFFFF',
        },
      });
      qrAttachment = {
        filename: `ticket-${registrationId}-qr.png`,
        content: qrBuffer,
        cid: 'event_payment_qr',
        contentType: 'image/png',
      };
      qrDataUrl = `data:image/png;base64,${qrBuffer.toString('base64')}`;
    } catch (qrErr) {
      this.logger.warn(`Could not generate QR code buffer for payment ticket #${registrationId}: ${(qrErr as any)?.message}`);
    }

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(34, 197, 94, 0.25); border: 1px solid #22c55e; color: #86efac; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 22px; border-left: 4px solid #16a34a; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #16a34a; margin-bottom: 12px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .qr-wrap { text-align: center; margin: 20px 0; padding: 16px; background: #ffffff; border-radius: 12px; border: 1px dashed #cbd5e1; }
    .qr-img { width: 170px; height: 170px; object-fit: contain; }
    .btn-wrap { text-align: center; margin: 26px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✓ ĐÃ THANH TOÁN THÀNH CÔNG</div>
      <h1 class="title">XÁC NHẬN THANH TOÁN VÉ</h1>
      <p class="subtitle">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
    </div>
    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${fullName}</strong>,</div>
      <div class="intro">
        Ban Tổ chức xin trân trọng thông báo: Khoản thanh toán vé tham dự sự kiện <strong>${eventTitle}</strong> của Anh/Chị đã được ghi nhận thanh toán thành công vào hệ thống.
      </div>
      <div class="card-box">
        <div class="card-title">🎟️ Thông Tin Vé & Check-in Chính Thức</div>
        <div class="info-row"><span class="info-label">Sự kiện:</span><span class="info-value" style="color: #003B95;">${eventTitle}</span></div>
        <div class="info-row"><span class="info-label">Thời gian:</span><span class="info-value">${eventTime ? `${eventTime}, ` : ''}${eventDate || 'Theo lịch trình'}</span></div>
        <div class="info-row"><span class="info-label">Địa điểm:</span><span class="info-value">${eventLocation || 'Hà Nội'}</span></div>
        <div class="info-row"><span class="info-label">Mã vé điện tử:</span><span class="info-value" style="color: #16a34a;">#${registrationId}</span></div>
        <div class="info-row"><span class="info-label">Hạng vé:</span><span class="info-value">${ticketType} (x${ticketCount})</span></div>
        <div class="info-row"><span class="info-label">Số tiền đã thanh toán:</span><span class="info-value" style="color: #d97706; font-size: 15px;">${amountPaid.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="info-row"><span class="info-label">Phương thức:</span><span class="info-value">${paymentMethod}</span></div>
        ${luckyNumber ? `<div class="info-row"><span class="info-label">Con số may mắn (Lucky Draw):</span><span class="info-value" style="color: #e11d48; font-size: 16px;">#${luckyNumber}</span></div>` : ''}
      </div>

      <div class="qr-wrap">
        <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 8px;">MÃ QR CHECK-IN TẠI QUẦY LỄ TÂN</div>
        <img src="${qrAttachment ? 'cid:event_payment_qr' : (qrCodeUrl || qrDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registrationId)}`)}" alt="QR Check-in" class="qr-img" width="170" height="170" />
        <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">Anh/Chị vui lòng xuất trình mã QR này tại quầy đón tiếp để in thẻ và nhận quà.</div>
      </div>

      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">🎟️ Xem Vé Trên App CEO 1983</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[EVENT_PAYMENT_SUCCESS] ${eventTitle} - ${registrationId} (${cleanTo})`,
      attachments: qrAttachment ? [qrAttachment] : undefined,
    });
  }

  /**
   * 4. Gửi email thông báo hội phí thường niên & nhắc phí kèm mã VietQR
   */
  async sendMembershipFeeNotificationEmail(options: SendMembershipFeeNotificationEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      memberName,
      memberCode,
      companyName,
      invoiceNo,
      year,
      amount,
      dueDate,
      bankAccount = '1983000000',
      bankName = 'MB Bank (Ngân hàng TMCP Quân Đội)',
      bankOwner = 'CLB DOANH NHAN CEO 1983',
      vietQrUrl,
      portalUrl,
      reminderCount,
    } = options;

    const cleanTo = (to || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
    const isReminder = Boolean(reminderCount && reminderCount > 0);
    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/profile';
    const vietQrUrlStr = vietQrUrl || `https://img.vietqr.io/image/MB-1983000000-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(`HOIPHI ${memberCode || invoiceNo} ${memberName}`)}&accountName=${encodeURIComponent(bankOwner)}`;
    const vietQrAttachment = await this.getVietQrAttachment(vietQrUrlStr, 'vietqr_fee_qr', `vietqr-fee-${invoiceNo}.png`);
    const qrImg = vietQrAttachment ? 'cid:vietqr_fee_qr' : vietQrUrlStr;

    const subject = isReminder
      ? `[CLB CEO 1983] Nhắc Đóng Hội Phí Thường Niên Năm ${year} (Lần ${reminderCount}) — Hội Viên ${memberName}`
      : `[CLB CEO 1983] Thông Báo Đóng Hội Phí Thường Niên Năm ${year} — Hội Viên ${memberName} (HĐ #${invoiceNo})`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(255, 215, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.5); color: #FFD700; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 22px; border-left: 4px solid #003B95; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #003B95; margin-bottom: 12px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .vietqr-box { text-align: center; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 18px; margin: 20px 0; }
    .qr-img { width: 220px; height: 220px; object-fit: contain; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); background: #ffffff; padding: 8px; }
    .btn-wrap { text-align: center; margin: 26px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ ${isReminder ? `Nhắc Đóng Phí Lần ${reminderCount}` : 'Thông Báo Hội Phí Thường Niên'} ✦</div>
      <h1 class="title">HỘI PHÍ THƯỜNG NIÊN NĂM ${year}</h1>
      <p class="subtitle">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
    </div>
    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${memberName}</strong>,</div>
      <div class="intro">
        Ban Tài chính & Ban Thư Ký CLB Doanh Nhân CEO 1983 xin trân trọng thông báo tới Anh/Chị ${companyName ? `(đại diện <strong>${companyName}</strong>)` : ''} thông tin đóng hội phí thường niên năm <strong>${year}</strong> để tiếp tục duy trì tư cách hội viên chính thức và các quyền lợi giao thương.
      </div>
      <div class="card-box">
        <div class="card-title">🧾 Chi Tiết Hóa Đơn Hội Phí</div>
        <div class="info-row"><span class="info-label">Mã hóa đơn:</span><span class="info-value" style="color: #003B95;">#${invoiceNo}</span></div>
        <div class="info-row"><span class="info-label">Hội viên:</span><span class="info-value">${memberName} ${memberCode ? `(${memberCode})` : ''}</span></div>
        <div class="info-row"><span class="info-label">Niên khóa:</span><span class="info-value">Năm ${year}</span></div>
        <div class="info-row"><span class="info-label">Số tiền hội phí:</span><span class="info-value" style="color: #d97706; font-size: 16px;">${amount.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="info-row"><span class="info-label">Hạn nộp hội phí:</span><span class="info-value" style="color: #dc2626;">${dueDate}</span></div>
      </div>

      <div class="vietqr-box">
        <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; margin-bottom: 6px;">QUÉT MÃ VIETQR ĐỂ THANH TOÁN TỰ ĐỘNG</div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 12px;">Số tiền và cú pháp chuyển khoản đã được tích hợp sẵn chính xác 100%</div>
        <img src="${qrImg}" alt="VietQR Hội Phí" class="qr-img" />
        <div style="margin-top: 12px; font-size: 12.5px; text-align: left; background: #ffffff; padding: 12px; border-radius: 8px;">
          <div><strong>Ngân hàng:</strong> ${bankName}</div>
          <div><strong>Số tài khoản:</strong> <span style="color:#003B95; font-weight:800; font-family:monospace; font-size:14px;">${bankAccount}</span></div>
          <div><strong>Chủ tài khoản:</strong> ${bankOwner}</div>
          <div><strong>Nội dung:</strong> <span style="color:#d97706; font-weight:800; font-family:monospace;">HOIPHI ${memberCode || invoiceNo} ${memberName}</span></div>
        </div>
      </div>

      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">📲 Mở App Để Thanh Toán & Xem Chi Tiết</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[MEMBERSHIP_FEE_NOTICE] ${memberName} - #${invoiceNo} (${cleanTo})`,
      attachments: vietQrAttachment ? [vietQrAttachment] : undefined,
    });
  }

  /**
   * 5. Gửi email xác nhận thanh toán hội phí thành công & gia hạn hội viên
   */
  async sendMembershipFeeSuccessEmail(options: SendMembershipFeeSuccessEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      memberName,
      memberCode,
      companyName,
      invoiceNo,
      year,
      amount,
      paidDate = new Date().toLocaleDateString('vi-VN'),
      newTermEnd,
      paymentMethod = 'Chuyển khoản ngân hàng',
      portalUrl,
    } = options;

    const cleanTo = (to || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/profile';
    const subject = `[CLB CEO 1983] Xác Nhận Hoàn Thành Hội Phí Năm ${year} — Hội Viên ${memberName}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(34, 197, 94, 0.25); border: 1px solid #22c55e; color: #86efac; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 22px; border-left: 4px solid #16a34a; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #16a34a; margin-bottom: 12px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn-wrap { text-align: center; margin: 26px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✓ ĐÃ HOÀN TẤT HỘI PHÍ</div>
      <h1 class="title">XÁC NHẬN THANH TOÁN HỘI PHÍ</h1>
      <p class="subtitle">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
    </div>
    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${memberName}</strong>,</div>
      <div class="intro">
        Ban Tài chính & Ban Điều Hành CLB Doanh Nhân CEO 1983 xin trân trọng xác nhận: Khoản đóng hội phí thường niên năm <strong>${year}</strong> của Anh/Chị ${companyName ? `(đại diện <strong>${companyName}</strong>)` : ''} đã được hoàn tất thành công.
      </div>
      <div class="card-box">
        <div class="card-title">🧾 Thông Tin Xác Nhận Hoàn Tất</div>
        <div class="info-row"><span class="info-label">Hội viên:</span><span class="info-value" style="color: #003B95;">${memberName} ${memberCode ? `(${memberCode})` : ''}</span></div>
        <div class="info-row"><span class="info-label">Mã hóa đơn / Biên lai:</span><span class="info-value">#${invoiceNo}</span></div>
        <div class="info-row"><span class="info-label">Niên khóa hội phí:</span><span class="info-value">Năm ${year}</span></div>
        <div class="info-row"><span class="info-label">Số tiền đã thanh toán:</span><span class="info-value" style="color: #16a34a; font-size: 16px;">${amount.toLocaleString('vi-VN')} VNĐ</span></div>
        <div class="info-row"><span class="info-label">Ngày thanh toán:</span><span class="info-value">${paidDate}</span></div>
        <div class="info-row"><span class="info-label">Phương thức:</span><span class="info-value">${paymentMethod}</span></div>
        ${newTermEnd ? `<div class="info-row"><span class="info-label">Thời hạn hội viên chính thức:</span><span class="info-value" style="color: #d97706;">Đến hết ${newTermEnd}</span></div>` : ''}
      </div>

      <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 12px; font-size: 13px; color: #166534; line-height: 1.5; margin-bottom: 20px;">
        🌟 <strong>Quyền lợi hội viên duy trì:</strong> Anh/Chị được hưởng trọn vẹn toàn bộ quyền lợi tham gia các chương trình xúc tiến thương mại, kết nối B2B, gian hàng ưu đãi, và các sự kiện độc quyền của CLB CEO 1983.
      </div>

      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">📲 Xem Hồ Sơ & Quyền Lợi Hội Viên</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[MEMBERSHIP_FEE_SUCCESS] ${memberName} - #${invoiceNo} (${cleanTo})`,
    });
  }

  /**
   * 6. Gửi email thông báo phân công công việc mới cho người được giao việc
   */
  async sendTaskAssignmentEmail(options: SendTaskAssignmentEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      assigneeName,
      taskCode,
      taskTitle,
      department,
      assignedBy,
      assignedByRole = 'Ban Quản trị',
      priority,
      startDate,
      dueDate,
      description,
      deliverables,
      portalUrl,
    } = options;

    const cleanTo = (to || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/tasks';
    const subject = `[CLB CEO 1983] Bạn Được Phân Công Công Việc Mới: [${taskCode}] ${taskTitle}`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(255, 215, 0, 0.2); border: 1px solid rgba(255, 215, 0, 0.5); color: #FFD700; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 22px; border-left: 4px solid #0284c7; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0284c7; margin-bottom: 12px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .btn-wrap { text-align: center; margin: 26px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">✦ Phân Công Công Việc Mới ✦</div>
      <h1 class="title">THÔNG BÁO GIAO VIỆC</h1>
      <p class="subtitle">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
    </div>
    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${assigneeName}</strong>,</div>
      <div class="intro">
        Anh/Chị vừa được <strong>${assignedBy}</strong> (${assignedByRole}) phân công phụ trách công việc mới trên hệ thống Hiệp Hội CEO 1983:
      </div>
      <div class="card-box">
        <div class="card-title">📋 Thông Tin Công Việc</div>
        <div class="info-row"><span class="info-label">Mã công việc:</span><span class="info-value" style="color: #003B95;">[${taskCode}]</span></div>
        <div class="info-row"><span class="info-label">Tên công việc:</span><span class="info-value">${taskTitle}</span></div>
        <div class="info-row"><span class="info-label">Ban phụ trách:</span><span class="info-value">${department}</span></div>
        <div class="info-row"><span class="info-label">Người giao việc:</span><span class="info-value">${assignedBy}</span></div>
        <div class="info-row"><span class="info-label">Mức độ ưu tiên:</span><span class="info-value" style="color: ${priority === 'HIGH' ? '#dc2626' : '#d97706'}; font-weight: 800;">${priority}</span></div>
        ${startDate ? `<div class="info-row"><span class="info-label">Ngày bắt đầu:</span><span class="info-value">${startDate}</span></div>` : ''}
        <div class="info-row"><span class="info-label">Hạn hoàn thành (Deadline):</span><span class="info-value" style="color: #dc2626; font-weight: 800;">${dueDate}</span></div>
        ${description ? `<div class="info-row"><span class="info-label">Mô tả:</span><span class="info-value" style="font-weight: 400; text-align: left; max-width: 65%;">${description}</span></div>` : ''}
        ${deliverables ? `<div class="info-row"><span class="info-label">Kết quả bàn giao:</span><span class="info-value" style="font-weight: 600; color: #16a34a; text-align: left; max-width: 65%;">${deliverables}</span></div>` : ''}
      </div>
      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">📋 Mở & Cập Nhật Tiến Độ Công Việc</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[TASK_ASSIGNMENT] ${taskCode} to ${assigneeName} (${cleanTo})`,
    });
  }

  /**
   * 7. Gửi email nhắc nhở tiến độ công việc & đôn đốc hạn chót cho người được giao việc
   */
  async sendTaskReminderEmail(options: SendTaskReminderEmailOptions): Promise<{ ok: boolean; message?: string }> {
    const {
      to,
      assigneeName,
      taskCode,
      taskTitle,
      department,
      reminderCount,
      remindedBy,
      dueDate,
      currentProgress = 0,
      status = 'Đang triển khai',
      evaluationFeedback,
      portalUrl,
    } = options;

    const cleanTo = (to || process.env.ADMIN_NOTIFY_EMAIL || 'vupv090120@gmail.com').trim();
    const appUrl = portalUrl || 'https://14.225.217.232:5444/association/tasks';
    const subject = `[CLB CEO 1983] Nhắc Nhở Tiến Độ Công Việc: [${taskCode}] ${taskTitle} (Đôn đốc lần ${reminderCount})`;

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7fb; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #001A4D 0%, #003B95 60%, #002B70 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .gold-badge { display: inline-block; background: rgba(239, 68, 68, 0.25); border: 1px solid #ef4444; color: #fca5a5; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 900; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 13px; color: rgba(255, 255, 255, 0.8); margin: 0; line-height: 1.5; }
    .content { padding: 28px 24px; }
    .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 14px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .card-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin-bottom: 22px; border-left: 4px solid #ef4444; }
    .card-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #dc2626; margin-bottom: 12px; letter-spacing: 0.5px; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13.5px; }
    .info-label { color: #64748b; font-weight: 500; }
    .info-value { color: #0f172a; font-weight: 700; text-align: right; }
    .progress-bar { width: 100%; height: 10px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; margin-top: 6px; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); border-radius: 9999px; }
    .btn-wrap { text-align: center; margin: 26px 0; }
    .btn-primary { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FF9500 100%); color: #001a4d; font-weight: 800; font-size: 14px; text-decoration: none; padding: 13px 30px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(255, 149, 0, 0.35); }
    .footer { background: #0b1329; padding: 22px; text-align: center; color: rgba(255, 255, 255, 0.5); font-size: 11px; line-height: 1.6; }
    .footer-brand { color: #FFD700; font-weight: 700; font-size: 12.5px; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="gold-badge">⏰ ĐÔN ĐỐC TIẾN ĐỘ LẦN ${reminderCount}</div>
      <h1 class="title">NHẮC NHỞ HẠN CHÓT CÔNG VIỆC</h1>
      <p class="subtitle">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
    </div>
    <div class="content">
      <div class="greeting">Kính gửi Anh/Chị <strong>${assigneeName}</strong>,</div>
      <div class="intro">
        Hệ thống và <strong>${remindedBy}</strong> xin gửi thông báo đôn đốc tiến độ công việc đang giao cho Anh/Chị phụ trách:
      </div>
      <div class="card-box">
        <div class="card-title">⚠️ Tiến Độ Hiện Tại</div>
        <div class="info-row"><span class="info-label">Mã công việc:</span><span class="info-value" style="color: #003B95;">[${taskCode}]</span></div>
        <div class="info-row"><span class="info-label">Tên công việc:</span><span class="info-value">${taskTitle}</span></div>
        <div class="info-row"><span class="info-label">Ban phụ trách:</span><span class="info-value">${department}</span></div>
        <div class="info-row"><span class="info-label">Trạng thái:</span><span class="info-value">${status}</span></div>
        <div class="info-row"><span class="info-label">Tiến độ hoàn thành:</span><span class="info-value" style="color: #0284c7; font-size: 15px;">${currentProgress}%</span></div>
        <div class="progress-bar"><div class="progress-fill" style="width: ${Math.min(100, Math.max(0, currentProgress))}%;"></div></div>
        <div class="info-row" style="margin-top: 10px;"><span class="info-label">Hạn chót (Deadline):</span><span class="info-value" style="color: #dc2626; font-size: 15px; font-weight: 800;">${dueDate}</span></div>
        ${evaluationFeedback ? `
        <div style="margin-top: 12px; padding: 10px; background: #fff1f2; border-radius: 8px; border: 1px dashed #fda4af;">
          <div style="font-size: 12px; font-weight: 700; color: #be123c;">ĐÁNH GIÁ / Ý KIẾN CHỈ ĐẠO:</div>
          <div style="font-size: 13px; color: #881337; margin-top: 4px; font-style: italic;">"${evaluationFeedback}"</div>
        </div>
        ` : ''}
      </div>
      <div class="btn-wrap">
        <a href="${appUrl}" class="btn-primary" target="_blank">⚡ Cập Nhật Tiến Độ & Nộp Báo Cáo Ngay</a>
      </div>
    </div>
    <div class="footer">
      <div class="footer-brand">CLB DOANH NHÂN CEO 1983 (HanoiBA)</div>
      <div>Văn phòng Ban Thư Ký · Hotline: 0983 1983 83 · Email: btk@ceo1983.com</div>
      <div style="margin-top: 4px;">Cổng thông tin: <a href="https://ceo1983.com" style="color: #93c5fd; text-decoration: none;">ceo1983.com</a></div>
    </div>
  </div>
</body>
</html>
    `;

    return this.dispatchSmtpEmail({
      to: cleanTo,
      subject,
      html,
      fromName: 'CLB Doanh Nhân CEO 1983',
      auditContext: `[TASK_REMINDER] ${taskCode} to ${assigneeName} (${cleanTo}) - Round ${reminderCount}`,
    });
  }

  async sendTestByTemplateId(id: string, to: string, customVariables?: Record<string, string>) {
    const template = await this.getTemplate(id);
    if (!template) {
      throw new Error(`Template ${id} not found`);
    }

    let subject = template.subject || '[CEO 1983] Test Email';
    let html = template.htmlBody || '<p>Email body</p>';

    const vars: Record<string, string> = {};
    if (Array.isArray(template.variables)) {
      template.variables.forEach((v: any) => {
        vars[v.key] = customVariables?.[v.key] || v.example || '';
      });
    }
    if (customVariables) {
      Object.assign(vars, customVariables);
    }

    // Replace {{key}}
    for (const [k, val] of Object.entries(vars)) {
      const reg = new RegExp(`{{${k}}}`, 'g');
      subject = subject.replace(reg, String(val));
      html = html.replace(reg, String(val));
    }

    return this.sendDirectEmail({
      to,
      subject: `[TEST TEMPLATE] ${subject}`,
      html,
      templateCode: template.code,
    });
  }

  async sendDirectEmail(options: { to: string; subject: string; html: string; templateCode?: string; fromName?: string }) {
    return this.dispatchSmtpEmail({
      to: options.to,
      subject: options.subject,
      html: options.html,
      fromName: options.fromName,
      auditContext: `[DIRECT_EMAIL] Template: ${options.templateCode || 'custom'}`,
    });
  }

  async sendDynamic(templateCode: string, to: string, variables: Record<string, string>) {
    return this.sendTestByTemplateId(templateCode, to, variables);
  }
}


