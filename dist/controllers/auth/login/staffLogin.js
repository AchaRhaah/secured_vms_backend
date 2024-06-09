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
exports.loginVaccinationStaffController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../../db"));
const secretKey = process.env.JWT_SECRET || "LAJDLD9348jkdf924+"; // Use an environment variable for the secret key
const loginVaccinationStaffController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password, user_type } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        // Fetch staff data from the database
        const staffQuery = `
      SELECT Users.id, Users.name, Users.user_type, VaccinationStaff.password
      FROM Users
      INNER JOIN VaccinationStaff ON Users.id = VaccinationStaff.user_id
      WHERE Users.name = $1 AND Users.user_type = $2
    `;
        const staffResult = yield db_1.default.query(staffQuery, [username, user_type]);
        console.log();
        if (staffResult.rows.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const staff = staffResult.rows[0];
        // Compare the password with the stored hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, staff.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // If a token exists in the request headers and the payload matches the fetched user data, return the same token
        if (token) {
            const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
            if (decodedToken &&
                decodedToken.name === staff.name &&
                decodedToken.userId === staff.id &&
                decodedToken.role === staff.user_type) {
                return res.json({ token });
            }
        }
        // Generate a new JWT with the staff's role
        const newToken = jsonwebtoken_1.default.sign({ userId: staff.id, role: staff.user_type, name: staff.name }, secretKey, { expiresIn: "24h" });
        res.json({ token: newToken });
    }
    catch (error) {
        console.error("Error logging in***************:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.loginVaccinationStaffController = loginVaccinationStaffController;
