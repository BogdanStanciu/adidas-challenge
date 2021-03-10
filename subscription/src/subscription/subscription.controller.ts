import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Subscription } from './entity/subscription.entity';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { SubscriptionService } from './subscription.service';
import { FilterDto } from './dto/filter.dto';
import { DeleteResult } from 'typeorm';
import { AuthGuard } from 'src/common/auth.guard';

@UseGuards(AuthGuard)
@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOkResponse({
    type: Subscription,
    description: 'Created subscription',
  })
  @ApiOperation({ description: 'Create a new subscriptin assigned to a user' })
  @Post()
  async create(
    @Body() subscription: CreateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionService.create(subscription);
  }

  @ApiOkResponse({
    type: Subscription,
    description: 'Selected subscription',
  })
  @ApiOperation({
    description: 'Get a single subscription by id',
  })
  @Get(':id')
  async getOne(@Param('id') id: number): Promise<Subscription> {
    return this.subscriptionService.getOne(id);
  }

  @ApiOkResponse({
    type: Subscription,
    isArray: true,
    description: 'List of subscription',
  })
  @ApiOperation({
    description: 'get a list of subscripiont selected by filters, paginated',
  })
  @Get()
  async getAll(@Query() filters: FilterDto): Promise<Subscription[]> {
    return this.subscriptionService.get(filters);
  }

  @ApiOperation({ description: 'Delete an existing subscription' })
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<DeleteResult> {
    return this.subscriptionService.delete(id);
  }
}
