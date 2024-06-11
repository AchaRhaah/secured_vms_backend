import { Request, Response } from "express";
import db from "../../db";

// Restock Vaccine Controller
export const restockVaccineController = async (req: Request, res: Response) => {
  try {
    const { vaccineId, quantity, batchNumber, expiryDate } = req.body;

    // Check if all required fields are present
    if (
      !vaccineId ||
      !quantity ||
      quantity <= 0 ||
      !batchNumber ||
      !expiryDate
    ) {
      return res.status(400).json({
        error:
          "Vaccine ID, quantity, batch number, and expiry date are required.",
      });
    }

    // Check if the vaccine ID exists
    const vaccineQuery = `SELECT id FROM Vaccines WHERE id = $1`;
    const vaccineResult = await db.query(vaccineQuery, [vaccineId]);
    if (vaccineResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid vaccine ID." });
    }

    // Insert a new entry into the VaccineRestock table with the restock date
    const restockInventoryQuery = `
      INSERT INTO VaccineRestock (vaccine_id, restock_quantity, restock_date)
      VALUES ($1, $2, CURRENT_DATE)
      RETURNING *;
    `;
    const restockInventoryResult = await db.query(restockInventoryQuery, [
      vaccineId,
      quantity,
    ]);

    // Update the total quantity in the VaccineInventory table and add batch number and expiry date
    const updateInventoryQuery = `
      INSERT INTO VaccineInventory (vaccine_id, quantity, batch_number, expiry_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (vaccine_id) DO UPDATE
      SET quantity = VaccineInventory.quantity + $2, batch_number = $3, expiry_date = $4
      RETURNING *;
    `;
    const updateInventoryResult = await db.query(updateInventoryQuery, [
      vaccineId,
      quantity,
      batchNumber,
      expiryDate,
    ]);
    //

    res.json({
      restock: restockInventoryResult.rows[0],
      inventory: updateInventoryResult.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};
