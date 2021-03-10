import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SubscriptionModule } from './subscription/subscription.module';
import * as compression from 'compression';
import { json, urlencoded } from 'express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
require('dotenv').config();

async function bootstrap() {
  const logger = new Logger('bootstrap');
  const port = parseInt(process.env.APP_PORT, 10);

  const app = await NestFactory.create<NestExpressApplication>(
    SubscriptionModule,
  );

  app.enableCors();

  // Enable gzip compression.
  app.use(compression());
  // max limit to json request
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.useGlobalPipes(new ValidationPipe());

  // Swagger api doc options
  const options = new DocumentBuilder()
    .setTitle('Public Service')
    .setDescription('Public Service API')
    .setVersion('0.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);

  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
