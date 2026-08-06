import { ApiProperty } from '@nestjs/swagger';
import { ResponsibilityRole } from '@prisma/client';
import { IsEnum, IsUUID } from 'class-validator';

export class CreateItemResponsibilityDto {
  @ApiProperty({ example: '00000000-0000-0000-0000-000000000000' })
  @IsUUID()
  responsibleId!: string;

  @ApiProperty({ enum: ResponsibilityRole, example: ResponsibilityRole.TECNICO })
  @IsEnum(ResponsibilityRole)
  role!: ResponsibilityRole;
}
