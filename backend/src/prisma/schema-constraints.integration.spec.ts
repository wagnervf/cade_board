import {
  CatalogItemType,
  OperationalStatus,
  Prisma,
  PrismaClient,
  ResponsibilityRole,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run integration tests');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString,
    }),
  ),
});

async function createItem(acronym: string): Promise<string> {
  const item = await prisma.catalogItem.create({
    data: {
      acronym,
      description: `Descricao ${acronym}`,
      name: `Item ${acronym}`,
      status: OperationalStatus.OK,
      type: CatalogItemType.SISTEMA,
    },
    select: { id: true },
  });

  return item.id;
}

async function createResponsible(name: string): Promise<string> {
  const responsible = await prisma.responsible.create({
    data: {
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@example.internal`,
      name,
    },
    select: { id: true },
  });

  return responsible.id;
}

async function cleanDatabase(): Promise<void> {
  await prisma.itemResponsibility.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.responsible.deleteMany();
}

describe('Prisma schema constraints', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await prisma.$disconnect();
  });

  it('rejects catalog item acronyms that differ only by case', async () => {
    await createItem('CGTI');

    await expect(createItem('cgti')).rejects.toBeInstanceOf(
      Prisma.PrismaClientKnownRequestError,
    );
  });

  it('requires at least one responsible contact field', async () => {
    await expect(
      prisma.responsible.create({
        data: {
          name: 'Responsavel Sem Contato',
        },
      }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });

  it('rejects duplicated item, responsible and role relationships', async () => {
    const itemId = await createItem('SIA');
    const responsibleId = await createResponsible('Tecnico SIA');

    await prisma.itemResponsibility.create({
      data: {
        itemId,
        responsibleId,
        role: ResponsibilityRole.TECNICO,
      },
    });

    await expect(
      prisma.itemResponsibility.create({
        data: {
          itemId,
          responsibleId,
          role: ResponsibilityRole.TECNICO,
        },
      }),
    ).rejects.toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
  });
});
