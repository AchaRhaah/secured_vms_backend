import { Request, Response } from "express";
import db from "../../db";
import { JwtPayload } from "../../middleware/auth/auth";
// Get all children under the logged-in guardian
export const getChildrenUnderGuardian = async (req: Request, res: Response) => {
  const { userId, guardianId } = req.userR as JwtPayload;

  try {
    const childrenQuery = `
      SELECT id, name, gender, date_of_birth, mother_name, mother_phone_number, father_name, father_phone_number,  place_of_birth, weight_at_birth
      FROM Children
      WHERE guardian_id = $1 
    `;
    const { rows: children } = await db.query(childrenQuery, [guardianId]);
    res.json(children);
  } catch (error) {
    console.error("Error fetching children:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get vaccination records for a specific child under the logged-in guardian
export const getChildVaccinationRecords = async (
  req: Request,
  res: Response
) => {
  const { guardianId } = req.userR as JwtPayload;
  const { childId } = req.params;

  try {
    const guardianCheckQuery = `
      SELECT id FROM Children WHERE id = $1 AND guardian_id = $2
    `;
    const { rows: guardianCheck } = await db.query(guardianCheckQuery, [
      childId,
      guardianId,
    ]);

    if (guardianCheck.length === 0) {
      return res
        .status(403)
        .json({ error: "You do not have access to this child's records" });
    }

    const vaccinationRecordsQuery = `
      SELECT VaccinationRecords.id, vaccine_id, date_administered, batch_number, next_appointment_date, administered_by, Vaccines.name as vaccine_name, Vaccines.disease
      FROM VaccinationRecords
      INNER JOIN Vaccines ON VaccinationRecords.vaccine_id = Vaccines.id
      WHERE child_id = $1
    `;
    const { rows: vaccinationRecords } = await db.query(
      vaccinationRecordsQuery,
      [childId]
    );

    res.json(vaccinationRecords);
  } catch (error) {
    console.error("Error fetching vaccination records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
