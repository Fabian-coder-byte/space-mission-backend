import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { ExternalApiController } from './external-api.controller.js';
import { ExternalApiService } from './external-api.service.js';
import { HttpModule } from '@nestjs/axios/dist/index.js';

@Module({
  imports: [PrismaModule, HttpModule.register({
    timeout: 10000,
    maxRedirects: 5,
  }),
  ],
  controllers: [ExternalApiController],
  providers: [ExternalApiService],
  exports: [ExternalApiService],
})
export class ExternalApiModule { }
