import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../../../db";

const secretKey = process.env.JWT_SECRET || "LAJDLD9348jkdf924+"; // Use an environment variable for the secret key

interface JwtPayload {
  userId: number;
  role: string;
}

export const loginGuardianController = async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    // Token exists, send back the same token without regeneration
    return res.json({ token });
  }

  try {
    // Fetch Guardian data from the database
    const guardianQuery = `
      SELECT Users.id, Users.name, Users.user_type, Guardians.password, Guardians.id
      FROM Users
      INNER JOIN Guardians ON Users.id = Guardians.user_id
      WHERE Users.name = $1 AND Users.user_type = 'Guardian'
    `;
    const guardianResults = await db.query(guardianQuery, [username]);
    // console.log(guardianResults.rows[0]);
    if (guardianResults.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const guardian = guardianResults.rows[0];
    // Compare the password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, guardian.password);
    if (!isPasswordValid) {
      console.log("***********here");

      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT with the staff's role
    const token = jwt.sign(
      { guardianId: guardian.id, role: guardian.user_type },
      secretKey,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
