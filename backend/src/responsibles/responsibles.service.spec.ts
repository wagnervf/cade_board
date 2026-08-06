import { BadRequestException, NotFoundException } from '@nestjs/common';

import { ResponsiblesService } from './responsibles.service';
import { PrismaService } from '../prisma/prisma.service';

type ResponsibleModel = {
  active: boolean;
  contactChannel: string | null;
  createdAt: Date;
  email: string | null;
  id: string;
  name: string;
  phone: string | null;
  updatedAt: Date;
};

function makeResponsible(overrides: Partial<ResponsibleModel> = {}): ResponsibleModel {
  const now = new Date('2026-08-06T18:00:00.000Z');

  return {
    active: true,
    contactChannel: null,
    createdAt: now,
    email: 'ana@example.internal',
    id: 'responsible-id',
    name: 'Ana Souza',
    phone: null,
    updatedAt: now,
    ...overrides,
  };
}

describe('ResponsiblesService', () => {
  const prisma = {
    responsible: {
      count: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  let service: ResponsiblesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResponsiblesService(prisma);
  });

  it('lists responsibles with pagination metadata', async () => {
    prisma.responsible.count.mockResolvedValue(1);
    prisma.responsible.findMany.mockResolvedValue([makeResponsible()]);

    await expect(service.list({ page: 1, pageSize: 20, search: 'ana' })).resolves.toMatchObject({
      page: 1,
      pageSize: 20,
      totalItems: 1,
      totalPages: 1,
    });
    expect(prisma.responsible.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 20,
        where: { name: { contains: 'ana', mode: 'insensitive' } },
      }),
    );
  });

  it('creates a responsible when at least one contact exists', async () => {
    prisma.responsible.create.mockResolvedValue(makeResponsible());

    await expect(
      service.create({ email: 'ana@example.internal', name: 'Ana Souza' }),
    ).resolves.toMatchObject({
      email: 'ana@example.internal',
      name: 'Ana Souza',
    });
  });

  it('rejects create without contact', async () => {
    await expect(service.create({ name: 'Sem Contato' })).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects update when the resulting record has no contact', async () => {
    prisma.responsible.findUnique.mockResolvedValue(makeResponsible({ email: 'ana@example.internal' }));

    await expect(
      service.update('responsible-id', {
        contactChannel: null,
        email: null,
        phone: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns not found for missing detail', async () => {
    prisma.responsible.findUnique.mockResolvedValue(null);

    await expect(service.detail('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });
});
