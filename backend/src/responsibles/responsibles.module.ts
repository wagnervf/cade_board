import { Module } from '@nestjs/common';

import { ResponsiblesController } from './responsibles.controller';
import { ResponsiblesService } from './responsibles.service';

@Module({
  controllers: [ResponsiblesController],
  providers: [ResponsiblesService],
})
export class ResponsiblesModule {}
