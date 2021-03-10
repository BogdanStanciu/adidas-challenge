import { Controller } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private token: string;
  private logger;

  constructor(private readonly appService: AppService) {}
}
