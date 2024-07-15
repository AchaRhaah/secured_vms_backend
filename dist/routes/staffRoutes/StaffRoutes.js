"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GetAllStaff_1 = require("../../controllers/getAllStaff/GetAllStaff");
const router = (0, express_1.Router)();
router.get("/get-all-staff", GetAllStaff_1.getAllStaff);
exports.default = express_1.Router;
