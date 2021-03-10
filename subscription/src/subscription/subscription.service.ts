import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToClass } from 'class-transformer';

import { PaginationDto } from 'src/common/pagination.dto';
import {
  DeleteResult,
  getConnection,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { EmailConfirmDto } from './dto/email-confirm.dto';
import { FilterDto } from './dto/filter.dto';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import { Subscription } from './entity/subscription.entity';
import crypto = require('crypto');
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

const SUBSCRIPTION_KEY = 'subscription';

@Injectable()
export class SubscriptionService {
  private logger;
  private token: string;
  private cacheTime: number;

  constructor(
    @InjectQueue('email_queue') private emailQueue: Queue,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {
    this.token = process.env.EMAIL_SERVICE_TOKEN;
    this.logger = new Logger('SubscriptionService');
    this.cacheTime = parseInt(process.env.CACHE_TIME, 10);
  }

  /**
   * Clear the cache for typeorm
   * @returns {void}
   */
  private clearCache(): void {
    getConnection().queryResultCache.clear();
  }

  /**
   * Apply filters to a SelectQueryBuilder
   * @param {SelectQueryBuilder<Subscription>} query query builder where to add filters
   * @param {FilterDto} filters fitlers to apply
   * @returns {void}
   */
  private addFilters(
    query: SelectQueryBuilder<Subscription>,
    filters: FilterDto,
  ): void {
    if (filters?.birth) {
      query.andWhere(`${SUBSCRIPTION_KEY}.birth = :birth`, {
        birth: filters.birth,
      });
    }
    if (filters?.gender) {
      query.andWhere(`${SUBSCRIPTION_KEY}.gender = :gen`, {
        gen: filters.gender,
      });
    }
    if (filters?.newsletterCampaign) {
      query.andWhere(`${SUBSCRIPTION_KEY}.newsletterCampaign = :news`, {
        news: filters.newsletterCampaign,
      });
    }
  }

  /**
   * Apply paginator to a SelectQueryBuilder
   * @param {SelectQueryBuilder<Subscription>} query SelectQueryBuilder to apply paginator
   * @param {PaginationDto} paginator page to apply
   */
  private addPaginator(
    query: SelectQueryBuilder<Subscription>,
    paginator: PaginationDto,
  ): void {
    if (paginator?.skip && paginator?.take) {
      query.skip(paginator.skip);
      query.take(paginator.take);
    }
  }

  /**
   * Create new Subscription
   * @param {CreateSubscriptionDto} subscriptionDto
   * @returns {Promise<Subscription>}
   */
  async create(subscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const sub = plainToClass(Subscription, subscriptionDto);

    if (!sub) {
      this.logger.error('Plain To class fail');
      throw new InternalServerErrorException('Can not convert entity');
    }

    // save and return subscription
    const subscription = await this.subscriptionRepository
      .save(sub)
      .catch(err => {
        if (err.code === '23505') {
          this.logger.warn(err.toString());
          throw new BadRequestException(
            `Duplicate entry for email, newsletterCampaign`,
          );
        }

        this.logger.error(err);
        // handle db error
        throw new InternalServerErrorException(
          'Internal Server Error - Insert new subscription',
        );
      });

    // Clear the cache after a new subscription has been inserted
    this.clearCache();

    // Prepare the dto to send the confirmation email
    const confirmationEmail = new EmailConfirmDto();
    confirmationEmail.to = sub.email;
    confirmationEmail.token = this.token;
    confirmationEmail.subject = 'Confirm subscription';
    confirmationEmail.html = '<h1>Welcome aboard !</h1>';
    confirmationEmail.text = `Welcome aboard !`;

    try {
      await this.emailQueue.add('email', confirmationEmail);
    } catch (err) {
      // log the error, non-blocking error for subscription service
      this.logger.error(`Faile add to queue - ${err.toString()}`);
    }

    return subscription;
  }

  /**
   * Return a list of subscriptions
   * can apply filters and pagination
   * @param {FilterDto} filter filters to apply
   * @returns {Promise<Subscription[]>}
   */
  async get(filters?: FilterDto): Promise<Subscription[]> {
    const plainFilters = Object.keys(filters)
      .map(key => {
        return `${filters[key]}`;
      })
      .join();

    // Create hash to use as a key in typeorm cache
    const hash = crypto
      .createHash('md5')
      .update(plainFilters)
      .digest('hex');

    // Create new query builder
    const query = await this.subscriptionRepository.createQueryBuilder(
      SUBSCRIPTION_KEY,
    );

    // apply filters if any
    this.addFilters(query, filters);
    // add pagination if any
    this.addPaginator(query, filters);

    // make query to db, if exists cache take from there
    // cache stays alive for 'cacheTime' milliseconds,
    // afther will be considered invalid
    const subscriptions = await query
      .cache(hash, this.cacheTime)
      .getMany()
      .catch(err => {
        this.logger.error(err.toString());
        // Handle error code
        throw new InternalServerErrorException('Internal Server Error');
      });

    if (!subscriptions || subscriptions.length === 0) {
      throw new HttpException('No Subscriptions found', 204);
    }
    return subscriptions;
  }

  /**
   * Delete a subscription from db
   * @param {number} id id of subscription to delete
   * @returns {Promise<DeleteResult>}
   */
  async delete(id: number): Promise<DeleteResult> {
    const result = await this.subscriptionRepository.delete(id).catch(err => {
      throw new InternalServerErrorException(err.toString());
    });

    if (result.affected == 0) {
      throw new HttpException('No Subscriptions found', 204);
    }
    return result;
  }

  /**
   * Get one subscription by id
   * @param {number} id id of subscription
   * @returns {Promise<Subscription>}
   */
  async getOne(id: number): Promise<Subscription> {
    const result = await this.subscriptionRepository
      .createQueryBuilder('subscription')
      .where('subscription.id = :id', { id: id })
      .cache(id, this.cacheTime)
      .getOne()
      .catch(err => {
        this.logger.error(err.toString());
        throw new InternalServerErrorException('Internal Server Error');
      });

    if (!result) {
      throw new HttpException('No Subscriptio Found', 204);
    }
    return result;
  }
}
