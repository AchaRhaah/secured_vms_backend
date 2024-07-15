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
const restockVaccineController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { vaccineId, quantity, batchNumber, expiryDate } = req.body;
        if (!vaccineId ||
            !quantity ||
            quantity <= 0 ||
            !batchNumber ||
            !expiryDate) {
            return res.status(400).json({
                error: "Vaccine ID, quantity, batch number, and expiry date are required.",
            });
        }
        const vaccineQuery = `SELECT id FROM Vaccines WHERE id = $1`;
        const vaccineResult = yield db_1.default.query(vaccineQuery, [vaccineId]);
        if (vaccineResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid vaccine ID." });
        }
        const restockInventoryQuery = `
      INSERT INTO VaccineRestock (vaccine_id, restock_quantity, restock_date)
      VALUES ($1, $2, CURRENT_DATE)
      RETURNING *;
    `;
        const restockInventoryResult = yield db_1.default.query(restockInventoryQuery, [
            vaccineId,
            quantity,
        ]);
        const insertInventoryQuery = `
      INSERT INTO VaccineInventory (vaccine_id, quantity, batch_number, expiry_date)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (vaccine_id) DO NOTHING
      RETURNING *;
    `;
        const insertInventoryResult = yield db_1.default.query(insertInventoryQuery, [
            vaccineId,
            quantity,
            batchNumber,
            expiryDate,
        ]);
        let inventoryResult;
        if (insertInventoryResult.rows.length === 0) {
            // If insert did not occur due to conflict, update the existing row
            const updateInventoryQuery = `
        UPDATE VaccineInventory
        SET quantity = quantity + $2, batch_number = $3, expiry_date = $4
        WHERE vaccine_id = $1
        RETURNING *;
      `;
            inventoryResult = yield db_1.default.query(updateInventoryQuery, [
                vaccineId,
                quantity,
                batchNumber,
                expiryDate,
            ]);
        }
        else {
            inventoryResult = insertInventoryResult;
        }
        res.json({
            restock: restockInventoryResult.rows[0],
            // inventory: inventoryResult.rows[0],
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});
exports.restockVaccineController = restockVaccineController;
