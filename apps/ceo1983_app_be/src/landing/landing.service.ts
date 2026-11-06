import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LandingMenuItem {
  id: string;
  label: string;
  active?: boolean;
  icon?: string;
  badge?: string;
  type: 'link' | 'tree_dropdown' | 'modal_screen' | 'api_view';
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
  layout: 'article' | 'grid_cards' | 'contact_form' | 'api_feed';
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
  fieldMapping: {
    place?: string;
    title1?: string;
    title2?: string;
    description?: string;
    image?: string;
    ctaText?: string;
    ctaLink?: string;
  };
}

export interface LandingWebConfig {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  isPublished: boolean;
  template: 'timed_cards_opening' | 'ceo1983_executive' | 'startup_mobile_showcase';
  theme: {
    primaryColor: string;
    secondaryColor?: string;
    textColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
  };
  brand: {
    logoText: string;
    logoIcon?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
  navMenu: LandingMenuItem[];
  slides: LandingSlide[];
  subScreens: LandingSubScreen[];
  apiConfig: LandingApiConfig;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_TIMED_CARDS_SLIDES: LandingSlide[] = [
  {
    id: 'slide-1',
    place: 'Switzerland Alps',
    title1: 'SAINT',
    title2: 'ANTONIEN',
    description: "Tucked away in the Switzerland Alps, Saint Antönien offers an idyllic retreat for those seeking tranquility and adventure alike. It's a hidden gem for backcountry skiing in winter and boasts lush trails for hiking and mountain biking during the warmer months.",
    image: 'https://assets.codepen.io/3685267/timed-cards-1.jpg',
    ctaText: 'Discover Location',
    ctaLink: '#discover',
  },
  {
    id: 'slide-2',
    place: 'Japan Alps',
    title1: 'NAGANO',
    title2: 'PREFECTURE',
    description: "Nagano Prefecture, set within the majestic Japan Alps, is a cultural treasure trove with its historic shrines and temples, particularly the famous Zenkō-ji. The region is also a hotspot for skiing and snowboarding, offering some of the country's best powder.",
    image: 'https://assets.codepen.io/3685267/timed-cards-2.jpg',
    ctaText: 'Discover Location',
    ctaLink: '#discover',
  },
  {
    id: 'slide-3',
    place: 'Sahara Desert - Morocco',
    title1: 'MARRAKECH',
    title2: 'MERZOUGA',
    description: "The journey from the vibrant souks and palaces of Marrakech to the tranquil, starlit sands of Merzouga showcases the diverse splendor of Morocco. Camel treks and desert camps offer an unforgettable immersion into the nomadic way of life.",
    image: 'https://assets.codepen.io/3685267/timed-cards-3.jpg',
    ctaText: 'Discover Location',
    ctaLink: '#discover',
  },
  {
    id: 'slide-4',
    place: 'Sierra Nevada - USA',
    title1: 'YOSEMITE',
    title2: 'NATIONAL PARK',
    description: "Yosemite National Park is a showcase of the American wilderness, revered for its towering granite monoliths, ancient giant sequoias, and thundering waterfalls. The park offers year-round recreational activities, from rock climbing to serene valley walks.",
    image: 'https://assets.codepen.io/3685267/timed-cards-4.jpg',
    ctaText: 'Discover Location',
    ctaLink: '#discover',
  },
  {
    id: 'slide-5',
    place: 'Tarifa - Spain',
    title1: 'LOS LANCES',
    title2: 'BEACH',
    description: "Los Lances Beach in Tarifa is a coastal paradise known for its consistent winds, making it a world-renowned spot for kitesurfing and windsurfing. The beach's long, sandy shores provide ample space for relaxation and sunbathing, with a vibrant atmosphere of beach bars and cafes.",
    image: 'https://assets.codepen.io/3685267/timed-cards-5.jpg',
    ctaText: 'Discover Location',
    ctaLink: '#discover',
  },
  {
    id: 'slide-6',
    place: 'Cappadocia - Turkey',
    title1: 'GÖREME',
    title2: 'VALLEY',
    description: "Göreme Valley in Cappadocia is a historical marvel set against a unique geological backdrop, where centuries of wind and water have sculpted the landscape into whimsical formations. The valley is also famous for its open-air museums, underground cities, and the enchanting experience of hot air ballooning.",
    image: 'https://assets.codepen.io/3685267/timed-cards-6.jpg',
    ctaText: 'Discover Location',
    ctaLink: '#discover',
  },
];

const DEFAULT_TIMED_CARDS_NAV: LandingMenuItem[] = [
  { id: 'm-1', label: 'Home', active: true, type: 'link', url: '#home' },
  {
    id: 'm-2',
    label: 'Destinations',
    type: 'tree_dropdown',
    children: [
      {
        id: 'm-2-1',
        label: 'Châu Âu & Dãy Alps',
        badge: 'Hot',
        type: 'modal_screen',
        subScreenId: 'scr-alps',
        children: [
          { id: 'm-2-1-1', label: 'Saint Antönien (Thụy Sĩ)', type: 'modal_screen', subScreenId: 'scr-alps' },
          { id: 'm-2-1-2', label: 'Los Lances Beach (Tây Ban Nha)', type: 'modal_screen', subScreenId: 'scr-spain' },
        ],
      },
      {
        id: 'm-2-2',
        label: 'Châu Á & Trung Đông',
        type: 'tree_dropdown',
        children: [
          { id: 'm-2-2-1', label: 'Nagano Prefecture (Nhật Bản)', type: 'modal_screen', subScreenId: 'scr-japan' },
          { id: 'm-2-2-2', label: 'Göreme Valley (Thổ Nhĩ Kỳ)', type: 'modal_screen', subScreenId: 'scr-turkey' },
        ],
      },
      {
        id: 'm-2-3',
        label: 'Châu Mỹ & Châu Phi',
        type: 'tree_dropdown',
        children: [
          { id: 'm-2-3-1', label: 'Yosemite National Park (Mỹ)', type: 'modal_screen', subScreenId: 'scr-yosemite' },
          { id: 'm-2-3-2', label: 'Sa Mạc Sahara (Morocco)', type: 'modal_screen', subScreenId: 'scr-sahara' },
        ],
      },
    ],
  },
  {
    id: 'm-3',
    label: 'Holidays',
    type: 'tree_dropdown',
    children: [
      { id: 'm-3-1', label: 'Trượt tuyết mùa đông', type: 'link', url: '#skiing' },
      { id: 'm-3-2', label: 'Du lịch mạo hiểm sa mạc', type: 'link', url: '#safari' },
      { id: 'm-3-3', label: 'Nghỉ dưỡng bãi biển nhiệt đới', type: 'link', url: '#beach' },
    ],
  },
  { id: 'm-4', label: 'Offers', type: 'modal_screen', subScreenId: 'scr-offers' },
  { id: 'm-5', label: 'Contact', type: 'modal_screen', subScreenId: 'scr-contact' },
];

const DEFAULT_SUB_SCREENS: LandingSubScreen[] = [
  {
    id: 'scr-alps',
    title: 'Khám Phá Dãy Alps Thụy Sĩ — Saint Antönien',
    subtitle: 'Kỳ nghỉ thiên đường tại đỉnh cao của sự tĩnh lặng và mạo hiểm',
    layout: 'article',
    contentHtml: `<p>Ẩn mình giữa dãy Alps Thụy Sĩ hùng vĩ, Saint Antönien là điểm đến lý tưởng cho những ai khao khát tìm kiếm sự thanh bình kết hợp cùng tinh thần chinh phục mạo hiểm.</p><p>Vào mùa đông, đây là viên ngọc quý với những sườn dốc tuyết trắng nguyên sơ hoàn hảo cho bộ môn trượt tuyết việt dã (backcountry skiing). Khi hè sang, thung lũng khoác lên mình tấm áo xanh mướt với những cung đường mòn uốn lượn dành cho leo núi và xe đạp địa hình.</p>`,
    images: ['https://assets.codepen.io/3685267/timed-cards-1.jpg'],
    ctaButton: { label: 'Đặt Tour Trải Nghiệm', action: 'book_alps' },
  },
  {
    id: 'scr-offers',
    title: 'Gói Ưu Đãi Đặc Quyền Du Lịch & Trải Nghiệm',
    subtitle: 'Chương trình hợp tác độc quyền cùng Hiệp hội Doanh nhân CEO 1983',
    layout: 'article',
    contentHtml: `<p>Nhận ngay ưu đãi 25% cho tất cả hội viên CEO 1983 khi đặt dịch vụ nghỉ dưỡng cao cấp và tour khám phá quốc tế.</p>`,
    ctaButton: { label: 'Nhận Mã Ưu Đãi', action: 'claim_offer' },
  },
  {
    id: 'scr-contact',
    title: 'Liên Hệ & Hỗ Trợ Đặt Chỗ',
    subtitle: 'Đội ngũ chuyên viên tư vấn cao cấp luôn sẵn sàng đồng hành 24/7',
    layout: 'contact_form',
    contentHtml: `<p>Hotline: 0983.1983.83 — Email: contact@ceo1983.viconnect.vn</p>`,
  },
];

const SETTINGS_KEY = 'crm_landing_webs_configs';

@Injectable()
export class LandingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy toàn bộ danh sách Landing Web đã cấu hình
   */
  async getAllLandingWebs(): Promise<LandingWebConfig[]> {
    const rows = await this.prisma.$queryRaw<{ value: any }[]>`
      SELECT value FROM public.app_settings WHERE key = ${SETTINGS_KEY} LIMIT 1
    `.catch(() => []);

    let list: LandingWebConfig[] = [];
    if (rows && rows.length > 0 && rows[0]?.value) {
      const val = typeof rows[0].value === 'string' ? JSON.parse(rows[0].value) : rows[0].value;
      if (Array.isArray(val)) list = val;
      else if (val && typeof val === 'object') list = Object.values(val);
    }

    let modified = false;
    // Đảm bảo luôn có Mẫu 1: Timed Cards Opening (Pinterest Giulio Cuscito)
    if (!list.some((w) => w.template === 'timed_cards_opening')) {
      const t1 = this.generateDefaultTemplate(
        'timed_cards_opening',
        'Khám Phá Toàn Cầu — Timed Cards Opening',
        'kham-pha-toan-cau',
        'khampha',
      );
      list.unshift(t1);
      modified = true;
    }

    // Đảm bảo luôn có Mẫu 2: Startup Mobile Showcase (Pinterest 234398355598861981 - Chuẩn ceo1983.com)
    if (!list.some((w) => w.template === 'startup_mobile_showcase')) {
      const t2 = this.generateDefaultTemplate(
        'startup_mobile_showcase',
        'Ứng Dụng Di Động CEO 1983 — Startup Mobile Showcase',
        'app-ceo1983',
        'app',
      );
      list.push(t2);
      modified = true;
    }

    if (modified || list.length === 0) {
      await this.saveAllLandingWebs(list);
    }

    return list;
  }

  /**
   * Lưu toàn bộ mảng Landing Web vào CSDL
   */
  private async saveAllLandingWebs(list: LandingWebConfig[]): Promise<void> {
    const jsonStr = JSON.stringify(list);
    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO public.app_settings (key, value, updated_at)
      VALUES ($1, $2::jsonb, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW()
      `,
      SETTINGS_KEY,
      jsonStr,
    );
  }

  /**
   * Lấy chi tiết một Landing Web theo ID
   */
  async getLandingWebById(id: string): Promise<LandingWebConfig> {
    const list = await this.getAllLandingWebs();
    const item = list.find((w) => w.id === id);
    if (!item) throw new NotFoundException(`Không tìm thấy cấu hình Landing Web với mã: ${id}`);
    return item;
  }

  /**
   * Tạo mới một Landing Web từ Template
   */
  async createLandingWeb(data: {
    name: string;
    slug: string;
    subdomain?: string;
    template?: 'timed_cards_opening' | 'ceo1983_executive' | 'startup_mobile_showcase';
  }): Promise<LandingWebConfig> {
    const list = await this.getAllLandingWebs();

    // Chuẩn hóa slug
    const safeSlug = (data.slug || data.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    if (list.some((w) => w.slug === safeSlug)) {
      throw new BadRequestException(`Đường dẫn slug "${safeSlug}" đã tồn tại. Vui lòng chọn slug khác.`);
    }

    if (data.subdomain) {
      const safeSub = data.subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
      if (list.some((w) => w.subdomain === safeSub)) {
        throw new BadRequestException(`Tên miền phụ Subdomain "${safeSub}" đã được gán cho một trang khác.`);
      }
    }

    const tpl = data.template || 'timed_cards_opening';
    const newConfig = this.generateDefaultTemplate(tpl, data.name, safeSlug, data.subdomain);
    list.push(newConfig);

    await this.saveAllLandingWebs(list);
    return newConfig;
  }

  /**
   * Cập nhật toàn diện cấu hình Dynamic của Landing Web
   */
  async updateLandingWeb(id: string, updateData: Partial<LandingWebConfig>): Promise<LandingWebConfig> {
    const list = await this.getAllLandingWebs();
    const idx = list.findIndex((w) => w.id === id);
    if (idx === -1) throw new NotFoundException(`Không tìm thấy Landing Web để cập nhật (ID: ${id})`);

    // Kiểm tra trùng lặp slug nếu sửa slug
    if (updateData.slug && updateData.slug !== list[idx].slug) {
      const slugExists = list.some((w) => w.id !== id && w.slug === updateData.slug);
      if (slugExists) throw new BadRequestException(`Slug "${updateData.slug}" đã bị trùng.`);
    }

    // Kiểm tra trùng lặp subdomain nếu sửa subdomain
    if (updateData.subdomain && updateData.subdomain !== list[idx].subdomain) {
      const subExists = list.some((w) => w.id !== id && w.subdomain === updateData.subdomain);
      if (subExists) throw new BadRequestException(`Subdomain "${updateData.subdomain}" đã bị trùng.`);
    }

    const current = list[idx];
    const updated: LandingWebConfig = {
      ...current,
      ...updateData,
      id: current.id, // giữ nguyên ID gốc
      updatedAt: new Date().toISOString(),
    };

    list[idx] = updated;
    await this.saveAllLandingWebs(list);
    return updated;
  }

  /**
   * Xóa một Landing Web
   */
  async deleteLandingWeb(id: string): Promise<{ success: boolean; message: string }> {
    const list = await this.getAllLandingWebs();
    const filtered = list.filter((w) => w.id !== id);
    if (filtered.length === list.length) {
      throw new NotFoundException(`Không tìm thấy Landing Web có ID: ${id}`);
    }
    await this.saveAllLandingWebs(filtered);
    return { success: true, message: 'Đã xóa cấu hình Landing Web thành công' };
  }

  /**
   * Áp dụng Subdomain cho Landing Web
   */
  async applySubdomain(id: string, subdomain: string): Promise<LandingWebConfig> {
    const cleanSub = (subdomain || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
    if (!cleanSub) {
      throw new BadRequestException('Vui lòng nhập subdomain hợp lệ (chữ cái thường, chữ số và dấu gạch nối)');
    }

    const list = await this.getAllLandingWebs();
    const exists = list.some((w) => w.id !== id && w.subdomain === cleanSub);
    if (exists) {
      throw new BadRequestException(`Subdomain "${cleanSub}" đã được đăng ký bởi trang khác.`);
    }

    return this.updateLandingWeb(id, { subdomain: cleanSub, isPublished: true });
  }

  /**
   * Lấy cấu hình công khai phục vụ Render trên Subdomain hoặc Slug công khai
   */
  async getPublicLandingWeb(slugOrSubdomain: string): Promise<LandingWebConfig> {
    const list = await this.getAllLandingWebs();
    const target = (slugOrSubdomain || '').toLowerCase().trim();

    const matched = list.find(
      (w) => (w.slug && w.slug.toLowerCase() === target) || (w.subdomain && w.subdomain.toLowerCase() === target),
    );

    if (!matched) {
      throw new NotFoundException(`Không tìm thấy trang Landing Web với định danh: ${slugOrSubdomain}`);
    }

    // Nếu cấu hình API Động đang bật, tự động nạp dữ liệu từ API và cập nhật danh sách slides
    if (matched.apiConfig?.enabled && matched.apiConfig?.endpointUrl) {
      try {
        const dynamicSlides = await this.fetchDynamicSlidesFromApi(matched.apiConfig);
        if (dynamicSlides && dynamicSlides.length > 0) {
          matched.slides = dynamicSlides;
        }
      } catch (err: any) {
        console.warn(`[LandingService] Lỗi nạp API động cho ${matched.slug}:`, err?.message);
      }
    }

    return matched;
  }

  /**
   * Kiểm tra và nạp thử dữ liệu từ API người dùng cấu hình
   */
  async testApiConnector(apiConfig: LandingApiConfig): Promise<{ success: boolean; count: number; sampleSlides: LandingSlide[]; rawCount: number }> {
    if (!apiConfig.endpointUrl) {
      throw new BadRequestException('Vui lòng cung cấp URL Endpoint API');
    }

    const slides = await this.fetchDynamicSlidesFromApi(apiConfig);
    return {
      success: true,
      count: slides.length,
      sampleSlides: slides.slice(0, 6),
      rawCount: slides.length,
    };
  }

  /**
   * Cơ chế gọi API động nội bộ hoặc ngoài và ánh xạ vào LandingSlide
   */
  private async fetchDynamicSlidesFromApi(apiConfig: LandingApiConfig): Promise<LandingSlide[]> {
    let url = apiConfig.endpointUrl.trim();
    if (url.startsWith('/')) {
      // Nội bộ hệ thống
      url = `http://127.0.0.1:${process.env.PORT || 4000}${url}`;
    }

    const resp = await fetch(url, {
      method: apiConfig.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(apiConfig.headers || {}),
      },
    });

    if (!resp.ok) {
      throw new Error(`Endpoint trả về mã lỗi HTTP ${resp.status}: ${resp.statusText}`);
    }

    const json = await resp.json();
    let items: any[] = [];
    if (Array.isArray(json)) {
      items = json;
    } else if (apiConfig.rootPath && json[apiConfig.rootPath] && Array.isArray(json[apiConfig.rootPath])) {
      items = json[apiConfig.rootPath];
    } else if (json.data && Array.isArray(json.data)) {
      items = json.data;
    } else if (json.items && Array.isArray(json.items)) {
      items = json.items;
    } else {
      // Tìm mảng đầu tiên trong object
      for (const k of Object.keys(json)) {
        if (Array.isArray(json[k])) {
          items = json[k];
          break;
        }
      }
    }

    if (!items || items.length === 0) return [];

    const m = apiConfig.fieldMapping;
    return items.map((raw, idx) => {
      const place = (m.place && raw[m.place]) || raw.company || raw.location || raw.industry || 'CEO 1983';
      const title = (m.title1 && raw[m.title1]) || raw.title || raw.name || `CHỦ ĐỀ #${idx + 1}`;
      
      // Tách title thành title1 và title2 nếu có
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
        img = DEFAULT_TIMED_CARDS_SLIDES[idx % DEFAULT_TIMED_CARDS_SLIDES.length].image;
      }

      const desc = (m.description && raw[m.description]) || raw.description || raw.summary || raw.content || 'Khám phá thông tin hợp tác kinh doanh và kết nối phát triển cùng CLB Doanh Nhân CEO 1983.';

      return {
        id: `dyn-slide-${raw.id || idx}`,
        place: String(place).toUpperCase(),
        title1: String(t1).toUpperCase(),
        title2: String(t2).toUpperCase(),
        description: String(desc).slice(0, 300),
        image: img,
        ctaText: (m.ctaText && raw[m.ctaText]) || 'Khám Phá Chi Tiết',
        ctaLink: (m.ctaLink && raw[m.ctaLink]) || `/association/opportunities?id=${raw.id || ''}`,
      };
    });
  }

  /**
   * Tạo cấu hình mẫu chuẩn
   */
  private generateDefaultTemplate(
    template: 'timed_cards_opening' | 'ceo1983_executive' | 'startup_mobile_showcase',
    name: string,
    slug?: string,
    subdomain?: string,
  ): LandingWebConfig {
    const isCeo = template === 'ceo1983_executive';
    const isStartupMobile = template === 'startup_mobile_showcase';
    const now = new Date().toISOString();
    const id = `lw_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    return {
      id,
      name,
      slug: slug || (isStartupMobile ? 'startup-mobile-showcase' : 'kham-pha-toan-cau'),
      subdomain: subdomain || (isStartupMobile ? 'mobile' : 'khampha'),
      isPublished: true,
      template,
      theme: {
        primaryColor: isCeo || isStartupMobile ? '#003B95' : '#ecad29',
        secondaryColor: isCeo || isStartupMobile ? '#ecad29' : '#1a1a1a',
        textColor: isStartupMobile ? '#0F172A' : '#FFFFFF',
        backgroundColor: isStartupMobile ? '#F8FAFC' : '#111317',
        fontFamily: 'Inter, Oswald, sans-serif',
      },
      brand: {
        logoText: isCeo || isStartupMobile ? 'CLB Doanh Nhân CEO 1983' : 'Globe Express',
        logoIcon: isStartupMobile ? 'smartphone' : (isCeo ? 'shield' : 'globe'),
        contactPhone: '0983.1983.83',
        contactEmail: 'contact@ceo1983.viconnect.vn',
      },
      navMenu: (isCeo || isStartupMobile)
        ? [
            { id: 'm-1', label: 'Trang Chủ', active: true, type: 'link', url: '#home' },
            {
              id: 'm-2',
              label: 'Hệ Sinh Thái App',
              type: 'tree_dropdown',
              children: [
                {
                  id: 'm-2-1',
                  label: 'Sàn Thương Mại B2B',
                  badge: 'Hot',
                  type: 'modal_screen',
                  subScreenId: 'scr-b2b',
                  children: [
                    { id: 'm-2-1-1', label: 'Phần mềm & Chuyển đổi số', type: 'modal_screen', subScreenId: 'scr-erp' },
                    { id: 'm-2-1-2', label: 'Thiết bị & Vật tư IoT', type: 'modal_screen', subScreenId: 'scr-iot' },
                  ],
                },
                {
                  id: 'm-2-2',
                  label: 'Lịch Gặp & Kết Nối 1-on-1',
                  type: 'modal_screen',
                  subScreenId: 'scr-connect',
                },
                {
                  id: 'm-2-3',
                  label: 'Thẻ Doanh Nhân Số & QR',
                  type: 'modal_screen',
                  subScreenId: 'scr-card',
                },
              ],
            },
            {
              id: 'm-3',
              label: 'Ban Điều Hành',
              type: 'modal_screen',
              subScreenId: 'scr-board',
            },
            { id: 'm-4', label: 'Hỏi Đáp FAQ', type: 'link', url: '#faq' },
            { id: 'm-5', label: 'Tải Ứng Dụng', type: 'link', url: '#download' },
          ]
        : DEFAULT_TIMED_CARDS_NAV,
      slides: isCeo
        ? [
            {
              id: 's-1',
              place: 'HÀ NỘI — VIỆT NAM',
              title1: 'KẾT NỐI',
              title2: 'DOANH NHÂN 1983',
              description: 'Cộng đồng Doanh nhân CEO 1983 quy tụ các nhà sáng lập, lãnh đạo doanh nghiệp sinh năm 1983 tiên phong đổi mới, cùng nhau kiến tạo chuỗi giá trị và liên kết giao thương bền vững trực thuộc HanoiBA.',
              image: 'https://ceo1983.viconnect.vn/ceo1983_hero_daylight_skyline.jpg',
              ctaText: 'Gia Nhập Ngay',
              ctaLink: '#register',
            },
            {
              id: 's-2',
              place: 'SÀN THƯƠNG MẠI NỘI KHỐI',
              title1: 'SẢN PHẨM',
              title2: 'TIÊU BIỂU B2B',
              description: 'Không gian kết nối giao thương nội khối, giới thiệu sản phẩm dịch vụ tiêu biểu và chuyển giao công nghệ giữa các thành viên với chính sách ưu đãi đặc quyền tối ưu.',
              image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1600',
              ctaText: 'Xem Gian Hàng',
              ctaLink: '#products',
            },
            {
              id: 's-3',
              place: 'DIỄN ĐÀN THƯỜNG NIÊN',
              title1: 'LEADERSHIP',
              title2: 'SUMMIT 2026',
              description: 'Sự kiện thường niên hội tụ các chuyên gia kinh tế, nhà hoạch định chiến lược và hơn 500 doanh nhân tiêu biểu thảo luận về xu hướng thị trường và cơ hội chuyển đổi số.',
              image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1600',
              ctaText: 'Đăng Ký Tham Dự',
              ctaLink: '#events',
            },
            {
              id: 's-4',
              place: 'HỢP TÁC CHIẾN LƯỢC',
              title1: 'GIAO THƯƠNG',
              title2: 'B2B MATCHING',
              description: 'Cơ chế ghép cặp B2B 1-on-1, trao đổi cơ hội kinh doanh thực chiến và thúc đẩy các gói hợp đồng giao thương quy mô hàng chục tỷ đồng minh bạch, hiệu quả.',
              image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600',
              ctaText: 'Lên Lịch Kết Nối',
              ctaLink: '#matching',
            },
          ]
        : DEFAULT_TIMED_CARDS_SLIDES,
      subScreens: DEFAULT_SUB_SCREENS,
      apiConfig: {
        enabled: false,
        endpointUrl: '/api/opportunities',
        method: 'GET',
        rootPath: '',
        fieldMapping: {
          place: 'company',
          title1: 'title',
          title2: 'industry',
          description: 'description',
          image: 'image',
          ctaText: 'ctaText',
        },
      },
      createdAt: now,
      updatedAt: now,
    };
  }
}

