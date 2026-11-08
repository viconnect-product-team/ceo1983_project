import { BadRequestException } from '@nestjs/common';
import { FeedService } from '../feed/feed.service';
import { ConnectAppGateway } from '../connect-app/connect-app.gateway';
import { PrismaService } from '../prisma/prisma.service';
import { createMockPrismaService } from '../__mocks__/prisma.service.mock';

describe('App Feed & Threaded Comments Tree Module', () => {
  let service: FeedService;
  let mockPrisma: any;
  let mockGateway: any;

  beforeEach(() => {
    mockPrisma = createMockPrismaService();
    mockGateway = {
      emitToAll: jest.fn(),
      emitNotification: jest.fn(),
    };
    service = new FeedService(
      mockPrisma as unknown as PrismaService,
      mockGateway as unknown as ConnectAppGateway,
    );
  });

  describe('createPost', () => {
    it('should create post and return post object', async () => {
      // Mock author query, insert query
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([]) // members
        .mockResolvedValueOnce([]) // users
        .mockResolvedValueOnce([
          {
            id: 'post-uuid-1',
            author_id: 'u1',
            author_name: 'Lãnh đạo CEO 1983',
            author_avatar: '/avatar.png',
            author_company: 'CLB',
            author_role: 'Admin',
            title: 'Họp BCH',
            content: 'Nội dung họp mặt kèm QR',
            category: 'meeting',
            department: null,
            images: [],
            privacy: 'public',
            external_link: null,
            shared_article: null,
            likes_count: 0,
            comments_count: 0,
            shares_count: 0,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ]);

      const result = await service.createPost('u1', {
        title: 'Họp BCH',
        content: 'Nội dung họp mặt kèm QR',
        category: 'meeting',
        privacy: 'public',
      });

      expect(result).toBeDefined();
      expect(result.ok).toBe(true);
      expect(result.post.id).toBe('post-uuid-1');
    });
  });

  describe('addComment', () => {
    it('should throw BadRequestException if comment text, media and reaction are all empty', async () => {
      await expect(
        service.addComment('u1', 'post-1', { content: '   ' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should add comment and notify @mentioned users', async () => {
      // Mock author, insert, member lookup
      mockPrisma.$queryRaw
        .mockResolvedValueOnce([]) // author members
        .mockResolvedValueOnce([]) // author users
        .mockResolvedValueOnce([
          {
            id: 'c-uuid-1',
            post_id: 'post-uuid-1',
            author_id: 'u1',
            author_name: 'Vũ Phạm',
            author_avatar: '/av.png',
            content: 'Chào mừng @Phạm Văn Vũ tham gia!',
            parent_id: null,
            level: 1,
            reply_to_author_name: null,
            media_url: null,
            media_type: null,
            reaction: null,
            created_at: new Date(),
          },
        ]) // inserted comment
        .mockResolvedValueOnce([
          { id: 'm-target', user_id: 'user-target-id', contact: 'Phạm Văn Vũ' },
        ]) // matched tag member
        .mockResolvedValueOnce([]); // post author

      const res = await service.addComment('u1', 'post-uuid-1', {
        content: 'Chào mừng @Phạm Văn Vũ tham gia!',
      });

      expect(res).toBeDefined();
      expect(res.ok).toBe(true);
      expect(res.comment.id).toBe('c-uuid-1');
      expect(mockGateway.emitToAll).toHaveBeenCalledWith('feed:comment:new', expect.any(Object));
    });
  });
});

