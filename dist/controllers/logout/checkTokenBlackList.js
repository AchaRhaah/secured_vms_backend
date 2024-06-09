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
exports.checkTokenBlacklist = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../../db")); // Update with your database import
const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";
const checkTokenBlacklist = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Authorization header is missing." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Check if token is in blacklist
        const query = `SELECT * FROM TokenBlacklist WHERE token = $1 AND expiry > NOW()`;
        const result = yield db_1.default.query(query, [token]);
        if (result.rows.length > 0) {
            return res.status(401).json({ error: "this token is blackisted." });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ error: "Invalid token." });
    }
});
exports.checkTokenBlacklist = checkTokenBlacklist;
