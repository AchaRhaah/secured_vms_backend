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
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const logoutRoutes_1 = __importDefault(require("./routes/auth/logoutRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//registration Routes
app.use("/registration", registrationRoutes_1.default);
app.use("/children", childrenRoutes_1.default);
app.use("/incident", incidentRoutes_1.default);
app.use("/inventory", inventoryRoutes_1.default);
app.use("/child-records", childRecordRoutes_1.default);
app.use("/auth", loginRoutes_1.default);
app.use("/auth", logoutRoutes_1.default);
app.listen(process.env.PORT, () => {
    console.log(`running of port ${process.env.PORT}`);
});
