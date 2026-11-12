import React, { useState, useMemo, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
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
  Upload,
  Image as ImageIcon,
  Gift,
  TrendingUp,
  Users,
  FileSpreadsheet,
  MessageSquare,
  CreditCard,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { fetchNestApi } from "@/lib/api-client";
import { useZbsTemplateConfigs } from "@/hooks/useZbsTemplateConfigs";
import { ZbsTemplateConfigForm } from "./ZbsTemplateConfigForm";

export type MailCategory = "fee" | "welcome" | "event" | "meeting" | "system" | "birthday" | "marketing";

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
  visualContent?: VisualBlockContent;
}

export const INITIAL_MAIL_TEMPLATES: MailTemplateItem[] = [
  {
    id: "tmpl-event-invite-qr",
    code: "EVENT_INVITATION",
    category: "event",
    name: "Thư Mời Tham Dự Sự Kiện (Chuẩn Tinh Gọn Đa Kênh)",
    description: "Mẫu thông báo thư mời sự kiện tinh gọn theo chuẩn CLB, áp dụng đồng bộ cho Email, Zalo OA và In-App.",
    channels: ["email", "in_app", "push"],
    subject: "[THƯ MỜI SỰ KIỆN] {{event_title}} - Kính gửi Anh/Chị {{full_name}}",
    inAppTitle: "Thư mời tham dự sự kiện: {{event_title}}",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}\n- BTC trân trọng kính mời Anh/Chị tham dự sự kiện: {{event_title}}\n- Tên sự kiện: {{event_title}}\n- Thông tin sự kiện gồm các trường:\n  + Diễn giả: {{speaker_name}}\n  + Nội dung chính: {{event_summary}}\n  + Thời gian: {{event_date}}\n  + Địa điểm: {{event_location}}\n  + Chi phí: {{event_fee}}\n  + Google Maps: {{google_maps_url}}\n  + Trang phục: {{dress_code}}\n  + Gửi xe: {{parking_info}}\n  + Lưu ý quan trọng từ BTC: {{event_notes}}\n- Xác nhận tham dự: {{confirm_link}}\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng!",
    variables: [
      { key: "full_name", label: "Tên đại biểu (Kính gửi Anh/Chị)", example: "Dương Thị Huệ" },
      { key: "event_title", label: "Tên sự kiện", example: "Diễn Đàn Chuyển Đổi Số Doanh Nghiệp 2026 & Gala Kết Nối" },
      { key: "speaker_name", label: "Diễn giả", example: "Chủ tịch HĐQT VICONNECT GROUP, Chuyên gia Kinh tế trưởng" },
      { key: "event_summary", label: "Nội dung chính", example: "Chiến lược tăng trưởng doanh nghiệp 2026, Xúc tiến thương mại đa kênh, Ký kết hợp tác B2B" },
      { key: "event_date", label: "Thời gian", example: "18:30 - 21:30 Thứ Bảy, 10/09/2026" },
      { key: "event_location", label: "Địa điểm", example: "Habblet Hotel & Cung Điện Atlantis, Hà Nội" },
      { key: "event_fee", label: "Chi phí", example: "Miễn phí dành cho Hội viên chính thức CEO 1983" },
      { key: "google_maps_url", label: "Google Maps", example: "https://maps.google.com/?q=Habblet+Hotel+Hanoi" },
      { key: "dress_code", label: "Trang phục", example: "Vest / Dạ tiệc lịch sự" },
      { key: "parking_info", label: "Gửi xe", example: "Tầng hầm B1-B2 khách sạn, miễn phí vé xe" },
      { key: "event_notes", label: "Lưu ý quan trọng từ BTC", example: "Quý Anh/Chị vui lòng có mặt trước 15 phút và xuất trình mã QR trên vé để được hỗ trợ đón tiếp chu đáo nhất" },
      { key: "confirm_link", label: "Xác nhận tham dự", example: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}" },
      { key: "qr_code_url", label: "Ảnh mã QR Check-in", example: "https://ceo1983.viconnect.vn/api/events/qr?data=TICKET-CEO1983-M016&size=250" },
    ],
    updatedAt: "2026-11-12",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #001D4A 0%, #003B95 50%, #0A2540 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(234, 179, 8, 0.25); border: 1px solid rgba(234, 179, 8, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #fde047; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
      THƯ MỜI THAM DỰ SỰ KIỆN CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 900; color: #ffffff; text-transform: uppercase;">{{event_title}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #93c5fd;">Ban Tổ Chức CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>Kính gửi Anh/Chị {{full_name}}</strong></p>
    <p style="margin: 0 0 8px; color: #334155;">- BTC trân trọng kính mời Anh/Chị tham dự sự kiện: <strong style="color: #003B95;">{{event_title}}</strong></p>
    <p style="margin: 0 0 10px; font-weight: bold; color: #0f172a;">- Tên sự kiện: {{event_title}}</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #001D4A; text-transform: uppercase; font-size: 12.5px;">- Thông tin sự kiện gồm các trường:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 170px;">+ Diễn giả:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{{speaker_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Nội dung chính:</td><td style="padding: 4px 0; color: #334155;">{{event_summary}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Thời gian:</td><td style="padding: 4px 0; font-weight: 700; color: #003B95;">{{event_date}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Địa điểm:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{event_location}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Chi phí:</td><td style="padding: 4px 0; font-weight: 700; color: #16a34a;">{{event_fee}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Google Maps:</td><td style="padding: 4px 0;"><a href="{{google_maps_url}}" target="_blank" style="color: #0284c7; font-weight: bold; text-decoration: underline;">Xem bản đồ chỉ đường &rarr;</a></td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Trang phục:</td><td style="padding: 4px 0; color: #475569;">{{dress_code}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Gửi xe:</td><td style="padding: 4px 0; color: #475569;">{{parking_info}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Lưu ý quan trọng từ BTC:</td><td style="padding: 4px 0; color: #b45309; font-weight: 600;">{{event_notes}}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: bold;">- Xác nhận tham dự:</p>
      <a href="{{confirm_link}}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #003B95 0%, #002266 100%); color: #ffffff; font-weight: bold; font-size: 13.5px; text-decoration: none; padding: 12px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0, 59, 149, 0.3);">
        BẤM ĐỂ XÁC NHẬN THAM DỰ
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">0973.205.683 / 0903.205.683 / 0903.203.204</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- Trân trọng!</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-meeting-invite",
    code: "MEETING_INVITATION",
    category: "meeting",
    name: "Thư Mời Cuộc Họp Ban & CLB (Chuẩn Tinh Gọn)",
    description: "Mẫu thông báo họp định kỳ cho Ban Điều Hành, Ban Thường Trực và các Ban chuyên môn CLB CEO 1983.",
    channels: ["email", "in_app", "push"],
    subject: "[THƯ MỜI HỌP] {{meeting_title}} - Kính gửi Anh/Chị {{full_name}}",
    inAppTitle: "Thư mời họp: {{meeting_title}}",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}\n- BTC trân trọng kính mời Anh/Chị tham dự cuộc họp: {{meeting_title}}\n- Tên cuộc họp: {{meeting_title}}\n- Thông tin cuộc họp gồm các trường:\n  + Diễn giả: {{speaker_name}}\n  + Nội dung chính: {{event_summary}}\n  + Thời gian: {{event_date}}\n  + Địa điểm: {{event_location}}\n  + Chi phí: {{event_fee}}\n  + Google Maps: {{google_maps_url}}\n  + Trang phục: {{dress_code}}\n  + Gửi xe: {{parking_info}}\n  + Lưu ý quan trọng từ BTC: {{event_notes}}\n- Xác nhận tham dự: {{confirm_link}}\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng!",
    variables: [
      { key: "full_name", label: "Tên Anh/Chị tham dự", example: "Lê Minh Tuấn" },
      { key: "meeting_title", label: "Tên cuộc họp", example: "Họp Giao Ban Ban Điều Hành CLB CEO 1983 Tháng 10/2026" },
      { key: "speaker_name", label: "Chủ trì cuộc họp", example: "Chủ tịch CLB Doanh Nhân CEO 1983 & Tổng Thư Ký" },
      { key: "event_summary", label: "Nội dung chính", example: "Đánh giá kết quả kết nối B2B quý 3, Thống nhất kế hoạch xúc tiến thương mại và phê duyệt tân hội viên quý 4" },
      { key: "event_date", label: "Thời gian", example: "14:00 - 17:00 Thứ Sáu, 16/10/2026" },
      { key: "event_location", label: "Địa điểm / Phòng họp", example: "Văn phòng Hiệp hội HanoiBA, Tầng 5 Tháp Doanh Nhân" },
      { key: "event_fee", label: "Chi phí", example: "Kinh phí CLB đài thọ" },
      { key: "google_maps_url", label: "Google Maps", example: "https://maps.google.com/?q=HanoiBA+Office" },
      { key: "dress_code", label: "Trang phục", example: "Công sở lịch sự / Áo đồng phục CEO 1983" },
      { key: "parking_info", label: "Gửi xe", example: "Hầm để xe tòa nhà, bảo vệ hướng dẫn vị trí VIP" },
      { key: "event_notes", label: "Lưu ý quan trọng từ BTC", example: "Quý Anh/Chị vui lòng nghiên cứu trước tài liệu đính kèm để buổi họp đạt hiệu quả cao nhất" },
      { key: "confirm_link", label: "Xác nhận tham dự", example: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}" },
    ],
    updatedAt: "2026-11-12",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #094074 0%, #001B40 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(56, 189, 248, 0.2); border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #7dd3fc; margin-bottom: 12px; text-transform: uppercase;">
      THƯ MỜI CUỘC HỌP CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">{{meeting_title}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">Ban Thư Ký CLB Doanh Nhân CEO 1983</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>Kính gửi Anh/Chị {{full_name}}</strong></p>
    <p style="margin: 0 0 8px; color: #334155;">- BTC trân trọng kính mời Anh/Chị tham dự cuộc họp: <strong style="color: #003B95;">{{meeting_title}}</strong></p>
    <p style="margin: 0 0 10px; font-weight: bold; color: #0f172a;">- Tên cuộc họp: {{meeting_title}}</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #001D4A; text-transform: uppercase; font-size: 12.5px;">- Thông tin cuộc họp gồm các trường:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 170px;">+ Diễn giả:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{{speaker_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Nội dung chính:</td><td style="padding: 4px 0; color: #334155;">{{event_summary}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Thời gian:</td><td style="padding: 4px 0; font-weight: 700; color: #003B95;">{{event_date}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Địa điểm:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{event_location}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Chi phí:</td><td style="padding: 4px 0; font-weight: 700; color: #16a34a;">{{event_fee}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Google Maps:</td><td style="padding: 4px 0;"><a href="{{google_maps_url}}" target="_blank" style="color: #0284c7; font-weight: bold; text-decoration: underline;">Xem bản đồ chỉ đường &rarr;</a></td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Trang phục:</td><td style="padding: 4px 0; color: #475569;">{{dress_code}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Gửi xe:</td><td style="padding: 4px 0; color: #475569;">{{parking_info}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Lưu ý quan trọng từ BTC:</td><td style="padding: 4px 0; color: #b45309; font-weight: 600;">{{event_notes}}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: bold;">- Xác nhận tham dự:</p>
      <a href="{{confirm_link}}" target="_blank" style="display: inline-block; background: #003B95; color: #ffffff; font-weight: bold; font-size: 13.5px; text-decoration: none; padding: 12px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0, 59, 149, 0.3);">
        BẤM ĐỂ XÁC NHẬN THAM DỰ HỌP
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">0973.205.683 / 0903.205.683 / 0903.203.204</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- Trân trọng!</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-gathering-invite",
    code: "GATHERING_INVITATION",
    category: "meeting",
    name: "Thư Mời Cuộc Gặp & Giao Lưu Kết Nối (Chuẩn Tinh Gọn)",
    description: "Mẫu thông báo cuộc gặp gỡ, giao lưu kết nối doanh nhân và tiếp đón đối tác CLB CEO 1983.",
    channels: ["email", "in_app", "push"],
    subject: "[THƯ MỜI GẶP GỠ] {{gathering_title}} - Kính gửi Anh/Chị {{full_name}}",
    inAppTitle: "Thư mời cuộc gặp: {{gathering_title}}",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}\n- BTC trân trọng kính mời Anh/Chị tham dự cuộc gặp: {{gathering_title}}\n- Tên cuộc gặp: {{gathering_title}}\n- Thông tin cuộc gặp gồm các trường:\n  + Diễn giả: {{speaker_name}}\n  + Nội dung chính: {{event_summary}}\n  + Thời gian: {{event_date}}\n  + Địa điểm: {{event_location}}\n  + Chi phí: {{event_fee}}\n  + Google Maps: {{google_maps_url}}\n  + Trang phục: {{dress_code}}\n  + Gửi xe: {{parking_info}}\n  + Lưu ý quan trọng từ BTC: {{event_notes}}\n- Xác nhận tham dự: {{confirm_link}}\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng!",
    variables: [
      { key: "full_name", label: "Tên Anh/Chị tham dự", example: "Nguyễn Văn Tuấn" },
      { key: "gathering_title", label: "Tên cuộc gặp", example: "Cuộc Gặp Giao Lưu Doanh Nhân CEO 1983 & Đối Tác Chiến Lược" },
      { key: "speaker_name", label: "Diễn giả", example: "Ban Điều Hành CLB CEO 1983" },
      { key: "event_summary", label: "Nội dung chính", example: "Gặp gỡ thân mật, trao đổi định hướng hợp tác thương mại và xúc tiến B2B" },
      { key: "event_date", label: "Thời gian", example: "17:30 - 20:30 Thứ Năm, 15/10/2026" },
      { key: "event_location", label: "Địa điểm", example: "Phòng VIP Nhà hàng Trống Đồng, Cầu Giấy, Hà Nội" },
      { key: "event_fee", label: "Chi phí", example: "Kinh phí CLB đài thọ" },
      { key: "google_maps_url", label: "Google Maps", example: "https://maps.google.com/?q=TrongDong+Hanoi" },
      { key: "dress_code", label: "Trang phục", example: "Lịch sự / Smart Casual" },
      { key: "parking_info", label: "Gửi xe", example: "Bãi đỗ xe trước sảnh nhà hàng" },
      { key: "event_notes", label: "Lưu ý quan trọng từ BTC", example: "Vui lòng xác nhận tham dự sớm để BTC chuẩn bị đón tiếp chu đáo" },
      { key: "confirm_link", label: "Xác nhận tham dự", example: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}" },
    ],
    updatedAt: "2026-11-12",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #1e3a8a 0%, #172554 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(147, 197, 253, 0.2); border: 1px solid rgba(147, 197, 253, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #93c5fd; margin-bottom: 12px; text-transform: uppercase;">
      THƯ MỜI CUỘC GẶP CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">{{gathering_title}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #bfdbfe;">Ban Kết Nối &amp; Phát Triển CLB CEO 1983</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>Kính gửi Anh/Chị {{full_name}}</strong></p>
    <p style="margin: 0 0 8px; color: #334155;">- BTC trân trọng kính mời Anh/Chị tham dự cuộc gặp: <strong style="color: #1e3a8a;">{{gathering_title}}</strong></p>
    <p style="margin: 0 0 10px; font-weight: bold; color: #0f172a;">- Tên cuộc gặp: {{gathering_title}}</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #001D4A; text-transform: uppercase; font-size: 12.5px;">- Thông tin cuộc gặp gồm các trường:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 170px;">+ Diễn giả:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{{speaker_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Nội dung chính:</td><td style="padding: 4px 0; color: #334155;">{{event_summary}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Thời gian:</td><td style="padding: 4px 0; font-weight: 700; color: #003B95;">{{event_date}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Địa điểm:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{event_location}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Chi phí:</td><td style="padding: 4px 0; font-weight: 700; color: #16a34a;">{{event_fee}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Google Maps:</td><td style="padding: 4px 0;"><a href="{{google_maps_url}}" target="_blank" style="color: #0284c7; font-weight: bold; text-decoration: underline;">Xem bản đồ chỉ đường &rarr;</a></td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Trang phục:</td><td style="padding: 4px 0; color: #475569;">{{dress_code}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Gửi xe:</td><td style="padding: 4px 0; color: #475569;">{{parking_info}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Lưu ý quan trọng từ BTC:</td><td style="padding: 4px 0; color: #b45309; font-weight: 600;">{{event_notes}}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: bold;">- Xác nhận tham dự:</p>
      <a href="{{confirm_link}}" target="_blank" style="display: inline-block; background: #1e3a8a; color: #ffffff; font-weight: bold; font-size: 13.5px; text-decoration: none; padding: 12px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(30, 58, 138, 0.3);">
        BẤM ĐỂ XÁC NHẬN THAM DỰ CUỘC GẶP
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">0973.205.683 / 0903.205.683 / 0903.203.204</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- Trân trọng!</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-training-invite",
    code: "TRAINING_INVITATION",
    category: "event",
    name: "Thư Mời Chương Trình Đào Tạo Doanh Nhân (Chuẩn Tinh Gọn)",
    description: "Mẫu thông báo các chương trình đào tạo, hội thảo nâng cao năng lực quản trị doanh nghiệp CEO 1983.",
    channels: ["email", "in_app", "push"],
    subject: "[CHƯƠNG TRÌNH ĐÀO TẠO] {{training_title}} - Kính gửi Anh/Chị {{full_name}}",
    inAppTitle: "Thư mời đào tạo: {{training_title}}",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}\n- BTC trân trọng kính mời Anh/Chị tham dự chương trình: {{training_title}}\n- Tên chương trình: {{training_title}}\n- Thông tin chương trình gồm các trường:\n  + Diễn giả: {{speaker_name}}\n  + Nội dung chính: {{event_summary}}\n  + Thời gian: {{event_date}}\n  + Địa điểm: {{event_location}}\n  + Chi phí: {{event_fee}}\n  + Google Maps: {{google_maps_url}}\n  + Trang phục: {{dress_code}}\n  + Gửi xe: {{parking_info}}\n  + Lưu ý quan trọng từ BTC: {{event_notes}}\n- Xác nhận tham dự: {{confirm_link}}\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng!",
    variables: [
      { key: "full_name", label: "Tên Anh/Chị học viên", example: "Nguyễn Thu Hà" },
      { key: "training_title", label: "Tên chương trình đào tạo", example: "Chiến Lược Tối Ưu Hóa Dòng Tiền & Tái Cấu Trúc Doanh Nghiệp Thời Kỳ Mới" },
      { key: "speaker_name", label: "Diễn giả", example: "TS. Kinh tế học — Chuyên gia Tài chính Doanh nghiệp Cao cấp" },
      { key: "event_summary", label: "Nội dung chính", example: "Nắm vững kỹ thuật quản trị vốn lưu động, kiểm soát rủi ro đòn bẩy và lập kế hoạch ngân sách tự động cho CEO" },
      { key: "event_date", label: "Thời gian", example: "08:30 - 17:00 Thứ Bảy, 24/10/2026" },
      { key: "event_location", label: "Địa điểm / Phòng đào tạo", example: "Hội trường Diamond, Trung tâm Đào tạo Doanh nhân Hà Nội" },
      { key: "event_fee", label: "Chi phí", example: "Hội viên CEO 1983 được hỗ trợ 100% học phí" },
      { key: "google_maps_url", label: "Google Maps", example: "https://maps.google.com/?q=Hanoi+Training+Center" },
      { key: "dress_code", label: "Trang phục", example: "Lịch sự / Business Casual" },
      { key: "parking_info", label: "Gửi xe", example: "Bãi đỗ xe khuôn viên trung tâm đào tạo" },
      { key: "event_notes", label: "Lưu ý quan trọng từ BTC", example: "Học viên vui lòng mang theo sổ tay, laptop để thực hành tình huống tài chính thực tế" },
      { key: "confirm_link", label: "Xác nhận tham dự", example: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}" },
    ],
    updatedAt: "2026-11-12",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #065f46 0%, #022c22 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(52, 211, 153, 0.25); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #6ee7b7; margin-bottom: 12px; text-transform: uppercase;">
      CHƯƠNG TRÌNH ĐÀO TẠO DOANH NHÂN
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">{{training_title}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #a7f3d0;">Ban Đào Tạo &amp; Phát Triển Năng Lực CLB CEO 1983</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>Kính gửi Anh/Chị {{full_name}}</strong></p>
    <p style="margin: 0 0 8px; color: #334155;">- BTC trân trọng kính mời Anh/Chị tham dự chương trình: <strong style="color: #065f46;">{{training_title}}</strong></p>
    <p style="margin: 0 0 10px; font-weight: bold; color: #0f172a;">- Tên chương trình: {{training_title}}</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #065f46; text-transform: uppercase; font-size: 12.5px;">- Thông tin chương trình gồm các trường:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 170px;">+ Diễn giả:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{{speaker_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Nội dung chính:</td><td style="padding: 4px 0; color: #334155;">{{event_summary}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Thời gian:</td><td style="padding: 4px 0; font-weight: 700; color: #065f46;">{{event_date}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Địa điểm:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{event_location}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Chi phí:</td><td style="padding: 4px 0; font-weight: 700; color: #16a34a;">{{event_fee}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Google Maps:</td><td style="padding: 4px 0;"><a href="{{google_maps_url}}" target="_blank" style="color: #0284c7; font-weight: bold; text-decoration: underline;">Xem bản đồ chỉ đường &rarr;</a></td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Trang phục:</td><td style="padding: 4px 0; color: #475569;">{{dress_code}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Gửi xe:</td><td style="padding: 4px 0; color: #475569;">{{parking_info}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Lưu ý quan trọng từ BTC:</td><td style="padding: 4px 0; color: #b45309; font-weight: 600;">{{event_notes}}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: bold;">- Xác nhận tham dự:</p>
      <a href="{{confirm_link}}" target="_blank" style="display: inline-block; background: #065f46; color: #ffffff; font-weight: bold; font-size: 13.5px; text-decoration: none; padding: 12px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(6, 95, 70, 0.3);">
        BẤM ĐỂ XÁC NHẬN THAM GIA KHÓA HỌC
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">0973.205.683 / 0903.205.683 / 0903.203.204</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- Trân trọng!</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-welcome-new-member",
    code: "NEW_MEMBER_THANKS",
    category: "welcome",
    name: "Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập",
    description: "Thư cảm ơn và chúc mừng chính thức gửi đến tân hội viên ngay sau khi hoàn tất đăng ký gia nhập CLB CEO 1983.",
    channels: ["email", "in_app", "push"],
    subject: "[THƯ CẢM ƠN] Chúc mừng Anh/Chị {{full_name}} chính thức gia nhập CLB Doanh Nhân CEO 1983",
    inAppTitle: "Chào mừng tân hội viên {{full_name}}!",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}\n- Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!\n- Họ và tên: {{full_name}}\n- Tên doanh nghiệp: {{company_name}}\n- Mã hội viên: {{member_code}}\n- Ban sinh hoạt: {{department}}\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng! TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983",
    variables: [
      { key: "full_name", label: "Họ và tên hội viên", example: "Trần Anh Đức" },
      { key: "member_code", label: "Mã hội viên được cấp", example: "M1983-025" },
      { key: "company_name", label: "Tên doanh nghiệp", example: "Công ty Cổ phần Giải pháp Năng lượng Xanh" },
      { key: "department", label: "Ban sinh hoạt", example: "Ban Xúc tiến thương mại & Đầu tư" },
    ],
    updatedAt: "2026-11-12",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #094074 0%, #001B40 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #6ee7b7; margin-bottom: 12px; text-transform: uppercase;">
      THƯ CẢM ƠN & CHÀO MỪNG CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">CHÀO MỪNG TÂN HỘI VIÊN CEO 1983</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">Cùng gắn kết - Cùng chia sẻ - Cùng phát triển vững mạnh</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>Kính gửi Anh/Chị {{full_name}}</strong></p>
    <p style="margin: 0 0 14px; color: #334155;">- Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #166534; text-transform: uppercase; font-size: 12.5px;">- Thông tin hội viên:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #4b5563; width: 170px;">+ Họ và tên:</td><td style="padding: 4px 0; font-weight: 700; color: #111827;">{{full_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">+ Tên doanh nghiệp:</td><td style="padding: 4px 0; font-weight: 600; color: #111827;">{{company_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">+ Mã hội viên:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #15803d; font-size: 14px;">{{member_code}}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">+ Ban sinh hoạt:</td><td style="padding: 4px 0; font-weight: 600; color: #1d4ed8;">{{department}}</td></tr>
      </table>
    </div>
    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">0973.205.683 / 0903.205.683 / 0903.203.204</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- Trân trọng! TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-member-credentials",
    code: "MEMBER_ACCOUNT_CREDENTIALS",
    category: "system",
    name: "Template Gửi Tài Khoản & Mật Khẩu Cho Hội Viên Mới",
    description: "Tự động gửi thông tin tài khoản đăng nhập kèm link cài đặt app 1-chạm và liên kết Zalo OA chính thức.",
    channels: ["email", "in_app", "sms"],
    subject: "[TÀI KHOẢN HỘI VIÊN] Thông tin đăng nhập ứng dụng CEO 1983 - Kính gửi Anh/Chị {{full_name}}",
    inAppTitle: "Thông tin tài khoản ứng dụng CEO 1983",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}\n- Ban Quản Trị gửi thông tin tài khoản đăng nhập app CEO 1983:\n- Tên đăng nhập: {{email}}\n- Mật khẩu: {{temporary_password}}\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng!",
    variables: [
      { key: "full_name", label: "Họ và tên hội viên", example: "Nguyễn Văn Tuấn" },
      { key: "email", label: "Tên đăng nhập (Email)", example: "tuan.nguyen@vione.com" },
      { key: "temporary_password", label: "Mật khẩu khởi tạo", example: "Ceo1983@Pass" },
      { key: "member_code", label: "Mã hội viên", example: "M1983-088" },
      { key: "department", label: "Ban sinh hoạt", example: "Ban Truyền Thông" },
      { key: "app_install_url", label: "Link cài App & Zalo OA", example: "https://ceo1983.viconnect.vn/open-app?email=tuan.nguyen@vione.com&auto_install=true" },
    ],
    updatedAt: "2026-11-11",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #001D4A 0%, #003B95 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(254, 240, 138, 0.25); border: 1px solid rgba(254, 240, 138, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #fde047; margin-bottom: 12px; text-transform: uppercase;">
      THÔNG TIN TÀI KHOẢN HỘI VIÊN CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">TÀI KHOẢN ỨNG DỤNG CEO 1983</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #cbd5e1;">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 12px; font-size: 15px;"><strong>Kính gửi Anh/Chị {{full_name}}</strong></p>
    <p style="margin: 0 0 14px; color: #334155;">
      - Ban Quản Trị CLB Doanh Nhân CEO 1983 trân trọng gửi Quý Anh/Chị thông tin tài khoản đăng nhập ứng dụng Hội viên CEO 1983:
    </p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #003B95; border-radius: 10px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #001D4A; text-transform: uppercase; font-size: 12.5px;">- Thông tin tài khoản:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; color: #64748b; width: 170px;">+ Tên đăng nhập (Email):</td><td style="padding: 5px 0; font-family: monospace; font-weight: 700; color: #0284c7; font-size: 14px;">{{email}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Mật khẩu khởi tạo:</td><td style="padding: 5px 0; font-family: monospace; font-weight: 700; color: #d97706; font-size: 14px;">{{temporary_password}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Mã hội viên:</td><td style="padding: 5px 0; font-weight: 700; color: #0f172a;">{{member_code}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Ban sinh hoạt:</td><td style="padding: 5px 0; font-weight: 600; color: #166534;">{{department}}</td></tr>
      </table>
    </div>

    <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 12px; padding: 14px; margin: 16px 0; font-size: 13px; color: #713f12;">
      <p style="margin: 0 0 6px; font-weight: bold;">- Hướng dẫn cài đặt &amp; kích hoạt:</p>
      <p style="margin: 0 0 6px;">+ Nhấn nút bên dưới để <strong>tự động cài đặt ứng dụng lên màn hình điện thoại (iOS / Android)</strong> và đồng thời <strong>liên kết đến trang Zalo Official Account chính thức của CLB</strong>.</p>
      <p style="margin: 0; color: #b45309; font-weight: 600;">+ Lưu ý: Khi đăng nhập lần đầu tiên vào ứng dụng, hệ thống sẽ yêu cầu Quý Anh/Chị bắt buộc đổi mật khẩu mới để bảo mật tài khoản.</p>
    </div>

    <div style="text-align: center; margin: 24px 0;">
      <a href="{{app_install_url}}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #003B95 0%, #001f54 100%); color: #ffffff; padding: 14px 34px; border-radius: 9999px; font-size: 14px; font-weight: 800; text-decoration: none; box-shadow: 0 4px 16px rgba(0, 59, 149, 0.35);">
        CÀI ĐẶT APP CEO 1983 &amp; KẾT NỐI ZALO OA
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">0973.205.683 / 0903.205.683 / 0903.203.204</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- Trân trọng!</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-fee-payment",
    code: "FEE_NOTICE_ANNUAL",
    category: "fee",
    name: "Thông Báo Nộp Hội Phí Niên Liễm Định Kỳ",
    description: "Mẫu thông báo hội phí niên liễm định kỳ với đầy đủ thông tin số tài khoản và ngân hàng CLB.",
    channels: ["email", "in_app", "push"],
    subject: "[CEO 1983] Thông báo nộp hội phí thường niên năm {{fee_year}} - {{full_name}}",
    inAppTitle: "Thông báo nộp hội phí năm {{fee_year}}",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}\n- Ban Thường Trực CLB Doanh Nhân CEO 1983 trân trọng thông báo quyết toán niên liễm năm {{fee_year}}.\n- Mức hội phí: {{fee_amount}} VNĐ\n- Hạn nộp: {{due_date}}\n- Tên tài khoản: {{bank_owner}}\n- Số tài khoản CLB: {{bank_account}}\n- Ngân hàng: {{bank_name}}\n- Cú pháp chuyển khoản: {{transfer_content}}\n- Hotline Kế toán: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng! TM. BAN TÀI CHÍNH & KẾ TOÁN CLB DOANH NHÂN CEO 1983",
    variables: [
      { key: "full_name", label: "Tên hội viên / Đại diện", example: "Phạm Hồng Nguyên" },
      { key: "company_name", label: "Tên doanh nghiệp", example: "Tập Đoàn An Phát" },
      { key: "fee_year", label: "Năm tài chính", example: "2026" },
      { key: "fee_amount", label: "Mức hội phí", example: "5.000.000" },
      { key: "due_date", label: "Hạn thanh toán", example: "31/12/2026" },
      { key: "bank_name", label: "Ngân hàng CLB", example: "MB Bank (Ngân hàng Quân Đội)" },
      { key: "bank_account", label: "Số tài khoản CLB", example: "19832026888" },
      { key: "bank_owner", label: "Chủ tài khoản", example: "CLB DOANH NHAN CEO 1983" },
      { key: "transfer_content", label: "Cú pháp chuyển khoản", example: "CEO1983 {{member_code}} HOIPHI2026" },
    ],
    updatedAt: "2026-11-12",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #002B66 0%, #001B40 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(212, 160, 23, 0.25); border: 1px solid rgba(212, 160, 23, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #f6d365; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
      THÔNG BÁO TÀI CHÍNH CLB
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">THÔNG BÁO NỘP HỘI PHÍ NIÊN LIỄM NĂM {{fee_year}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #cbd5e1;">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>Kính gửi Anh/Chị {{full_name}}</strong> ({{company_name}}),</p>
    <p style="margin: 0 0 14px; color: #334155;">- Ban Thường Trực CLB Doanh Nhân CEO 1983 trân trọng thông báo quyết toán hội phí niên liễm năm {{fee_year}}:</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 10px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #001D4A; text-transform: uppercase; font-size: 12.5px;">- Thông tin nộp phí &amp; Tài khoản CLB:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 170px;">+ Mức hội phí:</td><td style="padding: 4px 0; font-weight: 700; color: #b45309; font-size: 15px;">{{fee_amount}} VNĐ</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Hạn nộp:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{due_date}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Tên tài khoản:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">{{bank_owner}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Số tài khoản CLB:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 800; color: #0284c7; font-size: 15px;">{{bank_account}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Ngân hàng:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">{{bank_name}}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Cú pháp chuyển khoản:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #d97706;">{{transfer_content}}</td></tr>
      </table>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">0973.205.683 / 0903.205.683 / 0903.203.204</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- Trân trọng! TM. BAN TÀI CHÍNH & KẾ TOÁN CLB DOANH NHÂN CEO 1983</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-event-ticket-full",
    code: "EVENT_TICKET_FULL",
    category: "event",
    name: "Thư Mời Tham Dự Sự Kiện (Bản Đầy Đủ)",
    description: "Phát hành thư mời chính thức chuẩn đa kênh kèm đầy đủ thông tin sự kiện.",
    channels: ["email", "in_app", "push"],
    subject: "[THƯ MỜI SỰ KIỆN] {{event_title}} - Kính gửi Anh/Chị {{full_name}}",
    inAppTitle: "Thư mời tham dự sự kiện: {{event_title}}",
    inAppBody: "- Kính gửi Anh/Chị: {{full_name}}\n- BTC trân trọng kính mời Anh/Chị tham dự sự kiện: {{event_title}}\n- Thời gian: {{event_date}}\n- Địa điểm: {{event_location}}\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng!",
    variables: [
      { key: "full_name", label: "Tên đại biểu (Kính gửi Anh/Chị)", example: "Dương Thị Huệ" },
      { key: "member_code", label: "Mã hội viên", example: "M1983-016" },
      { key: "event_title", label: "Tên sự kiện", example: "Diễn Đàn Chuyển Đổi Số Doanh Nghiệp 2026 & Gala Kết Nối" },
      { key: "poster_url", label: "Ảnh Poster sự kiện", example: "https://ceo1983.viconnect.vn/uploads/events/poster.jpg" },
      { key: "speakers", label: "Diễn giả", example: "Chủ tịch HĐQT & Sáng Lập VICONNECT GROUP, Chuyên gia Kinh tế trưởng" },
      { key: "summary", label: "Nội dung chính", example: "Chiến lược tăng trưởng doanh nghiệp 2026, Xúc tiến thương mại đa kênh, Ký kết hợp tác B2B" },
      { key: "event_date", label: "Thời gian", example: "18:30 - 21:30 Thứ Bảy, 10/09/2026" },
      { key: "event_location", label: "Địa điểm", example: "Habblet Hotel & Cung Điện Atlantis, Hà Nội" },
      { key: "fee", label: "Chi phí", example: "Miễn phí dành cho Hội viên chính thức CEO 1983" },
      { key: "google_maps_link", label: "Google Maps", example: "https://maps.google.com/?q=Habblet+Hotel+Hanoi" },
      { key: "dress_code", label: "Trang phục", example: "Black Tie / Vest / Dạ tiệc lịch sự" },
      { key: "parking_info", label: "Gửi xe", example: "Tầng hầm B1-B2 khách sạn, miễn phí vé xe" },
      { key: "important_notes", label: "Lưu ý quan trọng từ BTC", example: "Quý Anh/Chị vui lòng có mặt trước 15 phút và xuất trình mã QR trên vé để được hỗ trợ đón tiếp chu đáo nhất" },
      { key: "rsvp_action_url", label: "Link xác nhận tham dự", example: "https://ceo1983.viconnect.vn/association/events?action=register" },
      { key: "seat_assignment", label: "Vị trí chỗ ngồi / Bàn tiệc", example: "Bàn VIP 02 - Ghế 05" },
      { key: "ticket_type", label: "Hạng vé", example: "VIP Pass Gold" },
      { key: "qr_code_url", label: "Ảnh mã QR Check-in", example: "https://ceo1983.viconnect.vn/api/events/qr?data=TICKET-CEO1983-M016&size=250" },
    ],
    updatedAt: "2026-11-11",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #001D4A 0%, #003B95 50%, #0A2540 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(234, 179, 8, 0.25); border: 1px solid rgba(234, 179, 8, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #fde047; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
      THƯ MỜI THAM DỰ SỰ KIỆN CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 900; color: #ffffff; text-transform: uppercase;">{{event_title}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #93c5fd;">Ban Tổ Chức CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 12px; font-size: 15px; line-height: 1.6;">
      - <strong>Kính gửi Anh/Chị:</strong> <span style="color: #003B95; font-weight: 800;">{{full_name}}</span>
    </p>
    <p style="margin: 0 0 12px; font-size: 14px; line-height: 1.6; color: #334155;">
      - <strong>BTC trân trọng kính mời Anh/Chị tham dự sự kiện:</strong>
    </p>
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; font-weight: 800; color: #001D4A;">
      - <strong>Tên sự kiện:</strong> {{event_title}}
    </p>

    <!-- Poster nếu có -->
    <div style="margin-bottom: 18px; text-align: center;">
      <img src="{{poster_url}}" alt="Poster sự kiện" style="max-width: 100%; border-radius: 12px; border: 1px solid #e2e8f0; display: block; margin: 0 auto;" onerror="this.style.display='none'" />
    </div>

    <!-- Thông tin sự kiện -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 20px; margin-bottom: 22px;">
      <p style="margin: 0 0 10px; font-size: 13.5px; font-weight: 800; color: #001D4A; text-transform: uppercase;">
        - Thông tin sự kiện:
      </p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; color: #64748b; width: 150px;">+ Diễn giả:</td><td style="padding: 5px 0; font-weight: 700; color: #0f172a;">{{speakers}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Nội dung chính:</td><td style="padding: 5px 0; color: #334155; line-height: 1.5;">{{summary}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Thời gian:</td><td style="padding: 5px 0; font-weight: 700; color: #003B95;">{{event_date}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Địa điểm:</td><td style="padding: 5px 0; font-weight: 600; color: #0f172a;">{{event_location}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Chi phí:</td><td style="padding: 5px 0; font-weight: 700; color: #16a34a;">{{fee}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Google Maps:</td><td style="padding: 5px 0;"><a href="{{google_maps_link}}" target="_blank" style="color: #0284c7; font-weight: bold; text-decoration: underline;">Xem bản đồ chỉ đường &rarr;</a></td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Trang phục:</td><td style="padding: 5px 0; color: #475569;">{{dress_code}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Gửi xe:</td><td style="padding: 5px 0; color: #475569;">{{parking_info}}</td></tr>
        <tr><td style="padding: 5px 0; color: #64748b;">+ Lưu ý quan trọng từ BTC:</td><td style="padding: 5px 0; color: #b45309; font-weight: 600;">{{important_notes}}</td></tr>
      </table>
    </div>

    <!-- Xác nhận tham dự -->
    <div style="text-align: center; margin: 24px 0 16px;">
      <p style="margin: 0 0 8px; font-size: 13px; font-weight: bold; color: #001D4A;">- Xác nhận tham dự:</p>
      <a href="{{rsvp_action_url}}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #0f172a; font-weight: 900; font-size: 14px; text-decoration: none; padding: 14px 36px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);">
        XÁC NHẬN THAM DỰ SỰ KIỆN
      </a>
    </div>

    <!-- KHỐI MÃ QR VÉ ĐIỆN TỬ -->
    <div style="text-align: center; margin: 24px 0; padding: 20px; border: 2px dashed #cbd5e1; border-radius: 14px; background: #fafafa;">
      <p style="margin: 0 0 6px; font-size: 13px; font-weight: 800; color: #001D4A; text-transform: uppercase;">MÃ QR VÉ CHECK-IN VÀO CỬA</p>
      <p style="margin: 0 0 12px; font-size: 11.5px; color: #64748b;">Quý Anh/Chị vui lòng xuất trình mã này tại quầy đón tiếp VIP</p>
      <img src="{{qr_code_url}}" alt="QR Check-in" style="width: 180px; height: 180px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); display: block; margin: 0 auto; background: #ffffff; padding: 8px;" />
      <div style="margin-top: 10px; font-size: 12px; font-weight: bold; color: #003B95;">
        Hạng vé: {{ticket_type}} · Chỗ ngồi: {{seat_assignment}}
      </div>
    </div>

    <!-- HOTLINE LIÊN HỆ -->
    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 24px; font-size: 12.5px; color: #334155; line-height: 1.6;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong></p>
      <p style="margin: 0; font-weight: bold; color: #001D4A; font-size: 13.5px;">
        0973.205.683 &nbsp;/&nbsp; 0903.205.683 &nbsp;/&nbsp; 0903.203.204
      </p>
      <p style="margin: 12px 0 0; font-style: italic; color: #64748b;">- Trân trọng!</p>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-birthday-greeting",
    code: "BIRTHDAY_GREETING",
    category: "birthday",
    name: "Thiệp & Thư Chúc Mừng Sinh Nhật Hội Viên",
    description: "Tự động gửi thư chúc mừng sinh nhật kèm thiệp mừng sang trọng, lời chúc từ Chủ tịch & Ban Điều Hành, và banner ảnh tải lên tùy biến.",
    channels: ["email", "in_app", "push"],
    subject: "[CHÚC MỪNG SINH NHẬT] CLB Doanh Nhân CEO 1983 chúc mừng sinh nhật Anh/Chị {{full_name}}!",
    inAppTitle: "Chúc mừng sinh nhật Anh/Chị {{full_name}}!",
    inAppBody: "Ban Chấp Hành CLB Doanh Nhân CEO 1983 kính chúc Anh/Chị {{full_name}} ({{company_name}}) tuổi mới sức khỏe dồi dào, vạn sự hanh thông và gặt hái nhiều thành công rực rỡ!",
    variables: [
      { key: "full_name", label: "Họ và tên hội viên", example: "Lê Minh Tuấn" },
      { key: "member_code", label: "Mã hội viên", example: "M1983-099" },
      { key: "company_name", label: "Tên doanh nghiệp", example: "Tập Đoàn Đầu Tư Quốc Tế An Phát" },
      { key: "executive_role", label: "Vai trò / Chức danh", example: "Ủy viên Ban Điều Hành" },
      { key: "department", label: "Ban chuyên môn", example: "Ban Xúc tiến thương mại" },
      { key: "birth_date", label: "Ngày sinh nhật", example: "15/10" },
      { key: "banner_image_url", label: "Ảnh banner thiệp mừng", example: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80" },
      { key: "wishes_text", label: "Lời chúc đặc biệt", example: "Kính chúc Anh tuổi mới sức khỏe dồi dào, bản lĩnh vững vàng và dẫn dắt doanh nghiệp bứt phá ngoạn mục!" },
    ],
    updatedAt: "2026-10-01",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,43,102,0.12);">
  <div style="background: linear-gradient(135deg, #002B66 0%, #001733 50%, #B8860B 100%); padding: 36px 24px; text-align: center; color: #ffffff; position: relative;">
    <div style="display: inline-block; padding: 6px 18px; background: rgba(245, 158, 11, 0.25); border: 1px solid rgba(245, 158, 11, 0.6); border-radius: 9999px; font-size: 12px; font-weight: 800; color: #FBBF24; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 1.5px;">
      🎂 HAPPY BIRTHDAY · CHÚC MỪNG SINH NHẬT
    </div>
    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.5px;">CHÚC MỪNG SINH NHẬT HỘI VIÊN</h1>
    <p style="margin: 8px 0 0; font-size: 15px; color: #fef08a; font-weight: 700;">Anh/Chị {{full_name}} ({{birth_date}})</p>
    <p style="margin: 4px 0 0; font-size: 12px; color: #cbd5e1;">CLB Doanh Nhân CEO 1983 - Hiệp Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)</p>
  </div>

  <div style="padding: 16px 20px 0; text-align: center; background: #fafafa;">
    <div style="border-radius: 14px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1); border: 2px solid #fef3c7; max-height: 240px;">
      <img src="{{banner_image_url}}" alt="Thiệp Mừng Sinh Nhật" style="width: 100%; height: auto; max-height: 240px; object-fit: cover; display: block;" />
    </div>
  </div>

  <div style="padding: 24px 24px 28px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.7;">
      Kính gửi: <strong>Anh/Chị {{full_name}}</strong>,<br/>
      Chức vụ: <strong>{{executive_role}}</strong> - <strong>{{department}}</strong>,<br/>
      Đại diện: <strong>{{company_name}}</strong>,
    </p>

    <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 5px solid #d97706; border-radius: 10px; padding: 20px; margin-bottom: 22px;">
      <p style="margin: 0 0 10px; font-size: 15px; font-style: italic; line-height: 1.8; color: #92400e;">
        "{{wishes_text}}"
      </p>
      <p style="margin: 0; font-size: 13px; color: #b45309; font-weight: 600;">
        Nhân dịp sinh nhật của Anh/Chị, Ban Chấp Hành và toàn thể các Doanh nhân thành viên ngôi nhà chung CEO 1983 xin trân trọng gửi tới Anh/Chị những lời chúc mừng nồng nhiệt và tốt đẹp nhất!
      </p>
    </div>

    <p style="font-size: 14px; color: #334155; line-height: 1.7; margin: 0 0 20px;">
      Kính chúc Anh/Chị bước sang tuổi mới luôn dồi dào sức khỏe, ngập tràn niềm vui, gia đình hạnh phúc viên mãn và dẫn dắt <strong>{{company_name}}</strong> ngày càng phát triển hùng mạnh, gặt hái thêm nhiều thắng lợi rực rỡ!
    </p>

    <div style="border-top: 1px dashed #e2e8f0; padding-top: 18px; margin-top: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
      <div>
        <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase;">Trân trọng chúc mừng,</p>
        <p style="margin: 4px 0 0; font-size: 14px; font-weight: 800; color: #002B66;">CHỦ TỊCH CLB DOANH NHÂN CEO 1983</p>
        <p style="margin: 2px 0 0; font-size: 12px; color: #d97706; font-weight: 600;">Cùng Toàn Thể Ban Điều Hành Hiệp Hội</p>
      </div>
    </div>
  </div>
</div>
`,
  },
  {
    id: "tmpl-marketing-b2b",
    code: "MARKETING_B2B_CAMPAIGN",
    category: "marketing",
    name: "Chiến Dịch Email Marketing & Xúc Tiến B2B",
    description: "Quản lý và phát động chiến dịch email marketing định kỳ, giới thiệu giải pháp sản phẩm và kết nối đối tác giao thương nội bộ.",
    channels: ["email", "in_app", "push"],
    subject: "[CEO 1983 B2B] Cơ hội hợp tác & Bản tin kết nối giao thương tháng {{campaign_month}}",
    inAppTitle: "Bản tin kết nối giao thương B2B tháng {{campaign_month}}",
    inAppBody: "Kính gửi Anh/Chị {{full_name}}, khám phá danh mục chào hàng và nhu cầu mua sắm ưu tiên từ các doanh nghiệp hội viên CEO 1983.",
    variables: [
      { key: "full_name", label: "Tên hội viên", example: "Vũ Minh Tuấn" },
      { key: "company_name", label: "Doanh nghiệp", example: "Công ty Cổ phần Alpha Tech" },
      { key: "campaign_month", label: "Kỳ bản tin", example: "11/2026" },
      { key: "featured_deals", label: "Deal nổi bật", example: "Cung ứng thiết bị văn phòng thông minh 2026 (850 Tr đ)" },
      { key: "portal_url", label: "Cổng giao thương", example: "https://ceo1983.vn/marketplace" },
    ],
    updatedAt: "2026-10-01",
    htmlBody: `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #003B95 0%, #001B40 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(245, 158, 11, 0.25); border: 1px solid rgba(245, 158, 11, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #fde047; margin-bottom: 12px; text-transform: uppercase;">
      BẢN TIN XÚC TIẾN GIAO THƯƠNG B2B
    </div>
    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff;">KẾT NỐI CƠ HỘI KINH DOANH THÁNG {{campaign_month}}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">Cộng đồng Doanh nhân CEO 1983 - Hiệp Hội HanoiBA</p>
  </div>
  <div style="padding: 28px 24px; color: #1e293b;">
    <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6;">
      Kính gửi: <strong>Anh/Chị {{full_name}}</strong> - <strong>{{company_name}}</strong>,
    </p>
    <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #334155;">
      Ban Xúc tiến thương mại trân trọng gửi tới Quý Doanh nghiệp các cơ hội hợp tác và nhu cầu mua bán ưu tiên tháng {{campaign_month}}:
    </p>
    <div style="background: #f8fafc; border-left: 4px solid #003B95; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h4 style="margin: 0 0 8px; font-size: 14px; color: #003B95; text-transform: uppercase;">Cơ Hội Hợp Tác Nổi Bật</h4>
      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #0f172a;">{{featured_deals}}</p>
    </div>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{{portal_url}}" style="display: inline-block; background: #003B95; color: #ffffff; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 4px 12px rgba(0, 59, 149, 0.3);">
        Xem Toàn Bộ Sàn Cơ Hội B2B
      </a>
    </div>
    <p style="font-size: 13px; color: #64748b; line-height: 1.6; margin: 0 0 20px;">
      Quý Doanh nghiệp có nhu cầu đăng bài chào mua/chào bán xin vui lòng liên hệ Ban Xúc Tiến Thương Mại.
    </p>
    <p style="font-size: 13px; font-weight: 700; color: #0f172a; margin: 0;">TM. BAN XÚC TIẾN THƯƠNG MẠI CLB CEO 1983</p>
  </div>
</div>
`,
  },
];

export type ActivityType = "sự kiện" | "cuộc họp" | "cuộc gặp" | "chương trình";

export interface VisualBlockContent {
  activityType?: ActivityType;
  greeting?: string;
  activityTitle?: string;

  // 9 trường quy chuẩn bắt buộc cho hoạt động
  speaker?: string;
  summary?: string;
  date?: string;
  location?: string;
  fee?: string;
  googleMaps?: string;
  dressCode?: string;
  parking?: string;
  notes?: string;

  // Xác nhận tham dự (Link công khai)
  confirmLink?: string;

  // Hotline BTC
  hotline?: string;

  // Chữ ký / Lời kết
  signature?: string;

  // Mẫu nộp hội phí (fee)
  feeTitle?: string;
  feeAmount?: string;
  dueDate?: string;
  bankName?: string;
  bankAccount?: string;
  bankOwner?: string;
  transferContent?: string;

  // Mẫu cảm ơn đăng ký (welcome)
  welcomeTitle?: string;
  welcomeIntro?: string;
  fullName?: string;
  memberCode?: string;
  companyName?: string;
  department?: string;

  // Tương thích ngược các khối tự do cũ
  headerBadge?: string;
  headerTitle?: string;
  headerSubtitle?: string;
  introMessage?: string;
  showHighlightBox?: boolean;
  highlightBoxTitle?: string;
  highlightRows?: { label: string; value: string }[];
  showQrCode?: boolean;
  qrCodeUrl?: string;
  qrCodeNote?: string;
  outroMessage?: string;
}

export function buildInAppBodyFromVisualContent(c: VisualBlockContent, category?: MailCategory): string {
  if (category === "fee") {
    return `${c.greeting || "Kính gửi Anh/Chị {{full_name}}"}
- ${c.feeTitle || "Ban Thường Trực CLB Doanh Nhân CEO 1983 trân trọng thông báo quyết toán niên liễm năm {{fee_year}}."}
- Mức hội phí: ${c.feeAmount || "{{fee_amount}} VNĐ"}
- Hạn nộp: ${c.dueDate || "{{due_date}}"}
- Tên tài khoản: ${c.bankOwner || "CLB DOANH NHAN CEO 1983"}
- Số tài khoản: ${c.bankAccount || "19832026888"}
- Ngân hàng: ${c.bankName || "MB Bank"}
- Cú pháp chuyển khoản: ${c.transferContent || "CEO1983 {{member_code}} HOIPHI"}
- Hotline Kế toán: ${c.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}
- ${c.signature || "Trân trọng!"}`;
  }

  if (category === "welcome") {
    return `${c.greeting || "Kính gửi Anh/Chị {{full_name}}"}
- ${c.welcomeIntro || "Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!"}
- Họ và tên: ${c.fullName || "{{full_name}}"}
- Tên doanh nghiệp: ${c.companyName || "{{company_name}}"}
- Mã hội viên: ${c.memberCode || "{{member_code}}"}
- Ban sinh hoạt: ${c.department || "{{department}}"}
- Hotline BTC khi cần hỗ trợ: ${c.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}
- ${c.signature || "Trân trọng!"}`;
  }

  const act = c.activityType || "sự kiện";
  const title = c.activityTitle || "{{event_title}}";
  return `${c.greeting || "Kính gửi Anh/Chị {{full_name}}"}
- BTC trân trọng kính mời Anh/Chị tham dự ${act}: ${title}
- Tên ${act}: ${title}
- Thông tin ${act} gồm các trường:
  + Diễn giả: ${c.speaker || "{{speaker_name}}"}
  + Nội dung chính: ${c.summary || "{{event_summary}}"}
  + Thời gian: ${c.date || "{{event_date}}"}
  + Địa điểm: ${c.location || "{{event_location}}"}
  + Chi phí: ${c.fee || "{{event_fee}}"}
  + Google Maps: ${c.googleMaps || "{{google_maps_url}}"}
  + Trang phục: ${c.dressCode || "{{dress_code}}"}
  + Gửi xe: ${c.parking || "{{parking_info}}"}
  + Lưu ý quan trọng từ BTC: ${c.notes || "{{event_notes}}"}
- Xác nhận tham dự: ${c.confirmLink || "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}"}
- Hotline BTC khi cần hỗ trợ: ${c.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}
- ${c.signature || "Trân trọng!"}`;
}

export function buildHtmlFromVisualContent(c: VisualBlockContent, category?: MailCategory): string {
  if (category === "fee") {
    return `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #002B66 0%, #001B40 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(212, 160, 23, 0.25); border: 1px solid rgba(212, 160, 23, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #f6d365; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
      THÔNG BÁO TÀI CHÍNH CLB
    </div>
    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff;">${c.feeTitle || "THÔNG BÁO NỘP HỘI PHÍ NIÊN LIỄM NĂM {{fee_year}}"}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #cbd5e1;">CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>${c.greeting || "Kính gửi Anh/Chị {{full_name}}"}</strong></p>
    <p style="margin: 0 0 14px; color: #334155;">- Ban Thường Trực CLB Doanh Nhân CEO 1983 trân trọng thông báo quyết toán hội phí niên liễm năm {{fee_year}}:</p>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f59e0b; border-radius: 10px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #001D4A; text-transform: uppercase; font-size: 12.5px;">- Thông tin nộp phí & Tài khoản CLB:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 170px;">+ Mức hội phí:</td><td style="padding: 4px 0; font-weight: 700; color: #b45309; font-size: 15px;">${c.feeAmount || "{{fee_amount}} VNĐ"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Hạn nộp:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${c.dueDate || "{{due_date}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Tên tài khoản:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${c.bankOwner || "CLB DOANH NHAN CEO 1983"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Số tài khoản CLB:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 800; color: #0284c7; font-size: 15px;">${c.bankAccount || "19832026888"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Ngân hàng:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${c.bankName || "MB Bank"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Cú pháp chuyển khoản:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #d97706;">${c.transferContent || "CEO1983 {{member_code}} HOIPHI"}</td></tr>
      </table>
    </div>
    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">${c.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- ${c.signature || "Trân trọng!"}</p>
    </div>
  </div>
</div>`;
  }

  if (category === "welcome") {
    return `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #094074 0%, #001B40 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(52, 211, 153, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #6ee7b7; margin-bottom: 12px; text-transform: uppercase;">
      THƯ CẢM ƠN & CHÀO MỪNG CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 800; color: #ffffff;">${c.welcomeTitle || "CHÀO MỪNG TÂN HỘI VIÊN CEO 1983"}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">Cùng gắn kết - Cùng chia sẻ - Cùng phát triển vững mạnh</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>${c.greeting || "Kính gửi Anh/Chị {{full_name}}"}</strong></p>
    <p style="margin: 0 0 14px; color: #334155;">- ${c.welcomeIntro || "Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!"}</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #166534; text-transform: uppercase; font-size: 12.5px;">- Thông tin hội viên:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #4b5563; width: 170px;">+ Họ và tên:</td><td style="padding: 4px 0; font-weight: 700; color: #111827;">${c.fullName || "{{full_name}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">+ Tên doanh nghiệp:</td><td style="padding: 4px 0; font-weight: 600; color: #111827;">${c.companyName || "{{company_name}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">+ Mã hội viên:</td><td style="padding: 4px 0; font-family: monospace; font-weight: 700; color: #15803d; font-size: 14px;">${c.memberCode || "{{member_code}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #4b5563;">+ Ban sinh hoạt:</td><td style="padding: 4px 0; font-weight: 600; color: #1d4ed8;">${c.department || "{{department}}"}</td></tr>
      </table>
    </div>
    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">${c.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- ${c.signature || "Trân trọng!"}</p>
    </div>
  </div>
</div>`;
  }

  const act = c.activityType || "sự kiện";
  const title = c.activityTitle || "{{event_title}}";
  return `<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
  <div style="background: linear-gradient(135deg, #001D4A 0%, #003B95 50%, #0A2540 100%); padding: 30px 24px; text-align: center; color: #ffffff;">
    <div style="display: inline-block; padding: 4px 14px; background: rgba(234, 179, 8, 0.25); border: 1px solid rgba(234, 179, 8, 0.5); border-radius: 9999px; font-size: 11px; font-weight: 800; color: #fde047; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
      THƯ MỜI THAM DỰ ${act.toUpperCase()} CHÍNH THỨC
    </div>
    <h1 style="margin: 0; font-size: 21px; font-weight: 900; color: #ffffff; text-transform: uppercase;">${title}</h1>
    <p style="margin: 8px 0 0; font-size: 13px; color: #93c5fd;">Ban Tổ Chức CLB Doanh Nhân CEO 1983 (HanoiBA)</p>
  </div>
  <div style="padding: 26px 24px; color: #1e293b; line-height: 1.6; font-size: 14px;">
    <p style="margin: 0 0 10px; font-size: 15px;"><strong>${c.greeting || "Kính gửi Anh/Chị {{full_name}}"}</strong></p>
    <p style="margin: 0 0 8px; color: #334155;">- BTC trân trọng kính mời Anh/Chị tham dự ${act}: <strong style="color: #003B95;">${title}</strong></p>
    <p style="margin: 0 0 10px; font-weight: bold; color: #0f172a;">- Tên ${act}: ${title}</p>
    
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold; color: #001D4A; text-transform: uppercase; font-size: 12.5px;">- Thông tin ${act} gồm các trường:</p>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b; width: 170px;">+ Diễn giả:</td><td style="padding: 4px 0; font-weight: 700; color: #0f172a;">${c.speaker || "{{speaker_name}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Nội dung chính:</td><td style="padding: 4px 0; color: #334155;">${c.summary || "{{event_summary}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Thời gian:</td><td style="padding: 4px 0; font-weight: 700; color: #003B95;">${c.date || "{{event_date}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Địa điểm:</td><td style="padding: 4px 0; font-weight: 600; color: #0f172a;">${c.location || "{{event_location}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Chi phí:</td><td style="padding: 4px 0; font-weight: 700; color: #16a34a;">${c.fee || "{{event_fee}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Google Maps:</td><td style="padding: 4px 0;"><a href="${c.googleMaps || "{{google_maps_url}}"}" target="_blank" style="color: #0284c7; font-weight: bold; text-decoration: underline;">Xem bản đồ chỉ đường &rarr;</a></td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Trang phục:</td><td style="padding: 4px 0; color: #475569;">${c.dressCode || "{{dress_code}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Gửi xe:</td><td style="padding: 4px 0; color: #475569;">${c.parking || "{{parking_info}}"}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">+ Lưu ý quan trọng từ BTC:</td><td style="padding: 4px 0; color: #b45309; font-weight: 600;">${c.notes || "{{event_notes}}"}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p style="margin: 0 0 8px; font-weight: bold;">- Xác nhận tham dự:</p>
      <a href="${c.confirmLink || "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}"}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #003B95 0%, #002266 100%); color: #ffffff; font-weight: bold; font-size: 13.5px; text-decoration: none; padding: 12px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0, 59, 149, 0.3);">
        BẤM ĐỂ XÁC NHẬN THAM DỰ
      </a>
    </div>

    <div style="background: #f1f5f9; border-radius: 12px; padding: 14px 18px; margin-top: 20px; font-size: 12.5px; color: #334155;">
      <p style="margin: 0 0 4px;"><strong>- Hotline BTC khi cần hỗ trợ:</strong> <span style="font-weight: bold; color: #001D4A;">${c.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}</span></p>
      <p style="margin: 8px 0 0; font-style: italic; color: #64748b;">- ${c.signature || "Trân trọng!"}</p>
    </div>
  </div>
</div>`;
}

function extractVisualContentFromTemplate(t: MailTemplateItem): VisualBlockContent {
  if (t.visualContent) {
    return JSON.parse(JSON.stringify(t.visualContent));
  }
  const isFee = t.category === "fee";
  const isWelcome = t.category === "welcome";

  if (isFee) {
    return {
      greeting: "Kính gửi Anh/Chị {{full_name}}",
      feeTitle: t.name || "THÔNG BÁO NỘP HỘI PHÍ NIÊN LIỄM NĂM {{fee_year}}",
      feeAmount: "{{fee_amount}} VNĐ",
      dueDate: "{{due_date}}",
      bankName: "MB Bank (Ngân Hàng Quân Đội) - CN Ba Đình",
      bankAccount: "19832026888",
      bankOwner: "CLB DOANH NHAN CEO 1983",
      transferContent: "CEO1983 {{member_code}} {{full_name}}",
      hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
      signature: "Trân trọng! TM. BAN TÀI CHÍNH & KẾ TOÁN CLB DOANH NHÂN CEO 1983",
      headerBadge: "THÔNG BÁO TÀI CHÍNH",
      headerTitle: t.name,
      headerSubtitle: "CLB Doanh Nhân CEO 1983",
      introMessage: "Ban Thường Trực CLB Doanh Nhân CEO 1983 trân trọng thông báo quyết toán hội phí niên liễm năm {{fee_year}}:",
      showHighlightBox: true,
      highlightBoxTitle: "THÔNG TIN NỘP HỘI PHÍ",
      highlightRows: [
        { label: "Mức hội phí", value: "{{fee_amount}} VNĐ" },
        { label: "Hạn nộp", value: "{{due_date}}" },
        { label: "Số tài khoản CLB", value: "19832026888" },
        { label: "Ngân hàng", value: "MB Bank" },
        { label: "Chủ tài khoản", value: "CLB DOANH NHAN CEO 1983" },
        { label: "Nội dung CK", value: "CEO1983 {{member_code}} HOIPHI" },
      ],
      showQrCode: false,
      qrCodeUrl: "",
      qrCodeNote: "",
      outroMessage: "0973.205.683 / 0903.205.683 / 0903.203.204",
    };
  }

  if (isWelcome) {
    return {
      greeting: "Kính gửi Anh/Chị {{full_name}}",
      welcomeTitle: "THƯ CẢM ƠN GIA NHẬP CLB DOANH NHÂN CEO 1983",
      welcomeIntro: "Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!",
      fullName: "{{full_name}}",
      memberCode: "{{member_code}}",
      companyName: "{{company_name}}",
      department: "{{department}}",
      hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
      signature: "Trân trọng! TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983",
      headerBadge: "CHÀO MỪNG HỘI VIÊN MỚI",
      headerTitle: t.name,
      headerSubtitle: "CLB Doanh Nhân CEO 1983",
      introMessage: "Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!",
      showHighlightBox: true,
      highlightBoxTitle: "THÔNG TIN HỘI VIÊN CHÍNH THỨC",
      highlightRows: [
        { label: "Họ và tên", value: "{{full_name}}" },
        { label: "Doanh nghiệp", value: "{{company_name}}" },
        { label: "Mã hội viên", value: "{{member_code}}" },
        { label: "Ban sinh hoạt", value: "{{department}}" },
      ],
      showQrCode: false,
      qrCodeUrl: "",
      qrCodeNote: "",
      outroMessage: "0973.205.683 / 0903.205.683 / 0903.203.204",
    };
  }

  let act: ActivityType = "sự kiện";
  const lower = (t.code + " " + t.name).toLowerCase();
  if (lower.includes("meeting") || lower.includes("họp")) act = "cuộc họp";
  else if (lower.includes("gathering") || lower.includes("gặp")) act = "cuộc gặp";
  else if (lower.includes("training") || lower.includes("đào tạo")) act = "chương trình";

  return {
    activityType: act,
    greeting: "Kính gửi Anh/Chị {{full_name}}",
    activityTitle: t.variables?.find((v) => v.key.includes("title"))?.example || "{{event_title}}",
    speaker: "{{speaker_name}}",
    summary: "{{event_summary}}",
    date: "{{event_date}}",
    location: "{{event_location}}",
    fee: "{{event_fee}}",
    googleMaps: "{{google_maps_url}}",
    dressCode: "{{dress_code}}",
    parking: "{{parking_info}}",
    notes: "{{event_notes}}",
    confirmLink: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}",
    hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
    signature: "Trân trọng!",
    headerBadge: `THƯ MỜI ${act.toUpperCase()}`,
    headerTitle: t.name,
    headerSubtitle: "CLB Doanh Nhân CEO 1983",
    introMessage: `BTC trân trọng kính mời Anh/Chị tham dự ${act}:`,
    showHighlightBox: true,
    highlightBoxTitle: `THÔNG TIN ${act.toUpperCase()}`,
    highlightRows: [
      { label: "Diễn giả", value: "{{speaker_name}}" },
      { label: "Nội dung chính", value: "{{event_summary}}" },
      { label: "Thời gian", value: "{{event_date}}" },
      { label: "Địa điểm", value: "{{event_location}}" },
      { label: "Chi phí", value: "{{event_fee}}" },
      { label: "Google Maps", value: "{{google_maps_url}}" },
      { label: "Trang phục", value: "{{dress_code}}" },
      { label: "Gửi xe", value: "{{parking_info}}" },
      { label: "Lưu ý từ BTC", value: "{{event_notes}}" },
    ],
    showQrCode: false,
    qrCodeUrl: "",
    qrCodeNote: "",
    outroMessage: "0973.205.683 / 0903.205.683 / 0903.203.204",
  };
}

const LOCAL_STORAGE_KEY = "ceo1983_mail_templates_v7";

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
  const [testPhone, setTestPhone] = useState<string>("0973924819");
  const [sendChannel, setSendChannel] = useState<"both" | "email" | "zalo">("both");
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [phoneError, setPhoneError] = useState("");
  const testPhoneRef = useRef<HTMLInputElement>(null);
  const zbs = useZbsTemplateConfigs();

  // CRM Advanced Targeting State (Ban hội viên, Zalo OA subscribers, Excel import)
  const [membersList, setMembersList] = useState<any[]>([]);
  const [zaloSubscribers, setZaloSubscribers] = useState<any[]>([]);
  const [trainingPrograms, setTrainingPrograms] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [deptSelectMode, setDeptSelectMode] = useState<"all" | "single" | "multiple">("all");
  const [selectedDeptMemberIds, setSelectedDeptMemberIds] = useState<string[]>([]);
  const [zaloSelectMode, setZaloSelectMode] = useState<"all" | "single" | "multiple">("all");
  const [selectedZaloIds, setSelectedZaloIds] = useState<string[]>([]);
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [zaloSearchTerm, setZaloSearchTerm] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showZaloDropdown, setShowZaloDropdown] = useState(false);

  // Bank Info for fee templates
  const [clubBankName, setClubBankName] = useState("MB Bank (Ngân hàng Quân Đội)");
  const [clubBankAccount, setClubBankAccount] = useState("198388889999");
  const [clubBankOwner, setClubBankOwner] = useState("CLB DOANH NHAN CEO 1983");

  // Dynamic quick-add state for phone and email
  const [showQuickAddEmail, setShowQuickAddEmail] = useState(false);
  const [quickEmailInput, setQuickEmailInput] = useState("");
  const [showQuickAddPhone, setShowQuickAddPhone] = useState(false);
  const [quickPhoneInput, setQuickPhoneInput] = useState("");

  const excelFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchNestApi<any[]>("/members")
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) setMembersList(list);
      })
      .catch(() => {});

    fetchNestApi<any>("/zalo/subscribers")
      .then((res: any) => {
        const rawList = res?.data || res?.subscribers || (Array.isArray(res) ? res : []);
        if (Array.isArray(rawList) && rawList.length > 0) {
          const list = rawList.map((s: any, idx: number) => ({
            ...s,
            id: String(s.id || s.userId || s.zalo_user_id || `zalo-${idx + 1}`),
            zalo_user_id: String(s.zalo_user_id || s.userId || s.id || `zalo-${idx + 1}`),
            name: s.displayName || s.name || s.fullName || (s.phone ? `Hội viên (${s.phone})` : `Khách Zalo ${idx + 1}`),
            displayName: s.displayName || s.name || s.fullName || (s.phone ? `Hội viên (${s.phone})` : `Khách Zalo ${idx + 1}`),
            phone: s.phone || "",
            company: s.company || s.companyName || "",
          }));
          setZaloSubscribers(list);
        } else {
          setZaloSubscribers([
            { id: "zalo-sub-01", name: "Nguyễn Văn Hải", displayName: "Nguyễn Văn Hải", phone: "0912345678", zalo_user_id: "zalo_01", company: "Hải Nam Logistics" },
            { id: "zalo-sub-02", name: "Trần Thị Mai Lan", displayName: "Trần Thị Mai Lan", phone: "0988776655", zalo_user_id: "zalo_02", company: "Mai Lan Decor" },
            { id: "zalo-sub-03", name: "Lê Hoàng Quân", displayName: "Lê Hoàng Quân", phone: "0903205683", zalo_user_id: "zalo_03", company: "Quân Anh Corp" },
            { id: "zalo-sub-04", name: "Phạm Thu Hà", displayName: "Phạm Thu Hà", phone: "0973205683", zalo_user_id: "zalo_04", company: "Hà Thành Real Estate" },
            { id: "zalo-sub-05", name: "Đặng Tiến Dũng", displayName: "Đặng Tiến Dũng", phone: "0915667788", zalo_user_id: "zalo_05", company: "Dũng Minh Tech" },
          ]);
        }
      })
      .catch(() => {
        setZaloSubscribers([
          { id: "zalo-sub-01", name: "Nguyễn Văn Hải", displayName: "Nguyễn Văn Hải", phone: "0912345678", zalo_user_id: "zalo_01", company: "Hải Nam Logistics" },
          { id: "zalo-sub-02", name: "Trần Thị Mai Lan", displayName: "Trần Thị Mai Lan", phone: "0988776655", zalo_user_id: "zalo_02", company: "Mai Lan Decor" },
          { id: "zalo-sub-03", name: "Lê Hoàng Quân", displayName: "Lê Hoàng Quân", phone: "0903205683", zalo_user_id: "zalo_03", company: "Quân Anh Corp" },
        ]);
      });

    fetchNestApi<any>("/events?type=training")
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data;
        if (Array.isArray(list) && list.length > 0) {
          setTrainingPrograms(list);
        } else {
          setTrainingPrograms([
            { id: "train-01", title: "Khóa Đào Tạo: Quản Trị Tài Chính Doanh Nghiệp & Tối Ưu Dòng Tiền 2026", speaker: "TS. Lê Thẩm Dương", duration: "1 Ngày (Thứ Bảy)", place: "Hội trường CEO 1983, Keangnam Landmark 72, Hà Nội", date: "2026-11-20" },
            { id: "train-02", title: "Chương Trình Đào Tạo: Ứng Dụng AI & Tự Động Hóa Vận Hành Trong Doanh Nghiệp SME", speaker: "Chuyên Gia AI VICONNECT", duration: "2 Buổi", place: "Trụ sở HanoiBA & Hybrid Online", date: "2026-11-25" },
            { id: "train-03", title: "Workshop: Chiến Lược Đàm Phán & Ký Kết Hợp Đồng Giao Thương B2B", speaker: "Ban Thường Trực CEO 1983", duration: "Nửa ngày", place: "Habblet Hotel Hanoi", date: "2026-12-05" },
          ]);
        }
      })
      .catch(() => {
        setTrainingPrograms([
          { id: "train-01", title: "Khóa Đào Tạo: Quản Trị Tài Chính Doanh Nghiệp & Tối Ưu Dòng Tiền 2026", speaker: "TS. Lê Thẩm Dương", duration: "1 Ngày", place: "Keangnam Landmark 72, Hà Nội", date: "2026-11-20" },
          { id: "train-02", title: "Chương Trình Đào Tạo: Ứng Dụng AI Trong Vận Hành Doanh Nghiệp", speaker: "Chuyên Gia AI VICONNECT", duration: "2 Buổi", place: "Trụ sở HanoiBA", date: "2026-11-25" },
        ]);
      });
  }, []);

  const departmentList = useMemo(() => {
    return [
      "Ban Hội Viên",
      "Ban Truyền Thông",
      "Ban Xúc Tiến Thương Mại",
      "Ban Tài Chính",
      "Ban Đào Tạo",
      "Ban Sự Kiện",
      "Ban Điều Hành",
      "Ban Thư Ký",
    ];
  }, []);

  // Members in selected department (or all)
  const deptMembers = useMemo(() => {
    if (!selectedDepartment) return membersList;
    return membersList.filter((m) =>
      (m.department || "").toLowerCase().includes(selectedDepartment.toLowerCase())
    );
  }, [membersList, selectedDepartment]);

  const handleSelectDepartment = (dept: string) => {
    setSelectedDepartment(dept);
    setSelectedDeptMemberIds([]);
    if (!dept) return;

    if (deptSelectMode === "all") {
      const filtered = membersList.filter((m) =>
        (m.department || "").toLowerCase().includes(dept.toLowerCase())
      );
      const newPhones = filtered.map((m) => m.phone).filter(Boolean);
      const newEmails = filtered.map((m) => m.email).filter(Boolean);

      if (newPhones.length > 0) {
        setTestPhone((prev) => {
          const existing = prev ? prev.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean) : [];
          return Array.from(new Set([...existing, ...newPhones])).join(", ");
        });
      }
      if (newEmails.length > 0) {
        setTestEmail((prev) => {
          const existing = prev ? prev.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean) : [];
          return Array.from(new Set([...existing, ...newEmails])).join(", ");
        });
      }
      toast.success(`Đã chọn TẤT CẢ ${filtered.length} hội viên từ ${dept}!`);
    } else {
      setShowMemberDropdown(true);
    }
  };

  const handleApplyDeptMemberSelection = (mode: "all" | "single" | "multiple", memberIds: string[]) => {
    setDeptSelectMode(mode);
    setSelectedDeptMemberIds(memberIds);

    let targetList: any[] = [];
    if (mode === "all") {
      targetList = deptMembers;
    } else {
      targetList = deptMembers.filter((m) => memberIds.includes(String(m.id || m.code)));
    }

    const newPhones = targetList.map((m) => m.phone).filter(Boolean);
    const newEmails = targetList.map((m) => m.email).filter(Boolean);

    if (newPhones.length > 0) {
      setTestPhone((prev) => {
        const existing = prev ? prev.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean) : [];
        return Array.from(new Set([...existing, ...newPhones])).join(", ");
      });
    }
    if (newEmails.length > 0) {
      setTestEmail((prev) => {
        const existing = prev ? prev.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean) : [];
        return Array.from(new Set([...existing, ...newEmails])).join(", ");
      });
    }
    toast.success(`Đã thêm ${targetList.length} hội viên được chọn!`);
  };

  const handleApplyZaloSelection = (mode: "all" | "single" | "multiple", zaloIds: string[]) => {
    setZaloSelectMode(mode);
    setSelectedZaloIds(zaloIds);

    let targetList: any[] = [];
    if (mode === "all") {
      targetList = zaloSubscribers;
    } else {
      targetList = zaloSubscribers.filter((s) => zaloIds.includes(String(s.id || s.zalo_user_id)));
    }

    const newPhones = targetList.map((s) => s.phone || s.zalo_user_id).filter(Boolean);
    if (newPhones.length > 0) {
      setTestPhone((prev) => {
        const existing = prev ? prev.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean) : [];
        return Array.from(new Set([...existing, ...newPhones])).join(", ");
      });
      toast.success(`Đã thêm ${targetList.length} người tương tác Zalo OA!`);
    }
  };

  const handleAddQuickEmail = () => {
    const val = quickEmailInput.trim();
    if (!val || !val.includes("@")) {
      toast.error("Vui lòng nhập email hợp lệ!");
      return;
    }
    setTestEmail((prev) => {
      const existing = prev ? prev.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean) : [];
      if (!existing.includes(val)) existing.push(val);
      return existing.join(", ");
    });
    setQuickEmailInput("");
    setShowQuickAddEmail(false);
    toast.success(`Đã thêm email: ${val}`);
  };

  const handleAddQuickPhone = () => {
    const val = quickPhoneInput.trim().replace(/[^0-9+]/g, "");
    if (!val || val.length < 8) {
      toast.error("Vui lòng nhập số điện thoại hợp lệ!");
      return;
    }
    setTestPhone((prev) => {
      const existing = prev ? prev.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean) : [];
      if (!existing.includes(val)) existing.push(val);
      return existing.join(", ");
    });
    setQuickPhoneInput("");
    setShowQuickAddPhone(false);
    toast.success(`Đã thêm SĐT Zalo: ${val}`);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: "" });

        const importedPhones: string[] = [];
        const importedEmails: string[] = [];

        rows.forEach((row: any) => {
          const phoneKey = Object.keys(row).find((k) =>
            /sđt|sdt|phone|điện thoại|so_dien_thoai|mobile/i.test(k)
          );
          const emailKey = Object.keys(row).find((k) =>
            /email|mail|thư điện tử/i.test(k)
          );
          if (phoneKey && row[phoneKey]) {
            const cleanP = String(row[phoneKey]).trim().replace(/[^0-9+]/g, "");
            if (cleanP) importedPhones.push(cleanP);
          }
          if (emailKey && row[emailKey]) {
            const cleanE = String(row[emailKey]).trim();
            if (cleanE && cleanE.includes("@")) importedEmails.push(cleanE);
          }
        });

        if (importedPhones.length > 0) {
          setTestPhone((prev) => {
            const existing = prev ? prev.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean) : [];
            return Array.from(new Set([...existing, ...importedPhones])).join(", ");
          });
        }
        if (importedEmails.length > 0) {
          setTestEmail((prev) => {
            const existing = prev ? prev.split(/[,;\n]+/).map((e) => e.trim()).filter(Boolean) : [];
            return Array.from(new Set([...existing, ...importedEmails])).join(", ");
          });
        }

        toast.success(`Đã nạp ${rows.length} dòng từ file: ${importedPhones.length} SĐT, ${importedEmails.length} Email!`);
      };
      reader.readAsArrayBuffer(file);
    } catch (err: any) {
      toast.error("Lỗi khi đọc file Excel: " + (err?.message || "File không đúng định dạng"));
    }
  };

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

  const [customSampleValues, setCustomSampleValues] = useState<Record<string, string>>({});
  const birthdayBannerInputRef = useRef<HTMLInputElement>(null);

  // Sample variable values for live preview
  const sampleValues = useMemo(() => {
    const map: Record<string, string> = {};
    if (activeTemplate && activeTemplate.variables) {
      activeTemplate.variables.forEach((v) => {
        map[v.key] = customSampleValues[v.key] || v.example;
      });
    }
    return { ...map, ...customSampleValues };
  }, [activeTemplate, customSampleValues]);

  // Rendered subject & html body
  const renderedContent = useMemo(() => {
    if (!activeTemplate) return { subject: "", inAppTitle: "", inAppBody: "", html: "" };
    let sub = activeTemplate.subject || "";
    let appTitle = activeTemplate.inAppTitle || "";
    let appBody = activeTemplate.inAppBody || "";
    let html = activeTemplate.htmlBody || "";

    // Replace standard {{key}}, {key}, [key], and [label]
    if (activeTemplate.variables) {
      activeTemplate.variables.forEach((v) => {
        const val = sampleValues[v.key] || v.example || "";
        const patterns = [
          new RegExp(`{{\\s*${v.key}\\s*}}`, "gi"),
          new RegExp(`{\\s*${v.key}\\s*}`, "gi"),
          new RegExp(`\\[\\s*${v.key}\\s*\\]`, "gi"),
          new RegExp(`\\[\\s*${v.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\]`, "gi"),
        ];
        patterns.forEach((pattern) => {
          sub = sub.replace(pattern, val);
          appTitle = appTitle.replace(pattern, val);
          appBody = appBody.replace(pattern, val);
          html = html.replace(pattern, val);
        });
      });
    }

    // Common synonyms like [Họ và tên hội viên], [Mã hội viên], [Tên doanh nghiệp]
    const commonLabels: Record<string, string> = {
      "Họ và tên hội viên": sampleValues["full_name"] || "Trần Anh Đức",
      "Họ tên": sampleValues["full_name"] || "Trần Anh Đức",
      "Mã hội viên": sampleValues["member_code"] || "M1983-025",
      "Tên doanh nghiệp": sampleValues["company_name"] || "Công ty Cổ phần Giải pháp Năng lượng Xanh",
      "Mức phí": sampleValues["fee_amount"] || "10.000.000",
      "Hạn nộp": sampleValues["due_date"] || "31/12/2026",
      "Chủ tài khoản": sampleValues["bank_owner"] || "CLB CEO 1983",
      "Số tài khoản": sampleValues["bank_account"] || "1983888888",
      "Ngân hàng": sampleValues["bank_name"] || "MB Bank",
      "Nội dung chuyển khoản": sampleValues["transfer_content"] || "CEO1983 M001 HOIPHI",
      "Thời gian sự kiện": sampleValues["event_date"] || "18:00 25/12/2026",
      "Địa điểm sự kiện": sampleValues["event_location"] || "Khách sạn Melia Hà Nội",
      "Hạng vé": sampleValues["ticket_type"] || "VIP",
      "Vị trí bàn/ghế": sampleValues["seat_assignment"] || "Bàn VIP 01",
      "Ban chuyên môn": sampleValues["department"] || "Ban Xúc tiến thương mại",
      "Chức danh": sampleValues["executive_role"] || "Hội viên chính thức",
      "Ngày gia nhập": sampleValues["joined_date"] || "19/08/2024",
    };
    Object.entries(commonLabels).forEach(([lbl, val]) => {
      const reg = new RegExp(`\\[\\s*${lbl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\]`, "gi");
      sub = sub.replace(reg, val);
      appTitle = appTitle.replace(reg, val);
      appBody = appBody.replace(reg, val);
      html = html.replace(reg, val);
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
    newTmpl.visualContent = initialVisual;
    setVisualContent(initialVisual);
    setEditingTemplate(newTmpl);
    setModalEditorMode("visual");
    setIsEditModalOpen(true);
  };

  const handleApplyPresetInModal = (presetKey: string) => {
    if (!editingTemplate) return;
    if (presetKey === "EVENT_INVITATION") {
      const visual: VisualBlockContent = {
        activityType: "sự kiện",
        greeting: "Kính gửi Anh/Chị {{full_name}}",
        activityTitle: "{{event_title}}",
        speaker: "{{speaker_name}}",
        summary: "{{event_summary}}",
        date: "{{event_date}}",
        location: "{{event_location}}",
        fee: "{{event_fee}}",
        googleMaps: "{{google_maps_url}}",
        dressCode: "{{dress_code}}",
        parking: "{{parking_info}}",
        notes: "{{event_notes}}",
        confirmLink: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}",
        hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
        signature: "Trân trọng!",
      };
      const tmpl: MailTemplateItem = {
        ...editingTemplate,
        code: "EVENT_INVITATION",
        name: "Thư Mời Tham Dự Sự Kiện (Chuẩn Tinh Gọn Đa Kênh)",
        category: "event",
        description: "Mẫu thư mời sự kiện tinh gọn theo định dạng chuẩn CLB CEO 1983.",
        subject: "[THƯ MỜI SỰ KIỆN] {{event_title}} - Kính gửi Anh/Chị {{full_name}}",
        inAppTitle: "Thư mời tham dự sự kiện: {{event_title}}",
        inAppBody: buildInAppBodyFromVisualContent(visual, "event"),
        htmlBody: buildHtmlFromVisualContent(visual, "event"),
        variables: [
          { key: "full_name", label: "Tên đại biểu (Kính gửi Anh/Chị)", example: "Dương Thị Huệ" },
          { key: "event_title", label: "Tên sự kiện", example: "Diễn Đàn Chuyển Đổi Số Doanh Nghiệp 2026 & Gala Kết Nối" },
          { key: "speaker_name", label: "Diễn giả", example: "Chủ tịch HĐQT VICONNECT GROUP, Chuyên gia Kinh tế trưởng" },
          { key: "event_summary", label: "Nội dung chính", example: "Chiến lược tăng trưởng doanh nghiệp 2026, Xúc tiến thương mại đa kênh, Ký kết hợp tác B2B" },
          { key: "event_date", label: "Thời gian", example: "18:30 - 21:30 Thứ Bảy, 10/09/2026" },
          { key: "event_location", label: "Địa điểm", example: "Habblet Hotel & Cung Điện Atlantis, Hà Nội" },
          { key: "event_fee", label: "Chi phí", example: "Miễn phí dành cho Hội viên chính thức CEO 1983" },
          { key: "google_maps_url", label: "Google Maps", example: "https://maps.google.com/?q=Habblet+Hotel+Hanoi" },
          { key: "dress_code", label: "Trang phục", example: "Vest / Dạ tiệc lịch sự" },
          { key: "parking_info", label: "Gửi xe", example: "Tầng hầm B1-B2 khách sạn, miễn phí vé xe" },
          { key: "event_notes", label: "Lưu ý quan trọng từ BTC", example: "Quý Anh/Chị vui lòng có mặt trước 15 phút để được đón tiếp chu đáo" },
          { key: "confirm_link", label: "Xác nhận tham dự", example: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}" },
        ],
        visualContent: visual,
      };
      setEditingTemplate(tmpl);
      setVisualContent(visual);
      toast.success("Đã áp dụng mẫu Thư mời sự kiện tinh gọn!");
      return;
    } else if (presetKey === "MEETING_INVITATION") {
      const visual: VisualBlockContent = {
        activityType: "cuộc họp",
        greeting: "Kính gửi Anh/Chị {{full_name}}",
        activityTitle: "{{meeting_title}}",
        speaker: "{{speaker_name}}",
        summary: "{{event_summary}}",
        date: "{{event_date}}",
        location: "{{event_location}}",
        fee: "{{event_fee}}",
        googleMaps: "{{google_maps_url}}",
        dressCode: "{{dress_code}}",
        parking: "{{parking_info}}",
        notes: "{{event_notes}}",
        confirmLink: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}",
        hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
        signature: "Trân trọng!",
      };
      const tmpl: MailTemplateItem = {
        ...editingTemplate,
        code: "MEETING_INVITATION",
        name: "Thư Mời Cuộc Họp Ban & CLB (Chuẩn Tinh Gọn)",
        category: "meeting",
        description: "Mẫu thư mời họp ban chuyên môn định kỳ / đột xuất cho CLB Doanh Nhân CEO 1983.",
        subject: "[THƯ MỜI HỌP] {{meeting_title}} - Kính gửi Anh/Chị {{full_name}}",
        inAppTitle: "Thư mời họp: {{meeting_title}}",
        inAppBody: buildInAppBodyFromVisualContent(visual, "meeting"),
        htmlBody: buildHtmlFromVisualContent(visual, "meeting"),
        variables: [
          { key: "full_name", label: "Tên hội viên", example: "Lê Hoàng Quân" },
          { key: "meeting_title", label: "Tên cuộc họp", example: "Họp Ban Xúc Tiến Thương Mại B2B Tháng 11" },
          { key: "speaker_name", label: "Chủ trì cuộc họp", example: "Trưởng Ban & Phó Chủ Tịch CLB" },
          { key: "event_summary", label: "Nội dung chính", example: "Tổng kết giao thương quý 3 và định hướng triển khai quý 4/2026" },
          { key: "event_date", label: "Thời gian", example: "09:00 Thứ Bảy, 22/11/2026" },
          { key: "event_location", label: "Địa điểm", example: "Văn phòng Hiệp hội HanoiBA, Keangnam Landmark 72" },
          { key: "event_fee", label: "Chi phí", example: "Kinh phí CLB đài thọ" },
          { key: "google_maps_url", label: "Google Maps", example: "https://maps.app.goo.gl/hanoiba" },
          { key: "dress_code", label: "Trang phục", example: "Lịch sự / Đồng phục CLB" },
          { key: "parking_info", label: "Gửi xe", example: "Hầm Keangnam B2" },
          { key: "event_notes", label: "Lưu ý quan trọng từ BTC", example: "Quý Anh/Chị vui lòng nghiên cứu trước tài liệu đính kèm" },
          { key: "confirm_link", label: "Xác nhận tham dự", example: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}" },
        ],
        visualContent: visual,
      };
      setEditingTemplate(tmpl);
      setVisualContent(visual);
      toast.success("Đã áp dụng mẫu Thư mời cuộc họp ban!");
      return;
    } else if (presetKey === "ANNUAL_FEE_NOTICE") {
      const visual: VisualBlockContent = {
        greeting: "Kính gửi Anh/Chị {{full_name}}",
        feeTitle: "THÔNG BÁO NỘP HỘI PHÍ NIÊN LIỄM NĂM {{fee_year}}",
        feeAmount: "{{fee_amount}} VNĐ",
        dueDate: "{{due_date}}",
        bankOwner: "CLB DOANH NHAN CEO 1983",
        bankAccount: "19832026888",
        bankName: "MB Bank - CN Ba Đình",
        transferContent: "CEO1983 {{member_code}} HOIPHI2026",
        hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
        signature: "Trân trọng! TM. BAN TÀI CHÍNH & KẾ TOÁN CLB DOANH NHÂN CEO 1983",
      };
      const tmpl: MailTemplateItem = {
        ...editingTemplate,
        code: "FEE_NOTICE_ANNUAL",
        name: "Thông Báo Nộp Hội Phí Niên Liễm Định Kỳ",
        category: "fee",
        description: "Mẫu thông báo hội phí niên liễm với đầy đủ số tài khoản và thông tin chuyển khoản CLB.",
        subject: "[CEO 1983] Thông báo nộp hội phí thường niên năm {{fee_year}} - {{full_name}}",
        inAppTitle: "Thông báo nộp hội phí năm {{fee_year}}",
        inAppBody: buildInAppBodyFromVisualContent(visual, "fee"),
        htmlBody: buildHtmlFromVisualContent(visual, "fee"),
        variables: [
          { key: "full_name", label: "Tên hội viên", example: "Phạm Hồng Nguyên" },
          { key: "member_code", label: "Mã hội viên", example: "M1983-008" },
          { key: "fee_year", label: "Năm tài chính", example: "2026" },
          { key: "fee_amount", label: "Mức hội phí", example: "5.000.000" },
          { key: "due_date", label: "Hạn thanh toán", example: "31/12/2026" },
          { key: "bank_account", label: "Số tài khoản CLB", example: "19832026888" },
          { key: "bank_name", label: "Ngân hàng", example: "MB Bank - CN Ba Đình" },
          { key: "bank_owner", label: "Chủ tài khoản", example: "CLB DOANH NHAN CEO 1983" },
          { key: "transfer_content", label: "Nội dung chuyển khoản", example: "CEO1983 {{member_code}} HOIPHI2026" },
        ],
        visualContent: visual,
      };
      setEditingTemplate(tmpl);
      setVisualContent(visual);
      toast.success("Đã áp dụng mẫu Thông báo hội phí niên liễm!");
      return;
    } else if (presetKey === "MEMBER_WELCOME_THANKS") {
      const visual: VisualBlockContent = {
        greeting: "Kính gửi Anh/Chị {{full_name}}",
        welcomeTitle: "THƯ CẢM ƠN GIA NHẬP CLB DOANH NHÂN CEO 1983",
        welcomeIntro: "Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!",
        fullName: "{{full_name}}",
        companyName: "{{company_name}}",
        memberCode: "{{member_code}}",
        department: "{{department}}",
        hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
        signature: "Trân trọng! TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983",
      };
      const tmpl: MailTemplateItem = {
        ...editingTemplate,
        code: "NEW_MEMBER_THANKS",
        name: "Thư Cảm Ơn & Chào Mừng Hội Viên Mới Gia Nhập",
        category: "welcome",
        description: "Gửi thư cảm ơn trang trọng tới Quý Doanh nhân khi hoàn tất đăng ký gia nhập CLB Doanh Nhân CEO 1983.",
        subject: "[CEO 1983] Thư cảm ơn Quý Doanh nhân {{full_name}} gia nhập CLB Doanh Nhân CEO 1983",
        inAppTitle: "Chào mừng Anh/Chị {{full_name}} gia nhập CEO 1983!",
        inAppBody: buildInAppBodyFromVisualContent(visual, "welcome"),
        htmlBody: buildHtmlFromVisualContent(visual, "welcome"),
        variables: [
          { key: "full_name", label: "Tên hội viên", example: "Nguyễn Văn Hải" },
          { key: "company_name", label: "Tên doanh nghiệp", example: "Tập Đoàn Hải Nam Global" },
          { key: "member_code", label: "Mã hội viên", example: "M1983-168" },
          { key: "department", label: "Ban sinh hoạt", example: "Ban Xúc tiến Thương mại" },
        ],
        visualContent: visual,
      };
      setEditingTemplate(tmpl);
      setVisualContent(visual);
      toast.success("Đã áp dụng mẫu Thư cảm ơn đăng ký hội viên mới!");
      return;
    } else if (presetKey === "TRAINING_INVITATION") {
      const visual: VisualBlockContent = {
        activityType: "chương trình",
        greeting: "Kính gửi Anh/Chị {{full_name}}",
        activityTitle: "{{training_title}}",
        speaker: "{{speaker_name}}",
        summary: "{{event_summary}}",
        date: "{{event_date}}",
        location: "{{event_location}}",
        fee: "{{event_fee}}",
        googleMaps: "{{google_maps_url}}",
        dressCode: "{{dress_code}}",
        parking: "{{parking_info}}",
        notes: "{{event_notes}}",
        confirmLink: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}",
        hotline: "0973.205.683 / 0903.205.683 / 0903.203.204",
        signature: "Trân trọng!",
      };
      const tmpl: MailTemplateItem = {
        ...editingTemplate,
        code: "TRAINING_INVITATION",
        name: "Thư Mời Chương Trình Đào Tạo Doanh Nhân (Chuẩn Tinh Gọn)",
        category: "event",
        description: "Mẫu thư mời tham dự chương trình đào tạo, workshop nâng cao năng lực doanh nghiệp CEO 1983.",
        subject: "[CHƯƠNG TRÌNH ĐÀO TẠO] {{training_title}} - Kính gửi Anh/Chị {{full_name}}",
        inAppTitle: "Thư mời đào tạo: {{training_title}}",
        inAppBody: buildInAppBodyFromVisualContent(visual, "event"),
        htmlBody: buildHtmlFromVisualContent(visual, "event"),
        variables: [
          { key: "full_name", label: "Tên hội viên", example: "Lê Minh Tuấn" },
          { key: "training_title", label: "Tên khóa đào tạo", example: "Quản Trị Dòng Tiền & Tối Ưu Chi Phí 2026" },
          { key: "speaker_name", label: "Diễn giả", example: "TS. Lê Thẩm Dương" },
          { key: "event_summary", label: "Nội dung chính", example: "Chiến lược tối ưu hóa dòng tiền và kiểm soát đòn bẩy" },
          { key: "event_date", label: "Thời gian", example: "08:30 Thứ Bảy, 20/11/2026" },
          { key: "event_location", label: "Địa điểm", example: "Hội trường CEO 1983, Keangnam Landmark 72, Hà Nội" },
          { key: "event_fee", label: "Chi phí", example: "Miễn phí dành cho Hội viên chính thức CEO 1983" },
          { key: "google_maps_url", label: "Google Maps", example: "https://maps.google.com/?q=Hanoi+Training+Center" },
          { key: "dress_code", label: "Trang phục", example: "Lịch sự / Business Casual" },
          { key: "parking_info", label: "Gửi xe", example: "Bãi đỗ xe khuôn viên trung tâm" },
          { key: "event_notes", label: "Lưu ý quan trọng từ BTC", example: "Học viên vui lòng mang theo sổ tay, laptop để thực hành" },
          { key: "confirm_link", label: "Xác nhận tham dự", example: "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}" },
        ],
        visualContent: visual,
      };
      setEditingTemplate(tmpl);
      setVisualContent(visual);
      toast.success("Đã áp dụng mẫu Thư mời chương trình đào tạo!");
      return;
    }
  };

  const handleSelectTrainingProgramInModal = (progId: string) => {
    const prog = trainingPrograms.find((p) => p.id === progId);
    if (!prog || !editingTemplate) return;

    setEditingTemplate((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      next.name = `Thư Mời Đào Tạo: ${prog.title}`;
      next.subject = `[ĐÀO TẠO CEO 1983] ${prog.title} - Kính gửi Anh/Chị {{full_name}}`;
      next.inAppTitle = `Thư mời đào tạo: ${prog.title}`;
      next.inAppBody = `- Kính gửi Anh/Chị: {{full_name}}\n- BTC trân trọng kính mời Anh/Chị tham dự khóa đào tạo: ${prog.title}\n- Diễn giả: ${prog.speaker}\n- Thời gian: ${prog.date} (${prog.duration || "1 Ngày"})\n- Địa điểm: ${prog.place}\n- Chi phí: Miễn phí dành cho Hội viên chính thức CEO 1983\n- Hotline BTC khi cần hỗ trợ: 0973.205.683 / 0903.205.683 / 0903.203.204\n- Trân trọng!`;

      const nextVisual: VisualBlockContent = {
        ...(prev.visualContent || visualContent),
        headerBadge: "CHƯƠNG TRÌNH ĐÀO TẠO CHUYÊN ĐỀ",
        headerTitle: prog.title.toUpperCase(),
        headerSubtitle: `Diễn giả: ${prog.speaker} · ${prog.place}`,
        greeting: "Kính gửi Anh/Chị {{full_name}}",
        introMessage: `Ban Đào Tạo CLB Doanh Nhân CEO 1983 trân trọng kính mời Anh/Chị tham dự chương trình đào tạo "${prog.title}":`,
        showHighlightBox: true,
        highlightBoxTitle: "THÔNG TIN CHI TIẾT KHÓA HỌC",
        highlightRows: [
          { label: "Chương trình", value: prog.title },
          { label: "Diễn giả", value: prog.speaker || "Chuyên gia cao cấp" },
          { label: "Thời gian", value: `${prog.date || "Theo lịch"} (${prog.duration || "1 Ngày"})` },
          { label: "Địa điểm", value: prog.place || "Trụ sở CLB CEO 1983" },
          { label: "Chi phí", value: "Miễn phí dành cho Hội viên chính thức CEO 1983" },
          { label: "Xác nhận tham dự", value: "https://app.ceo1983.viconnect.vn/association/events" },
        ],
        outroMessage: "Quý Anh/Chị vui lòng xác nhận đăng ký sớm để BTC chuẩn bị tài liệu và phòng học chu đáo nhất.",
        signature: "TM. BAN ĐÀO TẠO CLB DOANH NHÂN CEO 1983",
      };
      next.visualContent = nextVisual;
      next.htmlBody = buildHtmlFromVisualContent(nextVisual);
      setVisualContent(nextVisual);
      return next;
    });
    toast.success(`Đã tự động nạp dữ liệu khóa đào tạo "${prog.title}" vào template!`);
  };

  // Open Edit Modal
  const handleOpenEdit = (t: MailTemplateItem) => {
    const cloned: MailTemplateItem = JSON.parse(JSON.stringify(t));
    const initialVisual = t.visualContent
      ? JSON.parse(JSON.stringify(t.visualContent))
      : extractVisualContentFromTemplate(cloned);
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
        visualContent: nextVisual,
        htmlBody: buildHtmlFromVisualContent(nextVisual, editingTemplate.category),
        inAppBody: buildInAppBodyFromVisualContent(nextVisual, editingTemplate.category),
      });
    }
  };

  const handleSelectActivityType = (newAct: ActivityType) => {
    const nextVisual: VisualBlockContent = {
      ...visualContent,
      activityType: newAct,
    };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        visualContent: nextVisual,
        htmlBody: buildHtmlFromVisualContent(nextVisual, editingTemplate.category),
        inAppBody: buildInAppBodyFromVisualContent(nextVisual, editingTemplate.category),
      });
    }
  };

  const handleAddHighlightRow = () => {
    const nextRows = [...(visualContent.highlightRows || []), { label: "Mục mới", value: "Giá trị" }];
    const nextVisual = { ...visualContent, highlightRows: nextRows };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        visualContent: nextVisual,
        htmlBody: buildHtmlFromVisualContent(nextVisual, editingTemplate.category),
        inAppBody: buildInAppBodyFromVisualContent(nextVisual, editingTemplate.category),
      });
    }
  };

  const handleUpdateHighlightRow = (idx: number, key: "label" | "value", val: string) => {
    const nextRows = (visualContent.highlightRows || []).map((r, i) =>
      i === idx ? { ...r, [key]: val } : r
    );
    const nextVisual = { ...visualContent, highlightRows: nextRows };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        visualContent: nextVisual,
        htmlBody: buildHtmlFromVisualContent(nextVisual, editingTemplate.category),
        inAppBody: buildInAppBodyFromVisualContent(nextVisual, editingTemplate.category),
      });
    }
  };

  const handleRemoveHighlightRow = (idx: number) => {
    const nextRows = (visualContent.highlightRows || []).filter((_, i) => i !== idx);
    const nextVisual = { ...visualContent, highlightRows: nextRows };
    setVisualContent(nextVisual);
    if (editingTemplate) {
      setEditingTemplate({
        ...editingTemplate,
        visualContent: nextVisual,
        htmlBody: buildHtmlFromVisualContent(nextVisual, editingTemplate.category),
        inAppBody: buildInAppBodyFromVisualContent(nextVisual, editingTemplate.category),
      });
    }
  };

  const handleInsertVariableIntoVisual = (variableKey: string, variableLabel?: string) => {
    const token = `[${variableLabel || variableKey}]`;
    const updatedIntro = visualContent.introMessage
      ? `${visualContent.introMessage} ${token}`
      : token;
    handleUpdateVisualField("introMessage", updatedIntro);
    toast.success(`Đã chèn trường thông tin "${token}" vào nội dung thư!`);
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
    const code = editingTemplate.code.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(code)) {
      toast.error("Mã mẫu chỉ gồm chữ, số, dấu gạch ngang hoặc gạch dưới, tối đa 100 ký tự.");
      return;
    }
    if (templates.some((template) => template.id !== editingTemplate.id && template.code === code)) {
      toast.error("Mã mẫu này đã được dùng. Mỗi trường hợp gửi cần một mã riêng để chọn đúng template ZBS.");
      return;
    }
    const compiledHtml = modalEditorMode === "visual"
      ? buildHtmlFromVisualContent(visualContent, editingTemplate.category)
      : editingTemplate.htmlBody;
    const compiledInApp = modalEditorMode === "visual"
      ? buildInAppBodyFromVisualContent(visualContent, editingTemplate.category)
      : editingTemplate.inAppBody;
    const templateToSave: MailTemplateItem = {
      ...editingTemplate,
      code,
      visualContent: JSON.parse(JSON.stringify(visualContent)),
      htmlBody: compiledHtml,
      inAppBody: compiledInApp,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    const exists = templates.some((t) => t.id === templateToSave.id);
    let next: MailTemplateItem[];
    if (exists) {
      next = templates.map((t) => (t.id === templateToSave.id ? templateToSave : t));
      toast.success(`Đã cập nhật template "${templateToSave.name}"`);
    } else {
      next = [templateToSave, ...templates];
      toast.success(`Đã tạo mới template "${templateToSave.name}"`);
    }
    saveTemplates(next);
    setSelectedTemplateId(templateToSave.id);
    setIsEditModalOpen(false);
  };

  const saveSelectedZbsConfig = (force = false) => zbs.save(
    activeTemplate.code,
    activeTemplate.variables.filter((variable) => variable.key !== "vietqr_url").map((variable) => variable.key),
    force,
  );

  const validateTestPhone = () => {
    if (testPhone.trim()) return true;
    setPhoneError("Nhập số điện thoại nhận tin ZBS thử.");
    testPhoneRef.current?.focus();
    return false;
  };

  const sendSelectedZbsTest = async () => {
    const templateData = Object.fromEntries(
      (activeTemplate.variables || [])
        .filter((variable) => variable.key !== "vietqr_url")
        .map((variable) => [variable.key, sampleValues[variable.key] ?? variable.example])
    );
    const result = await fetchNestApi<{ success: boolean; message?: string; guide?: string }>("/zalo/send-zns", {
      method: "POST",
      body: JSON.stringify({ templateCode: activeTemplate.code, phone: testPhone.trim(), templateData }),
    });
    if (!result?.success) throw new Error(result?.guide || result?.message || "Zalo chưa chấp nhận yêu cầu gửi ZBS");
  };

  const handleSaveZbsConfig = async () => {
    try {
      await saveSelectedZbsConfig(true);
      toast.success(`Đã lưu cấu hình ZBS cho mẫu ${activeTemplate.code}.`);
    } catch (error: any) {
      toast.error(error?.message || "Không lưu được cấu hình ZBS");
    }
  };

  const handleSaveAndSendZbsTest = async () => {
    if (!validateTestPhone()) return;
    setIsSendingTest(true);
    try {
      await saveSelectedZbsConfig();
      await sendSelectedZbsTest();
      toast.success(`Zalo đã tiếp nhận gửi thử mẫu ${activeTemplate.code} tới ${testPhone.trim()}.`);
    } catch (error: any) {
      toast.error(error?.message || "Không gửi được tin ZBS thử");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Gửi Thông Báo Hợp Nhất (Email / Zalo OA / Cả Hai) với Multi-Phone & Multi-Email
  const handleSendTestToAdmin = async () => {
    const targetEmails = testEmail
      .split(/[,;\n]+/)
      .map((e) => e.trim())
      .filter((e) => e.length > 0 && e.includes("@"));

    const targetPhones = testPhone
      .split(/[,;\n]+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if ((sendChannel === "email" || sendChannel === "both") && targetEmails.length === 0) {
      toast.error("Vui lòng nhập ít nhất một địa chỉ email người nhận hợp lệ!");
      return;
    }
    if ((sendChannel === "zalo" || sendChannel === "both") && targetPhones.length === 0) {
      toast.error("Vui lòng nhập ít nhất một số điện thoại Zalo người nhận!");
      return;
    }

    setIsSendingTest(true);
    const sentChannels: string[] = [];
    let emailError = "";
    let emailSuccessCount = 0;
    let zaloSuccessCount = 0;

    try {
      // Lưu đúng cấu hình mẫu đang chọn trước khi gửi bất kỳ kênh nào.
      if (sendChannel === "zalo" || sendChannel === "both") {
        try {
          await saveSelectedZbsConfig();
        } catch {}
      }
      // 1. Gửi qua Email nếu chọn Email hoặc Cả hai
      if (sendChannel === "email" || sendChannel === "both") {
        for (const email of targetEmails) {
          try {
            const result = await fetchNestApi<{ ok: boolean; message?: string }>("/mail/send-test", {
              method: "POST",
              body: JSON.stringify({
                to: email,
                subject: renderedContent.subject,
                html: renderedContent.html,
                templateCode: activeTemplate.code,
              }),
            });
            if (result?.ok) {
              emailSuccessCount++;
            }
          } catch (err: any) {
            emailError = err?.message || "Không gửi được email";
          }
        }
        if (emailSuccessCount > 0) {
          sentChannels.push(`Email (${emailSuccessCount}/${targetEmails.length})`);
        }
      }

      // 2. Gửi qua Zalo OA nếu chọn Zalo hoặc Cả hai
      if (sendChannel === "zalo" || sendChannel === "both") {
        const templateData = Object.fromEntries(
          (activeTemplate.variables || [])
            .filter((variable) => variable.key !== "vietqr_url")
            .map((variable) => [variable.key, sampleValues[variable.key] ?? variable.example])
        );
        for (const phone of targetPhones) {
          try {
            const result = await fetchNestApi<{ success: boolean; message?: string; guide?: string }>("/zalo/send-zns", {
              method: "POST",
              body: JSON.stringify({
                templateCode: activeTemplate.code,
                phone,
                templateData,
              }),
            });
            if (result?.success) {
              zaloSuccessCount++;
            }
          } catch {}
        }
        if (zaloSuccessCount > 0) {
          sentChannels.push(`ZBS (${zaloSuccessCount}/${targetPhones.length})`);
        }
      }

      if (emailSuccessCount === 0 && zaloSuccessCount === 0 && emailError) {
        throw new Error(emailError);
      }
      toast.success(
        `✓ Đã tiếp nhận gửi mẫu [${activeTemplate.name}] qua ${sentChannels.join(" & ")}!`
      );
    } catch (err: any) {
      const completed = sentChannels.length ? ` Đã gửi qua ${sentChannels.join(" & ")}.` : "";
      const detail = err?.message || "Không gửi được thông báo.";
      toast.error(`${detail}${emailError && emailError !== detail ? ` Email: ${emailError}.` : ""}${completed}`);
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
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition cursor-pointer"
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
              Phân Loại Luồng Email &amp; Thông Báo
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs font-medium">
              {[
                { id: "all", label: "Tất cả", icon: Layers },
                { id: "fee", label: "Hội phí & Niên liễm", icon: DollarSign },
                { id: "welcome", label: "Chào mừng & Cảm ơn", icon: UserCheck },
                { id: "birthday", label: "Chúc mừng Sinh nhật", icon: Gift },
                { id: "marketing", label: "Email Marketing & B2B", icon: Mail },
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
                        ? "bg-amber-500 text-white font-bold shadow-xs"
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
                      ? "border-[#003B95] bg-blue-50/80 dark:bg-blue-950/40 shadow-sm ring-2 ring-[#003B95]/30"
                      : "border-border/80 bg-card hover:border-border hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`font-mono text-[10px] font-bold ${
                        isSelected
                          ? "text-[#003B95] dark:text-blue-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {t.code}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {t.updatedAt}
                    </span>
                  </div>
                  <h4
                    className={`font-bold text-xs line-clamp-1 ${
                      isSelected
                        ? "text-[#003B95] dark:text-blue-200"
                        : "text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {t.name}
                  </h4>
                  <p
                    className={`text-[11px] line-clamp-2 mt-0.5 leading-snug ${
                      isSelected
                        ? "text-slate-700 dark:text-slate-300"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {t.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50 text-[10px]">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                        {t.variables.length} trường dữ liệu
                      </span>
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

            {/* ── BỘ TÙY BIẾN THIỆP SINH NHẬT & TẢI ẢNH (YÊU CẦU 2) ── */}
            {(activeTemplate.code === "BIRTHDAY_GREETING" || activeTemplate.category === "birthday") && (
              <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      Trình Tùy Biến Thiệp Mừng Sinh Nhật Hội Viên &amp; Tải Ảnh Lên
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Tải ảnh banner thiệp mừng tùy biến hoặc chọn các phong cách thiệp mừng hội viên được thiết kế riêng.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={birthdayBannerInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Ảnh tải lên tối đa 5MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUrl = reader.result as string;
                          setCustomSampleValues((prev) => ({ ...prev, banner_image_url: dataUrl }));
                          toast.success("✅ Đã tải ảnh banner thiệp mừng sinh nhật lên thành công!");
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => birthdayBannerInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Tải Ảnh Thiệp Mừng
                  </button>
                </div>

                {/* Mẫu phôi thiệp có sẵn và các trường tùy chỉnh */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground">Tên hội viên sinh nhật:</span>
                    <input
                      type="text"
                      value={sampleValues.full_name || ""}
                      onChange={(e) => setCustomSampleValues((prev) => ({ ...prev, full_name: e.target.value }))}
                      placeholder="VD: Lê Minh Tuấn"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground">Ngày sinh nhật (DD/MM):</span>
                    <input
                      type="text"
                      value={sampleValues.birth_date || ""}
                      onChange={(e) => setCustomSampleValues((prev) => ({ ...prev, birth_date: e.target.value }))}
                      placeholder="VD: 15/10"
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1 text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-muted-foreground">Chọn phôi ảnh thiệp mẫu:</span>
                    <div className="mt-1 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          setCustomSampleValues((prev) => ({
                            ...prev,
                            banner_image_url:
                              "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
                          }))
                        }
                        className="flex-1 py-1 px-1.5 rounded border border-amber-300 dark:border-amber-700 bg-amber-100/50 dark:bg-amber-950/40 text-[10px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                      >
                        Hoàng Gia
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomSampleValues((prev) => ({
                            ...prev,
                            banner_image_url:
                              "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&auto=format&fit=crop&q=80",
                          }))
                        }
                        className="flex-1 py-1 px-1.5 rounded border border-blue-300 dark:border-blue-700 bg-blue-100/50 dark:bg-blue-950/40 text-[10px] font-bold text-blue-800 dark:text-blue-300 hover:bg-blue-200"
                      >
                        Champagne
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setCustomSampleValues((prev) => ({
                            ...prev,
                            banner_image_url:
                              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80",
                          }))
                        }
                        className="flex-1 py-1 px-1.5 rounded border border-purple-300 dark:border-purple-700 bg-purple-100/50 dark:bg-purple-950/40 text-[10px] font-bold text-purple-800 dark:text-purple-300 hover:bg-purple-200"
                      >
                        Pháo Hoa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── BẢN TIN CHIẾN DỊCH EMAIL MARKETING B2B (YÊU CẦU 1) ── */}
            {(activeTemplate.category === "marketing" || activeCategory === "marketing") && (
              <div className="rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent p-3.5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-2.5">
                  <div>
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      Trung Tâm Chiến Dịch Email Marketing &amp; Xúc Tiến Giao Thương B2B
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Theo dõi hiệu quả chiến dịch gửi thư hàng loạt và thúc đẩy tỷ lệ mở email kết nối cơ hội kinh doanh.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success("Đang phát động chiến dịch Email Marketing gửi tới toàn thể Hội viên...")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Phát Động Chiến Dịch Hàng Loạt
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">TỔNG GỬI</p>
                    <p className="text-sm font-extrabold text-foreground mt-0.5">1,280 Email</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">TỶ LỆ MỞ</p>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">68.5%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">TỶ LỆ CLICK DEAL</p>
                    <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">42.1%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-border">
                    <p className="text-[10px] text-muted-foreground font-semibold">GIAO DỊCH KHỚP</p>
                    <p className="text-sm font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">86 Kết Nối</p>
                  </div>
                </div>
              </div>
            )}

            {/* Omnichannel Dispatcher: Email, Zalo OA hoặc Cả 2 */}
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Đẩy Thông Báo Thử Nghiệm Đa Kênh (Email &amp; Zalo OA)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Chọn kênh phát và gửi thử nghiệm dữ liệu mẫu trực tiếp tới hòm thư hoặc Zalo của bạn.
                  </p>
                </div>

                {/* Bộ chọn kênh gửi: Email, Zalo, hoặc Cả 2 */}
                <div className="inline-flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => setSendChannel("both")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      sendChannel === "both"
                        ? "bg-[#003B95] text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    🌟 Cả 2 Kênh
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendChannel("zalo")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      sendChannel === "zalo"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    💬 Zalo OA
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendChannel("email")}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                      sendChannel === "email"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                    }`}
                  >
                    📧 Email
                  </button>
                </div>
              </div>

              {/* CẤU HÌNH THÔNG TIN NỘP PHÍ CLB (ĐỂ TRỐNG QR - THEO QUY CHUẨN MỚI) */}
              {(activeTemplate.code === "FEE_PAYMENT_NOTICE" || activeTemplate.category === "fee") && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 dark:bg-amber-950/20 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <CreditCard className="size-3.5 text-amber-600 dark:text-amber-400" />
                      Thông Tin Tài Khoản Ngân Hàng CLB (Mẫu Nộp Phí - Để Trống Mã QR)
                    </span>
                    <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full">
                      QR: Không hiển thị (Để trống)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Ngân hàng CLB
                      </label>
                      <select
                        value={clubBankName}
                        onChange={(e) => {
                          setClubBankName(e.target.value);
                          setCustomSampleValues((prev) => ({ ...prev, club_bank_name: e.target.value }));
                        }}
                        className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 font-medium"
                      >
                        <option value="MB Bank (Ngân hàng Quân Đội)">MB Bank (Ngân hàng Quân Đội)</option>
                        <option value="Techcombank (Ngân hàng Kỹ Thương)">Techcombank (Ngân hàng Kỹ Thương)</option>
                        <option value="Vietcombank (Ngoại Thương Việt Nam)">Vietcombank (Ngoại Thương Việt Nam)</option>
                        <option value="VPBank (Việt Nam Thịnh Vượng)">VPBank (Việt Nam Thịnh Vượng)</option>
                        <option value="ACB (Ngân hàng Á Châu)">ACB (Ngân hàng Á Châu)</option>
                        <option value="BIDV (Đầu Tư & Phát Triển)">BIDV (Đầu Tư & Phát Triển)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Số tài khoản CLB
                      </label>
                      <input
                        type="text"
                        value={clubBankAccount}
                        onChange={(e) => {
                          setClubBankAccount(e.target.value);
                          setCustomSampleValues((prev) => ({ ...prev, club_bank_account: e.target.value }));
                        }}
                        placeholder="198388889999"
                        className="w-full text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                        Chủ tài khoản
                      </label>
                      <input
                        type="text"
                        value={clubBankOwner}
                        onChange={(e) => {
                          setClubBankOwner(e.target.value);
                          setCustomSampleValues((prev) => ({ ...prev, club_bank_owner: e.target.value }));
                        }}
                        placeholder="CLB DOANH NHAN CEO 1983"
                        className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-1.5 uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CRM Advanced Targeting Toolbar: Ban, Zalo OA Subscribers, Excel Import */}
              <div className="pt-2 border-t border-blue-200/50 dark:border-blue-900/40 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Call API Hội viên theo Ban kèm 3 chế độ (Chọn tất cả / Chọn 1 / Chọn nhiều) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Users className="size-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        Nạp Hội Viên Theo Ban ({membersList.length} HV)
                      </span>
                      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => {
                            setDeptSelectMode("all");
                            if (selectedDepartment) handleSelectDepartment(selectedDepartment);
                          }}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            deptSelectMode === "all" ? "bg-blue-600 text-white font-bold" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeptSelectMode("single");
                            setShowMemberDropdown(true);
                          }}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            deptSelectMode === "single" ? "bg-blue-600 text-white font-bold" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          1 người
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeptSelectMode("multiple");
                            setShowMemberDropdown(true);
                          }}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            deptSelectMode === "multiple" ? "bg-blue-600 text-white font-bold" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          Nhiều người
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <select
                        value={selectedDepartment}
                        onChange={(e) => handleSelectDepartment(e.target.value)}
                        className="flex-1 text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer"
                      >
                        <option value="">-- Chọn Ban Chuyên Môn --</option>
                        {departmentList.map((dept) => (
                          <option key={dept} value={dept}>
                            {dept} ({membersList.filter((m) => (m.department || "").toLowerCase().includes(dept.toLowerCase())).length} HV)
                          </option>
                        ))}
                      </select>

                      {(deptSelectMode === "single" || deptSelectMode === "multiple") && (
                        <button
                          type="button"
                          onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                          className="px-2 py-1.5 text-[10px] font-bold rounded-lg border border-blue-500/40 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shrink-0 cursor-pointer"
                        >
                          {showMemberDropdown ? "Đóng danh sách" : `Chọn HV (${selectedDeptMemberIds.length})`}
                        </button>
                      )}
                    </div>

                    {/* Dropdown tree / multi-select hội viên của Ban */}
                    {showMemberDropdown && (
                      <div className="mt-1 p-2 rounded-lg border border-blue-200 dark:border-blue-900 bg-slate-50 dark:bg-slate-950 max-h-48 overflow-y-auto space-y-1">
                        <input
                          type="text"
                          value={memberSearchTerm}
                          onChange={(e) => setMemberSearchTerm(e.target.value)}
                          placeholder="Tìm hội viên theo tên, SĐT, doanh nghiệp..."
                          className="w-full text-[10.5px] p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-1"
                        />
                        {deptMembers
                          .filter((m) =>
                            !memberSearchTerm ||
                            String(m.name || m.fullName || "").toLowerCase().includes(memberSearchTerm.toLowerCase()) ||
                            String(m.phone || "").includes(memberSearchTerm) ||
                            String(m.company || m.companyName || "").toLowerCase().includes(memberSearchTerm.toLowerCase())
                          )
                          .map((m) => {
                            const mId = String(m.id || m.code);
                            const isSelected = selectedDeptMemberIds.includes(mId);
                            return (
                              <div
                                key={mId}
                                onClick={() => {
                                  if (deptSelectMode === "single") {
                                    handleApplyDeptMemberSelection("single", [mId]);
                                    setShowMemberDropdown(false);
                                  } else {
                                    const next = isSelected
                                      ? selectedDeptMemberIds.filter((id) => id !== mId)
                                      : [...selectedDeptMemberIds, mId];
                                    handleApplyDeptMemberSelection("multiple", next);
                                  }
                                }}
                                className={`flex items-center justify-between p-1.5 rounded text-[11px] cursor-pointer transition ${
                                  isSelected ? "bg-blue-100 dark:bg-blue-900/60 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                <div className="truncate pr-1">
                                  <span className="text-slate-900 dark:text-white font-semibold">{m.name || m.fullName}</span>
                                  <span className="text-slate-500 text-[10px] ml-1">({m.phone || "Chưa có SĐT"})</span>
                                </div>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 shrink-0">
                                  {isSelected ? "✓ Đã chọn" : "+ Chọn"}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Call API Người nhắn tin Zalo OA kèm 3 chế độ (Chọn tất cả / Chọn 1 / Chọn nhiều) */}
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <MessageSquare className="size-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        Người Tương Tác Zalo OA ({zaloSubscribers.length})
                      </span>
                      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-semibold">
                        <button
                          type="button"
                          onClick={() => handleApplyZaloSelection("all", [])}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            zaloSelectMode === "all" ? "bg-cyan-600 text-white font-bold" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          Tất cả
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setZaloSelectMode("single");
                            setShowZaloDropdown(true);
                          }}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            zaloSelectMode === "single" ? "bg-cyan-600 text-white font-bold" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          1 người
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setZaloSelectMode("multiple");
                            setShowZaloDropdown(true);
                          }}
                          className={`px-1.5 py-0.5 rounded cursor-pointer ${
                            zaloSelectMode === "multiple" ? "bg-cyan-600 text-white font-bold" : "text-slate-600 dark:text-slate-400"
                          }`}
                        >
                          Nhiều người
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowZaloDropdown(!showZaloDropdown)}
                        className="w-full text-[11px] font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1.5 text-slate-800 dark:text-slate-200 cursor-pointer flex items-center justify-between"
                      >
                        <span>
                          {selectedZaloIds.length > 0
                            ? `Đã chọn ${selectedZaloIds.length} người tương tác Zalo`
                            : `-- Chọn người tương tác Zalo OA (${zaloSubscribers.length}) --`}
                        </span>
                        <ChevronDown className="size-3 text-slate-500" />
                      </button>

                      {/* Import Excel */}
                      <div>
                        <input
                          type="file"
                          ref={excelFileInputRef}
                          accept=".xlsx,.xls,.csv"
                          className="hidden"
                          onChange={handleImportExcel}
                        />
                        <button
                          type="button"
                          onClick={() => excelFileInputRef.current?.click()}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10.5px] font-bold shadow-xs transition cursor-pointer shrink-0"
                          title="Nhập file Excel chứa danh sách SĐT / Email"
                        >
                          <FileSpreadsheet className="size-3.5" />
                          Excel
                        </button>
                      </div>
                    </div>

                    {/* Dropdown multi-select Zalo subscribers */}
                    {showZaloDropdown && (
                      <div className="mt-1 p-2 rounded-lg border border-cyan-200 dark:border-cyan-900 bg-slate-50 dark:bg-slate-950 max-h-48 overflow-y-auto space-y-1">
                        <input
                          type="text"
                          value={zaloSearchTerm}
                          onChange={(e) => setZaloSearchTerm(e.target.value)}
                          placeholder="Tìm người tương tác Zalo..."
                          className="w-full text-[10.5px] p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 mb-1"
                        />
                        {zaloSubscribers
                          .filter((s) =>
                            !zaloSearchTerm ||
                            String(s.name || "").toLowerCase().includes(zaloSearchTerm.toLowerCase()) ||
                            String(s.phone || "").includes(zaloSearchTerm) ||
                            String(s.company || "").toLowerCase().includes(zaloSearchTerm.toLowerCase())
                          )
                          .map((sub) => {
                            const subId = String(sub.id || sub.zalo_user_id);
                            const isSelected = selectedZaloIds.includes(subId);
                            return (
                              <div
                                key={subId}
                                onClick={() => {
                                  if (zaloSelectMode === "single") {
                                    handleApplyZaloSelection("single", [subId]);
                                    setShowZaloDropdown(false);
                                  } else {
                                    const next = isSelected
                                      ? selectedZaloIds.filter((id) => id !== subId)
                                      : [...selectedZaloIds, subId];
                                    handleApplyZaloSelection("multiple", next);
                                  }
                                }}
                                className={`flex items-center justify-between p-1.5 rounded text-[11px] cursor-pointer transition ${
                                  isSelected ? "bg-cyan-100 dark:bg-cyan-900/60 font-bold" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                <div className="truncate pr-1">
                                  <span className="text-slate-900 dark:text-white font-semibold">
                                    {sub.displayName || sub.name || (sub.phone ? `Khách (${sub.phone})` : "Khách quan tâm Zalo")}
                                  </span>
                                  {(sub.phone || sub.company) && (
                                    <span className="text-slate-500 text-[10px] ml-1">
                                      ({sub.phone || sub.company})
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 shrink-0">
                                  {isSelected ? "✓ Đã chọn" : "+ Chọn"}
                                </span>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* DÒNG NHẬP EMAIL & SĐT CÓ DẤU CỘNG (+) ĐỂ THÊM NGƯỜI NGOÀI HỆ THỐNG */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {(sendChannel === "email" || sendChannel === "both") && (
                    <div className="flex-1 min-w-[200px] flex items-center gap-1">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="Email nhận (phân cách bằng dấu phẩy)..."
                          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddEmail(!showQuickAddEmail)}
                        className="size-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center font-bold text-base cursor-pointer shrink-0 transition"
                        title="Thêm nhanh địa chỉ Email mới"
                      >
                        +
                      </button>
                    </div>
                  )}

                  {(sendChannel === "zalo" || sendChannel === "both") && (
                    <div className="flex-1 min-w-[180px] flex items-center gap-1">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          ref={testPhoneRef}
                          value={testPhone}
                          onChange={(e) => {
                            setTestPhone(e.target.value);
                            setPhoneError("");
                          }}
                          placeholder="SĐT Zalo ZBS (phân cách bằng dấu phẩy)..."
                          className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-mono outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowQuickAddPhone(!showQuickAddPhone)}
                        className="size-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold text-base cursor-pointer shrink-0 transition"
                        title="Thêm nhanh số điện thoại Zalo mới cho người ngoài hệ thống"
                      >
                        +
                      </button>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSendTestToAdmin}
                    disabled={isSendingTest || Boolean(zbs.savingCode)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#003B95] hover:bg-blue-900 text-white text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send className={`w-3.5 h-3.5 ${isSendingTest ? "animate-spin" : ""}`} />
                    {isSendingTest ? "Đang gửi..." : "Bắn Thông Báo Ngay"}
                  </button>
                </div>

                {/* Popover thêm nhanh Email */}
                {showQuickAddEmail && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                    <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 shrink-0">Thêm email:</span>
                    <input
                      type="email"
                      value={quickEmailInput}
                      onChange={(e) => setQuickEmailInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddQuickEmail()}
                      placeholder="vd: doanhtri@gmail.com"
                      className="flex-1 text-xs px-2 py-1 rounded border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddQuickEmail}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded cursor-pointer"
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddEmail(false)}
                      className="px-2 py-1 text-xs text-slate-500 cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                )}

                {/* Popover thêm nhanh SĐT Zalo */}
                {showQuickAddPhone && (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                    <span className="text-[11px] font-bold text-blue-900 dark:text-blue-200 shrink-0">Thêm SĐT Zalo (ZBS):</span>
                    <input
                      type="text"
                      value={quickPhoneInput}
                      onChange={(e) => setQuickPhoneInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddQuickPhone()}
                      placeholder="vd: 0912345678"
                      className="flex-1 text-xs px-2 py-1 rounded border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddQuickPhone}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded cursor-pointer"
                    >
                      Thêm
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddPhone(false)}
                      className="px-2 py-1 text-xs text-slate-500 cursor-pointer"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
              <ZbsTemplateConfigForm
                templateCode={activeTemplate.code}
                draft={zbs.draftFor(activeTemplate.code)}
                variables={activeTemplate.variables}
                sampleValues={sampleValues}
                dirty={zbs.isDirty(activeTemplate.code)}
                configured={Boolean(zbs.configs[activeTemplate.code]?.templateId)}
                busy={isSendingTest || Boolean(zbs.savingCode)}
                loading={zbs.loading}
                loadError={zbs.loadError}
                saveError={zbs.saveErrors[activeTemplate.code]}
                errors={zbs.errors[activeTemplate.code]}
                phone={testPhone}
                onChange={(update) => zbs.updateDraft(activeTemplate.code, update)}
                onSave={handleSaveZbsConfig}
                onSendTest={handleSaveAndSendZbsTest}
                onRetry={zbs.reload}
              />
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
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-border/80">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Danh sách biến chèn dữ liệu tự động (Click để sao chép):
                </span>
                <span className="text-[10px] text-muted-foreground">Nhấp vào biến để sao chép mã chèn</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTemplate.variables.map((v) => (
                  <button
                    key={v.key}
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`{{${v.key}}}`);
                      toast.success(`Đã sao chép: {{${v.key}}}`);
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:border-[#003B95] hover:text-[#003B95] text-xs font-medium border border-border/80 shadow-xs transition cursor-pointer group"
                    title={`Sao chép {{${v.key}}} (Ví dụ: ${v.example})`}
                  >
                    <span className="text-slate-800 dark:text-slate-200 group-hover:text-[#003B95] dark:group-hover:text-blue-300 font-semibold">{v.label}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-[#003B95]">
                      {v.key}
                    </span>
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
                  {/* VULN-13 Fix: Sử dụng Sandboxed Iframe triệt tiêu 100% rủi ro XSS khi hiển thị HTML email */}
                  <iframe
                    title="Email Template Live Preview"
                    srcDoc={renderedContent.html}
                    sandbox=""
                    className="w-full min-h-[420px] border-0 rounded-lg bg-white text-slate-900"
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
              {/* BỘ CHỌN MẪU ĐỊNH SẴN (DYNAMIC PRESETS) & GẮN KHÓA ĐÀO TẠO (API /events?type=training) */}
              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-blue-900 dark:text-blue-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Mẫu Định Sẵn Theo Nghiệp Vụ (Dynamic Presets):
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Chọn nhanh để tự động điền cấu trúc chuẩn đa kênh
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Mẫu nghiệp vụ định sẵn:
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleApplyPresetInModal(e.target.value);
                      }}
                      defaultValue=""
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
                    >
                      <option value="" disabled>-- Chọn mẫu nghiệp vụ có sẵn --</option>
                      <option value="EVENT_INVITATION">Thư mời tham dự sự kiện (Format chuẩn tinh gọn)</option>
                      <option value="MEETING_INVITATION">Thư mời cuộc họp ban chuyên môn</option>
                      <option value="TRAINING_INVITATION">Thư mời chương trình đào tạo chuyên đề</option>
                      <option value="ANNUAL_FEE_NOTICE">Thông báo hội phí niên liễm (Để trống QR, thêm STK CLB)</option>
                      <option value="MEMBER_WELCOME_THANKS">Thư cảm ơn đăng ký hội viên mới</option>
                      <option value="MEMBER_ACCOUNT_CREDENTIALS">Template gửi tài khoản đăng nhập cho hội viên mới</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Gắn khóa đào tạo từ hệ thống (API):
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleSelectTrainingProgramInModal(e.target.value);
                      }}
                      defaultValue=""
                      className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 font-medium"
                    >
                      <option value="" disabled>-- Chọn khóa đào tạo ({trainingPrograms.length}) --</option>
                      {trainingPrograms.map((prog) => (
                        <option key={prog.id} value={prog.id}>
                          {prog.title} ({prog.speaker || "Chuyên gia"})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

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
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 mb-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 mb-2">
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>Chọn thông tin muốn chèn tự động vào thư (Hệ thống sẽ tự điền dữ liệu của từng hội viên):</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editingTemplate.variables.map((v) => (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => handleInsertVariableIntoVisual(v.key, v.label)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-amber-500/10 hover:border-amber-500 text-xs font-semibold border border-border shadow-xs transition cursor-pointer active:scale-95"
                        title={`Bấm để chèn thông tin: ${v.label} (Ví dụ: ${v.example})`}
                      >
                        <span className="text-amber-500 font-bold">+</span>
                        <span className="text-foreground">[{v.label}]</span>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">VD: {v.example}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* VISUAL BLOCK MODE */}
                {modalEditorMode === "visual" ? (
                  editingTemplate.category === "fee" ? (
                    /* DÀNH CHO MẪU HỘI PHÍ (FEE) - TỰ CHỈNH SỬA TẤT CẢ CÁC TRƯỜNG */
                    <div className="space-y-3.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 sm:p-4 rounded-2xl border border-border">
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300">
                        <strong>Mẫu Thông Báo Nộp Hội Phí:</strong> Mẫu riêng biệt cho kế toán/tài chính, người dùng có thể tự do chỉnh sửa từng trường thông tin tài khoản và mức phí bên dưới.
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 1: Lời chào (Kính gửi Anh/Chị)</span>
                        <input
                          type="text"
                          value={visualContent.greeting || "Kính gửi Anh/Chị {{full_name}}"}
                          onChange={(e) => handleUpdateVisualField("greeting", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold"
                        />
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 2: Tiêu đề / Lời thông báo nộp phí</span>
                        <input
                          type="text"
                          value={visualContent.feeTitle || "THÔNG BÁO NỘP HỘI PHÍ NIÊN LIỄM NĂM {{fee_year}}"}
                          onChange={(e) => handleUpdateVisualField("feeTitle", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-amber-600 dark:text-amber-400"
                        />
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-2.5">
                        <span className="font-bold text-foreground text-xs block">Khối 3: Thông tin nộp phí &amp; Tài khoản CLB</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Mức hội phí</label>
                            <input
                              type="text"
                              value={visualContent.feeAmount || "{{fee_amount}} VNĐ"}
                              onChange={(e) => handleUpdateVisualField("feeAmount", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-amber-600"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Hạn nộp</label>
                            <input
                              type="text"
                              value={visualContent.dueDate || "{{due_date}}"}
                              onChange={(e) => handleUpdateVisualField("dueDate", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Tên tài khoản</label>
                            <input
                              type="text"
                              value={visualContent.bankOwner || "CLB DOANH NHAN CEO 1983"}
                              onChange={(e) => handleUpdateVisualField("bankOwner", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Số tài khoản CLB</label>
                            <input
                              type="text"
                              value={visualContent.bankAccount || "19832026888"}
                              onChange={(e) => handleUpdateVisualField("bankAccount", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono font-bold text-blue-600"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Ngân hàng CLB</label>
                            <input
                              type="text"
                              value={visualContent.bankName || "MB Bank"}
                              onChange={(e) => handleUpdateVisualField("bankName", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Cú pháp chuyển khoản</label>
                            <input
                              type="text"
                              value={visualContent.transferContent || "CEO1983 {{member_code}} HOIPHI"}
                              onChange={(e) => handleUpdateVisualField("transferContent", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 4: Hotline Kế toán khi cần hỗ trợ</span>
                        <input
                          type="text"
                          value={visualContent.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}
                          onChange={(e) => handleUpdateVisualField("hotline", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold text-rose-600"
                        />
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 5: Lời kết (Trân trọng!)</span>
                        <input
                          type="text"
                          value={visualContent.signature || "Trân trọng! TM. BAN TÀI CHÍNH & KẾ TOÁN CLB DOANH NHÂN CEO 1983"}
                          onChange={(e) => handleUpdateVisualField("signature", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-[#003B95]"
                        />
                      </div>
                    </div>
                  ) : editingTemplate.category === "welcome" ? (
                    /* DÀNH CHO MẪU THƯ CẢM ƠN GIA NHẬP (WELCOME) - TỰ CHỈNH SỬA TẤT CẢ CÁC TRƯỜNG */
                    <div className="space-y-3.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 sm:p-4 rounded-2xl border border-border">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-xs text-emerald-800 dark:text-emerald-300">
                        <strong>Mẫu Thư Cảm Ơn Đăng Ký Hội Viên:</strong> Mẫu riêng biệt chào mừng tân hội viên, người dùng có thể tự do chỉnh sửa từng trường thông tin bên dưới.
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 1: Lời chào (Kính gửi Anh/Chị)</span>
                        <input
                          type="text"
                          value={visualContent.greeting || "Kính gửi Anh/Chị {{full_name}}"}
                          onChange={(e) => handleUpdateVisualField("greeting", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold"
                        />
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 2: Tiêu đề thư cảm ơn &amp; Chào mừng</span>
                        <input
                          type="text"
                          value={visualContent.welcomeTitle || "CHÀO MỪNG TÂN HỘI VIÊN CEO 1983"}
                          onChange={(e) => handleUpdateVisualField("welcomeTitle", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-emerald-600"
                        />
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 3: Lời cảm ơn &amp; chúc mừng từ Ban Chấp Hành</span>
                        <textarea
                          rows={2}
                          value={visualContent.welcomeIntro || "Ban Chấp Hành CLB Doanh Nhân CEO 1983 trân trọng cảm ơn và chúc mừng Anh/Chị đã chính thức gia nhập CLB!"}
                          onChange={(e) => handleUpdateVisualField("welcomeIntro", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs leading-relaxed"
                        />
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-2.5">
                        <span className="font-bold text-foreground text-xs block">Khối 4: Thông tin hội viên</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Họ và tên</label>
                            <input
                              type="text"
                              value={visualContent.fullName || "{{full_name}}"}
                              onChange={(e) => handleUpdateVisualField("fullName", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Tên doanh nghiệp</label>
                            <input
                              type="text"
                              value={visualContent.companyName || "{{company_name}}"}
                              onChange={(e) => handleUpdateVisualField("companyName", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Mã hội viên</label>
                            <input
                              type="text"
                              value={visualContent.memberCode || "{{member_code}}"}
                              onChange={(e) => handleUpdateVisualField("memberCode", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono font-bold text-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Ban sinh hoạt</label>
                            <input
                              type="text"
                              value={visualContent.department || "{{department}}"}
                              onChange={(e) => handleUpdateVisualField("department", e.target.value)}
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 5: Hotline BTC khi cần hỗ trợ</span>
                        <input
                          type="text"
                          value={visualContent.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}
                          onChange={(e) => handleUpdateVisualField("hotline", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold text-rose-600"
                        />
                      </div>
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <span className="font-bold text-foreground text-xs block">Khối 6: Lời kết (Trân trọng!)</span>
                        <input
                          type="text"
                          value={visualContent.signature || "Trân trọng! TM. BAN CHẤP HÀNH CLB DOANH NHÂN CEO 1983"}
                          onChange={(e) => handleUpdateVisualField("signature", e.target.value)}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-[#003B95]"
                        />
                      </div>
                    </div>
                  ) : (
                    /* DÀNH CHO CÁC HOẠT ĐỘNG (SỰ KIỆN, CUỘC HỌP, CUỘC GẶP, CHƯƠNG TRÌNH ĐÀO TẠO) - ĐÚNG 9 TRƯỜNG CHUẨN */
                    <div className="space-y-3.5 bg-slate-50/70 dark:bg-slate-900/40 p-3 sm:p-4 rounded-2xl border border-border">
                      {/* BỘ CHỌN LOẠI HOẠT ĐỘNG (SỰ KIỆN, CUỘC HỌP, CUỘC GẶP, CHƯƠNG TRÌNH ĐÀO TẠO) */}
                      <div className="bg-gradient-to-r from-blue-500/10 via-blue-500/5 to-transparent p-3 rounded-xl border border-blue-500/30 space-y-1.5">
                        <label className="font-bold text-foreground text-xs flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#003B95]"></span>
                          Chọn Loại Hoạt Động (Click chọn để tự động thay thế từ khóa sự kiện, cuộc họp, cuộc gặp, chương trình):
                        </label>
                        <select
                          value={visualContent.activityType || "sự kiện"}
                          onChange={(e) => handleSelectActivityType(e.target.value as ActivityType)}
                          className="w-full rounded-lg border border-blue-600/30 bg-background p-2 text-xs font-bold text-[#003B95] dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-[#003B95]"
                        >
                          <option value="sự kiện">Sự kiện (sự kiện)</option>
                          <option value="cuộc họp">Cuộc họp (cuộc họp)</option>
                          <option value="cuộc gặp">Cuộc gặp (cuộc gặp)</option>
                          <option value="chương trình">Chương trình đào tạo (chương trình)</option>
                        </select>
                        <p className="text-[11px] text-muted-foreground">
                          💡 Hệ thống tự động thay thế các câu lệnh thành: "- BTC trân trọng kính mời Anh/Chị tham dự <strong>{visualContent.activityType || "sự kiện"}</strong>:", "- Tên <strong>{visualContent.activityType || "sự kiện"}</strong>:", và "- Thông tin <strong>{visualContent.activityType || "sự kiện"}</strong> gồm các trường:".
                        </p>
                      </div>

                      {/* Khối 1: Lời Chào Mở Đầu */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            Khối 1: Lời Chào
                          </span>
                          <span className="text-[10px] text-muted-foreground">Kính gửi Anh/Chị</span>
                        </div>
                        <input
                          type="text"
                          value={visualContent.greeting || "Kính gửi Anh/Chị {{full_name}}"}
                          onChange={(e) => handleUpdateVisualField("greeting", e.target.value)}
                          placeholder="Kính gửi Anh/Chị {{full_name}}"
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold"
                        />
                      </div>

                      {/* Khối 2: Lời Mời Tham Dự */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            Khối 2: Lời Mời Tham Dự
                          </span>
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={`- BTC trân trọng kính mời Anh/Chị tham dự ${visualContent.activityType || "sự kiện"}:`}
                          className="w-full rounded-lg border border-border bg-muted/50 p-2 text-xs font-semibold text-muted-foreground"
                        />
                      </div>

                      {/* Khối 3: Tên Hoạt Động */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Khối 3: - Tên {visualContent.activityType || "sự kiện"}:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={visualContent.activityTitle || ""}
                          onChange={(e) => handleUpdateVisualField("activityTitle", e.target.value)}
                          placeholder={`Ví dụ: {{event_title}} hoặc Tên ${visualContent.activityType || "sự kiện"}`}
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-[#003B95] dark:text-blue-400"
                        />
                      </div>

                      {/* Khối 4: Thông Tin Hoạt Động Gồm ĐÚNG 9 Trường */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                            Khối 4: - Thông tin {visualContent.activityType || "sự kiện"} gồm đúng 9 trường:
                          </span>
                          <span className="text-[10px] text-muted-foreground font-semibold">Chỉ đúng 9 trường quy chuẩn</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Diễn giả</label>
                            <input
                              type="text"
                              value={visualContent.speaker || ""}
                              onChange={(e) => handleUpdateVisualField("speaker", e.target.value)}
                              placeholder="{{speaker_name}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Nội dung chính</label>
                            <input
                              type="text"
                              value={visualContent.summary || ""}
                              onChange={(e) => handleUpdateVisualField("summary", e.target.value)}
                              placeholder="{{event_summary}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Thời gian</label>
                            <input
                              type="text"
                              value={visualContent.date || ""}
                              onChange={(e) => handleUpdateVisualField("date", e.target.value)}
                              placeholder="{{event_date}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold text-[#003B95]"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Địa điểm</label>
                            <input
                              type="text"
                              value={visualContent.location || ""}
                              onChange={(e) => handleUpdateVisualField("location", e.target.value)}
                              placeholder="{{event_location}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Chi phí</label>
                            <input
                              type="text"
                              value={visualContent.fee || ""}
                              onChange={(e) => handleUpdateVisualField("fee", e.target.value)}
                              placeholder="{{event_fee}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold text-emerald-600"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Google Maps</label>
                            <input
                              type="text"
                              value={visualContent.googleMaps || ""}
                              onChange={(e) => handleUpdateVisualField("googleMaps", e.target.value)}
                              placeholder="{{google_maps_url}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Trang phục</label>
                            <input
                              type="text"
                              value={visualContent.dressCode || ""}
                              onChange={(e) => handleUpdateVisualField("dressCode", e.target.value)}
                              placeholder="{{dress_code}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Gửi xe</label>
                            <input
                              type="text"
                              value={visualContent.parking || ""}
                              onChange={(e) => handleUpdateVisualField("parking", e.target.value)}
                              placeholder="{{parking_info}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs"
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="text-[11px] font-semibold text-muted-foreground block mb-0.5">+ Lưu ý quan trọng từ BTC</label>
                            <input
                              type="text"
                              value={visualContent.notes || ""}
                              onChange={(e) => handleUpdateVisualField("notes", e.target.value)}
                              placeholder="{{event_notes}}"
                              className="w-full rounded-lg border border-border bg-background p-2 text-xs text-amber-700 dark:text-amber-400"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Khối 5: Xác Nhận Tham Dự (Link Công Khai) */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                            Khối 5: - Xác nhận tham dự (Link công khai, không bắt đăng nhập):
                          </span>
                        </div>
                        <input
                          type="text"
                          value={visualContent.confirmLink || "https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}"}
                          onChange={(e) => handleUpdateVisualField("confirmLink", e.target.value)}
                          placeholder="https://crm.ceo1983.viconnect.vn/guest-event-register/{{event_id}}"
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
                        />
                      </div>

                      {/* Khối 6: Hotline BTC Khi Cần Hỗ Trợ */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                            Khối 6: - Hotline BTC khi cần hỗ trợ:
                          </span>
                        </div>
                        <input
                          type="text"
                          value={visualContent.hotline || "0973.205.683 / 0903.205.683 / 0903.203.204"}
                          onChange={(e) => handleUpdateVisualField("hotline", e.target.value)}
                          placeholder="0973.205.683 / 0903.205.683 / 0903.203.204"
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-semibold text-rose-600 dark:text-rose-400"
                        />
                      </div>

                      {/* Khối 7: Lời Kết (Trân trọng!) */}
                      <div className="bg-card p-3 rounded-xl border border-border space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#003B95]"></span>
                            Khối 7: - Lời kết (Trân trọng!)
                          </span>
                        </div>
                        <input
                          type="text"
                          value={visualContent.signature || "Trân trọng!"}
                          onChange={(e) => handleUpdateVisualField("signature", e.target.value)}
                          placeholder="Trân trọng!"
                          className="w-full rounded-lg border border-border bg-background p-2 text-xs font-bold text-[#003B95] dark:text-blue-400"
                        />
                      </div>
                    </div>
                  )
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
                    className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 cursor-pointer"
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
