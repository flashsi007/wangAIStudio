import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenController } from '../../src/documents/documents.controller';
import { DocumentsService } from '../../src/documents/documents.service';
import { CreateChildNodeDto, UpdateChildNodeDto } from '../../src/documents/dto/child-node.dto';
import { NotFoundException } from '@nestjs/common';

const mockChildNode = {
  _id: '507f1f77bcf86cd799439012',
  title: '测试子节点',
  type: 'markdown',
  sort: 1,
  parentId: '507f1f77bcf86cd799439011',
  content: { text: '测试内容' },
};

const mockDocumentsService = {
  addChildNode: jest.fn(),
  getChildNode: jest.fn(),
  updateChildNode: jest.fn(),
  deleteChildNode: jest.fn(),
};

describe('ChildrenController', () => {
  let controller: ChildrenController;
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildrenController],
      providers: [
        {
          provide: DocumentsService,
          useValue: mockDocumentsService,
        },
      ],
    }).compile();

    controller = module.get<ChildrenController>(ChildrenController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });



  describe('findOne', () => {
    it('should return a child node by id', async () => {
      mockDocumentsService.getChildNode.mockResolvedValue(mockChildNode);

      const result = await controller.getChildNode(
        'user123',
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      );

      expect(service.getChildNode).toHaveBeenCalledWith(
        'user123',
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      );
      expect(result.data).toEqual(mockChildNode);
    });

    it('should handle not found error', async () => {
      mockDocumentsService.getChildNode.mockRejectedValue(
        new NotFoundException('Child node not found'),
      );

      await expect(
        controller.getChildNode(
          'user123',
          '507f1f77bcf86cd799439011',
          '507f1f77bcf86cd799439012',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a child node', async () => {
      const updateChildNodeDto: UpdateChildNodeDto = {
        nodeId: '507f1f77bcf86cd799439012',
        parentId: '507f1f77bcf86cd799439011',
        title: '更新的子节点',
        type: 'mindmap',
        sort: 2,
        content: { text: '更新的内容' },
      };

      const updatedChildNode = {
        ...mockChildNode,
        ...updateChildNodeDto,
      };

      mockDocumentsService.updateChildNode.mockResolvedValue(updatedChildNode);

      const result = await controller.updateChildNode('507f1f77bcf86cd799439012', updateChildNodeDto);

      expect(service.updateChildNode).toHaveBeenCalledWith(
        updateChildNodeDto.nodeId,
        updateChildNodeDto,
      );
      expect(result.data.title).toBe(updateChildNodeDto.title);
    });

    it('should handle not found error', async () => {
      const updateChildNodeDto: UpdateChildNodeDto = {
        nodeId: '507f1f77bcf86cd799439012',
        parentId: '507f1f77bcf86cd799439011',
        title: '更新的子节点',
      };

      mockDocumentsService.updateChildNode.mockRejectedValue(
        new NotFoundException('Child node not found'),
      );

      await expect(controller.updateChildNode('507f1f77bcf86cd799439012', updateChildNodeDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a child node', async () => {
      mockDocumentsService.deleteChildNode.mockResolvedValue(undefined);

      await controller.deleteChildNode(
        '507f1f77bcf86cd799439012',
        'user123',
        '507f1f77bcf86cd799439011',
      );

      expect(service.deleteChildNode).toHaveBeenCalledWith(
        'user123',
        '507f1f77bcf86cd799439011',
        '507f1f77bcf86cd799439012',
      );
    });

    it('should handle not found error', async () => {
      mockDocumentsService.deleteChildNode.mockRejectedValue(
        new NotFoundException('Child node not found'),
      );

      await expect(
        controller.deleteChildNode(
          '507f1f77bcf86cd799439012',
          'user123',
          '507f1f77bcf86cd799439011',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });
});