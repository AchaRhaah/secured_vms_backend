"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllVaccinesMonthlyReport = void 0;
const db_1 = __importDefault(require("../../db"));
const getAllVaccinesMonthlyReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { month } = req.params;
        // Ensure month is an integer between 1 and 12
        const monthInt = parseInt(month, 10);
        if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
            return res.status(400).json({ error: "Invalid month parameter" });
        }
        // Fetch data for the monthly vaccine report for all vaccines
        const allVaccinesMonthlyReportQuery = `
      WITH usage AS (
        SELECT 
          vaccine_id,
          COALESCE(SUM(usage_count), 0) AS total_usage
        FROM DailyVaccineUsage
        WHERE EXTRACT(MONTH FROM date) = $1
          AND EXTRACT(YEAR FROM date) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY vaccine_id
      ),
      restock AS (
        SELECT 
          vaccine_id,
          COALESCE(SUM(restock_quantity), 0) AS total_restock
        FROM VaccineRestock
        WHERE EXTRACT(MONTH FROM restock_date) = $1
          AND EXTRACT(YEAR FROM restock_date) = EXTRACT(YEAR FROM CURRENT_DATE)
        GROUP BY vaccine_id
      )
      SELECT 
        v.id AS vaccine_id,
        v.name AS vaccine_name,
        COALESCE(SUM(vi.children_vaccinated), 0) AS total_children_vaccinated,
        vi.quantity AS balance,
        vi.expiry_date
      FROM Vaccines AS v
      LEFT JOIN VaccineInventory AS vi ON v.id = vi.vaccine_id 
      LEFT JOIN usage u ON v.id = u.vaccine_id
      LEFT JOIN restock r ON v.id = r.vaccine_id
      GROUP BY v.id, v.name, vi.quantity, vi.expiry_date, u.total_usage, r.total_restock
      ORDER BY v.id;
    `;
        const allVaccinesMonthlyReportResult = yield db_1.default.query(allVaccinesMonthlyReportQuery, [monthInt]);
        res.json(allVaccinesMonthlyReportResult.rows);
    }
    catch (error) {
        console.error("Error fetching monthly vaccine report for all vaccines:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getAllVaccinesMonthlyReport = getAllVaccinesMonthlyReport;
