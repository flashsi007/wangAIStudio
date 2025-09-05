import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DocumentsModule } from '../../src/documents/documents.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

describe('Documents (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let documentId: string;
  let childNodeId: string;

  beforeAll(async () => {
    // 启动内存中的MongoDB实例
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        DocumentsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // 配置全局管道和过滤器
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  describe('/documents (POST)', () => {
    it('should create a new document', () => {
      const createDocumentDto = {
        title: '测试文档',
        userId: 'user123',
        sort: 1,
      };

      return request(app.getHttpServer())
        .post('/documents')
        .send(createDocumentDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe(createDocumentDto.title);
          expect(res.body.userId).toBe(createDocumentDto.userId);
          expect(res.body.sort).toBe(createDocumentDto.sort);
          expect(res.body._id).toBeDefined();
          documentId = res.body._id;
        });
    });

    it('should return 400 for invalid data', () => {
      const invalidDto = {
        title: '', // 空标题应该失败
        userId: 'user123',
      };

      return request(app.getHttpServer())
        .post('/documents')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('/documents (GET)', () => {
    it('should return paginated documents', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .query({ userId: 'user123', page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.documents).toBeInstanceOf(Array);
          expect(res.body.total).toBeGreaterThan(0);
          expect(res.body.pages).toBeGreaterThan(0);
        });
    });

    it('should return empty result for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/documents')
        .query({ userId: 'nonexistent', page: 1, limit: 10 })
        .expect(200)
        .expect((res) => {
          expect(res.body.documents).toHaveLength(0);
          expect(res.body.total).toBe(0);
        });
    });
  });

  describe('/documents/:id (GET)', () => {
    it('should return a document by id', () => {
      return request(app.getHttpServer())
        .get(`/documents/${documentId}`)
        .query({ userId: 'user123' })
        .expect(200)
        .expect((res) => {
          expect(res.body._id).toBe(documentId);
          expect(res.body.title).toBe('测试文档');
        });
    });

    it('should return 404 for non-existent document', () => {
      return request(app.getHttpServer())
        .get('/documents/507f1f77bcf86cd799439999')
        .query({ userId: 'user123' })
        .expect(404);
    });
  });

  describe('/documents (PUT)', () => {
    it('should update a document', () => {
      const updateDto = {
        _id: documentId,
        userId: 'user123',
        title: '更新的文档',
        sort: 2,
      };

      return request(app.getHttpServer())
        .put('/documents')
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('更新的文档');
          expect(res.body.sort).toBe(2);
        });
    });

    it('should return 404 for non-existent document', () => {
      const updateDto = {
        _id: '507f1f77bcf86cd799439999',
        userId: 'user123',
        title: '更新的文档',
      };

      return request(app.getHttpServer())
        .put('/documents')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('/children (POST)', () => {
    it('should create a new child node', () => {
      const createChildDto = {
        userId: 'user123',
        parentId: documentId,
        title: '测试子节点',
        type: 'markdown',
        sort: 1,
        content: { text: '测试内容' },
      };

      return request(app.getHttpServer())
        .post('/children')
        .send(createChildDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe(createChildDto.title);
          expect(res.body.type).toBe(createChildDto.type);
          expect(res.body._id).toBeDefined();
          childNodeId = res.body._id;
        });
    });

    it('should return 404 for non-existent parent document', () => {
      const createChildDto = {
        userId: 'user123',
        parentId: '507f1f77bcf86cd799439999',
        title: '测试子节点',
        type: 'markdown',
        sort: 1,
        content: { text: '测试内容' },
      };

      return request(app.getHttpServer())
        .post('/children')
        .send(createChildDto)
        .expect(404);
    });
  });

  describe('/children/:parentId/:nodeId (GET)', () => {
    it('should return a child node by id', () => {
      return request(app.getHttpServer())
        .get(`/children/${documentId}/${childNodeId}`)
        .query({ userId: 'user123' })
        .expect(200)
        .expect((res) => {
          expect(res.body._id.toString()).toBe(childNodeId);
          expect(res.body.title).toBe('测试子节点');
        });
    });

    it('should return 404 for non-existent child node', () => {
      return request(app.getHttpServer())
        .get(`/children/${documentId}/507f1f77bcf86cd799439999`)
        .query({ userId: 'user123' })
        .expect(404);
    });
  });

  describe('/children (PUT)', () => {
    it('should update a child node', () => {
      const updateChildDto = {
        nodeId: childNodeId,
        parentId: documentId,
        title: '更新的子节点',
        type: 'mindmap',
        sort: 2,
        content: { text: '更新的内容' },
      };

      return request(app.getHttpServer())
        .put('/children')
        .send(updateChildDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe('更新的子节点');
          expect(res.body.type).toBe('mindmap');
        });
    });

    it('should return 404 for non-existent child node', () => {
      const updateChildDto = {
        nodeId: '507f1f77bcf86cd799439999',
        parentId: documentId,
        title: '更新的子节点',
      };

      return request(app.getHttpServer())
        .put('/children')
        .send(updateChildDto)
        .expect(404);
    });
  });

  describe('/children/:parentId/:nodeId (DELETE)', () => {
    it('should delete a child node', () => {
      return request(app.getHttpServer())
        .delete(`/children/${documentId}/${childNodeId}`)
        .query({ userId: 'user123' })
        .expect(200);
    });

    it('should return 404 for non-existent child node', () => {
      return request(app.getHttpServer())
        .delete(`/children/${documentId}/507f1f77bcf86cd799439999`)
        .query({ userId: 'user123' })
        .expect(404);
    });
  });

  describe('/documents/:id (DELETE)', () => {
    it('should delete a document', () => {
      return request(app.getHttpServer())
        .delete(`/documents/${documentId}`)
        .query({ userId: 'user123' })
        .expect(200);
    });

    it('should return 404 for non-existent document', () => {
      return request(app.getHttpServer())
        .delete('/documents/507f1f77bcf86cd799439999')
        .query({ userId: 'user123' })
        .expect(404);
    });
  });
});