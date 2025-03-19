const  ENV = process.env;
import winston from 'winston';

let isDevelopment = false;
if (ENV.NODE_ENV === 'development')
    isDevelopment = true;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      silent: !isDevelopment,
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      silent: isDevelopment,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      silent: isDevelopment,
    }),
  ],
});

export default logger;
