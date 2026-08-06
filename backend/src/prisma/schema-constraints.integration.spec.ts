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

const pool = new Pool({
  connectionString,
});
const prisma = new PrismaClient({
  adapter: new PrismaPg(pool),
});

const prefix = `IT_SCHEMA_${Date.now()}_`;
const createdItemAcronyms: string[] = [];
const createdResponsibleNames: string[] = [];

async function createItem(acronym: string): Promise<string> {
  createdItemAcronyms.push(acronym);
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
  createdResponsibleNames.push(name);
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
  await prisma.itemResponsibility.deleteMany({
    where: {
      OR: [
        { item: { acronym: { in: createdItemAcronyms } } },
        { responsible: { name: { in: createdResponsibleNames } } },
      ],
    },
  });
  await prisma.catalogItem.deleteMany({
    where: { acronym: { in: createdItemAcronyms } },
  });
  await prisma.responsible.deleteMany({
    where: { name: { in: createdResponsibleNames } },
  });
  createdItemAcronyms.length = 0;
  createdResponsibleNames.length = 0;
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
    await pool.end();
  });

  it('rejects catalog item acronyms that differ only by case', async () => {
    await createItem(`${prefix}CGTI`);

    await expect(createItem(`${prefix.toLowerCase()}cgti`)).rejects.toBeInstanceOf(
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
    const itemId = await createItem(`${prefix}SIA`);
    const responsibleId = await createResponsible(`${prefix}Tecnico SIA`);

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
