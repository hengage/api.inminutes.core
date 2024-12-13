import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";

import { rateLimit } from "express-rate-limit";
import jwt from "jsonwebtoken";

import { JWT_SECRET_KEY } from "../config";
import { JWT_ALGORITHMS } from "../config/secrets.config";
import {
  HTTP_STATUS_CODES,
  RATE_LIMIT_WINDOW_MS,
  USER_TYPE,
} from "../constants";
import { Msg } from "../utils";
import { createErrorResponse } from "../utils/response.utils";

/**
  Verifies the authentication token for a request.
  @param {Request} req - Request object.
  @param {Response} res - Response object.
  @param {NextFunction} next - Next function in the middleware chain.
*/
const verifyAuthTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1] || req.body.token;

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    console.error("Authentication error:", error);
    res
      .status(HTTP_STATUS_CODES.UNAUTHORIZED)
      .json(
        createErrorResponse("UNAUTHORIZED", Msg.ERROR_AUNAUTHORIZED_USER()),
      );
  }
};

/**
  Verifies the authentication token for a socket connection.
  @param {object} event - Socket event.
  @param {function} next - Next function in the middleware chain.
*/
const socketGuard = (event: any, next: (err?: Error | undefined) => void) => {
  const socket: Socket = event;
  const token =
    socket.handshake.headers.authorization?.split(" ")[1] ||
    socket.handshake.auth.token;

  if (!token) {
    console.error("Authentication error: Token not provided");
    return next(new Error("Authentication error: Token not provided"));
  }

  try {
    const decoded = verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch (error: unknown) {
    console.log({ error });
    if (error instanceof Error) {
      return next(new Error("Authentication error: " + error.message));
    } else {
      return next(new Error("An Unknown error occured"));
    }
  }
};
const errandHistoryMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userType = req.query.usertype as USER_TYPE.CUSTOMER | USER_TYPE.RIDER;
  console.log({ userType });

  if (userType !== USER_TYPE.CUSTOMER && userType != USER_TYPE.RIDER) {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json(
        createErrorResponse(
          "BAD_REQUEST",
          Msg.ERROR_INVALID_USER_TYPE(userType),
        ),
      );
  }

  return next();
};

// Todo: use 'rate-limit-redis' for persistent storage https://www.npmjs.com/package/rate-limit-redis

const createRateLimiter = (limit: number, windowMs: number) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: createErrorResponse(
      "BAD_REQUEST",
      "Too many attempts, try again later",
    ),
  });

const otpLimiter = createRateLimiter(5, RATE_LIMIT_WINDOW_MS.DEFAULT);

const authLimiter = createRateLimiter(6, RATE_LIMIT_WINDOW_MS.DEFAULT);

const cashoutLimiter = createRateLimiter(5, RATE_LIMIT_WINDOW_MS.CASHOUT_LIMIT);

const verifyToken = (token: string): jwt.JwtPayload | string => {
  return jwt.verify(token, `${JWT_SECRET_KEY}`, {
    algorithms: [JWT_ALGORITHMS.HS256],
  });
};

export {
  authLimiter,
  cashoutLimiter,
  errandHistoryMiddleware,
  otpLimiter,
  socketGuard,
  verifyAuthTokenMiddleware,
};
