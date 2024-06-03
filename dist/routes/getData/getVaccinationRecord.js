"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getVaccinationRecord_1 = require("../../controllers/getData/getVaccinationRecord");
const router = (0, express_1.Router)();
router.get("/:childId/vaccinationRecords", getVaccinationRecord_1.getVaccinationReccordController);
exports.default = router;
