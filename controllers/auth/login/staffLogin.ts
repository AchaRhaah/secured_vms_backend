import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../../../db";

const secretKey = process.env.JWT_SECRET || "LAJDLD9348jkdf924+"; // Use an environment variable for the secret key

interface JwtPayload {
  userId: number;
  role: string;
}

export const loginVaccinationStaffController = async (
  req: Request,
  res: Response
) => {
  const { username, password } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    // Token exists, send back the same token without regeneration
    return res.json({ token });
  }

  try {
    // Fetch staff data from the database
    const staffQuery = `
      SELECT Users.id, Users.name, Users.user_type, VaccinationStaff.password
      FROM Users
      INNER JOIN VaccinationStaff ON Users.id = VaccinationStaff.user_id
      WHERE Users.name = $1 AND Users.user_type = 'VaccinationStaff'
    `;
    const staffResult = await db.query(staffQuery, [username]);

    if (staffResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const staff = staffResult.rows[0];

    // Compare the password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate a JWT with the staff's role
    const token = jwt.sign(
      { userId: staff.id, role: staff.user_type },
      secretKey,
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
