import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ActiveItemDto } from './dto/active-item.dto';
import { CreateItemResponsibilityDto } from './dto/create-item-responsibility.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { ListItemsQueryDto } from './dto/list-items-query.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemResponse, ItemsService } from './items.service';
import { PaginatedResponse } from '../common/pagination/paginated-response';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista itens com busca, filtros e paginacao.' })
  @ApiOkResponse({ description: 'Lista paginada de itens.' })
  list(@Query() query: ListItemsQueryDto): Promise<PaginatedResponse<ItemResponse>> {
    return this.itemsService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um item com responsaveis agrupados por papel.' })
  @ApiOkResponse({ description: 'Item encontrado.' })
  detail(@Param('id', new ParseUUIDPipe()) id: string): Promise<ItemResponse> {
    return this.itemsService.detail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um item do catalogo.' })
  @ApiCreatedResponse({ description: 'Item criado.' })
  create(@Body() dto: CreateItemDto): Promise<ItemResponse> {
    return this.itemsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza dados cadastrais de um item.' })
  @ApiOkResponse({ description: 'Item atualizado.' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateItemDto,
  ): Promise<ItemResponse> {
    return this.itemsService.update(id, dto);
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Ativa ou inativa um item.' })
  @ApiOkResponse({ description: 'Situacao do item atualizada.' })
  setActive(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ActiveItemDto,
  ): Promise<ItemResponse> {
    return this.itemsService.setActive(id, dto.active);
  }

  @Post(':itemId/responsibilities')
  @ApiOperation({ summary: 'Associa um responsavel e papel a um item.' })
  @ApiCreatedResponse({ description: 'Vinculo criado e item atualizado retornado.' })
  createResponsibility(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Body() dto: CreateItemResponsibilityDto,
  ): Promise<ItemResponse> {
    return this.itemsService.createResponsibility(itemId, dto);
  }

  @HttpCode(204)
  @ApiOperation({ summary: 'Remove um vinculo entre item e responsavel.' })
  @ApiOkResponse({ description: 'Vinculo removido.' })
  @Delete(':itemId/responsibilities/:relationshipId')
  deleteResponsibility(
    @Param('itemId', new ParseUUIDPipe()) itemId: string,
    @Param('relationshipId', new ParseUUIDPipe()) relationshipId: string,
  ): Promise<void> {
    return this.itemsService.deleteResponsibility(itemId, relationshipId);
  }
}
