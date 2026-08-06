import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateResponsibleDto {
  @ApiPropertyOptional({ example: 'Ana Souza', maxLength: 160, minLength: 1 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @ApiPropertyOptional({ example: '+55 61 3000-1001', maxLength: 40, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string | null;

  @ApiPropertyOptional({ example: 'ana.souza@example.internal', maxLength: 254, nullable: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string | null;

  @ApiPropertyOptional({ example: 'Teams: ana.souza', maxLength: 120, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactChannel?: string | null;
}
