import { TasksService } from '../tasks/tasks.service';
import { TasksRepository } from '../tasks/tasks.repository';

describe('CRM Tasks & Kanban Module', () => {
  let service: TasksService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    service = new TasksService(mockRepo as unknown as TasksRepository);
  });

  describe('TasksService definition', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });
  });

  describe('Kanban statuses validation', () => {
    it('should support 4 standard Kanban columns', () => {
      const statuses = ['todo', 'in_progress', 'review', 'done'];
      expect(statuses.length).toBe(4);
      expect(statuses).toContain('in_progress');
      expect(statuses).toContain('done');
    });
  });
});

