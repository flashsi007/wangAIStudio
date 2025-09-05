import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateDocumentDto, UpdateDocumentDto } from '../../src/documents/dto/create-document.dto';
import { CreateChildNodeDto, UpdateChildNodeDto } from '../../src/documents/dto/child-node.dto';

describe('Document DTOs', () => {
  describe('CreateDocumentDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateDocumentDto, {
        title: '测试文档',
        userId: 'user123',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with empty title', async () => {
      const dto = plainToClass(CreateDocumentDto, {
        title: '',
        userId: 'user123',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with missing userId', async () => {
      const dto = plainToClass(CreateDocumentDto, {
        title: '测试文档',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('userId');
    });

    it('should pass validation with negative sort value', async () => {
      const dto = plainToClass(CreateDocumentDto, {
        title: '测试文档',
        userId: 'user123',
        sort: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without optional sort field', async () => {
      const dto = plainToClass(CreateDocumentDto, {
        title: '测试文档',
        userId: 'user123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateDocumentDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(UpdateDocumentDto, {
        _id: '507f1f77bcf86cd799439011',
        userId: 'user123',
        title: '更新的文档',
        sort: 2,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing _id', async () => {
      const dto = plainToClass(UpdateDocumentDto, {
        userId: 'user123',
        title: '更新的文档',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('_id');
    });

    it('should fail validation with missing userId', async () => {
      const dto = plainToClass(UpdateDocumentDto, {
        _id: '507f1f77bcf86cd799439011',
        title: '更新的文档',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('userId');
    });

    it('should pass validation with only required fields', async () => {
      const dto = plainToClass(UpdateDocumentDto, {
        _id: '507f1f77bcf86cd799439011',
        userId: 'user123',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});

describe('Child Node DTOs', () => {
  describe('CreateChildNodeDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '测试子节点',
        type: 'markdown',
        sort: 1,
        content: { text: '测试内容' },
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing userId', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        parentId: '507f1f77bcf86cd799439011',
        title: '测试子节点',
        type: 'markdown',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('userId');
    });

    it('should fail validation with missing parentId', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        userId: 'user123',
        title: '测试子节点',
        type: 'markdown',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('parentId');
    });

    it('should fail validation with empty title', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '',
        type: 'markdown',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('title');
    });

    it('should fail validation with invalid type', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '测试子节点',
        type: 'invalid_type',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const typeError = errors.find(error => error.property === 'type');
      expect(typeError).toBeDefined();
    });

    it('should pass validation with mindmap type', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '测试子节点',
        type: 'mindmap',
        sort: 1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation without optional sort field', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '测试子节点',
        type: 'markdown',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with negative sort value', async () => {
      const dto = plainToClass(CreateChildNodeDto, {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439011',
        title: '测试子节点',
        type: 'markdown',
        sort: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('UpdateChildNodeDto', () => {
    it('should pass validation with valid data', async () => {
      const dto = plainToClass(UpdateChildNodeDto, {
        nodeId: '507f1f77bcf86cd799439012',
        parentId: '507f1f77bcf86cd799439011',
        title: '更新的子节点',
        type: 'mindmap',
        sort: 2,
        content: { text: '更新的内容' },
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with missing nodeId', async () => {
      const dto = plainToClass(UpdateChildNodeDto, {
        parentId: '507f1f77bcf86cd799439011',
        title: '更新的子节点',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('nodeId');
    });

    it('should fail validation with missing parentId', async () => {
      const dto = plainToClass(UpdateChildNodeDto, {
        nodeId: '507f1f77bcf86cd799439012',
        title: '更新的子节点',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('parentId');
    });

    it('should pass validation with only required fields', async () => {
      const dto = plainToClass(UpdateChildNodeDto, {
        nodeId: '507f1f77bcf86cd799439012',
        parentId: '507f1f77bcf86cd799439011',
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid type', async () => {
      const dto = plainToClass(UpdateChildNodeDto, {
        nodeId: '507f1f77bcf86cd799439012',
        parentId: '507f1f77bcf86cd799439011',
        type: 'invalid_type',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const typeError = errors.find(error => error.property === 'type');
      expect(typeError).toBeDefined();
    });
  });
});