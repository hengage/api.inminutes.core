import { NextFunction, Request, Response } from "express";
import { Socket } from "socket.io";

import jwt from "jsonwebtoken";

import { STATUS_CODES } from "../utils";
import { JWT_SECRET_KEY } from "../config";

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

const socketGuard = (event: any, next: (err?: Error | undefined) => void) => {
  const socket: Socket = event;
  const token =
    socket.handshake.headers.authorization?.split(" ")[1] ||
    socket.handshake.auth.token;
  console.log({ ipAddress: socket.handshake.address });

  if (!token) {
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
