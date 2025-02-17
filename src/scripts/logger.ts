import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import WinstonCloudWatch from 'winston-cloudwatch';
import AWS from 'aws-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const { combine, timestamp, printf, errors } = format;

// Define custom format with truncation
const customFormat = printf(({ level, message, timestamp, stack }) => {
    const logMessage = stack || message;
    const maxLength = 256 * 1024; // CloudWatch limit: 256 KB
    const truncatedMessage = logMessage.length > maxLength ? logMessage.slice(0, maxLength) : logMessage;

    return `${timestamp} ${level}: ${truncatedMessage}`;
});

// Configure AWS credentials
AWS.config.update({ 
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
    region: process.env.AWS_REGION 
});

// Daily Rotate File Transport
const fileTransport = new transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    zippedArchive: true,
});

// CloudWatch Transport
let cloudwatchTransport;
if (process.env.USE_CLOUD_WATCH === '1') {
    cloudwatchTransport = new WinstonCloudWatch({
        logGroupName: process.env.AWS_LOG_GROUP_NAME || 'vroomster',
        logStreamName: process.env.AWS_LOG_STREAM_NAME || 'nscs-vroomster-backend',
        awsRegion: process.env.AWS_REGION,
        jsonMessage: true,
    });
}

// Create logger
const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat
    ),
    transports: [
        fileTransport,
        new transports.Console(),
        ...(cloudwatchTransport ? [cloudwatchTransport] : [])
    ]
});

// Test log
logger.info('Hello world from Winston with CloudWatch!');

export default logger;
