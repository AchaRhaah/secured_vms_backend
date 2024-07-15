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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../../db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || "oifsod9askj934893";
const createVaccinationStaffController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield db_1.default.connect();
    try {
        const { name, user_type, hire_date, phone_number, password, gender, address, } = req.body;
        const staffExistQuery = `
      SELECT * FROM Users WHERE name = $1 AND user_type = $2
    `;
        const staffExistValues = [name, user_type];
        const staffExistResult = yield client.query(staffExistQuery, staffExistValues);
        if (staffExistResult.rows.length > 0) {
            return res
                .status(409)
                .json({ error: "Vaccination staff already exists" });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const username = `${name.replace(/\s+/g, "").toLowerCase()}`;
        yield client.query("BEGIN"); // Begin transaction
        const newUserQuery = `
      INSERT INTO Users (name, gender, address, user_type, username)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
        const newUserValues = [name, gender, address, user_type, username];
        const newUserResult = yield client.query(newUserQuery, newUserValues);
        const newUserId = newUserResult.rows[0].id;
        const updatedUsername = `${username}${newUserId}`;
        const updateUserQuery = `
      UPDATE Users SET username = $1 WHERE id = $2
    `;
        yield client.query(updateUserQuery, [updatedUsername, newUserId]);
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
        yield client.query("COMMIT"); // Commit transaction
        const token = jsonwebtoken_1.default.sign({ userId: newUserId, name, role: user_type }, JWT_SECRET, { expiresIn: "9h" });
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000,
        });
        res.status(201).json({
            success: true,
            data: Object.assign(Object.assign({}, rows[0]), { username: updatedUsername }),
            message: "Creation successful",
        });
    }
    catch (error) {
        yield client.query("ROLLBACK"); // Rollback transaction in case of error
        console.error("Error creating vaccination staff:", error);
        res.status(500).json({
            success: false,
            error: "An error occurred while creating vaccination staff",
        });
    }
    finally {
        client.release();
    }
});
exports.default = createVaccinationStaffController;
