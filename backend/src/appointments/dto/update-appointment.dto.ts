import { IsOptional, IsString, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAppointmentDto {
  @ApiProperty({
    description: 'Nueva fecha y hora de la cita',
    example: '2024-01-15T10:00:00.000Z',
    required: false
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({
    description: 'Nueva ubicación de la cita',
    example: 'Oficina principal, Calle Mayor 123',
    required: false
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ApiProperty({
    description: 'Nuevas notas o comentarios sobre la cita',
    example: 'Cita para revisar documentos del caso',
    required: false
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
