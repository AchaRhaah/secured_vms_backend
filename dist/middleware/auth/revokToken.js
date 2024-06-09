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
exports.revokeTokenController = void 0;
const db_1 = __importDefault(require("../../db")); // Update with your database import
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";
const revokeTokenController = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization header is missing." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Check if the token is already in the blacklist
        const checkQuery = `SELECT token FROM TokenBlacklist WHERE token = $1`;
        const checkResult = yield db_1.default.query(checkQuery, [token]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: "Token is already blacklisted." });
        }
        // Add token to blacklist with its expiration time
        const expiryDate = new Date(decoded.exp * 1000); // Convert exp from seconds to milliseconds
        const insertQuery = `INSERT INTO TokenBlacklist (token, expiry) VALUES ($1, $2)`;
        yield db_1.default.query(insertQuery, [token, expiryDate]);
        return res.json({ message: "Token has been revoked." });
    }
    catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ error: "Invalid token." });
    }
});
exports.revokeTokenController = revokeTokenController;
