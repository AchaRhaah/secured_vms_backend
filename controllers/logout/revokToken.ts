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

    // Check if the token is already in the blacklist
    const checkQuery = `SELECT token FROM TokenBlacklist WHERE token = $1`;
    const checkResult = await db.query(checkQuery, [token]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ error: "Token is already blacklisted." });
    }

    // Add token to blacklist with its expiration time
    const expiryDate = new Date(decoded.exp * 1000); // Convert exp from seconds to milliseconds
    const insertQuery = `INSERT INTO TokenBlacklist (token, expiry) VALUES ($1, $2)`;
    await db.query(insertQuery, [token, expiryDate]);

    return res.json({ message: "Token has been revoked." });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ error: "Invalid token." });
  }
};
