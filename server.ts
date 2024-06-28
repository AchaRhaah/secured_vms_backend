import express, { Express } from "express";
import registrationRoute from "./routes/auth/registrationRoutes";
import childrenRoutes from "./routes/childRoutes/childrenRoutes";
import incidentRoutes from "./routes/incident/incidentRoutes";
import inventoryRoutes from "./routes/inventory/inventoryRoutes";
import loginRoutes from "./routes/auth/loginRoutes";

import childRecordRoutes from "./routes/childRecordRoutes/childRecordRoutes";
import reportRoutes from "./routes/report/reportRoutes";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import logoutRoutes from "./routes/auth/logoutRoutes";
import cookieParser from "cookie-parser";
import {
  authMiddleware,
  requireRole,
  verifyToken,
} from "./middleware/auth/auth";
import { checkTokenBlacklist } from "./middleware/auth/checkTokenBlackList";
dotenv.config();

const app: Express = express();

// Configure CORS
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser()); // Add cookie parser middleware

app.use(bodyParser.urlencoded({ extended: true }));

// Registration Routes
app.use(
  "/api/registration",
  verifyToken,
  checkTokenBlacklist,
  registrationRoute
);
app.use(
  "/api/children",
  verifyToken,
  checkTokenBlacklist,
  requireRole(["VaccinationStaff", "departmentManager"]),
  childrenRoutes
);
app.use("/api/incident", incidentRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/child-records", authMiddleware, childRecordRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/auth", logoutRoutes);
app.use("/api/report", reportRoutes);

app.listen(process.env.PORT, () => {
  console.log(`running on port ${process.env.PORT}`);
});
