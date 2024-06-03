import express, { Express, Request, Response } from "express";
import registrationRoute from "./routes/registration/registrationRoutes";
import childrenRoutes from "./routes/childRoutes/childrenRoutes";
import bodyParser from "body-parser";
import cors from "cors";
import db from "./db";
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

app.listen(process.env.PORT, () => {
  console.log(`running of port ${process.env.PORT}`);
});
