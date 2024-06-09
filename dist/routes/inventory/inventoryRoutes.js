"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const restock_1 = require("../../controllers/inventory/restock");
const checkTokenBlackList_1 = require("../../controllers/logout/checkTokenBlackList");
const auth_1 = require("../../middleware/auth/auth");
const router = (0, express_1.Router)();
router.post("/restock", auth_1.verifyToken, checkTokenBlackList_1.checkTokenBlacklist, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), restock_1.restockVaccineController);
exports.default = router;
