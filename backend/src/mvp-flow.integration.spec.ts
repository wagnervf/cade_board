import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CatalogItemType, OperationalStatus, ResponsibilityRole } from '@prisma/client';
import request from 'supertest';

import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { PrismaService } from './prisma/prisma.service';

describe('MVP acceptance flow integration', () => {
  const prefix = `IT_MVP_${Date.now()}_`;
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
      where: {
        OR: [
          { item: { acronym: { startsWith: prefix } } },
          { responsible: { name: { startsWith: prefix } } },
        ],
      },
    });
    await prisma.catalogItem.deleteMany({ where: { acronym: { startsWith: prefix } } });
    await prisma.responsible.deleteMany({ where: { name: { startsWith: prefix } } });
    await app.close();
  });

  it('covers responsible to item to relationship to search to status changes', async () => {
    const technicalResponse = await request(app.getHttpServer())
      .post('/api/v1/responsibles')
      .send({
        email: `${prefix.toLowerCase()}tech@example.internal`,
        name: `${prefix}Tecnico`,
        phone: '+55 61 3000-1001',
      })
      .expect(201);
    const managerialResponse = await request(app.getHttpServer())
      .post('/api/v1/responsibles')
      .send({
        contactChannel: 'Teams: gerente.n1',
        email: `${prefix.toLowerCase()}manager@example.internal`,
        name: `${prefix}Gerencial`,
      })
      .expect(201);

    const itemResponse = await request(app.getHttpServer())
      .post('/api/v1/items')
      .send({
        acronym: `${prefix}ops`,
        description: 'Aplicacao operacional consultada pelo atendimento N1',
        name: `${prefix}Operacao`,
        type: CatalogItemType.SISTEMA,
      })
      .expect(201);
    const itemId = itemResponse.body.id as string;

    await request(app.getHttpServer())
      .post(`/api/v1/items/${itemId}/responsibilities`)
      .send({
        responsibleId: technicalResponse.body.id,
        role: ResponsibilityRole.TECNICO,
      })
      .expect(201);
    await request(app.getHttpServer())
      .post(`/api/v1/items/${itemId}/responsibilities`)
      .send({
        responsibleId: managerialResponse.body.id,
        role: ResponsibilityRole.GERENCIAL,
      })
      .expect(201);

    await request(app.getHttpServer())
      .get('/api/v1/items')
      .query({ search: `${prefix}OPS`, type: CatalogItemType.SISTEMA })
      .expect(200)
      .expect(({ body }) => {
        expect(body.totalItems).toBe(1);
        expect(body.data[0]).toMatchObject({
          acronym: `${prefix}OPS`,
          status: OperationalStatus.OK,
        });
        expect(body.data[0].technicalResponsibles).toHaveLength(1);
        expect(body.data[0].managerialResponsibles).toHaveLength(1);
      });

    const futureReturn = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await request(app.getHttpServer())
      .patch(`/api/v1/items/${itemId}/status`)
      .send({
        expectedReturnAt: futureReturn,
        status: OperationalStatus.PARADO,
        statusNote: 'Indisponibilidade comunicada pela Infra',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.expectedReturnAt).toBe(futureReturn);
        expect(body.returnOverdue).toBe(false);
        expect(body.status).toBe(OperationalStatus.PARADO);
        expect(body.statusUpdatedAt).toEqual(expect.any(String));
      });

    await request(app.getHttpServer())
      .patch(`/api/v1/items/${itemId}/status`)
      .send({
        expectedReturnAt: '2026-01-01T00:00:00.000Z',
        status: OperationalStatus.INSTAVEL,
        statusNote: 'Oscilacao ainda em acompanhamento',
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.returnOverdue).toBe(true);
        expect(body.status).toBe(OperationalStatus.INSTAVEL);
      });

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

  it('covers pagination, empty search and combined filters', async () => {
    const fixtures = [
      {
        acronym: `${prefix}PAG1`,
        description: 'Sistema paginado do MVP',
        name: `${prefix}Paginado Sistema`,
        type: CatalogItemType.SISTEMA,
      },
      {
        acronym: `${prefix}PAG2`,
        description: 'Projeto paginado do MVP',
        name: `${prefix}Paginado Projeto`,
        type: CatalogItemType.PROJETO,
      },
      {
        acronym: `${prefix}PAG3`,
        description: 'Servico paginado do MVP',
        name: `${prefix}Paginado Servico`,
        type: CatalogItemType.SERVICO_INFRAESTRUTURA,
      },
    ];

    const createdIds: string[] = [];
    for (const fixture of fixtures) {
      const response = await request(app.getHttpServer())
        .post('/api/v1/items')
        .send(fixture)
        .expect(201);
      createdIds.push(response.body.id as string);
    }

    await request(app.getHttpServer())
      .patch(`/api/v1/items/${createdIds[1]}/status`)
      .send({
        status: OperationalStatus.PARADO,
        statusNote: 'Validacao de filtro combinado',
      })
      .expect(200);

    await request(app.getHttpServer())
      .get('/api/v1/items')
      .query({ page: 1, pageSize: 2, search: prefix })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveLength(2);
        expect(body.totalItems).toBeGreaterThanOrEqual(3);
        expect(body.totalPages).toBeGreaterThanOrEqual(2);
      });

    await request(app.getHttpServer())
      .get('/api/v1/items')
      .query({ search: `${prefix}NAO_EXISTE` })
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toHaveLength(0);
        expect(body.totalItems).toBe(0);
      });

    await request(app.getHttpServer())
      .get('/api/v1/items')
      .query({
        search: prefix,
        status: OperationalStatus.PARADO,
        type: CatalogItemType.PROJETO,
      })
      .expect(200)
      .expect(({ body }) => {
        expect(body.totalItems).toBe(1);
        expect(body.data[0]).toMatchObject({
          acronym: `${prefix}PAG2`,
          status: OperationalStatus.PARADO,
          type: CatalogItemType.PROJETO,
        });
      });
  });
});
