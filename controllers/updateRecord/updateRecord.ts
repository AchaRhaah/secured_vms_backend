import { Request, Response } from "express";
import db from "../../db";
import jwt from "jsonwebtoken";
import { deductVaccineInventoryController } from "../inventory/deduction";

interface JwtPayload {
  userId: number;
  role: string;
  name: string;
}

const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";

export const updateVaccinationRecordController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      childId,
      vaccineId,
      isBooster = false, // New field for booster
    } = req.body;
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ error: "Authorization header is missing." });
    }
    const dateAdministered = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    const decodedToken = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      userId: number;
      role: string;
      name: string;
    };

    // Extracting userId and name from decoded token
    const { userId } = decodedToken;

    // // Check if all required fields are present
    // if (!childId || !vaccineId) {
    //   return res.status(400).json({ error: "All fields are required." });
    // }

    // Retrieve staff ID from JWT payload
    const userQuery = `
      SELECT v.id as vaccination_staff_id
      FROM Users u
      JOIN VaccinationStaff v ON u.id = v.user_id
      WHERE u.id = $1
    `;
    const userResult = await db.query(userQuery, [userId]);
    if (
      userResult.rows.length === 0 ||
      !userResult.rows[0].vaccination_staff_id
    ) {
      return res
        .status(400)
        .json({ error: "User is not associated with any vaccination staff." });
    }
    const administeredBy = userResult.rows[0].vaccination_staff_id;

    // Check if the administered_by ID exists in the VaccinationStaff table
    const staffQuery = `SELECT id FROM VaccinationStaff WHERE id = $1`;
    const staffResult = await db.query(staffQuery, [administeredBy]);
    if (staffResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid administered_by ID." });
    }

    // Check if the child is eligible for the vaccine
    const vaccineQuery = `SELECT eligible_age FROM Vaccines WHERE id = $1`;
    const vaccineResult = await db.query(vaccineQuery, [vaccineId]);
    if (vaccineResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid vaccine ID." });
    }
    const vaccine = vaccineResult.rows[0];

    // Retrieve batch number for the vaccine
    const batchNumberQuery = `
      SELECT batch_number
      FROM VaccineInventory
      WHERE vaccine_id = $1
      LIMIT 1;
    `;
    const batchNumberResult = await db.query(batchNumberQuery, [vaccineId]);
    if (batchNumberResult.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "No batch number found for this vaccine." });
    }
    const batchNumber = batchNumberResult.rows[0].batch_number;

    // Check if the child has already taken the vaccine
    const checkTakenQuery = `SELECT * FROM VaccinationRecords WHERE child_id = $1 AND vaccine_id = $2 AND taken = TRUE`;
    const checkTakenResult = await db.query(checkTakenQuery, [
      childId,
      vaccineId,
    ]);

    if (isBooster) {
      // Ensure the child has already taken the initial dose before allowing a booster
      if (checkTakenResult.rows.length === 0) {
        return res.status(400).json({
          error:
            "The child must have taken the initial dose before receiving a booster.",
        });
      }
    } else {
      if (checkTakenResult.rows.length > 0) {
        console.log();

        return res.status(400).json({
          error: "This vaccine has already been administered to the child.",
        });
      }
    }

    // Find the next appointment date for the child and vaccine
    const nextAppointmentQuery = `
      SELECT * FROM VaccinationAppointments WHERE child_id = $1 AND appointment_date > CURRENT_DATE
      ORDER BY appointment_date ASC
      LIMIT 1;
    `;
    const nextAppointmentResult = await db.query(nextAppointmentQuery, [
      childId,
    ]);

    let nextAppointment = null;
    if (nextAppointmentResult.rows.length > 0) {
      nextAppointment = nextAppointmentResult.rows[0].appointment_date;
    }

    // Update the vaccination record
    const updateRecordQuery = `
      INSERT INTO VaccinationRecords 
      (child_id, vaccine_id, date_administered, batch_number, next_appointment_date, administered_by, taken, eligible, is_booster) 
      VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE, $7)
      RETURNING *;
    `;
    const updateRecordResult = await db.query(updateRecordQuery, [
      childId,
      vaccineId,
      dateAdministered,
      batchNumber,
      nextAppointment,
      administeredBy,
      isBooster,
    ]);

    if (updateRecordResult.rows.length === 0) {
      return res
        .status(500)
        .json({ error: "Failed to update vaccination record." });
    }

    const updatedRecord = updateRecordResult.rows[0];

    // Deduct from vaccine inventory
    const deductions = await deductVaccineInventoryController(vaccineId);
    if (deductions.error) {
      return res.status(400).json({ error: deductions.error });
    }

    res.json(updatedRecord);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
