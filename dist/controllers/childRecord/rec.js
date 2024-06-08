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
exports.getChildVaccinationRecords = exports.getChildrenUnderGuardian = void 0;
const db_1 = __importDefault(require("../../db"));
// Get all children under the logged-in guardian
const getChildrenUnderGuardian = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    try {
        const childrenQuery = `
      SELECT id, name, gender, date_of_birth, mother_name, mother_phone_number, father_name, father_phone_number, place_of_birth, weight_at_birth
      FROM Children
      WHERE guardian_id = $1
    `;
        const { rows: children } = yield db_1.default.query(childrenQuery, [userId]);
        res.json(children);
    }
    catch (error) {
        console.error("Error fetching children:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getChildrenUnderGuardian = getChildrenUnderGuardian;
// Get vaccination records for a specific child under the logged-in guardian
const getChildVaccinationRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.user;
    const { childId } = req.params;
    try {
        const guardianCheckQuery = `
      SELECT id FROM Children WHERE id = $1 AND guardian_id = $2
    `;
        const { rows: guardianCheck } = yield db_1.default.query(guardianCheckQuery, [
            childId,
            userId,
        ]);
        if (guardianCheck.length === 0) {
            return res
                .status(403)
                .json({ error: "You do not have access to this child's records" });
        }
        const vaccinationRecordsQuery = `
      SELECT VaccinationRecords.id, vaccine_id, date_administered, batch_number, next_appointment_date, administered_by, Vaccines.name as vaccine_name, Vaccines.disease
      FROM VaccinationRecords
      INNER JOIN Vaccines ON VaccinationRecords.vaccine_id = Vaccines.id
      WHERE child_id = $1
    `;
        const { rows: vaccinationRecords } = yield db_1.default.query(vaccinationRecordsQuery, [childId]);
        res.json(vaccinationRecords);
    }
    catch (error) {
        console.error("Error fetching vaccination records:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.getChildVaccinationRecords = getChildVaccinationRecords;
