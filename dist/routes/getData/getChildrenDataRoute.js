"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const getAllChildren_1 = require("../../controllers/getData/getAllChildren");
const getVaccinationRecord_1 = require("../../controllers/getData/getVaccinationRecord");
const router = (0, express_1.Router)();
router.get("/all", getAllChildren_1.getAllChildrenController);
router.get("/:childId/vaccinationRecords", getVaccinationRecord_1.getVaccinationReccordController);
exports.default = router;
