import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import db from "../../db"; // Update with your database import

const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";
interface JwtPayload {
  userId: number;
  role: string;
  name: string;
}
export const checkTokenBlacklist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
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
    // Check if token is in blacklist
    const query = `SELECT * FROM TokenBlacklist WHERE token = $1 AND expiry > NOW()`;
    const result = await db.query(query, [token]);
    if (result.rows.length > 0) {
      return res.status(401).json({ error: "this token is blackisted." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ error: "Invalid token." });
  }
};
