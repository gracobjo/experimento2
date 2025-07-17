import { IsString, IsDateString, IsOptional, IsEmail, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisitorAppointmentDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsNumber()
  @Min(18)
  @Max(120)
  age: number;

  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  consultationReason: string;

  @ApiProperty()
  @IsDateString()
  preferredDate: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  alternativeDate?: string;

  @ApiProperty()
  @IsString()
  consultationType: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  location?: string;
} 