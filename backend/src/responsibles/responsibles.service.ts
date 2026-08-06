import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Responsible } from '@prisma/client';

import { CreateResponsibleDto } from './dto/create-responsible.dto';
import { hasAtLeastOneContact } from './dto/contact-required.validator';
import { ListResponsiblesQueryDto } from './dto/list-responsibles-query.dto';
import { UpdateResponsibleDto } from './dto/update-responsible.dto';
import {
  getTotalPages,
  PaginatedResponse,
} from '../common/pagination/paginated-response';
import { PrismaService } from '../prisma/prisma.service';

export type ResponsibleResponse = {
  active: boolean;
  contactChannel: string | null;
  createdAt: string;
  email: string | null;
  id: string;
  name: string;
  phone: string | null;
  updatedAt: string;
};

type ResponsibleContact = {
  contactChannel?: string | null;
  email?: string | null;
  phone?: string | null;
};

type ResponsibleUpdateData = ResponsibleContact & {
  name?: string;
};

function trimOptional(value: string | null | undefined): string | null | undefined {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

function toResponse(responsible: Responsible): ResponsibleResponse {
  return {
    active: responsible.active,
    contactChannel: responsible.contactChannel,
    createdAt: responsible.createdAt.toISOString(),
    email: responsible.email,
    id: responsible.id,
    name: responsible.name,
    phone: responsible.phone,
    updatedAt: responsible.updatedAt.toISOString(),
  };
}

@Injectable()
export class ResponsiblesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    query: ListResponsiblesQueryDto,
  ): Promise<PaginatedResponse<ResponsibleResponse>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const search = query.search?.trim();
    const where: Prisma.ResponsibleWhereInput = search
      ? { name: { contains: search, mode: 'insensitive' } }
      : {};

    const [totalItems, responsibles] = await Promise.all([
      this.prisma.responsible.count({ where }),
      this.prisma.responsible.findMany({
        orderBy: [{ name: 'asc' }, { createdAt: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        where,
      }),
    ]);

    return {
      data: responsibles.map(toResponse),
      page,
      pageSize,
      totalItems,
      totalPages: getTotalPages(totalItems, pageSize),
    };
  }

  async detail(id: string): Promise<ResponsibleResponse> {
    const responsible = await this.findExisting(id);
    return toResponse(responsible);
  }

  async create(dto: CreateResponsibleDto): Promise<ResponsibleResponse> {
    const data = this.normalizeCreate(dto);
    this.assertHasContact(data);

    const responsible = await this.prisma.responsible.create({ data });
    return toResponse(responsible);
  }

  async update(id: string, dto: UpdateResponsibleDto): Promise<ResponsibleResponse> {
    const existing = await this.findExisting(id);
    const data = this.normalizeUpdate(dto);
    const resultingContact: ResponsibleContact = {
      contactChannel:
        data.contactChannel === undefined ? existing.contactChannel : data.contactChannel,
      email: data.email === undefined ? existing.email : data.email,
      phone: data.phone === undefined ? existing.phone : data.phone,
    };

    this.assertHasContact(resultingContact);

    const responsible = await this.prisma.responsible.update({
      data,
      where: { id },
    });

    return toResponse(responsible);
  }

  async setActive(id: string, active: boolean): Promise<ResponsibleResponse> {
    await this.findExisting(id);

    const responsible = await this.prisma.responsible.update({
      data: { active },
      where: { id },
    });

    return toResponse(responsible);
  }

  private async findExisting(id: string): Promise<Responsible> {
    const responsible = await this.prisma.responsible.findUnique({
      where: { id },
    });

    if (!responsible) {
      throw new NotFoundException('Responsavel nao encontrado.');
    }

    return responsible;
  }

  private normalizeCreate(dto: CreateResponsibleDto): Prisma.ResponsibleCreateInput {
    return {
      contactChannel: trimOptional(dto.contactChannel) ?? null,
      email: trimOptional(dto.email) ?? null,
      name: dto.name.trim(),
      phone: trimOptional(dto.phone) ?? null,
    };
  }

  private normalizeUpdate(dto: UpdateResponsibleDto): ResponsibleUpdateData {
    return {
      ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
      ...(dto.phone !== undefined ? { phone: trimOptional(dto.phone) ?? null } : {}),
      ...(dto.email !== undefined ? { email: trimOptional(dto.email) ?? null } : {}),
      ...(dto.contactChannel !== undefined
        ? { contactChannel: trimOptional(dto.contactChannel) ?? null }
        : {}),
    };
  }

  private assertHasContact(contact: ResponsibleContact): void {
    if (!hasAtLeastOneContact(contact)) {
      throw new BadRequestException(
        'Informe ao menos uma forma de contato: telefone, e-mail ou canal de contato.',
      );
    }
  }
}
