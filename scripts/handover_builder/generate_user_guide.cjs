/**
 * GENERATE USER MANUAL: 04_HUONG_DAN_SU_DUNG_HE_THONG_CEO1983_HANOIBA.md
 * Master User Manual for CEO 1983 Club (HanoiBA) - Web CRM & Mobile App
 * Enterprise Handover Standard Version 10.0
 */

const fs = require('fs');
const path = require('path');

const { getGuide1Content } = require('../guide1_web_crm_ceo1983');
const { getGuide2Content } = require('../guide2_app_ceo1983');

function generateUserGuideMarkdown() {
  const g1 = getGuide1Content();
  const g2 = getGuide2Content();

  // Strip top headings from individual guides to integrate them as Part 1 and Part 2
  const g1Body = g1.replace(/^#[\s\S]*?(?=## 📌 MỤC LỤC TÀI LIỆU)/, '').replace(/## 📌 MỤC LỤC TÀI LIỆU[\s\S]*?(?=## 1\. )/, '');
  const g2Body = g2.replace(/^#[\s\S]*?(?=## 📌 MỤC LỤC TÀI LIỆU)/, '').replace(/## 📌 MỤC LỤC TÀI LIỆU[\s\S]*?(?=## 1\. )/, '');

  return `# HỆ SINH THÁI NỀN TẢNG SỐ CLB DOANH NHÂN CEO 1983 (HANOIBA)

## CẨM NANG HƯỚNG DẪN SỬ DỤNG HỆ THỐNG TOÀN DIỆN
*(COMPREHENSIVE SYSTEM USER MANUAL - MASTER ENTERPRISE EDITION)*

---

* **Mã tài liệu:** \`HDSD-CEO1983-MASTER-HANOIBA\`
* **Phiên bản:** \`Phiên bản 10.0 Enterprise Handover Standard (Bản Bàn Giao Vận Hành & Khách Hàng)\`
* **Cơ quan chủ quản:** Câu Lạc Bộ Doanh Nhân CEO 1983 — Trực thuộc Hội Doanh Nghiệp Trẻ Hà Nội (HanoiBA)
* **Đơn vị phát triển giải pháp:** VICONNECT - Nền tảng Chuyển đổi số Hiệp hội Doanh nhân
* **Đối tượng áp dụng:** Ban Quản trị, Ban Thư ký, Trưởng 6 Ban chuyên môn, Kế toán và Toàn thể Hội viên Doanh nhân CEO 1983
* **Cổng truy cập Web CRM:** \`https://14.225.217.232:5443\`
* **Cổng truy cập Mobile App (PWA):** \`https://14.225.217.232:5444/association\`
* **Ngày phát hành:** \`08/11/2026\`

---

## MỤC LỤC TOÀN BỘ CẨM NANG

* **PHẦN I: HƯỚNG DẪN QUẢN TRỊ VIÊN CỔNG WEB CRM ĐIỀU HÀNH TRUNG ƯƠNG**
  - [1. Tổng Quan Hệ Thống Web CRM & Thông Tin Đăng Nhập](#1-tong-quan-crm)
  - [2. Quản Trị Phân Quyền RBAC 6 Ban Chuyên Môn](#2-phan-quyen-rbac)
  - [3. Quy Trình 3 Bước Tiếp Nhận & Phê Duyệt Kết Nạp Hội Viên Mới](#3-duyet-hoi-vien)
  - [4. Quản Lý Danh Bạ 360 Độ & Hồ Sơ Doanh Nghiệp](#4-ho-so-360)
  - [5. Quản Trị Sự Kiện, Sơ Đồ Bàn Tiệc Cinema Seating & Trạm Soát Vé QR Gate](#5-su-kien-seating)
  - [6. Quản Lý Cuộc Họp Ban Điều Hành & Điều Phối Công Việc Kanban](#6-hop-ban-kanban)
  - [7. Quản Lý Check-in Độc Lập Cho Sự Kiện, Họp Mặt & Diễn Đàn](#7-checkin-doc-lap)
  - [8. Quản Lý Cơ Hội Giao Thương B2B, Chia Sẻ Bảo Mật & Sàn TMĐT](#8-giao-thuong-b2b)
  - [9. Quản Trị Tài Chính: Thu Hội Phí Tự Động VietQR / MoMo & Đối Soát Sổ Quỹ](#9-tai-chinh-hoi-phi)
  - [10. Nhập - Xuất Báo Cáo Excel Chuẩn Biểu Mẫu Doanh Nghiệp](#10-excel-import-export)
  - [11. Đăng Bài Truyền Thông Đa Kênh 1-Chạm (Facebook, Zalo OA, Website)](#11-dang-bai-da-kenh)
  - [12. Cấu Hình Hệ Thống, Quản Lý Tự Động Refresh Token Zalo OA 6 Giờ & Audit Logs](#12-cai-dat-zalo-audit)

* **PHẦN II: HƯỚNG DẪN HỘI VIÊN SỬ DỤNG ỨNG DỤNG DI ĐỘNG CEO 1983 MOBILE APP**
  - [1. Hướng Dẫn Cài Đặt 1-Chạm (iOS Safari, Android Chrome PWA & APK Native)](#1-cai-dat-app)
  - [2. Đăng Nhập An Toàn & Kích Hoạt Sinh Trắc Học FaceID / Vân Tay](#2-dang-nhap-faceid)
  - [3. Trang Chủ Di Động: Banner Tin Tức Tự Động Trượt Ngang Full-Width & Popup Sinh Nhật](#3-trang-chu-tin-tuc)
  - [4. Thẻ Danh Thiếp Số VIP QR 3D Gyroscope & Mã Số May Mắn](#4-the-vip-3d)
  - [5. Danh Bạ Đồng Niên 1983 & Bộ Lọc Ngành Nghề Thông Minh](#5-danh-ba-dong-nien)
  - [6. Đặt Lịch Hẹn Kết Nối 1-on-1 trong 3 Kịch Bản & Tự Động Nhắn Tin](#6-hen-gap-1on1)
  - [7. Đăng Ký Sự Kiện, Vé Điện Tử E-Ticket QR & Biểu Quyết Trực Tiếp (Live Voting)](#7-ve-su-kien-voting)
  - [8. Giao Thương B2B: Đăng Tin (Công Khai / Chỉ Định) & Đàm Phán Deal Theo % Lời Nhất](#8-deal-b2b)
  - [9. Mua Sắm Nội Khối Trên Sàn Thương Mại Điện Tử Doanh Nhân 1983](#9-san-tmdt)
  - [10. Bảng Tin Mạng Lưới: Đăng Bài QR, Quét QR Tham Gia Họp, Bình Luận Cây 3 Cấp & Tag \`@\`](#10-mang-luoi-feed)
  - [11. Nhắn Tin Trực Tiếp & Gọi Điện Trao Đổi Cơ Hội Giao Thương](#11-tin-nhan-chat)
  - [12. Nộp Hội Phí Trực Tuyến Qua VietQR Napas247 / MoMo / VNPay](#12-nop-hoi-phi-app)
  - [13. Báo Cáo Thống Kê Cá Nhân & Hiệp Hội Chuẩn Hóa 2 Cột (Số Lượng & Giá Trị)](#13-thong-ke-2-cot)
  - [14. Cài Đặt Bảo Mật Tinh Giản, Đổi Mật Khẩu, Nút Đăng Xuất & Chọn Màu Theme Swatches](#14-cai-dat-theme)

---

# PHẦN I: HƯỚNG DẪN QUẢN TRỊ VIÊN CỔNG WEB CRM ĐIỀU HÀNH TRUNG ƯƠNG
*(Dành cho Chủ tịch, Ban Thường trực, Ban Thư ký, Kế toán và Trưởng 6 Chuyên ban)*

---

<div id="1-tong-quan-crm"></div>

${g1Body}

---

# PHẦN II: HƯỚNG DẪN HỘI VIÊN SỬ DỤNG ỨNG DỤNG DI ĐỘNG CEO 1983 MOBILE APP
*(Dành cho toàn thể Hội viên chính thức CLB Doanh Nhân CEO 1983)*

---

<div id="1-cai-dat-app"></div>

${g2Body}

---
*Tài liệu Cẩm nang Hướng dẫn Sử dụng Hệ thống Toàn diện được phát hành và bàn giao chính thức cho Ban Quản trị CLB Doanh Nhân CEO 1983 (HanoiBA).*
`;
}

module.exports = { generateUserGuideMarkdown };

