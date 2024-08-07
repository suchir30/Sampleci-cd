import express from 'express';
import path from 'path';
import authRoutes from './routes/authRoutes';
import apiRoutes from './routes/apiRoutes';
import { tokenAuth } from './middleware/auth';
import {logResponses} from './middleware/loggerMiddleware'; // Import middleware
import { handleErrors } from './middleware/errorHandler';
import logger from './scripts/logger'; // Ensure logger import

const app = express();
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Serve static files
// app.use(express.json());// JSON body parser
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ limit: '10mb', extended: true })); // URL-encoded body parser
// app.use(logRequests); // Log requests
app.use(logResponses); // Log responses
// app.use(logErrors); // Log errors
app.use('/auth', authRoutes);
app.use('/api',tokenAuth,apiRoutes);
app.use(handleErrors);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port number ${PORT}`);
});