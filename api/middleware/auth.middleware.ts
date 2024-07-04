import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";

import jwt from "jsonwebtoken";

import { STATUS_CODES } from "../utils";
import { JWT_SECRET_KEY } from "../config";

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
    const decoded = jwt.verify(token, `${JWT_SECRET_KEY}`);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    return res.status(401).json({ message: error.message });
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
    console.error('Authentication error: Token not provided')
    return next(new Error("Authentication error: Token not provided"));
  }

  try {
    const decoded = jwt.verify(token, `${JWT_SECRET_KEY}`);
    socket.data.user = decoded;
    next();
  } catch (error: any) {
    console.log({ error });
    return next(new Error("Authentication error: " + error.message));
  }
};

export { verifyAuthTokenMiddleware, socketGuard };
