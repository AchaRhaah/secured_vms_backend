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
exports.getChildrenVaccinatedByVaccine = void 0;
const db_1 = __importDefault(require("../../db")); // adjust the path according to your project structure
const getChildrenVaccinatedByVaccine = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vaccineId } = req.params;
        // Query to get all children vaccinated by the specified vaccine
        const query = `
      SELECT
        c.id AS child_id,
        c.name AS child_name,
        c.gender AS child_gender,
        vr.date_administered,
        vr.batch_number
      FROM VaccinationRecords vr
      JOIN Children c ON vr.child_id = c.id
      JOIN Guardians g ON c.guardian_id = g.id
      WHERE vr.vaccine_id = $1 AND vr.taken = true
      ORDER BY vr.date_administered DESC;
    `;
        const result = yield db_1.default.query(query, [vaccineId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching children vaccinated by vaccine:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getChildrenVaccinatedByVaccine = getChildrenVaccinatedByVaccine;
