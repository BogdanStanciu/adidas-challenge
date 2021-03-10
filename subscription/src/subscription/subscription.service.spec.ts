import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subscription } from './entity/subscription.entity';
import { SubscriptionService } from './subscription.service';
import { mockSubscriptions } from './subscription.mock';
import crypto = require('crypto');
import { DeleteResult, Repository, SelectQueryBuilder } from 'typeorm';
import { mock } from 'jest-mock-extended';
import { FilterDto } from './dto/filter.dto';
import { HttpException } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/subscription.dto';
import moment = require('moment');
require('dotenv').config();

type MockType<T> = {
  [P in keyof T]: jest.Mock<{}>;
};

const qbmock = mock<SelectQueryBuilder<Subscription>>();
qbmock.cache.mockReturnThis();
qbmock.where.mockReturnThis();

const mockSubscriptionRepository = mock<Repository<Subscription>>();
mockSubscriptionRepository.save.mockReturnThis();
mockSubscriptionRepository.createQueryBuilder.mockReturnValue(qbmock);

// export const mockSubscriptionRepository = {
//   save: jest.fn(),
//   getOne: jest.fn(),
//   getMany: jest.fn(),
//   createQueryBuilder: jest.fn().mockReturnValue(qbmock),
// };

const mockEmailQueue = {
  add: jest.fn(),
};

describe('SubscriptionService', () => {
  let service: SubscriptionService;
  let subscriptionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        SubscriptionService,
        {
          provide: getRepositoryToken(Subscription),
          useValue: mockSubscriptionRepository,
        },
        {
          provide: 'BullQueue_email_queue',
          useValue: mockEmailQueue,
        },
      ],
    }).compile();

    service = module.get<SubscriptionService>(SubscriptionService);
    subscriptionRepository = module.get(getRepositoryToken(Subscription));
  });

  const sub = new Subscription();
  const subscriptions: Subscription[] = [];
  // transform plain json to subscrption object
  mockSubscriptions.forEach(el => {
    subscriptions.push(Object.assign(el, sub));
  });

  describe('get subscriptions', () => {
    it('get all', async () => {
      qbmock.getMany.mockResolvedValue(subscriptions);
      expect(service.get({} as any)).resolves.toBe(subscriptions);
    });

    it('get filtered', async () => {
      const filters: FilterDto = new FilterDto();
      filters.gender = 1;
      filters.newsletterCampaign = 1;

      const hash = crypto
        .createHash('md5')
        .update(
          Object.keys(filters)
            .map(key => {
              return `${filters[key]}`;
            })
            .join(),
        )
        .digest('hex');

      const queryResult = subscriptions.filter(el => {
        return (
          el.gender === filters.gender &&
          el.newsletterCampaign === filters.newsletterCampaign
        );
      });

      qbmock.getMany.mockResolvedValue(queryResult);
      const tmp = await service.get(filters);
      expect(tmp).toBe(queryResult);
      expect(qbmock.cache).toHaveBeenCalledWith(
        hash,
        parseInt(process.env.CACHE_TIME, 10),
      );
    });

    it('throw http exception if do not exits subscriptions', async () => {
      qbmock.getMany.mockResolvedValue([]);
      expect(service.get({} as any)).rejects.toThrow(HttpException);
    });
  });

  describe('get subscription', () => {
    it('get subscription by id', async () => {
      const id = 1692;
      const subscription = subscriptions.find(el => el.id === id);
      qbmock.getOne.mockResolvedValue(subscription);
      const result = await service.getOne(id);

      expect(result).toBe(subscription);
      expect(qbmock.cache).toHaveBeenCalledWith(
        id,
        parseInt(process.env.CACHE_TIME, 10),
      );
    });

    it('throw http exception if do not exits subscription', async () => {
      const id = 1;
      qbmock.getOne.mockResolvedValue(undefined);
      expect(service.getOne(id)).rejects.toThrow(HttpException);
    });
  });

  describe('save subscription', () => {
    const subscriptionDto: CreateSubscriptionDto = new CreateSubscriptionDto();
    subscriptionDto.email = 'michele.facco@gmail.com';
    subscriptionDto.firstName = 'Michele';
    subscriptionDto.gender = 1;
    subscriptionDto.birth = moment('1996-06-20').toDate();
    subscriptionDto.consent = true;
    subscriptionDto.newsletterCampaign = 1;

    const newSubscriptionEntity = new Subscription();
    newSubscriptionEntity.id = 1697;
    Object.assign(newSubscriptionEntity, subscriptionDto);

    // it('save new subscription', async () => {
    //   mockSubscriptionRepository.save.mockImplementation();
    //   mockSubscriptionRepository.save.mockResolvedValue(newSubscriptionEntity);
    //   expect(service.create(subscriptionDto)).resolves.toBe(
    //     newSubscriptionEntity,
    //   );
    // });
  });

  describe('Delete subscription', () => {
    it('delete subscription', async () => {
      const id = 1696;
      const result: DeleteResult = {
        raw: [],
        affected: 1,
      };
      mockSubscriptionRepository.delete.mockResolvedValue(result);
      expect(service.delete(id)).resolves.toBe(result);
    });

    it('delete inexistent subscription', async () => {
      const id = 2;
      const result: DeleteResult = {
        raw: [],
        affected: 0,
      };
      mockSubscriptionRepository.delete.mockResolvedValue(result);
      expect(service.delete(id)).rejects.toThrowError(HttpException);
    });
  });
});
