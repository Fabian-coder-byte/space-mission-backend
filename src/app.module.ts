import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AuthModule } from './auth/auth.module.js';
import { SupabaseModule } from './supabase/supabase.module.js';
// import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AgencyModule } from './agency/agency.module.js';
import { RocketModule } from './rocket/rocket.module.js';
import { LaunchSiteModule } from './launch-site/launch-site.module.js';
import { MissionModule } from './mission/mission.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';

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
    RocketModule,
    LaunchSiteModule,
    MissionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
