import * as winston from 'winston';
import config from '../config';

const loggerFormat = winston.format.printf(({
  level, message, timestamp, ...metadata
}) => {
  if (config.APP_ENV === 'local') {
    let msg = `${timestamp} [${level}] : ${message} `;
    if (metadata) {
      try {
        msg += JSON.stringify(metadata);
      } catch (e) {
        return msg;
      }
    }
    return msg;
  }

  const logObject = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...metadata
  };
  return JSON.stringify(logObject);
});
const format = winston.format.combine(
  winston.format.splat(),
  loggerFormat
);

const transport = config.APP_ENV === 'local' ? [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.colorize({ all: true }),
      format
    )
  })] : [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      format
    )
  })];

export function createLoggerConfig(): winston.LoggerOptions {
  return {
    format,
    transports: [...transport]
  };
}
