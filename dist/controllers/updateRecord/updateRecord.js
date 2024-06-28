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
        const { childId, vaccineId, isBooster = false, // New field for booster
         } = req.body;
        const token = req.cookies.token;
        if (!token) {
            return res
                .status(401)
                .json({ error: "Authorization header is missing." });
        }
        const dateAdministered = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
        const decodedToken = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Extracting userId and name from decoded token
        const { userId } = decodedToken;
        // Retrieve staff ID from JWT payload
        const userQuery = `
      SELECT v.id as vaccination_staff_id
      FROM Users u
      JOIN VaccinationStaff v ON u.id = v.user_id
      WHERE u.id = $1
    `;
        const userResult = yield db_1.default.query(userQuery, [userId]);
        if (userResult.rows.length === 0 ||
            !userResult.rows[0].vaccination_staff_id) {
            return res
                .status(400)
                .json({ error: "User is not associated with any vaccination staff." });
        }
        const administeredBy = userResult.rows[0].vaccination_staff_id;
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
        // Retrieve batch number for the vaccine
        const batchNumberQuery = `
      SELECT batch_number
      FROM VaccineInventory
      WHERE vaccine_id = $1
      LIMIT 1;
    `;
        const batchNumberResult = yield db_1.default.query(batchNumberQuery, [vaccineId]);
        if (batchNumberResult.rows.length === 0) {
            return res
                .status(400)
                .json({ error: "No batch number found for this vaccine." });
        }
        const batchNumber = batchNumberResult.rows[0].batch_number;
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
        // Deduct from vaccine inventory
        const deductions = yield (0, deduction_1.deductVaccineInventoryController)(vaccineId);
        if (deductions.error) {
            return res.status(400).json({ error: deductions.error });
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
      UPDATE VaccinationRecords 
      SET date_administered = $1, batch_number = $2, next_appointment_date = $3, administered_by = $4, is_booster = $5, taken = TRUE
      WHERE child_id = $6 AND vaccine_id = $7
      RETURNING *;
    `;
        const updateRecordResult = yield db_1.default.query(updateRecordQuery, [
            dateAdministered,
            batchNumber,
            nextAppointment,
            administeredBy,
            isBooster,
            childId,
            vaccineId,
        ]);
        if (updateRecordResult.rows.length === 0) {
            return res
                .status(500)
                .json({ error: "Failed to update vaccination record." });
        }
        const updatedRecord = updateRecordResult.rows[0];
        res.json(updatedRecord);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
exports.updateVaccinationRecordController = updateVaccinationRecordController;
