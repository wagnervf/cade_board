import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CatalogItem,
  ItemResponsibility,
  Prisma,
  Responsible,
  ResponsibilityRole,
  OperationalStatus,
} from '@prisma/client';

import { CreateItemDto } from './dto/create-item.dto';
import { CreateItemResponsibilityDto } from './dto/create-item-responsibility.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateItemStatusDto } from './dto/update-item-status.dto';
import {
  getTotalPages,
  PaginatedResponse,
} from '../common/pagination/paginated-response';
import { PrismaService } from '../prisma/prisma.service';

type ItemWithResponsibilities = CatalogItem & {
  responsibilities: Array<ItemResponsibility & { responsible: Responsible }>;
};

export type ItemResponsibleResponse = {
  active: boolean;
  contactChannel: string | null;
  email: string | null;
  id: string;
  name: string;
  phone: string | null;
  relationshipId: string;
};

export type ItemResponse = {
  active: boolean;
  acronym: string;
  createdAt: string;
  description: string;
  expectedReturnAt: string | null;
  id: string;
  managerialResponsibles: ItemResponsibleResponse[];
  name: string;
  status: string;
  statusNote: string | null;
  statusUpdatedAt: string;
  returnOverdue: boolean;
  technicalResponsibles: ItemResponsibleResponse[];
  type: string;
  updatedAt: string;
};

function normalizeAcronym(acronym: string): string {
  return acronym.trim().toUpperCase();
}

function trimRequired(value: string): string {
  return value.trim();
}

function isUniqueError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'P2002'
  );
}

function mapResponsible(
  relationship: ItemResponsibility & { responsible: Responsible },
): ItemResponsibleResponse {
  return {
    active: relationship.responsible.active,
    contactChannel: relationship.responsible.contactChannel,
    email: relationship.responsible.email,
    id: relationship.responsible.id,
    name: relationship.responsible.name,
    phone: relationship.responsible.phone,
    relationshipId: relationship.id,
  };
}

function toResponse(item: ItemWithResponsibilities): ItemResponse {
  const technicalResponsibles = item.responsibilities
    .filter((relationship) => relationship.role === ResponsibilityRole.TECNICO)
    .map(mapResponsible);
  const managerialResponsibles = item.responsibilities
    .filter((relationship) => relationship.role === ResponsibilityRole.GERENCIAL)
    .map(mapResponsible);

  return {
    active: item.active,
    acronym: item.acronym,
    createdAt: item.createdAt.toISOString(),
    description: item.description,
    expectedReturnAt: item.expectedReturnAt?.toISOString() ?? null,
    id: item.id,
    managerialResponsibles,
    name: item.name,
    status: item.status,
    statusNote: item.statusNote,
    statusUpdatedAt: item.statusUpdatedAt.toISOString(),
    returnOverdue:
      item.status !== OperationalStatus.OK &&
      item.expectedReturnAt !== null &&
      item.expectedReturnAt.getTime() < Date.now(),
    technicalResponsibles,
    type: item.type,
    updatedAt: item.updatedAt.toISOString(),
  };
}

@Injectable()
export class ItemsService {
  private readonly includeResponsibilities = {
    responsibilities: {
      include: { responsible: true },
      orderBy: [{ role: 'asc' }, { responsible: { name: 'asc' } }],
    },
  } satisfies Prisma.CatalogItemInclude;

  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListItemsQueryDto): Promise<PaginatedResponse<ItemResponse>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.buildListWhere(query);

    const [totalItems, items] = await Promise.all([
      this.prisma.catalogItem.count({ where }),
      this.prisma.catalogItem.findMany({
        include: this.includeResponsibilities,
        orderBy: [{ status: 'desc' }, { acronym: 'asc' }, { name: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }),
    ]);

    return {
      data: items.map((item) => toResponse(item as ItemWithResponsibilities)),
      page,
      pageSize,
      totalItems,
      totalPages: getTotalPages(totalItems, pageSize),
    };
  }

  async detail(id: string): Promise<ItemResponse> {
    const item = await this.findExisting(id);
    return toResponse(item);
  }

  async create(dto: CreateItemDto): Promise<ItemResponse> {
    try {
      const item = await this.prisma.catalogItem.create({
        data: {
          acronym: normalizeAcronym(dto.acronym),
          description: trimRequired(dto.description),
          name: trimRequired(dto.name),
          type: dto.type,
        },
        include: this.includeResponsibilities,
      });

      return toResponse(item as ItemWithResponsibilities);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async update(id: string, dto: UpdateItemDto): Promise<ItemResponse> {
    await this.findExisting(id);

    try {
      const item = await this.prisma.catalogItem.update({
        data: {
          ...(dto.acronym !== undefined ? { acronym: normalizeAcronym(dto.acronym) } : {}),
          ...(dto.description !== undefined
            ? { description: trimRequired(dto.description) }
            : {}),
          ...(dto.name !== undefined ? { name: trimRequired(dto.name) } : {}),
          ...(dto.type !== undefined ? { type: dto.type } : {}),
        },
        include: this.includeResponsibilities,
        where: { id },
      });

      return toResponse(item as ItemWithResponsibilities);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  async setActive(id: string, active: boolean): Promise<ItemResponse> {
    await this.findExisting(id);

    const item = await this.prisma.catalogItem.update({
      data: { active },
      include: this.includeResponsibilities,
      where: { id },
    });

    return toResponse(item as ItemWithResponsibilities);
  }

  async updateStatus(id: string, dto: UpdateItemStatusDto): Promise<ItemResponse> {
    await this.findExisting(id);
    const expectedReturnAt =
      dto.status === OperationalStatus.OK
        ? null
        : this.parseOptionalDate(dto.expectedReturnAt);

    const item = await this.prisma.catalogItem.update({
      data: {
        expectedReturnAt,
        status: dto.status,
        statusNote: this.normalizeOptionalText(dto.statusNote),
        statusUpdatedAt: new Date(),
      },
      include: this.includeResponsibilities,
      where: { id },
    });

    return toResponse(item as ItemWithResponsibilities);
  }

  async createResponsibility(
    itemId: string,
    dto: CreateItemResponsibilityDto,
  ): Promise<ItemResponse> {
    const [item, responsible] = await Promise.all([
      this.findExisting(itemId),
      this.prisma.responsible.findUnique({ where: { id: dto.responsibleId } }),
    ]);

    if (!item.active) {
      throw new BadRequestException('Nao e possivel vincular responsavel a item inativo.');
    }

    if (!responsible) {
      throw new NotFoundException('Responsavel nao encontrado.');
    }

    if (!responsible.active) {
      throw new BadRequestException('Nao e possivel vincular responsavel inativo.');
    }

    try {
      await this.prisma.itemResponsibility.create({
        data: {
          itemId,
          responsibleId: dto.responsibleId,
          role: dto.role,
        },
      });
    } catch (error) {
      if (isUniqueError(error)) {
        throw new ConflictException('Este responsavel ja possui este papel no item.');
      }
      throw error;
    }

    return this.detail(itemId);
  }

  async deleteResponsibility(itemId: string, relationshipId: string): Promise<void> {
    await this.findExisting(itemId);
    const relationship = await this.prisma.itemResponsibility.findFirst({
      where: {
        id: relationshipId,
        itemId,
      },
    });

    if (!relationship) {
      throw new NotFoundException('Vinculo de responsabilidade nao encontrado.');
    }

    await this.prisma.itemResponsibility.delete({
      where: { id: relationshipId },
    });
  }

  private buildListWhere(query: ListItemsQueryDto): Prisma.CatalogItemWhereInput {
    const search = query.search?.trim();

    return {
      ...(query.includeInactive ? {} : { active: true }),
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(search
        ? {
            OR: [
              { acronym: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { description: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private async findExisting(id: string): Promise<ItemWithResponsibilities> {
    const item = await this.prisma.catalogItem.findUnique({
      include: this.includeResponsibilities,
      where: { id },
    });

    if (!item) {
      throw new NotFoundException('Item nao encontrado.');
    }

    return item as ItemWithResponsibilities;
  }

  private normalizeOptionalText(value: string | null | undefined): string | null {
    if (typeof value !== 'string') {
      return null;
    }

    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  }

  private parseOptionalDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    return new Date(value);
  }

  private handlePersistenceError(error: unknown): never {
    if (isUniqueError(error)) {
      throw new ConflictException('Ja existe um item com esta sigla.');
    }

    throw error;
  }
}
