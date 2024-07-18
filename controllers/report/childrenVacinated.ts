import { Request, Response } from "express";
import db from "../../db"; // adjust the path according to your project structure

export const getChildrenVaccinatedByVaccine = async (
  req: Request,
  res: Response
) => {
  try {
    const { vaccineId } = req.params;

    // Query to get all children vaccinated by the specified vaccine
    const query = `
      SELECT
        c.id AS child_id,
        c.name AS child_name,
        c.gender AS child_gender,
        vr.date_administered,
        vr.batch_number
      FROM VaccinationRecords vr
      JOIN Children c ON vr.child_id = c.id
      JOIN Guardians g ON c.guardian_id = g.id
      WHERE vr.vaccine_id = $1 AND vr.taken = true
      ORDER BY vr.date_administered DESC;
    `;

    const result = await db.query(query, [vaccineId]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching children vaccinated by vaccine:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
