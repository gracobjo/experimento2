import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateClientProfileDto {
  @ApiProperty({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez García'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Email del cliente',
    example: 'juan.perez@email.com'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+34 600 123 456',
    required: false
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Dirección del cliente',
    example: 'Calle Mayor 123, 28001 Madrid',
    required: false
  })
  @IsOptional()
  @IsString()
  address?: string;
}
