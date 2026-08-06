import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CatalogItemType, OperationalStatus, ResponsibilityRole } from '@prisma/client';

import { ItemsService } from './items.service';
import { PrismaService } from '../prisma/prisma.service';

function makeItem(overrides = {}) {
  const now = new Date('2026-08-06T18:00:00.000Z');

  return {
    active: true,
    acronym: 'CGTI',
    createdAt: now,
    description: 'Descricao',
    expectedReturnAt: null,
    id: 'item-id',
    name: 'Central de Gestao de TI',
    responsibilities: [],
    status: OperationalStatus.OK,
    statusNote: null,
    statusUpdatedAt: now,
    type: CatalogItemType.SISTEMA,
    updatedAt: now,
    ...overrides,
  };
}

describe('ItemsService', () => {
  const prisma = {
    catalogItem: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    itemResponsibility: {
      create: jest.fn(),
      delete: jest.fn(),
      findFirst: jest.fn(),
    },
    responsible: {
      findUnique: jest.fn(),
    },
  } as unknown as jest.Mocked<PrismaService>;

  let service: ItemsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ItemsService(prisma);
  });

  it('normalizes acronym to uppercase on create', async () => {
    prisma.catalogItem.create.mockResolvedValue(makeItem());

    await service.create({
      acronym: 'cgti',
      description: 'Descricao',
      name: 'Central',
      type: CatalogItemType.SISTEMA,
    });

    expect(prisma.catalogItem.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ acronym: 'CGTI' }),
      }),
    );
  });

  it('lists active items with combined search and filters', async () => {
    prisma.catalogItem.count.mockResolvedValue(1);
    prisma.catalogItem.findMany.mockResolvedValue([makeItem()]);

    await expect(
      service.list({
        page: 1,
        pageSize: 20,
        search: 'cgti',
        status: OperationalStatus.OK,
        type: CatalogItemType.SISTEMA,
      }),
    ).resolves.toMatchObject({
      totalItems: 1,
      totalPages: 1,
    });

    expect(prisma.catalogItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ status: 'desc' }, { acronym: 'asc' }, { name: 'asc' }],
        where: expect.objectContaining({
          active: true,
          status: OperationalStatus.OK,
          type: CatalogItemType.SISTEMA,
        }),
      }),
    );
  });

  it('returns not found for missing detail', async () => {
    prisma.catalogItem.findUnique.mockResolvedValue(null);

    await expect(service.detail('missing-id')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('maps unique acronym errors to conflict', async () => {
    const error = { code: 'P2002' };
    prisma.catalogItem.create.mockRejectedValue(error);

    await expect(
      service.create({
        acronym: 'CGTI',
        description: 'Descricao',
        name: 'Central',
        type: CatalogItemType.SISTEMA,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects relationship creation for inactive item', async () => {
    prisma.catalogItem.findUnique.mockResolvedValue(makeItem({ active: false }));
    prisma.responsible.findUnique.mockResolvedValue({
      active: true,
      contactChannel: null,
      createdAt: new Date(),
      email: 'ana@example.internal',
      id: 'responsible-id',
      name: 'Ana',
      phone: null,
      updatedAt: new Date(),
    });

    await expect(
      service.createResponsibility('item-id', {
        responsibleId: 'responsible-id',
        role: ResponsibilityRole.TECNICO,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps duplicated relationship to conflict', async () => {
    prisma.catalogItem.findUnique.mockResolvedValue(makeItem());
    prisma.responsible.findUnique.mockResolvedValue({
      active: true,
      contactChannel: null,
      createdAt: new Date(),
      email: 'ana@example.internal',
      id: 'responsible-id',
      name: 'Ana',
      phone: null,
      updatedAt: new Date(),
    });
    prisma.itemResponsibility.create.mockRejectedValue({ code: 'P2002' });

    await expect(
      service.createResponsibility('item-id', {
        responsibleId: 'responsible-id',
        role: ResponsibilityRole.TECNICO,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
