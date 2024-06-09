"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restock_1 = require("../../controllers/inventory/restock");
const auth_1 = require("../../middleware/auth/auth");
const router = (0, express_1.Router)();
router.post("/restock", auth_1.verifyToken, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), restock_1.restockVaccineController);
exports.default = router;
