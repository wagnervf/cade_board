import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { ItemsModule } from './items/items.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResponsiblesModule } from './responsibles/responsibles.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    ItemsModule,
    PrismaModule,
    ResponsiblesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
