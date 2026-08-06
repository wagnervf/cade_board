import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CatalogItemType, OperationalStatus } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';
import { PrismaService } from '../prisma/prisma.service';

describe('Item status integration', () => {
  const prefix = `IT_STATUS_${Date.now()}_`;
  let app: INestApplication;
  let prisma: PrismaService;
  let fixtureIndex = 0;

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
    await prisma.catalogItem.deleteMany({ where: { acronym: { startsWith: prefix } } });
    await app.close();
  });

  async function createItem(): Promise<string> {
    fixtureIndex += 1;
    const fixturePrefix = `${prefix}${fixtureIndex}_`;
    const item = await prisma.catalogItem.create({
      data: {
        acronym: `${fixturePrefix}APP`,
        description: 'Aplicacao para status',
        name: `${fixturePrefix}Aplicacao`,
        type: CatalogItemType.SISTEMA,
      },
      select: { id: true },
    });

    return item.id;
  }

  it('updates status and exposes overdue return forecast', async () => {
    const itemId = await createItem();

    const response = await request(app.getHttpServer())
      .patch(`/api/v1/items/${itemId}/status`)
      .send({
        expectedReturnAt: '2026-01-01T00:00:00.000Z',
        status: OperationalStatus.PARADO,
        statusNote: 'Falha no banco de dados',
      })
      .expect(200);

    expect(response.body).toMatchObject({
      expectedReturnAt: '2026-01-01T00:00:00.000Z',
      returnOverdue: true,
      status: OperationalStatus.PARADO,
      statusNote: 'Falha no banco de dados',
    });

    const detailResponse = await request(app.getHttpServer())
      .get(`/api/v1/items/${itemId}`)
      .expect(200);

    expect(detailResponse.body.returnOverdue).toBe(true);
  });

  it('clears previous expected return when status becomes OK', async () => {
    const itemId = await createItem();

    await request(app.getHttpServer())
      .patch(`/api/v1/items/${itemId}/status`)
      .send({
        expectedReturnAt: '2026-01-01T00:00:00.000Z',
        status: OperationalStatus.INSTAVEL,
        statusNote: 'Oscilacao',
      })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/api/v1/items/${itemId}/status`)
      .send({
        status: OperationalStatus.OK,
        statusNote: null,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.expectedReturnAt).toBeNull();
        expect(body.returnOverdue).toBe(false);
        expect(body.status).toBe(OperationalStatus.OK);
      });
  });
});
