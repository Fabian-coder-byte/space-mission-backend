import { Controller, Get } from '@nestjs/common';
import { SpaceDataService } from './space-data.service.js';

@Controller('space-data')
export class SpaceDataController {
    constructor(private readonly externalApiService: SpaceDataService) { }

    @Get('start')
    getLaunches() {
        return this.externalApiService.importAgencies();
    }
}
