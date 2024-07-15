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
      incidentType !== "side effect" &&
      incidentType !== "other"
    ) {
      return res.status(400).json({ error: "Invalid incident type." });
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
      // Deduct the number of expired vaccines from inventory

      // Check if deduction was successful

      return res.status(200).json({
        incident: insertedIncident.rows[0],
      });
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
