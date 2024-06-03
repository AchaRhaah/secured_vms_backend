"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const registrationRoutes_1 = __importDefault(require("./routes/registration/registrationRoutes"));
const childrenRoutes_1 = __importDefault(require("./routes/childRoutes/childrenRoutes"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// middleware
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//registration Routes
app.use("/registration", registrationRoutes_1.default);
app.use("/children", childrenRoutes_1.default);
app.listen(process.env.PORT, () => {
    console.log(`running of port ${process.env.PORT}`);
});