import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { join } from 'path';
require('dotenv').config();

const config: TypeOrmModuleOptions = {
  type: process.env.DB_CONNECTION as any,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [join(__dirname, '/**/**.entity{.ts,.js}')],
  synchronize: false,
  cache: {
    // In case of loss of connection to redis, typeorm does not bypass the cache
    // to reach the database directly.
    // https://github.com/typeorm/typeorm/issues/926
    type: 'ioredis',
    options: {
      keyPrefix: `${process.env.SERVICE_NAME}`,
      retryAttempts: Infinity,
      retryDelay: 1000,
      port: parseInt(process.env.REDIS_PORT, 10),
      host: process.env.REDIS_HOST as string,
    },
  },
  logging: false,
  extra: {
    charset: 'utf8mb4',
  },
  migrations: [join(__dirname, '/migrations/*{.js,.ts}')],
  cli: {
    migrationsDir: 'src/migrations',
  },
};

export = config;
module.exports = config;
