const fs = require('fs');
const path = require('path');

const targetScript = path.resolve(__dirname, 'generate_separated_progress_sheets.js');
let content = fs.readFileSync(targetScript, 'utf8');

// 1. Thay thế toàn bộ "Ban Quản trị" / "BQT" thành "Ban Điều Hành"
content = content.replace(/QA \/ BQT CLB CEO 1983/g, 'QA / Ban Điều Hành CLB CEO 1983');
content = content.replace(/Ban Quản Trị/g, 'Ban Điều Hành');
content = content.replace(/Ban Quản trị/g, 'Ban Điều Hành');
content = content.replace(/BQT CLB CEO 1983/g, 'Ban Điều Hành CLB CEO 1983');
content = content.replace(/BQT/g, 'Ban Điều Hành');

// 2. Bổ sung các subfeatures vào Feature 1 của CRM
const crmF1Old = `        name: 'Bảo mật API Backend bằng NestJS RolesGuard và JwtAuthGuard',
        status: 'Hoàn thành',
        startDate: '11/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '28/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Chặn quyền ở tầng API NestJS, trả lỗi 403 Forbidden nếu không đúng vai trò.'
      }
    ]
  },
  {
    mainFeature: '2. Xác Thực & Đăng Nhập Admin`;

const crmF1New = `        name: 'Bảo mật API Backend bằng NestJS RolesGuard và JwtAuthGuard',
        status: 'Hoàn thành',
        startDate: '11/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '28/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Chặn quyền ở tầng API NestJS, trả lỗi 403 Forbidden nếu không đúng vai trò.'
      },
      {
        name: 'Chuẩn hóa thứ bậc phân quyền quản trị 7 cấp: Chủ tịch -> Admin -> Ban Điều Hành -> Tổng thư ký -> Trưởng ban chuyên môn -> Ban thư ký -> Hội viên',
        status: 'Hoàn thành',
        startDate: '12/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Định hình rõ thứ bậc: Chủ tịch tối cao, Admin kỹ thuật, Ban Điều Hành (thay thế Ban Quản trị cũ) lãnh đạo liên ban.'
      },
      {
        name: 'Định danh và nhận diện vai trò chuẩn xác ngay khi đăng nhập (JWT payload + AuthContext + LocalStorage)',
        status: 'Hoàn thành',
        startDate: '12/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Tra cứu đồng thời bảng tài khoản và chức vụ điều hành, lưu cờ isPresident, isAdmin, isExecutive, isGeneralSecretary, isDepartmentLeader tức thời.'
      }
    ]
  },
  {
    mainFeature: '2. Xác Thực & Đăng Nhập Admin`;

content = content.replace(crmF1Old, crmF1New);

// 3. Thêm tính năng 10 (Giao việc) và 11 (Bốc thăm) vào CRM
const crmEndOld = `        name: 'Cấu hình thông tin hiệp hội CLB Doanh Nhân CEO 1983 (Logo, Slogan, Hotline, Email)',
        status: 'Hoàn thành',
        startDate: '26/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Quản trị đồng bộ thông tin pháp nhân và điều lệ của CLB trên toàn hệ thống.'
      }
    ]
  }
];`;

const crmEndNew = `        name: 'Cấu hình thông tin hiệp hội CLB Doanh Nhân CEO 1983 (Logo, Slogan, Hotline, Email)',
        status: 'Hoàn thành',
        startDate: '26/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Quản trị đồng bộ thông tin pháp nhân và điều lệ của CLB trên toàn hệ thống.'
      }
    ]
  },
  {
    mainFeature: '10. Quản Lý Giao Việc, Điều Phối Nhiệm Vụ & Nghiệm Thu Kết Quả (Task Delegation Workflow)',
    subFeatures: [
      {
        name: 'Phân cấp thẩm quyền giao việc theo Role: Chủ tịch & Admin giao toàn hệ thống; Tổng thư ký giao Ban Thư Ký; Trưởng ban giao chính ban đó',
        status: 'Hoàn thành',
        startDate: '15/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Chặn quyền giao việc ngoài thẩm quyền ở cả tầng giao diện và API Backend NestJS (trả lỗi 403 nếu giao sai ban).'
      },
      {
        name: 'Phân quyền dữ liệu công việc (Data Authorization): Bảo mật hồ sơ nhiệm vụ, độc lập dữ liệu theo từng ban',
        status: 'Hoàn thành',
        startDate: '16/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Lãnh đạo xem toàn bộ; Tổng thư ký xem Ban Thư Ký; Trưởng ban xem ban của mình; Hội viên chỉ xem việc được giao/phối hợp.'
      },
      {
        name: 'Hỗ trợ tệp đính kèm giao việc đa định dạng: Word (.doc, .docx), Excel (.xls, .xlsx), PDF (.pdf) và Hình ảnh minh chứng',
        status: 'Hoàn thành',
        startDate: '18/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Tải lên qua API /upload/file với dung lượng tối đa 30MB, hiển thị icon phân biệt màu sắc và kích thước file.'
      },
      {
        name: 'Trình xem trước bảng tính Excel trực tuyến (ExcelViewerModal với Handsontable / Tabulator đa sheet)',
        status: 'Hoàn thành',
        startDate: '20/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Xem trực tiếp bảng tính Excel giao việc hoặc file nghiệm thu ngay trên CRM mà không cần cài Microsoft Office.'
      },
      {
        name: 'Tính năng giao việc linh hoạt (Dynamic Task): Phân loại danh mục, Dự toán ngân sách (VND), Tiêu chí nghiệm thu (Acceptance Criteria)',
        status: 'Hoàn thành',
        startDate: '20/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Cho phép tùy biến thuộc tính theo đặc thù từng nhiệm vụ, thiết lập tiêu chí đầu ra bắt buộc trước khi nghiệm thu.'
      },
      {
        name: 'Vòng đời xử lý nhiệm vụ 4 giai đoạn: Giao việc -> Tiếp nhận/Từ chối -> Nộp báo cáo kết quả -> Nghiệm thu 100% / Yêu cầu làm lại',
        status: 'Hoàn thành',
        startDate: '22/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Quy trình khép kín, minh bạch thời gian, đánh giá chất lượng 1-5 sao và lưu trữ lịch sử thao tác đầy đủ.'
      },
      {
        name: 'Tự động phát chuông đôn đốc tiến độ (Remind task) và đồng bộ thông báo thời gian thực đến điện thoại hội viên',
        status: 'Hoàn thành',
        startDate: '23/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Gửi thông báo ưu tiên cao qua business_notifications và member_notifications khi có nhiệm vụ mới hoặc cần đôn đốc.'
      }
    ]
  },
  {
    mainFeature: '11. Bốc Thăm May Mắn (Lucky Draw) & Vinh Danh Nhà Tài Trợ',
    subFeatures: [
      {
        name: 'Cơ chế quay số ngẫu nhiên thời gian thực theo danh sách đại biểu đã check-in sự kiện',
        status: 'Hoàn thành',
        startDate: '24/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Chỉ đại biểu đã có mặt tại hội trường mới được đưa vào vòng quay số trúng thưởng.'
      },
      {
        name: 'Giao diện Lucky Draw sân khấu màn hình LED lớn hiệu ứng pháo hoa và âm thanh chúc mừng',
        status: 'Hoàn thành',
        startDate: '25/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Độ phân giải 4K sắc nét, hỗ trợ quay từng giải hoặc quay hàng loạt nhanh chóng.'
      },
      {
        name: 'Quản lý cơ cấu giải thưởng (Đặc biệt, Nhất, Nhì, Ba) và vinh danh logo nhà tài trợ giải',
        status: 'Hoàn thành',
        startDate: '26/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Gắn thương hiệu nhà tài trợ vào từng phần quà, nâng tầm vị thế đối tác đồng hành.'
      }
    ]
  }
];`;

content = content.replace(crmEndOld, crmEndNew);

// 4. Thêm subfeatures cho App Hiệp hội Feature 1 (Đăng nhập & nhận diện vai trò)
const appF1Old = `        name: 'Cài đặt ứng dụng PWA lên màn hình chính (Add to Home Screen trên iOS và Android)',
        status: 'Hoàn thành',
        startDate: '13/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '28/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Trải nghiệm như ứng dụng native, mở app 1 chạm từ màn hình điện thoại.'
      }
    ]
  },
  {
    mainFeature: '2. Thẻ Hội Viên Thông Minh VIP 3D`;

const appF1New = `        name: 'Cài đặt ứng dụng PWA lên màn hình chính (Add to Home Screen trên iOS và Android)',
        status: 'Hoàn thành',
        startDate: '13/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '28/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Trải nghiệm như ứng dụng native, mở app 1 chạm từ màn hình điện thoại.'
      },
      {
        name: 'Nhận diện vai trò chuẩn xác ngay từ khi đăng nhập: Chủ tịch, Admin, Ban Điều Hành, Trưởng ban, Tổng thư ký, Ban thư ký, Hội viên',
        status: 'Hoàn thành',
        startDate: '14/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Tự động mở khóa chức năng điều hành tương ứng cho từng cấp lãnh đạo ngay trên điện thoại di động.'
      }
    ]
  },
  {
    mainFeature: '2. Thẻ Hội Viên Thông Minh VIP 3D`;

content = content.replace(appF1Old, appF1New);

// 5. Thêm tính năng 11 (Task Delegation Mobile), 12 (Native Background Service), 13 (Voice AI) vào App Hiệp hội
const appEndOld = `        name: 'Carousel Banner nhà tài trợ ở đầu Sàn Giao Thương và modal đăng ký gói quảng cáo tài trợ',
        status: 'Hoàn thành',
        startDate: '25/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Tự động chạy slide mỗi 4 giây, đóng phí tài trợ trực tiếp qua VietQR Napas 24/7.'
      }
    ]
  }
];`;

const appEndNew = `        name: 'Carousel Banner nhà tài trợ ở đầu Sàn Giao Thương và modal đăng ký gói quảng cáo tài trợ',
        status: 'Hoàn thành',
        startDate: '25/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Tự động chạy slide mỗi 4 giây, đóng phí tài trợ trực tiếp qua VietQR Napas 24/7.'
      }
    ]
  },
  {
    mainFeature: '11. Phân Hệ Tiếp Nhận Nhiệm Vụ & Nộp Báo Cáo Nghiệm Thu Di Động (Task Delegation Mobile)',
    subFeatures: [
      {
        name: 'Nhận thông báo giao việc đẩy (Push Notification) thời gian thực với chuông báo ưu tiên cao',
        status: 'Hoàn thành',
        startDate: '20/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Thông báo nổi bật ngay trên màn hình khóa điện thoại, hiển thị người giao, hạn chót và mức độ ưu tiên.'
      },
      {
        name: 'Tiếp nhận hoặc từ chối công việc kèm nhập lý do chuyên môn ngay trên màn hình cảm ứng di động',
        status: 'Hoàn thành',
        startDate: '21/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'CEO xác nhận tiếp nhận 1-chạm hoặc phản hồi lý do bận việc để lãnh đạo kịp thời điều phối nhân sự.'
      },
      {
        name: 'Theo dõi hạn chót, danh sách tiêu chí nghiệm thu (Acceptance Criteria) và cập nhật tiến độ % linh hoạt',
        status: 'Hoàn thành',
        startDate: '22/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Kéo thanh trượt tiến độ 0-100%, tích chọn hoàn thành các mục trong checklist công việc con.'
      },
      {
        name: 'Tải lên tệp đính kèm kết quả (Deliverables): Hỗ trợ Word, Excel, PDF, Hình ảnh trực tiếp từ điện thoại',
        status: 'Hoàn thành',
        startDate: '23/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Nộp báo cáo công việc từ ứng dụng tệp của iOS/Android, bấm gửi đề xuất nghiệm thu nhanh chóng.'
      },
      {
        name: 'Nhận chuông đôn đốc tiến độ và xem nhận xét, đánh giá chất lượng 1-5 sao từ Ban Điều Hành',
        status: 'Hoàn thành',
        startDate: '24/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Nhận thông báo khi lãnh đạo đôn đốc hoặc phê duyệt nghiệm thu kèm sao đánh giá cống hiến.'
      }
    ]
  },
  {
    mainFeature: '12. Dịch Vụ Nền Android Native & Duy Trì Kết Nối Bền Bỉ (Native Background Services)',
    subFeatures: [
      {
        name: 'Dịch vụ nền CeoNotificationSyncService chạy dưới dạng Foreground Service ưu tiên cao',
        status: 'Hoàn thành',
        startDate: '24/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Ngăn chặn hệ điều hành Android tự tắt ứng dụng, duy trì kết nối socket liên tục.'
      },
      {
        name: 'Bộ tiếp sóng CeoKeepAliveReceiver tự động kích hoạt lại dịch vụ sau khi khởi động máy hoặc mạng phục hồi',
        status: 'Hoàn thành',
        startDate: '25/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Bắt sự kiện BOOT_COMPLETED và CONNECTIVITY_CHANGE để đánh thức ứng dụng kịp thời.'
      },
      {
        name: 'Cơ chế tối ưu hóa pin thông minh (Doze Mode Friendly), chỉ tiêu thụ tài nguyên khi có sự kiện mới',
        status: 'Hoàn thành',
        startDate: '26/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Mức tiêu hao pin dưới 1.5% sau 12 giờ chạy nền, bảo đảm trải nghiệm sử dụng pin cả ngày.'
      }
    ]
  },
  {
    mainFeature: '13. Trợ Lý Ảo AI Điều Hành Hiệp Hội Bằng Giọng Nói (Voice AI Executive Assistant)',
    subFeatures: [
      {
        name: 'Nhận diện khẩu lệnh giọng nói tiếng Việt chuẩn xác và phân tích ý định tự động (Intent Recognition)',
        status: 'Hoàn thành',
        startDate: '25/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Nhấn giữ phím mic và nói tự nhiên để tìm kiếm hội viên, xem lịch họp hoặc tra cứu sản phẩm B2B.'
      },
      {
        name: 'Tự động tra cứu cơ sở dữ liệu hiệp hội và điều hướng màn hình rảnh tay',
        status: 'Hoàn thành',
        startDate: '26/09/2026',
        assignee: 'Dev Team ViConnect',
        completedDate: '30/09/2026',
        tester: 'QA / Ban Điều Hành CLB CEO 1983',
        note: 'Chuyển trang tức thì theo lệnh giọng nói mà không cần thao tác gõ bàn phím.'
      }
    ]
  }
];`;

content = content.replace(appEndOld, appEndNew);

// 6. Cập nhật thêm thư mục docs vào OUTPUT_DIRS để đồng bộ cả docs/ và document/
const outputDirsOld = `const OUTPUT_DIRS = [
  path.resolve(__dirname, '../document'),
  path.resolve(__dirname, '../../ceo1983_project/document'),
];`;

const outputDirsNew = `const OUTPUT_DIRS = [
  path.resolve(__dirname, '../document'),
  path.resolve(__dirname, '../docs'),
  path.resolve(__dirname, '../apps/ceo1983_app_fe/public/docs'),
  path.resolve(__dirname, '../../ceo1983_project/document'),
];`;

content = content.replace(outputDirsOld, outputDirsNew);

fs.writeFileSync(targetScript, content, 'utf8');
console.log('Đã cập nhật file scripts/generate_separated_progress_sheets.js thành công!');
