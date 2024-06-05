"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const incident_1 = require("../../controllers/incidents/incident");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/report-incident", incident_1.reportVaccineIncident);
exports.default = router;
