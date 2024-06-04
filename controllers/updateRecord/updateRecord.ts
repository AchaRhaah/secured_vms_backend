import { Request, Response } from "express";
import db from "../../db";
import { deductVaccineInventoryController } from "../inventory/deduction";

export const updateVaccinationRecordController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      childId,
      vaccineId,
      dateAdministered,
      batchNumber,
      nextAppointmentDate,
      administeredBy,
    } = req.body;

    // Check if all required fields are present
    if (
      !childId ||
      !vaccineId ||
      !dateAdministered ||
      !batchNumber ||
      !nextAppointmentDate ||
      !administeredBy
    ) {
      return res.status(400).json({ error: "All fields are required." });
    }

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

    const childQuery = `SELECT date_of_birth FROM Children WHERE id = $1`;
    const childResult = await db.query(childQuery, [childId]);

    if (childResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid child ID." });
    }

    const child = childResult.rows[0];

    const dateOfBirth = new Date(child.date_of_birth);
    const today = new Date();

    const yearsDifference = today.getFullYear() - dateOfBirth.getFullYear();
    const monthsDifference = today.getMonth() - dateOfBirth.getMonth();
    const childAgeInMonths = yearsDifference * 12 + monthsDifference;

    if (childAgeInMonths < vaccine.eligible_age) {
      return res
        .status(400)
        .json({ error: "Child is not eligible for this vaccine yet." });
    }
    const deductions = await deductVaccineInventoryController(vaccineId);
    if (deductions.error) {
      return res.status(400).json({ error: deductions.error });
    }
    // Check if the child has already taken the vaccine
    const checkTakenQuery = `SELECT * FROM VaccinationRecords WHERE child_id = $1 AND vaccine_id = $2 AND taken = TRUE`;
    const checkTakenResult = await db.query(checkTakenQuery, [
      childId,
      vaccineId,
    ]);

    if (checkTakenResult.rows.length > 0) {
      return res.status(400).json({
        error: "This vaccine has already been administered to the child.",
      });
    }

    // Update the vaccination record
    const updateRecordQuery = `
      UPDATE VaccinationRecords 
      SET date_administered = $1, batch_number = $2, next_appointment_date = $3, administered_by = $4, taken = TRUE 
      WHERE child_id = $5 AND vaccine_id = $6 
      RETURNING *;
    `;
    const updateRecordResult = await db.query(updateRecordQuery, [
      dateAdministered,
      batchNumber,
      nextAppointmentDate,
      administeredBy,
      childId,
      vaccineId,
    ]);

    res.json(updateRecordResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
