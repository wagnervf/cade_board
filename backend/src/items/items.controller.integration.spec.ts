import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CatalogItemType, OperationalStatus } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';
import { PrismaService } from '../prisma/prisma.service';

describe('ItemsController integration', () => {
  const prefix = `IT_ITEM_${Date.now()}_`;
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
    await prisma.itemResponsibility.deleteMany({
      where: { item: { acronym: { startsWith: prefix } } },
    });
    await prisma.catalogItem.deleteMany({
      where: { acronym: { startsWith: prefix } },
    });
    await app.close();
  });

  it('creates, lists, details, updates and inactivates an item', async () => {
    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/items')
      .send({
        acronym: `${prefix}cgti`,
        description: 'Servico de consulta para atendimento N1',
        name: `${prefix}Central de Gestao de TI`,
        type: CatalogItemType.SISTEMA,
      })
      .expect(201);

    expect(createResponse.body).toMatchObject({
      acronym: `${prefix}CGTI`,
      active: true,
      name: `${prefix}Central de Gestao de TI`,
      status: OperationalStatus.OK,
      type: CatalogItemType.SISTEMA,
    });

    const id = createResponse.body.id as string;

    await request(app.getHttpServer())
      .get('/api/v1/items')
      .query({ search: 'cgti', type: CatalogItemType.SISTEMA, status: OperationalStatus.OK })
      .expect(200)
      .expect(({ body }) => {
        expect(body.totalItems).toBeGreaterThanOrEqual(1);
        expect(
          body.data.some((item: { id: string; acronym: string }) => item.id === id),
        ).toBe(true);
      });

    await request(app.getHttpServer())
      .get(`/api/v1/items/${id}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.technicalResponsibles).toEqual([]);
        expect(body.managerialResponsibles).toEqual([]);
      });

    await request(app.getHttpServer())
      .put(`/api/v1/items/${id}`)
      .send({
        description: 'Descricao atualizada',
        name: `${prefix}Central Atualizada`,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.description).toBe('Descricao atualizada');
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/items/${id}/active`)
      .send({ active: false })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/items')
      .query({ search: `${prefix}CGTI` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.totalItems).toBe(0);
      });
  });

  it('returns 404 for missing records', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/items/00000000-0000-0000-0000-000000000000')
      .expect(404);
  });
});
