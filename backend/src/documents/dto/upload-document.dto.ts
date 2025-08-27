import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    description: 'ID del expediente asociado',
    example: 'exp-003',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  expedienteId: string;

  @ApiProperty({
    description: 'Descripción del documento',
    example: 'Contrato de arrendamiento del local comercial',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;
} 