import { Process, Processor } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as nodemailer from 'nodemailer';
import { EmailRequestDto } from './dto/email-request.dto';

@Processor('email_queue')
@Injectable()
export class AppService {
  private fakeAccount;
  private logger;

  constructor(@Inject('FAKE_EMAIL_CONNECTION') fakeAccount) {
    this.fakeAccount = fakeAccount;
    this.logger = new Logger('EmailService');
  }

  /**
   * Take a job from the mail queue and process it
   * @param {Job<EmailRequestDto>} job job taken from queue
   * @returns {Promise<void>}
   */
  @Process({
    name: 'email',
    concurrency: 2,
  })
  async sendEmail(job: Job<EmailRequestDto>): Promise<void> {
    const info = await this.fakeAccount.sendMail(job.data).catch(err => {
      this.logger.error(err.toString());
    });
    this.logger.log(`Email Preview: ${nodemailer.getTestMessageUrl(info)}`);
  }
}
