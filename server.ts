import express, { Express } from "express";
// import nodemailer from "nodemailer";
// import google from "google-auth-library";
import registrationRoute from "./routes/auth/registrationRoutes";
import childrenRoutes from "./routes/childRoutes/childrenRoutes";
import incidentRoutes from "./routes/incident/incidentRoutes";
import inventoryRoutes from "./routes/inventory/inventoryRoutes";
import loginRoutes from "./routes/auth/loginRoutes";
import staffRoutes from "./routes/staffRoutes/StaffRoutes";
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
app.use("/api/child-records", childRecordRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/auth", logoutRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/staff", staffRoutes);

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URI
// );

// oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     type: "OAuth2",
//     user: process.env.EMAIL,
//     clientId: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     refreshToken: process.env.REFRESH_TOKEN,
//   },
// });

// app.post("/send-email", async (req, res) => {
//   const { to, subject, text, html } = req.body;

//   try {
//     const accessToken = await oAuth2Client.getAccessToken();

//     const mailOptions = {
//       from: `Atem Beatrice <${process.env.EMAIL}>`,
//       to,
//       subject,
//       text,
//       html,
//       auth: {
//         type: "OAuth2",
//         user: process.env.EMAIL,
//         clientId: process.env.CLIENT_ID,
//         clientSecret: process.env.CLIENT_SECRET,
//         refreshToken: process.env.REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//       if (error) {
//         console.error(error);
//         res.status(500).send("Error sending email");
//       } else {
//         console.log("Email sent: " + info.response);
//         res.send("Email sent successfully");
//       }
//     });
//   } catch (error) {
//     console.error("Error generating access token", error);
//     res.status(500).send("Error generating access token");
//   }
// });

app.listen(process.env.PORT, () => {
  console.log(`running on port ${process.env.PORT}`);
});
