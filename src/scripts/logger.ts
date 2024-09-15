import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';
import 'winston-cloudwatch';
import AWS from 'aws-sdk';

// Extend Winston transports to include CloudWatch
interface CustomTransports extends transports.ConsoleTransportInstance {
    CloudWatch?: any;
}

const customTransports: CustomTransports = transports as any;

const { combine, timestamp, printf, errors } = format;

// Define your custom format with truncation to handle large log messages
const customFormat = printf(({ level, message, timestamp, stack }) => {
    const logMessage = stack || message;
    const maxLength = 256 * 1024; // 256 KB CloudWatch limit

    // Truncate the message if it exceeds the maxLength
    const truncatedMessage = logMessage.length > maxLength ? logMessage.slice(0, maxLength) : logMessage;

    return `${timestamp} ${level}: ${truncatedMessage}`;
});

// Daily Rotate File Transport
const fileTransport = new transports.DailyRotateFile({
    filename: 'logs/combined-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d', // Retain logs for 30 days
    zippedArchive: true, // Optionally, archive old logs
});

// CloudWatch Transport
let cloudwatchTransport: transports.StreamTransportInstance | undefined;

if (process.env.USE_CLOUD_WATCH === '1') {
    AWS.config.update({ region: 'ap-south-1' });
    cloudwatchTransport = new customTransports.CloudWatch({
        logGroupName: 'vroomster',
        logStreamName: 'nscs-vroomster-backend',
        awsRegion: 'ap-south-1',
        jsonMessage: true,
    });
}

const logger = createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        customFormat // Use the custom format with truncation
    ),
    transports: [
        fileTransport, // Local file logging with daily rotation
        new transports.Console(), // Console logging
        ...(cloudwatchTransport ? [cloudwatchTransport] : []) // Conditionally add CloudWatch transport
    ]
});

logger.info('Hello world from Winston with CloudWatch!');

export default logger;
