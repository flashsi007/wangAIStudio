const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { AppModule } = require('../../src/app.module');

describe('RecordWordsLog API Tests', () => {
  let app;
  let httpServer;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  const testWordsLogDto = {
    userId: 'dddd222',
    document: {
      documentId: 'xxx',
      userId: 'dddd222',
      documentName: 'documentName',
      words: 2000
    }
  };

  describe('POST /user-target/words-log', () => {
    it('should create a new words log entry', async () => {
      const response = await request(httpServer)
        .post('/user-target/words-log')
        .send(testWordsLogDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('记录字数日志成功');
      expect(response.body.data.userId).toBe('dddd222');
      expect(response.body.data.words).toBe(2000);
      expect(response.body.data.children).toHaveLength(1);
      expect(response.body.data.children[0].documentId).toBe('xxx');
      expect(response.body.data.children[0].words).toBe(2000);
    });

    it('should update existing words log entry', async () => {
      const additionalWordsDto = {
        userId: 'dddd222',
        document: {
          documentId: 'yyy',
          userId: 'dddd222',
          documentName: 'anotherDocument',
          words: 1000
        }
      };

      const response = await request(httpServer)
        .post('/user-target/words-log')
        .send(additionalWordsDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.words).toBe(3000); // 2000 + 1000
      expect(response.body.data.children).toHaveLength(2);
    });

    it('should update existing document words in same log', async () => {
      const updateSameDocDto = {
        userId: 'dddd222',
        document: {
          documentId: 'xxx', // 同一个文档
          userId: 'dddd222',
          documentName: 'documentName',
          words: 500
        }
      };

      const response = await request(httpServer)
        .post('/user-target/words-log')
        .send(updateSameDocDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.words).toBe(3500); // 3000 + 500
      expect(response.body.data.children).toHaveLength(2);
      
      // 找到对应的文档记录
      const docRecord = response.body.data.children.find(child => child.documentId === 'xxx');
      expect(docRecord.words).toBe(2500); // 2000 + 500
    });
  });
});