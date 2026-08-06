import { ApiPropertyOptional } from '@nestjs/swagger';
import { CatalogItemType, OperationalStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListItemsQueryDto {
  @ApiPropertyOptional({ example: 'cgti' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CatalogItemType })
  @IsOptional()
  @IsEnum(CatalogItemType)
  type?: CatalogItemType;

  @ApiPropertyOptional({ enum: OperationalStatus })
  @IsOptional()
  @IsEnum(OperationalStatus)
  status?: OperationalStatus;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeInactive?: boolean = false;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
