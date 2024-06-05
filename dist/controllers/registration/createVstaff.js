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
const db_1 = __importDefault(require("../../db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
// Controller function to create a new vaccination staff member
const JWT_SECRET = process.env.JWT_SECRET || "oifsod9askj934893";
const createVaccinationStaffController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        // Extract necessary data from the request body
        const { name, user_type, hire_date, phone_number, password, gender, address, } = req.body;
        // Check if the vaccination staff already exists
        const staffExistQuery = `
      SELECT * FROM Users WHERE name = $1 AND user_type = 'VaccinationStaff'
    `;
        const staffExistValues = [name];
        const staffExistResult = yield client.query(staffExistQuery, staffExistValues);
        if (staffExistResult.rows.length > 0) {
            return res
                .status(409)
                .json({ error: "Vaccination staff already exists" });
        }
        // hash passwords
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Insert new user data into the Users table
        const newUserQuery = `
      INSERT INTO Users (name, gender, address, user_type)
      VALUES ($1, $2, $3, 'VaccinationStaff')
      RETURNING id
    `;
        const newUserValues = [name, gender, address]; // Assuming gender and address are nullable
        const newUserResult = yield client.query(newUserQuery, newUserValues);
        const newUserId = newUserResult.rows[0].id;
        // Insert new vaccination staff data into the VaccinationStaff table
        const staffQuery = `
      INSERT INTO VaccinationStaff (user_id, position, hire_date, phone_number, password)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
        const staffValues = [
            newUserId,
            user_type,
            hire_date,
            phone_number,
            hashedPassword,
        ];
        const { rows } = yield client.query(staffQuery, staffValues);
        // VaccinationStaff;
        const token = jsonwebtoken_1.default.sign({ id: newUserId, name, userType: "VaccinationStaff" }, JWT_SECRET, { expiresIn: "1h" });
        // Send success response with created vaccination staff member data
        res.status(201).json({ success: true, data: rows[0], token });
    }
    catch (error) {
        // Send error response if an error occurs
        console.error("Error creating vaccination staff:", error);
        res.status(500).json({
            success: false,
            error: "An error occurred while creating vaccination staff",
        });
    }
    finally {
        // Release the client back to the pool
        client.release();
    }
});
exports.default = createVaccinationStaffController;
