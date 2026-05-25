import { Controller, Get, Query } from '@nestjs/common';
import { ExternalApiService } from './external-api.service.js';

@Controller('external-api')
export class ExternalApiController {
    constructor(private readonly externalApiService: ExternalApiService) { }

    @Get('launches')
    getLaunches(@Query('limit') limit?: string) {
        return this.externalApiService.getData();
    }

    @Get('launch-sites')
    getLaunchSites(@Query('limit') limit?: string) {
        return this.externalApiService.getLaunchSites();
    }

    @Get('agencies')
    getAgencies(@Query('limit') limit?: string) {
        return this.externalApiService.getAgencies();
    }
}
