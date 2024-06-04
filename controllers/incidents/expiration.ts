// src/controllers/vaccineIncidentController.ts

import { Request, Response } from "express";
import db from "../../db";

export const reportVaccineIncident = async (req: Request, res: Response) => {
  try {
    const { vaccineId, incidentType } = req.body;

    if (!vaccineId || !incidentType) {
      return res
        .status(400)
        .json({ error: "Vaccine ID and incident type are required." });
    }

    // Check if the incident type is valid

    // Perform actions based on the incident type
    if (incidentType === "expiration") {
      // Deduct the number of expired vaccines from inventory
      const deductExpiredVaccinesQuery = `
        UPDATE VaccineInventory
        SET quantity = quantity - 1
        WHERE vaccine_id = $1;
      `;
      await db.query(deductExpiredVaccinesQuery, [vaccineId]);
    }

    // Log the incident in the database or perform other actions based on the incident type

    res
      .status(200)
      .json({ message: "Vaccine incident reported successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
};
