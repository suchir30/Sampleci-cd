import { Request, Response, NextFunction } from 'express';
import logger from '../scripts/logger';

interface EnhancedResponse extends Response {
  capturedBody?: any;
}
export const logResponses = (req: Request, res: EnhancedResponse, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (this: EnhancedResponse, body?: any) {
    res.capturedBody = body; // Capture the response body
    const requestBody = JSON.stringify(req.body, null, 2); // Pretty print JSON
    const responseBody = JSON.stringify(body, null, 2); // Pretty print JSON
    const logMessage = `Response: ${req.method} ${req.url} - Request Body: ${requestBody} - ${new Date().toISOString()} - Response Body: ${responseBody}`;
    
    logger.info(logMessage);
    
    return originalJson.call(this, body); // Ensure to return the originalJson call result
  };
  next();
};

// export const logErrors = (err: Error, req: Request, res: EnhancedResponse, next: NextFunction) => {
//   const requestBody = JSON.stringify(req.body, null, 2); // Pretty print JSON
//   const responseBody = JSON.stringify(res.capturedBody, null, 2); // Pretty print JSON
//   const logMessage = `Error: ${req.method} ${req.url} - Request Body: ${requestBody} - ${new Date().toISOString()} - Response Body: ${responseBody}\n${err.stack}`;
  
//   logger.error(logMessage);
  
//   next(err);
// };