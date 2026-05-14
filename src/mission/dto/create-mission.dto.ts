import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { MissionStatus, MissionType } from '../../generated/prisma/enums.js';

export class CreateMissionDto {
  @IsString()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  missionType?: MissionType;

  @IsOptional()
  @IsString()
  status?: MissionStatus;

  @IsOptional()
  @IsDateString()
  launchDate?: string;

  @IsOptional()
  @IsDateString()
  windowStart?: string;

  @IsOptional()
  @IsDateString()
  windowEnd?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  destination?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  orbit?: string;

  @IsOptional()
  @IsBoolean()
  isCrewed?: boolean;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsOptional()
  @IsUrl()
  detailsUrl?: string;

  @IsString()
  agencyId: string;

  @IsString()
  rocketId: string;

  @IsString()
  launchSiteId: string;
}
