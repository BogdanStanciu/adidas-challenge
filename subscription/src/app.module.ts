// eslint-disable-next-line @typescript-eslint/no-var-requires
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SubscriptionController } from './subscription/subscription.controller';
import { SubscriptionModule } from './subscription/subscription.module';
const config = require('./ormconfig');

@Module({
  // Other modules can be added in the future
  imports: [TypeOrmModule.forRoot(config), SubscriptionModule],
  controllers: [AppController, SubscriptionController],
  providers: [AppService],
})
export class AppModule {}
