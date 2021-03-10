import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SERVICE_NAME } from './common/constant';
import * as nodemailer from 'nodemailer';
import { BullModule } from '@nestjs/bull';
require('dotenv').config();

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email_queue',
      prefix: SERVICE_NAME,
      redis: {
        host: process.env.REDIS_HOST as string,
        port: parseInt(process.env.REDIS_PORT, 10) as number,
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'FAKE_EMAIL_CONNECTION',
      useFactory: async () => {
        // Generate a test account for fake emails
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
      },
    },
  ],
})
export class AppModule {}
