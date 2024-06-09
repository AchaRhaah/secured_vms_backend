import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../../db";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PoolClient } from "pg";

// Controller function to create a new vaccination staff member
const JWT_SECRET = process.env.JWT_SECRET || "oifsod9askj934893";

const createVaccinationStaffController = async (
  req: Request,
  res: Response
) => {
  const client: PoolClient = await db.connect();

  try {
    // Extract necessary data from the request body
    const {
      name,
      user_type,
      hire_date,
      phone_number,
      password,
      gender,
      address,
    } = req.body;

    // Check if the vaccination staff already exists
    const staffExistQuery = `
      SELECT * FROM Users WHERE name = $1 AND user_type = $2
    `;
    const staffExistValues = [name, user_type];
    const staffExistResult = await client.query(
      staffExistQuery,
      staffExistValues
    );

    if (staffExistResult.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Vaccination staff already exists" });
    }
    // hash passwords
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user data into the Users table
    const newUserQuery = `
      INSERT INTO Users (name, gender, address, user_type)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const newUserValues = [name, gender, address, user_type]; // Assuming gender and address are nullable
    const newUserResult = await client.query(newUserQuery, newUserValues);
    const newUserId = newUserResult.rows[0].id;

    // Insert new vaccination staff data into the VaccinationStaff table
    const staffQuery = `
      INSERT INTO VaccinationStaff (user_id, position, hire_date, phone_number, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const staffValues = [
      newUserId,
      user_type,
      hire_date,
      phone_number,
      hashedPassword,
    ];
    const { rows } = await client.query(staffQuery, staffValues);
    // VaccinationStaff;
    const token = jwt.sign(
      { userId: newUserId, name, role: user_type },
      JWT_SECRET,
      { expiresIn: "9h" }
    );

    // Send success response with created vaccination staff member data
    res.status(201).json({ success: true, data: rows[0], token, user_type });
  } catch (error) {
    // Send error response if an error occurs
    console.error("Error creating vaccination staff:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while creating vaccination staff",
    });
  } finally {
    // Release the client back to the pool
    client.release();
  }
};

export default createVaccinationStaffController;
