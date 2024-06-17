import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";

interface JwtPayload {
  userId: number;
  role: string;
  name: string;
}

export const forceExpireTokenController = (req: Request, res: Response) => {
const token = req.cookies.token;
if (!token) {
  return res.status(401).json({ error: "Authorization header is missing." });
}

try {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  // Generate a new token with a very short expiration time (e.g., 1 millisecond)
  const newToken = jwt.sign(
    { userId: decoded.userId, role: decoded.role, name: decoded.name },
    JWT_SECRET,
    { expiresIn: "1ms" } // Token expires almost immediately
  );

  res.cookie("token", newToken, {
    httpOnly: true,
    // secure: "production",
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "strict",
  });
  res.json({ message: "logout successful" });
} catch (error) {
  console.error("Token verification error:", error);
  res.status(401).json({ error: "Invalid token." });
}
};
