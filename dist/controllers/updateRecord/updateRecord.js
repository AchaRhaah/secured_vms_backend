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
const updateVaccinationRecordController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { childId, vaccineId, dateAdministered, batchNumber, nextAppointmentDate, administeredBy, } = req.body;
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
        // Check if the child has already taken the vaccine
        const checkTakenQuery = `SELECT * FROM VaccinationRecords WHERE child_id = $1 AND vaccine_id = $2 AND taken = TRUE`;
        const checkTakenResult = yield db_1.default.query(checkTakenQuery, [
            childId,
            vaccineId,
        ]);
        if (checkTakenResult.rows.length > 0) {
            return res.status(400).json({
                error: "This vaccine has already been administered to the child.",
            });
        }
        // Update the vaccination record
        const updateRecordQuery = `
      UPDATE VaccinationRecords 
      SET date_administered = $1, batch_number = $2, next_appointment_date = $3, administered_by = $4, taken = TRUE 
      WHERE child_id = $5 AND vaccine_id = $6 
      RETURNING *;
    `;
        const updateRecordResult = yield db_1.default.query(updateRecordQuery, [
            dateAdministered,
            batchNumber,
            nextAppointmentDate,
            administeredBy,
            childId,
            vaccineId,
        ]);
        // Update the vaccine inventory
        const updateInventoryQuery = `
      UPDATE VaccineInventory
      SET quantity = quantity - 1, daily_usage = daily_usage + 1, children_vaccinated = children_vaccinated + 1
      WHERE vaccine_id = $1;
    `;
        yield db_1.default.query(updateInventoryQuery, [vaccineId]);
        res.json(updateRecordResult.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
exports.updateVaccinationRecordController = updateVaccinationRecordController;
