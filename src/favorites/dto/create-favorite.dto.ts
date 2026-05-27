import { IsDateString, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateFavoriteDto {
  @IsString()
  launchId: string;

  @IsString()
  launchName: string;

  @IsOptional()
  @IsString()
  agencyName?: string;

  @IsOptional()
  @IsDateString()
  net?: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}
