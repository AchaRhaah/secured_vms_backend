"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registrationRoutes_1 = __importDefault(require("./routes/auth/registrationRoutes"));
const childrenRoutes_1 = __importDefault(require("./routes/childRoutes/childrenRoutes"));
const incidentRoutes_1 = __importDefault(require("./routes/incident/incidentRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventory/inventoryRoutes"));
const loginRoutes_1 = __importDefault(require("./routes/auth/loginRoutes"));
const StaffRoutes_1 = __importDefault(require("./routes/staffRoutes/StaffRoutes"));
const childRecordRoutes_1 = __importDefault(require("./routes/childRecordRoutes/childRecordRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/report/reportRoutes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const logoutRoutes_1 = __importDefault(require("./routes/auth/logoutRoutes"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = require("./middleware/auth/auth");
const checkTokenBlackList_1 = require("./middleware/auth/checkTokenBlackList");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Configure CORS
const corsOptions = {
    origin: "http://localhost:5173",
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)()); // Add cookie parser middleware
app.use(body_parser_1.default.urlencoded({ extended: true }));
// Registration Routes
app.use("/api/registration", auth_1.verifyToken, checkTokenBlackList_1.checkTokenBlacklist, registrationRoutes_1.default);
app.use("/api/children", auth_1.verifyToken, checkTokenBlackList_1.checkTokenBlacklist, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), childrenRoutes_1.default);
app.use("/api/incident", incidentRoutes_1.default);
app.use("/api/inventory", inventoryRoutes_1.default);
app.use("/api/child-records", childRecordRoutes_1.default);
app.use("/api/auth", loginRoutes_1.default);
app.use("/api/auth", logoutRoutes_1.default);
app.use("/api/report", reportRoutes_1.default);
app.use("/api/staff", StaffRoutes_1.default);
app.listen(process.env.PORT, () => {
    console.log(`running on port ${process.env.PORT}`);
});
