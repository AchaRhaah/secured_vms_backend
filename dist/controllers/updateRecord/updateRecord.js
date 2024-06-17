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
exports.updateVaccinationRecordController = void 0;
const db_1 = __importDefault(require("../../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const deduction_1 = require("../inventory/deduction");
const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";
const updateVaccinationRecordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { childId, vaccineId, dateAdministered, batchNumber, nextAppointmentDate, administeredBy, isBooster = false, // New field for booster
         } = req.body;
        const token = req.cookies.token;
        if (!token) {
            return res
                .status(401)
                .json({ error: "Authorization header is missing." });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const { userId, name } = decodedToken;
        // Check if all required fields are present
        if (!childId ||
            !vaccineId ||
            !dateAdministered ||
            !batchNumber ||
            !nextAppointmentDate ||
            !administeredBy) {
            return res.status(400).json({ error: "All fields are required." });
        }
        // Check if the administered_by ID exists in the VaccinationStaff table
        const staffQuery = `SELECT id FROM VaccinationStaff WHERE id = $1`;
        const staffResult = yield db_1.default.query(staffQuery, [administeredBy]);
        if (staffResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid administered_by ID." });
        }
        // Check if the child is eligible for the vaccine
        const vaccineQuery = `SELECT eligible_age FROM Vaccines WHERE id = $1`;
        const vaccineResult = yield db_1.default.query(vaccineQuery, [vaccineId]);
        if (vaccineResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid vaccine ID." });
        }
        const vaccine = vaccineResult.rows[0];
        const childQuery = `SELECT date_of_birth FROM Children WHERE id = $1`;
        const childResult = yield db_1.default.query(childQuery, [childId]);
        if (childResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid child ID." });
        }
        const child = childResult.rows[0];
        const dateOfBirth = new Date(child.date_of_birth);
        const today = new Date();
        const yearsDifference = today.getFullYear() - dateOfBirth.getFullYear();
        const monthsDifference = today.getMonth() - dateOfBirth.getMonth();
        const childAgeInMonths = yearsDifference * 12 + monthsDifference;
        if (childAgeInMonths < vaccine.eligible_age) {
            return res
                .status(400)
                .json({ error: "Child is not eligible for this vaccine yet." });
        }
        // Deduct from vaccine inventory
        const deductions = yield (0, deduction_1.deductVaccineInventoryController)(vaccineId);
        if (deductions.error) {
            return res.status(400).json({ error: deductions.error });
        }
        // Check if the child has already taken the vaccine
        const checkTakenQuery = `SELECT * FROM VaccinationRecords WHERE child_id = $1 AND vaccine_id = $2 AND taken = TRUE`;
        const checkTakenResult = yield db_1.default.query(checkTakenQuery, [
            childId,
            vaccineId,
        ]);
        if (isBooster) {
            // Ensure the child has already taken the initial dose before allowing a booster
            if (checkTakenResult.rows.length === 0) {
                return res.status(400).json({
                    error: "The child must have taken the initial dose before receiving a booster.",
                });
            }
        }
        else {
            if (checkTakenResult.rows.length > 0) {
                return res.status(400).json({
                    error: "This vaccine has already been administered to the child.",
                });
            }
        }
        // Find the next appointment date for the child and vaccine
        const nextAppointmentQuery = `
      SELECT * FROM VaccinationAppointments WHERE child_id = $1 AND appointment_date > CURRENT_DATE
      ORDER BY appointment_date ASC
      LIMIT 1;
    `;
        const nextAppointmentResult = yield db_1.default.query(nextAppointmentQuery, [
            childId,
        ]);
        let nextAppointment = null;
        if (nextAppointmentResult.rows.length > 0) {
            nextAppointment = nextAppointmentResult.rows[0].appointment_date;
        }
        // Update the vaccination record
        const updateRecordQuery = `
      INSERT INTO VaccinationRecords 
      (child_id, vaccine_id, date_administered, batch_number, next_appointment_date, administered_by, taken, eligible, is_booster) 
      VALUES ($1, $2, $3, $4, $5, $6, TRUE, TRUE, $7)
      RETURNING *;
    `;
        const updateRecordResult = yield db_1.default.query(updateRecordQuery, [
            childId,
            vaccineId,
            dateAdministered,
            batchNumber,
            nextAppointment,
            administeredBy,
            isBooster,
        ]);
        res.json(updateRecordResult.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
exports.updateVaccinationRecordController = updateVaccinationRecordController;
