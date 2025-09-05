const request = require('supertest');
const { Test } = require('@nestjs/testing');
const { AppModule } = require('../../src/app.module');

describe('Admin Controller (e2e)', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/users (GET)', () => {
    it('should return all users when no query parameters', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('message');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter users by email', () => {
      return request(app.getHttpServer())
        .get('/admin/users?email=test@example.com')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter users by userName', () => {
      return request(app.getHttpServer())
        .get('/admin/users?userName=testuser')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter users by both email and userName (OR query)', () => {
      return request(app.getHttpServer())
        .get('/admin/users?email=test@example.com&userName=testuser')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('success', true);
          expect(res.body).toHaveProperty('data');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should not return password field in user data', () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .expect(200)
        .expect((res) => {
          if (res.body.data.length > 0) {
            expect(res.body.data[0]).not.toHaveProperty('password');
          }
        });
    });
  });
});