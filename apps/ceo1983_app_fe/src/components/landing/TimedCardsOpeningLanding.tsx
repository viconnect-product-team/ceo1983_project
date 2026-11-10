import React, { useState, useEffect, useRef, useMemo } from 'react';
import { sanitizeHtml } from '../../lib/sanitize';
import {
  Globe,
  Search,
  User,
  Bookmark,
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  Phone,
  Mail,
  CheckCircle,
  Send,
  Layers,
  Menu,
} from 'lucide-react';

export interface LandingMenuItem {
  id: string;
  label: string;
  active?: boolean;
  icon?: string;
  badge?: string;
  type?: 'link' | 'tree_dropdown' | 'modal_screen' | 'api_view';
  url?: string;
  subScreenId?: string;
  children?: LandingMenuItem[];
}

export interface LandingSlide {
  id: string;
  place: string;
  title1: string;
  title2: string;
  description: string;
  image: string;
  bookmarkAction?: string;
  ctaText: string;
  ctaLink?: string;
  ctaType?: 'link' | 'sub_screen';
  ctaSubScreenId?: string;
}

export interface LandingSubScreen {
  id: string;
  title: string;
  subtitle?: string;
  layout?: 'article' | 'grid_cards' | 'contact_form' | 'api_feed';
  contentHtml?: string;
  images?: string[];
  apiEndpoint?: string;
  ctaButton?: { label: string; action: string };
}

export interface LandingApiConfig {
  enabled: boolean;
  endpointUrl: string;
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  rootPath?: string;
  fieldMapping?: {
    place?: string;
    title1?: string;
    title2?: string;
    description?: string;
    image?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

export interface StartupMobileTemplateConfig {
  hero: {
    headline: string;
    subheadline: string;
    underlineAccent: string;
    sunburstText?: string;
    handPhoneImage?: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    videoUrl?: string;
    floatingBadge1: {
      title: string;
      subtitle: string;
    };
    floatingBadge2: {
      title: string;
      subtitle: string;
    };
  };
  ribbonStats: Array<{
    value: string;
    label: string;
    desc: string;
  }>;
  appTabs: {
    b2b: {
      title: string;
      desc: string;
      stat: string;
      items: Array<{ name: string; price: string; author: string }>;
    };
    connect: {
      title: string;
      desc: string;
      stat: string;
      items: Array<{ name: string; price: string; author: string }>;
    };
    card: {
      title: string;
      desc: string;
      stat: string;
      items: Array<{ name: string; price: string; author: string }>;
    };
    analytics: {
      title: string;
      desc: string;
      stat: string;
      items: Array<{ name: string; price: string; author: string }>;
    };
  };
  mapChapterPins: Array<{
    id: string;
    name: string;
    count: string;
    desc: string;
    x: string;
    y: string;
  }>;
  communityAvatars: Array<{
    id: string;
    name: string;
    role: string;
    quote: string;
    avatar: string;
    badge: 'Zalo' | 'LinkedIn' | 'TikTok';
    x: string;
    y: string;
  }>;
  testimonials: Array<{
    id?: string;
    quote: string;
    author: string;
    role: string;
    company: string;
    rating: number;
    avatar: string;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  footer: {
    headline: string;
    description: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
  };
}

export const DEFAULT_STARTUP_MOBILE_CONFIG: StartupMobileTemplateConfig = {
  hero: {
    headline: "Gắn Kết Đồng Niên\nNâng Tầm Doanh Nghiệp",
    subheadline: "Cộng đồng kết nối xúc tiến giao thương, nâng tầm quản trị thực chiến và bảo chứng tín nhiệm dành riêng cho các chủ doanh nghiệp sinh năm 1983 (Quý Hợi) trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).",
    underlineAccent: "Kết Nối – Chia Sẻ – Bứt Phá!",
    sunburstText: "CLB DOANH NHÂN CEO 1983",
    handPhoneImage: "/images/landing/hand_holding_phone_transparent.png",
    ctaPrimaryText: "Tải Ứng Dụng Ngay",
    ctaPrimaryLink: "#download",
    ctaSecondaryText: "Xem Video Giới Thiệu",
    videoUrl: "https://v1.pinimg.com/videos/iht/expMp4/v2/92/8a/ca/928aca8b8e476ade2d17a603c7e62015_720w.mp4",
    floatingBadge1: {
      title: "500+ Doanh Nghiệp",
      subtitle: "Hội viên chính thức HanoiBA",
    },
    floatingBadge2: {
      title: "+105.8 Tỷ VNĐ",
      subtitle: "Giao thương B2B hoàn tất",
    },
  },
  ribbonStats: [
    { value: "1.983+", label: "Hội Viên Doanh Nhân", desc: "Doanh nhân 1983 toàn quốc" },
    { value: "500+", label: "Doanh Nghiệp Thành Viên", desc: "Hội viên chính thức HanoiBA" },
    { value: "100+ Tỷ", label: "VNĐ Giao Thương B2B", desc: "Giá trị kết nối hoàn tất" },
    { value: "98%", label: "Tín Nhiệm Hài Lòng", desc: "Đánh giá giao thương thực chất" },
  ],
  appTabs: {
    b2b: {
      title: "Sàn Thương Mại B2B",
      desc: "Niêm yết hơn 500+ sản phẩm & dịch vụ độc quyền từ các doanh nghiệp hội viên",
      stat: "500+ Sản phẩm B2B",
      items: [
        { name: "Phần mềm ERP Quản trị Doanh nghiệp", price: "120.000.000 đ", author: "ViConnect Tech" },
        { name: "Gói thầu thiết kế nội thất trụ sở CEO", price: "850.000.000 đ", author: "An Cường Interior" },
        { name: "Dịch vụ tư vấn pháp lý M&A", price: "45.000.000 đ", author: "Luật Hà Nội" },
      ],
    },
    connect: {
      title: "Lịch Gặp & Kết Nối 1-on-1",
      desc: "Chủ động đặt lịch giao lưu, cố vấn chiến lược và thảo luận cơ hội hợp tác",
      stat: "240+ Buổi hẹn/tháng",
      items: [
        { name: "Cố vấn chiến lược gọi vốn Series A", price: "Đặt lịch ngay", author: "Chủ tịch Lê Thị Dung" },
        { name: "Trao đổi hợp tác phân phối độc quyền", price: "Thứ Năm, 14:00", author: "Phó CT Nguyễn Hoàng Long" },
        { name: "Cà phê kết nối Doanh nhân 1983", price: "Sáng Thứ Bảy", author: "Ban Xúc Tiến Giao Thương" },
      ],
    },
    card: {
      title: "Thẻ Doanh Nhân Số & QR",
      desc: "Trao danh thiếp thông minh, quét mã định danh xác thực hội viên chính thức",
      stat: "Định danh Chuẩn",
      items: [
        { name: "Doanh nhân: Trần Tuấn Anh", price: "Hội viên Vàng", author: "ViConnect Group" },
        { name: "Chức vụ: Tổng Giám Đốc", price: "Đã xác thực", author: "Mã số: CEO1983-0089" },
        { name: "Lĩnh vực: Công nghệ thông tin & AI", price: "Kết nối ngay", author: "Trụ sở: Hà Nội" },
      ],
    },
    analytics: {
      title: "Thống Kê Giao Thương",
      desc: "Minh bạch mọi chỉ số cơ hội, ngân sách và dòng tiền giao dịch thành công",
      stat: "100+ Tỷ VNĐ",
      items: [
        { name: "Tổng cơ hội giao thương đã mở", price: "128 cơ hội", author: "Toàn hệ thống" },
        { name: "Doanh số giao dịch hoàn tất", price: "105.8 Tỷ VNĐ", author: "Quý 1/2026" },
        { name: "Tỷ lệ kết nối thành công", price: "89.4%", author: "Chỉ số tín nhiệm" },
      ],
    },
  },
  mapChapterPins: [
    { id: "hanoi", name: "Hà Nội — Trụ Sở Chính", count: "1.250+ Hội viên", desc: "Cung Tri Thức, Số 1 Tôn Thất Thuyết, Cầu Giấy", x: "48%", y: "22%" },
    { id: "haiphong", name: "Hải Phòng & Quảng Ninh", count: "210+ Hội viên", desc: "Cụm Công nghiệp & Cảng biển Logistics Đông Bắc", x: "55%", y: "27%" },
    { id: "danang", name: "Đà Nẵng & Miền Trung", count: "185+ Hội viên", desc: "Trung tâm xúc tiến đầu tư Du lịch & Dịch vụ", x: "57%", y: "48%" },
    { id: "hcm", name: "TP. Hồ Chí Minh", count: "320+ Hội viên", desc: "VP Đại diện Phía Nam & Kết nối thị trường tài chính", x: "52%", y: "78%" },
    { id: "cantho", name: "Cần Thơ & ĐBSCL", count: "95+ Hội viên", desc: "Mạng lưới kết nối Nông sản & Xuất khẩu", x: "46%", y: "85%" },
  ],
  communityAvatars: [
    {
      id: "dung-le",
      name: "Lê Thị Dung",
      role: "Chủ tịch CLB Doanh Nhân CEO 1983",
      quote: "Tiên phong đổi mới - Kết nối bền vững",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      badge: "LinkedIn",
      x: "18%",
      y: "25%",
    },
    {
      id: "tuan-anh",
      name: "Trần Tuấn Anh",
      role: "CEO ViConnect Tech",
      quote: "Số hóa quản trị - Tăng tốc quy mô",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      badge: "Zalo",
      x: "75%",
      y: "22%",
    },
    {
      id: "hoang-long",
      name: "Nguyễn Hoàng Long",
      role: "Phó Chủ Tịch Thường Trực HanoiBA",
      quote: "Lan tỏa giá trị tri thức doanh nhân",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      badge: "LinkedIn",
      x: "25%",
      y: "65%",
    },
    {
      id: "minh-tri",
      name: "Hoàng Minh Trí",
      role: "Tổng Giám Đốc An Cường Interior",
      quote: "Chất lượng tạo dựng niềm tin thương hiệu",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      badge: "TikTok",
      x: "80%",
      y: "68%",
    },
  ],
  testimonials: [
    {
      quote: "Nền tảng số hóa của CLB giúp các hội viên trao đổi cơ hội kinh doanh chỉ trong 1 chạm. Qua các phiên Business Matching và chia sẻ cơ hội B2B, doanh nghiệp tôi đã kết nối thành công nhiều hợp đồng chiến lược giá trị cao.",
      author: "Trần Tuấn Anh",
      role: "Phó Chủ Tịch CLB, CEO ViConnect Tech",
      company: "Ban Điều Hành CEO 1983",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote: "CLB Doanh nhân CEO 1983 là ngôi nhà chung gắn kết tình đồng niên chân thành, nơi chúng tôi cùng học hỏi, nâng tầm năng lực quản trị thực chiến và trao nhau cơ hội hợp tác kinh doanh thực chất, cùng vững bước vươn tầm.",
      author: "Lê Thị Dung",
      role: "Chủ tịch CLB Doanh Nhân CEO 1983",
      company: "Tổng Giám Đốc DGroup, Viện trưởng Viện Doanh Trí",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote: "CEO 1983 là một trong những câu lạc bộ đồng niên năng động và đoàn kết nhất của HanoiBA. Các anh chị doanh nhân Quý Hợi luôn tràn đầy nhiệt huyết, bản lĩnh và tinh thần trách nhiệm vì cộng đồng.",
      author: "Nguyễn Hoàng Long",
      role: "Phó Chủ Tịch HanoiBA",
      company: "Hội Doanh nghiệp Trẻ Hà Nội",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      quote: "Các chương trình CEO Talk, Business Tour và tọa đàm chuyên đề mang lại giá trị tri thức thực chiến vô cùng quý báu, giúp các doanh nghiệp hội viên tự tin tháo gỡ điểm nghẽn và bứt phá mạnh mẽ.",
      author: "Đỗ Minh Đức",
      role: "Trưởng Ban Đào Tạo & Doanh Trí",
      company: "Ban Chuyên Môn CEO 1983",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
  ],
  faqs: [
    {
      question: "CLB Doanh Nhân CEO 1983 là tổ chức gì và trực thuộc đơn vị nào?",
      answer: "CLB Doanh nhân CEO 1983 là cộng đồng quy tụ các chủ doanh nghiệp, nhà sáng lập sinh năm Quý Hợi (1983), hoạt động chính thức trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA). CLB hoạt động với phương châm 'Gắn kết đồng niên - Nâng tầm doanh nghiệp', gắn kết tình thân đồng niên và thúc đẩy hợp tác kinh doanh thực chất.",
    },
    {
      question: "Sứ mệnh và các hoạt động trọng tâm của CLB bao gồm những gì?",
      answer: "Sứ mệnh của CLB là kiến tạo cộng đồng doanh nhân bản lĩnh, trí tuệ và nhân văn. Các hoạt động cốt lõi gồm: Xúc tiến giao thương B2B (Business Matching & Business Tour), Đào tạo nâng tầm quản trị (CEO Talk & CEO Exchange), Đặt lịch hẹn 1-on-1 giữa các lãnh đạo và các hoạt động trách nhiệm xã hội CSR (Áo ấm vùng cao, xây nhà tình nghĩa).",
    },
    {
      question: "Điều kiện để gia nhập trở thành Hội viên chính thức của CLB?",
      answer: "Hội viên là các Doanh nhân, Chủ tịch HĐQT, CEO, Tổng giám đốc hoặc Cấp quản lý doanh nghiệp sinh năm 1983 (Quý Hợi). Hồ sơ gia nhập sẽ được Ban Thẩm định và Ban Điều hành phê duyệt theo đúng quy chế hiệp hội của HanoiBA.",
    },
    {
      question: "Ứng dụng di động CEO 1983 mang lại những lợi ích gì cho hội viên?",
      answer: "Ứng dụng cung cấp trọn vẹn giải pháp số hóa: Thẻ Doanh nhân số & mã QR định danh cá nhân, Sàn thương mại B2B niêm yết sản phẩm/dịch vụ ưu đãi nội khối 15-30%, công cụ đặt lịch hẹn kết nối 1-on-1 trực tiếp, biểu đồ thống kê cơ hội minh bạch và thông báo đẩy lịch sự kiện thời gian thực.",
    },
  ],
  footer: {
    headline: "CLB DOANH NHÂN CEO 1983 — HANOIBA",
    description: "Cộng đồng kết nối giao thương, nâng tầm tri thức quản trị thực chiến và lan tỏa giá trị nhân văn cho các doanh nhân sinh năm 1983 trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).",
    contactPhone: "0983.1983.83",
    contactEmail: "contact@ceo1983.com",
    address: "Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội",
  },
};

export interface ForgeLuxuryAtelierTemplateConfig {
  hero: {
    badge: string;
    headline: string;
    subheadline: string;
    heroMediaUrl: string;
    heroPosterUrl?: string;
    ctaPrimaryText: string;
    ctaPrimaryLink?: string;
    ctaSecondaryText: string;
    ctaSecondaryLink?: string;
    coordinatesText?: string;
  };
  approach: {
    title: string;
    quote: string;
    pillars: Array<{
      number: string;
      title: string;
      desc: string;
    }>;
  };
  specialties: Array<{
    number: string;
    category: string;
    title: string;
    desc: string;
    image: string;
    tag: string;
  }>;
  previousBuilds: Array<{
    id: string;
    title: string;
    client: string;
    year: string;
    category: string;
    valuation: string;
    image: string;
    link?: string;
  }>;
  availableStock: Array<{
    code: string;
    title: string;
    industry: string;
    value: string;
    status: string;
    slots: string;
  }>;
  statement: {
    largeText: string;
    subText: string;
  };
  footer: {
    headline: string;
    description: string;
    address: string;
    contactPhone: string;
    contactEmail: string;
  };
}

export const DEFAULT_FORGE_LUXURY_ATELIER_CONFIG: ForgeLuxuryAtelierTemplateConfig = {
  hero: {
    badge: "ATELIER THƯỢNG ĐỈNH · CEO 1983 HANOIBA",
    headline: "Chúng tôi không chỉ kết nối doanh nghiệp.\nChúng tôi cùng bạn kiến tạo di sản.",
    subheadline: "Dành riêng cho những nhà sáng lập và lãnh đạo Quý Hợi 1983 từ chối sự tầm thường. Không gian bespoke chế tác cơ hội giao thương, bọc lót chiến lược và nâng tầm vị thế dẫn dắt.",
    heroMediaUrl: "https://v1.pinimg.com/videos/iht/expMp4/be/d4/59/bed459b41c0f0a170bd1047ffac6a0d2_720w.mp4",
    heroPosterUrl: "https://i.pinimg.com/originals/a8/84/f0/a884f0b8f19070c6226a4c1f9c2d60cc.jpg",
    ctaPrimaryText: "GIA NHẬP ATELIER",
    ctaPrimaryLink: "#enquire",
    ctaSecondaryText: "BỘ SƯU TẬP BESPOKE",
    ctaSecondaryLink: "#specialties",
    coordinatesText: "21°01'42.8\"N 105°47'18.2\"E · HÀ NỘI · KỶ NGUYÊN 1983 · HANOIBA",
  },
  approach: {
    title: "TRIẾT LÝ CHẾ TÁC GIÁ TRỊ",
    quote: "Một di sản phải cất lên tiếng nói trước khi bạn bước vào căn phòng. Từng kết nối, chiến lược và cam kết đồng hành đều được trau chuốt đỉnh cao.",
    pillars: [
      {
        number: "01",
        title: "BẢN SẮC (IDENTITY)",
        desc: "Khẳng định vị thế, tầm nhìn và triết lý kinh doanh độc bản của từng chủ doanh nghiệp trong liên minh.",
      },
      {
        number: "02",
        title: "THỰC CHIẾN (INSIGHT)",
        desc: "Đúc rút tri thức quản trị xương máu từ các phiên cố vấn 1-on-1 cùng lãnh đạo các tập đoàn đầu ngành.",
      },
      {
        number: "03",
        title: "GẮN KẾT (COHESION)",
        desc: "Gắn kết tình thân đồng niên chân thành Quý Hợi 1983, cùng bọc lót nguồn vốn và nâng đỡ nhau vươn tầm.",
      },
    ],
  },
  specialties: [
    {
      number: "01",
      category: "Bespoke Trade",
      title: "Xúc Tiến Giao Thương B2B Thượng Đỉnh",
      desc: "Khớp lệnh các gói thầu, chuyển giao công nghệ và phân phối độc quyền với giá trị giao dịch từ vài chục đến hàng trăm tỷ đồng.",
      image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80",
      tag: "Verified B2B",
    },
    {
      number: "02",
      category: "Executive Atelier",
      title: "Tinh Gọn Quản Trị & Chuyển Đổi Số",
      desc: "Trang bị công nghệ điều hành ERP tích hợp AI, tối ưu chi phí và tự động hóa quy trình vận hành doanh nghiệp SMEs.",
      image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
      tag: "AI Powered",
    },
    {
      number: "03",
      category: "Capital & Growth",
      title: "Cấu Trúc Dòng Tiền & Quỹ Đầu Tư Đồng Niên",
      desc: "Huy động nguồn vốn nội khối, hỗ trợ bảo lãnh tín chấp và đồng hành M&A các dự án tiềm năng cao.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
      tag: "Private Equity",
    },
    {
      number: "04",
      category: "Media & Gala",
      title: "Diễn Đàn Doanh Nhân & Tỏa Sáng Thương Hiệu",
      desc: "Tổ chức các sự kiện Diễn đàn, Gala Keangnam Landmark72 và Business Tour vinh danh thương hiệu hội viên trên toàn quốc.",
      image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
      tag: "Landmark72",
    },
    {
      number: "05",
      category: "Expansion",
      title: "Bứt Phá Quy Mô & Chuỗi Cung Ứng Quốc Tế",
      desc: "Mở rộng hệ thống điểm cầu giao thương từ Bắc chí Nam, kết nối xuất khẩu nông sản và logistics quốc tế.",
      image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
      tag: "Global Supply",
    },
    {
      number: "06",
      category: "Legal & Trust",
      title: "Bảo Trợ Tín Nhiệm & Pháp Lý Vững Chắc",
      desc: "Được bảo trợ chính thức bởi Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA), đảm bảo an toàn tuyệt đối cho mọi hợp tác.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      tag: "HanoiBA Backed",
    },
  ],
  previousBuilds: [
    {
      id: "b-1",
      title: "Nền Tảng ERP Quản Trị Nguồn Lực AI",
      client: "ViConnect Technology Group",
      year: "2026",
      category: "Công Nghệ & AI",
      valuation: "45.0 Tỷ VNĐ",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "b-2",
      title: "Tổ Hợp Nghỉ Dưỡng Khoáng Nóng Heian",
      client: "Wyndham Thanh Thủy Luxury",
      year: "2026",
      category: "Bất Động Sản Nghỉ Dưỡng",
      valuation: "180.0 Tỷ VNĐ",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "b-3",
      title: "Hệ Thống Logistics Cảng Biển Thông Minh",
      client: "Hải Phòng Logistics Center",
      year: "2025",
      category: "Logistics & Cảng Biển",
      valuation: "85.0 Tỷ VNĐ",
      image: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1000&q=80",
    },
  ],
  availableStock: [
    {
      code: "ATELIER-8301",
      title: "Hợp Tác Đầu Tư Chuỗi Khách Sạn & Căn Hộ Dịch Vụ Cao Cấp",
      industry: "Bất Động Sản",
      value: "15.0 Tỷ VNĐ",
      status: "Đang Mở",
      slots: "2/3 Suất",
    },
    {
      code: "ATELIER-8302",
      title: "Phân Phối Độc Quyền Thiết Bị Chiếu Sáng IoT Tòa Nhà",
      industry: "Công Nghệ IoT",
      value: "8.5 Tỷ VNĐ",
      status: "Ưu Tiên",
      slots: "1 Suất",
    },
    {
      code: "ATELIER-8303",
      title: "Gói Thầu Chuyển Đổi Số Toàn Diện Khu Công Nghiệp Xanh",
      industry: "Chuyển Đổi Số",
      value: "22.0 Tỷ VNĐ",
      status: "Đang Mở",
      slots: "1/2 Suất",
    },
  ],
  statement: {
    largeText: "REFUSE ORDINARY",
    subText: "TỪ CHỐI SỰ TẦM THƯỜNG — BỨT PHÁ CÙNG LIÊN MINH DOANH NHÂN 1983",
  },
  footer: {
    headline: "CEO 1983 BESPOKE ATELIER",
    description: "Không gian kết nối và chế tác giá trị độc bản dành riêng cho các chủ doanh nghiệp sinh năm 1983 trực thuộc Hội Doanh nghiệp Trẻ Hà Nội (HanoiBA).",
    address: "Cung Tri Thức Thành Phố, Số 1 Tôn Thất Thuyết, Cầu Giấy, Hà Nội",
    contactPhone: "0983.1983.83",
    contactEmail: "atelier@ceo1983.com",
  },
};

export interface LandingWebConfig {
  id?: string;
  name?: string;
  slug?: string;
  subdomain?: string;
  isPublished?: boolean;
  template?: 'timed_cards_opening' | 'ceo1983_executive' | 'startup_mobile_showcase' | 'forge_luxury_atelier';
  theme?: {
    primaryColor: string;
    secondaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  brand?: {
    logoText: string;
    logoIcon?: string;
    logoUrl?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
  navMenu: LandingMenuItem[];
  slides: LandingSlide[];
  subScreens?: LandingSubScreen[];
  apiConfig?: LandingApiConfig;
  startupConfig?: StartupMobileTemplateConfig;
  forgeAtelierConfig?: ForgeLuxuryAtelierTemplateConfig;
}

interface TimedCardsOpeningLandingProps {
  config: LandingWebConfig;
  previewMode?: boolean;
  onClosePreview?: () => void;
  onEditConfig?: () => void;
}

export const TimedCardsOpeningLanding: React.FC<TimedCardsOpeningLandingProps> = ({
  config,
  previewMode = false,
  onClosePreview,
  onEditConfig,
}) => {
  // Slides state (có thể cập nhật từ API động nếu bật)
  const [slides, setSlides] = useState<LandingSlide[]>(config.slides || []);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [animating, setAnimating] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({});

  // Tree Dropdown Menu state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [expandedTreeNodes, setExpandedTreeNodes] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sub-screen Modal state
  const [activeSubScreen, setActiveSubScreen] = useState<LandingSubScreen | null>(null);

  // Form liên hệ sub-screen
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', note: '' });
  const [contactSubmitted, setContactSubmitted] = useState<boolean>(false);

  const SLIDE_DURATION = 5000; // 5s per slide
  const TIMER_INTERVAL = 50;

  const primaryColor = config.theme?.primaryColor || '#ecad29';

  // Nạp dữ liệu API động nếu được bật
  useEffect(() => {
    if (config.apiConfig?.enabled && config.apiConfig?.endpointUrl) {
      let cancelled = false;
      const fetchApi = async () => {
        try {
          let url = config.apiConfig!.endpointUrl;
          if (url.startsWith('/')) {
            const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ceo1983.viconnect.vn';
            url = `${origin}${url}`;
          }
          const res = await fetch(url, {
            method: config.apiConfig!.method || 'GET',
            headers: { 'Content-Type': 'application/json', ...(config.apiConfig!.headers || {}) },
          });
          if (!res.ok) return;
          const json = await res.json();
          let items: any[] = [];
          if (Array.isArray(json)) items = json;
          else if (config.apiConfig!.rootPath && json[config.apiConfig!.rootPath]) items = json[config.apiConfig!.rootPath];
          else if (json.data && Array.isArray(json.data)) items = json.data;
          else if (json.items && Array.isArray(json.items)) items = json.items;

          if (items.length > 0 && !cancelled) {
            const m = config.apiConfig!.fieldMapping || {};
            const dynSlides: LandingSlide[] = items.slice(0, 8).map((raw, idx) => {
              const place = (m.place && raw[m.place]) || raw.company || raw.location || raw.industry || 'CEO 1983';
              const title = (m.title1 && raw[m.title1]) || raw.title || raw.name || `CHỦ ĐỀ #${idx + 1}`;
              let t1 = title;
              let t2 = '';
              if (m.title2 && raw[m.title2]) {
                t2 = raw[m.title2];
              } else if (title.includes(' ')) {
                const words = title.split(' ');
                t1 = words.slice(0, Math.ceil(words.length / 2)).join(' ');
                t2 = words.slice(Math.ceil(words.length / 2)).join(' ');
              }
              let img = (m.image && raw[m.image]) || raw.image || raw.image_url || raw.cover_image;
              if (Array.isArray(raw.images) && raw.images.length > 0) img = raw.images[0];
              if (!img || typeof img !== 'string' || !img.startsWith('http')) {
                img = config.slides[idx % config.slides.length]?.image || 'https://assets.codepen.io/3685267/timed-cards-1.jpg';
              }
              return {
                id: `dyn-${raw.id || idx}`,
                place: String(place).toUpperCase(),
                title1: String(t1).toUpperCase(),
                title2: String(t2).toUpperCase(),
                description: String(raw.description || raw.summary || raw.content || '').slice(0, 300),
                image: img,
                ctaText: (m.ctaText && raw[m.ctaText]) || 'Khám Phá',
                ctaLink: (m.ctaLink && raw[m.ctaLink]) || '#',
              };
            });
            setSlides(dynSlides);
          }
        } catch (e) {
          console.warn('[TimedCards] Error fetching dynamic api:', e);
        }
      };
      fetchApi();
      return () => {
        cancelled = true;
      };
    } else {
      setSlides(config.slides || []);
    }
  }, [config]);

  // Bộ đếm thời gian Timer Indicator Bar (5s auto-loop)
  useEffect(() => {
    if (isPaused || animating || slides.length <= 1) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextSlide();
          return 0;
        }
        return prev + (TIMER_INTERVAL / SLIDE_DURATION) * 100;
      });
    }, TIMER_INTERVAL);

    return () => clearInterval(timer);
  }, [isPaused, animating, slides.length, currentIndex]);

  const handleNextSlide = () => {
    if (animating || slides.length <= 1) return;
    setAnimating(true);
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % slides.length);
    setTimeout(() => setAnimating(false), 600);
  };

  const handlePrevSlide = () => {
    if (animating || slides.length <= 1) return;
    setAnimating(true);
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setAnimating(false), 600);
  };

  const handleSelectSlide = (targetIndex: number) => {
    if (animating || targetIndex === currentIndex) return;
    setAnimating(true);
    setProgress(0);
    setCurrentIndex(targetIndex);
    setTimeout(() => setAnimating(false), 600);
  };

  // Xử lý cuộn chuột & vuốt cảm ứng để tự động chuyển section (bỏ nút trái phải, scroll tự chuyển)
  const lastScrollTimeRef = useRef(0);
  const touchStartYRef = useRef(0);

  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 650) return;
    if (Math.abs(e.deltaY) > 30) {
      lastScrollTimeRef.current = now;
      if (e.deltaY > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    const now = Date.now();
    if (now - lastScrollTimeRef.current < 650) return;
    if (Math.abs(deltaY) > 40) {
      lastScrollTimeRef.current = now;
      if (deltaY > 0) {
        handleNextSlide();
      } else {
        handlePrevSlide();
      }
    }
  };

  const currentSlide = slides[currentIndex] || slides[0] || {
    id: 'placeholder',
    place: 'GLOBAL DESTINATION',
    title1: 'DISCOVER',
    title2: 'THE WORLD',
    description: 'Trải nghiệm đỉnh cao cùng thiết kế Timed Cards Opening.',
    image: 'https://assets.codepen.io/3685267/timed-cards-1.jpg',
    ctaText: 'Discover Location',
  };

  // Sắp xếp danh sách cards tiếp theo xuất hiện ở góc dưới phải
  const upcomingSlides = useMemo(() => {
    if (slides.length <= 1) return [];
    const list: { slide: LandingSlide; index: number }[] = [];
    for (let i = 1; i < Math.min(slides.length, 5); i++) {
      const idx = (currentIndex + i) % slides.length;
      list.push({ slide: slides[idx], index: idx });
    }
    return list;
  }, [slides, currentIndex]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Điều hướng nút CTA
  const handleCtaClick = (slide: LandingSlide) => {
    if (slide.ctaType === 'sub_screen' && slide.ctaSubScreenId) {
      const sub = (config.subScreens || []).find((s) => s.id === slide.ctaSubScreenId);
      if (sub) {
        setActiveSubScreen(sub);
        return;
      }
    }
    if (slide.ctaLink && slide.ctaLink.startsWith('http')) {
      window.open(slide.ctaLink, '_blank');
    } else if (slide.ctaLink && slide.ctaLink.startsWith('/')) {
      window.location.href = slide.ctaLink;
    } else {
      // Mở modal liên hệ mặc định
      const contactSub = (config.subScreens || []).find((s) => s.id === 'scr-contact') || {
        id: 'scr-contact',
        title: `Đăng Ký Khám Phá — ${slide.title1} ${slide.title2}`,
        subtitle: `Địa điểm: ${slide.place}`,
        layout: 'contact_form',
        contentHtml: `<p>${slide.description}</p>`,
      };
      setActiveSubScreen(contactSub as LandingSubScreen);
    }
  };

  // Xử lý bấm item trên Tree Dropdown Menu
  const handleMenuItemClick = (item: LandingMenuItem) => {
    if (item.children && item.children.length > 0) {
      setOpenDropdownId(openDropdownId === item.id ? null : item.id);
      return;
    }
    setOpenDropdownId(null);
    setMobileMenuOpen(false);

    if (item.subScreenId) {
      const scr = (config.subScreens || []).find((s) => s.id === item.subScreenId);
      if (scr) {
        setActiveSubScreen(scr);
        return;
      }
    }
    if (item.url) {
      if (item.url.startsWith('http')) {
        window.open(item.url, '_blank');
      } else if (item.url.startsWith('/')) {
        window.location.href = item.url;
      } else if (item.url.startsWith('#')) {
        // Cuộn hoặc kích hoạt hành động
      }
    }
  };

  const toggleTreeNodeExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedTreeNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  // Render một nhánh cây trong Tree Dropdown (hỗ trợ nhiều cấp lồng nhau)
  const renderTreeDropdownNodes = (items: LandingMenuItem[], depth = 0) => {
    return (
      <div className={`space-y-1 ${depth > 0 ? 'ml-3 pl-2.5 border-l border-white/10' : ''}`}>
        {items.map((node) => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedTreeNodes[node.id] ?? true;

          return (
            <div key={node.id} className="text-left">
              <div
                onClick={() => handleMenuItemClick(node)}
                className={`group flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  depth === 0
                    ? 'text-white hover:bg-white/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={(e) => toggleTreeNodeExpand(node.id, e)}
                      className="size-4 grid place-items-center rounded text-slate-400 hover:text-white transition"
                    >
                      {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                    </button>
                  ) : (
                    <span className="size-1.5 rounded-full bg-amber-400/60 shrink-0" />
                  )}
                  <span className="truncate">{node.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {node.badge && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {node.badge}
                    </span>
                  )}
                  {node.subScreenId && (
                    <Layers className="size-3 text-slate-400 opacity-60 group-hover:opacity-100 transition" />
                  )}
                  {node.url && (
                    <ExternalLink className="size-3 text-slate-400 opacity-60 group-hover:opacity-100 transition" />
                  )}
                </div>
              </div>

              {hasChildren && isExpanded && (
                <div className="mt-1">{renderTreeDropdownNodes(node.children!, depth + 1)}</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-[#1a1a1a] text-white select-none font-sans"
      style={{
        backgroundColor: config.theme?.backgroundColor || '#111317',
        color: config.theme?.textColor || '#ffffff',
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Running Timer Indicator Bar */}
      <div
        className="fixed top-0 left-0 right-0 h-1 z-60 transition-all ease-linear"
        style={{
          width: `${progress}%`,
          backgroundColor: primaryColor,
          boxShadow: `0 0 12px ${primaryColor}`,
        }}
      />

      {/* Thanh công cụ Preview Mode nếu bật trong CRM */}
      {previewMode && (
        <div className="fixed top-2.5 inset-x-4 z-70 flex items-center justify-between px-4 py-2.5 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide uppercase">
              Bản Xem Trước Trực Quan — {config.name || 'Landing Web Timed Cards Opening'}
            </span>
            {config.subdomain && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-white/10 text-amber-300 border border-white/10">
                https://{config.subdomain}.ceo1983.viconnect.vn
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {onEditConfig && (
              <button
                type="button"
                onClick={onEditConfig}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer"
              >
                Chỉnh sửa Dynamic
              </button>
            )}
            {onClosePreview && (
              <button
                type="button"
                onClick={onClosePreview}
                className="size-8 grid place-items-center rounded-xl bg-white/10 hover:bg-rose-500/80 text-white transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* FULLSCREEN BACKGROUND WITH ACTIVE CARD */}
      <div className="absolute inset-0 z-0">
        <div
          key={currentSlide.id}
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out transform scale-100 filter brightness-90 animate-in fade-in zoom-in-105 duration-700"
          style={{ backgroundImage: `url(${currentSlide.image})` }}
        />
        {/* Soft Vignette & Gradient Overlays for perfect typography contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50" />
      </div>

      {/* HEADER NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 py-5 sm:py-7 backdrop-blur-[2px]">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleSelectSlide(0)}>
          <div
            className="size-9 rounded-xl grid place-items-center text-white shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <Globe className="size-5" />
          </div>
          <span className="font-extrabold tracking-widest text-sm sm:text-base uppercase text-white/95">
            {config.brand?.logoText || 'Globe Express'}
          </span>
        </div>

        {/* Desktop Navigation Links with Tree Dropdown */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/90">
          {(config.navMenu || []).map((item, idx) => {
            const hasChildren = item.children && item.children.length > 0;
            const isDropdownOpen = openDropdownId === item.id;

            return (
              <div
                key={item.id || idx}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenDropdownId(item.id)}
                onMouseLeave={() => hasChildren && setOpenDropdownId(null)}
              >
                <button
                  type="button"
                  onClick={() => handleMenuItemClick(item)}
                  className={`group relative py-1.5 flex items-center gap-1.5 hover:text-white transition cursor-pointer ${
                    item.active ? 'text-white' : 'text-white/80'
                  }`}
                >
                  <span>{item.label}</span>
                  {hasChildren && <ChevronDown className="size-3.5 opacity-60 group-hover:opacity-100 transition" />}
                  {item.active && (
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: primaryColor }}
                    />
                  )}
                </button>

                {/* Tree Dropdown Hierarchical Panel */}
                {hasChildren && isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 p-2.5 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/15 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                    <div className="px-3 py-1.5 border-b border-white/10 mb-1 flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Danh mục phân nhánh</span>
                      <Sparkles className="size-3 text-amber-400" />
                    </div>
                    {renderTreeDropdownNodes(item.children!)}
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex items-center gap-4 pl-3 border-l border-white/20">
            <button
              type="button"
              className="size-8 grid place-items-center rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="Tìm kiếm"
            >
              <Search className="size-4" />
            </button>
            <button
              type="button"
              className="size-8 grid place-items-center rounded-full hover:bg-white/10 text-white/80 hover:text-white transition cursor-pointer"
              title="Tài khoản"
            >
              <User className="size-4" />
            </button>
          </div>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden size-9 grid place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition cursor-pointer"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* MOBILE FULL-SCREEN MENU WITH TREE */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl p-6 flex flex-col justify-between md:hidden animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <Globe className="size-5 text-amber-400" />
              <span className="font-black text-sm uppercase tracking-wider text-white">
                {config.brand?.logoText || 'Menu Quản Trị'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="size-8 grid place-items-center rounded-xl bg-white/10 text-white"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="py-6 overflow-y-auto flex-1 space-y-4">
            {(config.navMenu || []).map((item) => (
              <div key={item.id} className="space-y-2">
                <div
                  onClick={() => handleMenuItemClick(item)}
                  className="flex items-center justify-between py-2 text-base font-bold text-white uppercase tracking-wider cursor-pointer"
                >
                  <span>{item.label}</span>
                  {item.children && <ChevronDown className="size-4 text-slate-400" />}
                </div>
                {item.children && renderTreeDropdownNodes(item.children)}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Hotline: {config.brand?.contactPhone || '0983.1983.83'}</span>
            <span className="text-amber-400 font-bold">CEO 1983</span>
          </div>
        </div>
      )}

      {/* MAIN LEFT HERO CONTENT: DUAL SPLIT TYPOGRAPHY (GIULIO CUSCITO RECREATION) */}
      <div className="absolute top-[22%] sm:top-[25%] left-6 sm:left-14 max-w-xl z-20 space-y-4">
        {/* Place Indicator with Top Horizontal Bar */}
        <div className="space-y-2">
          <div className="w-8 h-1 rounded-full bg-white shadow-xs" />
          <div className="text-sm sm:text-base tracking-[0.2em] font-bold uppercase text-white/90">
            {currentSlide.place}
          </div>
        </div>

        {/* Dual Split Headline Typography (Oswald/Inter 60-72px style) */}
        <div className="space-y-0 tracking-tight leading-[0.95]">
          <h1
            key={`t1-${currentSlide.id}`}
            className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase text-white drop-shadow-md animate-in slide-in-from-bottom-6 duration-500"
            style={{ fontFamily: 'Oswald, Inter, sans-serif' }}
          >
            {currentSlide.title1}
          </h1>
          <h2
            key={`t2-${currentSlide.id}`}
            className="text-5xl sm:text-7xl lg:text-8xl font-black uppercase text-white drop-shadow-md animate-in slide-in-from-bottom-8 duration-600 delay-100"
            style={{ fontFamily: 'Oswald, Inter, sans-serif' }}
          >
            {currentSlide.title2}
          </h2>
        </div>

        {/* Description Paragraph */}
        <p
          key={`desc-${currentSlide.id}`}
          className="text-xs sm:text-sm text-slate-200/90 leading-relaxed max-w-md pt-2 line-clamp-4 animate-in fade-in duration-500 delay-200"
        >
          {currentSlide.description}
        </p>

        {/* CTA Group: Bookmark Round Button + Pill Discover Button */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="button"
            onClick={() => toggleBookmark(currentSlide.id)}
            className={`size-11 sm:size-12 rounded-full grid place-items-center transition duration-200 cursor-pointer shadow-lg active:scale-95 ${
              bookmarkedIds[currentSlide.id] ? 'brightness-125' : 'hover:brightness-110'
            }`}
            style={{ backgroundColor: primaryColor }}
            title="Lưu vào danh sách yêu thích"
          >
            <Bookmark
              className="size-5 text-white"
              fill={bookmarkedIds[currentSlide.id] ? '#ffffff' : 'transparent'}
            />
          </button>

          <button
            type="button"
            onClick={() => handleCtaClick(currentSlide)}
            className="group px-7 sm:px-8 py-3 rounded-full border border-white text-xs sm:text-sm font-bold tracking-widest uppercase text-white hover:bg-white hover:text-slate-900 transition duration-300 cursor-pointer shadow-lg active:scale-95 flex items-center gap-2"
          >
            <span>{currentSlide.ctaText || 'Discover Location'}</span>
            <ChevronRight className="size-4 group-hover:translate-x-1 transition duration-200" />
          </button>
        </div>
      </div>

      {/* BOTTOM RIGHT UPCOMING CARDS CAROUSEL */}
      {upcomingSlides.length > 0 && (
        <div className="absolute bottom-28 sm:bottom-32 right-6 sm:right-14 z-30 hidden sm:flex items-center gap-5">
          {upcomingSlides.map(({ slide, index }, i) => (
            <div
              key={slide.id || index}
              onClick={() => handleSelectSlide(index)}
              className="group relative w-44 sm:w-48 h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition duration-500 hover:-translate-y-2 border border-white/20 hover:border-white/60 active:scale-95"
            >
              <img
                src={slide.image}
                alt={slide.title1}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase truncate block">
                  {slide.place}
                </span>
                <h4 className="text-sm font-extrabold uppercase text-white tracking-wide truncate">
                  {slide.title1} {slide.title2}
                </h4>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOTTOM CONTROLS & PAGINATION BAR */}
      <div className="absolute bottom-8 left-6 sm:left-14 right-6 sm:right-14 z-40 flex items-center justify-between">
        {/* Scroll indicator: cuộn chuột hoặc vuốt để tự động chuyển section */}
        <div className="flex items-center gap-2.5 text-white/90 text-xs font-semibold select-none bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-sm">
          <span className="size-2 rounded-full bg-amber-400 animate-ping" />
          <span>Cuộn chuột hoặc vuốt để chuyển thẻ</span>
        </div>

        {/* Progress Sub-Bar & Active Slide Numbers */}
        <div className="flex items-center gap-4 sm:gap-6 flex-1 max-w-md mx-6">
          <div className="flex-1 h-0.5 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full transition-all duration-500 ease-out rounded-full"
              style={{
                width: `${((currentIndex + 1) / Math.max(slides.length, 1)) * 100}%`,
                backgroundColor: primaryColor,
              }}
            />
          </div>

          <div className="flex items-baseline gap-1 font-mono text-sm sm:text-base font-bold text-white shrink-0">
            <span className="text-xl sm:text-2xl font-black" style={{ color: primaryColor }}>
              {String(currentIndex + 1).padStart(2, '0')}
            </span>
            <span className="text-white/40">/</span>
            <span className="text-white/60">{String(slides.length).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Small brand info or direct actions */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-white/60">
          <span>{config.name || 'Timed Cards Opening'}</span>
          <span>•</span>
          <span className="text-amber-400 font-semibold">Giulio Cuscito Design</span>
        </div>
      </div>

      {/* INTERACTIVE SUB-SCREEN MODAL (CHO CÁC NÚT MENU CÂY & CTA) */}
      {activeSubScreen && (
        <div className="fixed inset-0 z-80 grid place-items-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-slate-900 border border-white/20 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-white">{activeSubScreen.title}</h3>
                {activeSubScreen.subtitle && (
                  <p className="text-xs text-amber-400 font-semibold">{activeSubScreen.subtitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveSubScreen(null);
                  setContactSubmitted(false);
                }}
                className="size-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed flex-1">
              {activeSubScreen.images && activeSubScreen.images.length > 0 && (
                <div className="rounded-2xl overflow-hidden mb-4 border border-white/10">
                  <img
                    src={activeSubScreen.images[0]}
                    alt={activeSubScreen.title}
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                </div>
              )}

              {activeSubScreen.contentHtml && (
                <div
                  className="prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeSubScreen.contentHtml) }}
                />
              )}

              {/* Form liên hệ nếu layout là contact_form */}
              {activeSubScreen.layout === 'contact_form' && (
                <div className="pt-2">
                  {contactSubmitted ? (
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
                      <CheckCircle className="size-8 text-emerald-400 mx-auto" />
                      <h4 className="text-sm font-bold text-white">Gửi thông tin thành công!</h4>
                      <p className="text-xs text-slate-300">
                        Chuyên viên Ban Thư Ký CLB CEO 1983 sẽ liên hệ với Anh/Chị trong vòng 24 giờ.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setContactSubmitted(true);
                      }}
                      className="space-y-3"
                    >
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Họ và tên của bạn *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          placeholder="Ví dụ: Doanh nhân Nguyễn Văn A"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-400"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Số điện thoại *</label>
                          <input
                            type="tel"
                            required
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                            placeholder="0983..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">Email</label>
                          <input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="name@company.vn"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-400"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1">Nhu cầu kết nối / ghi chú</label>
                        <textarea
                          rows={3}
                          value={contactForm.note}
                          onChange={(e) => setContactForm({ ...contactForm, note: e.target.value })}
                          placeholder="Nhập thông tin nhu cầu hoặc thắc mắc của bạn..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-xs focus:outline-hidden focus:border-amber-400"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-950 flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-98 transition cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Send className="size-4" />
                        <span>Gửi Thông Tin Kết Nối</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between text-xs text-slate-400">
              <span>Hệ Thống CEO 1983 Landing Platform</span>
              <button
                type="button"
                onClick={() => {
                  setActiveSubScreen(null);
                  setContactSubmitted(false);
                }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
