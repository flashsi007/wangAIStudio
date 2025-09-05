import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from '../../src/documents/documents.controller';
import { DocumentsService } from '../../src/documents/documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from '../../src/documents/dto/create-document.dto';
import { NotFoundException } from '@nestjs/common';

const mockDocument = {
  _id: '507f1f77bcf86cd799439011',
  title: '测试文档',
  sort: 1,
  userId: 'user123',
  children: [],
};

const mockDocumentsService = {
  createDocument: jest.fn(),
  findAllDocuments: jest.fn(),
  findDocumentById: jest.fn(),
  updateDocument: jest.fn(),
  deleteDocument: jest.fn(),
};

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: '新文档',
        userId: 'user123',
        sort: 1,
      };

      mockDocumentsService.createDocument.mockResolvedValue({
        ...mockDocument,
        ...createDocumentDto,
      });

      const result = await controller.createDocument(createDocumentDto);

      expect(service.createDocument).toHaveBeenCalledWith(createDocumentDto);
      expect(result.data.title).toBe(createDocumentDto.title);
    });

    it('should handle service errors', async () => {
      const createDocumentDto: CreateDocumentDto = {
        title: '新文档',
        userId: 'user123',
        sort: 1,
      };

      mockDocumentsService.createDocument.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(controller.createDocument(createDocumentDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated documents', async () => {
      const mockResponse = {
        documents: [mockDocument],
        total: 1,
        pages: 1,
      };

      mockDocumentsService.findAllDocuments.mockResolvedValue(mockResponse);

      const result = await controller.getDocuments('user123', undefined, '1', '10');

      expect(service.findAllDocuments).toHaveBeenCalledWith('user123', 1, 10);
      expect(result.data).toEqual(mockResponse.documents);
      expect(result.pagination?.total).toBe(mockResponse.total);
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        documents: [mockDocument],
        total: 1,
        pages: 1,
      };

      mockDocumentsService.findAllDocuments.mockResolvedValue(mockResponse);

      await controller.getDocuments('user123');

      expect(service.findAllDocuments).toHaveBeenCalledWith('user123', 1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a document by id', async () => {
      mockDocumentsService.findDocumentById.mockResolvedValue(mockDocument);

      const result = await controller.getDocuments('user123', '507f1f77bcf86cd799439011');

      expect(service.findDocumentById).toHaveBeenCalledWith(
        'user123',
        '507f1f77bcf86cd799439011',
      );
      expect(result.data).toEqual(mockDocument);
    });

    it('should handle not found error', async () => {
      mockDocumentsService.findDocumentById.mockRejectedValue(
        new NotFoundException('Document not found'),
      );

      await expect(
        controller.getDocuments('user123', '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a document', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        _id: '507f1f77bcf86cd799439011',
        userId: 'user123',
        title: '更新的文档',
        sort: 2,
      };

      const updatedDocument = {
        ...mockDocument,
        ...updateDocumentDto,
      };

      mockDocumentsService.updateDocument.mockResolvedValue(updatedDocument);

      const result = await controller.updateDocument(updateDocumentDto);

      expect(service.updateDocument).toHaveBeenCalledWith(updateDocumentDto);
      expect(result.data.title).toBe(updateDocumentDto.title);
    });

    it('should handle not found error', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        _id: '507f1f77bcf86cd799439011',
        userId: 'user123',
        title: '更新的文档',
      };

      mockDocumentsService.updateDocument.mockRejectedValue(
        new NotFoundException('Document not found'),
      );

      await expect(controller.updateDocument(updateDocumentDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a document', async () => {
      mockDocumentsService.deleteDocument.mockResolvedValue(undefined);

      await controller.deleteDocument('user123', '507f1f77bcf86cd799439011');

      expect(service.deleteDocument).toHaveBeenCalledWith(
        'user123',
        '507f1f77bcf86cd799439011',
      );
    });

    it('should handle not found error', async () => {
      mockDocumentsService.deleteDocument.mockRejectedValue(
        new NotFoundException('Document not found'),
      );

      await expect(
        controller.deleteDocument('user123', '507f1f77bcf86cd799439011'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});