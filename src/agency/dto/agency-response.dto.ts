import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { AgencyType } from 'src/generated/prisma/enums.js';

export class CreateAgencyDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsEnum(AgencyType)
  type?: AgencyType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(1800)
  @Max(new Date().getFullYear())
  foundedYear?: number;
}
