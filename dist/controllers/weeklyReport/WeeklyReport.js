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
        const weeklyReportResult = yield db_1.default.query(weeklyReportQuery, [
            vaccineId,
            weekNumber,
        ]);
        res.json(weeklyReportResult.rows);
    }
    catch (error) {
        console.error("Error fetching weekly vaccine report:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getWeeklyVaccineReport = getWeeklyVaccineReport;
