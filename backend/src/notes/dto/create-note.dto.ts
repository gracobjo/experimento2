import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'ID del expediente al que pertenece la nota' })
  @IsString()
  @IsNotEmpty()
  expedienteId: string;

  @ApiProperty({ description: 'Título de la nota' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Contenido de la nota' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ description: 'Si la nota es privada (solo visible para abogados)', default: false })
  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
} 