import { PartialType } from '@nestjs/mapped-types';
import { CreateAgencyDto } from './CreateAgencyDto.js';

export class UpdateAgencyDto extends PartialType(CreateAgencyDto) {}
