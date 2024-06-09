import { Request, Response, NextFunction } from "express";
import db from "../../db"; // Update with your database import
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";

interface JwtPayload {
  userId: number;
  role: string;
  name: string;
}

export const revokeTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Authorization header is missing." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      name: string;
      role: string;
      iat: number;
      exp: number;
    };
    // Add token to blacklist with its expiration time
    const expiryDate = new Date(decoded.exp * 1000); // Convert exp from seconds to milliseconds
    const query = `INSERT INTO TokenBlacklist (token, expiry) VALUES ($1, $2)`;
    await db.query(query, [token, expiryDate]);

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token." });
  }
};
