"use strict";
// src/controllers/vaccineIncidentController.ts
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
exports.reportVaccineIncident = void 0;
const db_1 = __importDefault(require("../../db"));
const reportVaccineIncident = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vaccineId, incidentType, description, quantity, childID } = req.body;
        if (!vaccineId || !incidentType) {
            return res
                .status(400)
                .json({ error: "Vaccine ID and incident type are required." });
        }
        // Check if the incident type is valid
        if (incidentType !== "expiration" &&
            incidentType !== "side_effect" &&
            incidentType !== "other") {
            return res.status(400).json({ error: "Invalid incident type." });
        }
        // Store the incident in the database
        const insertIncidentQuery = `
            INSERT INTO VaccineIncidents (vaccine_id, incident_type, description)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const insertedIncident = yield db_1.default.query(insertIncidentQuery, [
            vaccineId,
            incidentType,
            description,
        ]);
        // Perform actions based on the incident type
        if (incidentType === "expiration") {
            // Deduct the number of expired vaccines from inventory
            const deductExpiredVaccinesQuery = `
        UPDATE VaccineInventory
        SET quantity = quantity - $1
        WHERE vaccine_id = $2;
      `;
            const deduction = yield db_1.default.query(deductExpiredVaccinesQuery, [
                quantity,
                vaccineId,
            ]);
            res.status(200).json(deduction.rows[0]);
        }
        res.status(200).json({
            message: "Vaccine incident reported successfully.",
            incident: insertedIncident.rows[0],
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }
});
exports.reportVaccineIncident = reportVaccineIncident;
