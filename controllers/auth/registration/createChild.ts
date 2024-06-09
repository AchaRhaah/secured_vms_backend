import { Request, Response } from "express";
import db from "../../../db";
import crypto from "crypto";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET;

export const createChildAccountController = async (
  req: Request,
  res: Response
) => {
  const {
    childName,
    childDob,
    placeOfBirth,
    weightAtBirth,
    birthDeclarationDate,
    motherName,
    motherTelephone,
    fatherName,
    fatherTelephone,
    guardianName,
    guardianTelephone,
    guardianAddress,
    childGender,
    guardianGender,
  } = req.body;

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // Check if the guardian exists in the database
    let guardianId: number | null = null;
    const guardianQuery = `
      SELECT id FROM Guardians WHERE name = $1 AND phone_number = $2 LIMIT 1
    `;
    const guardianValues = [guardianName, guardianTelephone];
    const guardianResult = await client.query(guardianQuery, guardianValues);
    if (guardianResult.rows.length > 0) {
      guardianId = guardianResult.rows[0].id;
    } else {
      // Insert new user for the guardian
      const newUserQuery = `
        INSERT INTO Users (name, gender, address, user_type)
        VALUES ($1, $2, $3, 'Guardian')
        RETURNING id
      `;
      const hashedPassword = await bcrypt.hash(guardianTelephone, 10);

      const newUserValues = [guardianName, guardianGender, guardianAddress];
      const newUserResult = await client.query(newUserQuery, newUserValues);
      const newUserId = newUserResult.rows[0].id;

      // Insert new guardian data into the Guardians table
      const newGuardianQuery = `
        INSERT INTO Guardians (user_id, name, phone_number, address, gender, password)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const newGuardianValues = [
        newUserId,
        guardianName,
        guardianTelephone,
        guardianAddress,
        guardianGender,
        hashedPassword, // Default password, should be updated later for security
      ];
      const newGuardianResult = await client.query(
        newGuardianQuery,
        newGuardianValues
      );
      guardianId = newGuardianResult.rows[0].id;
    }

    // Check if the child already exists in the database
    const childExistQuery = `
      SELECT id FROM Children 
      WHERE name = $1 AND date_of_birth = $2 AND guardian_id = $3
      LIMIT 1
    `;
    const childExistValues = [childName, childDob, guardianId];
    const childExistResult = await client.query(
      childExistQuery,
      childExistValues
    );

    if (childExistResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Child already exists" });
    }

    // Insert new child data into the Children table
    const childQuery = `
      INSERT INTO Children (
        name,
        gender,
        mother_name,
        mother_phone_number,
        father_name,
        father_phone_number,
        date_of_birth,
        place_of_birth,
        weight_at_birth,
        birth_declaration_date,
        guardian_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const childValues = [
      childName,
      childGender,
      motherName,
      motherTelephone,
      fatherName,
      fatherTelephone,
      childDob,
      placeOfBirth,
      weightAtBirth,
      birthDeclarationDate,
      guardianId,
    ];
    const { rows } = await client.query(childQuery, childValues);

    await client.query("COMMIT");
    res
      .status(201)
      .json({ child: rows[0], guardianPassword: guardianTelephone });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating child:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the child" });
  } finally {
    client.release();
  }
};
