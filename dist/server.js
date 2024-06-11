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
const childRecordRoutes_1 = __importDefault(require("./routes/childRecordRoutes/childRecordRoutes"));
const reportRoutes_1 = __importDefault(require("./routes/report/reportRoutes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const logoutRoutes_1 = __importDefault(require("./routes/auth/logoutRoutes"));
const auth_1 = require("./middleware/auth/auth");
const checkTokenBlackList_1 = require("./middleware/auth/checkTokenBlackList");
dotenv_1.default.config();
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//registration Routes
app.use("/registration", auth_1.verifyToken, checkTokenBlackList_1.checkTokenBlacklist, registrationRoutes_1.default);
app.use("/children", auth_1.verifyToken, checkTokenBlackList_1.checkTokenBlacklist, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), childrenRoutes_1.default);
app.use("/incident", incidentRoutes_1.default);
app.use("/inventory", inventoryRoutes_1.default);
app.use("/child-records", auth_1.authMiddleware, childRecordRoutes_1.default);
app.use("/auth", loginRoutes_1.default);
app.use("/auth", logoutRoutes_1.default);
app.use("/report", reportRoutes_1.default);
app.listen(process.env.PORT, () => {
    console.log(`running of port ${process.env.PORT}`);
});
