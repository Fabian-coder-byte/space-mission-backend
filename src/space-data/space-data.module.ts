import { Module } from '@nestjs/common';
import { SpaceDataController } from './space-data.controller.js';
import { SpaceDataService } from './space-data.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExternalApiModule } from '../external-api/external-api.module.js';


@Module({
    imports: [PrismaModule, ExternalApiModule],
    controllers: [SpaceDataController],
    providers: [SpaceDataService],
})
export class SpaceDataModule { }
