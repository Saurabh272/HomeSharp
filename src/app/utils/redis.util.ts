import { Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import config from '../config';
import { ConnectionOptions } from '../interfaces/redis.interface';

@Injectable()
export class RedisConnection implements ConnectionOptions {
  port: number;

  username: string;

  password: string;

  host: string;

  tls: {
    rejectUnauthorized?: boolean;
  };

  private readonly logger = new Logger();

  private connection: Redis;

  constructor() {
    this.port = config.REDIS_PORT;
    this.username = config.REDIS_USERNAME;
    this.password = config.REDIS_PASSWORD;
    this.host = config.REDIS_HOST;
  }

  private setupEventListeners() {
    const eventHandlers = {
      error: (error: any) => this.logger.error('Redis Connection Error:', error),
      close: (close: any) => this.logger.log('Redis Connection Closed', close),
      connect: () => this.logger.log('Connected to Redis'),
      reconnecting: () => this.logger.log('Reconnecting to Redis')
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.connection.on(event, handler);
    });
  }

  getConnection(): Redis {
    if (config.APP_ENV === 'local') {
      this.connection = new Redis({
        port: this.port,
        host: this.host,
        maxRetriesPerRequest: null
      });
    } else {
      this.connection = new Redis({
        port: this.port,
        username: this.username,
        password: this.password,
        host: this.host,
        tls: { rejectUnauthorized: true },
        maxRetriesPerRequest: null
      });
    }

    this.setupEventListeners();

    return this.connection;
  }
}
