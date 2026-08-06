import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ActiveResponsibleDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  active!: boolean;
}
