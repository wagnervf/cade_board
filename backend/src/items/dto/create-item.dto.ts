import { ApiProperty } from '@nestjs/swagger';
import { CatalogItemType } from '@prisma/client';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ enum: CatalogItemType, example: CatalogItemType.SISTEMA })
  @IsEnum(CatalogItemType)
  type!: CatalogItemType;

  @ApiProperty({ example: 'CGTI', maxLength: 30, minLength: 1 })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  acronym!: string;

  @ApiProperty({ example: 'Central de Gestao de TI', maxLength: 160, minLength: 1 })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty({ example: 'Sistema usado para consulta de dados internos.' })
  @IsString()
  @MinLength(1)
  description!: string;
}
