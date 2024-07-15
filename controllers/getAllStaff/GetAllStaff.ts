import { Request, Response } from "express";
import db from "../../db";

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const result = await db.query(`
      SELECT vs.id, u.name, vs.position as role, u.address, vs.phone_number as phone, u.gender
      FROM VaccinationStaff vs
      JOIN Users u ON vs.user_id = u.id
    `);

    const staffData = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role,
      department: "Vaccination Department", // Assuming a default department
      phone: row.phone,
      address: row.address,
      gender: row.gender,
    }));

    res.status(200).json(staffData);
  } catch (error) {
    console.error("Error fetching vaccination staff:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
