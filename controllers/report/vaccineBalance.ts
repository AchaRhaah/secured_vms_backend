// Import necessary modules
import { Request, Response } from "express";
import db from "../../db";

// Endpoint for getting the balance of every vaccine in the inventory
export const getVaccineInventoryBalance = async (
  req: Request,
  res: Response
) => {
  try {
    // Fetch data for the balance of every vaccine in the inventory
    const balanceQuery = `
      SELECT 
        v.name AS vaccine_name,
        vi.quantity AS balance
      FROM VaccineInventory AS vi
      INNER JOIN Vaccines AS v ON vi.vaccine_id = v.id;
    `;
    const balanceResult = await db.query(balanceQuery);

    res.json(balanceResult.rows);
  } catch (error) {
    console.error("Error fetching vaccine inventory balance:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
