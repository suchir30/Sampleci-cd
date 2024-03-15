export enum HttpStatusCode {
    // Success
    OK = 200,
    NoContent = 204,
    // Client Error
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    // Server Error
    InternalServerError = 500,
    NotImplemented = 501,
}

export enum ErrorType {
    Validation = 'validation',
    Error = 'error'
}

export interface APIErrorData {
    errorType: ErrorType;
    message: string;
    key?: string;
}

export interface APIResponse<T> {
    statusCode: HttpStatusCode,
    message: string,
    data?: T | T[],
    errors?: APIErrorData[];
}