// Import necessary modules
import { Request, Response } from "express";
import db from "../../db";

// Endpoint for getting the number of children vaccinated per vaccine for all vaccines in a month
export const getAllVaccinesMonthlyReport = async (
  req: Request,
  res: Response
) => {
  try {
    const { month } = req.params;

    // Fetch data for the monthly vaccine report for all vaccines
    const allVaccinesMonthlyReportQuery = `
      SELECT 
        v.name AS vaccine_name,
        COALESCE(SUM(d.usage_count), 0) AS total_children_vaccinated
      FROM Vaccines AS v
      LEFT JOIN DailyVaccineUsage AS d ON v.id = d.vaccine_id AND EXTRACT(MONTH FROM d.date) = $1
      GROUP BY v.name, d.date
      ORDER BY v.name, d.date;
    `;
    const allVaccinesMonthlyReportResult = await db.query(
      allVaccinesMonthlyReportQuery,
      [month]
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
