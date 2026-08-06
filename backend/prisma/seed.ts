import {
  CatalogItemType,
  OperationalStatus,
  PrismaClient,
  ResponsibilityRole,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the seed');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg(
    new Pool({
      connectionString,
    }),
  ),
});

type SeedResponsible = {
  contactChannel?: string;
  email?: string;
  name: string;
  phone?: string;
};

type SeedItem = {
  acronym: string;
  description: string;
  managers: string[];
  name: string;
  technicians: string[];
  type: CatalogItemType;
};

const responsibles: SeedResponsible[] = [
  {
    contactChannel: 'Teams: ana.souza',
    email: 'ana.souza@example.internal',
    name: 'Ana Souza',
    phone: '+55 61 3000-1001',
  },
  {
    contactChannel: 'Ramal 2202',
    email: 'bruno.lima@example.internal',
    name: 'Bruno Lima',
  },
  {
    contactChannel: 'Teams: carla.mendes',
    email: 'carla.mendes@example.internal',
    name: 'Carla Mendes',
    phone: '+55 61 3000-1003',
  },
  {
    contactChannel: 'Plantao Infra',
    name: 'Equipe Infraestrutura',
    phone: '+55 61 3000-1999',
  },
];

const items: SeedItem[] = [
  {
    acronym: 'SIGA',
    description: 'Sistema de gestao administrativa usado pelo atendimento interno.',
    managers: ['Carla Mendes'],
    name: 'Sistema Integrado de Gestao Administrativa',
    technicians: ['Ana Souza', 'Bruno Lima'],
    type: CatalogItemType.SISTEMA,
  },
  {
    acronym: 'PGD',
    description: 'Projeto de modernizacao do painel gerencial de demandas.',
    managers: ['Carla Mendes'],
    name: 'Projeto Gestao de Demandas',
    technicians: ['Bruno Lima'],
    type: CatalogItemType.PROJETO,
  },
  {
    acronym: 'VPN',
    description: 'Servico de infraestrutura para acesso remoto seguro.',
    managers: ['Carla Mendes'],
    name: 'Acesso VPN Corporativo',
    technicians: ['Equipe Infraestrutura'],
    type: CatalogItemType.SERVICO_INFRAESTRUTURA,
  },
];

async function upsertResponsible(data: SeedResponsible): Promise<string> {
  const existing = await prisma.responsible.findFirst({
    where: { name: data.name },
    select: { id: true },
  });

  if (existing) {
    await prisma.responsible.update({
      data: {
        active: true,
        contactChannel: data.contactChannel,
        email: data.email,
        phone: data.phone,
      },
      where: { id: existing.id },
    });
    return existing.id;
  }

  const created = await prisma.responsible.create({
    data: {
      contactChannel: data.contactChannel,
      email: data.email,
      name: data.name,
      phone: data.phone,
    },
    select: { id: true },
  });

  return created.id;
}

async function upsertItem(data: SeedItem): Promise<string> {
  const existing = await prisma.catalogItem.findFirst({
    where: { acronym: data.acronym },
    select: { id: true },
  });

  if (existing) {
    await prisma.catalogItem.update({
      data: {
        active: true,
        description: data.description,
        name: data.name,
        status: OperationalStatus.OK,
        statusNote: null,
        expectedReturnAt: null,
        type: data.type,
      },
      where: { id: existing.id },
    });
    return existing.id;
  }

  const created = await prisma.catalogItem.create({
    data: {
      acronym: data.acronym,
      description: data.description,
      name: data.name,
      type: data.type,
    },
    select: { id: true },
  });

  return created.id;
}

async function ensureRelationship(
  itemId: string,
  responsibleId: string,
  role: ResponsibilityRole,
): Promise<void> {
  const existing = await prisma.itemResponsibility.findFirst({
    where: { itemId, responsibleId, role },
    select: { id: true },
  });

  if (!existing) {
    await prisma.itemResponsibility.create({
      data: { itemId, responsibleId, role },
    });
  }
}

async function main(): Promise<void> {
  const responsibleIds = new Map<string, string>();

  for (const responsible of responsibles) {
    responsibleIds.set(responsible.name, await upsertResponsible(responsible));
  }

  for (const item of items) {
    const itemId = await upsertItem(item);

    for (const name of item.technicians) {
      const responsibleId = responsibleIds.get(name);
      if (!responsibleId) {
        throw new Error(`Responsible not found in seed: ${name}`);
      }
      await ensureRelationship(itemId, responsibleId, ResponsibilityRole.TECNICO);
    }

    for (const name of item.managers) {
      const responsibleId = responsibleIds.get(name);
      if (!responsibleId) {
        throw new Error(`Responsible not found in seed: ${name}`);
      }
      await ensureRelationship(itemId, responsibleId, ResponsibilityRole.GERENCIAL);
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  });
