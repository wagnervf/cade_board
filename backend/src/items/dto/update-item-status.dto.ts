import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OperationalStatus } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString } from 'class-validator';

export class UpdateItemStatusDto {
  @ApiProperty({ enum: OperationalStatus, example: OperationalStatus.PARADO })
  @IsEnum(OperationalStatus)
  status!: OperationalStatus;

  @ApiPropertyOptional({
    example: 'Indisponibilidade em analise.',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsString()
  statusNote?: string | null;

  @ApiPropertyOptional({
    example: '2026-08-06T21:00:00.000Z',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsISO8601()
  expectedReturnAt?: string | null;
}
