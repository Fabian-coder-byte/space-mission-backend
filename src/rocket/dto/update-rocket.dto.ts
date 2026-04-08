import { PartialType } from '@nestjs/mapped-types';
import { CreateRocketDto } from './create-rocket.dto.js';

export class UpdateRocketDto extends PartialType(CreateRocketDto) {}
