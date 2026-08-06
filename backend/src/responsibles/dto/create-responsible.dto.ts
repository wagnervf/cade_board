import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { AtLeastOneContact } from './contact-required.validator';

@AtLeastOneContact({
  message: 'Informe ao menos uma forma de contato: telefone, e-mail ou canal de contato.',
})
export class CreateResponsibleDto {
  @ApiProperty({ example: 'Ana Souza', maxLength: 160, minLength: 1 })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional({ example: '+55 61 3000-1001', maxLength: 40 })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @ApiPropertyOptional({ example: 'ana.souza@example.internal', maxLength: 254 })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: 'Teams: ana.souza', maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  contactChannel?: string;
}
