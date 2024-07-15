import { Request, Response } from "express";
import db from "../../db";

export const getAllVaccinesMonthlyReport = async (
  req: Request,
  res: Response
) => {
  try {
    const { month } = req.params;
    // Ensure month is an integer between 1 and 12
    const monthInt = parseInt(month, 10);
    if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return res.status(400).json({ error: "Invalid month parameter" });
    }

    // Fetch data for the monthly vaccine report for all vaccines
    const allVaccinesMonthlyReportQuery = `
      SELECT 
        v.name AS vaccine_name,
        COALESCE(SUM(vi.children_vaccinated), 0) AS total_children_vaccinated,
        COALESCE(SUM(vi.quantity), 0) AS balance,
        vi.expiry_date
      FROM Vaccines AS v
      LEFT JOIN VaccineInventory AS vi 
        ON v.id = vi.vaccine_id 
      LEFT JOIN DailyVaccineUsage AS d
        ON v.id = d.vaccine_id 
        AND EXTRACT(MONTH FROM d.date) = $1
        AND EXTRACT(YEAR FROM d.date) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY v.name, vi.expiry_date
      ORDER BY v.name;
    `;

    const allVaccinesMonthlyReportResult = await db.query(
      allVaccinesMonthlyReportQuery,
      [monthInt]
    );

    res.json(allVaccinesMonthlyReportResult.rows);
  } catch (error) {
    console.error(
      "Error fetching monthly vaccine report for all vaccines:",
      error
    );
    res.status(500).json({ error: "Internal server error" });
  }
};
