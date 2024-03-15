import { NextFunction, Request, Response } from 'express';
import { APIErrorData, HttpStatusCode } from '../types/apiTypes';
import { APIError, buildErrorResponse } from '../utils/apiUtils';

const handleErrors = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    console.error(err.stack); // Log the error for debugging purposes
    let message = "Internal Server Error";
    let errorCode = HttpStatusCode.InternalServerError;
    let errors: APIErrorData[] = [];
    if (err instanceof APIError) {
        message = err.message;
        if (err.errorCode !== undefined) {
            errorCode = err.errorCode;
        }
        if (err.errors !== undefined) {
            errors = err.errors;
        }
    }
    res.status(errorCode).json(buildErrorResponse(errorCode, message, errors));
};

export { handleErrors };