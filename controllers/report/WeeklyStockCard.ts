import { Request, Response } from "express";
import db from "../../db";

export const getWeeklyVaccineReport = async (req: Request, res: Response) => {
  try {
    const { vaccineId } = req.params;
    const { weekNumber } = req.query;
    const parsedWeekNumber = parseInt(weekNumber as string, 10);

    // Query to calculate initial stock before the given week
    const initialStockQuery = `
      SELECT COALESCE(SUM(vr.restock_quantity - COALESCE(dv.usage_count, 0)), 0) AS initial_stock
      FROM VaccineRestock vr
      LEFT JOIN DailyVaccineUsage dv ON vr.vaccine_id = dv.vaccine_id AND vr.restock_date = dv.date
      WHERE vr.vaccine_id = $1 AND EXTRACT(WEEK FROM vr.restock_date) < $2
    `;

    const initialStockResult = await db.query(initialStockQuery, [
      vaccineId,
      parsedWeekNumber,
    ]);

    const initialStock = initialStockResult.rows[0].initial_stock;

    // Query to get daily restock and usage data for the given week
    const weeklyReportQuery = `
      WITH DailyReport AS (
        SELECT 
          to_char(d.date, 'YYYY-MM-DD') AS date,
          COALESCE(SUM(COALESCE(vr.restock_quantity::numeric, 0)), 0) AS total_restock_quantity,
          vi.batch_number AS batch_number,
          to_char(vi.expiry_date, 'YYYY-MM-DD') AS expiry_date,
          COALESCE(SUM(COALESCE(d.usage_count::numeric, 0)), 0) AS usage_count,
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
        GROUP BY d.date, vi.batch_number, vi.expiry_date, vi.vvm
      ),
      CumulativeBalance AS (
        SELECT
          date,
          total_restock_quantity,
          batch_number,
          expiry_date,
          usage_count,
          vvm,
          $3 + SUM(total_restock_quantity - usage_count) OVER(ORDER BY date ASC) AS balance
        FROM DailyReport
      )
      SELECT
        date,
        total_restock_quantity AS restock_quantity,
        batch_number,
        expiry_date,
        usage_count,
        vvm,
        LAG(balance, 1, $3) OVER (ORDER BY date) AS starting_amount,
        balance AS quantity,
        balance
      FROM CumulativeBalance
      ORDER BY date ASC;
    `;

    const weeklyReportResult = await db.query(weeklyReportQuery, [
      vaccineId,
      parsedWeekNumber,
      initialStock,
    ]);

    res.json(weeklyReportResult.rows);
  } catch (error) {
    console.error("Error fetching weekly vaccine report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
