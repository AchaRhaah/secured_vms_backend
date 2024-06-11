import { Request, Response } from "express";
import db from "../../db";

export const getWeeklyVaccineReport = async (req: Request, res: Response) => {
  try {
    const { vaccineId } = req.params;
    const { weekNumber } = req.query;

    // Fetch data for the weekly vaccine report
    const weeklyReportQuery = `
      SELECT 
        d.date AS date,
        vr.restock_quantity AS restock_quantity,
        vi.batch_number AS batch_number,
        vi.expiry_date AS expiry_date,
        d.usage_count AS usage_count,
        vi.quantity AS quantity,
        vi.vvm AS vvm
      FROM DailyVaccineUsage AS d
      LEFT JOIN VaccineInventory AS vi ON d.vaccine_id = vi.vaccine_id
      LEFT JOIN VaccineRestock AS vr ON d.date = vr.restock_date AND d.vaccine_id = vr.vaccine_id
      WHERE d.vaccine_id = $1 AND EXTRACT(WEEK FROM d.date) = $2
      ORDER BY d.date DESC
      LIMIT 7;
    `;
    const weeklyReportResult = await db.query(weeklyReportQuery, [
      vaccineId,
      weekNumber,
    ]);

    res.json(weeklyReportResult.rows);
  } catch (error) {
    console.error("Error fetching weekly vaccine report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
