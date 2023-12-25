import { Request, Response, NextFunction } from "express";
import { HandleException } from "../utils/";

HandleException

class CentralErrorHandler {
  /*
  Provides a centralized middleware for handling errors in HTTP requests
  It sends back error responses to the client with appropriate status codes and error messages. 
  This class is meant to be used for centralized error handling in the application.
  */
 
  public handle404Error(req: Request, res: Response, next: NextFunction) {
    /*
    404 error handling middleware  
    */
    const error = new HandleException(404, 'Not Found', true);
    next(error);
  }

  public handle404OrServerError(err: any, req: Request, res: Response, next: NextFunction) {
    /*
    Central error handling middleware
    */
    res.status(err.status || 500).json({
      error: {
        status: err.status || 500,
        message: err.message || 'Internal Server Error',
      },
    });
  }
}

export const centralErrorHandler = new CentralErrorHandler()