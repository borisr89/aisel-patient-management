import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcryptjs';
import { Server } from 'http';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { Role } from '../src/generated/prisma/enums';
import { PrismaService } from '../src/prisma/prisma/prisma.service';

describe('Patients API', () => {
  let app: INestApplication;
  let httpServer: Server;

  const adminId = '8ec8a992-d30a-4f8f-8eb5-93070b189bf0';

  const userId = '5523698a-f11c-448e-9cd0-6418a31254be';

  const patientId = '97bb2ea4-1351-47ad-bafc-da53166be270';

  beforeAll(async () => {
    process.env.JWT_SECRET = 'integration-test-secret-that-is-long-enough';

    process.env.JWT_EXPIRES_IN_SECONDS = '900';

    process.env.FRONTEND_URL = 'http://localhost:3000';

    process.env.DATABASE_URL =
      'postgresql://unused:unused@localhost:5432/unused';

    const [adminPasswordHash, userPasswordHash] = await Promise.all([
      hash('Admin123!', 4),
      hash('User123!', 4),
    ]);

    const users = new Map([
      [
        'admin@aisel.local',
        {
          id: adminId,
          email: 'admin@aisel.local',
          passwordHash: adminPasswordHash,
          role: Role.ADMIN,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      [
        'user@aisel.local',
        {
          id: userId,
          email: 'user@aisel.local',
          passwordHash: userPasswordHash,
          role: Role.USER,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    ]);

    const prismaMock = {
      user: {
        findUnique: jest.fn(
          ({
            where,
          }: {
            where: {
              email?: string;
            };
          }) => {
            const email = where.email;

            if (!email) {
              return Promise.resolve(null);
            }

            return Promise.resolve(users.get(email) ?? null);
          },
        ),
      },
      patient: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(
          ({
            data,
          }: {
            data: {
              firstName: string;
              lastName: string;
              email: string;
              phoneNumber: string | null;
              dob: Date;
            };
          }) =>
            Promise.resolve({
              id: patientId,
              ...data,
              createdAt: new Date('2026-06-15T10:00:00.000Z'),
              updatedAt: new Date('2026-06-15T10:00:00.000Z'),
            }),
        ),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();

    configureApp(app);

    await app.init();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  async function login(email: string, password: string): Promise<string> {
    const response = await request(httpServer)
      .post('/auth/login')
      .send({
        email,
        password,
      })
      .expect(200);

    return response.body.token as string;
  }

  it('returns 401 when no token is provided', async () => {
    await request(httpServer).get('/patients').expect(401);
  });

  it('returns 403 when a USER calls POST /patients', async () => {
    const token = await login('user@aisel.local', 'User123!');

    await request(httpServer)
      .post('/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'test.patient@example.com',
        phoneNumber: '+45 20 30 40 50',
        dob: '1990-01-01',
      })
      .expect(403);
  });

  it('allows an ADMIN to create a patient', async () => {
    const token = await login('admin@aisel.local', 'Admin123!');

    const response = await request(httpServer)
      .post('/patients')
      .set('Authorization', `Bearer ${token}`)
      .send({
        firstName: 'Test',
        lastName: 'Patient',
        email: 'test.patient@example.com',
        phoneNumber: '+45 20 30 40 50',
        dob: '1990-01-01',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: patientId,
        firstName: 'Test',
        lastName: 'Patient',
        email: 'test.patient@example.com',
        phoneNumber: '+45 20 30 40 50',
      }),
    );
  });
});
