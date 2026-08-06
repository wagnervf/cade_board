import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { ValidatedEnv } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<ValidatedEnv, true>);

  configureApp(app);
  app.enableCors({
    origin: configService.get('API_CORS_ORIGIN', { infer: true }),
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CADEBOARD API')
    .setDescription('API interna do CADEBOARD.')
    .setVersion('0.1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get('API_PORT', { infer: true }), '0.0.0.0');
}

void bootstrap();
