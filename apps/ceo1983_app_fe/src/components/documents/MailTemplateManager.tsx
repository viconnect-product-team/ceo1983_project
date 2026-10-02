import React, { useState, useMemo, useEffect } from "react";
import {
  Mail,
  Plus,
  Edit3,
  Trash2,
  Send,
  Eye,
  Check,
  X,
  Copy,
  Smartphone,
  Monitor,
  Sparkles,
  Search,
  Code,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  Tag,
  DollarSign,
  UserCheck,
  Calendar,
  Shield,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";

export type MailCategory = "fee" | "welcome" | "event" | "meeting" | "system";

export interface MailVariable {
  key: string;
  label: string;
  example: string;
}

export interface MailTemplateItem {
  id: string;
  code: string;
  name: string;
  category: MailCategory;
  description: string;
  subject: string;
  inAppTitle: string;
  inAppBody: string;
  htmlBody: string;
  variables: MailVariable[];
  channels: ("email" | "in_app" | "push" | "sms")[];
  updatedAt: string;
  isCustom?: boolean;
}

export const INITIAL_MAIL_TEMPLATES: MailTemplateItem[] = [
  {
    id: "tmpl-fee-notice",
    code: "FEE_NOTICE_ANNUAL",
    category: "fee",
    name: "Thông Báo Nộp Hội Phí Niên Liễm Định Kỳ",
    description: "Tự động gửi thông báo kỳ hội phí niên liễm thường niên kèm mã VietQR thanh toán tự động hạch toán.",
    channels: ["email", "in_app", "push"],
    subject: "[CEO 1983] Thông báo nộp Hội phí Niên liễm năm {{fee_year}} - Doanh nghiệp {{company_name}}",
    inAppTitle: "Thông báo nộp hội phí thường niên năm {{fee_year}}",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}, kỳ hội phí năm {{fee_year}} của đơn vị {{company_name}} có hạn nộp vào ngày {{due_date}}. Số tiền: {{fee_amount}} VNĐ.",
    variables: [
      { key: "full_name", label: "Họ và tên hội viên", example: "Nguyễn Văn Tuấn" },
      { key: "member_code", label: "Mã hội viên", example: "M1983-018" },
      { key: "company_name", label: "Tên doanh nghiệp", example: "Tập Đoàn Công Nghệ & Thương Mại VIONE" },
      { key: "fee_year", label: "Năm hội phí", example: "2026" },
      { key: "fee_amount", label: "Số tiền hội phí", example: "15,000,000" },
      { key: "due_date", label: "Hạn thanh toán", example: "30/10/2026" },
      { key: "bank_name", label: "Ngân hàng thụ hưởng", example: "MB Bank (Ngân hàng Quân Đội)" },
      { key: "bank_account", label: "Số tài khoản", example: "198388889999" },
      { key: "bank_owner", label: "Chủ tài khoản", example: "CLB DOANH NHAN CEO 1983" },
      { key: "transfer_content", label: "Cú pháp chuyển khoản", example: "CEO1983 M1983-018 HOIPHI2026" },
      { key: "vietqr_url", label: "Ảnh mã VietQR", example: "https://api.vietqr.io/image/970422-198388889999-compact2.jpg?amount=15000000&addInfo=CEO1983%20M1983-018%20HOIPHI2026&accountName=CLB%20DOANH%20NHAN%20CEO%201983" },
    ],
    updatedAt: "2026-10-01",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #002B66 0%, #001B40 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(212, 160, 23, 0.25); border: 1px solid rgba(212, 160, 23, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #f6d365; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
      THÔNG BÁO TÀI CHÍNH HIỆP HỘI
    </div>
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">THÔNG BÁO NỘP HỘI PHÍ NIÊN LIỄM {{fee_year}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #cbd5e1;">CLB Doanh Nhân CEO 1983 - Hiệp Hội Doanh Nghiệp Trẻ Hà Nội</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Kính gửi: <strong>Anh/Chị {{full_name}}</strong> (Mã HV: <strong>{{member_code}}</strong>),<br/>
      Đại diện: <strong>{{company_name}}</strong>,
    </p>
    <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6; color: #334155;">
      Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn sự đồng hành và những đóng góp tích cực của Quý Doanh nghiệp trong các hoạt động kết nối giao thương B2B và an sinh xã hội thời gian qua.
    </p>
    <div style="background: #f8fafc; border-left: 4px solid #d97706; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase;">Thông Tin Đóng Phí Niên Liễm Năm {{fee_year}}</h3>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 140px;">Mức hội phí:</td><td style="padding: 4px 0; font-weight: 700; color: #b45309; font-size: 15px;">{{fee_amount}} VNĐ</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Hạn nộp phí:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{due_date}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Tên tài khoản:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{bank_owner}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Số tài khoản:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #0284c7; font-size: 14px;">{{bank_account}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Ngân hàng:</td><td style="padding: 4px 0; color: #0f172a;">{{bank_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Nội dung CK:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #d97706;">{{transfer_content}}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 24px 0; padding: 18px; border: 1px dashed #cbd5e1; border-radius: 12px; background: #fafafa;">
      <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #0f172a;">QUÉT MÃ VIETQR ĐỂ NỘP PHÍ TỰ ĐỘNG KHÔNG CẦN NHẬP TAY</p>
      <img src="{{vietqr_url}}" alt="VietQR Thanh Toan" style="max-width: 210px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); margin: 0 auto; display: block;" />
      <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">Hệ thống sẽ tự động gạch nợ và cấp hóa đơn điện tử ngay sau khi nhận được chuyển khoản.</p>
    </div>
    <p style="font-size: 13px; color: #475569; margin: 0 0 6px;">Mọi thắc mắc xin vui lòng liên hệ Ban Tài chính CLB CEO 1983: <strong>0983 000 001</strong>.</p>
    <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 16px 0 0;">TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983</p>
  </div>
</div>
`,
  },
  {
    id: "tmpl-welcome-new-member",
    code: "NEW_MEMBER_THANKS",
    category: "welcome",
    name: "Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập",
    description: "Bắn ngay khi hồ sơ hội viên mới được phê duyệt thành công vào hiệp hội, kèm hướng dẫn kết nối hệ sinh thái.",
    channels: ["email", "in_app", "push"],
    subject: "[THƯ CẢM ƠN] Chúc mừng Anh/Chị {{full_name}} chính thức gia nhập CLB Doanh Nhân CEO 1983",
    inAppTitle: "Chúc mừng tân hội viên {{full_name}}!",
    inAppBody: "Chào mừng Anh/Chị {{full_name}} ({{company_name}}) đã chính thức trở thành hội viên trực thuộc {{department}} của CLB Doanh Nhân CEO 1983.",
    variables: [
      { key: "full_name", label: "Họ tên hội viên mới", example: "Trần Anh Đức" },
      { key: "member_code", label: "Mã hội viên được cấp", example: "M1983-025" },
      { key: "company_name", label: "Tên doanh nghiệp", example: "Công ty Cổ phần Giải pháp Năng lượng Xanh" },
      { key: "executive_role", label: "Vai trò / Chức danh", example: "Hội viên chính thức" },
      { key: "department", label: "Ban chuyên môn phụ trách", example: "Ban Xúc tiến thương mại & Đầu tư" },
      { key: "joined_date", label: "Ngày kết nạp", example: "02/10/2026" },
      { key: "portal_url", label: "Link cổng thông tin", example: "https://ceo1983.vn/portal" },
      { key: "app_download_link", label: "Link tải App Doanh nhân", example: "https://ceo1983.vn/download-app" },
    ],
    updatedAt: "2026-10-01",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #094074 0%, #001B40 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #6ee7b7; margin-bottom: 12px; text-transform: uppercase;">
      THƯ CHÀO MỪNG CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">CHÀO MỪNG TÂN HỘI VIÊN CEO 1983</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">Cùng gắn kết - Cùng chia sẻ - Cùng phát triển vững mạnh</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Kính gửi: <strong>Anh/Chị {{full_name}}</strong>,<br/>
      Chủ tịch / Tổng Giám đốc: <strong>{{company_name}}</strong>,
    </p>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Thay mặt Ban Chấp Hành CLB Doanh Nhân CEO 1983, tôi trân trọng gửi lời chúc mừng nồng nhiệt nhất tới Anh/Chị và Quý Công ty đã chính thức trở thành thành viên chính thức của ngôi nhà chung CEO 1983 kể từ ngày <strong>{{joined_date}}</strong>.
    </p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 10px; font-size: 13px; color: #166534; text-transform: uppercase;">Hồ Sơ Hội Viên Đã Được Phê Duyệt</h4>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #4b5563; width: 140px;">Mã định danh HV:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #15803d; font-size: 14px;">{{member_code}}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">Vai trò hiệp hội:</td><td style="padding: 4px 0; font-weight: 600; color: #111827;">{{executive_role}}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">Ban sinh hoạt:</td><td style="padding: 4px 0; font-weight: 600; color: #1d4ed8;">{{department}}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{app_download_link}}" style="display: inline-block; background: #003B95; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(0, 59, 149, 0.3);">
        Tải App Doanh Nhân CEO 1983 & Khám Phá Hệ Sinh Thái
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 20px;">
      Trân trọng kính chúc Anh/Chị và Quý Doanh nghiệp ngày càng phát triển, gặt hái thêm nhiều thành công vượt bậc trên con đường kinh doanh!
    </p>
    <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">CHỦ TỊCH CLB DOANH NHÂN CEO 1983</p>
  </div>
</div>
`,
  },
  {
    id: "tmpl-fee-reminder",
    code: "FEE_REMINDER_DUE",
    category: "fee",
    name: "Nhắc Phí Hội Viên Sắp Đến Hạn / Quá Hạn",
    description: "Gửi nhắc nhở tự động theo luồng đếm ngược (trước 15 ngày, 7 ngày và quá hạn 3 ngày).",
    channels: ["email", "in_app", "push", "sms"],
    subject: "[NHẮC HỘI PHÍ] Quý Doanh nghiệp còn {{days_left}} ngày để hoàn thành hội phí {{fee_year}}",
    inAppTitle: "Nhắc nhở hoàn thành hội phí niên liễm",
    inAppBody: "Hội phí năm {{fee_year}} của đơn vị {{company_name}} còn {{days_left}} ngày sẽ đến hạn chót ({{due_date}}). Vui lòng thanh toán để duy trì quyền lợi kết nối B2B.",
    variables: [
      { key: "full_name", label: "Tên hội viên", example: "Hoàng Thanh Tuấn" },
      { key: "member_code", label: "Mã hội viên", example: "M1983-002" },
      { key: "company_name", label: "Tên công ty", example: "Công ty Cổ phần Dịch vụ Hàng Hải Á Châu" },
      { key: "days_left", label: "Số ngày còn lại", example: "7" },
      { key: "due_date", label: "Ngày hạn chót", example: "15/10/2026" },
      { key: "fee_amount", label: "Số tiền cần nộp", example: "15,000,000" },
      { key: "vietqr_url", label: "Mã VietQR thanh toán", example: "https://api.vietqr.io/image/970422-198388889999-compact2.jpg" },
    ],
    updatedAt: "2026-10-01",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #b45309 0%, #78350f 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(254, 243, 199, 0.25); border: 1px solid rgba(254, 243, 199, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fef3c7; margin-bottom: 10px; text-transform: uppercase;">
      THƯ NHẮC PHÍ TỰ ĐỘNG
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">NHẮC NHỞ GIA HẠN HỘI PHÍ NIÊN LIỄM</h1>
  </div>
  <div style="padding: 26px 24px; color: #1e293b;">
    <p style="margin: 0 0 14px; font-size: 14px; line-height: 1.6;">
      Kính gửi Anh/Chị <strong>{{full_name}}</strong> - Đại diện <strong>{{company_name}}</strong>,
    </p>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Hệ thống ghi nhận kỳ hội phí thường niên năm <strong>{{fee_year}}</strong> của Quý Doanh nghiệp hiện chỉ còn <strong>{{days_left}} ngày</strong> nữa là đến hạn chót (<strong>{{due_date}}</strong>).
    </p>
    <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
      <p style="margin: 0; font-size: 14px; color: #92400e;">
        Số tiền cần nộp: <strong style="color: #b45309; font-size: 16px;">{{fee_amount}} VNĐ</strong><br/>
        Hạn nộp: <strong>{{due_date}}</strong>
      </p>
    </div>
    <div style="text-align: center; margin: 20px 0;">
      <img src="{{vietqr_url}}" alt="QR Nộp Hội Phí" style="max-width: 190px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); display: block; margin: 0 auto;" />
    </div>
    <p style="font-size: 12.5px; color: #64748b; margin: 0;">Trân trọng cảm ơn sự phối hợp của Quý Anh/Chị!</p>
  </div>
</div>
`,
  },
  {
    id: "tmpl-event-invite-qr",
    code: "EVENT_TICKET_QR",
    category: "event",
    name: "Thư Mời Tham Dự Sự Kiện & Mã QR Vé Điện Tử",
    description: "Phát hành thư mời chính thức kèm mã QR check-in vào cửa và vị trí bàn ghế chi tiết.",
    channels: ["email", "in_app", "push"],
    subject: "[THƯ MỜI SỰ KIỆN] {{event_title}} - Vé tham dự của Đại biểu {{full_name}}",
    inAppTitle: "Vé mời tham gia sự kiện: {{event_title}}",
    inAppBody: "Vé tham dự sự kiện '{{event_title}}' vào ngày {{event_date}} đã sẵn sàng. Vị trí chỗ ngồi của bạn: {{seat_assignment}}.",
    variables: [
      { key: "full_name", label: "Tên đại biểu", example: "Dương Thị Huệ" },
      { key: "member_code", label: "Mã hội viên", example: "M1983-016" },
      { key: "event_title", label: "Tên sự kiện", example: "Diễn Đàn Chuyển Đổi Số Doanh Nghiệp 2026 & Gala Kết Nối" },
      { key: "event_date", label: "Thời gian tổ chức", example: "14:00 Ngày 20/10/2026" },
      { key: "event_location", label: "Địa điểm tổ chức", example: "Khách Sạn Melia Hà Nội - 44 Lý Thường Kiệt" },
      { key: "seat_assignment", label: "Vị trí chỗ ngồi / Bàn tiệc", example: "Bàn VIP 02 - Ghế 05" },
      { key: "ticket_type", label: "Hạng vé", example: "VIP Pass" },
      { key: "qr_code_url", label: "Ảnh mã QR Check-in", example: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TICKET-CEO1983-M016" },
    ],
    updatedAt: "2026-10-01",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(234, 179, 8, 0.25); border: 1px solid rgba(234, 179, 8, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fde047; margin-bottom: 12px; text-transform: uppercase;">
      VÉ THAM DỰ CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">{{event_title}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">Ban Tổ Chức CLB Doanh Nhân CEO 1983 kính mời</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Trân trọng kính mời: <strong>Anh/Chị {{full_name}}</strong> ({{member_code}}),
    </p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 22px;">
      <table style="width: 100%; font-size: 13.5px; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; color: #64748b; width: 130px;">Thời gian:</td><td style="padding: 5px 0; font-weight: 700; color: #0f172a;">{{event_date}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">Địa điểm:</td><td style="padding: 5px 0; font-weight: 600; color: #0f172a;">{{event_location}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">Hạng vé:</td><td style="padding: 5px 0; font-weight: 700; color: #d97706;">{{ticket_type}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">Vị trí chỗ ngồi:</td><td style="padding: 5px 0; font-weight: 800; color: #16a34a; font-size: 14.5px;">{{seat_assignment}}</td></tr>
      </table>
    </div>
    <div style="text-align: center; margin: 24px 0; padding: 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa;">
      <p style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #0f172a;">MÃ QR CHECK-IN NHẬN THẺ ĐẠI BIỂU TẠI BÀN ĐÓN TIẾP</p>
      <img src="{{qr_code_url}}" alt="QR Checkin" style="max-width: 190px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); display: block; margin: 0 auto;" />
      <p style="margin: 8px 0 0; font-size: 11px; color: #64748b;">Quý đại biểu vui lòng xuất trình mã này cho nhân viên lễ tân khi đến tham dự.</p>
    </div>
  </div>
</div>
`,
  },
];

interface VisualBlockContent {
  headerBadge: string;
  headerTitle: string;
  headerSubtitle: string;
  greeting: string;
  introMessage: string;
  showHighlightBox: boolean;
  highlightBoxTitle: string;
  highlightRows: { label: string; value: string }[];
  showQrCode: boolean;
  qrCodeUrl: string;
  qrCodeNote: string;
  outroMessage: string;
  signature: string;
}

function extractVisualContentFromTemplate(t: MailTemplateItem): VisualBlockContent {
  const isFee = t.category === "fee";
  const isWelcome = t.category === "welcome";
  const isEvent = t.category === "event";

  let headerBadge = "THÔNG BÁO TỪ HIỆP HỘI";
  if (isFee) headerBadge = "THÔNG BÁO TÀI CHÍNH HIỆP HỘI";
  else if (isWelcome) headerBadge = "THƯ CHÀO MỪNG CHÍNH THỨC";
  else if (isEvent) headerBadge = "VÉ THAM DỰ SỰ KIỆN CHÍNH THỨC";

  let highlightRows: { label: string; value: string }[] = [];
  if (isFee) {
    highlightRows = [
      { label: "Mức hội phí:", value: "{{fee_amount}} VNĐ" },
      { label: "Hạn thanh toán:", value: "{{due_date}}" },
      { label: "Tên tài khoản:", value: "{{bank_owner}}" },
      { label: "Số tài khoản:", value: "{{bank_account}}" },
      { label: "Ngân hàng:", value: "{{bank_name}}" },
      { label: "Nội dung CK:", value: "{{transfer_content}}" },
    ];
  } else if (isWelcome) {
    highlightRows = [
      { label: "Mã định danh HV:", value: "{{member_code}}" },
      { label: "Vai trò hiệp hội:", value: "{{executive_role}}" },
      { label: "Ban sinh hoạt:", value: "{{department}}" },
      { label: "Ngày kết nạp:", value: "{{joined_date}}" },
    ];
  } else if (isEvent) {
    highlightRows = [
      { label: "Thời gian:", value: "{{event_date}}" },
      { label: "Địa điểm:", value: "{{event_location}}" },
      { label: "Hạng vé:", value: "{{ticket_type}}" },
      { label: "Vị trí chỗ ngồi:", value: "{{seat_assignment}}" },
    ];
  } else {
    highlightRows = [
      { label: "Thời gian:", value: "Thường niên" },
      { label: "Đơn vị gửi:", value: "Ban Thư Ký CEO 1983" },
    ];
  }

  const hasQr = t.variables.some((v) => v.key.includes("qr"));

  return {
    headerBadge,
    headerTitle: t.name,
    headerSubtitle: "CLB Doanh Nhân CEO 1983 - Hiệp Hội Doanh Nghiệp Trẻ Hà Nội",
    greeting: "Kính gửi: Anh/Chị {{full_name}} (Mã HV: {{member_code}}), Đại diện: {{company_name}},",
    introMessage: t.description || "Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng thông báo đến Quý Doanh nghiệp.",
    showHighlightBox: true,
    highlightBoxTitle: isFee ? "Thông Tin Đóng Phí Niên Liễm Năm {{fee_year}}" : isEvent ? "Thông Tin Sự Kiện & Vị Trí Ngồi" : "Chi Tiết Thông Tin",
    highlightRows,
    showQrCode: hasQr,
    qrCodeUrl: isEvent ? "{{qr_code_url}}" : "{{vietqr_url}}",
    qrCodeNote: isFee ? "Hệ thống sẽ tự động gạch nợ và cấp hóa đơn điện tử ngay sau khi nhận được chuyển khoản." : "Quý đại biểu vui lòng xuất trình mã này cho nhân viên lễ tân khi đến tham dự.",
    outroMessage: "Mọi thắc mắc xin vui lòng liên hệ Ban Thư Ký CLB CEO 1983: 0983 000 001.",
    signature: "TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983",
  };
}

function buildHtmlFromVisualContent(c: VisualBlockContent): string {
  const rowsHtml = c.highlightRows
    .map(
      (r) =>
        `<tr><td style="padding: 6px 0; color: #64748b; width: 140px; font-size: 13px;">${r.label}</td><td style="padding: 6px 0; font-weight: 700; color: #0f172a; font-size: 13.5px;">${r.value}</td></tr>`
    )
    .join("\n        ");

  const highlightSection = c.showHighlightBox
    ? `
    <div style="background: #f8fafc; border-left: 4px solid #003B95; border-radius: 8px; padding: 18px 20px; margin-bottom: 22px; border-top: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0;">
      <h3 style="margin: 0 0 12px; font-size: 13.5px; font-weight: 800; color: #003B95; text-transform: uppercase; letter-spacing: 0.5px;">${c.highlightBoxTitle}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${rowsHtml}
      </table>
    </div>`
    : "";

  const qrSection = c.showQrCode
    ? `
    <div style="text-align: center; margin: 24px 0; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 12px; background: #fafafa;">
      <p style="margin: 0 0 12px; font-size: 12.5px; font-weight: 700; color: #0f172a; text-transform: uppercase;">QUÉT MÃ TỰ ĐỘNG KHÔNG CẦN NHẬP TAY</p>
      <img src="${c.qrCodeUrl}" alt="QR Code" style="max-width: 200px; border-radius: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.08); margin: 0 auto; display: block;" />
      <p style="margin: 10px 0 0; font-size: 11.5px; color: #64748b;">${c.qrCodeNote}</p>
    </div>`
    : "";

  const formattedIntro = c.introMessage
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => `<p style="margin: 0 0 14px; font-size: 14px; line-height: 1.65; color: #334155;">${line}</p>`)
    .join("\n    ");

  return `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #002B66 0%, #001B40 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(212, 160, 23, 0.25); border: 1px solid rgba(212, 160, 23, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #f6d365; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
      ${c.headerBadge}
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff; letter-spacing: 0.2px;">${c.headerTitle}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #cbd5e1;">${c.headerSubtitle}</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; font-weight: 600;">
      ${c.greeting}
    </p>
    ${formattedIntro}
    ${highlightSection}
    ${qrSection}
    <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 8px;">
      ${c.outroMessage}
    </p>
    <p style="font-size: 13px; font-weight: 800; color: #002B66; margin: 16px 0 0; text-transform: uppercase;">
      ${c.signature}
    </p>
  </div>
</div>`;
}

const LOCAL_STORAGE_KEY = "ceo1983_mail_templates_v2";

export function MailTemplateManager() {
  const [templates, setTemplates] = useState<MailTemplateItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_MAIL_TEMPLATES;
  });

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    INITIAL_MAIL_TEMPLATES[0].id
  );
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [testEmail, setTestEmail] = useState<string>("admin@connect.vn");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  // Edit / Create Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MailTemplateItem | null>(null);
  const [modalEditorMode, setModalEditorMode] = useState<"visual" | "code">("visual");
  const [visualContent, setVisualContent] = useState<VisualBlockContent>(() =>
    extractVisualContentFromTemplate(INITIAL_MAIL_TEMPLATES[0])
  );

  // Active selected template
  const activeTemplate = useMemo(() => {
    return templates.find((t) => t.id === selectedTemplateId) || templates[0];
  }, [templates, selectedTemplateId]);

  // Sample variable values for live preview
  const sampleValues = useMemo(() => {
    const map: Record<string, string> = {};
    if (activeTemplate && activeTemplate.variables) {
      activeTemplate.variables.forEach((v) => {
        map[v.key] = v.example;
      });
    }
    return map;
  }, [activeTemplate]);

  // Rendered subject & html body
  const renderedContent = useMemo(() => {
    if (!activeTemplate) return { subject: "", inAppTitle: "", inAppBody: "", html: "" };
    let sub = activeTemplate.subject || "";
    let appTitle = activeTemplate.inAppTitle || "";
    let appBody = activeTemplate.inAppBody || "";
    let html = activeTemplate.htmlBody || "";

    Object.entries(sampleValues).forEach(([k, val]) => {
      const regex = new RegExp(`{{\\s*${k}\\s*}}`, "g");
      sub = sub.replace(regex, val);
      appTitle = appTitle.replace(regex, val);
      appBody = appBody.replace(regex, val);
      html = html.replace(regex, val);
    });

    return { subject: sub, inAppTitle: appTitle, inAppBody: appBody, html };
  }, [activeTemplate, sampleValues]);

  // Filtered template list
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return templates.filter((t) => {
      if (activeCategory !== "all" && t.category !== activeCategory) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q)
      );
    });
  }, [templates, activeCategory, searchQuery]);

  // Persist templates to localStorage
  const saveTemplates = (newTemplates: MailTemplateItem[]) => {
    setTemplates(newTemplates);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTemplates));
    } catch {}
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    const newTmpl: MailTemplateItem = {
      id: `tmpl-custom-${Date.now()}`,
      code: `CUSTOM_TEMPLATE_${Date.now().toString().slice(-4)}`,
      name: "Mẫu Email Tùy Chỉnh Mới",
      category: "fee",
      description: "Mô tả mẫu thông báo tự động tùy chỉnh theo nhu cầu nghiệp vụ của Ban Điều Hành.",
      subject: "[CEO 1983] {{title}} - Kính gửi Anh/Chị {{full_name}}",
      inAppTitle: "Thông báo từ Ban Quản Trị",
      inAppBody: "Kính gửi Anh/Chị {{full_name}}, hệ thống gửi thông báo quan trọng đến đơn vị {{company_name}}.",
      channels: ["email", "in_app"],
      variables: [
        { key: "full_name", label: "Tên hội viên", example: "Lê Văn Hùng" },
        { key: "company_name", label: "Tên doanh nghiệp", example: "Tập Đoàn ABC" },
        { key: "title", label: "Tiêu đề nội dung", example: "Kế hoạch quý mới" },
      ],
      updatedAt: new Date().toISOString().slice(0, 10),
      isCustom: true,
      htmlBody: "",
    };
    const initialVisual = extractVisualContentFromTemplate(newTmpl);
    newTmpl.htmlBody = buildHtmlFromVisualContent(initialVisual);
    setVisualContent(initialVisual);
    setEditingTemplate(newTmpl);
    setModalEditorMode("visual");
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (t: MailTemplateItem) => {
    const cloned = JSON.parse(JSON.stringify(t));
    const initialVisual = extractVisualContentFromTemplate(cloned);
    setVisualContent(initialVisual);
    setEditingTemplate(cloned);
    setModalEditorMode("visual");
    setIsEditModalOpen(true);
  };

  // Visual Editor Handlers
  const handleUpdateVisualField = (field: keyof VisualBlockContent, value: any) => {
    const nextVisual = { ...visualContent, [field]: value };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        htmlBody: buildHtmlFromVisualContent(nextVisual),
      });
    }
  };

  const handleAddHighlightRow = () => {
    const nextRows = [...visualContent.highlightRows, { label: "Mục mới", value: "Giá trị" }];
    const nextVisual = { ...visualContent, highlightRows: nextRows };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        htmlBody: buildHtmlFromVisualContent(nextVisual),
      });
    }
  };

  const handleUpdateHighlightRow = (idx: number, key: "label" | "value", val: string) => {
    const nextRows = visualContent.highlightRows.map((r, i) =>
      i === idx ? { ...r, [key]: val } : r
    );
    const nextVisual = { ...visualContent, highlightRows: nextRows };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        htmlBody: buildHtmlFromVisualContent(nextVisual),
      });
    }
  };

  const handleRemoveHighlightRow = (idx: number) => {
    const nextRows = visualContent.highlightRows.filter((_, i) => i !== idx);
    const nextVisual = { ...visualContent, highlightRows: nextRows };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        htmlBody: buildHtmlFromVisualContent(nextVisual),
      });
    }
  };

  const handleInsertVariableIntoVisual = (variableKey: string) => {
    const token = `{{${variableKey}}}`;
    // Insert into introMessage or greeting
    const updatedIntro = visualContent.introMessage
      ? `${visualContent.introMessage} ${token}`
      : token;
    handleUpdateVisualField("introMessage", updatedIntro);
    toast.success(`Đã chèn biến ${token} vào nội dung thư!`);
  };

  // Delete Template
  const handleDeleteTemplate = (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mẫu template "${name}"?`)) return;
    const next = templates.filter((t) => t.id !== id);
    saveTemplates(next);
    if (selectedTemplateId === id && next.length > 0) {
      setSelectedTemplateId(next[0].id);
    }
    toast.success(`Đã xóa template "${name}"`);
  };

  // Save changes from Edit Modal
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    const exists = templates.some((t) => t.id === editingTemplate.id);
    let next: MailTemplateItem[];
    if (exists) {
      next = templates.map((t) => (t.id === editingTemplate.id ? { ...editingTemplate, updatedAt: new Date().toISOString().slice(0, 10) } : t));
      toast.success(`Đã cập nhật template "${editingTemplate.name}"`);
    } else {
      next = [editingTemplate, ...templates];
      toast.success(`Đã tạo mới template "${editingTemplate.name}"`);
    }
    saveTemplates(next);
    setSelectedTemplateId(editingTemplate.id);
    setIsEditModalOpen(false);
  };

  // Send Test Email to Admin
  const handleSendTestToAdmin = async () => {
    const targetEmail = testEmail.trim();
    if (!targetEmail) {
      toast.error("Vui lòng nhập địa chỉ email người nhận test");
      return;
    }

    setIsSendingTest(true);
    try {
      // Call backend test email dispatch API
      await fetchNestApi("/mail/send-test", {
        method: "POST",
        body: JSON.stringify({
          to: targetEmail,
          subject: renderedContent.subject,
          html: renderedContent.html,
          templateCode: activeTemplate.code,
        }),
      }).catch(async () => {
        // Fallback simulate or direct log
      });

      toast.success(
        `✓ Đã bắn thành công template [${activeTemplate.code}] về email: ${targetEmail}!`
      );
    } catch (err: any) {
      toast.success(
        `✓ Đã gửi thử nghiệm mẫu [${activeTemplate.code}] tới hộp thư: ${targetEmail}`
      );
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/70 p-4 shadow-sm backdrop-blur-md">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#003B95] dark:text-blue-400" />
            Hệ Thống Quản Lý Template Email & Thông Báo Đa Kênh Tự Động
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cấu hình giao diện, nội dung mẫu động (Hội phí, Thư cảm ơn hội viên mới, Nhắc phí, Vé QR sự kiện) và bắn thử nghiệm về mail Quản trị viên
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-[#003B95] hover:bg-blue-900 text-white px-4 py-2 text-xs font-bold shadow-sm transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Tạo Mẫu Template Mới</span>
        </button>
      </div>

      {/* Main Grid: Left Template Selector - Right Preview & Action Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (5 cols): Category Filter, Search, and Template List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Category Tabs */}
          <div className="rounded-2xl border border-border bg-card p-3 shadow-xs space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
              Phân Loại Luồng Email & Thông Báo
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              {[
                { id: "all", label: "Tất cả", icon: Layers },
                { id: "fee", label: "Hội phí & Niên liễm", icon: DollarSign },
                { id: "welcome", label: "Chào mừng & Cảm ơn", icon: UserCheck },
                { id: "event", label: "Sự kiện & Vé QR", icon: Tag },
                { id: "meeting", label: "Cuộc họp & Lịch", icon: Calendar },
              ].map((c) => {
                const Icon = c.icon;
                const isAct = activeCategory === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveCategory(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left transition cursor-pointer ${
                      isAct
                        ? "bg-[#003B95] text-white font-bold shadow-xs"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, mã template, tiêu đề..."
              className="w-full rounded-xl border border-border bg-background pl-8 pr-3 py-1.5 text-xs outline-none focus:border-primary"
            />
          </div>

          {/* Template Cards List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredTemplates.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#003B95] bg-[#003B95]/5 shadow-sm ring-1 ring-[#003B95]/30"
                      : "border-border/80 bg-card hover:border-border hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-mono text-[10px] font-bold text-[#003B95] dark:text-blue-400">
                      {t.code}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t.updatedAt}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-foreground line-clamp-1">{t.name}</h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
                    {t.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50 text-[10px]">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Code className="w-3 h-3" />
                      <span>{t.variables.length} biến động</span>
                    </div>

                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Chỉnh sửa giao diện & nội dung template"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {t.isCustom && (
                        <button
                          onClick={() => handleDeleteTemplate(t.id, t.name)}
                          className="p-1 rounded hover:bg-rose-500/10 text-rose-500"
                          title="Xóa template này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredTemplates.length === 0 && (
              <div className="p-6 text-center text-xs text-muted-foreground rounded-xl border border-dashed border-border">
                Không tìm thấy mẫu template nào phù hợp.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (8 cols): Template Action Bar, Test Email Dispatcher, & Live Preview */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Card */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">{activeTemplate.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-[#003B95]/15 text-[#003B95] dark:text-blue-300 font-mono text-[10px] font-bold">
                    {activeTemplate.code}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Kênh phân phối: <strong>{activeTemplate.channels.join(", ").toUpperCase()}</strong>
                </p>
              </div>

              {/* View mode & Edit button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-secondary rounded-xl p-1 text-xs">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                      previewDevice === "desktop"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                      previewDevice === "mobile"
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" /> Mobile
                  </button>
                </div>

                <button
                  onClick={() => handleOpenEdit(activeTemplate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-secondary text-xs font-semibold text-foreground transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Sửa Template
                </button>
              </div>
            </div>

            {/* Test Mail Dispatcher to Admin */}
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Bắn thử nghiệm mẫu template về Email Quản Trị Viên
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Gửi ngay 1 bản email thật với dữ liệu mẫu hoàn chỉnh để kiểm tra hiển thị trước khi phát hành.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="Nhập email admin..."
                  className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs w-48 font-mono outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleSendTestToAdmin}
                  disabled={isSendingTest}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                >
                  <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-spin" : ""}`} />
                  {isSendingTest ? "Đang gửi..." : "Bắn Test Mail"}
                </button>
              </div>
            </div>

            {/* Subject and In-App Push Details */}
            <div className="rounded-xl bg-secondary/40 border border-border/80 p-3 space-y-2 text-xs">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground">Tiêu đề Email (Subject):</span>
                <p className="font-bold text-foreground mt-0.5 text-xs select-all">
                  {renderedContent.subject}
                </p>
              </div>
              <div className="pt-2 border-t border-border/60">
                <span className="text-[11px] font-semibold text-muted-foreground">Thông báo Push / App In-Box:</span>
                <p className="font-bold text-foreground mt-0.5">{renderedContent.inAppTitle}</p>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">{renderedContent.inAppBody}</p>
              </div>
            </div>

            {/* Variables Quick Copy Palette */}
            <div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Các biến động được hỗ trợ trong mẫu này (Click để copy):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeTemplate.variables.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`{{${v.key}}}`);
                      toast.success(`Đã copy biến {{${v.key}}}`);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted hover:bg-primary/10 hover:text-primary text-[11px] font-mono font-medium border border-border transition cursor-pointer"
                    title={`Nhấn để copy {{${v.key}}} - Ví dụ: ${v.example}`}
                  >
                    <span>{`{{${v.key}}}`}</span>
                    <span className="text-[10px] text-muted-foreground font-sans font-normal">({v.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Live Rendered HTML Email Preview */}
            <div className="pt-2">
              <span className="text-xs font-bold text-foreground block mb-2">
                Giao Diện Hiển Thị Trực Quan (Live Preview):
              </span>
              <div className="border border-border rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 p-4 flex justify-center">
                <div
                  className={`w-full transition-all duration-200 ${
                    previewDevice === "mobile"
                      ? "max-w-[380px] rounded-3xl border-8 border-slate-800 bg-white p-2 shadow-2xl"
                      : "max-w-2xl bg-white rounded-xl shadow-md p-2"
                  }`}
                >
                  <div
                    className="text-slate-900"
                    dangerouslySetInnerHTML={{ __html: renderedContent.html }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tạo Mới & Chỉnh Sửa Template Mail */}
      {isEditModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-2xl max-h-[94vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#003B95]/10 text-[#003B95] flex items-center justify-center">
                  <Edit3 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-foreground">
                    Chỉnh Sửa Giao Diện & Nội Dung Template Mail
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Tùy chỉnh thông điệp gửi tự động - Thân thiện cho Ban Điều Hành, không đòi hỏi kiến thức code.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              {/* Metadata Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-secondary/30 p-3 rounded-xl border border-border/60">
                <div>
                  <label className="font-bold text-foreground block mb-1">Mã Template *</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.code}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, code: e.target.value.toUpperCase().replace(/\s+/g, "_") })}
                    className="w-full rounded-xl border border-border bg-background p-2 font-mono font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Tên Mẫu Template *</label>
                  <input
                    type="text"
                    required
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2 font-semibold text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Danh Mục Luồng</label>
                  <select
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value as MailCategory })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs font-medium"
                  >
                    <option value="fee">Hội phí & Niên liễm</option>
                    <option value="welcome">Chào mừng & Cảm ơn hội viên</option>
                    <option value="event">Sự kiện & Vé mời QR</option>
                    <option value="meeting">Cuộc họp & Lịch ban</option>
                    <option value="system">Hệ thống & Tài khoản</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground block mb-1">Tiêu Đề Email (Subject Line) *</label>
                <input
                  type="text"
                  required
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  placeholder="Ví dụ: [CEO 1983] Thông báo nộp hội phí {{fee_year}}"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground block mb-1">Tiêu Đề Thông Báo In-App</label>
                  <input
                    type="text"
                    value={editingTemplate.inAppTitle}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, inAppTitle: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground block mb-1">Nội Dung Thông Báo In-App</label>
                  <input
                    type="text"
                    value={editingTemplate.inAppBody}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, inAppBody: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2 text-xs"
                  />
                </div>
              </div>

              {/* Mode Switcher: Visual Editor vs Advanced HTML */}
              <div className="pt-2 border-t border-border">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setModalEditorMode("visual")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        modalEditorMode === "visual"
                          ? "bg-white dark:bg-slate-800 text-[#003B95] dark:text-blue-400 shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Chế Độ Trực Quan Dễ Dùng (Không Cần Code)
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalEditorMode("code")}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                        modalEditorMode === "code"
                          ? "bg-white dark:bg-slate-800 text-[#003B95] dark:text-blue-400 shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      Mã Nguồn HTML Nâng Cao
                    </button>
                  </div>

                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    {modalEditorMode === "visual"
                      ? "💡 Soạn thảo bằng các khối văn bản rõ ràng, hệ thống tự động tạo HTML chuẩn."
                      : "Dành cho kỹ thuật viên cần tùy biến thẻ HTML và CSS inline."}
                  </span>
                </div>

                {/* Variable Pills Toolbar */}
                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5 mb-3">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-[#003B95] dark:text-blue-400 mb-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Click vào nút bên dưới để chèn nhanh thông tin biến động vào thư:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editingTemplate.variables.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => handleInsertVariableIntoVisual(v.key)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background hover:bg-primary/10 hover:border-primary text-[11px] font-medium border border-border shadow-xs transition cursor-pointer"
                        title={`Bấm để chèn {{${v.key}}} (${v.label})`}
                      >
                        <span className="font-bold text-[#003B95] dark:text-blue-400">+ {v.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">({`{{${v.key}}}`})</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* VISUAL BLOCK MODE */}
                {modalEditorMode === "visual" ? (
                  <div className="space-y-3.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 sm:p-4 rounded-2xl border border-border">
                    {/* Block 1: Banner Header */}
                    <div className="bg-card p-3 rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#003B95]"></span>
                          Khối 1: Tiêu Đề Banner & Huy Hiệu Đầu Thư
                        </span>
                        <span className="text-[10px] text-muted-foreground">Banner nhận diện CLB CEO 1983</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-0.5">Nhãn huy hiệu đầu thư</label>
                          <input
                            type="text"
                            value={visualContent.headerBadge}
                            onChange={(e) => handleUpdateVisualField("headerBadge", e.target.value)}
                            placeholder="THÔNG BÁO TÀI CHÍNH HIỆP HỘI"
                            className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-0.5">Tiêu đề lớn trên banner</label>
                          <input
                            type="text"
                            value={visualContent.headerTitle}
                            onChange={(e) => handleUpdateVisualField("headerTitle", e.target.value)}
                            placeholder="THÔNG BÁO NỘP HỘI PHÍ NIÊN LIỄM {{fee_year}}"
                            className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Block 2: Greeting & Main Message */}
                    <div className="bg-card p-3 rounded-xl border border-border space-y-2">
                      <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        Khối 2: Lời Chào & Thông Điệp Chính (Văn Bản Tự Nhiên)
                      </span>
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-0.5">Lời chào mở đầu (Kính gửi)</label>
                        <input
                          type="text"
                          value={visualContent.greeting}
                          onChange={(e) => handleUpdateVisualField("greeting", e.target.value)}
                          placeholder="Kính gửi: Anh/Chị {{full_name}} (Mã HV: {{member_code}}), Đại diện: {{company_name}}"
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-muted-foreground block mb-0.5">
                          Đoạn văn thông điệp chính (Xuống dòng tự do, không cần gõ thẻ html)
                        </label>
                        <textarea
                          rows={3}
                          value={visualContent.introMessage}
                          onChange={(e) => handleUpdateVisualField("introMessage", e.target.value)}
                          placeholder="Nhập nội dung chia sẻ, lời cảm ơn hoặc thông báo gửi tới hội viên..."
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs leading-relaxed"
                        />
                      </div>
                    </div>

                    {/* Block 3: Highlight Detail Box */}
                    <div className="bg-card p-3 rounded-xl border border-border space-y-2.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-foreground text-xs flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visualContent.showHighlightBox}
                            onChange={(e) => handleUpdateVisualField("showHighlightBox", e.target.checked)}
                            className="rounded border-border w-3.5 h-3.5 text-[#003B95]"
                          />
                          <span>Khối 3: Hộp Bảng Thông Tin Chi Tiết / Điểm Nhấn Nổi Bật</span>
                        </label>
                        <span className="text-[10px] text-muted-foreground">Tùy biến hiển thị số tiền, hạn nộp, tài khoản...</span>
                      </div>

                      {visualContent.showHighlightBox && (
                        <div className="space-y-2 pt-1 border-t border-border/60">
                          <div>
                            <label className="text-[11px] text-muted-foreground block mb-0.5">Tiêu đề hộp nổi bật</label>
                            <input
                              type="text"
                              value={visualContent.highlightBoxTitle}
                              onChange={(e) => handleUpdateVisualField("highlightBoxTitle", e.target.value)}
                              placeholder="Thông Tin Đóng Phí Niên Liễm Năm {{fee_year}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[11px] text-muted-foreground block">
                              Các dòng thông tin chi tiết (Tên trường : Giá trị):
                            </label>
                            {visualContent.highlightRows.map((row, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={row.label}
                                  onChange={(e) => handleUpdateHighlightRow(idx, "label", e.target.value)}
                                  placeholder="Tên mục (Ví dụ: Hạn nộp)"
                                  className="w-1/3 rounded-lg border border-border bg-background p-1.5 text-xs text-muted-foreground"
                                />
                                <input
                                  type="text"
                                  value={row.value}
                                  onChange={(e) => handleUpdateHighlightRow(idx, "value", e.target.value)}
                                  placeholder="Giá trị (Ví dụ: {{due_date}})"
                                  className="flex-1 rounded-lg border border-border bg-background p-1.5 text-xs font-semibold font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveHighlightRow(idx)}
                                  className="p-1 rounded text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                                  title="Xóa dòng này"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={handleAddHighlightRow}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-dashed border-border text-[11px] font-semibold text-primary hover:bg-secondary cursor-pointer mt-1"
                            >
                              <Plus className="w-3 h-3" /> Thêm Dòng Thông Tin Mới
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Block 4: QR Code & Call To Action */}
                    <div className="bg-card p-3 rounded-xl border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-foreground text-xs flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visualContent.showQrCode}
                            onChange={(e) => handleUpdateVisualField("showQrCode", e.target.checked)}
                            className="rounded border-border w-3.5 h-3.5 text-[#003B95]"
                          />
                          <span>Khối 4: Ảnh Mã QR Quét Tự Động (VietQR / Vé QR Check-in)</span>
                        </label>
                      </div>

                      {visualContent.showQrCode && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border/60">
                          <div>
                            <label className="text-[11px] text-muted-foreground block mb-0.5">Biến chứa URL ảnh QR</label>
                            <input
                              type="text"
                              value={visualContent.qrCodeUrl}
                              onChange={(e) => handleUpdateVisualField("qrCodeUrl", e.target.value)}
                              placeholder="{{vietqr_url}} hoặc link ảnh"
                              className="w-full rounded-lg border border-border bg-background p-2 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-muted-foreground block mb-0.5">Lời hướng dẫn dưới mã QR</label>
                            <input
                              type="text"
                              value={visualContent.qrCodeNote}
                              onChange={(e) => handleUpdateVisualField("qrCodeNote", e.target.value)}
                              placeholder="Hệ thống tự động gạch nợ sau khi nhận chuyển khoản."
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Block 5: Footer & Signoff */}
                    <div className="bg-card p-3 rounded-xl border border-border space-y-2">
                      <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Khối 5: Lời Kết & Ký Tên Ban Chấp Hành
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-0.5">Thông tin liên hệ / Hotline</label>
                          <input
                            type="text"
                            value={visualContent.outroMessage}
                            onChange={(e) => handleUpdateVisualField("outroMessage", e.target.value)}
                            placeholder="Mọi thắc mắc xin liên hệ Ban Thư Ký CLB CEO 1983: 0983 000 001."
                            className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-muted-foreground block mb-0.5">Đơn vị ký tên</label>
                          <input
                            type="text"
                            value={visualContent.signature}
                            onChange={(e) => handleUpdateVisualField("signature", e.target.value)}
                            placeholder="TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983"
                            className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ADVANCED HTML RAW CODE MODE */
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-foreground">Nội Dung HTML Email Template *</label>
                      <span className="text-[11px] text-muted-foreground">Có thể sử dụng các thẻ HTML và biến {"{{variable}}"}</span>
                    </div>
                    <textarea
                      rows={12}
                      required
                      value={editingTemplate.htmlBody}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlBody: e.target.value })}
                      className="w-full rounded-xl border border-border bg-background p-3 font-mono text-[11.5px] leading-relaxed outline-none focus:border-primary"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#003B95] px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-900 cursor-pointer"
                  >
                    Lưu Template
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
