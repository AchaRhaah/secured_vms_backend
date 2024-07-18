import { Request, Response } from "express";
import db from "../../db";

export const getWeeklyVaccineReport = async (req: Request, res: Response) => {
  try {
    const { vaccineId } = req.params;
    const { weekNumber } = req.query;
    const parsedWeekNumber = parseInt(weekNumber as string, 10);

    if (
      isNaN(parsedWeekNumber) ||
      parsedWeekNumber < 1 ||
      parsedWeekNumber > 53
    ) {
      return res.status(400).json({ error: "Invalid week number parameter" });
    }

    // Calculate the initial stock before the given week
    const initialStockQuery = `
      SELECT vr.restock_quantity AS initial_stock
      FROM VaccineRestock vr
      LEFT JOIN DailyVaccineUsage dv ON vr.vaccine_id = dv.vaccine_id AND vr.restock_date = dv.date
      WHERE vr.vaccine_id = $1 AND EXTRACT(WEEK FROM vr.restock_date) < $2
    `;

    const initialStockResult = await db.query(initialStockQuery, [
      vaccineId,
      parsedWeekNumber,
    ]);

    const initialStock = initialStockResult.rows[0]?.initial_stock || 0;

    // Get daily restock and usage data for the given week
    const weeklyReportQuery = `
  WITH DailyReport AS (
    SELECT 
      d.date::date,
      COALESCE(SUM(vr.restock_quantity), 0) AS total_restock_quantity,
      vi.batch_number AS batch_number,
      vi.expiry_date,
      COALESCE(SUM(d.usage_count), 0) AS usage_count,
      vi.vvm AS vvm
    FROM (
      SELECT 
        date::date,
        vaccine_id,
        SUM(usage_count) AS usage_count
      FROM DailyVaccineUsage
      WHERE vaccine_id = $1 AND EXTRACT(WEEK FROM date) = $2
      GROUP BY date::date, vaccine_id  -- Ensure date::date is included in GROUP BY
    ) AS d
    LEFT JOIN VaccineInventory AS vi ON d.vaccine_id = vi.vaccine_id
    LEFT JOIN VaccineRestock AS vr ON d.date::date = vr.restock_date AND d.vaccine_id = vr.vaccine_id
    WHERE d.vaccine_id = $1
    GROUP BY d.date::date, vi.batch_number, vi.expiry_date, vi.vvm  -- Ensure all non-aggregated columns are in GROUP BY
  ),
  CumulativeBalance AS (
    SELECT
      date,
      total_restock_quantity,
      batch_number,
      expiry_date,
      usage_count,
      vvm,
      $3 + SUM(total_restock_quantity - usage_count) OVER(ORDER BY date) AS balance
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
    balance AS quantity
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
