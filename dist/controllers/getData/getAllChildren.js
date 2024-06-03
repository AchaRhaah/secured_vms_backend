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
exports.getAllChildrenController = void 0;
const db_1 = __importDefault(require("../../db"));
// Function to calculate age in months
const calculateAgeInMonths = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let ageMonths = (today.getFullYear() - birthDate.getFullYear()) * 12;
    ageMonths += today.getMonth() - birthDate.getMonth();
    return ageMonths;
};
const getAllChildrenController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const queryText = `
      SELECT 
        c.id AS child_id, 
        c.name AS child_name, 
        c.mother_name, 
        c.mother_phone_number, 
        c.date_of_birth, 
        c.place_of_birth, 
        c.weight_at_birth, 
        c.birth_declaration_date, 
        c.gender AS child_gender,
        g.id AS guardian_id, 
        g.gender AS guardian_gender, 
        g.name AS guardian_name, 
        g.phone_number AS guardian_phone_number, 
        g.address AS guardian_address
      FROM Children c
      LEFT JOIN Guardians g ON c.guardian_id = g.id;
    `;
        const { rows } = yield client.query(queryText);
        res.status(200).json(rows);
    }
    catch (error) {
        console.error("Error fetching children:", error);
        res.status(500).json({
            success: false,
            error: "An error occurred while fetching children",
        });
    }
    finally {
        client.release();
    }
});
exports.getAllChildrenController = getAllChildrenController;
