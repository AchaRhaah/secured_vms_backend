import { Request, Response } from "express";
import db from "../../db";
import { PoolClient } from "pg";

// Controller function to create a new vaccination staff member
const createVaccinationStaffController = async (
  req: Request,
  res: Response
) => {
  const client: PoolClient = await db.connect();

  try {
    // Extract necessary data from the request body
    const { name, position, hire_date, phone_number, password } = req.body;

    // Check if the vaccination staff already exists
    const staffExistQuery = `
      SELECT * FROM Users WHERE name = $1 AND user_type = 'VaccinationStaff'
    `;
    const staffExistValues = [name];
    const staffExistResult = await client.query(
      staffExistQuery,
      staffExistValues
    );

    if (staffExistResult.rows.length > 0) {
      return res
        .status(409)
        .json({ error: "Vaccination staff already exists" });
    }

    // Insert new user data into the Users table
    const newUserQuery = `
      INSERT INTO Users (name, gender, address, user_type)
      VALUES ($1, $2, $3, 'VaccinationStaff')
      RETURNING id
    `;
    const newUserValues = [name, null, null]; // Assuming gender and address are nullable
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
      position,
      hire_date,
      phone_number,
      password,
    ];
    const { rows } = await client.query(staffQuery, staffValues);

    // Send success response with created vaccination staff member data
    res.status(201).json({ success: true, data: rows[0] });
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
