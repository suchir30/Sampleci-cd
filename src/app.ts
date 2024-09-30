import express from 'express';
import path from 'path';
import { expressMiddleware } from '@apollo/server/express4';

import authRoutes from './routes/authRoutes';
import apiRoutes from './routes/apiRoutes';
import { tokenAuth } from './middleware/auth';
import { logResponses } from './middleware/loggerMiddleware'; // Import middleware
import { handleErrors } from './middleware/errorHandler';
import logger from './scripts/logger'; // Ensure logger import
import { buildGraphQLServer } from './graphql/server';
import { GraphQLContext, buildGraphQLContext } from './graphql/context';

const app = express();

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); // Serve static files
app.use(express.json({ limit: '10mb' })); // JSON body parser
app.use(express.urlencoded({ limit: '10mb', extended: true })); // URL-encoded body parser
// app.use(logRequests); // Log requests
app.use(logResponses); // Log responses
// app.use(logErrors); // Log errors

// REST endpoints
app.use('/auth', authRoutes, handleErrors);
app.use('/api', tokenAuth, apiRoutes, handleErrors);

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

