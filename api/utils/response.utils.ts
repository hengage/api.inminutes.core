import { Response } from "express";
import { HTTP_STATUS_CODES } from "../config/constants.config";
import { ApiError, ErrorCode } from "../types";
import { HandleException } from "./handleException.utils";

function handleErrorResponse(
  res: Response,
  error: any,
  message: string = "Failed"
) {
  console.log({ error: { status: error.status, message: error.message } });
  console.log({ error });

  const errorMessage =
    (error.status && error.status >= 500) || error.status === undefined
      ? "Server error"
      : error.message;

  res.status(error.status || HTTP_STATUS_CODES.SERVER_ERROR).json({
    message,
    error: errorMessage,
  });
}

// Utility function to create an error response
function createErrorResponse(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ApiError {
  return {
    status: "error",
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };
}

// Function to handle errors and generate appropriate responses
function handleError(err: unknown): {
  statusCode: number;
  errorResponse: ApiError;
} {
  if (err instanceof HandleException) {
    const errorCode = Object.entries(HTTP_STATUS_CODES).find(
      ([, code]) => code === err.status
    )?.[0] as ErrorCode;

    return {
      statusCode: err.status,
      errorResponse: createErrorResponse(
        errorCode || "INTERNAL_SERVER_ERROR",
        err.message
      ),
    };
  } else if (err instanceof Error) {
    // Handle generic Error objects
    return {
      statusCode: HTTP_STATUS_CODES.SERVER_ERROR,
      errorResponse: createErrorResponse(
        "SERVER_ERROR",
        "An unexpected error occurred"
      ),
    };
  } else {
    // Handle unknown error types
    return {
      statusCode: HTTP_STATUS_CODES.SERVER_ERROR,
      errorResponse: createErrorResponse(
        "SERVER_ERROR",
        "An unknown error occurred"
      ),
    };
  }
}
export { handleErrorResponse, handleError, createErrorResponse };
