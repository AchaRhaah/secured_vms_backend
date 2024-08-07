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
exports.loginController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../../db"));
const secretKey = process.env.JWT_SECRET || "LAJDLD9348jkdf924+"; // Use an environment variable for the secret key
const loginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { username, password, user_type } = req.body;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    try {
        let userQuery;
        let userResult;
        if (user_type === "Guardian") {
            console.log("here 1");
            // Fetch Guardian data from the database
            userQuery = `
        SELECT Users.id, Users.username, Users.name, Users.user_type, Guardians.password, Guardians.id
        FROM Users
        INNER JOIN Guardians ON Users.id = Guardians.user_id
        WHERE Users.username = $1 AND Users.user_type = 'Guardian'
      `;
            userResult = yield db_1.default.query(userQuery, [username]);
            console.log("here 2");
        }
        else if (user_type === "VaccinationStaff" ||
            user_type === "departmentManager") {
            // Fetch Vaccination Staff data from the database
            userQuery = `
        SELECT Users.id, Users.username, Users.name,Users.user_type, VaccinationStaff.password
        FROM Users
        INNER JOIN VaccinationStaff ON Users.id = VaccinationStaff.user_id
        WHERE Users.username = $1 AND Users.user_type = $2
      `;
            userResult = yield db_1.default.query(userQuery, [username, user_type]);
        }
        else {
            return res.status(400).json({ error: "Invalid user type" });
        }
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: "Wrong username or password" });
        }
        const user = userResult.rows[0];
        // Compare the password with the stored hashed password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Wrong username or password" });
        }
        // If a token exists in the request headers and the payload matches the fetched user data, return the same token
        if (token) {
            try {
                const decodedToken = jsonwebtoken_1.default.verify(token, secretKey);
                if (decodedToken &&
                    decodedToken.name === user.username &&
                    decodedToken.userId === user.id &&
                    decodedToken.role === user.user_type) {
                    return res.json({ token });
                }
            }
            catch (error) {
                console.error("Token verification failed:", error);
                // Fall through to generate a new token
            }
        }
        // Generate a new JWT with the user's role
        const newToken = jsonwebtoken_1.default.sign({ userId: user.id, role: user.user_type, name: user.username }, secretKey, { expiresIn: "24h" });
        res.cookie("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use secure flag for HTTPS
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "strict",
        });
        res.json({
            message: "Login successful",
            role: user.user_type,
            name: user.name,
            userId: user.id,
            token: newToken,
        });
    }
    catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.loginController = loginController;
