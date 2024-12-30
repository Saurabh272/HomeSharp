import * as fs from 'fs';
import { Logger } from '@nestjs/common';

const logger = new Logger('EnvCheck');

const readLines = (filePath: string) => fs.readFileSync(filePath, 'utf-8').split('\n');

const envContentLines = readLines('.env').filter((line) => !line.startsWith('#'));
const envExampleLines = readLines('.env.example').filter((line) => !line.startsWith('#'));

const envExampleVariables = new Set<string>(
  envContentLines.map((line) => line.trim().split('=')[0]).filter(Boolean)
);

const missingVariables = envExampleLines
  .map((line) => line.trim().split('=')[0])
  .filter(Boolean)
  .filter((variable) => !envExampleVariables.has(variable));

if (missingVariables.length > 0) {
  logger.error('The following variables are missing from .env:');
  logger.log(missingVariables.join('\n'));
  process.exit(1);
} else {
  logger.log('All variables from env.example are present in .env');
}
