import createError from 'http-errors'

class HandleException extends Error {
    /*
     Extends the built-in Error class to create custom error objects 
     that can be thrown and caught in the code. 
     This class is meant to be used when custom error handling is needed in the application
    */
   
    public status: number;
    public message: string

    constructor(status: number, message: string, isHttpError = false) {
        super(message);
        this.name = 'HandleException';
        this.status = status;
        this.message = message;

        if (isHttpError) {
            Object.setPrototypeOf(this, createError(status, message));
        }

        Error.captureStackTrace(this, this.constructor);
    }
}


export { HandleException };