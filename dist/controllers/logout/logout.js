"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forceExpireTokenController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "oidsj-340349jkldfg";
const forceExpireTokenController = (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Authorization header is missing." });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        // Generate a new token with a very short expiration time (e.g., 1 millisecond)
        const newToken = jsonwebtoken_1.default.sign({ userId: decoded.userId, role: decoded.role, name: decoded.name }, JWT_SECRET, { expiresIn: "1ms" } // Token expires almost immediately
        );
        res.cookie("token", newToken, {
            httpOnly: true,
            // secure: "production",
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "strict",
        });
        res.json({ message: "logout successful" });
    }
    catch (error) {
        console.error("Token verification error:", error);
        res.status(401).json({ error: "Invalid token." });
    }
};
exports.forceExpireTokenController = forceExpireTokenController;
