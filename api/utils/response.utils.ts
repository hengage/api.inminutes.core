import { Response } from "express";
import { STATUS_CODES } from "./constants.utils";

function handleErrorResponse(
  res: Response,
  error: any,
  message: string = "Failed"
) {
  console.log({ error: { status: error.status, message: error.message } });
  console.log({ error});

  const errorMessage =
    (error.status && error.status >= 500) || error.status === undefined
      ? "Server error"
      : error.message;

  res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
    message,
    error: errorMessage,
  });
}

export { handleErrorResponse };
