import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAuthorInfo(userId: string) {
    if (!userId || userId === '00000000-0000-0000-0000-000000000000') {
      return {
        id: 'system',
        name: 'Hội viên CEO 1983',
        avatar: '/ceo1983-emblem-8.png',
        company: 'CLB Doanh Nhân CEO 1983',
        role: 'Hội viên',
      };
    }

    try {
      const members = await this.prisma.$queryRaw<any[]>`
        SELECT id, code, contact, name, company_name, executive_role, avatar_url, avatar, department
        FROM public.members
        WHERE user_id::text = ${userId} OR id = ${userId} OR code = ${userId}
        LIMIT 1
      `.catch(() => []);

      if (members.length > 0) {
        const m = members[0];
        return {
          id: m.id || userId,
          name: m.contact || m.name || 'Hội viên CEO 1983',
          avatar: m.avatar_url || m.avatar || '/ceo1983-emblem-8.png',
          company: m.company_name || 'Doanh nghiệp CLB',
          role: m.executive_role || m.department || 'Hội viên chính thức',
        };
      }

      const users = await this.prisma.$queryRaw<any[]>`
        SELECT id, email, full_name, avatar_url, role
        FROM public.vione_users
        WHERE id::text = ${userId}
        LIMIT 1
      `.catch(() => []);

      if (users.length > 0) {
        const u = users[0];
        return {
          id: u.id,
          name: u.full_name || u.email?.split('@')[0] || 'Lãnh đạo CEO 1983',
          avatar: u.avatar_url || '/ceo1983-emblem-8.png',
          company: 'CLB Doanh Nhân CEO 1983',
          role: u.role || 'Thành viên',
        };
      }
    } catch {}

    return {
      id: userId,
      name: 'Lãnh đạo CEO 1983',
      avatar: '/ceo1983-emblem-8.png',
      company: 'CLB Doanh Nhân CEO 1983',
      role: 'Hội viên chính thức',
    };
  }

  private async ensureSeedFeed() {
    try {
      const check = await this.prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::int as cnt FROM public.feed_posts
      `.catch(() => [{ cnt: 0 }]);

      if (Number(check[0]?.cnt || 0) > 0) return;

      const seedPosts = [
        {
          title: 'Nghị quyết kỳ họp Ban Điều Hành: Triển khai chiến lược chuyển đổi số & liên minh giao thương 2026',
          content: 'Ban Điều Hành trân trọng gửi tới toàn thể quý Hội viên Nghị quyết định hướng quý 4/2026. Trọng tâm tập trung vào kết nối giao thương B2B nội bộ, đồng bộ ứng dụng di động hiệp hội và hỗ trợ xúc tiến hợp đồng giá trị cao giữa các doanh nghiệp thành viên.',
          category: 'news',
          department: 'Ban Điều Hành',
          author_name: 'Chủ Tịch & Ban Điều Hành',
          author_company: 'CLB Doanh Nhân CEO 1983',
          author_role: 'Chủ tịch CLB',
          author_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
          ],
          likes_count: 24,
          comments_count: 5,
        },
        {
          title: 'Khởi động chiến dịch nhận diện thương hiệu và bảo trợ truyền thông Doanh nhân 1983',
          content: 'Ban Truyền Thông chính thức ra mắt gói bảo trợ truyền thông độc quyền cho các hội viên chính thức. Mọi sản phẩm, dịch vụ đạt chuẩn chất lượng sẽ được truyền thông đa kênh trên các ấn phẩm chính thức của HanoiBA và mạng lưới báo đài đối tác.',
          category: 'news',
          department: 'Ban truyền thông',
          author_name: 'Ban Truyền Thông',
          author_company: 'CLB Doanh Nhân CEO 1983',
          author_role: 'Trưởng ban Truyền thông',
          author_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop&q=80',
          ],
          likes_count: 18,
          comments_count: 3,
        },
        {
          title: 'Cơ hội cung ứng thiết bị văn phòng & hạ tầng CNTT cho chuỗi dự án mới',
          content: 'Doanh nghiệp chúng tôi đang cần tìm kiếm đối tác cung ứng 50 bộ máy tính trạm và giải pháp mạng bảo mật cho chi nhánh mới tại Hà Nội. Ưu tiên tuyệt đối hợp tác cùng các doanh nghiệp anh chị em trong CLB CEO 1983!',
          category: 'opportunity',
          department: 'Ban xúc tiến',
          author_name: 'Doanh nhân Nguyễn Tuấn Anh',
          author_company: 'Công ty CP Giải Pháp Công Nghệ Số',
          author_role: 'Tổng Giám Đốc',
          author_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80',
          ],
          likes_count: 31,
          comments_count: 8,
        },
        {
          title: 'Đại tiệc Gala Dinner & Hội Thảo Kết Nối Giao Thương Thường Niên 2026',
          content: 'Sự kiện lớn nhất trong năm của đại gia đình CEO 1983! Đêm hội tụ hơn 250+ CEO lãnh đạo, chương trình vinh danh doanh nghiệp tiêu biểu, quay số trúng thưởng may mắn và cơ hội kết nối đối tác chiến lược.',
          category: 'event',
          department: 'Ban Điều Hành',
          author_name: 'Ban Thư Ký & Sự Kiện',
          author_company: 'CLB Doanh Nhân CEO 1983',
          author_role: 'Ban Tổ Chức Sự Kiện',
          author_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
          ],
          likes_count: 45,
          comments_count: 12,
        },
        {
          title: 'Giới thiệu giải pháp ERP Quản trị Doanh nghiệp tinh gọn cho CEO 1983',
          content: 'Sản phẩm mới trên sàn Marketplace: Phần mềm Quản trị nguồn lực tích hợp AI, tối ưu chi phí vận hành cho doanh nghiệp vừa và nhỏ. Đặc quyền chiết khấu 30% vĩnh viễn và miễn phí triển khai cho toàn thể hội viên CEO 1983.',
          category: 'marketplace',
          department: 'Ban xúc tiến',
          author_name: 'Doanh nhân Trần Đình Khang',
          author_company: 'Công ty Cổ phần Vione Software',
          author_role: 'Chủ tịch HĐQT',
          author_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
          images: [
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80',
          ],
          likes_count: 22,
          comments_count: 4,
        },
      ];

      for (const p of seedPosts) {
        const imgsJson = JSON.stringify(p.images || []);
        const inserted = await this.prisma.$queryRaw<any[]>`
          INSERT INTO public.feed_posts (
            author_id, author_name, author_avatar, author_company, author_role,
            title, content, category, department, images, likes_count, comments_count, shares_count, created_at, updated_at
          ) VALUES (
            'seed_author', ${p.author_name}, ${p.author_avatar}, ${p.author_company}, ${p.author_role},
            ${p.title}, ${p.content}, ${p.category}, ${p.department}, ${imgsJson}::jsonb, ${p.likes_count}, ${p.comments_count}, 5, NOW(), NOW()
          )
          RETURNING id
        `.catch(() => []);

        if (inserted.length > 0) {
          const postId = inserted[0].id;
          await this.prisma.$executeRaw`
            INSERT INTO public.feed_comments (post_id, author_id, author_name, author_avatar, content, created_at)
            VALUES 
              (${postId}::uuid, 'seed_c1', 'Phạm An Nam', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', 'Chúc mừng sáng kiến thiết thực của Ban Điều Hành! Chúng tôi sẽ tích cực tham gia kết nối.', NOW() - INTERVAL '1 hour'),
              (${postId}::uuid, 'seed_c2', 'Lê Hoàng Long', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', 'Rất đồng tình với định hướng quý này. Doanh nghiệp mình sẵn sàng chia sẻ nguồn lực hợp tác.', NOW() - INTERVAL '30 minutes')
          `.catch(() => {});
        }
      }

      // Đảm bảo các cuộc họp ban / gặp mặt CLB từ public.meetings cũng có bài đăng trong feed_posts (Requirement 4)
      const meetings = await this.prisma.$queryRaw<any[]>`
        SELECT id, title, date, time, location, department, status
        FROM public.meetings
        WHERE status != 'cancelled'
        LIMIT 5
      `.catch(() => []);

      for (const m of meetings) {
        const titlePost = `[LỊCH HỌP / GẶP MẶT] ${m.title}`;
        const existing = await this.prisma.$queryRaw<any[]>`
          SELECT id FROM public.feed_posts WHERE title = ${titlePost} LIMIT 1
        `.catch(() => []);

        if (existing.length === 0) {
          const dt = new Date(m.date);
          const dateStr = !isNaN(dt.getTime()) ? dt.toLocaleDateString('vi-VN') : 'Sắp diễn ra';
          await this.prisma.$executeRawUnsafe(`
            INSERT INTO public.feed_posts (
              id, author_id, author_name, author_avatar, author_company, author_role,
              title, content, category, department, images, likes_count, comments_count, shares_count, created_at, updated_at
            ) VALUES (
              gen_random_uuid(), 'meeting_host', $1, '/ceo1983-emblem-8.png', 'CLB Doanh Nhân CEO 1983', 'Ban Điều Hành',
              $2, $3, 'EVENT_MEETING', $4, '[]'::jsonb, 5, 2, 1, NOW(), NOW()
            )
          `,
            m.department || 'Ban Điều Hành',
            titlePost,
            `Cuộc gặp mặt & Họp ban: "${m.title}".\n- Thời gian: ${m.time || '09:30'} ngày ${dateStr}\n- Địa điểm: ${m.location || 'Văn phòng Hiệp hội CEO 1983'}\n- Ban phụ trách: ${m.department || 'Ban Điều Hành'}\n- Trạng thái: ${m.status === 'completed' ? 'Đã hoàn thành' : 'Sắp diễn ra'}`,
            m.department || 'Ban Điều Hành'
          ).catch(() => {});
        }
      }
    } catch (e: any) {
      console.warn('ensureSeedFeed error:', e?.message);
    }
  }

  async listFeed(params: {
    category?: string;
    department?: string;
    q?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    await this.ensureSeedFeed();

    const category = params.category && params.category !== 'all' ? params.category : null;
    const department = params.department && params.department !== 'all' ? params.department : null;
    const q = params.q ? params.q.trim().toLowerCase() : null;
    const userId = params.userId || '';
    const limit = Math.min(params.limit || 30, 100);
    const offset = Math.max(0, ((params.page || 1) - 1) * limit);

    // Build raw SQL dynamically
    let queryStr = `SELECT * FROM public.feed_posts WHERE 1=1`;
    const queryParams: any[] = [];
    let pIdx = 1;

    if (category) {
      queryStr += ` AND category = $${pIdx++}`;
      queryParams.push(category);
    }

    if (department) {
      queryStr += ` AND (department ILIKE $${pIdx} OR content ILIKE $${pIdx})`;
      queryParams.push(`%${department}%`);
      pIdx++;
    }

    if (q) {
      queryStr += ` AND (title ILIKE $${pIdx} OR content ILIKE $${pIdx} OR author_name ILIKE $${pIdx} OR author_company ILIKE $${pIdx})`;
      queryParams.push(`%${q}%`);
      pIdx++;
    }

    queryStr += ` ORDER BY created_at DESC LIMIT $${pIdx++} OFFSET $${pIdx++}`;
    queryParams.push(limit, offset);

    const posts = await (this.prisma as any).$queryRawUnsafe(queryStr, ...queryParams).catch(() => []);

    // Also get likes for the current user
    let userLikedPostIds = new Set<string>();
    if (userId && posts.length > 0) {
      const postIds = posts.map((p: any) => p.id);
      const likes = await this.prisma.$queryRaw<any[]>`
        SELECT post_id FROM public.feed_likes
        WHERE user_id = ${userId} AND post_id = ANY(${postIds}::uuid[])
      `.catch(() => []);
      userLikedPostIds = new Set(likes.map((l: any) => String(l.post_id)));
    }

    return posts.map((p: any) => {
      let imgs: string[] = [];
      try {
        imgs = typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []);
        if (!Array.isArray(imgs)) imgs = [];
      } catch {
        imgs = [];
      }

      return {
        id: p.id,
        author: {
          id: p.author_id,
          name: p.author_name || 'Lãnh đạo CEO 1983',
          avatar: p.author_avatar || '/ceo1983-emblem-8.png',
          company: p.author_company || 'CLB Doanh Nhân CEO 1983',
          role: p.author_role || 'Hội viên chính thức',
        },
        title: p.title || '',
        content: p.content,
        category: p.category || 'news',
        department: p.department || null,
        images: imgs,
        likesCount: Number(p.likes_count || 0),
        commentsCount: Number(p.comments_count || 0),
        sharesCount: Number(p.shares_count || 0),
        isLiked: userLikedPostIds.has(String(p.id)),
        createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
        updatedAt: p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString(),
      };
    });
  }

  async createPost(userId: string, data: {
    title?: string;
    content: string;
    category?: string;
    department?: string;
    images?: string[];
  }) {
    if (!data.content || !data.content.trim()) {
      throw new BadRequestException('Nội dung bài viết không được để trống.');
    }

    const author = await this.getAuthorInfo(userId);
    const category = data.category || 'news';
    const department = data.department || null;
    const title = data.title?.trim() || null;
    const content = data.content.trim();
    const imgsJson = JSON.stringify(Array.isArray(data.images) ? data.images : []);

    const inserted = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.feed_posts (
        author_id, author_name, author_avatar, author_company, author_role,
        title, content, category, department, images, likes_count, comments_count, shares_count, created_at, updated_at
      ) VALUES (
        ${author.id}, ${author.name}, ${author.avatar}, ${author.company}, ${author.role},
        ${title}, ${content}, ${category}, ${department}, ${imgsJson}::jsonb, 0, 0, 0, NOW(), NOW()
      )
      RETURNING *
    `;

    const p = inserted[0];
    return {
      ok: true,
      post: {
        id: p.id,
        author,
        title: p.title,
        content: p.content,
        category: p.category,
        department: p.department,
        images: data.images || [],
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async toggleLike(userId: string, postId: string) {
    if (!userId || !postId) {
      throw new BadRequestException('Thông tin người dùng hoặc bài viết không hợp lệ.');
    }

    const existing = await this.prisma.$queryRaw<any[]>`
      SELECT id FROM public.feed_likes
      WHERE user_id = ${userId} AND post_id = ${postId}::uuid
      LIMIT 1
    `.catch(() => []);

    let isLiked = false;
    if (existing.length > 0) {
      // Unlike
      await this.prisma.$executeRaw`
        DELETE FROM public.feed_likes WHERE id = ${existing[0].id}::uuid
      `;
      await this.prisma.$executeRaw`
        UPDATE public.feed_posts
        SET likes_count = GREATEST(0, likes_count - 1), updated_at = NOW()
        WHERE id = ${postId}::uuid
      `;
      isLiked = false;
    } else {
      // Like
      await this.prisma.$executeRaw`
        INSERT INTO public.feed_likes (post_id, user_id, created_at)
        VALUES (${postId}::uuid, ${userId}, NOW())
        ON CONFLICT DO NOTHING
      `;
      await this.prisma.$executeRaw`
        UPDATE public.feed_posts
        SET likes_count = likes_count + 1, updated_at = NOW()
        WHERE id = ${postId}::uuid
      `;
      isLiked = true;
    }

    const postRow = await this.prisma.$queryRaw<any[]>`
      SELECT likes_count FROM public.feed_posts WHERE id = ${postId}::uuid LIMIT 1
    `.catch(() => [{ likes_count: 0 }]);

    return {
      ok: true,
      liked: isLiked,
      likesCount: Number(postRow[0]?.likes_count || 0),
    };
  }

  async listComments(postId: string) {
    if (!postId) return [];
    const comments = await this.prisma.$queryRaw<any[]>`
      SELECT * FROM public.feed_comments
      WHERE post_id = ${postId}::uuid
      ORDER BY created_at ASC
    `.catch(() => []);

    return comments.map((c) => ({
      id: c.id,
      postId: c.post_id,
      author: {
        id: c.author_id,
        name: c.author_name || 'Hội viên',
        avatar: c.author_avatar || '/ceo1983-emblem-8.png',
      },
      content: c.content,
      createdAt: c.created_at ? new Date(c.created_at).toISOString() : new Date().toISOString(),
    }));
  }

  async addComment(userId: string, postId: string, content: string) {
    if (!content || !content.trim()) {
      throw new BadRequestException('Nội dung bình luận không được để trống.');
    }

    const author = await this.getAuthorInfo(userId);
    const text = content.trim();

    const inserted = await this.prisma.$queryRaw<any[]>`
      INSERT INTO public.feed_comments (post_id, author_id, author_name, author_avatar, content, created_at)
      VALUES (${postId}::uuid, ${author.id}, ${author.name}, ${author.avatar}, ${text}, NOW())
      RETURNING *
    `;

    await this.prisma.$executeRaw`
      UPDATE public.feed_posts
      SET comments_count = comments_count + 1, updated_at = NOW()
      WHERE id = ${postId}::uuid
    `.catch(() => {});

    const c = inserted[0];
    return {
      ok: true,
      comment: {
        id: c.id,
        postId: c.post_id,
        author: {
          id: author.id,
          name: author.name,
          avatar: author.avatar,
        },
        content: c.content,
        createdAt: new Date().toISOString(),
      },
    };
  }

  async sharePost(postId: string) {
    await this.prisma.$executeRaw`
      UPDATE public.feed_posts
      SET shares_count = shares_count + 1, updated_at = NOW()
      WHERE id = ${postId}::uuid
    `.catch(() => {});

    const postRow = await this.prisma.$queryRaw<any[]>`
      SELECT shares_count FROM public.feed_posts WHERE id = ${postId}::uuid LIMIT 1
    `.catch(() => [{ shares_count: 0 }]);

    return {
      ok: true,
      sharesCount: Number(postRow[0]?.shares_count || 0),
    };
  }
}
