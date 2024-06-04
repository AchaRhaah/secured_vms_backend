import { Request, Response } from "express";
import db from "../../db";

// Restock Vaccine Controller
export const restockVaccineController = async (req: Request, res: Response) => {
  try {
    const { vaccineId, quantity } = req.body;

    // Check if all required fields are present
    if (!vaccineId || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "Vaccine ID and valid quantity are required." });
    }

    // Check if the vaccine ID exists
    const vaccineQuery = `SELECT id FROM Vaccines WHERE id = $1`;
    const vaccineResult = await db.query(vaccineQuery, [vaccineId]);
    if (vaccineResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid vaccine ID." });
    }

    // Update the vaccine inventory
    const restockInventoryQuery = `
      UPDATE VaccineInventory
      SET quantity = quantity + $1, restock = restock
      WHERE vaccine_id = $2
      RETURNING *;
    `;
    const restockInventoryResult = await db.query(restockInventoryQuery, [
      quantity,
      vaccineId,
    ]);

    res.json(restockInventoryResult.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
