import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const secretKey = process.env.JWT_SECRET || "your_secret_key";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      name: string;
      role: string;
      iat: number;
      exp: number;
    };
  }
}

declare module "express-serve-static-core" {
  interface Request {
    userR?: JwtPayload & { id: number; role: string };
  }
}
export interface JwtPayload {
  userId: number;
  guardianId: number;
  role: string;
}

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as {
      id: number;
      name: string;
      role: string;
      iat: number;
      exp: number;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Access denied, insufficient permissions" });
    }

    next();
  };
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload & {
      id: number;
      role: string;
    };
    req.userR = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
