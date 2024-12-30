import { Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
import Joi from 'joi';
import { configSchema } from '../src/app/config/schema.config';

const logger = new Logger();
function extractSchemaDetails(schema: Joi.ObjectSchema): {
  [key: string]: {
    default?: any;
    allow?: any[];
    required?: boolean;
  };
} {
  const { keys } = schema.describe();
  const details: { [key: string]: any } = {};

  Object.entries(keys).forEach(([key, keyDetails]: [string, any]) => {
    details[key] = {};

    if (keyDetails?.flags?.default !== undefined) {
      details[key].default = keyDetails.flags.default;
    }

    if (keyDetails?.allow?.length > 0) {
      details[key].allow = keyDetails.allow.map((item: any) => item?.value ?? item);
    }

    details[key].required = keyDetails?.flags?.presence === 'required';
  });

  return details;
}

const validateEnvVariables = (envFilePath: string): void => {
  dotenv.config({ path: envFilePath });

  const schemaDetails = extractSchemaDetails(configSchema);
  let validationFailed = false;

  Object.keys(schemaDetails).forEach((key) => {
    const details = schemaDetails[key];
    const envValue = process.env[key];

    if (details.required && envValue === undefined) {
      validationFailed = true;
      logger.error(`Error: Missing required environment variable ${key}`);
    }

    if (envValue === undefined && details.default !== undefined) {
      logger.warn(`Warning: ${key} is missing. Falling back to default value: ${details.default}`);
    }

    if (details.allow && !details.allow.includes(envValue)) {
      validationFailed = true;
      logger.error(`Error: Invalid value for ${key}. Allowed values are: ${details.allow.join(', ')}`);
    }
  });

  if (validationFailed) {
    process.exit(1);
  }

  logger.log('All environment variables validated successfully.');
};

const [, , envFilePath] = process.argv;

if (!envFilePath) {
  logger.error('Please provide the path to the .env file as arguments.');
  process.exit(1);
}

validateEnvVariables(envFilePath);
