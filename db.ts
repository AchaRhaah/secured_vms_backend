import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();
const db = new Pool({
  user: process.env.USER,
  password: process.env.DATABASE_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "vaccinationmanagementsystem",
});

export default db;
