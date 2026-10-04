/**
 * DATA_CEO1983_BRD.JS
 * Đặc tả toàn diện Yêu Cầu Nghiệp Vụ (BRD - Business Requirements Document)
 * Hệ Sinh Thái Số Hóa & Quản Trị Hiệp Hội Doanh Nhân CEO 1983 (Trực thuộc HanoiBA)
 * Tiêu chuẩn: IIBA BABOK Guide v3.0 & Nghiệp vụ Hiệp hội Doanh nhân Việt Nam
 */

const BRD_DATA = {
  metadata: {
    projectTitle: "HỆ SINH THÁI SỐ HÓA & QUẢN TRỊ HIỆP HỘI DOANH NHÂN CEO 1983",
    subTitle: "Tài Liệu Yêu Cầu Nghiệp Vụ Toàn Diện (Business Requirements Document - BRD)",
    docCode: "BRD-CEO1983-MASTER-V5.0",
    version: "Version 5.0 (Master Enterprise Release)",
    date: "04/10/2026",
    governingBody: "Câu Lạc Bộ Doanh Nhân CEO 1983 (Trực thuộc Hội Doanh Nhân Trẻ Hà Nội — HanoiBA)",
    consultant: "Ban Công Nghệ Chuyển Đổi Số & ViConnect Platform",
    status: "Đã Thẩm Định Nghiệp Vụ & Phê Duyệt Triển Khai Chính Thức",
    author: "Senior Business Analyst & Solution Architect (15+ Năm Kinh Nghiệm)",
  },

  // 1. TỔNG QUAN & BỐI CẢNH DOANH NGHIỆP
  executiveSummary: {
    background: `Câu lạc bộ Doanh nhân CEO 1983 được thành lập với tư cách là tổ chức thành viên trực thuộc Hội Doanh Nhân Trẻ Hà Nội (HanoiBA). Đây là nơi hội tụ của hơn 500+ Chủ tịch Hội đồng Quản trị, Tổng Giám đốc, Nhà sáng lập và Lãnh đạo cấp cao của các doanh nghiệp tư nhân tiêu biểu sinh năm Quý Hợi 1983 trên địa bàn Thủ đô Hà Nội và các tỉnh thành lân cận.

Với sứ mệnh "Bản lĩnh - Tiên phong - Kết nối - Phát triển", CLB Doanh nhân CEO 1983 đóng vai trò là cầu nối liên minh kinh tế, xúc tiến thương mại nội khối, hỗ trợ tiếp cận nguồn lực tài chính, đồng thời là hạt nhân tích cực trong các chương trình an sinh xã hội, thiện nguyện vì cộng đồng của Hội Doanh Nhân Trẻ Hà Nội.`,

    painPoints: [
      {
        id: "PP-01",
        title: "Dữ liệu Hội viên Phân tán & Thất lạc Nghiêm trọng",
        desc: "Trước khi số hóa, hồ sơ của hơn 500 hội viên được lưu trữ rải rác trên nhiều bảng tính Excel cá nhân của từng cán bộ văn phòng và các nhóm chat mạng xã hội (Zalo, Viber, Facebook). Khi có sự thay đổi về chức danh lãnh đạo, địa chỉ trụ sở, mã số thuế hoặc năng lực cung ứng sản phẩm, dữ liệu không được cập nhật tập trung, dẫn đến việc mất dấu thông tin hội viên, thiếu cơ sở dữ liệu xác thực để kết nối giao thương nội bộ."
      },
      {
        id: "PP-02",
        title: "Chồng chéo Thẩm quyền & Quy trình Phê duyệt Kết nạp Thiếu Chặt chẽ",
        desc: "Quy trình tiếp nhận đơn gia nhập câu lạc bộ diễn ra qua hình thức gửi hồ sơ giấy hoặc tin nhắn cá nhân. Thiếu sự phân định rành mạch giữa vai trò hành chính của Ban Thư Ký và thẩm quyền thẩm định tư cách doanh nghiệp của Ban Thành Viên. Tình trạng phê duyệt kết nạp không đúng thẩm quyền hoặc bỏ sót hồ sơ ứng viên tiềm năng diễn ra thường xuyên, làm suy giảm uy tín của tổ chức."
      },
      {
        id: "PP-03",
        title: "Thất thoát & Chậm trễ Trong Công tác Thu - Nộp - Đối soát Hội phí Thường niên",
        desc: "Hội phí thường niên (5.000.000 VNĐ/hội viên/năm) là nguồn kinh phí duy trì hoạt động cốt lõi của câu lạc bộ. Việc theo dõi công nợ hoàn toàn dựa trên việc Ban Tài chính/Thủ quỹ đối soát thủ công từng dòng biến động số dư tài khoản ngân hàng với danh sách Excel. Không có mã định danh giao dịch chuẩn hóa dẫn đến tình trạng chuyển khoản không ghi rõ họ tên/mã hội viên, gây tranh cãi về tình trạng hoàn thành nghĩa vụ tài chính và tốn hàng trăm giờ làm việc mỗi kỳ đại hội."
      },
      {
        id: "PP-04",
        title: "Hỗn loạn Sơ đồ Ghế ngồi & Ùn tắc Cửa Check-in Sự kiện Gala Đại hội",
        desc: "Tại các sự kiện thường niên, Gala Dinner và Đại hội toàn thể quy mô từ 300 đến 600 đại biểu, ban tổ chức phải in danh sách giấy tại bàn đón tiếp. Việc tìm kiếm tên thủ công gây ùn tắc kéo dài từ 30 - 45 phút tại sảnh hội trường. Nghiêm trọng hơn, việc sắp xếp vị trí bàn tiệc VIP cho các Lãnh đạo Thành ủy, Hội LHTN, HanoiBA và Hội viên kim cương không có sơ đồ trực quan, dẫn đến việc đại biểu ngồi sai vị trí, làm ảnh hưởng tiêu cực đến tính trang trọng của sự kiện."
      },
      {
        id: "PP-05",
        title: "Kiểm phiếu Bầu cử Đại hội Thủ công Chậm trễ & Rủi ro Sai sót",
        desc: "Công tác bầu cử Ban Chấp Hành nhiệm kỳ mới và thông qua các nghị quyết đại hội trước đây sử dụng phiếu bầu giấy. Quá trình phát phiếu, thu phiếu và ban kiểm phiếu làm việc thủ công kéo dài từ 2 đến 3 giờ đồng hồ, làm gián đoạn chương trình đại hội. Ngoài ra, việc kiểm phiếu thủ công tiềm ẩn nguy cơ sai lệch số liệu và thiếu tính minh bạch tức thời."
      },
      {
        id: "PP-06",
        title: "Thiếu Kênh Giao thương B2B Nội Khối & Minh Bạch Quỹ Thiện Nguyện",
        desc: "Hội viên có nhu cầu tiêu dùng chéo và tìm kiếm nhà cung cấp tin cậy trong nội bộ những người bạn đồng niên 1983 nhưng không có sàn thương mại B2B chính danh để niêm yết sản phẩm với chính sách ưu đãi đặc quyền. Đồng thời, nguồn tiền quyên góp Quỹ Thiện nguyện an sinh xã hội thiếu cơ chế công khai sao kê thời gian thực, chưa đáp ứng kỳ vọng minh bạch tuyệt đối của các nhà hảo tâm."
      }
    ],

    strategicObjectives: [
      {
        id: "OBJ-01",
        kpi: "Số hóa 100% Hồ Sơ Hội Viên",
        target: "Định danh điện tử (e-KYC Doanh nghiệp) cho toàn bộ 500+ hội viên với mã định danh chuẩn `CEO-83xxx` trước Quý 4/2026."
      },
      {
        id: "OBJ-02",
        kpi: "Tự Động Hóa 100% Thu - Nộp Hội Phí Qua VietQR",
        target: "Sinh mã VietQR động Napas 24/7 chứa chính xác mã hội viên và số tiền; kế toán đối soát gạch nợ trên CRM giảm 95% thời gian xử lý thủ công."
      },
      {
        id: "OBJ-03",
        kpi: "Soát Vé An Ninh QR Gate < 0.2 Giây/Đại Biểu",
        target: "Tốc độ quét nhận diện vé điện tử E-Ticket tại cửa sự kiện đạt dưới 200ms; hiển thị trực quan thông tin đại biểu và số bàn tiệc VIP; triệt tiêu 100% gian lận trùng vé."
      },
      {
        id: "OBJ-04",
        kpi: "Tăng Trưởng Giao Thương Nội Khối B2B +45%",
        target: "Thiết lập sàn thương mại B2B và kênh kết nối Cung - Cầu 1-on-1, thúc đẩy doanh số giao thương nội khối đạt tối thiểu 50 tỷ VNĐ trong năm đầu vận hành."
      },
      {
        id: "OBJ-05",
        kpi: "Kiểm Phiếu Đại Hội Thời Gian Thực (Live 1s)",
        target: "100% đại biểu biểu quyết trực tuyến trên thiết bị di động cá nhân theo nguyên tắc 1 người 1 phiếu; tổng hợp kết quả chính xác 100% trong 1 giây sau khi đóng hòm phiếu."
      },
      {
        id: "OBJ-06",
        kpi: "Minh Bạch 100% Sổ Quỹ Thu Chi & Thiện Nguyện",
        target: "Áp dụng quy trình kiểm soát chi tiêu 3 cấp nghiêm ngặt; công khai sao kê quỹ thiện nguyện thời gian thực cho toàn thể hội viên."
      }
    ]
  },

  // 2. MÔ HÌNH VẬN HÀNH & PHÂN ĐỊNH 6 CHUYÊN BAN
  organizationalStructure: {
    overview: "Hệ sinh thái số hóa được thiết kế chuẩn hóa bám sát cơ cấu tổ chức và điều lệ hoạt động chính thức của CLB Doanh Nhân CEO 1983 trực thuộc Hội Doanh Nhân Trẻ Hà Nội, phân định rõ ràng quyền hạn và trách nhiệm giữa Ban Quản Trị, Ban Thư Ký và 6 Ban chuyên môn tác nghiệp.",
    committees: [
      {
        id: "BAN-01",
        name: "Ban Quản Trị (BQT) / Ban Thường Trực",
        email: "admin@connect.vn",
        role: "quan_tri",
        mandate: "Cơ quan lãnh đạo cao nhất của CLB giữa hai kỳ đại hội.",
        responsibilities: [
          "Phê duyệt chiến lược phát triển, kế hoạch công tác năm và quy chế hoạt động của các ban chuyên môn.",
          "Phê duyệt dự toán và quyết toán các sự kiện quy mô lớn, ngân sách tài chính và quỹ thiện nguyện.",
          "Cấu hình và giám sát ma trận phân quyền RBAC 5 cấp bậc trong toàn hệ thống.",
          "Phê duyệt quyết định kết nạp hội viên danh dự và quyết định khai trừ/chấm dứt tư cách hội viên khi vi phạm điều lệ."
        ]
      },
      {
        id: "BAN-02",
        name: "Ban Thư Ký (BTK)",
        email: "ceo.tongthuky@ceo1983.com",
        role: "tong_thu_ky",
        mandate: "Cơ quan thường trực điều hành công tác hành chính, văn phòng và tổng hợp của câu lạc bộ.",
        responsibilities: [
          "Triệu tập đại biểu, khởi tạo và điều phối các cuộc họp Ban Chấp Hành định kỳ và đột xuất.",
          "Quản lý lịch phòng họp tập trung Sapphire Hub (sức chứa 40 chỗ), phòng họp trực tuyến Zoom/Meet.",
          "Soạn thảo, trình ký và ban hành nghị quyết, thông báo, biên bản đại hội và phân công nhiệm vụ (Tasks).",
          "Tổng hợp báo cáo tiến độ công việc đa chiều từ các ban chuyên trách gửi Ban Quản Trị.",
          "ĐẶC BIỆT LƯU Ý: Ban Thư Ký TUYỆT ĐỐI KHÔNG CÓ THẨM QUYỀN PHÊ DUYỆT HỒ SƠ KẾT NẠP HỘI VIÊN MỚI. Mọi can thiệp vào thẩm quyền này bị hệ thống chặn đứng hoàn toàn."
        ]
      },
      {
        id: "BAN-03",
        name: "Ban Thành Viên (BTV)",
        email: "ceo.thanhvien@ceo1983.com",
        role: "truong_ban",
        mandate: "Cơ quan chuyên trách phát triển hội viên, thẩm định tư cách và chăm sóc thành viên.",
        responsibilities: [
          "ĐỘC QUYỀN TIẾP NHẬN & THẨM ĐỊNH HỒ SƠ ĐĂNG KÝ GIA NHẬP mới từ Cổng thông tin công khai.",
          "Xác minh điều kiện pháp lý: Năm sinh 1983 (Quý Hợi), Giấy chứng nhận ĐKKD, Mã số thuế, Năng lực tài chính và uy tín của doanh nghiệp ứng viên.",
          "BẤM NÚT PHÊ DUYỆT KẾT NẠP CHÍNH THỨC trên hệ thống Web CRM, kích hoạt quy trình cấp mã định danh `CEO-83xxx`.",
          "Phát hành email thông báo kết nạp kèm mật khẩu khởi tạo tài khoản ứng dụng di động cho hội viên mới.",
          "Theo dõi, đánh giá điểm cống hiến và xếp hạng hội viên thường niên (Hạng Kim Cương, Vàng, Bạc, Tiêu Chuẩn)."
        ]
      },
      {
        id: "BAN-04",
        name: "Ban Thiện Nguyện & An Sinh Xã Hội (BTN)",
        email: "ceo.thiennguyen@ceo1983.com",
        role: "truong_ban",
        mandate: "Cơ quan chuyên trách các chương trình nhân đạo, xây dựng điểm trường, tài trợ đồng bào lũ lụt và công tác an sinh xã hội của HanoiBA.",
        responsibilities: [
          "Xây dựng kế hoạch và phát động các chiến dịch gây quỹ thiện nguyện trong hội viên và đối tác.",
          "Quản lý nguồn quỹ thiện nguyện chuyên biệt trên hệ thống Web CRM (`/funds`).",
          "Phối hợp Ban Tài chính thực hiện quy trình kiểm soát chi tiêu 3 cấp trước khi giải ngân nguồn quỹ.",
          "Cập nhật và công khai báo cáo sao kê thu chi tài chính thiện nguyện thời gian thực cho toàn thể hội viên."
        ]
      },
      {
        id: "BAN-05",
        name: "Ban Truyền Thông & Sự Kiện (BTT)",
        email: "ceo.truyenthong@ceo1983.com",
        role: "truong_ban",
        mandate: "Cơ quan chuyên trách xây dựng thương hiệu, thông tin báo chí, tổ chức sự kiện và vận hành an ninh hội nghị.",
        responsibilities: [
          "Quản trị nội dung bảng tin, banner marketing carousel tự động trượt, thư viện hình ảnh/video trên Mobile App.",
          "Tổ chức các sự kiện họp mặt, hội thảo chuyên đề, giải thể thao và đêm Gala Dinner thường niên.",
          "Thiết kế sơ đồ phân bổ vị trí chỗ ngồi trực quan Cinema Seating Map cho từng khán phòng.",
          "Trực tiếp vận hành Cổng An Ninh Soát Vé Gate Check-in QR tại các sự kiện thực tế, đảm bảo an ninh trật tự.",
          "Điều hành chương trình Vòng quay may mắn (Lucky Draw) thời gian thực phục vụ quay thưởng đại hội."
        ]
      },
      {
        id: "BAN-06",
        name: "Ban Xúc Tiến Thương Mại & Đầu Tư (BXT)",
        email: "ceo.xuctien@ceo1983.com",
        role: "truong_ban",
        mandate: "Cơ quan chuyên trách thúc đẩy hợp tác đầu tư, liên minh kinh tế và hỗ trợ tiêu thụ sản phẩm giữa các doanh nghiệp thành viên.",
        responsibilities: [
          "Quản trị và kiểm duyệt sản phẩm, dịch vụ niêm yết trên Sàn Thương Mại Doanh Nhân B2B.",
          "Thẩm định chính sách trợ giá nội bộ (Ưu đãi độc quyền từ 5% - 30% dành riêng cho hội viên CEO 1983).",
          "Điều phối và duyệt các tin đăng trên Bảng tin Cơ hội Kinh doanh Cung - Cầu (Cần Mua / Cần Bán).",
          "Tổ chức các phiên kết nối giao thương 1-on-1, ký kết biên bản ghi nhớ hợp tác chiến lược giữa các hội viên."
        ]
      }
    ]
  },

  // 3. MA TRẬN PHÂN QUYỀN VÀ TRÁCH NHIỆM RACI
  raciMatrix: {
    roles: [
      { code: "BQT", name: "Ban Quản Trị" },
      { code: "BTV", name: "Ban Thành Viên" },
      { code: "BTK", name: "Ban Thư Ký" },
      { code: "BTN_BTC", name: "Ban Thiện Nguyện / Kế Toán" },
      { code: "BTT", name: "Ban Truyền Thông" },
      { code: "BXT", name: "Ban Xúc Tiến B2B" },
      { code: "MEM", name: "Hội Viên Chính Thức" }
    ],
    processes: [
      {
        id: "PROC-01",
        name: "Tiếp nhận hồ sơ đăng ký gia nhập trực tuyến (Landing Page)",
        BQT: "I", BTV: "A / R", BTK: "I", BTN_BTC: "I", BTT: "I", BXT: "I", MEM: "R (Ứng viên)"
      },
      {
        id: "PROC-02",
        name: "Thẩm định doanh nghiệp & Duyệt kết nạp (Cấp mã CEO-83xxx)",
        BQT: "A", BTV: "R (Độc quyền)", BTK: "KHÔNG CÓ QUYỀN", BTN_BTC: "I", BTT: "I", BXT: "I", MEM: "I"
      },
      {
        id: "PROC-03",
        name: "Khởi tạo sự kiện Gala & Cấu hình các gói vé E-Ticket",
        BQT: "A", BTV: "C", BTK: "C", BTN_BTC: "C", BTT: "R", BXT: "C", MEM: "I"
      },
      {
        id: "PROC-04",
        name: "Thiết kế sơ đồ chỗ ngồi trực quan Cinema Seating Map",
        BQT: "A", BTV: "C", BTK: "R", BTN_BTC: "I", BTT: "R", BXT: "I", MEM: "I"
      },
      {
        id: "PROC-05",
        name: "Vận hành Cổng An Ninh Soát Vé Gate Check-in QR (< 0.2s)",
        BQT: "I", BTV: "I", BTK: "C", BTN_BTC: "I", BTT: "A / R", BXT: "I", MEM: "R (Quét vé)"
      },
      {
        id: "PROC-06",
        name: "Lên lịch họp & Thuật toán chống trùng phòng Sapphire Hub",
        BQT: "A", BTV: "I", BTK: "A / R", BTN_BTC: "I", BTT: "I", BXT: "I", MEM: "I"
      },
      {
        id: "PROC-07",
        name: "Điểm danh đại biểu tham gia cuộc họp bằng mã QR động (30s)",
        BQT: "I", BTV: "I", BTK: "A / R", BTN_BTC: "I", BTT: "I", BXT: "I", MEM: "R (Quét QR)"
      },
      {
        id: "PROC-08",
        name: "Giao nhiệm vụ & Đánh giá tiến độ công việc (Tasks 5 Views)",
        BQT: "A", BTV: "R", BTK: "A / R", BTN_BTC: "R", BTT: "R", BXT: "R", MEM: "R (Được giao)"
      },
      {
        id: "PROC-09",
        name: "Thu hội phí thường niên qua Cổng VietQR Napas 24/7",
        BQT: "A", BTV: "C", BTK: "I", BTN_BTC: "A / R", BTT: "I", BXT: "I", MEM: "R (Chuyển khoản)"
      },
      {
        id: "PROC-10",
        name: "Đối soát sao kê ngân hàng & Duyệt gạch nợ hội phí (+365 ngày)",
        BQT: "A", BTV: "I", BTK: "I", BTN_BTC: "A / R", BTT: "I", BXT: "I", MEM: "I"
      },
      {
        id: "PROC-11",
        name: "Kiểm soát phiếu chi 3 cấp (Lập -> Thẩm định -> Phê duyệt)",
        BQT: "A", BTV: "I", BTK: "I", BTN_BTC: "A / R", BTT: "I", BXT: "I", MEM: "I"
      },
      {
        id: "PROC-12",
        name: "Kiểm duyệt sản phẩm niêm yết trên Sàn Thương Mại B2B",
        BQT: "I", BTV: "C", BTK: "I", BTN_BTC: "I", BTT: "I", BXT: "A / R", MEM: "R (Đăng bán)"
      },
      {
        id: "PROC-13",
        name: "Điều phối & Tiếp nhận Cơ hội Kinh doanh Cung - Cầu 1-on-1",
        BQT: "I", BTV: "I", BTK: "I", BTN_BTC: "I", BTT: "I", BXT: "A / R", MEM: "R (Khớp nối)"
      },
      {
        id: "PROC-14",
        name: "Bỏ phiếu bầu cử & Biểu quyết Nghị quyết Đại hội (1 người 1 phiếu)",
        BQT: "A", BTV: "I", BTK: "R", BTN_BTC: "I", BTT: "I", BXT: "I", MEM: "A / R (Bầu cử)"
      },
      {
        id: "PROC-15",
        name: "Quản trị Danh thiếp số VIP 3D Titanium & Kết nối Chạm NFC",
        BQT: "I", BTV: "C", BTK: "I", BTN_BTC: "I", BTT: "I", BXT: "I", MEM: "A / R (Sử dụng)"
      },
      {
        id: "PROC-16",
        name: "Quản lý Hộp thư Doanh nhân Messenger #0084FF & Kênh BTK ghim",
        BQT: "I", BTV: "I", BTK: "A / R (Ghim kênh)", BTN_BTC: "I", BTT: "I", BXT: "I", MEM: "R (Chat)"
      }
    ]
  },

  // 4. QUY TRÌNH NGHIỆP VỤ CỐT LÕI (CORE BUSINESS PROCESSES)
  coreProcesses: [
    {
      id: "FLOW-01",
      name: "Quy Trình Tiếp Nhận, Thẩm Định & Phê Duyệt Kết Nạp Hội Viên Mới",
      actor: "Ứng viên Doanh nhân 1983, Ban Thành Viên (BTV), Hệ thống SMTP Mailer",
      steps: [
        {
          step: 1,
          name: "Nộp hồ sơ trực tuyến",
          desc: "Ứng viên truy cập Cổng tiếp nhận hồ sơ tại địa chỉ `https://14.225.217.232:5444/landing?apply=true`. Điền đầy đủ thông tin: Họ tên, Ngày tháng năm sinh (Bắt buộc năm 1983), Số điện thoại, Email, Tên doanh nghiệp, Mã số thuế, Chức vụ lãnh đạo, Lĩnh vực ngành nghề, Nguyện vọng chuyên ban."
        },
        {
          step: 2,
          name: "Ghi nhận bản ghi & Gửi thư tiếp nhận tự động",
          desc: "Hệ thống ghi nhận bản ghi vào cơ sở dữ liệu ở trạng thái `pending` (Chờ thẩm định). Máy chủ SMTP Mailer tự động phát hành thư điện tử xác nhận tiếp nhận hồ sơ đến email ứng viên kèm Mã tra cứu hồ sơ định danh."
        },
        {
          step: 3,
          name: "Thẩm định điều kiện doanh nghiệp (Độc quyền BTV)",
          desc: "Lãnh đạo Ban Thành Viên đăng nhập Cổng Quản trị Web CRM (`/members`), mở ngăn kéo (Drawer) chi tiết hồ sơ ứng viên. Tiến hành đối soát thông tin pháp nhân trên Cổng thông tin quốc gia về đăng ký doanh nghiệp, xác minh mã số thuế, doanh thu và phẩm chất đạo đức kinh doanh."
        },
        {
          step: 4,
          name: "Phê duyệt kết nạp & Cấp mã hội viên định danh",
          desc: "Lãnh đạo BTV bấm nút 'Phê Duyệt Kết Nạp'. Hệ thống kiểm tra quyền hạn (Chỉ tài khoản BTV hoặc BQT tối cao mới được phép; chặn hoàn toàn Ban Thư Ký). Hệ thống tự động sinh Mã số hội viên chuẩn `CEO-83xxx` (VD: `CEO-83007`), chuyển trạng thái tài khoản sang `active`, tạo tài khoản đăng nhập và mật khẩu khởi tạo ngẫu nhiên bảo mật cao."
        },
        {
          step: 5,
          name: "Phát hành email thông báo & Đăng nhập lần đầu",
          desc: "Hệ thống tự động gửi Email Chào mừng chính thức gia nhập CLB Doanh Nhân CEO 1983, cung cấp thông tin tài khoản, hướng dẫn tải Mobile App và yêu cầu bắt buộc đổi mật khẩu khởi tạo trong lần đầu tiên đăng nhập."
        }
      ]
    },
    {
      id: "FLOW-02",
      name: "Quy Trình Quản Trị Hội Phí Thường Niên & Thu Nộp Qua VietQR Napas 24/7",
      actor: "Hội viên chính thức, Ban Tài chính / Kế toán, Cổng thanh toán VietQR",
      steps: [
        {
          step: 1,
          name: "Thông báo nghĩa vụ hội phí",
          desc: "Hằng năm, hệ thống tự động quét ngày hết hạn thẻ VIP (`term_end`). Trước 30 ngày, hệ thống kích hoạt thông báo đẩy trên Mobile App và email nhắc nhở nghĩa vụ hoàn thành hội phí thường niên (5.000.000 VNĐ/năm)."
        },
        {
          step: 2,
          name: "Sinh mã VietQR động Napas 24/7",
          desc: "Hội viên mở mục 'Hội Phí' trên Mobile App, nhấn 'Thanh Toán VietQR'. Hệ thống sinh mã QR động chuẩn Napas 24/7 chứa đầy đủ: Số tiền chính xác (5.000.000 VNĐ), Số tài khoản thụ hưởng của CLB CEO 1983 và Cú pháp chuẩn hóa: `HOIPHI CEO1983 [MÃ_HỘI_VIÊN] [HỌ_TÊN]`."
        },
        {
          step: 3,
          name: "Chuyển khoản liên ngân hàng",
          desc: "Hội viên sử dụng ứng dụng Mobile Banking của bất kỳ ngân hàng thương mại nào tại Việt Nam, quét mã VietQR và xác nhận chuyển khoản nhanh 24/7 không cần nhập tay."
        },
        {
          step: 4,
          name: "Đối soát sao kê ngân hàng & Gạch nợ thủ công trên CRM",
          desc: "Kế toán câu lạc bộ truy cập màn hình 'Quản Lý Hội Phí' (`/fees`) trên Web CRM. Đối soát số tiền và cú pháp giao dịch trên sao kê tài khoản ngân hàng thực tế. Khi khớp lệnh, kế toán bấm nút 'Duyệt Gạch Nợ' tương ứng với bản ghi hội viên."
        },
        {
          step: 5,
          name: "Kích hoạt gia hạn Thẻ VIP & Xuất hóa đơn điện tử",
          desc: "Hệ thống tự động chuyển trạng thái bản ghi sang `paid`, cộng thêm +365 ngày vào hạn dùng của Thẻ hội viên VIP (`term_end`), đồng thời tạo hóa đơn điện tử (`invoices`) và gửi thông báo xác nhận đã hoàn thành nghĩa vụ tài chính đến hội viên."
        }
      ]
    },
    {
      id: "FLOW-03",
      name: "Quy Trình Tổ Chức Sự Kiện Gala, Thiết Kế Sơ Đồ Ghế & Soát Vé QR Gate",
      actor: "Ban Truyền Thông (BTT), Ban Thư Ký (BTK), Hội viên, Đại biểu khách mời",
      steps: [
        {
          step: 1,
          name: "Khởi tạo sự kiện & Cấu hình gói vé",
          desc: "Ban Truyền Thông tạo sự kiện Gala trên Web CRM (`/events`), thiết lập thông tin: Tên chương trình, thời gian, địa điểm tổ chức, diễn giả VIP và cấu hình các loại vé: Vé VIP Đại biểu danh dự (0 VNĐ), Vé Hội viên chính thức (0 VNĐ), Vé Khách mời mở rộng có phí (1.500.000 VNĐ)."
        },
        {
          step: 2,
          name: "Thiết kế sơ đồ chỗ ngồi trực quan (Cinema Seating Map)",
          desc: "Ban tổ chức sử dụng công cụ thiết kế sơ đồ ghế trực quan (`/events/seating`), bố trí bàn tròn Gala VIP 10 chỗ (Bàn VIP 1 đến VIP 6 dành cho Lãnh đạo Thành ủy, HanoiBA), dãy ghế đại biểu danh dự và các bàn tiệc hội viên."
        },
        {
          step: 3,
          name: "Đăng ký vé & Nhận E-Ticket QR độc bản",
          desc: "Hội viên đăng ký tham dự qua Mobile App, hệ thống tự động gán vị trí bàn tiệc và phát hành Vé điện tử E-Ticket lưu trong Ví vé offline. Mã vé chứa chuỗi QR mã hóa bảo mật độc bản và số may mắn tham dự quay thưởng (#LUCKY-xxxx)."
        },
        {
          step: 4,
          name: "Vận hành Cổng An Ninh Soát Vé Gate Check-in QR",
          desc: "Tại cửa đón tiếp hội trường Gala, nhân sự Ban Truyền Thông mở màn hình Soát vé an ninh (`/checkin`) sử dụng camera quét mã QR trên điện thoại của đại biểu. Tốc độ nhận diện đạt dưới 0.2 giây."
        },
        {
          step: 5,
          name: "Kiểm soát an ninh chống gian lận & Đồng bộ Lucky Draw",
          desc: "Vé hợp lệ lần đầu: Màn hình bừng sáng XANH LỤC, hiển thị Họ tên, Tên công ty và Vị trí Bàn tiệc VIP để lễ tân hướng dẫn vào chỗ. Vé quét lại lần thứ hai: Màn hình lập tức báo ĐỎ RỰC cảnh báo 'Vé đã qua cửa lúc hh:mm:ss' để ngăn chặn hành vi chụp ảnh vé chia sẻ cho người khác. Đồng thời, danh sách đại biểu ĐÃ CHECK-IN THỰC TẾ tự động đồng bộ vào Vòng quay may mắn (Lucky Draw) trên sân khấu."
        }
      ]
    },
    {
      id: "FLOW-04",
      name: "Quy Trình Điều Hành Cuộc Họp Lãnh Đạo & Thuật Toán Chống Trùng Phòng Sapphire Hub",
      actor: "Ban Thư Ký (BTK), Ban Quản Trị (BQT), Đại biểu tham dự",
      steps: [
        {
          step: 1,
          name: "Lên lịch cuộc họp & Lựa chọn phòng họp",
          desc: "Ban Thư Ký tạo lịch họp trên Web CRM (`/meetings`), lựa chọn địa điểm: Phòng họp tập trung Sapphire Hub (sức chứa tối đa 40 người) hoặc Phòng họp trực tuyến (Zoom / Google Meet / UniWork Link)."
        },
        {
          step: 2,
          name: "Thuật toán kiểm tra chống xung đột lịch (Conflict Detection)",
          desc: "Nếu lựa chọn phòng họp vật lý Sapphire Hub, hệ thống tự động chạy thuật toán quét các cuộc họp đã được phê duyệt trong cùng khung giờ. Nếu phát hiện trùng lặp thời gian sử dụng phòng, hệ thống lập tức cảnh báo đỏ và chặn không cho phép lưu bản ghi."
        },
        {
          step: 3,
          name: "Phê duyệt cuộc họp cấp quản trị",
          desc: "Lịch họp do Ban Thư Ký hoặc Trưởng ban khởi tạo ở trạng thái `pending_approval`. Ban Quản Trị tối cao duyệt chuyển trạng thái sang `upcoming`, hệ thống tự động phát hành giấy triệu tập qua thông báo đẩy và email."
        },
        {
          step: 4,
          name: "Điểm danh đại biểu bằng mã QR động (Dynamic QR 30s)",
          desc: "Tại cuộc họp, máy chiếu hoặc màn hình lễ tân hiển thị mã QR điểm danh động. Mã QR tự động đổi mã sau mỗi 30 giây để ngăn chặn tình trạng chụp ảnh gửi điểm danh hộ từ xa. Đại biểu mở Mobile App quét mã để ghi nhận có mặt."
        },
        {
          step: 5,
          name: "Ban hành biên bản điện tử & Tự động tạo nhiệm vụ (Tasks)",
          desc: "Kết thúc cuộc họp, Ban Thư Ký tải lên Nghị quyết và Biên bản cuộc họp đã ký số. Các đầu việc kết luận tự động chuyển đổi thành Nhiệm vụ (`tasks`) gán cho các Trưởng ban chuyên môn chịu trách nhiệm thực thi."
        }
      ]
    }
  ],

  // 5. QUY TẮC NGHIỆP VỤ BẮT BUỘC (STRICT BUSINESS RULES)
  businessRules: [
    {
      id: "BR-01",
      code: "RULE-AUTH-BTV-EXCLUSIVE",
      name: "Quy Tắc Độc Quyền Thẩm Định & Phê Duyệt Hội Viên Của Ban Thành Viên",
      desc: "Thẩm quyền xem xét hồ sơ, đối soát tính hợp lệ doanh nghiệp và bấm nút 'Phê Duyệt Kết Nạp' hội viên mới thuộc về duy nhất Ban Thành Viên (tài khoản `ceo.thanhvien@ceo1983.com`) hoặc Ban Quản Trị tối cao (`admin@connect.vn`). Ban Thư Ký và các ban chuyên môn khác TUYỆT ĐỐI KHÔNG CÓ THẨM QUYỀN DUYỆT HỘI VIÊN. Nếu cố tình can thiệp qua API hoặc giao diện, hệ thống bắt buộc chặn đứng bằng mã lỗi HTTP 403 Forbidden."
    },
    {
      id: "BR-02",
      code: "RULE-STRUCT-6-COMMITTEES",
      name: "Quy Tắc Chuẩn Hóa Danh Mục 6 Ban Chuyên Môn",
      desc: "Toàn bộ cơ sở dữ liệu, bộ lọc giao diện, phân bổ công việc và báo cáo chỉ được phép sử dụng đúng danh mục 6 ban chuyên môn chính thức: 1. Ban Quản Trị; 2. Ban Thư Ký; 3. Ban Thành Viên; 4. Ban Thiện Nguyện; 5. Ban Truyền Thông; 6. Ban Xúc Tiến Thương Mại. Tuyệt đối không tự ý thêm bớt hoặc đổi tên ban."
    },
    {
      id: "BR-03",
      code: "RULE-TERMINOLOGY-HOIPHI",
      name: "Quy Tắc Chuẩn Hóa Thuật Ngữ Hội Phí Thường Niên",
      desc: "Tuyệt đối KHÔNG sử dụng từ ngữ 'niên liễm' trong bất kỳ tài liệu kỹ thuật, giao diện người dùng, mã nguồn hay thông báo của hệ thống. Bắt buộc chuẩn hóa 100% bằng thuật ngữ 'Hội phí' hoặc 'Hội phí thường niên'."
    },
    {
      id: "BR-04",
      code: "RULE-MEMBER-BIRTHYEAR-1983",
      name: "Quy Tắc Ràng Buộc Năm Sinh Hội Viên Chính Thức (Quý Hợi 1983)",
      desc: "Biểu mẫu đăng ký gia nhập hội viên chính thức bắt buộc kiểm tra trường năm sinh của người đại diện pháp luật phải chính xác là năm 1983. Mọi trường hợp sinh năm khác 1983 chỉ được tiếp nhận ở tư cách 'Khách mời danh dự' hoặc 'Đối tác liên kết' sau khi có nghị quyết phê duyệt riêng của Ban Quản Trị."
    },
    {
      id: "BR-05",
      code: "RULE-FEE-VIETQR-AUTO-MATCH",
      name: "Quy Tắc Quản Trị Hội Phí & Gạch Nợ Thủ Công",
      desc: "Mức hội phí thường niên được ấn định là 5.000.000 VNĐ/năm. Mã thanh toán VietQR Napas 24/7 phải chứa cú pháp chuẩn định danh. Do hệ thống chưa tích hợp Webhook gạch nợ tự động với cổng ngân hàng lõi, kế toán BẮT BUỘC phải kiểm tra sổ phụ/sao kê thực tế trước khi bấm nút 'Duyệt Gạch Nợ' trên CRM. Khi duyệt, hạn dùng thẻ VIP tự động cộng thêm chính xác +365 ngày."
    },
    {
      id: "BR-06",
      code: "RULE-EVENT-SINGLE-CHECKIN",
      name: "Quy Tắc Soát Vé Một Lần Duy Nhất (Single Check-in)",
      desc: "Mỗi mã vé điện tử E-Ticket QR chỉ được phép qua cổng soát vé thành công đúng 01 lần duy nhất trong suốt thời gian diễn ra sự kiện. Lần quét thứ hai bắt buộc kích hoạt cảnh báo đỏ gian lận kèm âm báo cảnh báo và hiển thị thời gian đã check-in trước đó."
    },
    {
      id: "BR-07",
      code: "RULE-VOTING-ONE-PERSON-ONE-VOTE",
      name: "Quy Tắc Biểu Quyết Đại Hội 1 Người 1 Phiếu",
      desc: "Mỗi hội viên chính thức (`member`) có trạng thái hội phí `paid` chỉ sở hữu đúng 01 phiếu biểu quyết duy nhất cho mỗi nghị quyết đại hội. Phiếu bầu được mã hóa một chiều đảm bảo tính ẩn danh tuyệt đối và không thể sửa đổi sau khi đã bấm xác nhận gửi phiếu."
    },
    {
      id: "BR-08",
      code: "RULE-FIN-CASHBOOK-3-LEVELS",
      name: "Quy Tắc Sổ Quỹ Thu Chi Kiểm Soát 3 Cấp",
      desc: "Mọi khoản chi tiêu từ quỹ câu lạc bộ vượt quá 2.000.000 VNĐ bắt buộc phải trải qua quy trình kiểm soát 3 cấp nghiêm ngặt trên Web CRM: Cấp 1: Cán bộ đề xuất lập phiếu (`pending`); Cấp 2: Trưởng ban phụ trách hoặc Tổng Thư Ký thẩm tra (`reviewed`); Cấp 3: Chủ tịch CLB hoặc Trưởng Ban Tài chính phê duyệt xuất quỹ (`approved`)."
    },
    {
      id: "BR-09",
      code: "RULE-B2B-INTERNAL-DISCOUNT",
      name: "Quy Tắc Niêm Yết Sản Phẩm Sàn B2B Có Trợ Giá Nội Bộ",
      desc: "Sản phẩm hoặc dịch vụ đăng bán trên Sàn Thương Mại B2B của CLB Doanh Nhân CEO 1983 bắt buộc phải cam kết chính sách trợ giá nội bộ (Mức chiết khấu tối thiểu từ 5% trở lên so với giá bán lẻ ngoài thị trường) dành riêng cho các thành viên trong câu lạc bộ."
    },
    {
      id: "BR-10",
      code: "RULE-UI-ROYAL-NAVY-GOLD",
      name: "Quy Tắc Nhận Diện Thương Hiệu Hoàng Gia (Navy & Amber Gold)",
      desc: "Toàn bộ giao diện Web CRM và Mobile App bắt buộc tuân thủ hệ màu thương hiệu chính thức của CLB CEO 1983: Màu chủ đạo Xanh Navy `#003B95` đại diện cho bản lĩnh doanh nhân; Màu điểm xuyết Vàng Ánh Kim Amber Gold `#F59E0B` đại diện cho sự thịnh vượng và uy quyền. Tuyệt đối KHÔNG sử dụng màu đen thuần `#000000` cho các nút bấm chính (CTA Buttons)."
    }
  ],

  // 6. PHÂN TÍCH HIỆN TRẠNG (GAP ANALYSIS) GIỮA THIẾT KẾ VÀ KẾT NỐI API THỰC TẾ
  gapAnalysis: [
    {
      item: "Cổng Thanh Toán VietQR",
      designedState: "Tự động gạch nợ công nợ hội phí sang trạng thái `paid` trong 1 giây qua Webhook ngân hàng.",
      actualState: "Đã sinh mã VietQR động chuẩn Napas 24/7 chứa đúng số tiền và nội dung chuyển khoản; tuy nhiên chưa có kết nối Webhook gạch nợ tự động.",
      operationalSolution: "Kế toán / Thủ quỹ đối soát biến động số dư trên sao kê tài khoản ngân hàng thực tế, sau đó truy cập Web CRM (`/fees`) và bấm nút 'Duyệt Gạch Nợ' thủ công."
    },
    {
      item: "Đăng Nhập Một Chạm (SSO Google / Apple)",
      designedState: "Đăng nhập tức thì chỉ với một chạm qua Google OAuth 2.0 hoặc Apple Sign-In.",
      actualState: "Đã thiết kế nút bấm UI trên màn hình đăng nhập; chưa cấu hình chính thức Google Client ID và Apple Developer Service ID.",
      operationalSolution: "Hội viên và cán bộ quản lý đăng nhập ổn định bằng Số điện thoại / Email kết hợp Mật khẩu tài khoản cá nhân."
    },
    {
      item: "Phòng Họp Trực Tuyến Trực Tiếp (In-app Video Call)",
      designedState: "Nhúng trực tiếp khung hình hội nghị truyền hình WebRTC đa điểm ngay bên trong ứng dụng di động.",
      actualState: "Chưa tích hợp SDK Video Conference trực tiếp vào bundle ứng dụng di động để tối ưu dung lượng tải app.",
      operationalSolution: "Khi đến giờ họp, ứng dụng hiển thị nút mở trực tiếp liên kết phòng họp ngoài (Zoom Meetings, Google Meet hoặc UniWork Platform)."
    },
    {
      item: "Dịch Vụ Tin Nhắn SMS OTP",
      designedState: "Gửi mã xác thực OTP qua cổng Brandname SMS của các nhà mạng viễn thông Viettel/VNPT/Mobifone.",
      actualState: "Chưa ký kết hợp đồng thương mại với nhà cung cấp dịch vụ SMS Brandname.",
      operationalSolution: "Sử dụng mã OTP mặc định trong môi trường kiểm thử nội bộ hoặc gửi mã kích hoạt trực tiếp qua dịch vụ Thư điện tử SMTP Gmail Relay bảo mật."
    }
  ],

  // 7. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)
  nonFunctionalRequirements: [
    {
      category: "Hiệu Năng & Tốc Độ Xử Lý (Performance & Scalability)",
      specs: [
        { metric: "Thời gian phản hồi API (API Response Time)", target: "< 150ms cho 95% số lượng request truy vấn cơ sở dữ liệu thông thường." },
        { metric: "Tốc độ quét nhận diện mã QR (QR Scan Speed)", target: "< 0.2 giây (200ms) tại Cổng An Ninh Soát Vé Gate Check-in." },
        { metric: "Thời gian tải trang ứng dụng di động (First Contentful Paint)", target: "< 1.5 giây trên kết nối mạng di động 4G tiêu chuẩn." },
        { metric: "Năng lực chịu tải đồng thời (Concurrent Users)", target: "Đáp ứng tối thiểu 5,000 người dùng truy cập đồng thời trong các kỳ Đại hội hoặc sự kiện lớn." }
      ]
    },
    {
      category: "Bảo Mật & Toàn Vẹn Dữ Liệu (Security & Compliance)",
      specs: [
        { metric: "Mã hóa đường truyền (Transport Encryption)", target: "100% dữ liệu truyền tải qua giao thức HTTPS bảo mật TLS 1.3 và WebSocket Secure (WSS)." },
        { metric: "Mã hóa mật khẩu người dùng (Password Hashing)", target: "Sử dụng thuật toán Bcrypt với Salt Round 10 vòng kết hợp muối bảo mật độc bản." },
        { metric: "Cơ chế bảo vệ chống Brute-force", target: "Tự động khóa tài khoản tạm thời trong 15 phút nếu nhập sai mật khẩu quá 5 lần liên tiếp." },
        { metric: "Nhật ký kiểm toán hệ thống (Audit Logs)", target: "Ghi nhận 100% nhật ký các thao tác tạo, sửa, xóa, duyệt của cán bộ quản lý (User, IP, Action, Timestamp, Payload)." }
      ]
    },
    {
      category: "Độ Sẵn Sàng & Khôi Phục Thảm Họa (Reliability & Disaster Recovery)",
      specs: [
        { metric: "Chỉ số sẵn sàng hoạt động (System Uptime)", target: "Cam kết đạt tối thiểu 99.9% tính sẵn sàng của hạ tầng máy chủ và ứng dụng." },
        { metric: "Sao lưu cơ sở dữ liệu định kỳ (Automated Backup)", target: "Tự động sao lưu toàn bộ CSDL PostgreSQL hàng ngày vào lúc 03:00 AM, lưu trữ phân tán 30 ngày." },
        { metric: "Chỉ số RTO & RPO (Recovery Objectives)", target: "Thời gian phục hồi dịch vụ (RTO) < 2 giờ; Mức độ mất mát dữ liệu tối đa chấp nhận (RPO) < 24 giờ." }
      ]
    },
    {
      category: "Giao Diện Người Dùng & Khả Năng Tương Thích (UI/UX & Compatibility)",
      specs: [
        { metric: "Chuẩn giao diện di động (Mobile Responsiveness)", target: "Tương thích 100% các dòng điện thoại thông minh iOS (Safari PWA) và Android (Chrome PWA / Native APK)." },
        { metric: "Chuẩn trình duyệt máy tính (Desktop Browsers)", target: "Tối ưu hiển thị sắc nét trên Google Chrome 90+, Microsoft Edge, Mozilla Firefox và Safari." },
        { metric: "Quy chuẩn tài liệu xuất bản (Document Standards)", target: "Tài liệu Word (.docx) và PDF phải tuân thủ chuẩn in ấn A4, không lỗi bảng, không gãy dòng, không lệch lề." }
      ]
    }
  ]
};

module.exports = { BRD_DATA };
