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
exports.getWeeklyVaccineReport = void 0;
const db_1 = __importDefault(require("../../db"));
const getWeeklyVaccineReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vaccineId } = req.params;
        const { weekNumber } = req.query;
        const parsedWeekNumber = parseInt(weekNumber, 10);
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
        const weeklyReportResult = yield db_1.default.query(weeklyReportQuery, [
            vaccineId,
            parsedWeekNumber,
        ]);
        res.json(weeklyReportResult.rows);
    }
    catch (error) {
        console.error("Error fetching weekly vaccine report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getWeeklyVaccineReport = getWeeklyVaccineReport;
