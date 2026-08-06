import { ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogItemType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateItemDto {
  @ApiPropertyOptional({ enum: CatalogItemType, example: CatalogItemType.SISTEMA })
  @IsOptional()
  @IsEnum(CatalogItemType)
  type?: CatalogItemType;

  @ApiPropertyOptional({ example: 'CGTI', maxLength: 30, minLength: 1 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  acronym?: string;

  @ApiPropertyOptional({ example: 'Central de Gestao de TI', maxLength: 160, minLength: 1 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: 'Sistema usado para consulta de dados internos.' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;
}
