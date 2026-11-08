import { DocumentsService } from '../documents/documents.service';
import { DocumentsRepository } from '../documents/documents.repository';

describe('CRM Documents & File Management Module', () => {
  let service: DocumentsService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      getActiveAssociationId: jest.fn().mockResolvedValue('c1983000-0000-4000-8000-000000001983'),
      listDocuments: jest.fn().mockResolvedValue([]),
      insertDocument: jest.fn().mockImplementation((code, name, category, size, uploadedBy, type) => ({
        id: code,
        name,
        category,
        size,
        uploadedBy,
        type,
        isStarred: false,
      })),
      toggleStar: jest.fn().mockResolvedValue(true),
      updateShare: jest.fn().mockResolvedValue(true),
      deleteDocument: jest.fn().mockResolvedValue(true),
    };
    service = new DocumentsService(mockRepo as unknown as DocumentsRepository);
  });

  describe('create document', () => {
    it('should create document with valid required fields (name, category, type)', async () => {
      const dto = {
        name: 'Quy Chế Hoạt Động CLB Doanh Nhân CEO 1983',
        category: 'Pháp quy',
        type: 'pdf',
        size: '2.5 MB',
        uploadedBy: 'Ban Thư Ký',
      };

      const result = await service.create('admin-user', dto);
      expect(result).toBeDefined();
      expect(result.name).toBe('Quy Chế Hoạt Động CLB Doanh Nhân CEO 1983');
      expect(result.category).toBe('Pháp quy');
      expect(result.type).toBe('pdf');
      expect(mockRepo.insertDocument).toHaveBeenCalled();
    });
  });

  describe('toggleStar', () => {
    it('should toggle star status for document', async () => {
      const res = await service.toggleStar('DOC-123');
      expect(res).toEqual({ id: 'DOC-123', isStarred: true });
      expect(mockRepo.toggleStar).toHaveBeenCalledWith('DOC-123');
    });
  });
});
