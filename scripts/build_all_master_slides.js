const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

const DOCS_DIR = path.join(__dirname, '../docs');
const OUT_DIR = path.join(__dirname, '../document');
const EVIDENCE_DIR = path.join(OUT_DIR, 'images', 'evidence');
const CEO_FE_DOCS_DIR = path.join(__dirname, '../apps/ceo1983_app_fe/public/docs');

for (const d of [DOCS_DIR, OUT_DIR, CEO_FE_DOCS_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

// BẢNG MÀU CHUẨN:
// CRM: 100% Trắng - Xanh (Zero Gold)
const CRM_THEME = {
  BG_WHITE: 'FFFFFF',
  BG_LIGHT: 'F0F7FF',
  NAVY_PRIMARY: '003B95',
  BLUE_ACCENT: '0284C7',
  BLUE_LIGHT: 'EFF6FF',
  BLUE_BORDER: 'BAE6FD',
  BORDER_SUBTLE: 'E2E8F0',
  TEXT_DARK: '0F172A',
  TEXT_BODY: '334155',
  TEXT_MUTED: '64748B',
  STRIP: '003B95',
};

// APP: Trắng 70%, Xanh 25%, Vàng Gold 5%
const APP_THEME = {
  BG_WHITE: 'FFFFFF',
  BG_LIGHT: 'F8FAFC',
  NAVY_PRIMARY: '003B95',
  NAVY_HOVER: '002B70',
  BLUE_LIGHT: 'EFF6FF',
  BORDER_SUBTLE: 'E2E8F0',
  GOLD_ACCENT: 'F59E0B',
  GOLD_LIGHT: 'FEF3C7',
  GOLD_BORDER: 'FDE68A',
  TEXT_DARK: '0F172A',
  TEXT_BODY: '334155',
  TEXT_MUTED: '64748B',
};

// ÁNH XẠ THÔNG MINH SANG BỘ ẢNH THỰC TẾ CHỤP MỚI 100%
const IMAGE_FALLBACK_MAP = {
  // CRM Desktop
  'crm_step_02_dashboard_kpi_live.png': '02_crm_dashboard.png',
  'crm_step_03_members_management.png': '04_crm_members_management.png',
  'crm_step_04_member_approval_drawer.png': '04_crm_members_management.png',
  'crm1983_04_member_detail_drawer.png': '03_crm_members_list.png',
  '03_crm_event_create_modal.png': '05_crm_events_list.png',
  'crm_step_06_seating_cinema_map.png': '06_crm_cinema_seating_map.png',
  'crm_step_07_gate_checkin.png': '07_crm_checkin_gate.png',
  'crm1983_09_meetings_calendar.png': '08_crm_meetings_management.png',
  'crm_voting_management.png': '15_app_live_voting.png',
  'crm_lucky_draw_modal.png': '05_crm_events_list.png',
  'crm1983_15_sponsors_management.png': '05_crm_events_list.png',
  'crm_step_08_marketplace_moderation.png': '16_app_products_ecommerce_grid.png',
  'crm_step_09_opportunities_sync.png': '20_app_opportunities_feed.png',
  'crm_step_10_finance_fees_cashbook.png': '10_crm_cashbook_funds.png',
  'crm_step_11_companies_directory.png': '04_crm_members_management.png',
  '02_crm_members_roles_permission.png': '12_crm_permissions_rbac.png',
  // Mobile App
  'app_step_04_home_dashboard.png': '08_app_home_dashboard.png',
  'live_26_app_vip_3d_card.png': '09_app_vip_card.png',
  'app_visit_card_front.png': '14_app_public_card_vcf.png',
  'app_public_qr_scan_user.png': '14_app_event_checkin_pass.png',
  'app_public_qr_scan_view.png': '14_app_public_card_vcf.png',
  'live_30_app_member_profile_edit.png': '09_app_vip_card.png',
  'app_step_06_profile_view.png': '09_app_vip_card.png',
  'app1983_03_members_directory.png': '15_app_members_directory.png',
  'app1983_04_partner_detail.png': '15_app_members_directory.png',
  'app1983_05_schedule_meeting.png': '08_crm_meetings_management.png',
  'app1983_06_chat_1on1.png': '09_app_chat_call_messenger_bubble.png',
  'app_step_07_events_calendar.png': '13_app_events_screen.png',
  'app_step_08_ticket_seating_select.png': '06_crm_cinema_seating_map.png',
  'app_step_09_eticket_qr_pass.png': '14_app_event_checkin_pass.png',
  'app1983_11_voting_session.png': '15_app_live_voting.png',
  'app1983_12_lucky_draw.png': '14_app_event_checkin_pass.png',
  'app_step_10_marketplace_grid.png': '16_app_products_ecommerce_grid.png',
  'app_step_11_b2b_opportunities.png': '20_app_opportunities_feed.png',
  'app_step_12_vietqr_payment.png': '08_app_vietqr_payment_modal.png',
  'app1983_16_settings_preferences.png': '08_app_home_dashboard.png',
  'app_step_08_member_profile_modal.png': '09_app_vip_card.png',
  'app1983_14_meetings_schedule.png': '08_crm_meetings_management.png',
  'app_step_10_chat_conversation.png': '09_app_chat_call_messenger_bubble.png',
  'app_step_11_events_list.png': '13_app_events_screen.png',
  'app_step_12_event_detail_modal.png': '13_app_events_screen.png',
  'app_step_13_ticket_qr_pass.png': '14_app_event_checkin_pass.png',
  'app_voting_mobile_view.png': '15_app_live_voting.png',
  'app_lucky_draw_winner_notification.png': '14_app_event_checkin_pass.png',
  'live_28_app_marketplace_b2b.png': '16_app_products_ecommerce_grid.png',
  'live_29_app_opportunities_feed_1on1.png': '20_app_opportunities_feed.png',
  'app1983_09_fees_vietqr.png': '08_app_vietqr_payment_modal.png',
  'app_card_privacy_settings.png': '14_app_public_card_vcf.png',
};

function resolveImagePath(filename) {
  // 1. Tìm trực tiếp trong EVIDENCE_DIR
  let p = path.join(EVIDENCE_DIR, filename);
  if (fs.existsSync(p)) return p;

  // 2. Tìm qua bảng map
  const mapped = IMAGE_FALLBACK_MAP[filename];
  if (mapped) {
    p = path.join(EVIDENCE_DIR, mapped);
    if (fs.existsSync(p)) return p;
    p = path.join(__dirname, '../docs/training/images', mapped);
    if (fs.existsSync(p)) return p;
  }

  // 3. Tìm trong docs/training/images
  p = path.join(__dirname, '../docs/training/images', filename);
  if (fs.existsSync(p)) return p;

  return null;
}

function getImgBase64(filename) {
  const p = resolveImagePath(filename);
  if (p && fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `image/png;base64,${data.toString('base64')}`;
  }
  console.warn(`[WARN] Image not found: ${filename}`);
  return null;
}

function getRawBase64(filename) {
  const p = resolveImagePath(filename);
  if (p && fs.existsSync(p)) {
    const data = fs.readFileSync(p);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

// =============================================================================
// HELPERS CRM
// =============================================================================
function addCrmSlideHeader(slide, pres, eyebrow, title, subtitle) {
  slide.background = { color: CRM_THEME.BG_WHITE };
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: CRM_THEME.NAVY_PRIMARY }
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 0.45, w: 3.5, h: 0.32,
    fill: { color: CRM_THEME.BLUE_LIGHT },
    line: { color: CRM_THEME.BLUE_BORDER, width: 1 },
    roundRadio: 0.06
  });
  slide.addText(eyebrow, {
    x: 0.8, y: 0.45, w: 3.5, h: 0.32,
    color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 10, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
  slide.addText(title, {
    x: 0.8, y: 0.85, w: 11.73, h: 0.55,
    color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 21, fontFace: 'Calibri'
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.45, w: 11.73, h: 0.35,
      color: CRM_THEME.BLUE_ACCENT, fontSize: 12.5, fontFace: 'Calibri'
    });
  }
}

function addCrmSlideFooter(slide, pres, systemLabel) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 6.95, w: 11.73, h: 0.02,
    fill: { color: CRM_THEME.BORDER_SUBTLE }
  });
  slide.addText(`CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)  |  ${systemLabel}`, {
    x: 0.8, y: 7.05, w: 7.5, h: 0.3,
    color: CRM_THEME.TEXT_MUTED, fontSize: 9.5, italic: true, fontFace: 'Calibri'
  });
  slide.addText('Hệ Thống Web CRM Quản Trị & Vận Hành Hiệp Hội 2.0', {
    x: 8.5, y: 7.05, w: 4.03, h: 0.3,
    color: CRM_THEME.TEXT_MUTED, fontSize: 9.5, align: 'right', fontFace: 'Calibri'
  });
}

function addCrmFeatureSlide(pres, header, imgFilename, badgeText, features, sysLabel) {
  const slide = pres.addSlide();
  addCrmSlideHeader(slide, pres, header.eyebrow, header.title, header.subtitle);

  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 2.05, w: 5.8, h: 4.75,
    fill: { color: CRM_THEME.BG_WHITE },
    line: { color: CRM_THEME.BLUE_BORDER, width: 1.2 },
    roundRadio: 0.08
  });

  const imgData = getImgBase64(imgFilename);
  if (imgData) {
    slide.addImage({ data: imgData, x: 0.95, y: 2.25, w: 5.5, h: 3.44 });
  }

  slide.addShape(pres.ShapeType.rect, {
    x: 0.95, y: 5.9, w: 5.5, h: 0.65,
    fill: { color: CRM_THEME.BLUE_LIGHT },
    line: { color: CRM_THEME.BLUE_BORDER, width: 1 },
    roundRadio: 0.06
  });
  slide.addText(badgeText || '⚡ Dữ Liệu Thời Gian Thực từ CSDL PostgreSQL Bảo Mật', {
    x: 1.05, y: 5.9, w: 5.3, h: 0.65,
    color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 10.5, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });

  features.forEach((feat, idx) => {
    const yPos = 2.05 + idx * 1.2;
    slide.addShape(pres.ShapeType.rect, {
      x: 6.85, y: yPos, w: 5.68, h: 1.08,
      fill: { color: CRM_THEME.BG_WHITE },
      line: { color: CRM_THEME.BORDER_SUBTLE, width: 1 },
      roundRadio: 0.08
    });
    slide.addShape(pres.ShapeType.rect, {
      x: 6.85, y: yPos, w: 0.1, h: 1.08,
      fill: { color: idx % 2 === 0 ? CRM_THEME.NAVY_PRIMARY : CRM_THEME.BLUE_ACCENT }
    });
    slide.addText(feat.title, {
      x: 7.1, y: yPos + 0.1, w: 5.25, h: 0.32,
      color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 12.5, fontFace: 'Calibri'
    });
    slide.addText(feat.desc, {
      x: 7.1, y: yPos + 0.44, w: 5.25, h: 0.56,
      color: CRM_THEME.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri'
    });
  });

  addCrmSlideFooter(slide, pres, sysLabel);
}

// =============================================================================
// HELPERS APP
// =============================================================================
function addAppSlideHeader(slide, pres, eyebrow, title, subtitle) {
  slide.background = { color: APP_THEME.BG_WHITE };
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: APP_THEME.NAVY_PRIMARY }
  });
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0.08, w: 13.33, h: 0.02,
    fill: { color: APP_THEME.GOLD_ACCENT }
  });

  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 0.45, w: 3.6, h: 0.32,
    fill: { color: APP_THEME.BG_WHITE },
    line: { color: APP_THEME.GOLD_ACCENT, width: 1.2 },
    roundRadio: 0.06
  });
  slide.addText(eyebrow, {
    x: 0.8, y: 0.45, w: 3.6, h: 0.32,
    color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 10, align: 'center', valign: 'middle', fontFace: 'Calibri'
  });
  slide.addText(title, {
    x: 0.8, y: 0.85, w: 11.73, h: 0.55,
    color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 21, fontFace: 'Calibri'
  });
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.8, y: 1.45, w: 11.73, h: 0.35,
      color: APP_THEME.NAVY_PRIMARY, fontSize: 12.5, fontFace: 'Calibri'
    });
  }
}

function addAppSlideFooter(slide, pres, systemLabel) {
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 6.95, w: 11.73, h: 0.02,
    fill: { color: APP_THEME.BORDER_SUBTLE }
  });
  slide.addText(`CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)  |  ${systemLabel}`, {
    x: 0.8, y: 7.05, w: 7.5, h: 0.3,
    color: APP_THEME.TEXT_MUTED, fontSize: 9.5, italic: true, fontFace: 'Calibri'
  });
  slide.addText('Bản Quyền © 2026 CLB Doanh Nhân CEO 1983 · Hệ Thống Số Hóa Toàn Diện', {
    x: 8.5, y: 7.05, w: 4.03, h: 0.3,
    color: APP_THEME.TEXT_MUTED, fontSize: 9.5, align: 'right', fontFace: 'Calibri'
  });
}

function addAppMobileFeatureSlide(pres, header, imgFilename, badgeText, features, sysLabel) {
  const slide = pres.addSlide();
  addAppSlideHeader(slide, pres, header.eyebrow, header.title, header.subtitle);

  // 1. Sleek subtle background card on the left
  slide.addShape(pres.ShapeType.rect, {
    x: 0.8, y: 1.95, w: 4.3, h: 4.95,
    fill: { color: APP_THEME.BG_LIGHT },
    line: { color: APP_THEME.BORDER_SUBTLE, width: 1 },
    roundRadio: 0.12
  });

  // 2. Titanium Smartphone Outer Chassis
  slide.addShape(pres.ShapeType.rect, {
    x: 1.80, y: 2.05, w: 2.30, h: 4.75,
    fill: { color: '0F172A' },
    line: { color: '334155', width: 2 },
    roundRadio: 0.28
  });

  // 3. Screen Glass / Image
  const imgData = getImgBase64(imgFilename);
  if (imgData) {
    slide.addImage({
      data: imgData,
      x: 1.85, y: 2.10, w: 2.20, h: 4.65,
      roundRadio: 0.20
    });
  }

  // 4. Dynamic Island Pill at top of screen
  slide.addShape(pres.ShapeType.rect, {
    x: 2.65, y: 2.15, w: 0.60, h: 0.11,
    fill: { color: '000000' },
    roundRadio: 0.05
  });

  // 5. Home Indicator Line at bottom of screen
  slide.addShape(pres.ShapeType.rect, {
    x: 2.50, y: 6.66, w: 0.90, h: 0.04,
    fill: { color: 'FFFFFF' },
    roundRadio: 0.02
  });

  // 6. Right column: 4 spacious luxury feature cards
  features.forEach((feat, idx) => {
    const yPos = 1.95 + idx * 1.25;
    slide.addShape(pres.ShapeType.rect, {
      x: 5.35, y: yPos, w: 7.18, h: 1.14,
      fill: { color: APP_THEME.BG_WHITE },
      line: { color: APP_THEME.BORDER_SUBTLE, width: 1 },
      roundRadio: 0.08
    });
    slide.addShape(pres.ShapeType.rect, {
      x: 5.35, y: yPos, w: 0.08, h: 1.14,
      fill: { color: idx % 2 === 0 ? APP_THEME.NAVY_PRIMARY : APP_THEME.GOLD_ACCENT }
    });
    slide.addText(feat.title, {
      x: 5.60, y: yPos + 0.10, w: 6.75, h: 0.34,
      color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri'
    });
    slide.addText(feat.desc, {
      x: 5.60, y: yPos + 0.46, w: 6.75, h: 0.60,
      color: APP_THEME.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri'
    });
  });

  addAppSlideFooter(slide, pres, sysLabel);
}

// =============================================================================
// DỮ LIỆU TẤT CẢ SLIDES CRM (26 SLIDES ĐẦY ĐỦ 100% KHÔNG THIẾU BẤT KỲ LUỒNG NÀO)
// =============================================================================
const CRM_FEATURE_SLIDES = [
  
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 01',
    title: 'Bảng Điều Khiển Tổng Quan (Dashboard) & Chỉ Số KPI Thực',
    subtitle: 'Bức tranh toàn cảnh về sức khỏe hiệp hội: Hội viên, Dòng tiền sổ quỹ và Giao thương B2B',
    img: 'crm_step_02_dashboard_kpi_live.png',
    badge: '📊 Dữ liệu phản hồi trực tiếp từ Database với biểu đồ tiến độ & thống kê thời gian thực',
    features: [
      { title: 'Chỉ Số Tăng Trưởng Hội Viên', desc: 'Thống kê tổng số doanh nhân chính thức đang hoạt động và số lượng hồ sơ mới đang chờ thẩm định.' },
      { title: 'Theo Dõi Dòng Tiền & Quỹ Hội', desc: 'Đo lường nguồn thu hội phí thường niên, vé sự kiện và các khoản tài trợ chuyển khoản VietQR.' },
      { title: 'Đo Lường Hiệu Quả Sàn B2B', desc: 'Tổng hợp số lượng hoạt động kết nối, sản phẩm niêm yết và số lượng Deal giao thương thành công.' },
      { title: 'Xuất Báo Cáo Ban Chấp Hành Tức Thì', desc: 'Tải dữ liệu chuẩn hóa phục vụ các kỳ họp Ban Chấp Hành định kỳ chỉ với một cú nhấp chuột.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 02',
    title: 'Quản Trị Danh Sách Hội Viên, Phân Hạng & Bộ Lọc Ban Ngành',
    subtitle: 'Quản lý toàn bộ 100+ lãnh đạo doanh nhân sinh năm 1983 theo ban chuyên môn',
    img: 'crm_step_03_members_management.png',
    badge: '👥 Bảng dữ liệu đa năng hỗ trợ tìm kiếm nhanh, lọc theo trạng thái và xuất Excel',
    features: [
      { title: 'Danh Mục Hồ Sơ Doanh Nhân Đầy Đủ', desc: 'Lưu trữ họ tên, công ty, mã số thuế, chức vụ trong CLB, số điện thoại và địa chỉ trụ sở.' },
      { title: 'Bộ Lọc & Tìm Kiếm Thông Minh', desc: 'Tra cứu tức thì theo tên doanh nhân, công ty, số điện thoại hoặc trạng thái Hoạt động/Chờ duyệt.' },
      { title: 'Phân Bổ Ban Chuyên Môn Sinh Hoạt', desc: 'Sắp xếp hội viên vào Ban Sự kiện, Ban Tài chính, Ban Xúc tiến Thương mại, Ban Truyền thông.' },
      { title: 'Xuất Báo Cáo Excel Danh Bạ', desc: 'Tải file Excel định dạng chuẩn phục vụ công tác in ấn kỷ yếu và lưu trữ nội bộ hiệp hội.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 03',
    title: 'Thẩm Định Hồ Sơ 360° & Ban Thường Vụ Độc Quyền Phê Duyệt',
    subtitle: 'Ban Thường Vụ độc quyền duyệt cấp mã CEO-83xxx; Cơ chế bảo vệ phân quyền chặt chẽ',
    img: 'crm_step_04_member_approval_drawer.png',
    badge: '⚡ Bấm Phê duyệt: Tự động kích hoạt tài khoản DB & Gửi ngay Email mật khẩu cho hội viên',
    features: [
      { title: 'Drawer Thẩm Định Toàn Diện 360°', desc: 'Xem trọn vẹn giấy phép đăng ký kinh doanh, chức vụ C-Level và lĩnh vực kinh doanh của doanh nghiệp.' },
      { title: 'Ban Thường Vụ Độc Quyền Phê Duyệt', desc: 'Chỉ BTV có quyền bấm Duyệt; hệ thống tự động sinh mã định danh chính thức CEO-83xxx.' },
      { title: 'Tách Biệt Thẩm Quyền Phê Duyệt', desc: 'Hệ thống kiểm soát nghiêm ngặt theo thẩm quyền Ban Thường Vụ, tự động từ chối thao tác ngoài thẩm quyền.' },
      { title: 'Bắn Email Kèm Mật Khẩu Tức Thì', desc: 'Hệ thống gửi thư điện tử chúc mừng kết nạp kèm mật khẩu khởi tạo an toàn về hòm thư hội viên.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 04',
    title: 'Hồ Sơ Chi Tiết Hội Viên 360°, Phân Hạng Kim Cương & Quản Trị Tài Khoản',
    subtitle: 'Trang chi tiết hồ sơ hội viên toàn diện, chấm điểm gắn kết KPI, đặt lại mật khẩu và phân quyền',
    img: 'crm1983_04_member_detail_drawer.png',
    badge: '👤 Hồ sơ hội viên 360°: Quản trị tài khoản, reset mật khẩu, lịch sử sinh hoạt & điểm gắn kết KPI',
    features: [
      { title: 'Trang Xem Chi Tiết Hội Viên 360°', desc: 'Theo dõi lịch sử tham gia họp, sự kiện, giao thương B2B và tình trạng đóng hội phí thường niên.' },
      { title: 'Quản Trị Tài Khoản, Khóa & Reset Mật Khẩu', desc: 'Đặt lại mật khẩu gửi về email hội viên, tạm khóa tài khoản hoặc mở khóa quyền truy cập tức thì.' },
      { title: 'Chấm Điểm Gắn Kết & Phân Hạng Tự Động', desc: 'Hệ thống tự động tính điểm KPI hoạt động và phân hạng: Kim Cương, Vàng, Bạc minh bạch.' },
      { title: 'Phân Khúc Ngành Nghề & Xuất/Nhập Excel', desc: 'Phân loại 12 nhóm ngành kinh tế, cấp quyền lợi ưu đãi và hỗ trợ import/export danh bạ Excel.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 05',
    title: 'Event Wizard: Khởi Tạo, Sửa Sự Kiện, Diễn Giả, Vé Đa Tầng & Xác Nhận',
    subtitle: 'Quy trình quản trị vòng đời sự kiện: Form thiết lập, timeline, diễn giả VIP, vé 0đ & vé phụ thu',
    img: '03_crm_event_create_modal.png',
    badge: '🎯 Event Wizard: Thiết lập thông tin, timeline, diễn giả, vé đa tầng & danh sách đăng ký',
    features: [
      { title: 'Biểu Mẫu Khởi Tạo & Hiệu Chỉnh Sự Kiện', desc: 'Cập nhật tiêu đề, mô tả, địa điểm, thời gian, banner chuẩn cinematic, tùy chỉnh nội dung bất kỳ lúc nào.' },
      { title: 'Cấu Hình Timeline Chi Tiết & Diễn Giả VIP', desc: 'Thiết lập lịch trình từng phiên thảo luận, đính kèm hình ảnh và trích dẫn diễn giả C-Level.' },
      { title: 'Cấu Hình Vé Đa Tầng & Phụ Thu VietQR', desc: 'Vé VIP 0đ đặc quyền cho hội viên; Vé đối tác/khách mời phụ thu (1.500.000đ) qua VietQR tự động.' },
      { title: 'Quản Lý Danh Sách & Xác Nhận Tham Gia', desc: 'Ban Tổ Chức duyệt/hủy đăng ký, xác nhận tham dự, gửi email thông báo mã vé và xuất báo cáo Excel.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 06',
    title: 'Sơ Đồ Rạp Cinema Seating Map & Xếp Chỗ VIP Gala Dinner',
    subtitle: 'Bố trí sơ đồ bàn tiệc trực quan, định vị chính xác chỗ ngồi danh dự',
    img: 'crm_step_06_seating_cinema_map.png',
    badge: '🏛️ Phân bổ Bàn VIP Đoàn Chủ Tịch và đồng bộ số ghế chính xác vào Vé Điện Tử trên App',
    features: [
      { title: 'Trực Quan Hóa Sơ Đồ Khán Phòng', desc: 'Mô phỏng chân thực ma trận ghế ngồi và bàn tiệc: Bàn VIP Kim Cương, Bàn Đại biểu, Bàn Khách mời.' },
      { title: 'Kéo Thả Xếp Chỗ Ngồi Danh Dự', desc: 'Gán đại biểu và khách VIP vào từng vị trí ghế ngồi cụ thể theo giao thức ngoại giao trang trọng.' },
      { title: 'Tự Động Cập Nhật Lên Vé Trên App', desc: 'Vị trí số bàn và số ghế tự động hiển thị trên Vé điện tử thông minh trong điện thoại của hội viên.' },
      { title: 'Ngăn Ngừa Trùng Lặp Chỗ Ngồi 100%', desc: 'Hệ thống tự động khóa ghế đã được gán, đảm bảo không bao giờ xảy ra tình trạng xếp trùng vị trí.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 07',
    title: 'Cổng Soát Vé Check-in QR Tốc Độ Cao & Giám Sát Cửa (Xanh / Đỏ)',
    subtitle: 'Kiểm soát ra vào hội trường trong 1 giây, cảnh báo chống chụp ảnh màn hình gian lận',
    img: 'crm_step_07_gate_checkin.png',
    badge: '⚡ Tốc độ quét mã 1 giây/người, chống chụp màn hình gian lận & âm thanh xác nhận tức thì',
    features: [
      { title: 'Quét Mã Vé QR Điện Tử Siêu Tốc', desc: 'Hỗ trợ đầu đọc mã vạch chuyên dụng hoặc camera máy tính bảng quét vé QR từ App trong 1 giây.' },
      { title: 'Hiển Thị Thông Tin Đại Biểu Lễ Tân', desc: 'Màn hình ngay lập tức hiển thị họ tên, chức vụ, ảnh đại diện và vị trí số bàn tiệc để đón tiếp.' },
      { title: 'Cảnh Báo Màu Đỏ Chống Quét Lại', desc: 'Cảnh báo màu đỏ nổi bật và âm thanh cảnh báo nếu mã vé đã được quét trước đó, ngăn gian lận.' },
      { title: 'Báo Cáo Tỷ Lệ Tham Dự Realtime', desc: 'Thống kê tức thời số lượng khách đã có mặt tại hội trường phục vụ công tác khai mạc đại hội.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 08',
    title: 'Quản Trị Cuộc Họp BQT, Phòng Họp Trực Tiếp / Online & Điểm Danh QR',
    subtitle: 'Khởi tạo cuộc họp, phê duyệt BQT, bắn tin nhắn triệu tập & số hóa biên bản họp',
    img: 'crm1983_09_meetings_calendar.png',
    badge: '📅 Lịch họp đồng bộ đa nền tảng (Sapphire Hub CEO 1983 / Zoom / Meet) & điểm danh QR 1s',
    features: [
      { title: 'Khởi Tạo Cuộc Họp & Phòng Họp Đa Dạng', desc: 'Chọn phòng họp trực tiếp (Sapphire Hub) hoặc online (Zoom, Google Meet), cấu hình thời gian.' },
      { title: 'Duyệt BQT & Bắn Triệu Tập Tự Động', desc: 'BTV duyệt: Hệ thống tự động phát push và bắn tin nhắn hệ thống [CEO1983_SYSTEM] vào nhóm chat.' },
      { title: 'Điểm Danh Thông Minh Bằng QR Động', desc: 'Mã QR thay đổi định kỳ tại cửa phòng họp, ghi nhận chính xác giây check-in của từng lãnh đạo.' },
      { title: 'Biên Bản Cuộc Họp & Giao Việc Số', desc: 'Lưu trữ biên bản cuộc họp điện tử, giao việc trực tiếp cho các ban kèm deadline và theo dõi tiến độ.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 09',
    title: 'Quản Trị Bầu Cử Đại Hội & Biểu Quyết Tín Nhiệm Đại Biểu',
    subtitle: 'Số hóa công tác hiệp thương nhân sự, thiết lập kỳ bầu cử và kiểm phiếu tự động',
    img: 'crm_voting_management.png',
    badge: '🗳️ Quản lý kỳ bầu cử BCH: Giám sát tỷ lệ biểu quyết, ứng viên đại biểu & kết quả trực tiếp',
    features: [
      { title: 'Khởi Tạo Kỳ Bầu Cử & Biểu Quyết Nhanh', desc: 'Thiết lập tiêu đề kỳ họp, thời gian mở/đóng hòm phiếu điện tử và số lượng ứng viên tối đa.' },
      { title: 'Quản Lý Danh Sách Ứng Cử Viên Ban Chấp Hành', desc: 'Cập nhật hồ sơ ứng viên, hình ảnh, chức vụ hiện tại và chương trình hành động để nghiên cứu.' },
      { title: 'Kiểm Phiếu Tự Động & Chống Gian Lận', desc: 'Thuật toán mã hóa một chiều ngăn chặn bỏ phiếu hai lần, tự động tổng hợp số phiếu và tỷ lệ %.' },
      { title: 'Xuất Báo Cáo Kiểm Phiếu Chuẩn Đại Hội', desc: 'In biên bản kiểm phiếu phục vụ Ban Kiểm Soát đại hội ký duyệt và lưu trữ văn kiện nhiệm kỳ.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 10',
    title: 'Quản Trị Vòng Quay May Mắn Lucky Draw & Trao Thưởng VinFast VF3',
    subtitle: 'Khuấy động không khí đêm Gala với cơ chế quay số ngẫu nhiên theo mã vé may mắn',
    img: 'crm_lucky_draw_modal.png',
    badge: '🎁 Cơ cấu Giải đặc biệt VinFast VF3 - Quay số minh bạch, tìm người trúng giải & thông báo',
    features: [
      { title: 'Cấu Hình Cơ Cấu Giải Thưởng Hấp Dẫn', desc: 'Thiết lập Giải Đặc Biệt (Ô tô VinFast VF3), Giải Nhất, Giải Nhì, Giải Ba kèm ảnh minh họa.' },
      { title: 'Quay Số Ngẫu Nhiên Minh Bạch 100%', desc: 'Hệ thống quay số ngẫu nhiên từ tập hợp mã vé đã check-in vào sự kiện, hiển thị số trên màn LED.' },
      { title: 'Xác Nhận Người Trúng Thưởng & Mã Vé', desc: 'Hệ thống tự động hiển thị thông tin trúng thưởng (VD: Ngô Bảo Anh - Mã #2190) lên màn hình lớn.' },
      { title: 'Gửi Thông Báo Push Chúc Mừng Xuống App', desc: 'Admin bấm nút: Điện thoại người trúng nhận ngay tin nhắn chúc mừng lên sân khấu nhận giải.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 11',
    title: 'Quản Trị Nhà Tài Trợ, Phân Bổ Gói Quyền Lợi Kim Cương/Vàng & Đo ROI',
    subtitle: 'Tối ưu hóa nguồn thu tài trợ cho các kỳ đại hội, Caravan và Gala doanh nhân thường niên',
    img: 'crm1983_15_sponsors_management.png',
    badge: '💎 Quản lý đối tác tài trợ đa tầng: Diamond, Platinum, Gold, Silver & đo lường hiệu quả',
    features: [
      { title: 'Quản Lý Danh Mục Gói Tài Trợ Đa Cấp', desc: 'Cấu hình các gói tài trợ: Kim Cương, Bạch Kim, Vàng, Bạc kèm định mức đóng góp và quyền lợi.' },
      { title: 'Phân Bổ Vị Trí Hiển Thị Logo Nhận Diện', desc: 'Tự động đẩy logo nhà tài trợ lên banner sự kiện, backdrop, vé điện tử QR và màn hình LED.' },
      { title: 'Cấp Vé Mời Danh Dự Cho Nhà Tài Trợ', desc: 'Tự động phân bổ số lượng vé VIP danh dự tại bàn VIP Kim Cương dành cho lãnh đạo đơn vị tài trợ.' },
      { title: 'Báo Cáo Quyền Lợi & Đo Lường ROI', desc: 'Thống kê số lượt tiếp cận logo, tương tác thương hiệu trên App và Web CRM để báo cáo đối tác.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 12',
    title: 'Quản Trị Sàn Marketplace, Kiểm Duyệt Sản Phẩm Doanh Nghiệp',
    subtitle: 'Thẩm định chất lượng và xuất xứ trước khi niêm yết chào hàng nội bộ',
    img: 'crm_step_08_marketplace_moderation.png',
    badge: '🏷️ Gán nhãn Đã Kiểm Duyệt CLB CEO 1983 và kích hoạt ưu đãi đặc quyền cho hội viên',
    features: [
      { title: 'Hàng Đợi Kiểm Duyệt Sản Phẩm', desc: 'Tiếp nhận bài đăng sản phẩm từ Mobile App hội viên, xem hình ảnh, thông số kỹ thuật và báo giá sỉ.' },
      { title: 'Thẩm Định Chính Sách Ưu Đãi Nội Bộ', desc: 'Đảm bảo sản phẩm có chính sách chiết khấu thực chất dành riêng cho cộng đồng doanh nhân CEO 1983.' },
      { title: 'Phê Duyệt Xuất Bản Lên App Tức Thì', desc: 'Bấm Duyệt: Sản phẩm ngay lập tức xuất hiện trên sàn giao dịch của toàn bộ hội viên trên di động.' },
      { title: 'Theo Dõi & Giám Sát Báo Giá B2B', desc: 'Thống kê số lượt hội viên gửi yêu cầu báo giá và lưu lượng tương tác giao thương giữa các bên.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 13',
    title: 'Điều Phối Cơ Hội Giao Thương B2B & Thống Kê Giá Trị Deals',
    subtitle: 'Nắm bắt dòng chảy giao thương, kết nối cung cầu và thúc đẩy hợp đồng kinh tế',
    img: 'crm_step_09_opportunities_sync.png',
    badge: '🤝 Đo lường giá trị các Deal kinh doanh đã kết nối thành công phục vụ báo cáo hiệp hội',
    features: [
      { title: 'Nắm Bắt Toàn Diện Nhu Cầu Giao Thương', desc: 'Theo dõi các đề xuất mua bán, tìm nhà cung ứng, mời gọi hợp tác đầu tư và phân phối hàng hóa.' },
      { title: 'Giám Sát Trạng Thái Kết Nối Deals', desc: 'Biết chính xác cơ hội nào đã được hội viên đón nhận (Claimed) và tiến độ ký kết hợp đồng.' },
      { title: 'Thống Kê Tổng Giá Trị Giao Thương', desc: 'Đo lường quy mô kinh tế bằng tiền (Tỷ đồng) mà hệ sinh thái CEO 1983 đã tạo ra cho thành viên.' },
      { title: 'Hỗ Trợ Kết Nối Chéo Giữa Các Ban', desc: 'Ban Xúc tiến thương mại đóng vai trò điều phối, giới thiệu các đối tác tiềm năng phù hợp nhất.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 14',
    title: 'Quản Lý Thu Hội Phí Thường Niên, Đối Soát VietQR & Sổ Quỹ Thu Chi 3 Cấp',
    subtitle: 'Tự động hóa đối soát sao kê ngân hàng, gạch nợ hội phí không cần xử lý thủ công',
    img: 'crm_step_10_finance_fees_cashbook.png',
    badge: '💳 Gạch nợ tự động qua VietQR, xuất phiếu thu điện tử và lưu trữ sổ quỹ kế toán minh bạch',
    features: [
      { title: 'Theo Dõi Hội Phí Thường Niên Theo Năm', desc: 'Bảng theo dõi trạng thái: Đã thanh toán, Chưa nộp, Miễn giảm theo từng hội viên cụ thể.' },
      { title: 'Đối Soát Tự Động Qua Cổng VietQR 24/7', desc: 'Khi hội viên quét mã chuyển khoản trên App, hệ thống tự động gạch nợ và gia hạn thẻ số tức thì.' },
      { title: 'Sổ Quỹ Thu Chi Duyệt 3 Cấp Nghiêm Ngặt', desc: 'Lập phiếu, Kế toán soát xét, BTV phê duyệt; ghi nhận minh bạch thu hội phí, tài trợ, quỹ từ thiện.' },
      { title: 'Xuất Báo Cáo Kế Toán & Phiếu Thu Số', desc: 'Tự động tạo phiếu thu điện tử gửi về email hội viên và xuất file đối soát phục vụ ban kiểm soát.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 15',
    title: 'Quản Lý Doanh Nghiệp Thành Viên & Bản Đồ Chuỗi Cung Ứng',
    subtitle: 'Xây dựng mạng lưới liên kết sản xuất và tiêu dùng nội bộ bền vững',
    img: 'crm_step_11_companies_directory.png',
    badge: '🏢 Bản đồ năng lực chuỗi cung ứng: Kết nối sản xuất, phân phối và dịch vụ C-Level',
    features: [
      { title: 'Lưu Trữ Hồ Sơ Pháp Nhân Đầy Đủ', desc: 'Quản lý mã số thuế, địa chỉ trụ sở, người đại diện pháp luật và hồ sơ năng lực chi tiết của công ty.' },
      { title: 'Phân Loại Ngành Nghề Chuỗi Giá Trị', desc: 'Sắp xếp theo cụm ngành: Cơ khí sản xuất, Xây dựng hoàn thiện, F&B, Logistics, Dịch vụ số.' },
      { title: 'Thúc Đẩy Sử Dụng Sản Phẩm Chéo', desc: 'Khuyến khích hội viên ưu tiên sử dụng vật tư, thiết bị và dịch vụ của nhau với chiết khấu nội bộ.' },
      { title: 'Liên Kết Tài Khoản Lãnh Đạo Với Công Ty', desc: 'Một doanh nghiệp có thể có Chủ tịch và Tổng Giám Đốc cùng sinh hoạt với quyền hạn rõ ràng.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG QUẢN TRỊ 16',
    title: 'Ma Trận Phân Quyền 6 Ban Chuyên Trách RBAC & Nhật Ký Kiểm Toán',
    subtitle: 'Phân định quyền hạn rõ ràng, lưu vết bất biến toàn bộ thao tác vận hành',
    img: '02_crm_members_roles_permission.png',
    badge: '🔒 Nhật ký kiểm toán lưu vết IP, tài khoản thực hiện và thời gian chính xác của mọi thao tác',
    features: [
      { title: 'Ma Trận Phân Quyền 6 Ban Chuyên Môn', desc: 'BTV, BTK, Ban Sự kiện, Ban Tài chính, Ban Hội viên, Ban Truyền thông theo đúng thẩm quyền.' },
      { title: 'Nhật Ký Kiểm Toán An Ninh Bất Biến', desc: 'Ghi nhận lịch sử: Ai đã phê duyệt hội viên, ai đã sửa số liệu sổ quỹ, ai đã xuất file danh bạ.' },
      { title: 'Bảo Vệ Hạ Tầng Chuẩn SSL/HTTPS', desc: 'Toàn bộ dữ liệu truyền tải giữa Web CRM, App Mobile và CSDL đều được mã hóa tuyệt đối.' },
      { title: 'Cơ Chế Sao Lưu Định Kỳ Tự Động', desc: 'Tự động sao lưu dự phòng CSDL hàng ngày, đảm bảo khả năng phục hồi nguyên vẹn khi cần thiết.' }
    ]
  }
];

// =============================================================================
// =============================================================================
// DỮ LIỆU TẤT CẢ SLIDES APP (20 SLIDES 100% PORTRAIT MOBILE CHUẨN THIẾT BỊ)
// =============================================================================
const APP_FEATURE_SLIDES = [
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 01',
    title: 'Trang Chủ Dashboard Doanh Nhân & Tiện Ích 1-Chạm',
    subtitle: 'Tổng hợp mọi thông tin sinh hoạt, sự kiện và cơ hội hợp tác ngay trong tầm tay',
    img: 'app_step_04_home_dashboard.png',
    badge: 'Dashboard tổng quan',
    features: [
      { title: 'Thẻ VIP Doanh Nhân 3D Tiêu Điểm', desc: 'Thẻ số hóa ánh kim vàng hoàng gia hiển thị họ tên, chức vụ và doanh nghiệp pháp nhân.' },
      { title: 'Thanh Tác Vụ Tiện Ích 1-Chạm', desc: 'Truy cập nhanh: Chạm NFC, Bầu cử, Check-in vé, Đăng bán sản phẩm, Nộp hội phí thường niên.' },
      { title: 'Banner Sự Kiện Sắp Diễn Ra', desc: 'Đếm ngược thời gian đến các kỳ Caravan, Gala Dinner và Cafe Doanh nhân định kỳ.' },
      { title: 'Bản Tin Hoạt Động Cập Nhật Hàng Ngày', desc: 'Nắm bắt các thông báo mới nhất từ Ban Chủ Tịch và Ban Thư Ký CLB CEO 1983.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 02',
    title: 'Thẻ Định Danh Số VIP Titanium & Tích Hợp Chip Chạm NFC',
    subtitle: 'Biểu tượng danh giá khẳng định tư cách lãnh đạo thành viên chính thức CLB CEO 1983',
    img: 'live_26_app_vip_3d_card.png',
    badge: 'Thẻ định danh VIP Titanium',
    features: [
      { title: 'Thiết Kế Thẻ Hội Viên VIP Titanium Độc Bản', desc: 'Tông màu vàng kim hoàng gia sang trọng, gắn ảnh chân dung lãnh đạo, họ tên và doanh nghiệp.' },
      { title: 'Mã Số Hội Viên Độc Nhất (CEO-83xxx)', desc: 'Mã định danh duy nhất xác nhận tư cách pháp nhân thành viên chính thức được phê duyệt.' },
      { title: 'Huy Hiệu Tích Xanh Chứng Nhận Lãnh Đạo', desc: 'Dấu tích xanh Verified minh chứng uy tín doanh nhân được Hội Doanh Nhân Trẻ Hà Nội công nhận.' },
      { title: 'Tích Hợp Chip Cảm Ứng Không Tiếp Xúc NFC', desc: 'Chạm điện thoại vào bất kỳ máy quét hoặc điện thoại thông minh nào để mở trang định danh tức thì.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 03',
    title: 'Danh Thiếp Số Doanh Nhân Visit Card Lật Mặt Sau & Chuẩn Brandbook',
    subtitle: 'Thay thế hoàn toàn card visit giấy: Mặt trước thông tin C-Level, mặt sau Brandbook xanh Navy',
    img: 'app_visit_card_front.png',
    badge: 'Danh thiếp số Visit Card mặt trước',
    features: [
      { title: 'Mặt Trước Chuẩn Brandbook Sang Trọng', desc: 'Hiển thị họ tên, chức danh CEO/Sáng lập, công ty, số điện thoại, email và trụ sở doanh nghiệp.' },
      { title: 'Hiệu Ứng Lật Thẻ Visit Card Xem Mặt Sau', desc: 'Nút Lật thẻ chuyển động mượt mà mở mặt sau màu xanh Navy hoàng gia mang slogan CLB CEO 1983.' },
      { title: 'Nút Chia Sẻ & Mã QR Động Kết Nối Nhanh', desc: 'Mở mã QR cá nhân để đối tác quét bằng Zalo/Camera nhận thông tin vCard lưu trực tiếp vào máy.' },
      { title: 'Tùy Biến Cài Đặt Quyền Riêng Tư 1-Chạm', desc: 'Chủ động bật/tắt hiển thị số điện thoại cá nhân, email hoặc địa chỉ theo nhu cầu bảo mật thông tin.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 04',
    title: 'Quét Mã QR Bằng Camera WebRTC Siêu Tốc 0.1s & Nhận Diện Đa Chiều',
    subtitle: 'Quét danh thiếp số doanh nhân, vé sự kiện điện tử và điểm danh cuộc họp trong tích tắc',
    img: 'app_public_qr_scan_user.png',
    badge: 'Camera WebRTC siêu nhạy: Tự động nhận diện mã QR trong 0.1 giây, hỗ trợ bật đèn Flash',
    features: [
      { title: 'Công Nghệ WebRTC Camera Siêu Nhạy', desc: 'Tối ưu khung hình 60fps, nhận diện mã QR tức thì dưới 0.1 giây ngay cả trong ánh sáng yếu.' },
      { title: 'Quét Danh Thiếp Số Đối Tác Tại Chỗ', desc: 'Đưa camera quét mã QR trên màn hình hoặc thẻ Visit Card của đồng nghiệp để mở trang định danh.' },
      { title: 'Quét Mã Điểm Danh Cuộc Họp & Khán Phòng', desc: 'Tự động nhận diện mã QR động tại phòng họp Sapphire Hub hoặc cổng sự kiện để check-in tức thì.' },
      { title: 'Tích Hợp Bật Đèn Flash & Lật Camera', desc: 'Nút bật/tắt đèn pin và lật camera trước/sau hỗ trợ tối đa trong môi trường tiệc tối Gala.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 05',
    title: 'Quét Mã QR Từ Ngoài & Trang Xác Thực Công Khai Chuẩn Brandbook',
    subtitle: 'Đối tác quét bằng Zalo / Camera iPhone không cần cài app vẫn hiển thị hồ sơ thẩm định 100%',
    img: 'app_public_qr_scan_view.png',
    badge: 'Trang xác thực công khai khi quét QR ngoài',
    features: [
      { title: 'Quét Nhanh Bằng Zalo Hoặc Camera Ngoài', desc: 'Không bắt buộc cài đặt ứng dụng: Mọi camera điện thoại hoặc Zalo đều đọc được mã định danh.' },
      { title: 'Trang Web Xác Thực Công Khai Chuẩn Mực', desc: 'Mở giao diện web công khai chuẩn mực với thẻ Visit Card Luxury, ảnh đại diện, chức danh và dấu mộc.' },
      { title: 'Tích Xanh Verified & Dấu Mộc CLB CEO 1983', desc: 'Chứng thực tư cách thành viên chính thức được kiểm định bởi Hội Doanh Nhân Trẻ Hà Nội (HanoiBA).' },
      { title: 'Phím Gọi Điện, Nhắn Zalo & Lưu Danh Bạ vCard', desc: 'Đối tác chỉ cần bấm một nút là lưu thẳng liên hệ vào danh bạ điện thoại hoặc gọi điện trao đổi ngay.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 06',
    title: 'Chỉnh Sửa Nhanh Hồ Sơ Doanh Nhân (QuickProfileEditModal) Tiện Lợi',
    subtitle: 'Cập nhật ảnh đại diện, ảnh bìa, logo công ty, chức danh và slogan doanh nghiệp trong 1 màn hình',
    img: 'live_30_app_member_profile_edit.png',
    badge: 'Quick Profile Edit: Cập nhật thông tin cá nhân và thương hiệu chỉ với vài cú chạm',
    features: [
      { title: 'Giao Diện Modal Kéo Chạm Hiện Đại', desc: 'Cửa sổ chỉnh sửa trượt mượt mà, trực quan, hỗ trợ xem trước (preview) kết quả ngay khi nhập liệu.' },
      { title: 'Tải Lên Ảnh Chân Dung & Ảnh Bìa Sắc Nét', desc: 'Chụp ảnh trực tiếp từ camera hoặc chọn từ thư viện ảnh điện thoại với công cụ cắt cúp tự động.' },
      { title: 'Cập Nhật Logo & Thông Tin Pháp Nhân', desc: 'Điền tên công ty, chức danh lãnh đạo, mã số thuế, địa chỉ trụ sở và số điện thoại công khai.' },
      { title: 'Lưu & Đồng Bộ Tức Thì Xuống CRM & Thẻ Visit', desc: 'Bấm Lưu: Dữ liệu tự động cập nhật ngay trên thẻ 3D Titanium, trang quét công khai và CSDL trung tâm.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 07',
    title: 'Hồ Sơ Năng Lực Doanh Nhân 360° & Pháp Nhân Doanh Nghiệp',
    subtitle: 'Khẳng định uy tín thương hiệu cá nhân và năng lực công ty trong mạng lưới',
    img: 'app_step_06_profile_view.png',
    badge: 'Hồ sơ năng lực 360°',
    features: [
      { title: 'Thông Tin Pháp Nhân Doanh Nghiệp Đầy Đủ', desc: 'Hiển thị tên công ty, mã số thuế, địa chỉ trụ sở chính, website và lĩnh vực hoạt động.' },
      { title: 'Tùy Biến Ảnh Đại Diện & Ảnh Bìa Công Ty', desc: 'Dễ dàng tải lên hình ảnh nhận diện thương hiệu doanh nghiệp sắc nét và chuyên nghiệp.' },
      { title: 'Đính Kèm Hồ Sơ Năng Lực & Brochure PDF', desc: 'Hỗ trợ đính kèm tài liệu giới thiệu sản phẩm để các đối tác tiềm năng tải về nghiên cứu.' },
      { title: 'Ghi Nhận Đóng Góp & Danh Hiệu Khen Thưởng', desc: 'Lưu trữ các kỷ niệm chương, giải thưởng doanh nhân tiêu biểu đã được hiệp hội vinh danh.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 08',
    title: 'Danh Bạ Hội Viên CLB CEO 1983 & Tra Cứu Đối Tác Đa Ngành Nghề',
    subtitle: 'Kết nối trực tiếp hơn 500+ Chủ tịch và Tổng Giám Đốc sinh năm 1983',
    img: 'app1983_03_members_directory.png',
    badge: 'Danh bạ hội viên',
    features: [
      { title: 'Mạng Lưới Lãnh Đạo Đồng Niên 1983', desc: 'Cộng đồng các nhà sáng lập cùng thế hệ, thấu hiểu tư duy và chia sẻ chung khát vọng phát triển.' },
      { title: 'Bộ Lọc Đa Chiều Theo Ngành Nghề', desc: 'Tìm kiếm đối tác theo lĩnh vực: Xây dựng, Công nghệ, Y tế, Nông nghiệp, Tài chính, Bất động sản.' },
      { title: 'Hồ Sơ Năng Lực Doanh Nghiệp 360°', desc: 'Xem quy mô công ty, mã số thuế, website và các sản phẩm dịch vụ chủ lực của thành viên.' },
      { title: 'Gửi Lời Mời Kết Nối Giao Thương 2 Chiều', desc: 'Thiết lập mối quan hệ đối tác bền vững chỉ bằng nút Kết nối trên ứng dụng.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 09',
    title: 'Xem Chi Tiết Hồ Sơ Năng Lực Đối Tác & Kết Nối Hợp Tác',
    subtitle: 'Nắm bắt trọn vẹn thông tin đối tác trước khi tiến hành đàm phán kinh doanh',
    img: 'app_step_08_member_profile_modal.png',
    badge: 'Chi tiết đối tác',
    features: [
      { title: 'Xem Đầy Đủ Thông Tin Liên Lạc', desc: 'Tra cứu nhanh số điện thoại di động, hòm thư điện tử, địa chỉ văn phòng của chủ doanh nghiệp.' },
      { title: 'Mở Phòng Chat Giao Thương Trực Tiếp', desc: 'Bấm Nhắn tin: Mở ngay cuộc trò chuyện 1-on-1 với đối tác để trao đổi nhu cầu hợp tác.' },
      { title: 'Tra Cứu Danh Mục Sản Phẩm Cung Cấp', desc: 'Xem toàn bộ các mặt hàng và dịch vụ mà công ty đối tác đang niêm yết trên Marketplace.' },
      { title: 'Lưu Thông Tin Vào Danh Bạ Điện Thoại', desc: 'Tải file danh thiếp vCard lưu thẳng vào danh bạ iPhone/Android chỉ với một cú nhấp chuột.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 10',
    title: 'Đặt Lịch Hẹn Gặp Kết Nối 1-on-1 Giữa 2 CEO Doanh Nghiệp',
    subtitle: 'Khởi tạo cuộc hẹn giao thương, chọn địa điểm quán cafe / văn phòng, đổi giờ & đồng bộ lịch',
    img: 'app1983_14_meetings_schedule.png',
    badge: 'Lịch hẹn kết nối 1-on-1: Đặt lịch, xác nhận, đổi giờ & đồng bộ Google/Apple Calendar',
    features: [
      { title: 'Khởi Tạo Cuộc Hẹn Giao Thương Trong 30s', desc: 'Chọn đối tác từ danh bạ, thiết lập ngày giờ, thời lượng và mục tiêu trao đổi kinh doanh.' },
      { title: 'Đề Xuất Địa Điểm Gặp Gỡ Linh Hoạt', desc: 'Gặp trực tiếp tại văn phòng công ty, quán cafe đối tác hoặc phòng họp trực tuyến Google Meet.' },
      { title: 'Xác Nhận, Đổi Giờ Hoặc Từ Chối', desc: 'Đối tác nhận thông báo tức thì, có thể chấp nhận, đề xuất dời sang giờ khác hoặc từ chối lịch sự.' },
      { title: 'Đồng Bộ Tự Động Vào Lịch Điện Thoại', desc: 'Tích hợp 1 chạm với Google Calendar, Apple Calendar và gửi thông báo nhắc hẹn trước 1 giờ.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 11',
    title: 'Hộp Thư Doanh Nghiệp, Chat 1-1 & Nhóm Chat 6 Ban Realtime',
    subtitle: 'Trao đổi cơ hội hợp tác, gửi tài liệu báo giá, vị trí và nhận thông báo [CEO1983_SYSTEM]',
    img: 'app_step_10_chat_conversation.png',
    badge: 'Màn hình chat 1-on-1 & nhóm realtime qua WebSocket',
    features: [
      { title: 'Trò Chuyện Realtime 1-on-1 & Nhóm 6 Ban', desc: 'Nhắn tin tốc độ cao giữa hai lãnh đạo hoặc tham gia trao đổi trong nhóm chat ban chuyên môn.' },
      { title: 'Đính Kèm Báo Giá, Hợp Đồng & Hình Ảnh', desc: 'Gửi file PDF hợp đồng, ảnh chụp sản phẩm mẫu, catalog và vị trí định vị cuộc hẹn trong chat.' },
      { title: 'Trạng Thái Đang Gõ & Đã Xem (Seen)', desc: 'Hiển thị trạng thái tin nhắn tức thời, đảm bảo thông tin trao đổi công việc phản hồi nhanh chóng.' },
      { title: 'Nhận Tin Nhắn Triệu Tập [CEO1983_SYSTEM]', desc: 'Tự động nhận tin nhắn push thông báo triệu tập họp, duyệt hồ sơ và kết nối từ hệ thống quản trị.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 12',
    title: 'Lịch Sự Kiện, Diễn Đàn Doanh Nhân & Đăng Ký Vé Tham Dự',
    subtitle: 'Không bỏ lỡ các kỳ Đại hội, Caravan kết nối kinh doanh và Gala thường niên',
    img: 'app_step_11_events_list.png',
    badge: 'Lịch sự kiện',
    features: [
      { title: 'Lịch Trình Chi Tiết Các Hoạt Động CLB', desc: 'Nắm bắt thời gian, địa điểm tổ chức, nội dung chương trình và diễn giả của từng sự kiện.' },
      { title: 'Đặc Quyền Vé Miễn Phí Dành Cho Hội Viên', desc: 'Hội viên chính thức được miễn phí vé tham dự hoặc nhận mức giá ưu đãi đặc biệt.' },
      { title: 'Thanh Toán Vé Đại Biểu Qua VietQR', desc: 'Đối với vé có thu phí, hệ thống cung cấp mã QR chuyển khoản chính xác tới từng đồng.' },
      { title: 'Đồng Bộ Lịch Hẹn Vào Google Calendar', desc: 'Tự động thêm sự kiện vào lịch cá nhân trên điện thoại kèm nhắc nhở trước 24 giờ.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 13',
    title: 'Đăng Ký Sự Kiện, Chọn Chỗ Khán Phòng VIP & Vé Điện Tử E-Ticket',
    subtitle: 'Form đăng ký thông minh, vé VIP 0đ, phụ thu vé đối tác VietQR và lưu trữ vé số offline',
    img: 'app_step_12_event_detail_modal.png',
    badge: 'Trải nghiệm sự kiện 4.0: Chọn ghế trực quan, vé điện tử QR lưu trữ trên máy & Lucky Draw',
    features: [
      { title: 'Form Đăng Ký Vé VIP 0đ & Vé Phụ Thu', desc: 'Đăng ký suất tham dự miễn phí cho hội viên; đăng ký thêm vé đối tác đi cùng thanh toán VietQR.' },
      { title: 'Sơ Đồ Chọn Ghế Khán Phòng Trực Quan', desc: 'Chạm chọn vị trí ghế ngồi và bàn tiệc trực tiếp trên sơ đồ rạp Cinema Seating Map trên mobile.' },
      { title: 'Ví Vé Điện Tử Offline Kèm Mã QR Động', desc: 'Vé lưu trực tiếp trong máy, hiển thị họ tên, số bàn tiệc, mã may mắn và check-in không cần mạng.' },
      { title: 'Tự Động Đưa Vào Danh Sách Lucky Draw', desc: 'Mã vé check-in hợp lệ được đồng bộ tự động vào vòng quay may mắn trúng xe VinFast VF3 đêm Gala.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 14',
    title: 'Vé Điện Tử Thông Minh & Quét Mã QR Check-in Siêu Tốc 1s',
    subtitle: 'Không lo quên vé giấy, kiểm soát lối vào hội trường chỉ với 1 thao tác quét',
    img: 'app_step_13_ticket_qr_pass.png',
    badge: 'Vé điện tử QR Pass',
    features: [
      { title: 'Tích Hợp Mã QR Động Chống Gian Lận', desc: 'Mã QR được mã hóa theo phiên làm việc, ngăn chặn triệt để hành vi chụp ảnh màn hình chuyển tiếp.' },
      { title: 'Hiển Thị Vị Trí Số Ghế Bàn Tiệc VIP', desc: 'Biết trước chính xác số bàn và vị trí ghế ngồi được Ban Tổ Chức sắp đặt trang trọng.' },
      { title: 'Tốc Độ Quét Cổng Chỉ 1 Giây', desc: 'Đưa màn hình trước máy quét tại bàn lễ tân để hoàn tất thủ tục check-in trong tích tắc.' },
      { title: 'Lưu Trữ Lịch Sử Tham Dự Sự Kiện', desc: 'Xem lại toàn bộ các kỳ đại hội và sự kiện mà doanh nhân đã đồng hành cùng hiệp hội.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 15',
    title: 'Bầu Cử BCH & Biểu Quyết Tín Nhiệm Trực Tuyến Trên App',
    subtitle: 'Thực thi quyền dân chủ đại hội minh bạch, bảo mật tuyệt đối với giao diện trực quan',
    img: 'app_voting_mobile_view.png',
    badge: 'Giao diện bầu cử tín nhiệm trên Mobile App',
    features: [
      { title: 'Bỏ Phiếu Tín Nhiệm Đại Biểu Trực Tiếp', desc: 'Bầu cử Ban Chấp Hành nhiệm kỳ mới ngay trên màn hình điện thoại với danh sách ứng viên minh bạch.' },
      { title: 'Mã Hóa Phiếu Bầu Chống Gian Lận', desc: 'Mỗi hội viên chỉ được bỏ phiếu một lần duy nhất, kết quả được mã hóa bảo mật danh tính người bầu.' },
      { title: 'Xem Chi Tiết Hồ Sơ & Chương Trình Hành Động', desc: 'Chạm vào tên ứng viên để xem quá trình cống hiến, doanh nghiệp và cam kết hành động trước khi vote.' },
      { title: 'Cập Nhật Tiến Độ Kiểm Phiếu Tức Thì', desc: 'Theo dõi tỷ lệ phần trăm cử tri đã tham gia bỏ phiếu theo thời gian thực trên màn hình ứng dụng.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 16',
    title: 'Vòng Quay May Mắn Lucky Draw & Nhận Quà Tức Thì',
    subtitle: 'Khuấy động không khí Gala Dinner: Đồng bộ kết quả trúng thưởng may mắn xuống điện thoại',
    img: 'app_lucky_draw_winner_notification.png',
    badge: 'Thông báo trúng giải Lucky Draw đêm tiệc Gala',
    features: [
      { title: 'Quay Số May Mắn Theo Mã Vé Check-in', desc: 'Toàn bộ hội viên đã check-in vào sự kiện được tự động đưa vào danh sách quay số trúng thưởng.' },
      { title: 'Giải Thưởng Đỉnh Cao VinFast VF3', desc: 'Hồi hộp theo dõi các vòng quay giải Đặc biệt, giải Nhất với quà tặng giá trị cao từ nhà tài trợ.' },
      { title: 'Thông Báo Push Trực Tiếp Tới Điện Thoại', desc: 'Hệ thống gửi thông báo chúc mừng đích danh hội viên trúng giải ngay trên màn hình ứng dụng.' },
      { title: 'Hiển Thị Thông Tin Lên Sân Khấu Vinh Danh', desc: 'Doanh nhân mang thông báo trên điện thoại lên sân khấu chính nhận quà vinh danh từ Ban Tổ Chức.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 17',
    title: 'Sàn Thương Mại Marketplace & Gian Hàng Doanh Nghiệp',
    subtitle: 'Kênh giới thiệu sản phẩm và dịch vụ uy tín với chính sách ưu đãi nội bộ',
    img: 'live_28_app_marketplace_b2b.png',
    badge: 'Sàn Marketplace B2B',
    features: [
      { title: 'Gian Hàng Số Hóa Cho Từng Doanh Nghiệp', desc: 'Mỗi doanh nghiệp hội viên được sở hữu gian hàng trưng bày sản phẩm sản xuất và dịch vụ chủ lực.' },
      { title: 'Chính Sách Chiết Khấu Ưu Đãi VIP', desc: 'Cam kết mức giá ưu đãi đặc quyền giữa các thành viên CEO 1983 so với giá thị trường bên ngoài.' },
      { title: 'Đã Kiểm Duyệt An Toàn Từ Web CRM', desc: 'Toàn bộ mặt hàng đều qua thẩm định xuất xứ và tiêu chuẩn chất lượng từ Ban Quản Trị CLB.' },
      { title: 'Yêu Cầu Báo Giá Sỉ & Hợp Đồng 1-Chạm', desc: 'Doanh nhân gửi yêu cầu báo giá khối lượng lớn trực tiếp tới giám đốc kinh doanh đối tác.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 18',
    title: 'Sàn Trao Cơ Hội Giao Thương B2B & Tìm Kiếm Đối Tác',
    subtitle: 'Chia sẻ nhu cầu mua sỉ, bán buôn, cung ứng vật tư và kêu gọi vốn đầu tư',
    img: 'live_29_app_opportunities_feed_1on1.png',
    badge: 'Cơ hội giao thương B2B',
    features: [
      { title: 'Bảng Tin Trao Đổi Cơ Hội Độc Quyền', desc: 'Nơi doanh nhân công khai nhu cầu mua sắm thiết bị, tìm đại lý phân phối hoặc kết nối chuỗi cung ứng.' },
      { title: 'Khu Vực Cơ Hội Tiêu Điểm Xoay Vòng 2s', desc: 'Hiệu ứng chuyển đổi cơ hội nổi bật mỗi 2 giây thu hút sự chú ý tối đa của toàn thể hội viên.' },
      { title: 'Đón Nhận Cơ Hội (Claim Deal) Nhanh Chóng', desc: 'Nhấn Đón nhận cơ hội để nhận thông tin liên lạc trực tiếp của doanh nhân có nhu cầu.' },
      { title: 'Thống Kê Tổng Giá Trị Giao Thương Đạt Được', desc: 'Ghi nhận thành quả kết nối, vinh danh các doanh nhân tích cực trao cơ hội cho đồng đội.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 19',
    title: 'Cổng Đóng Hội Phí Thường Niên & Quét Mã VietQR Tự Động',
    subtitle: 'Gia hạn thẻ hội viên trong 30 giây, đối soát tự động không cần gửi hóa đơn',
    img: 'app1983_09_fees_vietqr.png',
    badge: 'Đóng hội phí VietQR',
    features: [
      { title: 'Minh Bạch Niên Độ & Hạn Nộp Hội Phí', desc: 'Thông báo rõ ràng số tiền hội phí thường niên, thời hạn gia hạn và quyền lợi duy trì sinh hoạt trong năm.' },
      { title: 'Mã QR Động Chính Xác Tuyệt Đối', desc: 'Mã VietQR tự động điền số tiền và cú pháp chuyển khoản chính xác tới từng ký tự.' },
      { title: 'Gạch Nợ Tự Động Sau 3-5 Giây', desc: 'Ngay khi chuyển khoản thành công, hệ thống tự động gạch nợ và gia hạn hạn dùng thẻ số trên App.' },
      { title: 'Nhận Phiếu Thu Điện Tử Về Hòm Thư', desc: 'Biên lai xác nhận đóng hội phí có chữ ký số được gửi tự động về email doanh nghiệp lưu trữ.' }
    ]
  },
  {
    eyebrow: 'CHỨC NĂNG HỘI VIÊN 20',
    title: 'Cài Đặt Quyền Riêng Tư Thẻ Số & Bảo Mật 2 Lớp',
    subtitle: 'Chủ động quản lý dữ liệu cá nhân, quyền riêng tư liên hệ và bảo vệ thông tin C-Level',
    img: 'app_card_privacy_settings.png',
    badge: 'Cài đặt quyền riêng tư & bảo mật thẻ số',
    features: [
      { title: 'Bật/Tắt Hiển Thị Số Điện Thoại Cá Nhân', desc: 'Chủ động lựa chọn hiển thị số di động hoặc chỉ hiển thị qua kênh tổng đài công ty khi đối tác quét thẻ.' },
      { title: 'Ẩn/Hiện Email & Trụ Sở Doanh Nghiệp', desc: 'Tùy biến các trường thông tin hiển thị trên trang xác thực công khai theo từng thời kỳ.' },
      { title: 'Bảo Vệ Đổi Mật Khẩu 2 Lớp', desc: 'Mọi thay đổi thông tin trọng yếu đều yêu cầu xác thực bảo mật trước khi cập nhật vào CSDL.' },
      { title: 'Đồng Bộ Bảo Mật Toàn Hệ Sinh Thái', desc: 'Cài đặt riêng tư có hiệu lực ngay lập tức trên Thẻ 3D Titanium, Danh thiếp NFC và Danh bạ hội viên.' }
    ]
  }
];

// =============================================================================
// BUILD CRM PPTX
// =============================================================================
async function generateCrmPptx() {
  console.log('>>> Khởi tạo Slide Thuyết Trình CRM (SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.pptx) - 100% Trắng Xanh...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'Thuyết Trình Hệ Thống CRM Quản Trị & Vận Hành - CLB Doanh Nhân CEO 1983';
  pres.author = 'Ban Thư Ký CLB Doanh Nhân CEO 1983';
  pres.company = 'CLB Doanh Nhân CEO 1983 · HanoiBA';

  const SYS = 'Hệ Thống CRM Quản Trị';

  // SLIDE 1: COVER
  {
    const slide = pres.addSlide();
    slide.background = { color: CRM_THEME.BG_WHITE };
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.15, fill: { color: CRM_THEME.NAVY_PRIMARY } });

    slide.addShape(pres.ShapeType.rect, {
      x: 2.0, y: 1.0, w: 9.33, h: 0.48,
      fill: { color: CRM_THEME.BLUE_LIGHT }, line: { color: CRM_THEME.BLUE_BORDER, width: 1.5 }, roundRadio: 0.1
    });
    slide.addText('CLB DOANH NHÂN CEO 1983 · HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)', {
      x: 2.0, y: 1.0, w: 9.33, h: 0.48,
      color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('HỆ THỐNG WEB CRM QUẢN TRỊ & ĐIỀU HÀNH SỐ HÓA', {
      x: 1.0, y: 1.85, w: 11.33, h: 1.1,
      color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 34, align: 'center', fontFace: 'Calibri'
    });

    slide.addShape(pres.ShapeType.rect, { x: 5.4, y: 3.1, w: 2.53, h: 0.05, fill: { color: CRM_THEME.BLUE_ACCENT } });

    slide.addText('BÁO CÁO TOÀN DIỆN GIẢI PHÁP CHUYỂN ĐỔI SỐ HIỆP HỘI CLB DOANH NHÂN CEO 1983', {
      x: 1.0, y: 3.3, w: 11.33, h: 0.5,
      color: CRM_THEME.BLUE_ACCENT, bold: true, fontSize: 15, align: 'center', fontFace: 'Calibri'
    });
    slide.addText('Trung Tâm Chỉ Huy: Hồ Sơ Hội Viên 360° · Tài Chính VietQR · Sơ Đồ Khán Phòng Sự Kiện · Biểu Quyết & Lucky Draw', {
      x: 1.0, y: 3.85, w: 11.33, h: 0.45,
      color: CRM_THEME.TEXT_MUTED, fontSize: 12.5, italic: true, align: 'center', fontFace: 'Calibri'
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 2.2, y: 4.65, w: 8.93, h: 1.8,
      fill: { color: CRM_THEME.BG_WHITE }, line: { color: CRM_THEME.BLUE_BORDER, width: 1.5 }, roundRadio: 0.12
    });
    slide.addShape(pres.ShapeType.rect, { x: 2.2, y: 4.65, w: 0.15, h: 1.8, fill: { color: CRM_THEME.NAVY_PRIMARY } });

    slide.addText([
      { text: 'Đơn Vị Chủ Quản: ', options: { bold: true, color: CRM_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Ban Quản Trị & Ban Thư Ký CLB Doanh Nhân CEO 1983 (Trực thuộc HanoiBA)\n', options: { color: CRM_THEME.TEXT_BODY, fontSize: 12 } },
      { text: 'Chuyên Viên Phụ Trách: ', options: { bold: true, color: CRM_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Phạm Văn Vũ  |  ', options: { color: CRM_THEME.TEXT_BODY, fontSize: 12 } },
      { text: 'Nền Tảng: ', options: { bold: true, color: CRM_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Web CRM Cloud Enterprise 2.0\n', options: { color: CRM_THEME.TEXT_BODY, fontSize: 12 } },
      { text: 'Thời Gian: ', options: { bold: true, color: CRM_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Tháng 10/2026  ·  Hà Nội, Việt Nam', options: { color: CRM_THEME.TEXT_MUTED, fontSize: 12 } }
    ], {
      x: 2.5, y: 4.8, w: 8.33, h: 1.5, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('Bản Quyền © 2026 CLB Doanh Nhân CEO 1983 · Hệ Thống Quản Trị Trắng Xanh Chuẩn Mực', {
      x: 1.0, y: 6.85, w: 11.33, h: 0.35, color: CRM_THEME.TEXT_MUTED, fontSize: 10, align: 'center', fontFace: 'Calibri'
    });
  }

  // SLIDE 2: TỔNG QUAN HỆ THỐNG
  {
    const slide = pres.addSlide();
    addCrmSlideHeader(slide, pres, 'TRUNG TÂM ĐIỀU HÀNH & QUẢN TRỊ SỐ HÓA HIỆP HỘI', 'TỔNG QUAN HỆ THỐNG: 4 TRỤ CỘT ĐIỀU HÀNH SỐ HÓA', 'Kiểm Soát Toàn Diện: Hồ Sơ Hội Viên · Quỹ Hội VietQR · Bầu Cử & Lucky Draw · Sàn B2B');
    const pillars = [
      { num: '01', title: 'Quản Trị Hội Viên 360°', desc: 'Thẩm định hồ sơ trực tuyến, phân bổ ban bệ và tự động cấp thông tin tài khoản qua email tức thì.' },
      { num: '02', title: 'Tài Chính & Đối Soát VietQR', desc: 'Theo dõi hội phí thường niên, gạch nợ hội phí tự động qua mã VietQR và minh bạch thu chi ngân quỹ.' },
      { num: '03', title: 'Sự Kiện, Bầu Cử & Lucky Draw', desc: 'Khởi tạo vé đa tầng, sắp đặt sơ đồ khán phòng VIP, bỏ phiếu đại hội và quay số VinFast VF3.' },
      { num: '04', title: 'Đồng Bộ Hai Chiều Realtime', desc: 'Tách biệt chuyên sâu cho Ban Quản Trị nhưng liên kết 100% dữ liệu xuống Mobile App của hội viên.' },
    ];
    pillars.forEach((p, idx) => {
      const x = 1.0 + idx * 2.9;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 2.7, h: 4.6, fill: { color: CRM_THEME.BG_WHITE }, line: { color: CRM_THEME.BLUE_BORDER, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: x, y: 2.1, w: 2.7, h: 0.08, fill: { color: CRM_THEME.NAVY_PRIMARY } });
      slide.addText(p.num, { x: x + 0.2, y: 2.4, w: 0.8, h: 0.4, color: CRM_THEME.BLUE_ACCENT, bold: true, fontSize: 22, fontFace: 'Calibri' });
      slide.addText(p.title, { x: x + 0.2, y: 2.9, w: 2.3, h: 0.6, color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
      slide.addText(p.desc, { x: x + 0.2, y: 3.6, w: 2.3, h: 2.8, color: CRM_THEME.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri' });
    });
    addCrmSlideFooter(slide, pres, SYS);
  }

  // ADD TẤT CẢ 16 FEATURE SLIDES CRM
  CRM_FEATURE_SLIDES.forEach(s => {
    addCrmFeatureSlide(pres, { eyebrow: s.eyebrow, title: s.title, subtitle: s.subtitle }, s.img, s.badge, s.features, SYS);
  });

  // SLIDE: ƯU ĐIỂM VƯỢT TRỘI
  {
    const slide = pres.addSlide();
    addCrmSlideHeader(slide, pres, 'ƯU ĐIỂM VƯỢT TRỘI', 'Giá Trị Cốt Lõi & Hiệu Quả Đột Phá Cho Ban Lãnh Đạo', 'Tối ưu hóa nguồn lực, bảo vệ dữ liệu và nâng cao năng lực quản trị hiệp hội');
    const advs = [
      { num: '01', title: 'Tiết Kiệm 90% Thời Gian Thủ Công', desc: 'Tự động hóa hoàn toàn việc tiếp nhận hồ sơ, gửi email mật khẩu, xuất danh sách đại biểu và gạch nợ hội phí.' },
      { num: '02', title: 'Minh Bạch Tài Chính Tuyệt Đối', desc: 'Mọi dòng tiền thu chi đều được đối soát khớp lệnh qua mã VietQR và lưu vết trong sổ quỹ điện tử.' },
      { num: '03', title: 'Kế Thừa Dữ Liệu Bất Biến', desc: 'Toàn bộ danh bạ hội viên, kỷ yếu sự kiện và lịch sử giao thương được lưu trữ trên hạ tầng bảo mật.' },
      { num: '04', title: 'Độ Tin Cậy & Sẵn Sàng 99.9%', desc: 'Kiến trúc máy chủ hiệu năng cao, phản hồi dưới 100ms và cơ chế tự động khôi phục sự cố thông suốt.' }
    ];
    advs.forEach((a, idx) => {
      const xPos = 0.8 + idx * 2.95;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 2.1, w: 2.8, h: 4.6, fill: { color: CRM_THEME.BG_WHITE }, line: { color: CRM_THEME.BLUE_BORDER, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: xPos, y: 2.1, w: 2.8, h: 0.1, fill: { color: CRM_THEME.NAVY_PRIMARY } });
      slide.addText(a.num, { x: xPos + 0.25, y: 2.35, w: 0.8, h: 0.4, color: CRM_THEME.BLUE_ACCENT, bold: true, fontSize: 22, fontFace: 'Calibri' });
      slide.addText(a.title, { x: xPos + 0.25, y: 2.85, w: 2.3, h: 0.65, color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
      slide.addText(a.desc, { x: xPos + 0.25, y: 3.6, w: 2.3, h: 2.9, color: CRM_THEME.TEXT_BODY, fontSize: 11, fontFace: 'Calibri' });
    });
    addCrmSlideFooter(slide, pres, SYS);
  }

  // SLIDE: LỘ TRÌNH PHÁT TRIỂN
  {
    const slide = pres.addSlide();
    addCrmSlideHeader(slide, pres, 'HƯỚNG PHÁT TRIỂN TƯƠNG LAI', 'Lộ Trình Nâng Cấp Hệ Thống CRM Quản Trị Giai Đoạn 2026 - 2028', 'Tích hợp Trí tuệ nhân tạo và mở rộng liên minh giao thương hiệp hội toàn quốc');
    const roadmaps = [
      { phase: 'GIAI ĐOẠN 1 (ĐÃ HOÀN THÀNH)', title: 'Chuẩn Hóa Nền Tảng Quản Trị Số', desc: 'Số hóa 100% hồ sơ hội viên, tự động hóa duyệt tài khoản, sơ đồ khán phòng VIP, cổng soát vé QR 1s và VietQR.' },
      { phase: 'GIAI ĐOẠN 2 (QUÝ 3 - QUÝ 4/2026)', title: 'Tích Hợp AI Matching & Trợ Lý Ảo', desc: 'Thuật toán AI tự động gợi ý kết nối cung - cầu giữa các doanh nghiệp theo lĩnh vực; AI tóm tắt biên bản họp BCH.' },
      { phase: 'GIAI ĐOẠN 3 (NĂM 2027)', title: 'Hệ Thống Phân Tích Dữ Liệu Lớn (BI)', desc: 'Báo cáo thông minh dự báo xu hướng dòng tiền quỹ hội, đo lường chỉ số gắn kết của từng thành viên.' },
      { phase: 'GIAI ĐOẠN 4 (NĂM 2028)', title: 'Liên Minh Số Hiệp Hội Toàn Quốc', desc: 'Mở rộng liên kết cơ sở dữ liệu với Hội Doanh Nhân Trẻ các tỉnh thành và các tổ chức xúc tiến quốc tế.' }
    ];
    roadmaps.forEach((r, idx) => {
      const xPos = 0.8 + idx * 2.95;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 2.1, w: 2.8, h: 4.6, fill: { color: CRM_THEME.BG_WHITE }, line: { color: CRM_THEME.BLUE_BORDER, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: xPos, y: 2.1, w: 2.8, h: 0.1, fill: { color: CRM_THEME.BLUE_ACCENT } });
      slide.addShape(pres.ShapeType.rect, {
        x: xPos + 0.2, y: 2.3, w: 2.4, h: 0.28, fill: { color: CRM_THEME.BLUE_LIGHT }, roundRadio: 0.05
      });
      slide.addText(r.phase, {
        x: xPos + 0.2, y: 2.3, w: 2.4, h: 0.28, color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 8.5, align: 'center', valign: 'middle', fontFace: 'Calibri'
      });
      slide.addText(r.title, { x: xPos + 0.2, y: 2.75, w: 2.4, h: 0.65, color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 12.5, fontFace: 'Calibri' });
      slide.addText(r.desc, { x: xPos + 0.2, y: 3.55, w: 2.4, h: 2.9, color: CRM_THEME.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri' });
    });
    addCrmSlideFooter(slide, pres, SYS);
  }

  // SLIDE: TỔNG KẾT
  {
    const slide = pres.addSlide();
    addCrmSlideHeader(slide, pres, 'KHẲNG ĐỊNH NĂNG LỰC QUẢN TRỊ SỐ', 'TỔNG KẾT & CAM KẾT CHẤT LƯỢNG HỆ THỐNG', 'Giải pháp số hóa toàn diện vì sự phát triển bền vững của CLB Doanh Nhân CEO 1983');
    const cols = [
      { t: 'Độc Lập & Bảo Mật Tuyệt Đối', d: 'Hạ tầng máy chủ chuyên dụng, phân quyền 6 ban nghiêm ngặt, dữ liệu được bảo vệ an toàn và bảo mật 100%.' },
      { t: 'Tự Động Hóa Vận Hành Toàn Diện', d: 'Từ tiếp nhận hồ sơ, gạch nợ hội phí VietQR, soát vé QR tại chỗ đến báo cáo kiểm phiếu đại hội đều tự động.' },
      { t: 'Sẵn Sàng Cho Tương Lai Số Hóa', d: 'Khả năng mở rộng không giới hạn, sẵn sàng kết nối API với các hệ thống tài chính, thuế và sàn giao thương.' }
    ];
    cols.forEach((c, idx) => {
      const xPos = 0.8 + idx * 3.95;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 2.1, w: 3.8, h: 4.6, fill: { color: CRM_THEME.BG_WHITE }, line: { color: CRM_THEME.BLUE_BORDER, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: xPos, y: 2.1, w: 3.8, h: 0.1, fill: { color: CRM_THEME.NAVY_PRIMARY } });
      slide.addText(c.t, { x: xPos + 0.3, y: 2.5, w: 3.2, h: 0.6, color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 15, fontFace: 'Calibri' });
      slide.addText(c.d, { x: xPos + 0.3, y: 3.3, w: 3.2, h: 3.0, color: CRM_THEME.TEXT_BODY, fontSize: 12, fontFace: 'Calibri' });
    });
    addCrmSlideFooter(slide, pres, SYS);
  }

  // SLIDE: THANK YOU
  {
    const slide = pres.addSlide();
    slide.background = { color: CRM_THEME.BG_WHITE };
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.15, fill: { color: CRM_THEME.NAVY_PRIMARY } });

    slide.addShape(pres.ShapeType.rect, {
      x: 3.5, y: 0.8, w: 6.33, h: 0.42,
      fill: { color: CRM_THEME.BLUE_LIGHT }, line: { color: CRM_THEME.BLUE_BORDER, width: 1 }, roundRadio: 0.08
    });
    slide.addText('HỆ THỐNG WEB CRM QUẢN TRỊ & ĐIỀU HÀNH SỐ HÓA', {
      x: 3.5, y: 0.8, w: 6.33, h: 0.42,
      color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 11, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('XIN TRÂN TRỌNG CẢM ƠN!', {
      x: 1.0, y: 1.5, w: 11.33, h: 0.9,
      color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 36, align: 'center', fontFace: 'Calibri'
    });
    slide.addText('Kính Chúc Quý Ban Lãnh Đạo Sức Khỏe, Hạnh Phúc & Điều Hành Hiệp Hội Thành Công', {
      x: 1.0, y: 2.45, w: 11.33, h: 0.45,
      color: CRM_THEME.NAVY_PRIMARY, fontSize: 14, align: 'center', fontFace: 'Calibri'
    });
    slide.addText('"GẮN KẾT CHÂN TÌNH · HỢP TÁC TIN CẬY · PHÁT TRIỂN THỊNH VƯỢNG"', {
      x: 1.0, y: 2.95, w: 11.33, h: 0.45,
      color: CRM_THEME.BLUE_ACCENT, bold: true, fontSize: 13, align: 'center', fontFace: 'Calibri'
    });

    const infoCards = [
      { icon: '🌐', title: 'TRUY CẬP HỆ THỐNG', sub: 'Cổng Quản Trị Trực Tuyến', desc: 'Hệ thống vận hành trên nền tảng Web bảo mật cao, tương thích mọi trình duyệt và máy trạm.' },
      { icon: '📞', title: 'HỖ TRỢ KỸ THUẬT', sub: 'Đội Ngũ Kỹ Thuật 24/7', desc: 'Sẵn sàng giải đáp thắc mắc, hướng dẫn thao tác phân quyền, duyệt hồ sơ và xử lý sự cố.' },
      { icon: '🏛️', title: 'BAN THƯ KÝ CLB', sub: 'Văn Phòng Thường Trực', desc: 'Hội Doanh Nhân Trẻ Hà Nội (HanoiBA) - Câu Lạc Bộ Doanh Nhân CEO 1983.' }
    ];
    infoCards.forEach((c, idx) => {
      const xPos = 1.0 + idx * 3.9;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 3.65, w: 3.6, h: 2.8, fill: { color: CRM_THEME.BG_WHITE }, line: { color: CRM_THEME.BLUE_BORDER, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: xPos, y: 3.65, w: 3.6, h: 0.08, fill: { color: CRM_THEME.NAVY_PRIMARY } });
      slide.addText(c.icon, { x: xPos + 0.3, y: 3.85, w: 3.0, h: 0.5, fontSize: 24, fontFace: 'Calibri' });
      slide.addText(c.title, { x: xPos + 0.3, y: 4.4, w: 3.0, h: 0.4, color: CRM_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
      slide.addText(c.sub, { x: xPos + 0.3, y: 4.8, w: 3.0, h: 0.3, color: CRM_THEME.BLUE_ACCENT, bold: true, fontSize: 10.5, fontFace: 'Calibri' });
      slide.addText(c.desc, { x: xPos + 0.3, y: 5.2, w: 3.0, h: 1.0, color: CRM_THEME.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri' });
    });

    slide.addText('Hệ Thống Web CRM Quản Trị & Vận Hành · CLB Doanh Nhân CEO 1983 · HanoiBA', {
      x: 1.0, y: 6.85, w: 11.33, h: 0.3, color: CRM_THEME.TEXT_MUTED, fontSize: 10.5, align: 'center', fontFace: 'Calibri'
    });
  }

  const outPptx = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.pptx');
  let actualTarget = outPptx;
  try {
    await pres.writeFile({ fileName: outPptx });
  } catch (err) {
    if (err.code === 'EBUSY') {
      actualTarget = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983_MOI.pptx');
      await pres.writeFile({ fileName: actualTarget });
    } else {
      throw err;
    }
  }

  for (const dir of [DOCS_DIR, CEO_FE_DOCS_DIR]) {
    try {
      fs.copyFileSync(actualTarget, path.join(dir, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.pptx'));
    } catch (e) {
      if (e.code === 'EBUSY') {
        fs.copyFileSync(actualTarget, path.join(dir, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983_MOI.pptx'));
      }
    }
  }
  console.log(`✓ Đã tạo PPTX CRM thành công: ${actualTarget} (${(fs.statSync(actualTarget).size / 1024).toFixed(1)} KB)`);
}

// =============================================================================
// BUILD APP PPTX
// =============================================================================
async function generateAppPptx() {
  console.log('>>> Khởi tạo Slide Thuyết Trình App Hiệp Hội (SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.pptx)...');
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'Thuyết Trình Ứng Dụng Di Động Hiệp Hội - CLB Doanh Nhân CEO 1983';
  pres.author = 'Ban Thư Ký CLB Doanh Nhân CEO 1983';
  pres.company = 'CLB Doanh Nhân CEO 1983 · HanoiBA';

  const SYS = 'Ứng Dụng Di Động Hiệp Hội';

  // SLIDE 1: COVER
  {
    const slide = pres.addSlide();
    slide.background = { color: APP_THEME.BG_WHITE };
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 11.33, h: 0.15, fill: { color: APP_THEME.NAVY_PRIMARY } });
    slide.addShape(pres.ShapeType.rect, { x: 11.33, y: 0, w: 2.0, h: 0.15, fill: { color: APP_THEME.GOLD_ACCENT } });

    slide.addShape(pres.ShapeType.rect, {
      x: 2.0, y: 1.0, w: 9.33, h: 0.48,
      fill: { color: APP_THEME.NAVY_PRIMARY }, line: { color: APP_THEME.GOLD_ACCENT, width: 1.5 }, roundRadio: 0.1
    });
    slide.addText('CLB DOANH NHÂN CEO 1983 · HỘI DOANH NHÂN TRẺ HÀ NỘI (HANOIBA)', {
      x: 2.0, y: 1.0, w: 9.33, h: 0.48,
      color: APP_THEME.BG_WHITE, bold: true, fontSize: 13, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('ỨNG DỤNG DI ĐỘNG HỘI VIÊN CEO 1983', {
      x: 1.0, y: 1.85, w: 11.33, h: 1.1,
      color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 34, align: 'center', fontFace: 'Calibri'
    });

    slide.addShape(pres.ShapeType.rect, { x: 5.4, y: 3.1, w: 2.53, h: 0.05, fill: { color: APP_THEME.GOLD_ACCENT } });

    slide.addText('NỀN TẢNG KẾT NỐI DOANH NHÂN & ĐẶC QUYỀN SỐ HÓA ĐỘC BẢN', {
      x: 1.0, y: 3.3, w: 11.33, h: 0.5,
      color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 15, align: 'center', fontFace: 'Calibri'
    });
    slide.addText('Thẻ Hội Viên VIP Gold · Thẻ Visit Card Số Hóa · Check-in QR Sự Kiện & Bàn VIP · Sàn Cơ Hội Giao Thương B2B', {
      x: 1.0, y: 3.85, w: 11.33, h: 0.45,
      color: APP_THEME.TEXT_MUTED, fontSize: 12.5, italic: true, align: 'center', fontFace: 'Calibri'
    });

    slide.addShape(pres.ShapeType.rect, {
      x: 2.2, y: 4.65, w: 8.93, h: 1.8,
      fill: { color: APP_THEME.BG_WHITE }, line: { color: APP_THEME.BORDER_SUBTLE, width: 1.5 }, roundRadio: 0.12
    });
    slide.addShape(pres.ShapeType.rect, { x: 2.2, y: 4.65, w: 0.15, h: 1.8, fill: { color: APP_THEME.GOLD_ACCENT } });

    slide.addText([
      { text: 'Đơn Vị Phát Triển: ', options: { bold: true, color: APP_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Ban Quản Trị & Ban Thư Ký CLB Doanh Nhân CEO 1983 (Trực thuộc HanoiBA)\n', options: { color: APP_THEME.TEXT_BODY, fontSize: 12 } },
      { text: 'Chuyên Viên Phụ Trách: ', options: { bold: true, color: APP_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Phạm Văn Vũ  |  ', options: { color: APP_THEME.TEXT_BODY, fontSize: 12 } },
      { text: 'Nền Tảng: ', options: { bold: true, color: APP_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Mobile App (iOS PWA / Android Native) 2.0\n', options: { color: APP_THEME.TEXT_BODY, fontSize: 12 } },
      { text: 'Thời Gian: ', options: { bold: true, color: APP_THEME.NAVY_PRIMARY, fontSize: 12 } },
      { text: 'Tháng 10/2026  ·  Hà Nội, Việt Nam', options: { color: APP_THEME.TEXT_MUTED, fontSize: 12 } }
    ], {
      x: 2.5, y: 4.8, w: 8.33, h: 1.5, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('Bản Quyền © 2026 CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)', {
      x: 1.0, y: 6.85, w: 11.33, h: 0.35, color: APP_THEME.TEXT_MUTED, fontSize: 10, align: 'center', fontFace: 'Calibri'
    });
  }

  // SLIDE 2: 4 TRỤ CỘT ĐẶC QUYỀN
  {
    const slide = pres.addSlide();
    addAppSlideHeader(slide, pres, 'ỨNG DỤNG DI ĐỘNG HIỆP HỘI THỜI KỲ SỐ', 'TỔNG QUAN NỀN TẢNG: 4 GIÁ TRỊ ĐẶC QUYỀN HỘI VIÊN', 'Không Gian Số Hội Viên Đẳng Cấp: Thẻ VIP Gold · Danh Thiếp Visit Card · Chạm NFC · Quét QR Công Khai');
    const pillars = [
      { num: '01', title: 'Thẻ VIP & NFC 1 Chạm', desc: 'Thẻ hội viên VIP Gold số hóa chuẩn quốc tế, tích hợp chip NFC chạm trao danh thiếp ngay trên điện thoại.' },
      { num: '02', title: 'Sàn Trao Đổi Cơ Hội B2B', desc: 'Chia sẻ nhu cầu mua bán sỉ, kết nối cung ứng và kêu gọi đầu tư trực tiếp giữa các doanh nhân.' },
      { num: '03', title: 'Sự Kiện, Vé & Bầu Cử Đại Hội', desc: 'Xem lịch đại hội, đăng ký vé VietQR, quét mã QR vào cửa 1s, bỏ phiếu BCH và quay số trúng thưởng.' },
      { num: '04', title: 'Đồng Bộ Realtime CRM', desc: 'Tách biệt giao diện chuyên dụng cho hội viên nhưng liên kết 100% dữ liệu vận hành từ Web CRM Quản trị.' },
    ];
    pillars.forEach((p, idx) => {
      const x = 1.0 + idx * 2.9;
      slide.addShape(pres.ShapeType.rect, {
        x, y: 2.1, w: 2.7, h: 4.6, fill: { color: APP_THEME.BG_WHITE }, line: { color: APP_THEME.BORDER_SUBTLE, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: x + 0.2, y: 2.25, w: 0.4, h: 0.04, fill: { color: APP_THEME.GOLD_ACCENT } });
      slide.addText(p.num, { x: x + 0.2, y: 2.35, w: 0.8, h: 0.4, color: APP_THEME.GOLD_ACCENT, bold: true, fontSize: 22, fontFace: 'Calibri' });
      slide.addText(p.title, { x: x + 0.2, y: 2.85, w: 2.3, h: 0.5, color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
      slide.addText(p.desc, { x: x + 0.2, y: 3.45, w: 2.3, h: 2.8, color: APP_THEME.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri' });
    });
    addAppSlideFooter(slide, pres, SYS);
  }

  // ADD TẤT CẢ 20 FEATURE SLIDES APP
  APP_FEATURE_SLIDES.forEach(s => {
    addAppMobileFeatureSlide(pres, { eyebrow: s.eyebrow, title: s.title, subtitle: s.subtitle }, s.img, s.badge, s.features, SYS);
  });

  // SLIDE: ƯU ĐIỂM VƯỢT TRỘI
  {
    const slide = pres.addSlide();
    addAppSlideHeader(slide, pres, 'ƯU ĐIỂM VƯỢT TRỘI', 'Giá Trị Thiết Thực & Đẳng Cấp Cho Doanh Nhân Hội Viên', 'Nâng tầm trải nghiệm cá nhân và tối ưu hóa cơ hội kinh doanh');
    const advs = [
      { num: '01', title: 'Networking Đỉnh Cao 1-Chạm', desc: 'Không cần mang danh thiếp giấy. Chạm điện thoại NFC hoặc mở mã QR là trao trọn vẹn thông tin liên hệ và hồ sơ công ty.' },
      { num: '02', title: 'Thúc Đẩy Doanh Thu B2B Thực Chất', desc: 'Sở hữu ngay gian hàng trưng bày sản phẩm ưu đãi nội khối và tiếp cận trực tiếp các nhu cầu mua sắm lớn.' },
      { num: '03', title: 'Trải Nghiệm Sự Kiện Không Chờ Đợi', desc: 'Nhận vé mời điện tử, biết trước số bàn tiệc VIP và quét mã qua cổng soát vé chỉ trong 1 giây.' },
      { num: '04', title: 'Tiện Ích Đa Nền Tảng Mượt Mà', desc: 'Vận hành hoàn hảo trên cả iPhone, điện thoại Android và trình duyệt Web PWA cập nhật tự động.' }
    ];
    advs.forEach((a, idx) => {
      const xPos = 0.8 + idx * 2.95;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 2.1, w: 2.8, h: 4.6, fill: { color: APP_THEME.BG_WHITE }, line: { color: APP_THEME.BORDER_SUBTLE, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: xPos, y: 2.1, w: 2.8, h: 0.08, fill: { color: APP_THEME.NAVY_PRIMARY } });
      slide.addText(a.num, { x: xPos + 0.25, y: 2.35, w: 0.8, h: 0.4, color: APP_THEME.GOLD_ACCENT, bold: true, fontSize: 22, fontFace: 'Calibri' });
      slide.addText(a.title, { x: xPos + 0.25, y: 2.85, w: 2.3, h: 0.65, color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
      slide.addText(a.desc, { x: xPos + 0.25, y: 3.6, w: 2.3, h: 2.9, color: APP_THEME.TEXT_BODY, fontSize: 11, fontFace: 'Calibri' });
    });
    addAppSlideFooter(slide, pres, SYS);
  }

  // SLIDE: LỘ TRÌNH VÀ CẢM ƠN
  {
    const slide = pres.addSlide();
    slide.background = { color: APP_THEME.BG_WHITE };
    slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 11.33, h: 0.15, fill: { color: APP_THEME.NAVY_PRIMARY } });
    slide.addShape(pres.ShapeType.rect, { x: 11.33, y: 0, w: 2.0, h: 0.15, fill: { color: APP_THEME.GOLD_ACCENT } });

    slide.addShape(pres.ShapeType.rect, {
      x: 3.5, y: 0.8, w: 6.33, h: 0.42,
      fill: { color: APP_THEME.BG_WHITE }, line: { color: APP_THEME.GOLD_ACCENT, width: 1.2 }, roundRadio: 0.08
    });
    slide.addText('ĐỒNG HÀNH & KẾT NỐI VƯƠN XA', {
      x: 3.5, y: 0.8, w: 6.33, h: 0.42,
      color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 11, align: 'center', valign: 'middle', fontFace: 'Calibri'
    });

    slide.addText('XIN TRÂN TRỌNG CẢM ƠN!', {
      x: 1.0, y: 1.5, w: 11.33, h: 0.9,
      color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 36, align: 'center', fontFace: 'Calibri'
    });
    slide.addText('Kính Chúc Quý Hội Viên Kết Nối Thành Công & Đón Nhận Trọn Vẹn Giá Trị Số Hóa', {
      x: 1.0, y: 2.45, w: 11.33, h: 0.45,
      color: APP_THEME.NAVY_PRIMARY, fontSize: 14, align: 'center', fontFace: 'Calibri'
    });
    slide.addText('"TIÊN PHONG CHUYỂN ĐỔI SỐ · GẮN KẾT VƯƠN XA"', {
      x: 1.0, y: 2.95, w: 11.33, h: 0.45,
      color: APP_THEME.GOLD_ACCENT, bold: true, fontSize: 13, align: 'center', fontFace: 'Calibri'
    });

    const infoCards = [
      { icon: '📱', title: 'CÀI ĐẶT ỨNG DỤNG', sub: 'Khả Dụng iOS & Android', desc: 'Trải nghiệm thẻ VIP số, chạm NFC danh thiếp thông minh và khám phá danh bạ kết nối 100+ doanh nhân.' },
      { icon: '💬', title: 'HỎI ĐÁP & CHIA SẺ', sub: 'Lắng Nghe Hội Viên', desc: 'Mọi ý kiến đóng góp của Quý Doanh nhân là động lực để Ban Thư Ký liên tục nâng cấp và tối ưu hóa.' },
      { icon: '🤝', title: 'KẾT NỐI BAN THƯ KÝ', sub: 'Hỗ Trợ Kỹ Thuật 24/7', desc: 'Hỗ trợ cấp lại mã hội viên, cài đặt thẻ visit card, chia sẻ danh bạ và tham gia 6 Ban chuyên trách.' }
    ];
    infoCards.forEach((c, idx) => {
      const xPos = 1.0 + idx * 3.9;
      slide.addShape(pres.ShapeType.rect, {
        x: xPos, y: 3.65, w: 3.6, h: 2.8, fill: { color: APP_THEME.BG_WHITE }, line: { color: APP_THEME.BORDER_SUBTLE, width: 1.2 }, roundRadio: 0.12
      });
      slide.addShape(pres.ShapeType.rect, { x: xPos, y: 3.65, w: 3.6, h: 0.08, fill: { color: APP_THEME.GOLD_ACCENT } });
      slide.addText(c.icon, { x: xPos + 0.3, y: 3.85, w: 3.0, h: 0.5, fontSize: 24, fontFace: 'Calibri' });
      slide.addText(c.title, { x: xPos + 0.3, y: 4.4, w: 3.0, h: 0.4, color: APP_THEME.NAVY_PRIMARY, bold: true, fontSize: 13, fontFace: 'Calibri' });
      slide.addText(c.sub, { x: xPos + 0.3, y: 4.8, w: 3.0, h: 0.3, color: APP_THEME.GOLD_ACCENT, bold: true, fontSize: 10.5, fontFace: 'Calibri' });
      slide.addText(c.desc, { x: xPos + 0.3, y: 5.2, w: 3.0, h: 1.0, color: APP_THEME.TEXT_BODY, fontSize: 10.5, fontFace: 'Calibri' });
    });

    slide.addText('Ứng Dụng Di Động Hội Viên · CLB Doanh Nhân CEO 1983 · HanoiBA', {
      x: 1.0, y: 6.85, w: 11.33, h: 0.3, color: APP_THEME.TEXT_MUTED, fontSize: 10.5, align: 'center', fontFace: 'Calibri'
    });
  }

  const outPptx = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.pptx');
  let actualTarget = outPptx;
  try {
    await pres.writeFile({ fileName: outPptx });
  } catch (err) {
    if (err.code === 'EBUSY') {
      actualTarget = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983_MOI.pptx');
      await pres.writeFile({ fileName: actualTarget });
    } else {
      throw err;
    }
  }

  for (const dir of [DOCS_DIR, CEO_FE_DOCS_DIR]) {
    try {
      fs.copyFileSync(actualTarget, path.join(dir, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.pptx'));
    } catch (e) {
      if (e.code === 'EBUSY') {
        fs.copyFileSync(actualTarget, path.join(dir, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983_MOI.pptx'));
      }
    }
  }
  console.log(`✓ Đã tạo PPTX App thành công: ${actualTarget} (${(fs.statSync(actualTarget).size / 1024).toFixed(1)} KB)`);
}

// =============================================================================
// BUILD INTERACTIVE HTML DECKS (CRM & APP)
// =============================================================================
function generateHtmlSlides() {
  console.log('>>> Bắt đầu tạo Slide Trình Chiếu HTML tương tác cho CRM và App...');

  function renderDeckHtml(title, sysLabel, slidesData, isApp = false) {
    const slidesHtml = slidesData.map((s, idx) => {
      let contentHtml = '';
      if (s.type === 'cover') {
        contentHtml = `
          <div class="cover-container">
            <div class="cover-badge">${s.eyebrow}</div>
            <h1 class="cover-title">${s.title}</h1>
            <p class="cover-subtitle">${s.subtitle}</p>
            <div class="pillars-grid">
              ${s.pillars.map(p => `
                <div class="pillar-card">
                  <div class="pillar-num">${p.num}</div>
                  <div class="pillar-title">${p.title}</div>
                  <div class="pillar-desc">${p.desc}</div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      } else if (s.type === 'feature') {
        const rawImg = getRawBase64(s.imgFilename);
        contentHtml = `
          <div class="slide-header">
            <span class="eyebrow-pill">${s.eyebrow}</span>
            <h2 class="slide-title">${s.title}</h2>
            <p class="slide-subtitle">${s.subtitle}</p>
          </div>
          <div class="slide-body-split">
            <div class="col-left">
              <div class="${isApp ? 'mobile-device-wrapper' : 'desktop-frame-container'}">
                <div class="${isApp ? 'mobile-screen-box' : 'desktop-screen-box'}">
                  ${rawImg ? `<img src="${rawImg}" alt="${s.title}" style="max-width:100%; max-height:100%; object-fit:contain;" />` : '<div style="color:#64748B;">[Ảnh Minh Họa]</div>'}
                </div>
                <div class="${isApp ? 'mobile-badge' : 'desktop-badge'}">${s.badgeText}</div>
              </div>
            </div>
            <div class="col-right">
              <div class="features-stack">
                ${s.features.map((f, fIdx) => `
                  <div class="feature-card ${fIdx % 2 === 0 ? 'border-accent-navy' : (isApp ? 'border-accent-gold' : 'border-accent-cyan')}">
                    <h3 class="feat-title">${f.title}</h3>
                    <p class="feat-desc">${f.desc}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }

      return `
        <div class="slide ${isApp ? 'slide-app-theme' : 'slide-crm-theme'}" id="slide-${idx}">
          <div class="slide-top-strip"></div>
          <div class="slide-content">${contentHtml}</div>
          <div class="slide-footer">
            <span>CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)  |  ${sysLabel}</span>
            <span>Trang ${idx + 1} / ${slidesData.length}</span>
          </div>
        </div>
      `;
    }).join('\n');

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; background: #0F172A; color: #334155; }
    .slide-wrapper { max-width: 1400px; margin: 0 auto; padding: 20px 0; }
    .slide {
      width: 100%; min-height: 780px; background: #FFFFFF; border-radius: 12px; margin-bottom: 24px;
      position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between;
      box-shadow: 0 10px 25px rgba(0,0,0,0.15); padding: 36px 48px;
    }
    .slide-top-strip { position: absolute; top: 0; left: 0; right: 0; height: 8px; background: ${isApp ? 'linear-gradient(90deg, #003B95 80%, #F59E0B 20%)' : '#003B95'}; }
    .slide-footer { display: flex; justify-content: space-between; font-size: 13px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 12px; margin-top: 20px; }
    .eyebrow-pill { display: inline-block; padding: 4px 12px; background: #EFF6FF; color: #003B95; border-radius: 6px; font-weight: 700; font-size: 11px; margin-bottom: 8px; border: 1px solid #BAE6FD; }
    .slide-title { font-size: 26px; color: #003B95; font-weight: 800; margin-bottom: 6px; }
    .slide-subtitle { font-size: 14px; color: #0284C7; margin-bottom: 24px; }
    .slide-body-split { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: center; }
    .col-left { display: flex; justify-content: center; }
    .desktop-frame-container { width: 100%; background: #F8FAFC; border: 1.5px solid #BAE6FD; border-radius: 8px; padding: 12px; }
    .desktop-screen-box { width: 100%; height: 380px; display: flex; align-items: center; justify-content: center; background: #FFFFFF; border-radius: 6px; overflow: hidden; border: 1px solid #E2E8F0; }
    .desktop-badge { margin-top: 10px; background: #EFF6FF; border: 1px solid #BAE6FD; padding: 8px; text-align: center; font-size: 12px; font-weight: 700; color: #003B95; border-radius: 6px; }
    .mobile-device-wrapper {
      position: relative;
      width: 270px;
      height: 520px;
      background: #0F172A;
      border: 3px solid #334155;
      border-radius: 38px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25), inset 0 0 0 2px #1E293B;
      padding: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .mobile-device-wrapper::before {
      content: '';
      position: absolute;
      top: 12px;
      width: 65px;
      height: 12px;
      background: #000000;
      border-radius: 8px;
      z-index: 10;
    }
    .mobile-device-wrapper::after {
      content: '';
      position: absolute;
      bottom: 12px;
      width: 85px;
      height: 4px;
      background: rgba(255,255,255,0.7);
      border-radius: 4px;
      z-index: 10;
    }
    .mobile-screen-box {
      width: 100%;
      height: 100%;
      background: #0F172A;
      border-radius: 30px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mobile-screen-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }
    .mobile-badge {
      display: none;
    }
    .features-stack { display: flex; flex-direction: column; gap: 14px; }
    .feature-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 14px 18px; box-shadow: 0 2px 6px rgba(0,0,0,0.02); }
    .feature-card.border-accent-navy { border-left: 5px solid #003B95; }
    .feature-card.border-accent-cyan { border-left: 5px solid #0284C7; }
    .feature-card.border-accent-gold { border-left: 5px solid #F59E0B; }
    .feat-title { font-size: 14px; font-weight: 700; color: #003B95; margin-bottom: 4px; }
    .feat-desc { font-size: 12.5px; color: #334155; line-height: 1.45; }
    .cover-container { text-align: center; padding: 40px 20px; }
    .cover-badge { display: inline-block; padding: 6px 16px; background: #EFF6FF; color: #003B95; border-radius: 20px; font-weight: 700; font-size: 13px; margin-bottom: 16px; border: 1px solid #BAE6FD; }
    .cover-title { font-size: 36px; font-weight: 900; color: #003B95; margin-bottom: 12px; }
    .cover-subtitle { font-size: 16px; color: #0284C7; margin-bottom: 36px; }
    .pillars-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: left; }
    .pillar-card { background: #F8FAFC; border: 1px solid #BAE6FD; border-radius: 10px; padding: 20px; }
    .pillar-num { font-size: 24px; font-weight: 900; color: ${isApp ? '#F59E0B' : '#0284C7'}; margin-bottom: 8px; }
    .pillar-title { font-size: 15px; font-weight: 700; color: #003B95; margin-bottom: 8px; }
    .pillar-desc { font-size: 12px; color: #334155; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="slide-wrapper">
    ${slidesHtml}
  </div>
</body>
</html>`;
  }

  // BUILD HTML CRM
  const crmHtmlSlides = [
    {
      type: 'cover',
      eyebrow: 'TRUNG TÂM ĐIỀU HÀNH & QUẢN TRỊ SỐ HÓA HIỆP HỘI',
      title: 'TỔNG QUAN HỆ THỐNG: 4 TRỤ CỘT ĐIỀU HÀNH SỐ HÓA',
      subtitle: 'Kiểm Soát Toàn Diện: Hồ Sơ Hội Viên · Quỹ Hội VietQR · Bầu Cử & Lucky Draw · Sàn B2B',
      pillars: [
        { num: '01', title: 'Quản Trị Hội Viên 360°', desc: 'Thẩm định hồ sơ trực tuyến, phân bổ ban bệ và tự động cấp thông tin tài khoản qua email tức thì.' },
        { num: '02', title: 'Tài Chính & Đối Soát VietQR', desc: 'Theo dõi hội phí thường niên, gạch nợ hội phí tự động qua mã VietQR và minh bạch thu chi ngân quỹ.' },
        { num: '03', title: 'Sự Kiện, Bầu Cử & Lucky Draw', desc: 'Khởi tạo vé đa tầng, sắp đặt sơ đồ khán phòng VIP, bỏ phiếu đại hội và quay số VinFast VF3.' },
        { num: '04', title: 'Đồng Bộ Hai Chiều Realtime', desc: 'Tách biệt chuyên sâu cho Ban Quản Trị nhưng liên kết 100% dữ liệu xuống Mobile App của hội viên.' },
      ]
    },
    ...CRM_FEATURE_SLIDES.map(s => ({
      type: 'feature',
      eyebrow: s.eyebrow,
      title: s.title,
      subtitle: s.subtitle,
      imgFilename: s.img,
      badgeText: s.badge,
      features: s.features
    }))
  ];

  const htmlCrm = renderDeckHtml('Thuyết Trình Hệ Thống CRM Quản Trị - CLB Doanh Nhân CEO 1983', 'Hệ Thống CRM Quản Trị', crmHtmlSlides, false);
  const outHtmlCrm = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.html');
  fs.writeFileSync(outHtmlCrm, htmlCrm, 'utf8');
  for (const dir of [DOCS_DIR, CEO_FE_DOCS_DIR]) {
    fs.writeFileSync(path.join(dir, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.html'), htmlCrm, 'utf8');
  }
  console.log(`✓ Đã tạo HTML CRM thành công: ${outHtmlCrm}`);

  // BUILD HTML APP
  const appHtmlSlides = [
    {
      type: 'cover',
      eyebrow: 'ỨNG DỤNG DI ĐỘNG HIỆP HỘI THỜI KỲ SỐ',
      title: 'TỔNG QUAN NỀN TẢNG: 4 GIÁ TRỊ ĐẶC QUYỀN HỘI VIÊN',
      subtitle: 'Không Gian Số Hội Viên Đẳng Cấp: Thẻ VIP Gold · Danh Thiếp Visit Card · Chạm NFC · Quét QR Công Khai',
      pillars: [
        { num: '01', title: 'Thẻ VIP & NFC 1 Chạm', desc: 'Thẻ hội viên VIP Gold số hóa chuẩn quốc tế, tích hợp chip NFC chạm trao danh thiếp ngay trên điện thoại.' },
        { num: '02', title: 'Sàn Trao Đổi Cơ Hội B2B', desc: 'Chia sẻ nhu cầu mua bán sỉ, kết nối cung ứng và kêu gọi đầu tư trực tiếp giữa các doanh nhân.' },
        { num: '03', title: 'Sự Kiện, Vé & Bầu Cử Đại Hội', desc: 'Xem lịch đại hội, đăng ký vé VietQR, quét mã QR vào cửa 1s, bỏ phiếu BCH và quay số trúng thưởng.' },
        { num: '04', title: 'Đồng Bộ Realtime CRM', desc: 'Tách biệt giao diện chuyên dụng cho hội viên nhưng liên kết 100% dữ liệu vận hành từ Web CRM Quản trị.' },
      ]
    },
    ...APP_FEATURE_SLIDES.map(s => ({
      type: 'feature',
      eyebrow: s.eyebrow,
      title: s.title,
      subtitle: s.subtitle,
      imgFilename: s.img,
      badgeText: s.badge,
      features: s.features
    }))
  ];

  const htmlApp = renderDeckHtml('Thuyết Trình Ứng Dụng Di Động Hiệp Hội - CLB Doanh Nhân CEO 1983', 'Ứng Dụng Di Động Hiệp Hội', appHtmlSlides, true);
  const outHtmlApp = path.join(OUT_DIR, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.html');
  fs.writeFileSync(outHtmlApp, htmlApp, 'utf8');
  for (const dir of [DOCS_DIR, CEO_FE_DOCS_DIR]) {
    fs.writeFileSync(path.join(dir, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.html'), htmlApp, 'utf8');
  }
  console.log(`✓ Đã tạo HTML App thành công: ${outHtmlApp}`);

  // BUILD MARKDOWN SLIDES (CRM & APP)
  let crmMd = '# SLIDE THUYẾT TRÌNH HỆ THỐNG WEB CRM QUẢN TRỊ - CLB DOANH NHÂN CEO 1983\n';
  crmMd += '*Bản quyền © 2026 CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)*\n\n---\n\n';
  CRM_FEATURE_SLIDES.forEach((s, idx) => {
    crmMd += `### Slide ${idx + 2 < 10 ? '0' + (idx + 2) : idx + 2}: ${s.title}\n`;
    crmMd += `- **Mục tiêu**: ${s.subtitle}\n`;
    s.features.forEach(f => {
      crmMd += `- **${f.title}**: ${f.desc}\n`;
    });
    crmMd += '\n';
  });

  let appMd = '# SLIDE THUYẾT TRÌNH ỨNG DỤNG DI ĐỘNG HIỆP HỘI - CLB DOANH NHÂN CEO 1983\n';
  appMd += '*Bản quyền © 2026 CLB Doanh Nhân CEO 1983 · Trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA)*\n\n---\n\n';
  APP_FEATURE_SLIDES.forEach((s, idx) => {
    appMd += `### Slide ${idx + 2 < 10 ? '0' + (idx + 2) : idx + 2}: ${s.title}\n`;
    appMd += `- **Mục tiêu**: ${s.subtitle}\n`;
    s.features.forEach(f => {
      appMd += `- **${f.title}**: ${f.desc}\n`;
    });
    appMd += '\n';
  });

  for (const dir of [DOCS_DIR, OUT_DIR, CEO_FE_DOCS_DIR]) {
    fs.writeFileSync(path.join(dir, 'SLIDE_THUYET_TRINH_CRM_QUAN_TRI_CEO1983.md'), crmMd, 'utf8');
    fs.writeFileSync(path.join(dir, 'SLIDE_THUYET_TRINH_APP_HIEP_HOI_CEO1983.md'), appMd, 'utf8');
  }
  console.log('✓ Đã tạo Markdown Slides cho cả CRM và App thành công!');
}

async function main() {
  console.log('=== BẮT ĐẦU XUẤT BẢN MASTER SLIDES (CRM & APP) ===');
  await generateCrmPptx();
  await generateAppPptx();
  generateHtmlSlides();
  console.log('=== HOÀN TẤT TẤT CẢ SLIDES THÀNH CÔNG 100%! ===');
}

main().catch(err => {
  console.error('[ERROR]', err);
  process.exit(1);
});
