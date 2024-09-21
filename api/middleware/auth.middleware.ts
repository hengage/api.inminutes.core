import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";

import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";

import { HTTP_STATUS_CODES } from "../utils";
import { JWT_SECRET_KEY } from "../config";
import { JWT_ALGORITHMS } from "../config/secrets.config";
import { CustomJwtPayload } from "../types";
import { RATE_LIMIT_WINDOW_MS } from "../config/constants.config";
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
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1] || req.body.token;

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error: any) {
    res
      .status(HTTP_STATUS_CODES.UNAUTHORIZED)
      .json(
        createErrorResponse(
          "UNAUTHORIZED",
          "Invalid request. Please check your credentials and try again."
        )
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
  } catch (error: any) {
    console.log({ error });
    return next(new Error("Authentication error: " + error.message));
  }
};

const errandHistoryMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userType = req.query.usertype as "customer" | "rider";
  console.log({ userType });

  if (userType !== "customer" && userType != "rider") {
    return res
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json(createErrorResponse("BAD_REQUEST", "Invalid user type."));
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
      "Too many attempts, try again later"
    ),
  });

const otpLimiter = createRateLimiter(5, RATE_LIMIT_WINDOW_MS.DEFAULT);

const authLimiter = createRateLimiter(6, RATE_LIMIT_WINDOW_MS.DEFAULT);

const cashoutLimiter = createRateLimiter(5, RATE_LIMIT_WINDOW_MS.CASHOUT_LIMIT);

const verifyToken = (token: string): CustomJwtPayload | string => {
  return jwt.verify(token, `${JWT_SECRET_KEY}`, {
    algorithms: [JWT_ALGORITHMS.HS256],
  }) as CustomJwtPayload;
};

export {
  verifyAuthTokenMiddleware,
  socketGuard,
  errandHistoryMiddleware,
  otpLimiter,
  authLimiter,
  cashoutLimiter,
};
