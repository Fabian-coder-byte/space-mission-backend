import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
// import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AgencyModule } from './agency/agency.module.js';

@Module({
  imports: [
    AuthModule,
    SupabaseModule,
    AgencyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AgencyModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
