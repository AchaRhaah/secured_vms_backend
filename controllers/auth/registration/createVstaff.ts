import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import db from "../../../db";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { PoolClient } from "pg";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "oifsod9askj934893";

const createVaccinationStaffController = async (
  req: Request,
  res: Response
) => {
  const client: PoolClient = await db.connect();

  try {
    const {
      name,
      user_type,
      hire_date,
      phone_number,
      password,
      gender,
      address,
    } = req.body;

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

    const hashedPassword = await bcrypt.hash(password, 10);
    const username = `${name.replace(/\s+/g, "").toLowerCase()}`;

    await client.query("BEGIN"); // Begin transaction

    const newUserQuery = `
      INSERT INTO Users (name, gender, address, user_type, username)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    const newUserValues = [name, gender, address, user_type, username];
    const newUserResult = await client.query(newUserQuery, newUserValues);
    const newUserId = newUserResult.rows[0].id;

    const updatedUsername = `${username}${newUserId}`;
    const updateUserQuery = `
      UPDATE Users SET username = $1 WHERE id = $2
    `;
    await client.query(updateUserQuery, [updatedUsername, newUserId]);

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

    await client.query("COMMIT"); // Commit transaction

    const token = jwt.sign(
      { userId: newUserId, name, role: user_type },
      JWT_SECRET,
      { expiresIn: "9h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      data: {
        ...rows[0],
        username: updatedUsername,
      },
      message: "Creation successful",
    });
  } catch (error) {
    await client.query("ROLLBACK"); // Rollback transaction in case of error
    console.error("Error creating vaccination staff:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while creating vaccination staff",
    });
  } finally {
    client.release();
  }
};

export default createVaccinationStaffController;
