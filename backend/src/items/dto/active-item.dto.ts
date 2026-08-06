import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class ActiveItemDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  active!: boolean;
}
