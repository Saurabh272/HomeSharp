import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  createDirectus,
  DirectusClient,
  rest,
  RestClient,
  staticToken,
  StaticTokenClient
} from '@directus/sdk';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import config from '../config';

@Injectable()
export class Db implements OnModuleInit {
  private readonly logger = new Logger(Db.name);

  private directusClient: DirectusClient<any> & StaticTokenClient<any> & RestClient<any>;

  public getDirectusClient(): DirectusClient<any> & StaticTokenClient<any> & RestClient<any> {
    if (!this.directusClient) {
      this.directusClient = createDirectus(config.DIRECTUS_URL)
        .with(staticToken(config.DIRECTUS_TOKEN))
        .with(rest());
    }
    return this.directusClient;
  }

  public connection: NodePgDatabase;

  async onModuleInit() {
    await this.connectToDatabase();
  }

  public async connectToDatabase() {
    const client = new Pool({
      host: config.DB_HOST,
      port: config.DB_PORT,
      user: config.DB_USERNAME,
      password: config.DB_PASSWORD,
      database: config.DB_DATABASE,
      ssl: config.DB_SSL,
      max: config.DB_POOL_MAX,
      min: config.DB_POOL_MIN
    });

    try {
      await client.connect();
      this.logger.log('DB connection established');
      this.connection = drizzle(client);
    } catch (err) {
      this.logger.error('DB connection terminated with error:', err);
      client.end(() => this.logger.log('DB connection ended'));
    }
  }
}
