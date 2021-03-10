import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
require('dotenv').config();

async function bootstrap() {
  const logger = new Logger('EmailService');
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        // attemps to reconnect always
        retryAttempts: Infinity,
        retryDelay: 1000,
        url: `redis://${process.env.REDIS_HOST}:${parseInt(
          process.env.REDIS_PORT,
          10,
        )}`,
      },
    },
  );
  await app.listen(() => logger.log('Microservice up'));
}
bootstrap();
