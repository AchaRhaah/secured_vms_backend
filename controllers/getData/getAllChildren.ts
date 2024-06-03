import { Request, Response } from "express";
import db from "../../db";
import { PoolClient } from "pg";

// Function to calculate age in months
const calculateAgeInMonths = (dob: Date): number => {
  const today = new Date();
  const birthDate = new Date(dob);
  let ageMonths = (today.getFullYear() - birthDate.getFullYear()) * 12;
  ageMonths += today.getMonth() - birthDate.getMonth();
  return ageMonths;
};

export const getAllChildrenController = async (req: Request, res: Response) => {
  const client: PoolClient = await db.connect();
  try {
    const queryText = `
      SELECT 
        c.id AS child_id, 
        c.name AS child_name, 
        c.mother_name, 
        c.mother_phone_number, 
        c.date_of_birth, 
        c.place_of_birth, 
        c.weight_at_birth, 
        c.birth_declaration_date, 
        c.gender AS child_gender,
        g.id AS guardian_id, 
        g.gender AS guardian_gender, 
        g.name AS guardian_name, 
        g.phone_number AS guardian_phone_number, 
        g.address AS guardian_address
      FROM Children c
      LEFT JOIN Guardians g ON c.guardian_id = g.id;
    `;

    const { rows } = await client.query(queryText);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({
      success: false,
      error: "An error occurred while fetching children",
    });
  } finally {
    client.release();
  }
};
