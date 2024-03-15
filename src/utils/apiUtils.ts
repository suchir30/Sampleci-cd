import { APIErrorData, APIResponse, ErrorType, HttpStatusCode } from "../types/apiTypes";

export class APIError extends Error {
    errorCode?: HttpStatusCode;
    errors?: APIErrorData[];

    constructor(message: string, options?: {errorCode?: HttpStatusCode, errors?: APIErrorData[]}) {
        super(message);
        this.name = 'APIError';

        if (options) {
            this.errorCode = options.errorCode;
            this.errors = options.errors;
        }
        
        // Ensure the stack trace is properly captured
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, APIError);
        }
    }
}

export const buildErrorResponse = (errorCode: HttpStatusCode, message: string, errors: APIErrorData[] = []): APIResponse<undefined> => {
    return {
        statusCode: errorCode,
        message,
        errors,
    };
}

export const throwValidationError = (errors: {message: string, key?: string}[]) => {
    throw new APIError("Validation Error", {
        errorCode: HttpStatusCode.BadRequest,
        errors: errors.map(({message, key}) => ({errorType: ErrorType.Validation, message, key}))
    });
};

export const buildObjectFetchRepsonse = (data: any, message?: string): APIResponse<any> => {
    return {
        statusCode: HttpStatusCode.OK,
        message: message || "Success",
        data
    }
};

export const buildNoContentRepsonse = (message?: string): APIResponse<undefined> => {
    return {
        statusCode: HttpStatusCode.OK,
        message: message || "Success"
    }
};