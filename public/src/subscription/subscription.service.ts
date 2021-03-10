import {
  BadRequestException,
  HttpException,
  HttpService,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create.dto';
import { FilterDto } from './dto/filter.dto';
import { Subscription } from './entity/subscription.interface';

interface HeadersRequest {
  readonly Authorization: string;
}

@Injectable()
export class SubscriptionService {
  private logger;
  private headers: HeadersRequest;
  private baseUrl: string;
  private token: string;

  constructor(private readonly httpService: HttpService) {
    this.logger = new Logger('Subscription');
    this.baseUrl = process.env.SUBSCRIPTION_URL;
    this.token = process.env.SUBSCRIPTION_TOKEN;

    // Default token for email service
    this.headers = {
      Authorization: `Bearer ${this.token}`,
    };
  }

  /**
   * Fetch a subscription from subscription microservice
   * @param {number} id id of subscription
   * @returns {Promise<Subscription>}
   */
  async getOne(id: number): Promise<Subscription> {
    const response = await this.httpService
      .get(`${this.baseUrl}subscription/${id}`, {
        headers: this.headers,
      })
      .toPromise()
      .catch(err => {
        this.logger.error(`get subscription - ${err.message}`);
        // I don't want to show any problem related to the service to the client
        throw new ServiceUnavailableException('Service not available');
      });

    if (response.status === 204) {
      throw new HttpException('No Subscriptions found', 204);
    }
    return response.data;
  }

  /**
   * Fetch subscriptions base on filters
   * @param {FilterDto} filters filter to apply
   * @returns {Promise<Subscription[]>}
   */
  async get(filters?: FilterDto): Promise<Subscription[]> {
    // forEach filter apply query
    const url = `${this.baseUrl}subscription?${Object.keys(filters)
      .map(key => {
        return `${key}=${filters[key]}`;
      })
      .join('&')}`;

    const response = await this.httpService
      .get(url, {
        headers: this.headers,
      })
      .toPromise()
      .catch(err => {
        this.logger.error(`get subscription - ${err.message}`);
        // I don't want to show any problem related to the service to the client
        throw new ServiceUnavailableException('Service not available');
      });

    if (response.status === 204) {
      throw new HttpException('No Subscriptions found', 204);
    }

    return response.data;
  }

  /**
   * Create new subscription
   * @param {CreateSubscriptionDto} subscription subscription to be created
   * @returns {Promise<Subscription>}
   */
  async create(subscription: CreateSubscriptionDto): Promise<Subscription> {
    const url = `${this.baseUrl}subscription`;
    const response = await this.httpService
      .post(url, subscription, {
        headers: this.headers,
      })
      .toPromise()
      .catch(err => {
        this.logger.error(`Error getting subscription - ${err.message}`);
        if (err.response.status === 400) {
          throw new BadRequestException(err.response?.data?.message);
        }

        throw new ServiceUnavailableException('Service notcode  available');
      });
    return response.data;
  }

  /**
   * delete an existing subscription
   * @param {number} id id of subscription to delete
   * @returns {Promise<void>}
   */
  async delete(id: number): Promise<void> {
    const url = `${this.baseUrl}subscription/${id}`;
    this.httpService
      .delete(url)
      .toPromise()
      .catch(err => {
        this.logger.error(`get subscription - ${err.message}`);
        // I don't want to show any problem related to the service to the client
        throw new ServiceUnavailableException('Service not available');
      });
  }
}
