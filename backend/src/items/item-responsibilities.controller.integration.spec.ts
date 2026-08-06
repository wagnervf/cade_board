import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CatalogItemType, ResponsibilityRole } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../app.module';
import { configureApp } from '../app.setup';
import { PrismaService } from '../prisma/prisma.service';

describe('Item responsibilities integration', () => {
  const prefix = `IT_REL_${Date.now()}_`;
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

  async function createFixture(): Promise<{ itemId: string; responsibleId: string }> {
    const item = await prisma.catalogItem.create({
      data: {
        acronym: `${prefix}SIA`,
        description: 'Sistema de integracao',
        name: `${prefix}Sistema Integrado`,
        type: CatalogItemType.SISTEMA,
      },
      select: { id: true },
    });
    const responsible = await prisma.responsible.create({
      data: {
        email: `${prefix.toLowerCase()}tecnico@example.internal`,
        name: `${prefix}Tecnico`,
      },
      select: { id: true },
    });

    return { itemId: item.id, responsibleId: responsible.id };
  }

  it('creates two roles for the same responsible and removes one relationship', async () => {
    const { itemId, responsibleId } = await createFixture();

    const technicalResponse = await request(app.getHttpServer())
      .post(`/api/v1/items/${itemId}/responsibilities`)
      .send({ responsibleId, role: ResponsibilityRole.TECNICO })
      .expect(201);

    expect(technicalResponse.body.technicalResponsibles).toHaveLength(1);
    const relationshipId = technicalResponse.body.technicalResponsibles[0].relationshipId as string;

    await request(app.getHttpServer())
      .post(`/api/v1/items/${itemId}/responsibilities`)
      .send({ responsibleId, role: ResponsibilityRole.GERENCIAL })
      .expect(201)
      .expect(({ body }) => {
        expect(body.managerialResponsibles).toHaveLength(1);
        expect(body.technicalResponsibles).toHaveLength(1);
      });

    await request(app.getHttpServer())
      .post(`/api/v1/items/${itemId}/responsibilities`)
      .send({ responsibleId, role: ResponsibilityRole.TECNICO })
      .expect(409);

    await request(app.getHttpServer())
      .delete(`/api/v1/items/${itemId}/responsibilities/${relationshipId}`)
      .expect(204);

    await expect(
      prisma.responsible.findUniqueOrThrow({ where: { id: responsibleId } }),
    ).resolves.toMatchObject({ id: responsibleId });
  });

  it('rejects inactive item or responsible when creating a relationship', async () => {
    const { itemId, responsibleId } = await createFixture();

    await prisma.catalogItem.update({ data: { active: false }, where: { id: itemId } });

    await request(app.getHttpServer())
      .post(`/api/v1/items/${itemId}/responsibilities`)
      .send({ responsibleId, role: ResponsibilityRole.TECNICO })
      .expect(400);
  });
});
