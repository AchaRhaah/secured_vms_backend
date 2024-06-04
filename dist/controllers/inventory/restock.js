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
exports.restockVaccineController = void 0;
const db_1 = __importDefault(require("../../db"));
// Restock Vaccine Controller
const restockVaccineController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vaccineId, quantity } = req.body;
        // Check if all required fields are present
        if (!vaccineId || !quantity || quantity <= 0) {
            return res
                .status(400)
                .json({ error: "Vaccine ID and valid quantity are required." });
        }
        // Check if the vaccine ID exists
        const vaccineQuery = `SELECT id FROM Vaccines WHERE id = $1`;
        const vaccineResult = yield db_1.default.query(vaccineQuery, [vaccineId]);
        if (vaccineResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid vaccine ID." });
        }
        // Update the vaccine inventory
        const restockInventoryQuery = `
      UPDATE VaccineInventory
      SET quantity = quantity + $1, restock = restock
      WHERE vaccine_id = $2
      RETURNING *;
    `;
        const restockInventoryResult = yield db_1.default.query(restockInventoryQuery, [
            quantity,
            vaccineId,
        ]);
        res.json(restockInventoryResult.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
exports.restockVaccineController = restockVaccineController;
