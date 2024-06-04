"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sideEffect_1 = require("../../controllers/incidents/sideEffect");
const express_1 = require("express");
const router = (0, express_1.Router)();
router.post("/report-side-effect", sideEffect_1.reportVaccineIncident);
exports.default = router;
