"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const incident_1 = require("../../controllers/incidents/incident");
const express_1 = require("express");
const auth_1 = require("../../middleware/auth/auth");
const router = (0, express_1.Router)();
router.post("/report-incident", auth_1.verifyToken, (0, auth_1.requireRole)("VaccinationStaff"), incident_1.reportVaccineIncident);
exports.default = router;
