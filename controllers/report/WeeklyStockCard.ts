import { Request, Response } from "express";
import db from "../../db";

export const getWeeklyVaccineReport = async (req: Request, res: Response) => {
  try {
    const { vaccineId } = req.params;
    const { weekNumber } = req.query;
    const parsedWeekNumber = parseInt(weekNumber as string, 10);

    const weeklyReportQuery = `
      WITH DailyReport AS (
        SELECT 
          d.date AS date,
          COALESCE(SUM(vr.restock_quantity), 0) AS total_restock_quantity,
          vi.batch_number AS batch_number,
          vi.expiry_date AS expiry_date,
          COALESCE(d.usage_count, 0) AS usage_count,
          vi.vvm AS vvm
        FROM (
          SELECT 
            date_trunc('day', date)::date AS date,
            vaccine_id,
            SUM(usage_count) AS usage_count
          FROM DailyVaccineUsage
          WHERE EXTRACT(WEEK FROM date) = $2
          GROUP BY date_trunc('day', date)::date, vaccine_id
        ) AS d
        LEFT JOIN VaccineInventory AS vi ON d.vaccine_id = vi.vaccine_id
        LEFT JOIN VaccineRestock AS vr ON d.date = vr.restock_date AND d.vaccine_id = vr.vaccine_id
        WHERE d.vaccine_id = $1
        GROUP BY d.date, vi.batch_number, vi.expiry_date, d.usage_count, vi.vvm
      )
      SELECT 
        date,
        total_restock_quantity AS restock_quantity,
        batch_number,
        expiry_date,
        usage_count,
        vvm,
        SUM(total_restock_quantity - usage_count) OVER(ORDER BY date ASC) AS quantity,
        SUM(total_restock_quantity - usage_count) OVER(ORDER BY date ASC) AS balance
      FROM DailyReport
      ORDER BY date ASC;
    `;

    const weeklyReportResult = await db.query(weeklyReportQuery, [
      vaccineId,
      parsedWeekNumber,
    ]);

    res.json(weeklyReportResult.rows);
  } catch (error) {
    console.error("Error fetching weekly vaccine report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
