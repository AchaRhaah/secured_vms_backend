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
exports.reportSideEffectController = void 0;
const db_1 = __importDefault(require("../../db"));
const reportSideEffectController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { childId, vaccineId, reportedBy, sideEffectDescription } = req.body;
        // Check if all required fields are present
        if (!childId || !vaccineId || !reportedBy || !sideEffectDescription) {
            return res.status(400).json({ error: "All fields are required." });
        }
        // Check if the child ID exists
        const childQuery = `SELECT id FROM Children WHERE id = $1`;
        const childResult = yield db_1.default.query(childQuery, [childId]);
        if (childResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid child ID." });
        }
        // Check if the vaccine ID exists
        const vaccineQuery = `SELECT id FROM Vaccines WHERE id = $1`;
        const vaccineResult = yield db_1.default.query(vaccineQuery, [vaccineId]);
        if (vaccineResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid vaccine ID." });
        }
        // Check if the reported_by ID exists in the Guardians table
        const guardianQuery = `SELECT id FROM Guardians WHERE id = $1`;
        const guardianResult = yield db_1.default.query(guardianQuery, [reportedBy]);
        if (guardianResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid reported_by ID." });
        }
        // Insert the side effect report into the database
        const insertSideEffectQuery = `
      INSERT INTO SideEffects (child_id, vaccine_id, reported_by, side_effect_description)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
        const insertSideEffectResult = yield db_1.default.query(insertSideEffectQuery, [
            childId,
            vaccineId,
            reportedBy,
            sideEffectDescription,
        ]);
        res.json(insertSideEffectResult.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
exports.reportSideEffectController = reportSideEffectController;
