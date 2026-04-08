import { PartialType } from '@nestjs/mapped-types';
import { CreateLaunchSiteDto } from './create-launch-site.dto.js';

export class UpdateLaunchSiteDto extends PartialType(CreateLaunchSiteDto) {}
