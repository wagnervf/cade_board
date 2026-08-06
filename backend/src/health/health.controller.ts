import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

type HealthResponse = {
  service: string;
  status: 'ok';
  timestamp: string;
};

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({
    description: 'Estado de saude da API.',
    schema: {
      example: {
        service: 'cadeboard-api',
        status: 'ok',
        timestamp: '2026-08-06T17:00:00.000Z',
      },
    },
  })
  getHealth(): HealthResponse {
    return {
      service: 'cadeboard-api',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
