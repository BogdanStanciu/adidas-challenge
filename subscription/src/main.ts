import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';
require('dotenv').config();

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const port = parseInt(process.env.APP_PORT, 10);

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.use(compression());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalPipes(new ValidationPipe());

  // Option config
  const options = new DocumentBuilder()
    .setTitle('Subscription Service')
    .setDescription('Subscription Service API')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);

  await app.listen(port);

  logger.log(`Application listening on port ${port}`);
}
bootstrap();
