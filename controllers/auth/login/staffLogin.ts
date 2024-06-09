import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "../../../db";

const secretKey = process.env.JWT_SECRET || "LAJDLD9348jkdf924+"; // Use an environment variable for the secret key

interface JwtPayload {
  userId: number;
  role: string;
  name: string;
}

export const loginVaccinationStaffController = async (
  req: Request,
  res: Response
) => {
  const { username, password, user_type } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    // Fetch staff data from the database
    const staffQuery = `
      SELECT Users.id, Users.name, Users.user_type, VaccinationStaff.password
      FROM Users
      INNER JOIN VaccinationStaff ON Users.id = VaccinationStaff.user_id
      WHERE Users.name = $1 AND Users.user_type = $2
    `;
    const staffResult = await db.query(staffQuery, [username, user_type]);
    console.log();

    if (staffResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const staff = staffResult.rows[0];

    // Compare the password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, staff.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // If a token exists in the request headers and the payload matches the fetched user data, return the same token
    if (token) {
      const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
      if (
        decodedToken &&
        decodedToken.name === staff.name &&
        decodedToken.userId === staff.id &&
        decodedToken.role === staff.user_type
      ) {
        return res.json({ token });
      }
    }

    // Generate a new JWT with the staff's role
    const newToken = jwt.sign(
      { userId: staff.id, role: staff.user_type, name: staff.name },
      secretKey,
      { expiresIn: "24h" }
    );

    res.json({ token: newToken });
  } catch (error) {
    console.error("Error logging in***************:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
