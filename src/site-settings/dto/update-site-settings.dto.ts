import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateSiteSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  siteName?: string;

  @IsOptional()
  @IsString()
  siteDescription?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsEmail()
  supportEmail?: string;

  @IsOptional()
  @IsUrl()
  facebookUrl?: string;

  @IsOptional()
  @IsUrl()
  instagramUrl?: string;

  @IsOptional()
  @IsUrl()
  xUrl?: string;

  @IsOptional()
  @IsUrl()
  youtubeUrl?: string;

  @IsOptional()
  @IsString()
  footerText?: string;

  @IsOptional()
  @IsBoolean()
  showUpcomingMissionsOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  showAgenciesOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  showRocketsOnHome?: boolean;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRegistrations?: boolean;
}
