import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentsService } from '../../src/documents/documents.service';
import { DocumentStructure, DocumentDocument } from '../../src/documents/schemas/document.schema';
import { NotFoundException } from '@nestjs/common';

const mockDocument = {
  _id: '507f1f77bcf86cd799439011',
  title: '测试文档',
  sort: 1,
  userId: 'user123',
  children: [
    {
      _id: '507f1f77bcf86cd799439012',
      title: '子节点1',
      type: 'markdown',
      sort: 1,
      parentId: '507f1f77bcf86cd799439011',
      content: { text: '测试内容' },
    },
  ],
  save: jest.fn().mockResolvedValue(this),
};

const mockDocumentModel = {
  new: jest.fn().mockResolvedValue(mockDocument),
  constructor: jest.fn().mockResolvedValue(mockDocument),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  deleteOne: jest.fn(),
  countDocuments: jest.fn(),
  exec: jest.fn(),
  select: jest.fn().mockReturnThis(),
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
};

describe('DocumentsService', () => {
  let service: DocumentsService;
  let model: Model<DocumentDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getModelToken(DocumentStructure.name),
          useValue: mockDocumentModel,
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    model = module.get<Model<DocumentDocument>>(getModelToken(DocumentStructure.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDocument', () => {
    it('should create a new document', async () => {
      const createDocumentDto = {
        title: '新文档',
        userId: 'user123',
        sort: 1,
      };

      mockDocumentModel.constructor.mockImplementation(() => ({
        ...mockDocument,
        ...createDocumentDto,
        save: jest.fn().mockResolvedValue({ ...mockDocument, ...createDocumentDto }),
      }));

      const result = await service.createDocument(createDocumentDto);
      expect(result.title).toBe(createDocumentDto.title);
      expect(result.userId).toBe(createDocumentDto.userId);
    });
  });

  describe('findAllDocuments', () => {
    it('should return paginated documents', async () => {
      const mockDocuments = [mockDocument];
      mockDocumentModel.find.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockDocuments),
      });
      mockDocumentModel.countDocuments.mockResolvedValue(1);

      const result = await service.findAllDocuments('user123', 1, 10);
      
      expect(result.documents).toEqual(mockDocuments);
      expect(result.total).toBe(1);
      expect(result.pages).toBe(1);
    });
  });

  describe('findDocumentById', () => {
    it('should return a document by id', async () => {
      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocument),
      });

      const result = await service.findDocumentById('user123', '507f1f77bcf86cd799439011');
      expect(result).toEqual(mockDocument);
    });

    it('should throw NotFoundException when document not found', async () => {
      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.findDocumentById('user123', '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateDocument', () => {
    it('should update a document', async () => {
      const updateDto = {
        _id: '507f1f77bcf86cd799439011',
        userId: 'user123',
        title: '更新的文档',
        sort: 2,
      };

      const updatedDocument = { ...mockDocument, ...updateDto };
      mockDocumentModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedDocument),
      });

      const result = await service.updateDocument(updateDto);
      expect(result.title).toBe(updateDto.title);
    });

    it('should throw NotFoundException when document not found', async () => {
      const updateDto = {
        _id: '507f1f77bcf86cd799439011',
        userId: 'user123',
        title: '更新的文档',
      };

      mockDocumentModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateDocument(updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteDocument', () => {
    it('should delete a document', async () => {
      mockDocumentModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      await expect(
        service.deleteDocument('user123', '507f1f77bcf86cd799439011'),
      ).resolves.not.toThrow();
    });

    it('should throw NotFoundException when document not found', async () => {
      mockDocumentModel.deleteOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      });

      await expect(
        service.deleteDocument('user123', '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addChildNode', () => {
    it('should add a child node to document', async () => {
      const createChildDto = {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '新子节点',
        type: 'markdown' as const,
        sort: 2,
        content: { text: '新内容' },
      };

      const mockDocumentWithSave = {
        ...mockDocument,
        children: [],
        save: jest.fn().mockResolvedValue(mockDocument),
      };

      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocumentWithSave),
      });

      const result = await service.addChildNode(createChildDto);
      expect(result.title).toBe(createChildDto.title);
      expect(result.type).toBe(createChildDto.type);
      expect(mockDocumentWithSave.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when parent document not found', async () => {
      const createChildDto = {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '新子节点',
        type: 'markdown' as const,
        sort: 2,
        content: { text: '新内容' },
      };

      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.addChildNode(createChildDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateChildNode', () => {
    it('should update a child node', async () => {
      const updateChildDto = {
        nodeId: '507f1f77bcf86cd799439012',
        parentId: '507f1f77bcf86cd799439011',
        title: '更新的子节点',
        type: 'mindmap' as const,
        sort: 3,
      };

      const mockDocumentWithChild = {
        ...mockDocument,
        children: [
          {
            _id: { toString: () => '507f1f77bcf86cd799439012' },
            title: '原子节点',
            type: 'markdown',
            sort: 1,
          },
        ],
        save: jest.fn().mockResolvedValue(mockDocument),
      };

      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocumentWithChild),
      });

      const result = await service.updateChildNode(
        '507f1f77bcf86cd799439012',
        updateChildDto,
      );
      expect(result.title).toBe(updateChildDto.title);
      expect(mockDocumentWithChild.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when child node not found', async () => {
      const updateChildDto = {
        nodeId: '507f1f77bcf86cd799439012',
        parentId: '507f1f77bcf86cd799439011',
        title: '更新的子节点',
      };

      const mockDocumentWithoutChild = {
        ...mockDocument,
        children: [],
        save: jest.fn(),
      };

      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocumentWithoutChild),
      });

      await expect(
        service.updateChildNode('nonexistent', updateChildDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteChildNode', () => {
    it('should delete a child node', async () => {
      const mockDocumentWithChild = {
        ...mockDocument,
        children: [
          {
            _id: { toString: () => '507f1f77bcf86cd799439012' },
            title: '要删除的子节点',
          },
        ],
        save: jest.fn().mockResolvedValue(mockDocument),
      };

      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocumentWithChild),
      });

      await expect(
        service.deleteChildNode(
          'user123',
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439012',
        ),
      ).resolves.not.toThrow();
      expect(mockDocumentWithChild.save).toHaveBeenCalled();
    });
  });

  describe('getChildNode', () => {
    it('should return a child node', async () => {
      const mockChild = {
        _id: { toString: () => '507f1f77bcf86cd799439012' },
        title: '子节点',
        type: 'markdown',
        sort: 1,
      };

      const mockDocumentWithChild = {
        ...mockDocument,
        children: [mockChild],
      };

      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocumentWithChild),
      });

      const result = await service.getChildNode(
        'user123',
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      );
      expect(result).toEqual(mockChild);
    });

    it('should throw NotFoundException when child node not found', async () => {
      const mockDocumentWithoutChild = {
        ...mockDocument,
        children: [],
      };

      mockDocumentModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDocumentWithoutChild),
      });

      await expect(
        service.getChildNode(
          'user123',
          '507f1f77bcf86cd799439011',
          'nonexistent',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});