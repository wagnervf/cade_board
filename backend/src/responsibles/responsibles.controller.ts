import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { ActiveResponsibleDto } from './dto/active-responsible.dto';
import { CreateResponsibleDto } from './dto/create-responsible.dto';
import { ListResponsiblesQueryDto } from './dto/list-responsibles-query.dto';
import { UpdateResponsibleDto } from './dto/update-responsible.dto';
import { ResponsibleResponse, ResponsiblesService } from './responsibles.service';
import { PaginatedResponse } from '../common/pagination/paginated-response';

@ApiTags('responsibles')
@Controller('responsibles')
export class ResponsiblesController {
  constructor(private readonly responsiblesService: ResponsiblesService) {}

  @Get()
  @ApiOperation({ summary: 'Lista responsaveis com busca por nome e paginacao.' })
  @ApiOkResponse({ description: 'Lista paginada de responsaveis.' })
  list(
    @Query() query: ListResponsiblesQueryDto,
  ): Promise<PaginatedResponse<ResponsibleResponse>> {
    return this.responsiblesService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um responsavel.' })
  @ApiOkResponse({ description: 'Responsavel encontrado.' })
  detail(@Param('id', new ParseUUIDPipe()) id: string): Promise<ResponsibleResponse> {
    return this.responsiblesService.detail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um responsavel.' })
  @ApiCreatedResponse({ description: 'Responsavel criado.' })
  create(@Body() dto: CreateResponsibleDto): Promise<ResponsibleResponse> {
    return this.responsiblesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza um responsavel.' })
  @ApiOkResponse({ description: 'Responsavel atualizado.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateResponsibleDto,
  ): Promise<ResponsibleResponse> {
    return this.responsiblesService.update(id, dto);
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Ativa ou inativa um responsavel.' })
  @ApiOkResponse({ description: 'Situacao do responsavel atualizada.' })
  setActive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActiveResponsibleDto,
  ): Promise<ResponsibleResponse> {
    return this.responsiblesService.setActive(id, dto.active);
  }
}
