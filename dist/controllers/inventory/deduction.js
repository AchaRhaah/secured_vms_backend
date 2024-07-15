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
exports.deductVaccineInventoryController = void 0;
const db_1 = __importDefault(require("../../db"));
const deductVaccineInventoryController = (vaccineId) => __awaiter(void 0, void 0, void 0, function* () {
    const checkQuantityQuery = `
    SELECT quantity
    FROM VaccineInventory
    WHERE vaccine_id = $1;
  `;
    const updateInventoryQuery = `
    UPDATE VaccineInventory
    SET 
      quantity = quantity - 1
    WHERE vaccine_id = $1
    RETURNING *;
  `;
    const currentDate = new Date().toISOString().split("T")[0];
    try {
        const quantityResult = yield db_1.default.query(checkQuantityQuery, [vaccineId]);
        if (quantityResult.rows.length === 0) {
            return { error: "Vaccine not found." };
        }
        const currentQuantity = quantityResult.rows[0].quantity;
        console.log("current quantity:", currentQuantity);
        if (currentQuantity < 1) {
            return { error: "Vaccine is out of stock." };
        }
        const result = yield db_1.default.query(updateInventoryQuery, [vaccineId]);
        const updatedInventory = result.rows[0];
        const dailyUsageQuery = `
      INSERT INTO DailyVaccineUsage (vaccine_id, date, usage_count)
      VALUES ($1, $2, 1)
      ON CONFLICT (vaccine_id, date)
      DO UPDATE SET usage_count = DailyVaccineUsage.usage_count + 1;
    `;
        yield db_1.default.query(dailyUsageQuery, [vaccineId, currentDate]);
        return updatedInventory;
    }
    catch (error) {
        console.error(error);
        return { error: "Failed to deduct vaccine inventory." };
    }
});
exports.deductVaccineInventoryController = deductVaccineInventoryController;
