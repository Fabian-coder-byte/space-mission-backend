import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RocketStatus } from '../../generated/prisma/enums.js';

export class CreateRocketDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  manufacturer?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  reusable?: boolean;

  @IsOptional()
  @IsString()
  status?: RocketStatus;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  heightMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  diameterMeters?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  massKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  payloadToLeoKg?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  payloadToGtoKg?: number;

  @IsOptional()
  @IsDateString()
  firstFlightDate?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  agencyId?: string;
}
