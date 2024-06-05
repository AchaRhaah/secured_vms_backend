// src/controllers/vaccineIncidentController.ts

import { Request, Response } from "express";
import db from "../../db";

export const reportVaccineIncident = async (req: Request, res: Response) => {
  try {
    const { vaccineId, incidentType, description, quantity } = req.body;

    if (!vaccineId || !incidentType) {
      return res
        .status(400)
        .json({ error: "Vaccine ID and incident type are required." });
    }

    // Check if the incident type is valid
    if (
      incidentType !== "expiration" &&
      incidentType !== "side_effect" &&
      incidentType !== "other"
    ) {
      return res.status(400).json({ error: "Invalid incident type." });
    }

    const checkQuantityQuery = `
    SELECT quantity
    FROM VaccineInventory
    WHERE vaccine_id = $1;
  `;
    const quantityResult = await db.query(checkQuantityQuery, [vaccineId]);

    if (quantityResult.rows.length === 0) {
      return res.status(400).json({ error: "Vaccine not found." });
    }

    // Store the incident in the database
    const insertIncidentQuery = `
            INSERT INTO VaccineIncidents (vaccine_id, incident_type, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
    const insertedIncident = await db.query(insertIncidentQuery, [
      vaccineId,
      incidentType,
      description,
    ]);

    // Perform actions based on the incident type
    if (incidentType === "expiration") {
      if (quantityResult.rows[0].quantity < 1) {
        return res.status(400).json({ error: "Vaccine is out of stock." });
      } else {
        // Deduct the number of expired vaccines from inventory
        const deductExpiredVaccinesQuery = `
        UPDATE VaccineInventory
        SET quantity = quantity - $1
        WHERE vaccine_id = $2
        RETURNING *;
      `;
        const deduction = await db.query(deductExpiredVaccinesQuery, [
          quantity,
          vaccineId,
        ]);

        // Check if deduction was successful
        if (deduction.rows.length === 0) {
          return res.status(400).json({ error: "Failed to update inventory." });
        }

        return res.status(200).json({
          message:
            "Vaccine incident reported and inventory updated successfully.",
          incident: insertedIncident.rows[0],
          updatedInventory: deduction.rows[0],
        });
      }
    }

    res.status(200).json({
      message: "Vaccine incident reported successfully.",
      incident: insertedIncident.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};
