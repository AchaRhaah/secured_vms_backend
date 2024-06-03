"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db = new pg_1.Pool({
    user: process.env.USER,
    password: process.env.DATABASE_PASSWORD,
    host: "localhost",
    port: 5432,
    database: "vaccinationmanagementsystem",
});
exports.default = db;
