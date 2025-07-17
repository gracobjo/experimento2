import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString, IsArray, ValidateNested, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateInvoiceItemDto {
  @ApiProperty({
    description: 'Descripción del concepto',
    example: 'Consulta legal',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: 'Cantidad',
    example: 1,
    type: Number,
  })
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario',
    example: 100.00,
    type: Number,
  })
  @IsNumber()
  unitPrice: number;
}

export class UpdateInvoiceDto {
  @ApiProperty({
    description: 'ID del receptor',
    example: '123e4567-e89b-12d3-a456-426614174002',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  receptorId?: string;

  @ApiProperty({
    description: 'ID del expediente asociado',
    example: '123e4567-e89b-12d3-a456-426614174003',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  expedienteId?: string;

  @ApiProperty({
    description: 'Tipo de IVA (porcentaje)',
    example: 21,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  tipoIVA?: number;

  @ApiProperty({
    description: 'Porcentaje de descuento',
    example: 10,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  descuento?: number;

  @ApiProperty({
    description: 'Porcentaje de retención',
    example: 15,
    required: false,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  retencion?: number;

  @ApiProperty({
    description: 'Si se debe aplicar IVA',
    example: true,
    required: false,
    type: Boolean,
  })
  @IsBoolean()
  @IsOptional()
  aplicarIVA?: boolean;

  @ApiProperty({
    description: 'Régimen IVA del emisor',
    example: 'General',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  regimenIvaEmisor?: string;

  @ApiProperty({
    description: 'Clave de operación',
    example: '01',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  claveOperacion?: string;

  @ApiProperty({
    description: 'Método de pago',
    example: 'transferencia',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  metodoPago?: string;

  @ApiProperty({
    description: 'Fecha de operación',
    example: '2024-12-25',
    required: false,
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  fechaOperacion?: string;

  @ApiProperty({
    description: 'Fecha de la factura',
    example: '2024-12-25',
    required: false,
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  fechaFactura?: string;

  @ApiProperty({
    description: 'Estado de la factura',
    example: 'emitida',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({
    description: 'Motivo de anulación',
    example: 'Error en datos del cliente',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  motivoAnulacion?: string;

  @ApiProperty({
    description: 'Fecha de pago',
    example: '2024-12-25',
    required: false,
    type: String,
    format: 'date',
  })
  @IsDateString()
  @IsOptional()
  paymentDate?: string;

  @ApiProperty({
    description: 'Items de la factura',
    required: false,
    type: [UpdateInvoiceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateInvoiceItemDto)
  @IsOptional()
  items?: UpdateInvoiceItemDto[];

  @ApiProperty({
    description: 'IDs de las provisiones de fondos asociadas',
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  provisionIds?: string[];
} 