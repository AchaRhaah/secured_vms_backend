import express, { Express, Request, Response } from "express";
import registrationRoute from "./routes/registration/registrationRoutes";
import childrenRoutes from "./routes/childRoutes/childrenRoutes";
import incidentRoutes from "./routes/incident/incidentRoutes";
import inventoryRoutes from "./routes/inventory/inventoryRoutes";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app: Express = express();
// middleware

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//registration Routes

app.use("/registration", registrationRoute);
app.use("/children", childrenRoutes);
app.use("/", incidentRoutes);
app.use("/inventory", inventoryRoutes);

app.listen(process.env.PORT, () => {
  console.log(`running of port ${process.env.PORT}`);
});
