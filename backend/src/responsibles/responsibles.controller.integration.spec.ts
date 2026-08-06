import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';
import { PrismaService } from '../prisma/prisma.service';

describe('ResponsiblesController integration', () => {
  const prefix = `IT_RESP_${Date.now()}_`;
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.responsible.deleteMany({
      where: { name: { startsWith: prefix } },
    });
    await app.close();
  });

  it('creates, lists, details, updates and inactivates a responsible', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/responsibles')
      .send({
        email: `${prefix.toLowerCase()}ana@example.internal`,
        name: `${prefix}Ana`,
        phone: '+55 61 3000-2001',
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      active: true,
      email: `${prefix.toLowerCase()}ana@example.internal`,
      name: `${prefix}Ana`,
      phone: '+55 61 3000-2001',
    });

    const id = createResponse.body.id as string;

    const listResponse = await request(app.getHttpServer())
      .get('/api/v1/responsibles')
      .query({ search: `${prefix}Ana`, page: 1, pageSize: 10 })
      .expect(200);

    expect(listResponse.body).toMatchObject({
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    });
    expect(listResponse.body.data).toHaveLength(1);

    await request(app.getHttpServer())
      .get(`/api/v1/responsibles/${id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.name).toBe(`${prefix}Ana`);
      });

    await request(app.getHttpServer())
      .put(`/api/v1/responsibles/${id}`)
      .send({
        contactChannel: 'Teams: it.ana',
        email: null,
        name: `${prefix}Ana Atualizada`,
        phone: null,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.contactChannel).toBe('Teams: it.ana');
        expect(body.email).toBeNull();
        expect(body.phone).toBeNull();
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/responsibles/${id}/active`)
      .send({ active: false })
      .expect(200)
      .expect(({ body }) => {
        expect(body.active).toBe(false);
      });
  });

  it('returns 400 for invalid contact data', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/responsibles')
      .send({ name: `${prefix}Sem Contato` })
      .expect(400);
  });

  it('returns 404 for missing records', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/responsibles/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
