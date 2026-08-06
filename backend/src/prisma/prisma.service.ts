import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { ValidatedEnv } from '../config/env.validation';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(configService: ConfigService<ValidatedEnv, true>) {
    super({
      adapter: new PrismaPg(
        new Pool({
          connectionString: configService.get('DATABASE_URL', { infer: true }),
        }),
      ),
    });
  }
}
