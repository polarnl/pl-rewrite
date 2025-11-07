import winston from 'winston';
import LokiTransport from 'winston-loki';

export const winstonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level}]: ${message}`;
  })
)

export const logger = winston.createLogger({
  format: winstonFormat,
  transports: [
    new winston.transports.Console({

    }),
    ...(process.env.LOKI_HOST ? [
      new LokiTransport({
        host: process.env.LOKI_HOST,
        labels: { app: 'polarlearn' },
        
        onConnectionError: (err) => console.error('Loki connection error', err)
      })
    ] : [])
  ]
})