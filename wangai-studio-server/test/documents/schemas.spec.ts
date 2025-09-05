import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  DocumentStructure,
  DocumentDocument,
  DocumentSchema,
  ChildNode,
} from '../../src/documents/schemas/document.schema';

describe('Document Schemas', () => {
  let module: TestingModule;
  let documentModel: Model<DocumentDocument>;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    try {
      mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();

      module = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(uri),
          MongooseModule.forFeature([
            { name: DocumentStructure.name, schema: DocumentSchema },
          ]),
        ],
      }).compile();

      documentModel = module.get<Model<DocumentDocument>>(
        getModelToken(DocumentStructure.name),
      );
    } catch (error) {
      console.error('Failed to setup test environment:', error);
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    if (module) {
      await module.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    if (documentModel) {
      await documentModel.deleteMany({});
    }
  });

  describe('DocumentStructure Schema', () => {
    it('should create a document with required fields', async () => {
      const documentData = {
        title: '测试文档',
        sort: 1,
        userId: 'user123',
        children: [],
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();

      expect(savedDocument._id).toBeDefined();
      expect(savedDocument.title).toBe(documentData.title);
      expect(savedDocument.sort).toBe(documentData.sort);
      expect(savedDocument.userId).toBe(documentData.userId);
      expect(savedDocument.children).toEqual([]);
      expect((savedDocument as any).createdAt).toBeDefined();
      expect((savedDocument as any).updatedAt).toBeDefined();
    });

    it('should fail validation without required fields', async () => {
      const documentData = {
        sort: 1,
        userId: 'user123',
        // missing title
      };

      const document = new documentModel(documentData);
      
      await expect(document.save()).rejects.toThrow();
    });

    it('should set default sort value', async () => {
      const documentData = {
        title: '测试文档',
        userId: 'user123',
        // no sort specified
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();

      expect(savedDocument.sort).toBe(0);
    });

    it('should initialize children as empty array', async () => {
      const documentData = {
        title: '测试文档',
        userId: 'user123',
        sort: 1,
        // no children specified
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();

      expect(savedDocument.children).toEqual([]);
    });

    it('should update timestamps on save', async () => {
      const documentData = {
        title: '测试文档',
        userId: 'user123',
        sort: 1,
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();
      const originalUpdatedAt = (savedDocument as any).updatedAt;

      // 等待一毫秒确保时间戳不同
      await new Promise(resolve => setTimeout(resolve, 1));
      
      savedDocument.title = '更新的文档';
      const updatedDocument = await savedDocument.save();

      expect((updatedDocument as any).updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
    });
  });

  describe('ChildNode Schema', () => {
    it('should create a document with child nodes', async () => {
      const childNodeData = {
        title: '子节点',
        type: 'markdown',
        sort: 1,
        parentId: '507f1f77bcf86cd799439011',
        content: { text: '测试内容' },
      };

      const documentData = {
        title: '父文档',
        userId: 'user123',
        sort: 1,
        children: [childNodeData],
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();

      expect(savedDocument.children).toHaveLength(1);
      const childNode = savedDocument.children[0];
      expect(childNode._id).toBeDefined();
      expect(childNode.title).toBe(childNodeData.title);
      expect(childNode.type).toBe(childNodeData.type);
      expect(childNode.sort).toBe(childNodeData.sort);
      expect(childNode.parentId).toBe(childNodeData.parentId);
      expect(childNode.content).toEqual(childNodeData.content);
    });

    it('should validate child node type enum', async () => {
      const childNodeData = {
        title: '子节点',
        type: 'invalid_type', // 无效类型
        sort: 1,
        parentId: '507f1f77bcf86cd799439011',
      };

      const documentData = {
        title: '父文档',
        userId: 'user123',
        sort: 1,
        children: [childNodeData],
      };

      const document = new documentModel(documentData);
      
      await expect(document.save()).rejects.toThrow();
    });

    it('should accept valid child node types', async () => {
      const validTypes = ['markdown', 'mindmap'];
      
      for (const type of validTypes) {
        const childNodeData = {
          title: `子节点 ${type}`,
          type,
          sort: 1,
          parentId: '507f1f77bcf86cd799439011',
        };

        const documentData = {
          title: `父文档 ${type}`,
          userId: 'user123',
          sort: 1,
          children: [childNodeData],
        };

        const document = new documentModel(documentData);
        const savedDocument = await document.save();

        expect(savedDocument.children[0].type).toBe(type);
        
        // 清理数据
        await documentModel.deleteOne({ _id: savedDocument._id });
      }
    });

    it('should set default sort value for child nodes', async () => {
      const childNodeData = {
        title: '子节点',
        type: 'markdown',
        parentId: '507f1f77bcf86cd799439011',
        // no sort specified
      };

      const documentData = {
        title: '父文档',
        userId: 'user123',
        sort: 1,
        children: [childNodeData],
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();

      expect(savedDocument.children[0].sort).toBe(0);
    });

    it('should handle optional content field', async () => {
      const childNodeData = {
        title: '子节点',
        type: 'markdown',
        sort: 1,
        parentId: '507f1f77bcf86cd799439011',
        // no content specified
      };

      const documentData = {
        title: '父文档',
        userId: 'user123',
        sort: 1,
        children: [childNodeData],
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();

      expect(savedDocument.children[0].content).toBeUndefined();
    });

    it('should handle complex content objects', async () => {
      const complexContent = {
        text: '复杂内容',
        metadata: {
          author: 'test_user',
          version: 1,
        },
        tags: ['tag1', 'tag2'],
      };

      const childNodeData = {
        title: '子节点',
        type: 'markdown',
        sort: 1,
        parentId: '507f1f77bcf86cd799439011',
        content: complexContent,
      };

      const documentData = {
        title: '父文档',
        userId: 'user123',
        sort: 1,
        children: [childNodeData],
      };

      const document = new documentModel(documentData);
      const savedDocument = await document.save();

      expect(savedDocument.children[0].content).toEqual(complexContent);
    });
  });

  describe('Document Operations', () => {
    it('should find documents by userId', async () => {
      const documentsData = [
        {
          title: '文档1',
          userId: 'user123',
          sort: 1,
        },
        {
          title: '文档2',
          userId: 'user123',
          sort: 2,
        },
        {
          title: '文档3',
          userId: 'user456',
          sort: 1,
        },
      ];

      await documentModel.insertMany(documentsData);

      const user123Documents = await documentModel
        .find({ userId: 'user123' })
        .sort({ sort: 1 })
        .exec();

      expect(user123Documents).toHaveLength(2);
      expect(user123Documents[0].title).toBe('文档1');
      expect(user123Documents[1].title).toBe('文档2');
    });

    it('should support pagination', async () => {
      const documentsData = Array.from({ length: 15 }, (_, i) => ({
        title: `文档${i + 1}`,
        userId: 'user123',
        sort: i + 1,
      }));

      await documentModel.insertMany(documentsData);

      const page1 = await documentModel
        .find({ userId: 'user123' })
        .sort({ sort: 1 })
        .limit(10)
        .exec();

      const page2 = await documentModel
        .find({ userId: 'user123' })
        .sort({ sort: 1 })
        .skip(10)
        .limit(10)
        .exec();

      expect(page1).toHaveLength(10);
      expect(page2).toHaveLength(5);
      expect(page1[0].title).toBe('文档1');
      expect(page2[0].title).toBe('文档11');
    });
  });
});