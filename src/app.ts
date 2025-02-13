import express from 'express';
import cors from 'cors';
import path from 'path';
import { expressMiddleware } from '@apollo/server/express4';

import authRoutes from './routes/authRoutes';
import apiRoutes from './routes/apiRoutes';
import externalRoutes from './routes/externalRoutes'
import { tokenAuth } from './middleware/auth';
import { logResponses } from './middleware/loggerMiddleware'; // Import middleware
import { handleErrors } from './middleware/errorHandler';
import logger from './scripts/logger'; // Ensure logger import
import { buildGraphQLServer } from './graphql/server';
import { GraphQLContext, buildGraphQLContext } from './graphql/context';
import { startAllTasks } from './services/taskScheduler'; // Import the scheduler function

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173','http://13.200.144.182:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], 
  credentials: true, // Allow credentials (cookies, authorization headers)
};

app.use(cors(corsOptions)); 

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Serve static files
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ limit: '10mb', extended: true })); // URL-encoded body parser
// app.use(logRequests); // Log requests
app.use(logResponses); // Log responses
// app.use(logErrors); // Log errors

// REST endpoints
app.use('/auth', authRoutes, handleErrors);
app.use('/api', tokenAuth, apiRoutes, handleErrors);
app.use('/external',tokenAuth, externalRoutes, handleErrors);

// Start task schedulers
startAllTasks();

// GraphQL
buildGraphQLServer()
  .then(server => {
    app.use('/graphql', tokenAuth, expressMiddleware<GraphQLContext>(server, {
      context: buildGraphQLContext
    }))
  })
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Server is running on port number ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("Failed to start Applicaiton", err);
  });

