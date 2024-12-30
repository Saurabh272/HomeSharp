import * as env from 'dotenv';
import * as path from 'path';
import { configSchema } from './schema.config';

env.config({
  path: path.resolve(process.cwd(), '.env')
});

const { value: config, error } = configSchema
  .prefs({ errors: { label: 'key' } })
  .validate(process.env);

if (error) {
  throw new Error(`ENV config validation has failed with error: ${error?.message}`);
}

const getUrl = (url: string) => `${config.SEARCH_SERVICE_URL}/${url}`;

export default {
  ...config,
  DB_SSL: config.DB_SSL === 'true' || config.DB_SSL === true,
  isProd: config.APP_ENV === 'production',
  axiosConfig: {
    headers: {
      Authorization: `Bearer ${config.SERVICE_SHARED_SECRET_API_KEY}`
    }
  },
  serviceUrl: {
    indexing: getUrl('upsert'),
    developerIndexing: getUrl('index-developer'),
    deleteIndex: getUrl('delete-index'),
    recreateCollections: getUrl('recreate-collections'),
    getProjects: getUrl('get-projects'),
    search: getUrl('search'),
    microMarketIndexing: getUrl('index-micro-market')
  }
};
