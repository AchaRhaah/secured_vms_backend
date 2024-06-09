"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const incident_1 = require("../../controllers/incidents/incident");
const express_1 = require("express");
const auth_1 = require("../../middleware/auth/auth");
const checkTokenBlackList_1 = require("../../controllers/logout/checkTokenBlackList");
const router = (0, express_1.Router)();
router.post("/report-incident", auth_1.verifyToken, checkTokenBlackList_1.checkTokenBlacklist, (0, auth_1.requireRole)(["VaccinationStaff", "departmentManager"]), incident_1.reportVaccineIncident);
exports.default = router;
