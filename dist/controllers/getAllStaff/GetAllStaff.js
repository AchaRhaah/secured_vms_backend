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
exports.getAllStaff = void 0;
const db_1 = __importDefault(require("../../db"));
const getAllStaff = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query(`
      SELECT vs.id, u.name, vs.position as role, u.address, vs.phone_number as phone, u.gender
      FROM VaccinationStaff vs
      JOIN Users u ON vs.user_id = u.id
    `);
        const staffData = result.rows.map((row) => ({
            id: row.id,
            name: row.name,
            role: row.role,
            department: "Vaccination Department", // Assuming a default department
            phone: row.phone,
            address: row.address,
            gender: row.gender,
        }));
        res.status(200).json(staffData);
    }
    catch (error) {
        console.error("Error fetching vaccination staff:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
exports.getAllStaff = getAllStaff;
