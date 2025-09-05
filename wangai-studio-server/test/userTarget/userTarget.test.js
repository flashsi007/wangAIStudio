const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { AppModule } = require('../../src/app.module');

describe('UserTarget API Tests', () => {
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

  const testUserId = 'test-user-123';
  const testUserTarget = {
    userId: testUserId,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    targetWords: '100000'
  };

  describe('POST /user-target', () => {
    it('should create a new user target', async () => {
      const response = await request(httpServer)
        .post('/user-target')
        .send(testUserTarget)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('创建用户目标成功');
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.targetWords).toBe('100000');
      expect(response.body.data.cumulativeWords).toBe('0');
    });

    it('should update existing user target', async () => {
      const updatedTarget = {
        ...testUserTarget,
        targetWords: '150000'
      };

      const response = await request(httpServer)
        .post('/user-target')
        .send(updatedTarget)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('更新用户目标成功');
      expect(response.body.data.targetWords).toBe('150000');
    });
  });

  describe('GET /user-target/:userId', () => {
    it('should get user target', async () => {
      const response = await request(httpServer)
        .get(`/user-target/${testUserId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUserId);
      expect(response.body.data.targetWords).toBe('150000');
    });

    it('should return error for non-existent user', async () => {
      const response = await request(httpServer)
        .get('/user-target/non-existent-user')
        .expect(200);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('用户目标不存在');
    });
  });

  describe('PUT /user-target/:userId/cumulative-words', () => {
    it('should update cumulative words', async () => {
      const response = await request(httpServer)
        .put(`/user-target/${testUserId}/cumulative-words`)
        .send({ cumulativeWords: '25000' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.cumulativeWords).toBe('25000');
      expect(response.body.message).toBe('更新累计字数成功');
    });
  });
});