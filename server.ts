import express, { Express, Request, Response } from "express";
import registrationRoute from "./routes/auth/registrationRoutes";
import childrenRoutes from "./routes/childRoutes/childrenRoutes";
import incidentRoutes from "./routes/incident/incidentRoutes";
import inventoryRoutes from "./routes/inventory/inventoryRoutes";
import loginRoutes from "./routes/auth/loginRoutes";
import childRecordRoutes from "./routes/childRecordRoutes/childRecordRoutes";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import logoutRoutes from "./routes/auth/logoutRoutes";
import {
  authMiddleware,
  requireRole,
  verifyToken,
} from "./middleware/auth/auth";
import { checkTokenBlacklist } from "./middleware/auth/checkTokenBlackList";
dotenv.config();

const app: Express = express();
// middleware

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//registration Routes

app.use("/registration", verifyToken, checkTokenBlacklist, registrationRoute);
app.use(
  "/children",
  verifyToken,
  checkTokenBlacklist,
  requireRole(["VaccinationStaff", "departmentManager"]),
  childrenRoutes
);
app.use("/incident", incidentRoutes);
app.use("/inventory", inventoryRoutes);
app.use("/child-records", authMiddleware, childRecordRoutes);
app.use("/auth", loginRoutes);
app.use("/auth", logoutRoutes);


app.listen(process.env.PORT, () => {
  console.log(`running of port ${process.env.PORT}`);
});
