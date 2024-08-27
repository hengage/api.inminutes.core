import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";

import jwt from "jsonwebtoken";
import { rateLimit } from "express-rate-limit";

import { handleErrorResponse, STATUS_CODES } from "../utils";
import { JWT_SECRET_KEY } from "../config";
import { JWT_ALGORITHMS } from "../config/secrets.config";

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

  if (!token) {
    return res
      .status(STATUS_CODES.BAD_REQUEST)
      .json({ message: "Token not provided" });
  }

  try {
    const decoded = jwt.verify(token, `${JWT_SECRET_KEY}`, {
      algorithms: [JWT_ALGORITHMS.HS256],
    });
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: "Invalid or expired token" });
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
  console.log({ tokenFromSocket: token });

  try {
    const decoded = jwt.verify(token, `${JWT_SECRET_KEY}`);
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
  if (!userType) {
    return res.status(STATUS_CODES.BAD_REQUEST).json("User type is required");
  }

  if (userType !== "customer" && userType != "rider") {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: "Invalid user type",
    });
  }

  if (typeof userType !== "string") {
    return res.status(STATUS_CODES.BAD_REQUEST).json({
      message: "Invalid user type",
    });
  }

  return next();
};

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message:{ error: "Too many requests, try again later" },
  // store: ... , // Redis
});
// Todo: use 'rate-limit-redis' for persistent storage https://www.npmjs.com/package/rate-limit-redis

export {
  verifyAuthTokenMiddleware,
  socketGuard,
  errandHistoryMiddleware,
  limiter,
};
