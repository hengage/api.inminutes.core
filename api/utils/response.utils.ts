import { Response } from "express";
import { HTTP_STATUS_CODES } from "../config/constants.config";
import { ApiError, ApiSuccessResponse, ErrorCode } from "../types";
import { HandleException } from "./handleException.utils";

// Utility function to create an error response
export function createErrorResponse(
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
export function handleErrorResponse(err: unknown): {
  statusCode: number;
  errorJSON: ApiError;
} {
  if (err instanceof HandleException) {
    const errorCode = Object.entries(HTTP_STATUS_CODES).find(
      ([, code]) => code === err.status
    )?.[0] as ErrorCode;

    return {
      statusCode: err.status,
      errorJSON: createErrorResponse(
        errorCode || "INTERNAL_SERVER_ERROR",
        err.message
      ),
    };
  } else if (err instanceof Error) {
    // Handle generic Error objects
    return {
      statusCode: HTTP_STATUS_CODES.SERVER_ERROR,
      errorJSON: createErrorResponse(
        "SERVER_ERROR",
        "An unexpected error occurred"
      ),
    };
  } else {
    // Handle unknown error types
    return {
      statusCode: HTTP_STATUS_CODES.SERVER_ERROR,
      errorJSON: createErrorResponse(
        "SERVER_ERROR",
        "An unknown error occurred"
      ),
    };
  }
}

export function createSuccessResponse<T = null>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  return {
    status: "success",
    data,
    ...(message && { message }),
  };
}
export function handleSuccessResponse<T = null>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string
) {
  const successResponse: ApiSuccessResponse<T> = createSuccessResponse(data, message);
  res.status(statusCode).json(successResponse);
}
