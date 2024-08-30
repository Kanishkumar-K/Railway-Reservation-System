'use strict';

const winston = require('winston');
const { combine, timestamp, printf, errors } = winston.format;

const customFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
    level: 'info',
    format: combine(errors({ stack: true }), timestamp(), customFormat),
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: 'errors.log', level: 'error' }),
    ],
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception: ', error);
    process.exit(1);
});

module.exports = logger;
